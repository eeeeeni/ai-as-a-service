'use strict'

const request = require('request')  // 웹 요청을 보내는 모듈 (웹사이트 HTML 가져오기)
const urlParser = require('url')  // URL을 다루는 모듈 (URL 분석)
const URLSearchParams = require('url').URLSearchParams  // URL의 파라미터를 다룰 수 있음
const shortid = require('shortid')  // 짧은 랜덤 ID를 생성하는 모듈
const asnc = require('async')  // 비동기 처리를 쉽게 해주는 모듈
const AWS = require('aws-sdk')  // AWS SDK (S3, SQS 등 AWS 서비스와 연결)
const s3 = new AWS.S3()  // S3 객체 생성 (AWS S3를 사용하기 위해 필요)
const sqs = new AWS.SQS({region: process.env.REGION})  // SQS 객체 생성 (AWS SQS 사용)
const images = require('./images')()  // 이미지 처리 관련 코드 (images.js에서 가져옴)

//writeStatus 함수 (이미지 다운로드 상태를 S3에 저장)
function writeStatus (url, domain, results) {
  let parsed = urlParser.parse(url)  // URL을 분석
  parsed.hostname = domain  // 도메인을 설정
  parsed.host = domain

  const statFile = {
    url: urlParser.format(parsed),  // 변경된 URL 저장
    stat: 'downloaded',  // 현재 상태를 '다운로드됨'으로 설정
    downloadResults: results  // 다운로드된 이미지 정보 저장
  }

  return new Promise((resolve) => {
    s3.putObject({
      Bucket: process.env.BUCKET,  // 환경변수에서 S3 버킷 이름 가져옴
      Key: domain + '/status.json',  // S3에 저장될 파일 이름 (status.json)
      Body: Buffer.from(JSON.stringify(statFile, null, 2), 'utf8')  // JSON 형식으로 변환
    }, (err, data) => {
      resolve({stat: err || 'ok'})  // 성공하면 'ok', 실패하면 오류 반환
    })
  })
}

//createUniqueDomain 함수 (사이트 URL을 분석해 고유 도메인 생성)
function createUniqueDomain (url) {
  const parsed = urlParser.parse(url)  // URL 분석
  const sp = new URLSearchParams(parsed.search)  // URL의 파라미터 가져오기
  let domain

  if (sp.get('q')) {  // URL에 "q"라는 파라미터가 있으면
    domain = sp.get('q') + '.' + parsed.hostname  // 도메인명을 "q 값 + 원래 도메인"으로 설정
  } else {
    domain = shortid.generate() + '.' + parsed.hostname  // 랜덤 ID + 도메인
  }
  domain = domain.replace(/ /g, '')  // 공백 제거
  return domain.toLowerCase()  // 소문자로 변환하여 반환
}

//crawl 함수 (웹사이트에서 이미지 크롤링)
function crawl (domain, url, context) {
  console.log('crawling: ' + url)  // 현재 크롤링 중인 URL 출력
  return new Promise(resolve => {
    request(url, (err, response, body) => {  // 웹페이지 요청 (HTML 가져오기)
      if (err || response.statusCode !== 200) { 
        return resolve({statusCode: 500, body: err})  // 오류 발생 시 처리
      }
      images.parseImageUrls(body, url).then(urls => {  // 이미지 URL 리스트 추출
        images.fetchImages(urls, domain).then(results => {  // 이미지 다운로드 실행
          writeStatus(url, domain, results).then(result => {  // 다운로드 상태 저장
            resolve({statusCode: 200, body: JSON.stringify(result)})  // 성공 응답
          })
        })
      })
    })
  })
}

//queueAnalysis 함수 (이미지 분석 요청을 SQS에 넣음)
function queueAnalysis (domain, url, context) {
  let accountId = process.env.ACCOUNTID
  if (!accountId) {
    accountId = context.invokedFunctionArn.split(':')[4]  // AWS Lambda 실행 계정 ID 가져오기
  }
  let queueUrl = `https://sqs.${process.env.REGION}.amazonaws.com/${accountId}/${process.env.ANALYSIS_QUEUE}`

  let params = {
    MessageBody: JSON.stringify({action: 'analyze', msg: {domain: domain}}),
    QueueUrl: queueUrl
  }

  return new Promise(resolve => {
    sqs.sendMessage(params, (err, data) => {
      if (err) { console.log('QUEUE ERROR: ' + err); return resolve({statusCode: 500, body: err}) }
      console.log('queued analysis: ' + queueUrl)
      resolve({statusCode: 200, body: {queue: queueUrl, msgId: data.MessageId}})
    })
  })
}

//crawlImages 함수 (메인 Lambda 핸들러)
module.exports.crawlImages = function (event, context, cb) {
  asnc.eachSeries(event.Records, (record, asnCb) => {
    let { body } = record

    try {
      body = JSON.parse(body)
    } catch (exp) {
      return asnCb('message parse error: ' + record)
    }

    if (body.action === 'download' && body.msg && body.msg.url) {
      const udomain = createUniqueDomain(body.msg.url)
      crawl(udomain, body.msg.url, context).then(result => {
        queueAnalysis(udomain, body.msg.url, context).then(result => {
          asnCb(null, result)
        })
      })
    } else {
      asnCb('malformed message')
    }
  }, (err) => {
    if (err) { console.log(err) }
    cb()
  })
}


// 할일 목록의 데이터 처리
// api와 통신하여 제이슨 데이터를 가져오고 조작
// 사용자 요청을 전달하고, 백앤드에서 응답을 받아 화면에 표시하는 역할
// 1.	사용자의 요청을 API 서버로 전달
// •	사용자가 할 일을 추가하면 (create()) → API 서버에 POST 요청을 보냄
// •	사용자가 할 일을 수정하면 (update()) → API 서버에 PUT 요청을 보냄
// •	사용자가 할 일을 삭제하면 (del()) → API 서버에 DELETE 요청을 보냄
// 2.	백엔드에서 응답을 받아 화면을 업데이트
// •	백엔드에서 새로운 할 일 목록을 보내면 (list()) → 화면을 새로 그림
// •	요청이 성공하면 (stat: 'ok') → UI 업데이트
// •	오류가 발생하면 (renderError()) → 에러 메시지 표시

'use strict'

import $ from 'jquery'
import {view} from './todo-view'


const todo = {activate}
export {todo}

const API_ROOT = `https://chapter4api.${process.env.CHAPTER4_DOMAIN}/todo/`


function gather () {
  return {
    id: $('#todo-id').val(),
    dueDate: $('#todo-duedate').val(),
    action: $('#todo-action').val(),
    stat: $('#todo-stat').is(':checked') ? 'done' : 'open',
    note: $('#todo-note').val()
  }
}

// api 요청을 보내고 데이터를 관리하는 기능
function create (cb) {
  $.ajax(API_ROOT, {
    data: JSON.stringify(gather()), //사용자가 입력한 데이터를 제이슨으로 변환
    contentType: 'application/json',
    type: 'POST',
    success: function (body) {
      if (body.stat === 'ok') {
        list(cb) // 성공하면 리스트를 호출하여 할 일 목록 새로고침
      } else {
        $('#error').html(body.err)
        cb && cb()
      }
    }
  })
}


function update (cb) {
  $.ajax(API_ROOT + $('#todo-id').val(), {
    data: JSON.stringify(gather()),
    contentType: 'application/json',
    type: 'PUT',
    success: function (body) {
      if (body.stat === 'ok') {
        list(cb)
      } else {
        $('#error').html(body.err)
        cb && cb()
      }
    }
  })
}


function del (id) {
  $.ajax(API_ROOT + id, {
    type: 'DELETE',
    success: function (body) {
      if (body.stat === 'ok') {
        list()
      } else {
        $('#error').html(body.err)
      }
    }
  })
}

// 할일 목록 불러오기
function list (cb) {
  $.get(API_ROOT, function (body) {
    if (body.stat === 'ok') {
      view.renderList(body) // 데이터를 뷰에 전달하여 화면 업데이트
    } else {
      view.renderError(body) // 에러 발생시 메세지 출력
    }
    cb && cb()
  })
}

// 버튼 이벤트 바인딩
function bindList () {
  $('.todo-item-edit').unbind('click')
  $('.todo-item-edit').on('click', (e) => {
    view.renderEditArea(e.currentTarget.id) // 수정 버튼 클릭시 수정 화면으로 전환
  })
  $('.todo-item-delete').unbind('click')
  $('.todo-item-delete').on('click', (e) => {
    del(e.currentTarget.id) // 삭제 버튼 클릭시 삭제
  })
}


function bindEdit () {
  $('#input-todo').unbind('click')
  $('#input-todo').on('click', e => {
    e.preventDefault()
    view.renderEditArea()
  })
  $('#todo-save').unbind('click')
  $('#todo-save').on('click', e => {
    e.preventDefault()
    if ($('#todo-id').val().length > 0) {
      update(() => {
        view.renderAddButton()
      })
    } else {
      create(() => {
        view.renderAddButton()
      })
    }
  })
  $('#todo-cancel').unbind('click')
  $('#todo-cancel').on('click', e => {
    e.preventDefault()
    view.renderAddButton()
  })
}


function activate () {
  list(() => {
    bindList()
    bindEdit()
  })
  $('#content').bind('DOMSubtreeModified', () => {
    bindList()
    bindEdit()
  })
}


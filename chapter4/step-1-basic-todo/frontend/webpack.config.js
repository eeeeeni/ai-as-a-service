const Dotenv = require('dotenv-webpack')
const path = require('path')
const webpack = require('webpack')

module.exports = {
  entry: {
    main: './src/index.js'
  },
  devtool: 'eval-source-map',
  devServer: {
    contentBase: './dist',
    port: 9080
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: 'dist/'
  },
  mode: 'development',
  module: {
    rules: [{
      test: /\.css$/,
      use: ['style-loader', 'css-loader']
    },
    {
      test: /\.(jpe?g|png|gif)$/i,
      loader: 'file-loader',
      options: {
        name: '[name].[ext]',
        outputPath: 'assets/images/'
      }
    }]
  },
  plugins: [
    new Dotenv({
      path: path.resolve(__dirname, '..', '.env'),
      systemvars: true,
      silent: false
    }),
    new webpack.DefinePlugin({  // ⬅ 추가: 환경변수를 프론트엔드 코드에서 사용할 수 있도록 설정
      'process.env.CHAPTER4_API_URL': JSON.stringify(process.env.CHAPTER4_API_URL)
})
]
}


const webpack = require('webpack')
const path = require('path')
const merge = require('webpack-merge')
const common = require('./common.config.js')

module.exports = merge(common, {
  devtool: 'eval',
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development')
    })
  ],
  devServer: {
    compress: true,
    port: 4000
  }
})

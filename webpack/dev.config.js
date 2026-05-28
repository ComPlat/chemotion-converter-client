const webpack = require('webpack')
const path = require('path')
const { merge } = require('webpack-merge')
const common = require('./common.config.js')

module.exports = merge(common, {
  devtool: 'eval-source-map',
  output: {
    devtoolModuleFilenameTemplate: info =>
      `webpack:///${path.relative(process.cwd(), info.absoluteResourcePath).replace(/\\/g, '/')}`,
    devtoolFallbackModuleFilenameTemplate: 'webpack:///[resource-path]?[hash]'
  },
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

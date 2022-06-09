const webpack = require('webpack')
const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  entry: {
    index: [
      './src/scss/style.scss',
      './src/js/index.js'
    ],
    'admin/index': [
      './src/scss/style.scss',
      './src/js/admin.js'
    ],
  },
  resolve: { extensions: ["*", ".js", ".jsx"] },
  output: {
    libraryTarget: 'this',
    library: '[name]',
    path: path.resolve('./public/'),
    publicPath: '/',
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules|bower_components)/,
        loader: "babel-loader",
        options: { presets: ["@babel/env"] }
      },
      {
        test: /\.s?css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader'
        ]
      },
      {
        test: /(fonts|files)\/.*\.(svg|woff2?|ttf|eot|otf)(\?.*)?$/,
        loader: 'file-loader',
        options: {
          name: 'fonts/[name].[ext]'
        }
      },
      {
        test: /\.svg$|\.png$/,
        loader: 'file-loader',
        options: {
          name: 'images/[name].[ext]'
        }
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css'
    }),
    new CopyWebpackPlugin([
      {
        from: '**/*',
        to: './/',
        context: './src/html/',
      },
      {
        from: '**/*',
        to: './/images/',
        context: '../src/images/',
      }
    ]),
    new webpack.EnvironmentPlugin({
      'CONVERTER_APP_URL': 'http://127.0.0.1:5000'
    })
  ]
}
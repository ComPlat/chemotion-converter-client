const webpack = require('webpack')
const path = require('path')

module.exports = {
  experiments: {
    outputModule: true,
  },
  entry: {
    bundle: './src/js/bundle.js',
  },
  resolve: { extensions: [".js", ".jsx"] },
  output: {
    libraryTarget: 'module',
    path: path.resolve('./dist/'),
    publicPath: '/',
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules|bower_components)/,
        loader: "babel-loader",
        options: { presets: ["@babel/env"] }
      },
    ]
  },
  externals: {
    react: 'react',
    'react-bootstrap': 'react-bootstrap',
    'ag-grid-community': 'ag-grid-community',
    'ag-grid-react': 'ag-grid-react',
  },
  plugins: [
    new webpack.EnvironmentPlugin({
      'CONVERTER_APP_URL': 'http://127.0.0.1:5000'
    })
  ]
}

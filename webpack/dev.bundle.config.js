const path = require("path");
const webpack = require('webpack');

module.exports = {
  devtool: 'eval-source-map',
  mode: "development",

  entry: "./src/js/bundle.js",

  output: {
    path: path.resolve(__dirname, '..', "dist"),
    filename: "bundle.js",

    library: {
      type: "umd",
    },

    globalObject: "typeof self !== 'undefined' ? self : this",
    clean: true,
  },

  externals: {
    react: { commonjs: 'react', commonjs2: 'react', amd: 'react', root: 'React' },
    'react-dom': { commonjs: 'react-dom', commonjs2: 'react-dom', amd: 'react-dom', root: 'ReactDOM' },
    'react-bootstrap': { commonjs: 'react-bootstrap', commonjs2: 'react-bootstrap', amd: 'react-bootstrap', root: 'ReactBootstrap' },
    'ag-grid-community': { commonjs: 'ag-grid-community', commonjs2: 'ag-grid-community', amd: 'ag-grid-community', root: 'agGrid' },
    'ag-grid-react': { commonjs: 'ag-grid-react', commonjs2: 'ag-grid-react', amd: 'ag-grid-react', root: 'AgGridReact' },
  },

  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
    ],
  },

  resolve: {
    extensions: [".js", ".jsx"],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development'),
      "process.env.CONVERTER_APP_URL": JSON.stringify(process.env.CONVERTER_APP_URL),
    })
  ],
};
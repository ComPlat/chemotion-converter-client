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

    globalObject: "this",
    clean: true,
  },

  externals: {
    react: "react",
    "react-dom": "react-dom",
    "react-bootstrap": "react-bootstrap",
    "ag-grid-community": "ag-grid-community",
    "ag-grid-react": "ag-grid-react",
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
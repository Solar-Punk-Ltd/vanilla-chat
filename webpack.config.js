const webpack = require('webpack')
const path = require('path');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')

module.exports = {
  entry: './src/app.ts',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    extensions: ['.ts', '.js'],
    fallback: {
      "crypto": require.resolve("crypto-browserify"),
      "stream": require.resolve("stream-browserify"),
      "fs": false,
      "path": require.resolve("path-browserify"),
      "util": require.resolve("util/"),
      "worker_threads": false,
      "tty": require.resolve("tty-browserify"),
      "process": require.resolve("process/browser"),
    }
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    compress: true,
    port: 9000,
  },
  plugins: [
    new NodePolyfillPlugin(),
    new webpack.ProvidePlugin({
      process: 'process/browser',
    })
  ],
  mode: 'development'
};

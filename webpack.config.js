const path = require('path');

module.exports = {
  mode: 'production',
  entry: './webview-src/index.tsx',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'webview.js',
    path: path.resolve(__dirname, 'out'),
  },
  devtool: 'source-map',
};

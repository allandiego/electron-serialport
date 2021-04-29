/* eslint-disable @typescript-eslint/no-var-requires */
const rules = require('./webpack.rules');
const plugins = require('./webpack.plugins');

rules.push({
  test: /\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
});

rules.push({
  test: /\.(ico|svg|icns)$/,
  loader: 'file-loader',
  options: {
    name: '[path][name].[ext]',
    publicPath: '..', // move up from 'main_window'
    context: 'src', // set relative working folder to src
  },
});

// rules.push({
//   test: /\.(jpg|png)$/,
//   loader: 'url-loader',
//   options: {
//     name: '[path][name].[ext]',
//     publicPath: '..', // move up from 'main_window'
//     context: 'src', // set relative working folder to src
//   },
// });

// rules.push({
//   test: /\.(jpg|png)$/,
//   use: [{ loader: 'url-loader' }, { loader: 'file-loader' }],
// });

// rules.push({
//   test: /\.svg$/,
//   use: [{ loader: 'svg-inline-loader' }],
// });

// rules.push({
//   test: /\.(?:png|jpg|svg)$/,
//   use: [{ loader: 'url-loader' }],
// });

module.exports = {
  module: {
    rules,
  },
  plugins,
  resolve: {
    extensions: [
      '.js',
      '.jsx',
      '.ts',
      '.tsx',
      '.css',
      '.svg',
      '.json',
      '.png',
      '.jpg',
    ],
  },
};

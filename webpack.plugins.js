/* eslint-disable @typescript-eslint/no-var-requires */
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
// const path = require('path');

module.exports = [
  new ForkTsCheckerWebpackPlugin(),
  // https://ankitbko.github.io/2019/08/electron-forge-with-react-and-typescript/
  //   new ForkTsCheckerWebpackPlugin({
  //     async: false
  //   })
  new CopyPlugin({
    patterns: [
      // {
      //   from: path.join(__dirname, 'assets'),
      //   to: 'assets/',
      // },
      {
        from: './node_modules/@serialport/bindings/build/Release/bindings.node',
        to: '../native_modules/build/Release/bindings.node',
      },
    ],
  }),
];

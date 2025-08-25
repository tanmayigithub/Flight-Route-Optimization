
// Auto-generated Webpack config from Route Optimizer
const path = require('path');

module.exports = {
  mode: 'production',
  entry: {
    'App': './Backend/src/App.js',
    'index': './Backend/src/index.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },
};

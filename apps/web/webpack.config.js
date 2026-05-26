const path = require('path')
const webpack = require('webpack')

module.exports = {
  mode: 'development',
  entry: './index.web.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  resolve: {
    extensions: ['.web.ts', '.web.tsx', '.ts', '.tsx', '.js', '.jsx'],
    alias: {
      'react-native$': 'react-native-web',
    },
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx|js|jsx)$/,
        use: 'babel-loader',
        exclude: /node_modules\/(?!(react-native|react-native-web|react-native-safe-area-context|@react-navigation)\/).*/,
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        type: 'asset/resource',
      },
    ],
  },
  devServer: {
    port: 3000,
    hot: true,
    historyApiFallback: true,
  },
}

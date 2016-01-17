var path = require('path');
var webpack = require('webpack');

module.exports = {
  devtool: 'eval',
  entry: [
    'webpack-dev-server/client?http://ansonkao.local:1234',
    'webpack/hot/only-dev-server',
    './src/index'
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/static/'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ],
  module: {
    loaders: [
      {
        test: /\.js$/,
        loaders: ['react-hot', 'babel'],
        include: path.join(__dirname, 'src')
      },
      {
        test: /\.scss$/,
        loaders: ['style', 'css', 'autoprefixer', 'sass?precision=10'], // Precision needed for Bootstrap button alignment
        include: path.join(__dirname, 'src')
      },
      {
        test: /\.(jpe?g|png|gif|svg|eot|ttf|woff|woff2|otf|ico)(\?v=\d+\.\d+\.\d+)?$/,
        loaders: ['file']
      },      
    ]
  }
};

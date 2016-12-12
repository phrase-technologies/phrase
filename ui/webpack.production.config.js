var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: [
    './src/index'
  ],
  output: {
    path: path.join(__dirname, 'temp-build'),
    filename: 'bundle.js',
    publicPath: '/'
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Phrase.fm',
      template: 'src/index.html',
      inject: false,
    }),
    new webpack.DefinePlugin({
      API_URL: process.env.API_URL,
      'process.env': { NODE_ENV: JSON.stringify(process.env.NODE_ENV) }
    })
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
        test: /\.(jpe?g|png|gif|svg|eot|ttf|woff|woff2|otf|ico)(\?(.)+)?$/,
        loaders: ['file']
      },
    ]
  },
    resolve: {
    root: path.resolve(__dirname),
     alias: {
       actions: 'src/actions',
       audio: 'src/audio',
       components: 'src/components',
       constants: 'src/constants',
       helpers: 'src/helpers',
       img: 'src/img',
       middleware: 'src/middleware',
       plugins: 'src/plugins',
       reducers: 'src/reducers',
       selectors: 'src/selectors',
     },
     extensions: ['', '.js', '.scss'],
  },
};

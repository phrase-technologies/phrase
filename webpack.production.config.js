var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: [
    './src/index'
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Phrase.fm'
    }),
    new webpack.DefinePlugin({
      API_URL: process.env.API_URL,
      'process.env': { NODE_ENV: JSON.stringify('production') }
      // 'process.env': { NODE_ENV: 'production' }
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
        test: /\.(jpe?g|png|gif|svg|eot|ttf|woff|woff2|otf|ico)(\?v=\d+\.\d+\.\d+)?$/,
        loaders: ['file']
      },
    ]
  },
    resolve: {
    root: path.resolve(__dirname),
     alias: {
       components: 'src/components',
       reducers: 'src/reducers',
       actions: 'src/actions',
       audio: 'src/audio',
       img: 'src/img',
       helpers: 'src/helpers',
       selectors: 'src/selectors',
       middleware: 'src/middleware',
     },
     extensions: ['', '.js', '.scss'],
  },
};

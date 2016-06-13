var path = require('path');
var webpack = require('webpack');
var serverConfig = require('./server.config');

module.exports = {
  devtool: 'eval',
  entry: [
    `webpack-dev-server/client?http://${serverConfig.HOST}:${serverConfig.PORT}`,
    'webpack/hot/only-dev-server',
    './src/index'
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/static/'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
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
  }
};

var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var webpackConfig = require('./webpack.config');
var serverConfig = require('./server.config');

new WebpackDevServer(webpack(webpackConfig), {
  publicPath: webpackConfig.output.publicPath,
  contentBase: 'src',
  noInfo: true, // Surpress excessively verbose logs
  hot: true,
  historyApiFallback: true
}).listen(serverConfig.PORT, serverConfig.HOST, function (err, result) {
  if (err) {
    console.log(err);
  }

  console.log('Listening at '+serverConfig.HOST+':'+serverConfig.PORT);
});

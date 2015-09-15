var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var config = require('./webpack.config');

new WebpackDevServer(webpack(config), {
  publicPath: config.output.publicPath,
  contentBase: 'src',
  noInfo: true, // Surpress excessively verbose logs
  hot: true,
  historyApiFallback: true
}).listen(1234, 'localhost', function (err, result) {
  if (err) {
    console.log(err);
  }

  console.log('Listening at localhost:1234');
});

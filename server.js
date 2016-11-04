var express = require('express');
var bodyParser = require('body-parser');

var authRoute = require('./app/routes/auth');
var admRoute = require('./app/routes/administration');
var networkRoute = require('./app/routes/network');
var devicesRoute = require('./app/routes/devices');

var publicRoot = __dirname + '/public/'; // eslint-disable-line no-path-concat
var port = process.env.PORT || 8080;

var serverConfig = express();

var errorHandler = function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars,max-len
  res.sendStatus(err.status || 500);
};

serverConfig.use(bodyParser.json());
serverConfig.use(bodyParser.urlencoded({ extended: true }));
serverConfig.use(express.static(publicRoot));
serverConfig.use(errorHandler);

/* serves main page */
serverConfig.get('/', function (req, res) {
  res.sendFile('signin.html', { root: publicRoot });
});

serverConfig.get('/main', function (req, res) {
  res.sendFile('main.html', { root: publicRoot });
});

serverConfig.use('/auth', authRoute.router);
serverConfig.use('/administration', admRoute.router);
serverConfig.use('/network', networkRoute.router);
serverConfig.use('/devices', devicesRoute.router);

serverConfig.listen(port, function () {
  console.log('Listening on ' + port);
});

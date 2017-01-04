var express = require('express');
var app = express();
var logger = require('morgan');

var router = require('./router');

var port = 3000;


// error logging
app.use(logger('dev'));

// set view engine
app.set('view engine', 'jade');

// serve assets
app.use(express.static('public'));

// routing
app.use('/', router);

// handle 404
app.use(function(req, res, next){
  res.render('error', {
    title: 'Error'
  });
});

// start http server
app.listen(port, function(){
  console.log('Express is now listening on port ' + port);
});

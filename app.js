var express = require('express');
var bodyParser = require('body-parser');
var logger = require('morgan');
var router = require('./router');

var app = express();
var port = 3000;


app.set('view engine', 'jade'); // set view engine

app.use(logger('dev')); // error logging
app.use(bodyParser.urlencoded({extended: true})); // parse post body
app.use(express.static('public')); // serve assets
app.use('/', router); // routing

// handle 404
app.use(function(req, res, next){

  var error = new Error();

  error.status = 404;
  error.message = 'Where do you think you\'re going?';

  res.render('error', {
    title: error.status + ': ' + error.message,
    error: error
  });
});

// handle other errors
app.use(function(error, req, res, next){
  res.render('error', {
    title: error.status + ': ' + error.message,
    error: error
  });
});

// start http server
app.listen(port, function(){
  console.log('Express is now listening on port ' + port);
});

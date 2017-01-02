var express = require('express');
var router = require('./router');
var config = require('./config');

var app = express();
var port = 3000;


// set template engine
app.set('view engine', 'jade');

// app routes
app.use('/', router);

// serve assets
app.use(express.static('public'));

// start http server
app.listen(port, function(){
  console.log('Express is now running on port ' + port + '!');
});

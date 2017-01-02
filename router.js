var express = require('express');
var router = express.Router();
var Twit = require('twit');

var twitConf = require('./config');
var utils = require('./utils');

var T = new Twit(twitConf);


router.get('/', function(req, res, next){
  var d = Date.parse(new Date().toUTCString());

  T.get('statuses/home_timeline', {count: 5}, function(error, data, response){
    var timelines = [];

    data.forEach(function(timeline){
      var posted = Date.parse(timeline.created_at);

      console.log(d);
      console.log(utils.displayDuration(d, posted));

      timelines.push({

      });
    });

    res.render('home', {
      title: 'Home'
    });
  });
});


module.exports = router;

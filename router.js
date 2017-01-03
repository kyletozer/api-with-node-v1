var express = require('express');
var router = express.Router();

var Twit = require('twit');
var T = new Twit(require('./config'));
var utils = require('./utils');


router.get('/', function(req, res, next) {

	function apiGet(endpoint, options) {
		return new Promise(function(resolve, reject) {
			T.get(endpoint, options, function(error, data, response) {
					if (error) {
						return reject(error)
					}
					resolve(data);
				});
		});
	}

  function timeSincePost(datePosted, dateViewed){

    function toTimeStamp(dateString){
      return Date.parse(dateString) / 1000;
    }

    datePosted = toTimeStamp(datePosted);
    dateViewed = toTimeStamp(dateViewed);

    var timeElapsed = dateViewed - datePosted;

    var minute = 60;
    var hour = minute * 60;
    var day = hour * 24;
    var week = day * 7;
    var year = week * 52;

    var output;

    if(timeElapsed < minute){
      output = Math.round(timeElapsed) + ' s';

    }else if(timeElapsed < hour){
      output = Math.round(timeElapsed / minute) + ' m';

    }else if(timeElapsed < day){
      output = Math.round(timeElapsed / hour) + ' h';

    }else if(timeElapsed < week){
      output = Math.round(timeElapsed / day) + ' d';

    }else if(timeElapsed < year){
      output = Math.round(timeElapsed / week) + ' w';

    }else{
      output = Math.round(timeElapsed / year) + ' y';
    }

    return output;
  }


  var date = new Date();

	var locals = {
		title: 'Home'
	};

	var timeline = apiGet('statuses/home_timeline', {count: 20});
	var friends = apiGet('friends/list', {count: 5});
	var messages = apiGet('direct_messages', {count: 5});


	Promise
		.all([timeline, friends, messages])
		.then(function(data) {

			data
				.forEach(function(request, i) {

          if (i === 0) {

            locals.timeline = [];

            request.forEach(function(post){
              var char = ' ';

              var text = post.text.split(char).map(function(word){
                if(/^https?:\/\//.test(word)){
                  return '<a href="' + word + '" target="_blank">' + word + '</a>';
                }

                return word
                  .replace('<', '&lt;')
                  .replace('>', '&rt;')
                  .replace('/', '&sol;')
                  .replace('"', '&quot;')
              })
                .join(char);

              locals.timeline.push({
                name: post.user.name,
                screenName: post.user.screen_name,
                avatar: post.user.profile_image_url,
                text: text,
                retweeted: post.retweet_count,
                favorited: post.favorited_count,
                posted: timeSincePost(post.created_at, date.toUTCString())
              });
            });
					}

          if(i === 1){

            locals.friends = [];
          }

          if(i === 2){

            locals.messages = [];
          }
				});

			res.render('home', locals);
		});
});

module.exports = router;

var express = require('express');
var router = express.Router();
var utils = require('./utils');


router.get('/', function(req, res, next) {

  var date = new Date().toUTCString();

  var locals = {
    messages: [],
    latestChat: null
  };

  var timeline = utils.apiGet('statuses/home_timeline', { count: 5 });
  var friends = utils.apiGet('friends/list', { count: 5 });
  var messages = utils.apiGet('direct_messages', { count: 5 });
  var sentMessages = utils.apiGet('direct_messages/sent', { count: 5 });
  var account = utils.apiGet('account/verify_credentials');


  Promise
    .all([
      account,
      timeline,
      friends,
      messages,
      sentMessages
    ])
    .then(function(data) {

      data.forEach(function(request, i) {

        if(i === 0) { // account

          locals.name = request.name;
          locals.screenName = request.screen_name;
          locals.avatar = request.profile_image_url;
        }


        if(i === 1) { // timeline

          locals.timeline = [];

          request.forEach(function(post) {
            var text = utils.preserveTextLinks(post.text, ' ');

            locals.timeline.push({
              name: post.user.name,
              screenName: post.user.screen_name,
              avatar: post.user.profile_image_url,
              text: text,
              retweeted: post.retweet_count,
              favorited: post.favorite_count,
              posted: utils.timeSincePost(post.created_at, date)
            });
          });
        }


        if(i === 2) { // friends

          locals.friends = [];

          request.users.forEach(function(friend) {

            locals.friends.push({
              name: friend.name,
              screenName: friend.screen_name,
              avatar: friend.profile_image_url
            });
          });
        }


        if(i === 3 || i === 4) { // messages

          for(var j = 0; j < request.length; j++) {
            var message = request[j];

            if(i === 4 && j === 0) {
              locals.latestChat = (message.sender.screen_name === locals.screenName) ?
                message.recipient.screen_name :
                message.sender.screen_name;
            }

            locals.messages.push({
              sender: message.sender.screen_name,
              recipient: message.recipient.screen_name,
              text: message.text,
              timestamp: Date.parse(message.created_at),
              posted: utils.timeSincePost(message.created_at, date),
              avatar: message.sender.profile_image_url
            });
          }
        }
      });


      var allMessages =

        locals.messages.slice()
        .filter(function(message, i) {

          if(locals.latestChat === message.recipient || locals.latestChat === message.sender) {
            return message;
          }

        }).sort(function(a, b) {
          return a.timestamp - b.timestamp;
        });


      locals.messages = allMessages.slice(allMessages.length - 5);

      // console.log(locals);
      res.render('home', locals);

    }).catch(function(reason) {
      res.render('error', reason);
    });
});


module.exports = router;

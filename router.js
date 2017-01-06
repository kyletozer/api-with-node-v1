var express = require('express');
var router = express.Router();
var utils = require('./utils');


router.get('/', function(req, res, next) {

  // get the time at the time the route is called
  var date = new Date().toUTCString();

  // local variables for jade template
  var locals = {
    title: 'Twitter Interface',
    messages: [],
    latestChat: null
  };

  // make api calls
  var timeline = utils.apiGet('statuses/home_timeline', { count: 5 });
  var friends = utils.apiGet('friends/list', { count: 5 });
  var messages = utils.apiGet('direct_messages', { count: 5 });
  var sentMessages = utils.apiGet('direct_messages/sent', { count: 5 });
  var account = utils.apiGet('account/verify_credentials');

  // resolve all asynchronous api calls
  Promise
    .all([
      account,
      timeline,
      friends,
      messages,
      sentMessages
    ])
    .then(function(data) {

      // loop through the resulting array of objects containing twitter profile data. Only the data required for the project is passed to the locals object
      data.forEach(function(request, i) {

        if(i === 0) { // account

          locals.name = request.name;
          locals.screenName = request.screen_name;
          locals.avatar = request.profile_image_url;
          locals.bg = request.profile_background_image_url;
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

        // I mocked up the message to look like the messages section in the template, by pulling the last 5 DMs from the last conversation.
        if(i === 3 || i === 4) { // messages

          for(var j = 0; j < request.length; j++) {
            var message = request[j];

            // determines the user with which the last conversation was had on twitter
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

      // because I am pulling the last 5 DMs sent and recieved by a user, I filter the messages by the user with which the last conversation was had, and sort them by the time they were posted
      var allMessages =

        locals.messages.slice()
        .filter(function(message, i) {

          if(locals.latestChat === message.recipient || locals.latestChat === message.sender) {
            return message;
          }

        }).sort(function(a, b) {
          return a.timestamp - b.timestamp;
        });

      // return only the last 5 messages from the potential 10 returned from the api message calls
      locals.messages = allMessages.slice(allMessages.length - 5);
      res.render('home', locals);

    }).catch(function(reason) {

      var error = new Error();

      error.status = reason.statusCode || 500;
      error.message = reason.message;

      next(error);
    });
});


router.post('/', function(req, res, next){

  // make api call
  var tweet = utils.apiPost('statuses/update', {status: req.body.tweet});

  
  tweet.then(function(data){
    res.redirect('/');

  }).catch(function(reason){

    var error = new Error();

    error.status = reason.statusCode || 500;
    error.message = reason.message;

    return next(error);
  });
});


module.exports = router;

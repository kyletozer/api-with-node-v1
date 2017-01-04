var Twit = require('twit');
var T = new Twit(require('./config'));


module.exports = {

  apiGet: function(endpoint, options) {
		return new Promise(function(resolve, reject) {
			T.get(endpoint, options, function(error, data, response) {
					if (error) {
            console.log(error);
						return reject(error)
					}
					resolve(data);
				});
		});
	},

  timeSincePost: function(datePosted, dateViewed){

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
  },

  preserveTextLinks: function(textStr, char){

    return textStr.split(char).map(function(word){

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
  }
};

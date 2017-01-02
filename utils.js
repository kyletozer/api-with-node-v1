module.exports = {

  displayDuration: function(timePosted, timeViewed){
    var duration = (timeViewed - timePosted) / 1000;
    return duration;
  }
};

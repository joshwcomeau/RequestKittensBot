var twitter = require('twitter');
var util    = require('util');
var envar   = require('envar');
var request = require('request');


var twit = new twitter({
  consumer_key:         envar("REQUESTKITTENS_TWITTER_KEY"),
  consumer_secret:      envar("REQUESTKITTENS_TWITTER_SECRET"),
  access_token_key:     envar("REQUESTKITTENS_TWITTER_ACCESS_TOKEN"),
  access_token_secret:  envar("REQUESTKITTENS_TWITTER_ACCESS_SECRET")
});




twit.stream('user', {track:'requestkittens'}, function(stream) {
  stream.on('data', function(data) {
    var msg = data.text;
    var sender = data.user.screen_name;
  });
});



// var myNameRegex = /@requestkittens/i;

// function isForMe(tweet) {
//   return tweet.match(myNameRegex);
// }

// Bot.listen("sendCatPics", isForMe, function(twitter, action, tweet) {
//   console.log("twitter:", twitter);
//   console.log("action:", action);
//   console.log("tweet:", tweet);
// });
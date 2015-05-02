var twitter = require('twitter');
var util    = require('util');
var envar   = require('envar');


var client = new twitter({
  consumer_key:         envar("REQUESTKITTENS_TWITTER_KEY"),
  consumer_secret:      envar("REQUESTKITTENS_TWITTER_SECRET"),
  access_token_key:     envar("REQUESTKITTENS_TWITTER_ACCESS_TOKEN"),
  access_token_secret:  envar("REQUESTKITTENS_TWITTER_ACCESS_SECRET")
});


function replyToUser(username) {
  var newStatus = "Hi " + username + "!";
  client.post('statuses/update', {status: newStatus}, function(error, tweet, response){
    console.log( error ? util.inspect(error) : "Tweet posted: ", tweet, "Raw response object: ", response);
  });
};



client.stream('statuses/filter', {track:'requestkittens'}, function(stream) {
  var msg, sender;
  
  stream.on('data', function(data) {
    console.log("Data received:", data);

    // Is this a message sent to us? Might also be generic user data.
    if ( data.text && data.user.screen_name) {
      msg = data.text;
      sender = data.user.screen_name;
    }
    
    // Version 1: just reply "Hi ______!"
    replyToUser(sender);
  });

  stream.on('error', function(error) {
    console.log(error);
  });
});
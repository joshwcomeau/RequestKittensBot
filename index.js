var twitter = require('twitter');
var util    = require('util');
var envar   = require('envar');
var _       = require('lodash');


var client = new twitter({
  consumer_key:         envar("REQUESTKITTENS_TWITTER_KEY"),
  consumer_secret:      envar("REQUESTKITTENS_TWITTER_SECRET"),
  access_token_key:     envar("REQUESTKITTENS_TWITTER_ACCESS_TOKEN"),
  access_token_secret:  envar("REQUESTKITTENS_TWITTER_ACCESS_SECRET")
});


function replyToUser(tweetId, user, photoData) {
  var newStatus, responseObj;

  newStatus   = "@" + user.screen_name + ", here you go!";
  responseObj = {
    status:                newStatus, 
    in_reply_to_status_id: tweetId
  };


  client.post('statuses/update', responseObj, function(error, tweet, response){
    console.log( error ? util.inspect(error) : "\n\n\n\n\nTweet posted: ", tweet);
  });
};

function findDesiredEmotion(tweetBody) {

}

function getCatPhoto(emotion) {
  
}


client.stream('statuses/filter', {track:'requestkittens'}, function(stream) {
  var msg, sender, emotion, photoData;
  
  stream.on('data', function(data) {
    console.log("Data received:", data);

    // Is this a message sent to us? Might also be generic user data.
    if ( data.text && data.user.screen_name) {
      // Step 1: Parse their message to find the desired emotion
      emotion = findDesiredEmotion(data.text);

      // Step 2: Make a request to requestkittens.com to get a photo
      // Ideally, this will return a long string of binary data
      photoData = getCatPhoto(emotion);

      // Step 3: Tweet the photo to user
      replyToUser(data.id_str, data.user, photoData);
    }
  });

  stream.on('error', function(error) {
    console.log(error);
  });
});


/* 
Sample User object (Twitter API)

{ 
  id: 3181045951,
  id_str: '3181045951',
  name: 'Request Kittens',
  screen_name: 'requestkittens',
  location: '',
  description: '',
  url: null,
  entities: { description: [Object] },
  protected: false,
  followers_count: 1,
  friends_count: 1,
  listed_count: 0,
  created_at: 'Thu Apr 30 21:28:59 +0000 2015',
  favourites_count: 0,
  utc_offset: -14400,
  time_zone: 'Eastern Time (US & Canada)',
  geo_enabled: false,
  verified: false,
  statuses_count: 3,
  lang: 'en',
  contributors_enabled: false,
  is_translator: false,
  is_translation_enabled: false,
  profile_background_color: 'C0DEED',
  profile_background_image_url: 'http://abs.twimg.com/images/themes/theme1/bg.png',
  profile_background_image_url_https: 'https://abs.twimg.com/images/themes/theme1/bg.png',
  profile_background_tile: false,
  profile_image_url: 'http://pbs.twimg.com/profile_images/593891297443840000/p9IdFN0V_normal.jpg',
  profile_image_url_https: 'https://pbs.twimg.com/profile_images/593891297443840000/p9IdFN0V_normal.jpg',
  profile_link_color: '0084B4',
  profile_sidebar_border_color: 'C0DEED',
  profile_sidebar_fill_color: 'DDEEF6',
  profile_text_color: '333333',
  profile_use_background_image: true,
  default_profile: true,
  default_profile_image: false,
  following: false,
  follow_request_sent: false,
  notifications: false 
}

*/
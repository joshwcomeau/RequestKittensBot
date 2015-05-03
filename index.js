// Built-in Node modules
var util      = require('util');
var fs        = require('fs');

// NPM package modules
var _         = require('lodash');
var envar     = require('envar');
var twitter   = require('twitter');
var Promise   = require('es6-promise').Promise;
var request   = require('request');


var API_INDEX = 'http://requestkittens.com/cats';


var client = new twitter({
  consumer_key:         envar("REQUESTKITTENS_TWITTER_KEY"),
  consumer_secret:      envar("REQUESTKITTENS_TWITTER_SECRET"),
  access_token_key:     envar("REQUESTKITTENS_TWITTER_ACCESS_TOKEN"),
  access_token_secret:  envar("REQUESTKITTENS_TWITTER_ACCESS_SECRET")
});


function replyToUser(tweetId, user, photoData) {
  return new Promise(function(resolve, reject) {
    var newStatus, responseObj;

    newStatus   = "@" + user.screen_name + ", here you go!";
    responseObj = {
      status:                newStatus, 
      in_reply_to_status_id: tweetId
    };


    client.post('statuses/update', responseObj, function(error, tweet, response){
      console.log( error ? util.inspect(error) : "\n\n\n\n\nTweet posted: ", tweet);
    });


  });

};

function findDesiredEmotion(tweetBody) {
  // Fake it for now, out of laziness.
  return "sleepy";
}

function getCatPhoto(emotion) {
  return new Promise(function(resolve, reject) {
    request.get(
      API_INDEX,
      {
        qs: {
          emotion: emotion
        },
        headers: {
          Authorization: envar("REQUESTKITTENS_API_KEY")
        },
        json: true
      }, 
      function(err, res, body) {
        console.log("Got cat photo? status:", res.statusCode);
        (err || res.statusCode !== 200) ? reject(err) : resolve(body._items[0]);
      }
    );
  });
}

function uploadPhotoToTwitter(photoData) {
  return new Promise(function(resolve, reject) {
    client.post(
      'media/upload', 
      { 
        media_data: photoData
      }, 
      function(err, media, response){
        console.log("err:", err);
        // console.log("media:", media);
        console.log("response:", response);

        // console.log("\n\n\n\n\n binaryData:", photoData.substr(0,100));
        reject(err);

      }
    );
  });
}

function fetchPhoto(catData) {
  var binaryData;

  return new Promise(function(resolve, reject) {
    request.get(
      { 
        url: catData.url, 
        json: true 
      }, 
      function(err, res, body) {
        if (err || res.statusCode !== 200) reject(err);

        console.log("About to base64");
        binaryData = new Buffer(body, 'binary').toString('binary');
        // binaryData = "data:image/jpeg;base64," + binaryData;

        console.log("Binary data is", binaryData.substr(0,100));



        // Lets write this to a file to test if it works in an HTML docuent.
        fs.writeFileSync("testfile.txt", binaryData);

        resolve(binaryData);
      }
    );
  });
}


function tweetUser(data) {
  emotion = findDesiredEmotion(data.text);

  getCatPhoto(emotion)
  .then(function(catData)   { return fetchPhoto(catData); })
  .then(function(photoData) { return uploadPhotoToTwitter(photoData); })
  .then(function(mediaId)   { return replyToUser(data.id_str, data.user, photoData); })
  .then(function(result)    {
    console.log("Everything complete!", result);
  }, function(err) {
    console.log("Something broke:", err);
  });
}


client.stream('statuses/filter', {track:'requestkittens'}, function(stream) {
  var msg, sender, emotion, photoData;
  
  stream.on('data', function(data) {
    console.log("Data received:", data);

    // Is this a message sent to us? Might also be generic user data.
    if ( data.text && data.user.screen_name) {
      tweetUser(data);
    }
  });

  stream.on('error', function(error) {
    console.log(error);
  });
});


// JUST A TEST: Skipping the original twitter stream bit for now.
var sampleData = {
  id_str: "594625609063620608",
  text: "@RequestKittens, can I have a Happy kitten please??",
  user: {
    screen_name: 'JoshuaWComeau',
    id_str: '3181045951',
  }
}

// tweetUser(sampleData);


// A test: Upload a local file to twitter
data = fs.readFileSync('josh.jpg', { encoding: 'base64' });
uploadPhotoToTwitter(data);


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
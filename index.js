// Built-in Node modules
var util      = require('util');
var fs        = require('fs');

// NPM package modules
var _         = require('lodash');
var envar     = require('envar');
var twitter   = require('twitter');
var Promise   = require('es6-promise').Promise;
var request   = require('request');


var API_ENDPOINTS = {
  cats: {
    index: 'http://requestkittens.com/cats'
  },
  emotions: {
    index: 'http://requestkittens.com/emotions'
  }
};

var validEmotions;


var client = new twitter({
  consumer_key:         envar("REQUESTKITTENS_TWITTER_KEY"),
  consumer_secret:      envar("REQUESTKITTENS_TWITTER_SECRET"),
  access_token_key:     envar("REQUESTKITTENS_TWITTER_ACCESS_TOKEN"),
  access_token_secret:  envar("REQUESTKITTENS_TWITTER_ACCESS_SECRET")
});


// Putting this first, as a table-of-contents. Yay hoisting!
function tweetUser(data) {
  // First thing's first: Ignore tweets that the bot sends, to avoid a recursive loop.
  if (data.user.screen_name.match(/requestkittens/i) ) return false;

  emotion = findDesiredEmotion(data.text);

  getCatDataFromAPI(emotion)
  .then(function(catData)   { return fetchPhoto(catData); })
  .then(function(photoData) { return uploadPhotoToTwitter(photoData); })
  .then(function(mediaId)   { return replyToUser(mediaId, data.id_str, data.user, emotion); })
  .then(function(result)    {
    console.log("Everything complete!", result);
  }, function(err) {
    console.log("Something broke:", err);
  });
}

// Step 1: Figure out which emotion they want.
function findDesiredEmotion(tweetBody) {
  // Do we have a list of valid emotions? If not, go fetch one from the API.
  if ( !validEmotions ) {
    populateValidEmotions()
    .then(function() {

    })
  }
  return _.find(tweetBody.split(" "), function(word) {
    return 
  });
}


// Step 2: Make a request to the RequestKittens.com API for a Cat JSON object.
function getCatDataFromAPI(emotion) {
  return new Promise(function(resolve, reject) {
    request.get(
      API_ENDPOINTS.cats.index,
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


// Step 3: Download and parse the actual photo.
function fetchPhoto(catData) {
  var base64data;

  return new Promise(function(resolve, reject) {
    request.get(
      { 
        url: catData.url, 
        encoding: 'binary',
        json: true 
      }, 
      function(err, res, body) {
        if (err || res.statusCode !== 200) reject(err);

        base64data = new Buffer(body.toString(), 'binary').toString('base64');
        resolve(base64data);
      }
    );
  });
}


// Step 4: Upload that photo to Twitter, pass on its MediaID for the reply.
function uploadPhotoToTwitter(photoData) {
  return new Promise(function(resolve, reject) {
    client.post(
      'media/upload', 
      { 
        media_data: photoData
      }, 
      function(err, media, response){
        err ? reject(err) : resolve(JSON.parse(response.body).media_id_string);
      }
    );
  });
}


// Step 5: Take all the data we've accrued, and use it to build and send a reply to the user.
function replyToUser(mediaId, tweetId, user, emotion) {
  return new Promise(function(resolve, reject) {
    var newStatus, responseObj;

    newStatus   = "@" + user.screen_name + ", here's the " + emotion + " cat photo you requested!";

    responseObj = {
      status:                 newStatus, 
      media_ids:              mediaId,
      in_reply_to_status_id:  tweetId,
    };


    client.post('statuses/update', responseObj, function(error, tweet, response){
      console.log( error ? util.inspect(error) : "\n\n\n\n\nTweet posted: ", tweet);
    });
  });
};

function populateValidEmotions() {
  return new Promise(function(resolve, reject) {
    request.get(
      API_ENDPOINTS.emotions.index,
      {
        headers: {
          Authorization: envar("REQUESTKITTENS_API_KEY")
        },
        json: true
      }, 
      function(err, res, body) {
        if (err || res.statusCode !== 200) return reject(err);

        validEmotions = body._items.map(function(item) { return item.name; });
        console.log(validEmotions);
        validEmotions.length ? resolve(true) : reject("No emotions found from server");
      }
    );
  });
}



populateValidEmotions();



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


//////////////// TEST 1: Use this sample data ///////////.///////////////
// JUST A TEST: Skipping the original twitter stream bit for now.
// var sampleData = {
//   id_str: "594625609063620608",
//   text: "@RequestKittens, can I have a Happy kitten please??",
//   user: {
//     screen_name: 'JoshuaWComeau',
//     id_str: '3181045951',
//   }
// }

// tweetUser(sampleData);
/////////////////////////////////////////////////////////////////////////



/////////////// TEST 2: SKIP EVERYTHING EXCEPT uploadPhoto //////////////
// A test: Upload a local file to twitter
// data = fs.readFileSync('testfile.txt');
// fs.writeFileSync("testfile2.txt", data);
// uploadPhotoToTwitter(data);
////////////////////////////////////////////////////////////////////////


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
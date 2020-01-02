require("dotenv").config();
var axios = require('axios');
var Spotify = require('node-spotify-api');
var fs = require('fs');

var keys = require("./keys.js");

var action = process.argv[2];
var query = process.argv[3];

action = action.toLowerCase()

var actionMap = {
    'concert-this': concertThisConcert,
    'spotify-this-song': spotifyThisSong,
    'movie-this': movieThisMovie,
    'do-what-it-says': doWhatItSays
}

if (!actionMap[action]) {
    console.error('Sorry, ' + action + ' is not a valid command')
} else {
    actionMap[action](query)
}

// ---------------------------------

// if (action === 'concertThis') {

// } else if (action === 'spotifyThis') {
//     spotifyThisSong(query);
// } else if (action === 'movieThis') {

// } else if (action === 'doWhatItSays') {

// } else {
//     console.log("error");
// }

// -----------------------------------

function spotifyThisSong(songName) {
    var spotify = new Spotify(keys.spotify);

    spotify.search({ type: 'track', query: songName }, function (err, data) {
        if (err) {
            return console.log('Error has occurred: ' + err);
        }
        fs.writeFileSync("test.json", JSON.stringify(data, null, 4));
        for (var i = 0; i < data.tracks.items.length; i++) {
            var item = data.tracks.items[i];
            var artists = item.artists
                .map(artist => artist.name)
                .join(', ')
            console.log("Song: " + item.name + " | Artist: " + artists + " | Album: " + item.album.name + " | URL: " + item.preview_url)
        }
    });
};

function movieThisMovie(movieName) {
    console.log(movieName);
};

function concertThisConcert(concertName) {
    console.log(concertName);
};

function doWhatItSays() {
    console.log("do what it says");
};
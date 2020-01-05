require("dotenv").config();
var axios = require('axios');
var Spotify = require('node-spotify-api');
var fs = require('fs');
var cp = require('child_process');
var moment = require('moment');

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

function spotifyThisSong(songName) {
    var spotify = new Spotify(keys.spotify);
    if (!songName) {
        spotifyThisSong('The Sign, Ace of Base')
        return
    }
    spotify.search({ type: 'track', query: songName }, function (err, data) {
        if (err) {
            return console.log('Error has occurred: ' + err);
        }
        if (data.tracks.items.length === 0) {
            spotifyThisSong('The Sign, Ace of Base')
            return
        }
        for (var i = 0; i < data.tracks.items.length; i++) {
            var item = data.tracks.items[i];
            var artists = item.artists
                .map(artist => artist.name)
                .join(', ')
            console.log(
                "Song: " + item.name +
                "\nArtist: " + artists +
                "\nAlbum: " + item.album.name +
                "\nURL: " + item.preview_url + "\n"
            )
            console.log("----------------------------")
        }
    });
};

function movieThisMovie(movieName) {
    if (!movieName) {
        movieThisMovie('Mr. Nobody');
        return;
    }
    axios.get("http://www.omdbapi.com/?t=" + movieName + "&y=&plot=short&apikey=trilogy")
        .then(function (response) {
            if (response.data.Error) {
                movieThisMovie('Mr. Nobody');
                return;
            }
            var rottenTomatoRating
            var imdbRating
            for (var i = 0; i < response.data.Ratings.length; i++) {
                var source = response.data.Ratings[i].Source;
                var value = response.data.Ratings[i].Value;
                if (source.toLowerCase() === "rotten tomatoes") {
                    rottenTomatoRating = value;
                } else if (source.toLowerCase() === "internet movie database") {
                    imdbRating = value;
                }
            }
            console.log(
                "Title: " + response.data.Title +
                "\nRelease Year: " + response.data.Year +
                "\nIMDB Rating: " + imdbRating +
                "\nRotten Tomatoes Rating: " + rottenTomatoRating +
                "\nProduced in: " + response.data.Country +
                "\nLanguage: " + response.data.Language +
                "\nPlot: " + response.data.Plot +
                "\nActors: " + response.data.Actors
            )
        })
};

function concertThisConcert(artist) {
    axios.get("https://rest.bandsintown.com/artists/" + artist + "/events?app_id=codingbootcamp")
        .then(function (response) {
            if (response.data.length === 0) {
                console.log(artist + " is not currently touring. Please trying searching for another artist.")
            }
            for (var i = 0; i < response.data.length; i++) {
                var item = response.data[i];
                var location = item.venue.city + ', ' + item.venue.region + ', ' + item.venue.country
                // data didn't always include a region - this cleans up the output if there is no region provided
                if (!item.venue.region) {
                    location = item.venue.city + ', ' + item.venue.country
                }
                var startTime = moment(item.datetime).format('MM/DD/YYYY');

                console.log((
                    "Artist: " + item.lineup.join(', ') +
                    "\nVenue: " + item.venue.name +
                    "\nLocation: " + location +
                    "\nDate: " + startTime)
                )
                console.log("----------------------------")
            }
        })
};

function doWhatItSays() {
    var randomText = fs.readFileSync("./random.txt", 'utf8');
    var pieces = randomText.split(',');
    var action = pieces[0];
    var query = pieces[1];
    var command = "node liri.js " + action + " " + query
    cp.execSync(command, { stdio: "inherit" })
};
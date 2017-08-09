var keys = require("./keys.js");
var Spotify = require('node-spotify-api');
var request = require('request');

// console.log(keys);

//console.log(keys);
var parameters = process.argv;
var action = "";

if (parameters.length < 3){
	usage();
	process.exit();
}
else {
	movie_func();
}


function movie_func() {
	var movieName = parameters.length === 3 ? "Mr. Nobody" : parameters[3];

	request(`http://www.omdbapi.com/?apikey=${keys.movie}&t=${movieName}`, function(error, response, body) {

	  if (!error && response.statusCode === 200) {
	  	console.log(body);
	  	console.log("\n\n\n\n\n" +body.Rated);
	  	var movieDetails =  	
	  	`title: ${body["Title"]}\nyear: ${body.Year}\nIMDB rating: ${body.Ratings}\nRotten Tomatoes Raiting: ${body.Ratings}` +
	  	`\nCountry Produced: ${body.Country}\nLanguage: ${body.Language}\nPlot: ${body.Plot}\nActors: ${body.Actors}`;
	    console.log(movieDetails);
	  }

	});
}

function spot() {

	keys.spotify
	  .search({ type: 'track', query: 'The Sign' })
	  .then(function(response) {
	    console.log(response);
	  })
	  .catch(function(err) {
	    console.log(err);
	  });
}


function LOG(msg , cmd) {

	var fs = require("fs");

	var message = '${cmd}: ${msg}';	

	console.log(message);
	fs.appendFile("log.txt", msg, "utf8", (err) => { if (err) throw err; });
}

function usage() {
	var use = 
`he transactions possible are:
* 'my-tweets' - This will show your last 20 tweets and when they were created 
   at in your terminal/bash window.
* 'spotify-this-song <song?>' - This will show the following information about 
   the song in your terminal/bash window:
	-Artist(s)
	-The song's name
	-A preview link of the song from Spotify
	-The album that the song is from
	-If no song is provided then your program will default to "The Sign" by Ace of Base.
* 'movie-this <movie?>' - This will output the following information to your 
   terminal/bash window:
	-Title of the movie.
	-Year the movie came out.
	-IMDB Rating of the movie.
	-Rotten Tomatoes Rating of the movie.
	-Country where the movie was produced.
	-Language of the movie.
	-Plot of the movie.
	-Actors in the movie.
	-If the user doesn't type a movie in, the program will output data for 
	 the movie 'Mr. Nobody.
* 'do-what-it-says' - It should run spotify-this-song for "I Want it That Way," 
   as follows the text in random.txt.` ;

  console.log(use);
}


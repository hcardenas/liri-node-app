// ************************
// -- added moment to get the time stamp on the log.txt
// -- do-what-it says can handle multiple commands
//    however be carefull with the new line at the end of the file 
//    or it wont run. 
// ************************

var keys = require("./keys.js");
var Spotify = require('node-spotify-api');
var request = require('request');
var moment = require('moment');
var fs = require('fs');
var Twitter = require('twitter');
var inquirer = require('inquirer');


var loop_used = false;

var parameters = process.argv;


if (parameters.length > 2  && parameters.length < 5)
	main(parameters[2].toLowerCase(), parameters[3]);
else 	
	END();



function main(action, arg) {
	switch (action) {
		case "my-tweets" :
			tweet_func(arg);
			break;
		case "movie-this" :
			movie_func(arg);
			break;
		case "spotify-this-song" :
			spotify_func(arg);
			break;
		case "do-what-it-says" :
			doWhatItSays_func(arg);
			break;

		case "--loop":
			loop_used = true;
			loop();
			break;
		default :
			END();
	}
}

function loop() {	

	inquirer.prompt([
		{ 
			type: "list",
			name: "option",
			choices: ["my-tweets", "movie-this","spotify-this-song","do-what-it-says", "quit"],
			message: ">> pick an action! "
		}, 
		{
			when: function(answer) {
				return answer.option === "movie-this";
			},
			type : "input",
			name: "movieName",
			message: "movie name (optional): "
		},
		{
			when: function(answer) {
				return answer.option === "spotify-this-song";
			},
			type : "input",
			name: "songName",
			message: "song name (optional): "
		}
	])
	.then((answer) => {
			if (answer.option === "quit") process.quit();
			else if (answer.option === "movie-this") {
				if (answer.movieName.trim() === "") main(answer.option, undefined);
				else main(answer.option, answer.movieName.trim());
			}
			else if (answer.option === "spotify-this-song") {
				if (answer.songName.trim() === "") main(answer.option, undefined);
				else main(answer.option, answer.songName);
			}
			else main(answer.option, undefined);

			
	})
	.catch((err) =>{
			console.log("good bye")
	})
	;
	
}

function tweet_func(arg) {
	if (arg !== undefined) {
		usage();
		return;
	}

 
	var params = {screen_name: 'helmut cardenas'};
	keys.twitterKeys.get('statuses/user_timeline', params, function(error, tweets, response) {
	  if (!error) {
	    //console.log(tweets);

	    var message = "";
	    var num = 1;
	    for (var i = 0; i < tweets.length ; ++i, ++num) {
	    	message += `tweet ${num}: ${tweets[i].text}`;
	    	if (i < tweets.length - 1) 
	    		message += '\n';
	    	
	    }
	    
	    LOG(message, "my-tweets");
	  }
	});



}

function doWhatItSays_func(arg) {
	if (arg !== undefined)  END();

	var file = fs.readFileSync("./random.txt" , "utf8", (err)=> {});
	var fileArr = file.split('\n');

	var action = "";


	for (var i in fileArr) {
		action = fileArr[i].split(",");
		if (action[0] !== "do-what-it-says")  // avoids infinite loop
			main(action[0], action[1]);
	}
}

function movie_func(arg) {
	var movieName = arg === undefined ? "Mr. Nobody" : arg;
	request(`http://www.omdbapi.com/?apikey=${keys.movie}&t=${movieName}&r=json`, function(error, response, body) {

	  if (!error && response.statusCode === 200) {
	  	var jsonObj = JSON.parse(body);
	  	
	  	//console.log(body);
	  	//console.log("\n\n\n\n\n" + body["Title"]);
	  	var movieDetails =  	
	  	`title: ${jsonObj.Title}\nyear: ${jsonObj.Year}\nIMDB rating: ${jsonObj.Ratings[0].Value}\nRotten Tomatoes Raiting: ${jsonObj.Ratings[1].Value}` +
	  	`\nCountry Produced: ${jsonObj.Country}\nLanguage: ${jsonObj.Language}\nPlot: ${jsonObj.Plot}\nActors: ${jsonObj.Actors}`;
	    LOG(movieDetails, "movie-this");
	  }
	});
}

function spotify_func(arg) {

	var song = arg === undefined ? "The Sign, ace of base" : arg ; 

	keys.spotify
	  .search({ type: 'track', query: song , limit: 1})
	  .then((response) => {

	    var artistsArr = response.tracks.items[0].artists;
	    var artist = "";
	    for (var i in artistsArr) 
	    	artist += `${artistsArr[i].name} `;
	    
	    var preview = response.tracks.items[0].external_urls.spotify;
	    var albumName = response.tracks.items[0].album.name;
	    var songName = response.tracks.items[0].name;

	    var songDetails = 
	    `Artist(s): ${artist}\nThe song's name: ${songName}\nPreview: ${preview}\nAlbum: ${albumName}`;

	    LOG(songDetails, "spotify-this-song");
	  })
	  .catch(function(err) {
	    console.log(err);
	  });
}

function LOG(msg , cmd) {

	var fs = require("fs");
	var timeStamp  = moment().format();
	var message = `/*************\n${timeStamp}) - ${cmd}:\n${msg}\n/*************\n\n`;	

	console.log(msg);
	fs.appendFile("log.txt", message, "utf8", (err) => { if (err) throw err; });
	
	if (loop_used) {
		loop();
	}
}

function usage() {

	var use = 
`the possible commands are:

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
   as follows the text in random.txt.

* '--loop' - makes the program go in a loop and it will go on untill 'quit' is used` ;

  console.log(use);
}

function END() {
	usage();
	if (!loop_used)
		process.exit(); 
	else 
		loop();
}

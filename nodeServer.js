var socket = require( 'socket.io' );
var express = require( 'express' );
var http = require( 'http' );

var app = express();
var server = http.createServer( app );
var io = socket.listen( 9000 );

var HTTP_HOST = "127.0.0.1";
var HTTP_PORT = process.env.PORT || 8080;

var clients = []; //list of everyone that is connected.
var team1 = []; //list of everyone on team 1
var team2 = []; //list of everyone on team 2
var team1Score = 0;
var team2Score = 0;

var startTime = new Date();
startTime = startTime.getTime();

var fieldWidth = 800;
var fieldHeight = 500;

//Determine the attributes of our ball.
var ball = {};
ball.size = 25.0;
ball.pos = { x: fieldWidth/2 - ball.size/2, y: fieldHeight/2 - ball.size/2 };
ball.vel = { x: 0.0, y: 0.0 };
ball.acc = { x: 0.0, y: 0.0 };
var damping = 0.97;

app.use (express.static("./www"));

io.sockets.on( 'connection', function( client ) {

	//Give our new user a certain color.
	var red = Math.floor(Math.random()*190);
	var green = Math.floor(Math.random()*190);
	var blue = Math.floor(Math.random()*190);
	var color = "rgb(" + red + "," + green + "," + blue + ")";
	client.color = color;

	client.emit( 'team count', { team1: team1.length, team2: team2.length });
	client.emit( 'ball attributes', { posX: ball.pos.x, posY: ball.pos.y, velX: ball.vel.x, velY: ball.vel.y, accX: ball.acc.x, accY: ball.acc.y } );

	//Send out the info of our new user to everyone else.
	//client.broadcast.emit( 'new player', { id: client.id, color: client.color } );
	//io.sockets.emit( 'new player', { id: client.id, color: client.color } );

	//Send the current users to our newly connect user.
	// for ( var i = 0; i < clients.length; i++ ) {
	// 	client.emit( 'new player', { id: clients[i].id, color: clients[i].color } );
	// }

	//Add our new user to the list of clients.
	//clients.push( client );

	client.on( 'player name', function( data ) {
		client.name = data.name;
	});

	client.on( 'player team', function( data ) {
		client.team = data.team;

		if (data.team == 1) {
			team1.push( client );
		}
		else {
			team2.push( client );
		}
	});

	client.on( 'add player', function() {
		//Send out the info of our new user to everyone else.
		io.sockets.emit( 'new player', { id: client.id, color: client.color, name: client.name, team: client.team } );

		//Send the current users to our newly connect user.
		for ( var i = 0; i < clients.length; i++ ) {
			client.emit( 'new player', { id: clients[i].id, color: clients[i].color, name: clients[i].name, team: clients[i].team } );
		}

		//Add our new user to the list of clients.
		clients.push( client );
	});

	//Check to see if someone has said something. If they have, send it out to everyone.
	client.on( 'new text', function (data) {
		console.log( data.text );

		//Check to see what was the last word spoken
		var right = data.text.indexOf('right');
		var left = data.text.indexOf('left');
		var up = data.text.indexOf('up');
		var down = data.text.indexOf('down');

		var max = Math.max( right, left, up, down );

		//Send the appropriate flag to move the ball in everyone's screen.
		if ( max > -1 ) {
			if ( max == right ) {
				io.sockets.emit( 'move right', { name: client.name, team: client.team, color: client.color } );
				ball.acc.x += 3.0;
			}
			else if ( max == left ) {
			 	io.sockets.emit( 'move left', { name: client.name, team: client.team, color: client.color } );
			 	ball.acc.x -= 3.0;
			}
			else if ( max == up ) {
				io.sockets.emit( 'move up', { name: client.name, team: client.team, color: client.color } );
				ball.acc.y -= 3.0;
			}
			else if ( max == down ) {
				io.sockets.emit( 'move down', { name: client.name, team: client.team, color: client.color } );
				ball.acc.y += 3.0;
			}
		}
	});

	//If someone scores, we want to know so that we can update our server-side score.
	client.on( 'goal scored', function (data) {
		if ( data.team == 1 ) {
			team1Score++;
		}
		else {
			team2Score++;
		}
		//console.log( team1Score + " | " + team2Score );

		setTimeout( resetBall, 1500 );
	});

	//If someone disconnects, we should remove them from our list of clients.
	client.on( 'disconnect', function() {
		clients.splice( client, 1 );

		if (client.team == 1) {
			team1.splice( client, 1 );
		}
		else {
			team2.splice( client, 1 );
		}

		client.broadcast.emit( 'player disconnect', { id: client.id } );
	});

});


//Animation Stuff
function animate() {

  ball.vel.x += ball.acc.x;
  ball.vel.y += ball.acc.y;
  ball.pos.x += ball.vel.x;
  ball.pos.y += ball.vel.y;

  ball.vel.x *= damping;
  ball.vel.y *= damping;
  ball.acc.x = 0.0;
  ball.acc.y = 0.0;

  checkBoundaries();

  //process.nextTick( animate );
  //setImmediate( animate );
	setTimeout( animate, 1000 / 60 );
}

function checkBoundaries() {
  if ( ball.pos.x > fieldWidth - ball.size ) {
    ball.pos.x = fieldWidth - ball.size;
    ball.vel.x *= -1;
  }
  else if ( ball.pos.x < 0 ) {
    ball.pos.x = 0;
    ball.vel.x *= -1;
  }
  else if ( ball.pos.y > fieldHeight - ball.size ) {
    ball.pos.y = fieldHeight - ball.size;
    ball.vel.y *= -1;
  }
  else if ( ball.pos.y < 0 ) {
    ball.pos.y = 0;
    ball.vel.y *= -1;
  }
}

function resetBall() {
	io.sockets.emit( 'reset ball' );
}

function timer() {
	var currentTime = new Date();
	currentTime.getTime();

	var timeElapsed = currentTime - startTime;
	var newTime = new Date( timeElapsed );
	//console.log( newTime.getMinutes() + ":" + newTime.getSeconds());

	io.sockets.emit( 'timer', { minutes: newTime.getMinutes(), seconds: newTime.getSeconds() } );

	setTimeout(timer, 1000);
}

server.listen(HTTP_PORT); //for heroku
//server.listen(8080); //for working locally

animate();
timer();
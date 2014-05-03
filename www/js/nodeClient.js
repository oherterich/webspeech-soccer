var socket = io.connect( window.location.hostname + ":9000" ); //for heroku
//var socket = io.connect( 'http://localhost:8080' ); //for working locally

var players = [];
var team1Count, team2Count;

var Player = function( id, color, name, team ) {
	this.id = id;
	this.color = color;
	this.name = name;
	this.team = team;
}

socket.on( 'new player', function (data) {
	var p = new Player( data.id, data.color, data.name, data.team );
	players.push( p );

	if (data.team == 1) {
		team1Count++;
		team1NumPlayers.innerHTML = team1Count;
	}
	else {
		team2Count++;
		team2NumPlayers.innerHTML = team2Count;
	}

	console.log(players);
});

socket.on( 'team count', function (data) {
	team1Count = data.team1;
	team2Count = data.team2;
	team1InitPlayers.innerHTML = team1Count;
	team2InitPlayers.innerHTML = team2Count;
	team1NumPlayers.innerHTML = team1Count;
	team2NumPlayers.innerHTML = team2Count;
});

socket.on( 'ball attributes', function (data) {
	ball.pos.x = data.posX;
	ball.pos.y = data.posY;
	ball.vel.x = data.velX;
	ball.vel.y = data.velY;
	ball.acc.x = data.accX;
	ball.acc.y = data.accY;
});

socket.on( 'player disconnect', function (data) {
	console.log('disconnect!');
	for ( var i = 0; i < players.length; i++ ) {
		if ( data.id == players[i].id ) {
			console.log( team1Count + " | " + team2Count );
			if ( players[i].team == 1 ) {
				team1Count--;
				team1NumPlayers.innerHTML = team1Count;
			}
			else {
				team2Count--;
				team2NumPlayers.innerHTML = team2Count;
			}
			players.splice( i, 1 );
		}
	}
});

socket.on( 'new text', function (data) {
	newText( data.id, data.text );
});

socket.on( 'move right', function (data) {
	ball.acc.x += 3.0;
	ballMoved("RIGHT", data.name, data.team, data.color);
});

socket.on( 'move left', function (data) {
	ball.acc.x -= 3.0;
	ballMoved("LEFT", data.name, data.team, data.color);
});

socket.on( 'move up', function (data) {
	ball.acc.y -= 3.0;
	ballMoved("UP", data.name, data.team, data.color);
});

socket.on( 'move down', function (data) {
	ball.acc.y += 3.0;
	ballMoved("DOWN", data.name, data.team, data.color);
});

socket.on( 'reset ball', function (data) {
	ball.style.display = "block";
	ball.pos.x =  fieldWidth/2;
	ball.pos.y = fieldHeight/2;
	ball.vel.x = 0;
	ball.vel.y = 0;
	ball.acc.x = 0;
	ball.acc.y = 0;

	goalScored.innerHTML = "";
});

socket.on( 'timer', function (data) {
	timer.innerHTML = "The game started " + data.minutes + " minutes and " + data.seconds + " seconds ago";
});

var newText = function ( id, text ) {
	// var newParagraph = document.createElement('p');
 //    newParagraph.innerHTML = text;
 //    document.getElementById('results').appendChild(newParagraph);

 //    for ( var i = 0; i < users.length; i++ ) {
	// 	if ( users[i].id == id ) {
	// 		newParagraph.style.color = users[i].color;	
	// 	}
	// }

	//console.log( "new text: " + text );

	// if ( text == 'right' ) {
	// 	ball.acc.x += 3.0;
	// 	console.log('right');
	// }
	// else if ( text == 'left' ) {
	// 	ball.acc.x -= 3.0;
	// 	console.log('left');
	// }
	// else if ( text == 'up' ) {
	// 	ball.acc.y -= 3.0;
	// 	console.log('up');
	// }
	// else if ( text == 'down' ) {
	// 	ball.acc.y += 3.0;
	// 	console.log('down');
	// }
}

var sendText = function( text ) {
	socket.emit( 'new text', { text: text } );
}

var ballMoved = function( direction, name, team, color ) {
	var p = document.createElement( 'p' );
	p.innerHTML = name + ": " + direction;
	p.style.color = color;

	if ( team == 1 ) {
		team1Moves.appendChild(p);
		team1Moves.scrollTop = p.offsetTop;
	}
	else {
		team2Moves.appendChild(p);
		team2Moves.scrollTop = p.offsetTop;
	}
}


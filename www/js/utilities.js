var login = document.getElementById('login');
var nameDiv = document.getElementById('name');
var nameInput = document.getElementById('name-input');
var userName = document.getElementById('user-name');
var team = document.getElementById('team');
var team1Button = document.getElementById('team1-button');
var team2Button = document.getElementById('team2-button');
var start = document.getElementById('start');
var userTeam = document.getElementById('user-team');

var team1 = document.getElementById('team1');
var team1Scoreboard = document.getElementById('team1-score');
var team1Moves = document.getElementById('team1-moves');
var team1InitPlayers = document.getElementById('team1-initplayers');
var team1NumPlayers = document.getElementById('team1-numplayers');
var team1Score = 0;

var team2 = document.getElementById('team2');
var team2Scoreboard = document.getElementById('team2-score');
var team2Moves = document.getElementById('team2-moves');
var team2InitPlayers = document.getElementById('team2-initplayers');
var team2NumPlayers = document.getElementById('team2-numplayers');
var team2Score = 0;

var gameScreen = document.getElementById('game');
var goalScored = document.getElementById('goal-scored');
var timer = document.getElementById('timer');

var pallette = ["#014261", "#699A81", "#BD9E65", "#C27860", "#506C81"];
var rand = Math.floor(Math.random() * pallette.length);
login.style.background = pallette[rand];

window.addEventListener( 'keyup', function ( evt ) {
	switch ( evt.keyCode ) {
		case 37:
			ball.acc.x -= 3.0;
			break;

		case 38:
			ball.acc.y -= 3.0;
			break;

		case 39:
			ball.acc.x += 3.0;
			break; 

		case 40:
			ball.acc.y += 3.0;
			break;
	}
});

nameInput.addEventListener('keyup', function( evt ) {
	evt.preventDefault();

	if ( evt.keyCode == 13 ) {
		nameDiv.classList.remove('visible');
		nameDiv.classList.add('hidden');

		team.classList.remove('hidden');
		team.classList.add('visible');

		userName.innerHTML = nameInput.value.toUpperCase();

		var rand = Math.floor(Math.random() * pallette.length);
		login.style.background = pallette[rand];

		socket.emit( 'player name', { name: nameInput.value.toUpperCase() })
	}
});

team1Button.addEventListener('click', function( evt ) {
	team.classList.remove('visible');
	team.classList.add('hidden');

	start.classList.remove('hidden');
	start.classList.add('visible');

	userTeam.innerHTML = "TEAM 1";

	var rand = Math.floor(Math.random() * pallette.length);
	login.style.background = pallette[rand];

	socket.emit( 'player team', { team: 1 } );

});

team2Button.addEventListener('click', function( evt ) {
	team.classList.remove('visible');
	team.classList.add('hidden');

	start.classList.remove('hidden');
	start.classList.add('visible');

	userTeam.innerHTML = "TEAM 2";

	var rand = Math.floor(Math.random() * pallette.length);
	login.style.background = pallette[rand];

	socket.emit( 'player team', { team: 2 } );
});

var showField = function() {
	login.classList.remove('visible');
	login.classList.add('hidden');

	game.classList.remove('hidden');
	game.classList.add('visible');
}

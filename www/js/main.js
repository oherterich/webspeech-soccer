//Speech Stuff
var final_transcript = '';
var recognizing = false;
var ignore_onend;
var start_timestamp;

//Field Stuff
var fieldWidth = 800;
var fieldHeight = 500;
var field = document.getElementById('field');
field.style.width = fieldWidth;
field.style.height = fieldHeight;

//Ball Stuff
var ball = document.getElementById('ball');
ball.size = 25.0;
ball.pos = { x: fieldWidth/2 - ball.size/2, y: fieldHeight/2 - ball.size/2 };
ball.vel = { x: 0.0, y: 0.0 };
ball.acc = { x: 0.0, y: 0.0 };
ball.style.width = ball.size;
ball.style.height = ball.size;
var damping = 0.97;

var goalHeight = 150; //Change this if css changes for the goal class.

if (!('webkitSpeechRecognition' in window)) {
  console.log("wrong browser!");
} else {
  var recognition = new webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onstart = function() {
    recognizing = true;
    showInfo('info_speak_now');
    showField();

    socket.emit( 'add player' );

    //reset our team count to prepare for adding all the new players.
    team1Count = 0; 
    team2Count = 0;
  };

  recognition.onerror = function(event) {
    if (event.error == 'no-speech') {
      showInfo('info_no_speech');
      ignore_onend = true;
    }
    if (event.error == 'audio-capture') {
      showInfo('info_no_microphone');
      ignore_onend = true;
    }
    if (event.error == 'not-allowed') {
      if (event.timeStamp - start_timestamp < 100) {
        showInfo('info_blocked');
      } else {
        showInfo('info_denied');
      }
      ignore_onend = true;
    }
  };

recognition.onresult = function(event) {
    var interim_transcript = '';
    if (typeof(event.results) == 'undefined') {
      recognition.onend = null;
      recognition.stop();
      return;
    }
    for (var i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        var text = event.results[i][0].transcript.replace(" ", "");
        final_transcript.innerHTML = text;
        //var newParagraph = document.createElement('p');
        //newParagraph.innerHTML = text;
        //document.getElementById('results').appendChild(newParagraph);
        //newParagraph.style.color = players[0].color;

        sendText( text );
      } 
      else {
        interim_transcript += event.results[i][0].transcript;
      }
    }
    interim_span.innerHTML = interim_transcript;
  };
}

function startButton(event) {
  if (recognizing) {
    recognition.stop();
    return;
  }
  final_transcript = '';
  recognition.lang = 'en-US';
  recognition.start();
  ignore_onend = false;
  final_span.innerHTML = '';
  interim_span.innerHTML = '';
}

function showInfo(s) {
  if (s) {
    for (var child = info.firstChild; child; child = child.nextSibling) {
      if (child.style) {
        child.style.display = child.id == s ? 'inline' : 'none';
      }
    }
    info.style.visibility = 'visible';
  } else {
    info.style.visibility = 'hidden';
  }
}

var first_char = /\S/;
function capitalize(s) {
  return s.replace(first_char, function(m) { return m.toUpperCase(); });
}

function animate() {

  ball.vel.x += ball.acc.x;
  ball.vel.y += ball.acc.y;
  ball.pos.x += ball.vel.x;
  ball.pos.y += ball.vel.y;

  ball.style.left = ball.pos.x;
  ball.style.top = ball.pos.y;

  ball.vel.x *= damping;
  ball.vel.y *= damping;
  ball.acc.x = 0.0;
  ball.acc.y = 0.0;

  checkBoundaries();
  checkGoal();

  requestAnimationFrame( animate );
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

function checkGoal() {
  //Team 1 Goal
  if ( ball.pos.x <= 0 && ball.pos.y > fieldHeight/2 - goalHeight/2 && ball.pos.y < fieldHeight/2 + goalHeight/2 - ball.size/2 ) {
    goal( 2 ); //Team 2 scored in Team 1's goal
  }

  //Team 2 Goal
  if ( ball.pos.x >= fieldWidth - ball.size && ball.pos.y > fieldHeight/2 - goalHeight/2 && ball.pos.y < fieldHeight/2 + goalHeight/2 - ball.size ) {
    goal( 1 ); // Team 1 scored in Team 2's goal
  }
}

function resetBall( num ) {
  
}

function goal( team ) {
  if ( team == 1 ) {
    goalScored.innerHTML = "TEAM " + team + " HAS SCORED";
    team1Score++;
    team1Scoreboard.innerHTML = team1Score;
  }
  else {
    goalScored.innerHTML = "TEAM " + team + " HAS SCORED";
    team2Score++;
    team2Scoreboard.innerHTML = team2Score;
  }

  ball.style.display = "none";

  socket.emit( 'goal scored', { team: team } );
}

animate();
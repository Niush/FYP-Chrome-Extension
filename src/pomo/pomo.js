// Thanks to - Eric Arbour - https://codepen.io/earbour1/pen/JEggNY
// Forked and edited

//global variables
var seconds = 59;
var time;
var seMinutes = localStorage.getItem('seMinutes')==null?25:parseInt(localStorage.getItem('seMinutes'));
var minutes = seMinutes;
var brMinutes = localStorage.getItem('brMinutes')==null?5:parseInt(localStorage.getItem('brMinutes'));
var period = "session";
var seWidth = (seMinutes / (seMinutes + brMinutes)) * 100; 
var brWidth = (brMinutes / (seMinutes + brMinutes)) * 100;
var done = 0;
var progWidth = 0;
var sounds = {
  sessionStart: document.createElement('audio'),
  breakStart: document.createElement('audio')
};

function showNotification(titleInput, messageInput){
	chrome.notifications.create({
		type: 'basic',
		message: messageInput,
		iconUrl: '../../icons/icon128.png',
		title: titleInput,
		priority: 2,
		requireInteraction: false,
	}, function(noti_id){
		if(localStorage.hasOwnProperty('play_notification_sound') && localStorage.getItem('play_notification_sound') == "false"){
			console.log('Silent Pomodoro Notify Shown');
		}else{
			let notificationSound = new Audio('../../sound/notification.ogg');
			notificationSound.play();
		}
		
		setTimeout(function(){
			chrome.notifications.clear(noti_id);
		}, 5000);
	});
}

//function for the coundown display
function timer () {
  window.onbeforeunload = function(){
	return 'Are you sure you want to leave?';
  };
	
  //disable relevant change buttons upon pressing of start button
  if (period == "session") {
    $('.se').attr('disabled', true);
    $('.br').attr('disabled', false);
    if (minutes == seMinutes) {
      $('.wText').fadeIn("slow"); 
      //sounds.sessionStart.play();
	  showNotification('Work Session Start', "Good Luck");
    }
  } else {
    $('.br').attr('disabled', true);
    $('.se').attr('disabled', false);
    if (minutes == brMinutes) {
      $('.bText').fadeIn("slow"); 
      //sounds.breakStart.play();
	  showNotification('Break Start', 'Drink water and look outside your window');
    }
  }
  //start interval
  time = setInterval(function() {
  if (period == "session" && minutes == seMinutes) {
    $('.wText').fadeIn("slow");
  } else  if (period == "break" && minutes == brMinutes) {
    $('.bText').fadeIn("slow");
  }
    //initial minute decrement
  if (seconds == 59) {
    minutes -= 1;
  }
    //cycle to next period type and set at minute:00
  if (minutes == -1) {
    if (period == "session") {
      period = "break";
      minutes = brMinutes;
      $('.test').text(brMinutes + ":00");
	  $('#total_se').text(parseInt($('#total_se').text().split(' ')[0]) + 1 + " min");
      $('.bText').fadeIn("slow");
      //sounds.breakStart.play();
	  showNotification('Break Start', 'Get yourself Cool down');
      $('.br').attr('disabled', true);
      $('.se').attr('disabled', false);
    }
    else {
      period = "session";
      minutes = seMinutes;
      $('.test').text(seMinutes + ":00");
	  $('#total_br').text(parseInt($('#total_br').text().split(' ')[0]) + 1 + " min");
      $('.wText').fadeIn("slow");
      //sounds.sessionStart.play();
	  showNotification('Work Session Start', "Here we go again...");
      $('.se').attr('disabled', true);
      $('.br').attr('disabled', false);
      done = 0;
    }
    //normal second decrement 
  } else {
    if (period == "session") {
      $('.se').attr('disabled', true);
      $('.br').attr('disabled', false);
    } else {
      $('.br').attr('disabled', true);
      $('.se').attr('disabled', false);
    }
    $('.test').text((minutes > 9 ? minutes : "0" + minutes) + ":" + (seconds === 0 ? "00" : (seconds > 9 ? seconds : "0" + seconds)));
    if (seconds == 55) {
      $('.banText').fadeOut("slow");
    }
    seconds -= 1;
    if (seconds < 0) {
      seconds = 59;
    }
  done += 1;
  }
  barFill();
  }, 1000);
}
//pauses interval, keeps variables the same. 
function clear () {
  clearInterval(time);
  $('.se').attr('disabled', false);
  $('.br').attr('disabled', false);
  $('.banText').hide();
  window.onbeforeunload = null;
}
//controls progress bar movement
function barFill () {
  localStorage.setItem('seMinutes',seMinutes);
  localStorage.setItem('brMinutes',brMinutes);
	
  progWidth = (done / ((seMinutes + brMinutes) * 60) * 100);
  if (progWidth > 99.5) {
    $('.progBar').css({"border-bottom-right-radius": "13px", "border-top-right-radius": "13px"});
  }
  else {
    $('.progBar').css({"border-bottom-right-radius": "0px", "border-top-right-radius": "0px"});
  }
  $('.progBar').width(progWidth + "%");
}
//Jquery
$(document).ready(function() {
  //Sets initial display
  //sounds.sessionStart.setAttribute('src', 'https://s3.amazonaws.com/freecodecamp/simonSound4.mp3');
  //sounds.breakStart.setAttribute('src', 'https://s3.amazonaws.com/freecodecamp/simonSound1.mp3');
  $('.seBar').width(seWidth + "%");
  $('.brBar').width(brWidth + "%");
  $('.seLength').text("Session: " + seMinutes + " minute(s)");
  $('.brLength').text("Break: " + brMinutes + " minute(s)");
  $('.test').text((minutes > 9 ? minutes : "0" + minutes) + ":00");
  //Starts/pauses timer
  $('.start').click(function() {
    if ($('.start').text() == "Start") {
      timer();
      $('.start').text("Pause");
    }
    else {
      clear();
      $('.start').text("Start");
    }
  });
  //Restart button
  $('.restart').click(function() {
	window.onbeforeunload = null;
    period = "session";
    seconds = 59;
    minutes = seMinutes;
    $('.seLength').text("Session: " + seMinutes + " minute(s)");
    $('.brLength').text("Break: " + brMinutes + " minute(s)");
    $('.test').text((minutes > 9 ? minutes : "0" + minutes) + ":00");
    clearInterval(time);
    $('.se').attr('disabled', false);
    $('.br').attr('disabled', false);
    $('.start').text("Start");
    done = 0;
    barFill();
  });
  //click to increase session
  $('.sePlus').click(function() {
    if (seMinutes >= 1) {
      seMinutes += 1;
      $('.seLength').text("Session: " + seMinutes + " minute(s)");
      if (period == "session") {
        minutes = seMinutes;
        seconds = 59;
        $('.test').text((minutes > 9 ? minutes : "0" + minutes) + ":00");
        done = 0;
      } else {
        done += 60;
      } 
      seWidth = (seMinutes / (seMinutes + brMinutes)) * 100; 
      brWidth = (brMinutes / (seMinutes + brMinutes)) * 100;
      $('.seBar').width(seWidth + "%");
      $('.brBar').width(brWidth + "%");
      barFill();
    } 
  });
  //click to decrease session
  $('.seMin').click(function() {
    if (seMinutes > 1) {
      seMinutes -= 1;
      $('.seLength').text("Session: " + seMinutes + " minute(s)");
      if (period == "session") {
        minutes = seMinutes;
        seconds = 59;
        $('.test').text((minutes > 9 ? minutes : "0" + minutes) + ":00");  
        done = 0;
      } else {
        done -= 60;
      }
      seWidth = (seMinutes / (seMinutes + brMinutes)) * 100; 
      brWidth = (brMinutes / (seMinutes + brMinutes)) * 100;
      $('.seBar').width(seWidth + "%");
      $('.brBar').width(brWidth + "%");
      barFill();
    }
  });
  //click to increase break
  $('.brPlus').click(function() {
    if (brMinutes >= 1) {
      brMinutes += 1;
      $('.brLength').text("Break: " + brMinutes + " minute(s)");
      if (period == "break") {
        minutes = brMinutes;
        seconds = 59;
        $('.test').text((minutes > 9 ? minutes : "0" + minutes) + ":00");  
        done = seMinutes * 60;
      } 
      seWidth = (seMinutes / (seMinutes + brMinutes)) * 100; 
      brWidth = (brMinutes / (seMinutes + brMinutes)) * 100;
      $('.seBar').width(seWidth + "%");
      $('.brBar').width(brWidth + "%");
      barFill();
    }
  });
  //click to decrease break
  $('.brMin').click(function() {
    if (brMinutes > 1) {
      brMinutes -= 1;
      $('.brLength').text("Break: " + brMinutes + " minute(s)");
      if (period == "break") {
        minutes = brMinutes;
        seconds = 59;
        $('.test').text((minutes > 9 ? minutes : "0" + minutes) + ":00");  
        done = seMinutes * 60;
      }
      seWidth = (seMinutes / (seMinutes + brMinutes)) * 100; 
      brWidth = (brMinutes / (seMinutes + brMinutes)) * 100;
      $('.seBar').width(seWidth + "%");
      $('.brBar').width(brWidth + "%");
      barFill();
    }
  });
});
Pusher.logToConsole = true;
let u = new User();
//Replace with the correct information.
var APP_KEY = "1b78202b78dfba90f0ef"; 
var CLUSTER = 'ap2';
var CHANNEL = 'channel';
var URL = 'https://example.com'.toLowerCase();
var ENCODED_URL = encodeURIComponent('https://example.com').toLowerCase();
$('#url').html(URL);

if(URL.length < 0 || URL == '' || URL.match(/(chrome|file|chrome-extension|opera|vivaldi|brave):\/\//gi)){
	window.close();
}

var pusher = new Pusher(APP_KEY, {
  //encrypted: true,
  cluster:  CLUSTER,
  forceTLS: true
});

var channel = pusher.subscribe( CHANNEL );

//listen for connection...
channel.bind('my-event-'+ENCODED_URL, function(data) {
  echo_message(data.message, data.user_id);
});

function echo_message(msg, user_id){
	//if(user_id == u.user_id){
	if(user_id == $("#name").val()){
		$("#chat-message").append(
			'<div class="message-container message-container-me">'+
				'<div class="message">'+msg+'</div>'
			+'</div>'
		);
	}else{
		$("#chat-message").append(
			'<div class="message-container">'+
				'<div class="message">'+msg+'</div>'
			+'</div>'
		);
	}
	
	$("#chat-message").animate({ scrollTop: $("#chat-message").height() }, 'fast');
	
	$('.sender-name').off('click');
	$('.sender-name').click(function(){
		$("#message").val($("#message").val() + "@"+$(this).html()+" ");
	});
	
	if(msg.search('@'+$("#name").val()) >= 0){
		let oldtitle = document.title;
		let mentionBlink = setInterval(function(){
			if(document.title == oldtitle){
				document.title = 'New Mention - ' + oldtitle;
			}else{
				document.title = oldtitle;
			}
		}, 2000);
		window.onmousemove = function(){
			document.title = oldtitle;
			window.onmousemove = null;
			clearInterval(mentionBlink);
		};
	}
}

$("#submit-message").submit( function(e) {
    e.preventDefault();
	
	$("#message").attr("disabled", true);
	$("#send-btn").attr("disabled", true);

	if($("#name").val().length < 3){
		$('#error').html('Min 5 Letter in Username Required');
		return;
	}else if($("#message").val() == '' || $("#message").val() == null){
		$('#error').html('Fill Message Properly');
		return;
	}
	
	var username = '<small class="sender-name">'+$("#name").val()+'</small><br />';
	var message  = username + ($("#message").val()).slice(0,255);

	if($("#message").val().length > 255){
		$('#error').html('255 Character limit in 1 Message\nTrimming the Message and Sending...');
	}
	
	//$.post(HOST+'/api/message', {username: username, message: message, token: u.passphrase, user_id: u.user_id }, function(data){
	$.post(HOST+'/api/message', {url: ENCODED_URL, username: username, message: message, token: u.passphrase, user_id: $("#name").val() }, function(data){
		$("#message").val('');
		$("#message").attr("disabled", true);
		$("#send-btn").attr("disabled", true);
		$("#name").attr("disabled", true);
		$('#error').html('');
		
		let wait = 3;
		let msgWaiter = setInterval(function(){
			$('#error').css('color','orange');
			$("#message").attr("disabled", true);
			$('#error').html('Wait ' + wait +' sec....');
			wait--;
			if(wait < 0){
				$("#message").attr("disabled", false);
				$("#send-btn").attr("disabled", false);
				$('#error').css('color','initial');
				$('#error').html('');
				clearInterval(msgWaiter);
			}
		}, 1000);
	}).fail(function() { 
		$('#error').html('Message Sending Failed. Check your Connection.');
		$("#message").attr("disabled", false);
		$("#send-btn").attr("disabled", false);
		setTimeout(function(){
			$('#error').html('Message Sending Failed. Check your Connection.');
		}, 3500);
	});
});
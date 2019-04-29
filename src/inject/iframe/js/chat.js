Pusher.logToConsole = true;

let url_from = new RegExp('[?&]'+encodeURIComponent('url')+'=([^&]*)').exec(location.search);
if(url_from == null){
	window.close();
}

let u = new User(function(){
	if(u.disable_chat_every_where == 1){
		window.close();
	}
	
	if(u.passphrase == '' || u.user_id == '' || u.username == ''){
		alert('Login First to Enable Chat');
		openLogin();
		setTimeout(function(){
			window.close();
		}, 500);
	}else{
		//Replace with the correct information.
		const USERNAME = u.user_name.split(' ')[0] + u.user_id;
		$("#name").val("Username: "+USERNAME);
		$("#name").attr("disabled", true);
		var APP_KEY = "1b78202b78dfba90f0ef"; 
		var CLUSTER = 'ap2';
		var CHANNEL = 'channel';
		const URL = decodeURIComponent(url_from[1]).toLowerCase();
		const ENCODED_URL = encodeURIComponent(decodeURIComponent(url_from[1])).toLowerCase();
		$('#url').html(URL);
		$('#url').attr('title',URL);

		if(URL.length < 0 || URL == '' || URL.match(/(chrome|file|chrome-extension|opera|vivaldi|brave):\/\//gi)){
			window.close();
		}

		//history.pushState(null, null, 'chat.html');
		$('body').css({'opacity': '1', 'visibility': 'visible'});
		
		var pusher = new Pusher(APP_KEY, {
		  //encrypted: true,
		  cluster:  CLUSTER,
		  forceTLS: true
		});

		var channel = pusher.subscribe( CHANNEL );

		//listen for connection...
		channel.bind('my-event-'+ENCODED_URL, function(data) {
		  echo_message(data.message, data.username);
		});

		let mentionBlink;
		function echo_message(msg, username){			
			let senderName = document.createElement('small');
			senderName.className = "sender-name";
			senderName.textContent = username;
			
			let messageContent = document.createElement('span');
			messageContent.textContent = msg;
			if(msg == "👍"){
				messageContent.className = 'like';
			}
			
			let messageContainer = document.createElement('div');
			if(username == USERNAME){
				messageContainer.className = "message-container message-container-me";
			}else{
				messageContainer.className = "message-container";
			}
			
			let messageChild = document.createElement('div');
			messageChild.className = "message";
			if(msg == "👍"){
				messageChild.className = "message likeContainer";
			}
			
			messageChild.append(senderName);
			messageChild.append(document.createElement('br'));
			messageChild.append(messageContent);
			
			messageContainer.append(messageChild);
			$("#chat-message").append(messageContainer);
			
			$("#chat-message").animate({ scrollTop: $("#chat-message").height() }, 'fast');
			
			$('.sender-name').off('click');
			$('.sender-name').click(function(){
				$("#message").val($("#message").val() + "@"+$(this).html()+" ");
				$("#message").focus();
			});

			if(username != USERNAME && msg.search('@'+USERNAME) >= 0){
				let oldtitle = document.title;
				clearInterval(mentionBlink);
				mentionBlink = setInterval(function(){
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
				
				if(localStorage.hasOwnProperty('play_notification_sound') && localStorage.getItem('play_notification_sound') == "false"){
					console.log('Silent New Mention Message');
				}else{
					let notificationSound = new Audio('../../../../sound/notification.ogg');
					notificationSound.play();
				}
			}
		}
		
		$("#like-btn").click(function() {
			let oldVal = $("#message").val();
			$("#message").val('👍');
			$("#submit-message").submit();
			$("#message").val(oldVal);
		});

		$("#submit-message").submit( function(e) {
			e.preventDefault();
			
			$('#error').html('<span style="font-weight: 500; color: green;">Sending.....</span>');
			
			$("#message").attr("disabled", true);
			$("#send-btn").attr("disabled", true);
			$("#like-btn").attr("disabled", true);

			if(USERNAME.length < 3){
				$('#error').html('Min 5 Letter in Username Required');
				return;
			}else if($("#message").val().trim() == '' || $("#message").val().trim() == null){
				$('#error').html('Fill Message Properly');
				return;
			}
			
			//var span = document.createElement("span");
			//span.innerHTML = ($("#message").val()).slice(0,255);
			
			//var username = '<small class="sender-name">'+USERNAME+'</small><br />';
			//var message  = username + span.textContent;
			
			var message  = ($("#message").val().trim()).slice(0,255);
			
			if($("#message").val().trim().length > 255){
				$('#error').html('255 Character limit in 1 Message\nTrimming the Message and Sending...');
			}
			
			let takingLongerThenUsual = setTimeout(function(){
				$('#error').html('Sending.....Is taking Longer then usual..');
			}, 3000);
			
			//$.post(HOST+'/api/message', {username: username, message: message, token: u.passphrase, user_id: u.user_id }, function(data){
			$.post(HOST+'/api/message', {url: ENCODED_URL, username: USERNAME, message: message, token: u.passphrase }, function(data){
				clearTimeout(takingLongerThenUsual);
				$("#message").val('');
				$("#message").attr("disabled", true);
				$("#send-btn").attr("disabled", true);
				$("#like-btn").attr("disabled", true);
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
						$("#like-btn").attr("disabled", false);
						$('#error').css('color','initial');
						$('#error').html('');
						clearInterval(msgWaiter);
					}
				}, 1000);
			}).fail(function() { 
				clearTimeout(takingLongerThenUsual);
				$('#error').html('Message Sending Failed. Check your Connection.');
				$("#message").attr("disabled", false);
				$("#send-btn").attr("disabled", false);
				$("#like-btn").attr("disabled", false);
				setTimeout(function(){
					$('#error').html('Message Sending Failed. Check your Connection.');
				}, 3500);
			});
		});		
	}
});

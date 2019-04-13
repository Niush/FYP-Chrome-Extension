Pusher.logToConsole = true;

//Replace with the correct information.
var APP_KEY = "1b78202b78dfba90f0ef"; 
var CLUSTER = 'ap2';
var CHANNEL = 'channel';

    var pusher = new Pusher(APP_KEY, {
      encrypted: true,
      cluster:  CLUSTER
    });

    var channel = pusher.subscribe( CHANNEL );

    //listen for connection...
    channel.bind('my-event', function(data) {
      echo_message(data.message);
    });

    function echo_message(msg){
		$("#chat-message").append(
			'<div class="card-panel">'+
			  msg
			+'</div>'
		);
    }

$("#submit-message").submit( function(e) {
    e.preventDefault();

	var username = '<b>'+$("#name").val()+'</b><br />';
	var message  = username + $("#message").val();

	$.post(HOST+'/message', {message: message}, function(data){
		$("#message").val('');
		$("#name").attr("disabled", true);
	});
});
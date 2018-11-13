/*Scripts can also be ran here*/
//document.getElementsByTagName('body')[0].style.opacity = "0.5";
chrome.storage.local.get(function(result){console.log(result)});

/*****CLEAR CHROME.STORAGE*****/
/* chrome.storage.local.clear(function() {
    var error = chrome.runtime.lastError;
    if (error) {
        console.error(error);
    }else{
		console.log('Clearned NS');
	}
}); */

/* chrome.storage.local.remove(["Key1","key2"],function(){
 var error = chrome.runtime.lastError;
    if (error) {
        console.error(error);
    }
}) */
/*******************************/

/*******************
CODES TO RUN BEFORE ON LOAD
1)Checking DIM
*******************/
chrome.storage.local.get('NS_dim', function(items) {
   if(items.NS_dim == true){
		var overlay = document.createElement("div");
		overlay.className = "ns_overlay";
		document.getElementsByTagName("html")[0].appendChild(overlay);
   }
});

/************************************/
/*---- WINDOW ON LOAD RUNS HERE ----*/
// ALMOST ALL OTHER ARE AFTER WINDOW LOAD//
/***********************************/
window.onload=function(){
	/*******************
	 IMPORTING Store.js
	*******************/
	var js = document.createElement("script");
	js.type = "text/javascript";
	js.src = "/js/store/store.legacy.min.js";
	document.body.appendChild(js);

	/**********************************************
	ON Load HTML display changer ketp just in case
	**********************************************/
	//_ini();
	/*function _ini(){
		document.getElementsByTagName("html")[0].style.display="none";
		window.onload=function(){
			//do your stuff
			document.getElementsByTagName("html")[0].style.display="block"; //to show it all back again
		}
	}*/

	/**********************************************
				INJECT THE CHAT IFRAME
	**********************************************/
	// FIRST CHECK THE URLs //
	//console.log(window.location);
	var hostname = window.location.hostname;
	var formatted_hostname = hostname.replace("www.", "");

	var chatoff_url = ['google.com','google.com.np','google.com.in','google.com.fr','facebook.com','youtube.com','instagram.com','github.com','codepen.io','twitter.com','reddit.com','tumblr.com','flickr.com','plus.google.com','linkedin.com','vk.com','weibo.com','gitlab.com'];
	var chatoff_here = false;

	chrome.storage.local.get('NS_chatoff', function(items) {
	   chatoff_url = items.NS_chatoff;
	});

	for(let i = 0 ; i < chatoff_url.length ; i++){
		if(formatted_hostname == chatoff_url[i]){
			chatoff_here = true;
		}
	}

	if(chatoff_here == false){
		injectTheChat(); //Inject The Chat//
	}else{
		console.log("Live Chats and Similar Features are turned off for this page.");
	}

	function injectTheChat(){
		var chat_ball = document.createElement("div");
		chat_ball.className = "";
		document.getElementsByTagName("body")[0].appendChild(chat_ball);
	}


}//ON WINDOW LOAD END *|*|*|*|* //



/******ON PAGE LOAD CODE PROVIDED BY THE extensionizr*****/
/* chrome.extension.sendMessage({}, function(response) {
	var readyStateCheckInterval = setInterval(function() {
	if (document.readyState === "complete") {
		clearInterval(readyStateCheckInterval);

		// ----------------------------------------------------------
		// This part of the script triggers when page is done loading
		console.log("Hello. This message was sent from scripts/inject.js");
		// ----------------------------------------------------------

	}
	}, 10);
}); */
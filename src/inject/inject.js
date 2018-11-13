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
		chatFloatingScript();
	}else{
		console.log("Live Chats and Similar Features are turned off for this page.");
	}

	function injectTheChat(){
		var chat_ball = document.createElement("span");
		chat_ball.innerHTML = `<div class="mydiv mydivheader" id="mydiv">
								  <div style="display:flex;justify-content:space-evenly;align-items:center;height:30px;width:60px;">
									<div id="note">N</div><div id="chat">C</div>
								  </div>
								  
								  <div class="message" id="message">
									<iframe src="http://www.blankwebsite.com/"></iframe>
								  </div>
								  
								  <div class="note" id="notes">
									<iframe src="https://www.example.com"></iframe>
								  </div>
								</div>`;
		document.getElementsByTagName("body")[0].appendChild(chat_ball);
	}
	
	function chatFloatingScript(){
		document.getElementById('message').style.opacity = "0";
		document.getElementById('notes').style.opacity = "0";
		var dragging = false;
		var prevTop = "5px";
		var prevLeft = "10px";
		var NOpened = false;
		var COpened = false;

		document.getElementById('chat').onmouseup = function(){
			if(dragging === true && NOpened === false){
			  if(document.getElementById('message').style.opacity == "0"){
				  document.getElementById('message').style.opacity = "1";
				  document.getElementById('message').style.transform = "scale(1)";
				  
				  document.getElementById('mydiv').style.transition = "all 0.3s ease"; 
				  document.getElementById('mydiv').style.top = "5px";
				  document.getElementById('mydiv').style.left = "15px";
				  setTimeout(function(){
					document.getElementById('mydiv').style.transition = "all 0.01s linear"; 
				  },310);
				  
				  COpened = true;
				  document.getElementById('note').style.opacity = "0.2";
			  }else{
				  document.getElementById('message').style.opacity = "0";
				  document.getElementById('message').style.transform = "scale(0)";
				  
				  document.getElementById('mydiv').style.transition = "all 0.3s ease"; 
				  document.getElementById('mydiv').style.top = prevTop;
				  document.getElementById('mydiv').style.left = prevLeft;
				  setTimeout(function(){
					document.getElementById('mydiv').style.transition = "all 0.01s linear"; 
				  },310); 
				  
				  COpened = false;
				  document.getElementById('note').style.opacity = "1";
			  }
			  
			}
		};

		document.getElementById('note').onmouseup = function(){
			if(dragging === true && COpened === false){
			  if(document.getElementById('notes').style.opacity == "0"){
				  document.getElementById('notes').style.opacity = "1";
				  document.getElementById('notes').style.transform = "scale(1)";
				  
				  document.getElementById('mydiv').style.transition = "all 0.3s ease"; 
				  document.getElementById('mydiv').style.top = "5px";
				  document.getElementById('mydiv').style.left = "15px";
				  setTimeout(function(){
					document.getElementById('mydiv').style.transition = "all 0.01s linear"; 
				  },310);
				   
				  NOpened = true;
				  document.getElementById('chat').style.opacity = "0.2";
			  }else{
				  document.getElementById('notes').style.opacity = "0";
				  document.getElementById('notes').style.transform = "scale(0)";
				  
				  document.getElementById('mydiv').style.transition = "all 0.3s ease"; 
				  document.getElementById('mydiv').style.top = prevTop;
				  document.getElementById('mydiv').style.left = prevLeft;
				  setTimeout(function(){
					document.getElementById('mydiv').style.transition = "all 0.01s linear"; 
				  },310); 
				  
				  NOpened = false;
				  document.getElementById('chat').style.opacity = "1";
			  }
			  
			}
		};


		var DocWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

		var DocHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

		window.addEventListener('resize', function () {
			DocWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
			
			DocHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
			
			var top = parseInt(document.getElementById("mydiv").style.top.replace("px",''));
			var left = parseInt(document.getElementById("mydiv").style.left.replace("px",''));
			console.log(left);
			console.log(DocWidth);
			if(DocHeight >=  top+30){
				document.getElementById("mydiv").style.top = DocHeight-30;
			}
			
			if(DocWidth <= left+60){
				document.getElementById("mydiv").style.left = DocWidth-30;
			}
		});

		//Make the DIV element draggagle:
		dragElement(document.getElementById("mydiv"));

		function dragElement(elmnt) {
		  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
		  if (document.getElementById(elmnt.id + "header")) {
			/* if present, the header is where you move the DIV from:*/
			document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
		  } else {
			/* otherwise, move the DIV from anywhere inside the DIV:*/
			elmnt.onmousedown = dragMouseDown;
		  }

		  function dragMouseDown(e) {
			dragging = true;
			e = e || window.event;
			e.preventDefault();
			// get the mouse cursor position at startup:
			pos3 = e.clientX;
			pos4 = e.clientY;
			document.onmouseup = closeDragElement;
			// call a function whenever the cursor moves:
			document.onmousemove = elementDrag;
		  }

		  function elementDrag(e) {
			e = e || window.event;
			e.preventDefault();
			// calculate the new cursor position:
			pos1 = pos3 - e.clientX;
			pos2 = pos4 - e.clientY;
			pos3 = e.clientX;
			pos4 = e.clientY;
			// set the element's new position:
			if(elmnt.offsetTop - pos2 >= 0 && elmnt.offsetLeft - pos1 >= 0 && elmnt.offsetLeft - pos1 <= DocWidth-60 && elmnt.offsetTop - pos2 <= DocHeight-30){
			  elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
			  elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
			  
			  prevTop = elmnt.style.top;
			  prevLeft = elmnt.style.left;
			}
			
			dragging = false;
		  }

		  function closeDragElement() {
			/* stop moving when mouse button is released:*/
			document.onmouseup = null;
			document.onmousemove = null;
		  }
		}
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
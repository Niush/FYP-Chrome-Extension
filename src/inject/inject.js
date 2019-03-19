// Wait Inject for some seconds - Except few Things //
function upgradeOrReconnectChanges(){
	var port;

	// Attempt to reconnect
	var reconnectToExtension = function () {
		// Reset port
		port = null;
		// Attempt to reconnect after 1 second
		setTimeout(connectToExtension, 1000 * 1);
	};

	// Attempt to connect
	var connectToExtension = function () {

		// Make the connection
		port = chrome.runtime.connect({name: "my-port"});
		
		// When extension is upgraded or disabled and renabled, the content scripts
		// will still be injected, so we have to reconnect them.
		// We listen for an onDisconnect event, and then wait for a second before
		// trying to connect again. Becuase chrome.runtime.connect fires an onDisconnect
		// event if it does not connect, an unsuccessful connection should trigger
		// another attempt, 1 second later.
		port.onDisconnect.addListener(reconnectToExtension);
	};

	// Connect for the first time
	connectToExtension();
}

setTimeout(function(){
	// NOTE: TODO: IMPORTANT: THIS IS DISABLED ALTHOUGH MIGHT BE NEEDED TO SEE MESSAGE CHANGES - SEEMS TO WORK WITHOUT THIS FOR NOW //
	//upgradeOrReconnectChanges(); //Call on Upgrade and Reconnect - Change Port etc.
	
	function send_message(msg){
		chrome.runtime.sendMessage(
			msg
		);
	}
	
	//On Message Received//
	chrome.runtime.onMessage.addListener(
	  function(request, sender, sendResponse) {
		console.log(sender.tab ?
					"from a content script:" + sender.tab.url :
					"from the extension");
		if(request.action == "lockpage"){
			sendResponse({response: blockLinksWorker()});
		}
	  }
	);

	let pagelock = 0;
	let ablocker;
	let windowCoverContainer;
	function blockLinksWorker(){
		if(pagelock == 0){
			// Disable Pointer Events and Click to all a href links //
			ablocker = document.createElement('style');
			ablocker.type = 'text/css';
			ablocker.innerHTML = `
				a{
					pointer-events: none !important;
					opacity: 0.5;
				}
			`;
			document.getElementsByTagName('head')[0].appendChild(ablocker);
			
			// Create a Layer to prevent any clicks //
			windowCoverContainer = document.createElement('NS-shadow-container-'+new Date().getTime());
			const shadowRoot = windowCoverContainer.attachShadow({mode: 'open'});
			shadowRoot.innerHTML = `
				<style>div{animation: showchange 1s ease forwards;} @keyframes showchange{0%{background: #323232dd;} 100%{background: transparent}}</style>
				<div style="position: absolute !important; width: 100%; height: 100%; top: 0; left: 0; background: transparent; z-index: 999999 !important;"></div>
			`;
			document.getElementsByTagName('body')[0].appendChild(windowCoverContainer);
			
			// Confirm Before Closing this Tab //
			window.onbeforeunload = function(){
			  return confirm('Are you sure you want to leave?');
			};
			
			// Disable Auto Discard - Chrome//
			// Ran in page_action message sender
			
			pagelock = 1;
			return 'Page Lock Mechanism Applied';
		}else{
			document.getElementsByTagName('head')[0].removeChild(ablocker);
			document.getElementsByTagName('body')[0].removeChild(windowCoverContainer);
			window.onbeforeunload = undefined;
			pagelock = 0;
			return 'Page Lock Reverted';
		}
	}


	/*Scripts can also be ran here*/
	//document.getElementsByTagName('body')[0].style.opacity = "0.5";
	//chrome.storage.local.get(function(result){console.log(result)});

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
	/* chrome.storage.local.get('NS_dim', function(items) {
	   if(items.NS_dim == true){
			var overlay = document.createElement("div");
			overlay.className = "ns_overlay";
			document.getElementsByTagName("html")[0].appendChild(overlay);
	   }
	}); */

	/************************************/
	/*---- WINDOW ON LOAD RUNS HERE ----*/
	// ALMOST ALL OTHER ARE AFTER WINDOW LOAD//
	/***********************************/
	window.onload=function(){
		/* SEND AND RECEIVE MESSAGE FROM BACKGROUND.JS */
		/* function getScreenshotId(){
			// Send "screenshot" request and get response back //
			chrome.runtime.sendMessage(
				{action: "screenshot"},
				function(response) {
					console.log(response.response);
				}
			);
		} */
		
		/*--------------*/
		
		/*******************
		 IMPORTING Store.js
		*******************/
		//var js = document.createElement("script");
		//js.type = "text/javascript";
		//js.src = "/js/store/store.legacy.min.js";
		//document.body.appendChild(js);
		
		/*******************
		 IMPORTING Materialize.js
		*******************/
		/* var mat = document.createElement("script");
		mat.type = "text/javascript";
		mat.src = "chrome-extension://"+chrome.runtime.id+"/js/materialize/materialize.min.js";
		document.body.appendChild(mat); */
		/*******************
		 IMPORTING Materialize.css
		*******************/
		/* var matc = document.createElement("link");
		matc.rel = "stylesheet";
		matc.href = "chrome-extension://"+chrome.runtime.id+"/css/materialize.min.css";
		document.body.appendChild(matc); */
		
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
			//injectTheChat(); //Inject The Chat//
			//chatFloatingScript(); //OLD
			//floatingBallsScript();
		}else{
			console.log("Live Chats and Similar Features are turned off for this page.");
		}

		function injectTheChat(){
			var chat_ball = document.createElement("span");
			/* chat_ball.innerHTML = `<div class="mydiv mydivheader" id="mydiv">
									  <div style="display:flex;justify-content:space-evenly;align-items:center;height:30px;width:60px;">
										<div id="note">N</div><div id="chat">C</div>
									  </div>
									  
									  <div class="message" id="message">
										<iframe src="http://www.blankwebsite.com/"></iframe>
									  </div>
									  
									  <div class="note" id="notes">
										<iframe src="https://www.example.com"></iframe>
									  </div>
									</div>`; */
			const shadowRoot = chat_ball.attachShadow({mode: 'open'});

			shadowRoot.innerHTML = `<div class="NS_app_overlay"></div>
									<div class="NS_ball_container">
										<div id="NS_chat_ball" class="NS_balls no_appeal" title="Open Chat">
											<span id="getScreenshot">C</span>	
										</div>
										
										<div class="NS_chat_container" id="NS_chat_container">
												<div class="NS_chat_content" id="NS_chat_frame">
													<!-- Chat Content Goes Here -->
													<div class="NS_chat_log preloadNoAnimation" id="NS_chat_log">
																<!-- preloadNoAnimation for making the first load animation of message not occur -->
																<div class="NS_msg">
																	<div class="NS_chat_message">
																		<div class="NS_message">
																				<p>Hello</p>
																				<small>Bob</small>
																			</div>
																	</div>
																	
																	<div class="NS_chat_composer" id="NS_message_box">
																		<input type="text" placeholder="Message...." id="NS_message_text">
																		<button>Send</button>
																	</div>
																	<div class="NS_chat_empty">
																		No Messages Yet !!!
																	</div>
																</div>

																<div class="NS_msg_loading">Loading...</div>
													</div>
												</div>
												<span class="NS_chat_loading">Loading.</span>
											</div>
										
										<div id="NS_note_ball" class="NS_balls no_appeal" title="Note Keeper">
											<span>N</span>
										</div>
										
										<div class="NS_note_container" id="NS_note_container">
												<div class="NS_note_content" id="NS_note_frame">
													
													<div class="NS_note">
														<div class="NS_note_header">
															<div class="NS_note_title">HA HA HA</div>
															<div class="NS_note_edit" title="Edit">🖉</div>
															<div class="NS_note_delete" title="Delete">🗑</div>
														</div>
														<div class="NS_note_body" title="2018/12/01">Lorem ipsum dolor sit amet consectetur adipisicing elit. Labore aliquid.</div>
													</div>
													
													<div class="NS_note">
														<div class="NS_note_header">
															<input type="text" class="NS_note_title_edit" value="HA HA HA"></input>
															<div class="NS_note_save" title="Save">💾</div>
															<div class="NS_note_delete" title="Delete">🗑</div>
														</div>
														<textarea class="NS_note_body_edit">Lorem ipsum dolor sit amet consectetur adipisicing elit. Labore aliquid.</textarea>
													</div>
													
													<div class="NS_note">
														<div class="NS_note_header">
															<div class="NS_note_title">HA HA HA</div>
															<div class="NS_note_edit" title="Edit">🖉</div>
															<div class="NS_note_delete" title="Delete">🗑</div>
														</div>
														<div class="NS_note_body" title="2018/12/01">Lorem ipsum dolor sit amet consectetur adipisicing elit. Labore aliquid.</div>
													</div>
													
													<div class="NS_note">
														<div class="NS_note_header">
															<div class="NS_note_title">HA HA HA</div>
															<div class="NS_note_edit" title="Edit">🖉</div>
															<div class="NS_note_delete" title="Delete">🗑</div>
														</div>
														<div class="NS_note_body" title="2018/12/01">Lorem ipsum dolor sit amet consectetur adipisicing elit. Labore aliquid.</div>
													</div>
													
													<div class="NS_note">
														<div class="NS_note_header">
															<div class="NS_note_title">HA HA HA</div>
															<div class="NS_note_edit" title="Edit">🖉</div>
															<div class="NS_note_delete" title="Delete">🗑</div>
														</div>
														<div class="NS_note_body" title="2018/12/01">Lorem ipsum dolor sit amet consectetur adipisicing elit. Labore aliquid.</div>
													</div>
													
													<div class="NS_note">
														<div class="NS_note_header">
															<div class="NS_note_title">HA HA HA</div>
															<div class="NS_note_edit" title="Edit">🖉</div>
															<div class="NS_note_delete" title="Delete">🗑</div>
														</div>
														<div class="NS_note_body" title="2018/12/01">Lorem ipsum dolor sit amet consectetur adipisicing elit. Labore aliquid.</div>
													</div>
													
													<div class="NS_note">
														<div class="NS_note_header">
															<div class="NS_note_title">HA HA HA</div>
															<div class="NS_note_edit" title="Edit">🖉</div>
															<div class="NS_note_delete" title="Delete">🗑</div>
														</div>
														<div class="NS_note_body" title="2018/12/01">Lorem ipsum dolor sit amet consectetur adipisicing elit. Labore aliquid.</div>
													</div>
													
												</div>
												<span class="NS_note_loading">Loading.</span>
												<div class="NS_note_composer">
													<input id="NS_note_title" type="text" placeholder="New Note" max="50"><br/>
													<textarea id="NS_note_note" type="text" placeholder="Your Note..." max="10000"></textarea><br/>
													<button id="NS_note_button">Add</button>
													<button id="NS_note_close">Never Mind</button>
												</div>
										</div>
										
									</div>`;
									
			document.getElementsByTagName("body")[0].appendChild(shadowRoot);
		}
		
		
		function floatingBallsScript(){
			var isDown = false; //Mouse Down
			var whichDown = ""; //Which Ball Down C or N
			var isDragging = false; //Is dragging or not
			var DocWidth =
				window.innerWidth ||
				document.documentElement.clientWidth ||
				document.body.clientWidth; //Document Width
			var DocHeight =
				window.innerHeight ||
				document.documentElement.clientHeight ||
				document.body.clientHeight; //Document Height

			//Variables for Chat Ball
			var offsetChatBall = [0, 0]; //Chat Ball Offset
			var chatBall = document.getElementById("NS_chat_ball");
			var chatCacheTop;

			//Variables for Note Ball
			var offsetNoteBall = [0, 0]; //Note Ball Offset
			var noteBall = document.getElementById("NS_note_ball");
			var noteCacheTop;

			//Chat Ball Down Event//
			chatBall.addEventListener(
				"mousedown",
				function(e) {
					event.preventDefault();
					isDown = true;
					isDragging = false;
					whichDown = "c";
					if(!chatOpen){
						offsetChatBall = [
							chatBall.offsetLeft - e.clientX,
							chatBall.offsetTop - e.clientY
						];
						chatBall.style.cursor = "move";
					}
				},
				true
			);

			//Note Ball Down Event//
			noteBall.addEventListener(
				"mousedown",
				function(e) {
					event.preventDefault();
					isDown = true;
					isDragging = false;
					whichDown = "n";
					offsetNoteBall = [
						noteBall.offsetLeft - e.clientX,
						noteBall.offsetTop - e.clientY
					];
					noteBall.style.cursor = "move";
				},
				true
			);

			//Mouse Up Event Stop//
			document.addEventListener(
				"mouseup",
				function() {
					isDown = false;
					whichDown = "";
					chatBall.style.cursor = "pointer";
					noteBall.style.cursor = "pointer";
				},
				true
			);

			//Document Leave Event Stop Ball Move//
			// TODO + NOTE: User can have option in settings to keep moving or not //
			document.addEventListener("mouseleave", function(event) {
					isDown = false;
					whichDown = "";
					chatBall.style.cursor = "pointer";
					noteBall.style.cursor = "pointer";
			});

			//Mouse move Ball Move event - See whichBall and Move as needed//
			//Only Up and Down and Fixed//
			document.addEventListener(
				"mousemove",
				function(e) {
					event.preventDefault();
					if (isDown) {
						isDragging = true;
						if (whichDown == "c") { //If Chat Ball
							if (
								!chatOpen &&
								e.clientY + offsetChatBall[1] >= 5 &&
								e.clientY + offsetChatBall[1] <= DocHeight - 45
							) {
								//divOverlay.style.left = (e.clientX + offset[0]) + 'px';
								chatBall.style.top = e.clientY + offsetChatBall[1] + "px";
								chatCacheTop = e.clientY + offsetChatBall[1] + "px";
								//Save to store.js here for cache position of y;
							}
						} else { //If Note Ball
							if (
								e.clientY + offsetNoteBall[1] >= 5 &&
								e.clientY + offsetNoteBall[1] <= DocHeight - 45
							) {
								//divOverlay.style.left = (e.clientX + offset[0]) + 'px';
								noteBall.style.top = e.clientY + offsetNoteBall[1] + "px";
								noteCacheTop = e.clientY + offsetNoteBall[1] + "px";
								//Save to store.js here for cache position of y;
							}
						}
					}
				},
				true
			);

			/* Note Click to Open Pop Here */
			let noteContainer = document.getElementById('NS_note_container');
			let noteOpen = false; //Chat Open Or Not
			let noteFrameOpenedFirst = false;

			noteBall.onclick = function(){
				if (!isDragging) { //If Not Dragging
					if(noteOpen === false){ //If Chat is not opened = Open
						if(!noteFrameOpenedFirst){
							loadNoteFrame();
							noteFrameOpenedFirst = true;
						}
						noteBall.style.transition = "all 0.5s ease";
						noteBall.style.bottom = "30px";
						noteBall.style.top = "90%";
						
						noteContainer.className += " NS_open";
						noteOpen = true;
						
						//document.getElementsByClassName('NS_app_overlay')[0].className += " NS_overlay_active";
					}else{ //Else = Close
						noteBall.style.transition = "all 0.5s 0.3s ease";
						noteBall.style.top = noteCacheTop;
						setTimeout(function(){
							noteBall.style.transition = "all 0.1s ease-out";
						},505);
						
						noteContainer.className = "NS_note_container";
						noteOpen = false;
						//document.getElementsByClassName('NS_app_overlay')[0].className = "NS_app_overlay";
					} // Weirdies like animations and classname handled too, cause Vanilla JS :) //
				}
			}

			/* Note Task Goes Here */
			let noteFrame = document.getElementById("NS_note_frame");
			noteFrame.style.opacity = 0;
			let noteFrameInnerHTML = ``;

			function loadNoteFrame(){	
				//Note : todo : try check internet then check cross error//
				//chatFrame.innerHTML = chatFrameInnerHTML; //Add the content
				
				document.getElementsByClassName('NS_note_loading')[0].style.display = 'none'; //Hide Loader
				noteFrame.style.opacity = 1; //Show Chat Content
			}




			/* Chat Click to Open Pop Here */
			let chatContainer = document.getElementById('NS_chat_container');
			let chatOpen = false; //Chat Open Or Not
			let chatFrameOpenedFirst = false;

			chatBall.onclick = function(){
				if (!isDragging) { //If Not Dragging
					if(chatOpen === false){ //If Chat is not opened = Open
						if(!chatFrameOpenedFirst){
							loadChatFrame();
							chatFrameOpenedFirst = true;
						}
						chatBall.style.transition = "all 0.5s ease";
						chatBall.style.bottom = "30px";
						chatBall.style.top = "90%";
						
						chatContainer.className += " NS_open";
						chatOpen = true;
						
						document.getElementsByClassName('NS_app_overlay')[0].className += " NS_overlay_active";
					}else{ //Else = Close
						chatBall.style.transition = "all 0.5s 0.3s ease";
						chatBall.style.top = chatCacheTop;
						setTimeout(function(){
							chatBall.style.transition = "all 0.1s ease-out";
						},505);
						
						chatContainer.className = "NS_chat_container";
						chatOpen = false;
						
						document.getElementsByClassName('NS_app_overlay')[0].className = "NS_app_overlay";
					} // Weirdies like animations and classname handled too, cause Vanilla JS :) //
				}
			}

			/* Chat Task Goes Here */
			let chatFrame = document.getElementById("NS_chat_frame");
			chatFrame.style.opacity = 0;
			let chatFrameInnerHTML = ``;

			function loadChatFrame(){	
				//Note : todo : try check internet then check cross error//
				//chatFrame.innerHTML = chatFrameInnerHTML; //Add the content
				
				document.getElementsByClassName('NS_chat_loading')[0].style.display = 'none'; //Hide Loader
				chatFrame.style.opacity = 1; //Show Chat Content
				
				document.getElementsByClassName('NS_msg_loading')[0].className += " NS_hide_loader";
				setTimeout(() => {
					document.getElementsByClassName('preloadNoAnimation')[0].className="NS_chat_log";
					document.getElementsByClassName('NS_msg')[0].className += " NS_show_msg";
				},1000);
			}
		}
		
		// OLD //
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


		/* document.getElementById('NS_note_title').onclick = function(){
			document.getElementsByClassName('NS_note_composer')[0].className += " NS_note_active";
		}; */
		
		/* let c = 0;
		document.getElementById('NS_note_title').onkeyup = function(e){
			if(c === 0){
				document.getElementsByClassName('NS_note_composer')[0].className += " NS_note_active";
				c = 1;
			}
			
			if(e.keyCode == 8 && this.value.length === 0){
				document.getElementsByClassName('NS_note_composer')[0].className = "NS_note_composer";
				c = 0;
			}
		};
		
		document.getElementById('NS_note_close').onclick = function(){
			document.getElementsByClassName('NS_note_composer')[0].className = "NS_note_composer";
			let c = 0;
		}; */
		
		/* Adding CLick event to the Button to send Screenshot Message to Background js */
		/* document.getElementById('getScreenshot').onclick = function(){getScreenshotId();} */
		
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
}, 1500);
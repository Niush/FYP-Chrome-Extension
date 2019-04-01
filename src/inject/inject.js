/* var jq = document.createElement("script");
jq.type = "text/javascript";
jq.src = "chrome-extension://"+chrome.runtime.id+"/js/jquery/jquery.min.js";
document.querySelector('head').appendChild(jq);

var jqu = document.createElement("script");
jqu.type = "text/javascript";
jqu.src = "chrome-extension://"+chrome.runtime.id+"/js/jquery/jquery-ui.min.js";
document.querySelector('head').appendChild(jqu);
 */
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
/***********************************/
/*  CODES TO RUN BEFORE ON LOAD   */
/*********************************/
/***** DIM SCREEN FUNCTIONS *****/
/*******************************/
function dimScreen(){
	if(typeof document.getElementsByTagName('NS-dim-container')[0] === 'undefined'){
		// Dim Container Here //
		let dimContainer = document.createElement('NS-dim-container');
		const shadowRoot = dimContainer.attachShadow({mode: 'open'});
		shadowRoot.innerHTML = `
			<style>div{animation: showchange 0.4s ease forwards;} @keyframes showchange{0%{opacity: 0.1;} 100%{opacity: 0.3;}}</style>
			<div style="pointer-events: none; position: fixed !important; width: 100%; height: 100%; top: 0; left: 0; background: #323232; opacity: 0.3; z-index: 9999999 !important;"></div>
		`;
		document.getElementsByTagName("html")[0].appendChild(dimContainer);
		console.log('DIM Screen Applied');
	}
}
// DIM TIME CHECK MESSAGE //
var dimCheck = function() {
	if(typeof chrome.app.isInstalled!=='undefined'){
		chrome.runtime.sendMessage(null, {action: "dim_time"}, function(response) {
			//check if response arrived//
			if(response) {
				//check response true
				if(response.response == true){
					dimScreen();
				}
			} else {
				setTimeout(dimCheck, 3000);
			}
		});
	}
};
dimCheck();

// CHECK AND WORK WITH FOCUS MODE //
/***** FOCUS URL WORK WITH  *****/
/*******************************/
var focusCheck = function() {
	if(typeof chrome.app.isInstalled!=='undefined'){
		chrome.runtime.sendMessage(null, {action: "focus_check"}, function(response) {
			if(response) {
				if(response.response == true){
					focusThis(); // Page focused so continue..
				}else{
					checkUsageToFocus(); //Look for website usage to check if this needs to be focused//
				}
			} else {
				setTimeout(focusCheck, 3000);
			}
		});
	}
};
focusCheck();

function focusThis(){
	console.log('Focus Mode Active - On this URL');
	checkLimitCross(function(res){ // Page focused now check for limit crossed..
		if(res){
			limitCrossed(); // If limit crossed call this..
		}else{
			limitNotCrossed(); // If Limit not crossed call this..
		}
	});
}

function checkLimitCross(callback){
	if(typeof chrome.app.isInstalled!=='undefined'){
		chrome.runtime.sendMessage(null, {action: "check_limit_cross"}, function(response) {
			if(response) {
				if(response.response == true){
					callback(true);
					return true; // If limit crossed call this..
				}else{
					callback(false);
					return false; // If Limit not crossed call this..
				}
			} else {
				setTimeout(checkLimitCross, 3000);
			}
		});
	}
}

function limitCrossed(when='before'){
	if(when == 'before'){
		blockPage();
		// And - Increment Total Web Access Tries //
		if(typeof chrome.app.isInstalled!=='undefined'){
			chrome.runtime.sendMessage(null, {action: "increment_total_tries"});
		}
	}else if(when == 'now'){
		blockPage('now');
	}
}

function limitNotCrossed(){
	let todayTotalIncrement = setInterval(function(){
		if (!document.hidden) {
			if(typeof chrome.app.isInstalled!=='undefined'){
				chrome.runtime.sendMessage(null, {action: "increment_focus"}, function(response) {
					if(response) {
						if(response.response == true){
							console.log('increment by 5');
							// If active tab just crossed the limit //
							checkLimitCross(function(res){
								if(res){
									limitCrossed('now');
									clearInterval(todayTotalIncrement);
									return true;
								}
							});
						}else{
							console.log('FAILED increment');
						}
					} else {
						setTimeout(limitNotCrossed, 1000);
					}
				});
			}
		}
	}, 4900);//Every 5 seconds with strict 100ms deduct
}

function blockPage(mode){
	if(document.querySelector('[id^="NS-focused-container-"]') === null){
		if(null === null){
			let focusEndContent = `
			<style>
				NS-focus-container{
					position: fixed;
					display: block;
					top: 0;
					left: 0;
					right: 0;
					bottom: 0;
					width: 100%;
					z-index: 99999999;
					background: #EFEFEF;
					user-select: none;
					display: flex;
					justify-content: center;
					align-items: center;
					flex-flow: column;
					text-align: center;
					font-family: Arial;
					letter-spacing: 2px;
					animation: NS-show-fast 0.5s ease forwards;
				}
				
				@keyframes NS-show-fast{
					0%{transform: scale(1.3) rotate(5deg);}
					100%{transform: scale(1) rotate(0);}
				}

				NS-focus-title-message{
					font-size: 1.5em;
					margin: 10px 0;
				}

				NS-focus-title-motivate{
					font-size: 1em;
					opacity: 0.7;
					font-family: Courier;
				}

				NS-focus-subtitle-message{
					font-size: 0.7em;
					opacity: 0.5;
					padding: 10px 0;
				}

				NS-focus-button-container{
					margin: 20px;
				}

				NS-focus-button-container *{
					padding: 10px;
					font-weight: 700;
					cursor: pointer;
				}

				NS-focus-button-container *:hover{
					box-shadow: 1px 0 2px 2px #ababab;
				}

				NS-focus-ok-button{
					background: #33691e;
					color: white;
					border-radius: 30px 30px 5px 30px;
					transition: all 0.3s ease;
				}

				NS-focus-ok-button:after{
					content: "Close Site";
				}

				NS-focus-emergency-button{
					background: #aa331e;
					color: white;
					border-radius: 30px 30px 30px 5px;
					transition: all 0.3s ease;
				}

				NS-focus-emergency-button:after{
					content: "Emergency 1 Minutes Access";
				}

				NS-focus-bypass-button{
					margin-top: 20px;
					font-size: 0.8em;
					color: darkblue;
					cursor: pointer;
					transition: all 0.3s ease;
				}

				NS-focus-bypass-button:hover{
					text-decoration: underline;
				}

				NS-focus-ok-button:after, NS-focus-emergency-button:after, NS-focus-bypass-button:after{
					visibility: hidden;
					opacity: 0;
					font-weight: 700;
					color: white;
					background: #323232;
					position: absolute;
					padding: 8px 0;
					bottom: 20px;
					left: 0;
					width: 100%;
					text-align: center;
					transition: all 0.5s ease;
				}

				NS-focus-bypass-button:after{
					content: "And Consider yourself a Looser..";
				}

				NS-focus-ok-button:hover:after, NS-focus-emergency-button:hover:after, NS-focus-bypass-button:hover:after{
					visibility: visible;
					opacity: 1;
					transform: translate(0,-20px);
				}

				NS-focus-footer{
					position: absolute;
					font-size: 0.5em;
					bottom: 2px;
					left: 2px;
					font-weight: 700;
				}
			</style>

			<NS-focus-container>
				<img src="`+ chrome.extension.getURL('icons/icon128.png') +`" style="width: 80px; margin-bottom: 20px;">
				
				<NS-focus-title-message>
					Website Usage has crossed Limit
				</NS-focus-title-message>
				<NS-focus-title-motivate>
					Work, Learn or Meditate Stay Productive
				</NS-focus-title-motivate>
				<NS-focus-subtitle-message>
					* * *
					<br/>
					<NS-focus-subtitle-url></NS-focus-subtitle-url>
				</NS-focus-subtitle-message>
				<NS-focus-button-container>
					<NS-focus-ok-button>OK</NS-focus-ok-button>
					<NS-focus-emergency-button>1 Min</NS-focus-emergency-button>
				</NS-focus-button-container>
				<NS-focus-bypass-button>
					I Don't Care
				</NS-focus-bypass-button>
				
				<NS-focus-footer>By: Niush Sitaula | Minimal Productivity App</NS-focus-footer>
				
			</NS-focus-container>
			`;

			let parentContainer = 'NS-focused-container-'+new Date().getTime();
			let focusedContainer = document.createElement(parentContainer);
			focusedContainer.id = parentContainer;
			let shadowRoot = focusedContainer.attachShadow({mode: 'open'});
			shadowRoot.innerHTML = focusEndContent; // variable content html

			document.getElementsByTagName("html")[0].appendChild(focusedContainer);
			console.log('WEBSITE IS LIMITED - GO TO WORK');

			if(mode == "emergency"){
				$(shadowRoot.querySelector('NS-focus-emergency-button')).remove();
			}else if(mode == "strict"){
				$(shadowRoot.querySelector('NS-focus-title-message')).html('You Can Do Better, Don\'t Waste Your Time');
				$(shadowRoot.querySelector('NS-focus-emergency-button')).remove();
				$(shadowRoot.querySelector('NS-focus-ok-button')).html('OK, I am a Good Boy');
				$(shadowRoot.querySelector('NS-focus-bypass-button')).html('Just, Leave Me Alone');
				$(shadowRoot.querySelector('NS-focus-subtitle-message')).remove();
				$(shadowRoot.querySelector('NS-focus-footer')).remove();
			}else if(mode == "now"){
				$(shadowRoot.querySelector('NS-focus-title-message')).html("Psst.."+$(shadowRoot.querySelector('NS-focus-title-message')).html());
			}
			
			let motivations = ['Work, Learn or Meditate Stay Productive', 'Why waste your time here, Detox for good', 'Quality and Clutter Free Life, Stay Motivated', 'Why not read something useful. Sounds Great', 'You Run The Day, Or The Day Runs You. Choose Wisely.']

			function randomMotivate(){
				$(shadowRoot.querySelector('NS-focus-title-motivate')).html(motivations[Math.floor(motivations.length * Math.random())]);
			}
			randomMotivate();
			let motivateShuffle = setInterval(function(){
				randomMotivate();
			}, 7000);
			
			$(shadowRoot.querySelector('NS-focus-subtitle-url')).html(window.location.hostname);
			
			$(shadowRoot.querySelector('NS-focus-ok-button')).click(function(){
				if(typeof chrome.app.isInstalled!=='undefined'){
					chrome.runtime.sendMessage(null, {action: "close_tab"});
				}
			});

			$(shadowRoot.querySelector('NS-focus-emergency-button')).click(function(){
				focusedContainer.remove();
				clearInterval(motivateShuffle);
				setTimeout(function(){
					blockPage('emergency');
				}, 60000);
			});

			$(shadowRoot.querySelector('NS-focus-bypass-button')).click(function(){
				focusedContainer.remove();
				clearInterval(motivateShuffle);
				if(mode != "strict"){
					setTimeout(function(){
						blockPage('strict');
					}, 60000);
				}
			});
		}
	}
}

let noFocusUsage = 0;
function checkUsageToFocus(){
	let noFocusUsageCheck = setInterval(function(){
		if (!document.hidden) {
			noFocusUsage += 10;
			if(noFocusUsage >= 3600){
				alert('You have been using this website for quite some time, why not focus and limit this website.\nYou can do this from the Extension Menu in the top right. - MPA');
				clearInterval(noFocusUsageCheck);
			}
		}else{
			noFocusUsage += 5;
		}
	}, 10000);
}

/***********************************/
/*  CODES TO RUN AFTER DELAY      */
/*********************************/
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
		console.log("MPA Message: "+ request.action);
		if(request.action == "lockpage"){
			sendResponse({response: blockLinksWorker()});
		}else if(request.action == "extension_updated"){
			let message = document.createElement('NS-tiny-message');
			message.innerHTML = 'Minimal Productivity Extension Was Just Updated';
			document.getElementsByTagName('body')[0].appendChild(message);
			setTimeout(function(){
				message.remove();
			}, 5000);
		}
	  }
	);

	/* BLOCK LINKS FUNCTIONS */
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

	/*********************************************/
	/*  CODES TO RUN AFTER WINDOW LOADED DONE   */
	/*******************************************/
	$(document).ready(function(){
		// CHECK FOR CHAT DISABLED OR NOT //
		var noteDisabledCheck = function() {
			if(typeof chrome.app.isInstalled!=='undefined'){
				//chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
					chrome.runtime.sendMessage(null, {action: "note_disabled_check"}, function(response) {
						if(response) {
							if(response.response == true){
								showNote();
							}
						} else {
							setTimeout(noteDisabledCheck, 3000);
						}
					});
				//});
			}
		};
		noteDisabledCheck();
		
		function showNote(){
			// Check for Old NS extension container and remove them //
			if(document.querySelector('NS-extension-container') != null){
				let oldContainers = document.getElementsByTagName('NS-extension-container');
				for(let i = 0 ; i < oldContainers.length ; i++){
					oldContainers[i].parentNode.removeChild(oldContainers[i]);
				}
			}
			
			// HACK: we need to "bleed" font-faces to outside the shadow dom because of a bug in chrome #COPIED - THANKS IF WORKED
			//document.querySelector('head').innerHTML += '<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">';
			// >>>>> ENABLE TO SHOW ICONS // NOT NOW
			
			// Copying all the HTML from floaters.html to create the floating button - used external file make code cleaner //
			fetch(chrome.extension.getURL('src/inject/floaters.html')).then((data) => {
			  data.text().then((body) => {
				let noteContainer = document.createElement('NS-extension-container');
				noteContainer.innerHTML = body
				document.getElementsByTagName('body')[0].appendChild(noteContainer);
				
				floatersScripts();
			  })
			})
			
			//***** NOTE FLOATING Function *******//
			// Applying all clicks and moves and logic to Floating icons and events //
			function floatersScripts(){
				setTimeout(function(){
					let NSNotesIconTop = $(window).height() - 50;
					let isNoteOpen = false;
					let noteContentLoaded = false;
					let NSNotesFloatingIcon = $('NS-notes-floating-icon');
					let NSNotesIframeContainer = $('NS-notes-iframe-container');
					let NSNotesIframe = $('.NS-notes-iframe');
					
					// If localstorage has top status saved put the icon to top px //
					if(localStorage.hasOwnProperty('ns-note-top')){
						NSNotesFloatingIcon.css('top',parseInt(localStorage.getItem('ns-note-top')));
						NSNotesIconTop = localStorage.getItem('ns-note-top');
					}
					
					checkPositionChanges();
					
					$(window).resize(function(){
						checkPositionChanges();
					});
					
					function checkPositionChanges(){
						// WORKS KINDA ...MEH....NO Thanks for now....it might be enough.
						let resizeChangesH = $(window).height();
						let resizeChangesW = $(window).width();
						//console.log(resizeChangesW);
						//console.log(NSNotesIframeContainer.outerWidth());
						if(parseInt(localStorage.getItem('ns-note-top')) > resizeChangesH){
							NSNotesFloatingIcon.css('top', resizeChangesH - 60);
							NSNotesIconTop = resizeChangesH - 60;
							NSNotesIconTop = localStorage.setItem('ns-note-top', resizeChangesH - 60);
						}

						if(resizeChangesW < NSNotesIframeContainer.outerWidth() + 100){
							NSNotesIframeContainer.css('width', resizeChangesW - 100);
						}
						
						if(resizeChangesH < NSNotesIframeContainer.outerHeight() + 100){
							NSNotesIframeContainer.css('height', resizeChangesH - 100);
						}
					}
					
					NSNotesFloatingIcon.addClass('NS-shown');
					
					NSNotesFloatingIcon.draggable({ axis: "y", containment: "window",	
											start: function() {
												NSNotesFloatingIcon.css('transition','none');
											}, stop: function() {
												NSNotesFloatingIcon.css('transition','all 0.3s ease');
												localStorage.setItem('ns-note-top',NSNotesFloatingIcon.position().top);
											}
										});
										
					NSNotesIframeContainer.resizable({animate: true, handles: 'n, w' , 
											start: function() {
												NSNotesIframeContainer.css('transition','none');
												NSNotesIframe.css('pointer-events','none');
											}, stop: function() {
												setTimeout(function(){
													NSNotesIframeContainer.css('transition','all 0.5s ease');
													NSNotesIframe.css('pointer-events','initial');
												}, 1000);
											}
										});
										
					NSNotesFloatingIcon.click(function() {
						if (isNoteOpen) {
							NSNotesIframeContainer.removeClass("show");
							NSNotesFloatingIcon.css('top',NSNotesIconTop);
							isNoteOpen = false;
							NSNotesFloatingIcon.draggable( 'enable' )
						} else {
							if(noteContentLoaded == false){
								NSNotesIframe.attr('src',chrome.extension.getURL('src/inject/iframe/note.html'));
								NSNotesIframe.on('load', function(){
									$('NS-loading-iframe').addClass('NS-hide');
								});
								noteContentLoaded = true;
							}
							NSNotesIframeContainer.addClass("show");
							NSNotesIconTop = NSNotesFloatingIcon.position().top;
							NSNotesFloatingIcon.css('top',$(window).height() - 50);
							isNoteOpen = true;
							NSNotesFloatingIcon.draggable( 'disable' )
						}
					});
					
					$('NS-closer-iframe').click(function(){
						NSNotesFloatingIcon.click();
					});
				}, 200);
			}
		}
	});

	
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
}, 500);
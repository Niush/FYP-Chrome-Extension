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
	// Dim Container Here //
	let dimContainer = document.createElement('NS-dim-container-'+new Date().getTime());
	const shadowRoot = dimContainer.attachShadow({mode: 'open'});
	shadowRoot.innerHTML = `
		<style>div{animation: showchange 0.4s ease forwards;} @keyframes showchange{0%{opacity: 0.1;} 100%{opacity: 0.3;}}</style>
		<div style="pointer-events: none; position: fixed !important; width: 100%; height: 100%; top: 0; left: 0; background: #323232; opacity: 0.3; z-index: 9999999 !important;"></div>
	`;
	document.getElementsByTagName("html")[0].appendChild(dimContainer);
}
// DIM TIME CHECK MESSAGE //
chrome.runtime.sendMessage(null, {action: "dim_time"}, function(response) {
	//check response true
	if(response.response == true){
		console.log('DIM Screen Initialized');
		dimScreen();
	}
});

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
		console.log(sender.tab ?
					"from a content script:" + sender.tab.url :
					"from the extension");
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
	
	// Check for Old NS extension container and remove them //
	if(document.querySelector('NS-extension-container') != null){
		let oldContainers = document.getElementsByTagName('NS-extension-container');
		for(let i = 0 ; i < oldContainers.length ; i++){
			oldContainers[i].parentNode.removeChild(oldContainers[i]);
		}
	}
	
	// HACK: we need to "bleed" font-faces to outside the shadow dom because of a bug in chrome #COPIED - THANKS IF WORKED
	document.querySelector('head').innerHTML += '<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">';
	
	// Copying all the HTML from floaters.html to create the floating button - used external file make code cleaner //
	fetch(chrome.extension.getURL('src/inject/floaters.html')).then((data) => {
	  data.text().then((body) => {
		let noteContainer = document.createElement('NS-extension-container');
		noteContainer.innerHTML = body
		document.getElementsByTagName('body')[0].appendChild(noteContainer);
		
		floatersScripts();
	  })
	})
	
	
	// Applying all clicks and moves and logic to Floating icons and events //
	function floatersScripts(){
		setTimeout(function(){
			let NSNotesIconTop = $(window).height() - 50;
			let isNoteOpen = false;
			let noteContentLoaded = false;
			let NSNotesFloatingIcon = $('NS-notes-floating-icon');
			let NSNotesIframeContainer = $('NS-notes-iframe-container');
			let NSNotesIframe = $('.NS-notes-iframe');
			NSNotesFloatingIcon.draggable({ axis: "y", containment: "window",	
									start: function() {
										NSNotesFloatingIcon.css('transition','none');
									}, stop: function() {
										NSNotesFloatingIcon.css('transition','all 0.3s ease');
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
						noteContentLoaded = true;
					}
					NSNotesIframeContainer.addClass("show");
					NSNotesIconTop = NSNotesFloatingIcon.position().top;
					NSNotesFloatingIcon.css('top',$(window).height() - 50);
					isNoteOpen = true;
					NSNotesFloatingIcon.draggable( 'disable' )
				}
			});
		}, 200);
	}


	
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
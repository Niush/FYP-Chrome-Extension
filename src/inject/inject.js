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
	/* var mat = document.createElement("script");
	mat.type = "text/javascript";
	mat.src = "chrome-extension://"+chrome.runtime.id+"/js/jquery/jquery.min.js";
	document.body.appendChild(mat); */
	
	// Check for Old NS extension container and remove them //
	if(document.querySelector('NS-extension-container') != null){
		let oldContainers = document.getElementsByTagName('NS-extension-container');
		//console.log(oldContainers);
		for(let i = 0 ; i < oldContainers.length ; i++){
			oldContainers[i].parentNode.removeChild(oldContainers[i]);
		}
	}
	
	// HACK: we need to "bleed" font-faces to outside the shadow dom because of a bug in chrome #COPIED - THANKS IF WORKED
	document.querySelector('head').innerHTML += '<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">';
	
	let rootElHtml = `
		<NS-extension-container id="NS-extension-container">
		  <template id="cls-template">
		  </template>
		</div>
	`;
	
	document.body.innerHTML += rootElHtml;
	
	let rootEl = document.querySelector('#NS-extension-container'),
	  templateEl = rootEl.querySelector('template'),
	  shadow = rootEl.attachShadow({
		mode: 'open'
	  });
	
	// Shadow Root Container - For extension // // MY CODE
	/* let extensionContainer = document.createElement('NS-extension-container');
	let noteTemplate = document.createElement('NS-note-template');
	let shadowRoot = extensionContainer.attachShadow({mode: 'open'}); */
	
	/* IMPORTING ALL JS */
	let jsLinks = [
	  chrome.extension.getURL('../../js/jquery/jquery.min.js'),
	  chrome.extension.getURL('../../src/inject/iframe/js/index.js'),
	  chrome.extension.getURL('../../js/jquery/jquery-ui.min.js'),
	  chrome.extension.getURL('../../js/materialize/materialize.min.js'),
	].map(p => `<script src="${p}" type="text/javascript"></script>`).join("\n")
	
	/* ALL CSS */
	let cssLinks = [
	  chrome.extension.getURL('../../css/materialize.min.css'),
	  chrome.extension.getURL('../../src/inject/iframe/css/style.css'),
	].map(p => `<link rel="stylesheet" href="${p}" />`).join("\n")
	
	// inject css/js into template content
	let templateNodeContents = document.createElement('div')
	templateNodeContents.innerHTML = [cssLinks, jsLinks].join("\n")
	for (let node of templateNodeContents.childNodes)
		templateEl.content.appendChild(node)
	
	fetch(chrome.extension.getURL('src/inject/iframe/index.html')).then((data) => {
	  data.text().then((body) => {
		let noteContainer = document.createElement('NS-extension-note-container')

		shadow.appendChild(document.importNode(templateEl.content, true))
		noteContainer.innerHTML = body
		shadow.appendChild(noteContainer)
	  })
	})
	
	document.getElementsByTagName('body')[0].appendChild(shadow);
	

	
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
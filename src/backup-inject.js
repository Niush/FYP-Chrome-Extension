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
	
	// Shadow Root Container - For extension //
	let extensionContainer = document.createElement('NS-extension-container');
	const shadowRoot = extensionContainer.attachShadow({mode: 'open'});
	document.getElementsByTagName('body')[0].appendChild(extensionContainer);

	// Chat Container //
	let chatShadowContainer = document.createElement('NS-chat-shadow-container-'+new Date().getTime());
	chatShadowContainer.innerHTML = `
		<link rel="stylesheet" href="chrome-extension://`+chrome.runtime.id+`/css/materialize.min.css">
		<style>
			/* Scroll Bar */
			::-webkit-scrollbar {
			  width:  5px;
			  height: 5px;
			}

			::-webkit-scrollbar-thumb {
			  background: #666;
			  border-radius: 5px;
			}

			::-webkit-scrollbar-thumb:hover{
				background: #333;
			}

			::-webkit-scrollbar-track {
			  background: #ddd;
			  border-radius: 5px;
			}

			::-webkit-scrollbar-button {
			  background: rgba(150,150,150,0);
			  height: 0;
			}
			/* IE */
			body {
				scrollbar-face-color: #666;
				scrollbar-track-color: #ddd;
			}

			.ui-resizable-helper{
				border: 1px solid #656565;
			}

			.ui-resizable-n, .ui-resizable-w {
				box-shadow: inset 0 0 0 10px #898989;
				opacity: 0.2;
			}

			.ui-resizable-n{
				width: 100%;
				height: 7px;
				z-index: 90;
				position: absolute;
				top: 0;
				cursor: n-resize;
			}

			.ui-resizable-w{
				height: 100%;
				width: 7px;
				z-index: 90;
				position: absolute;
				left: 0;
				top: 0;
				cursor: w-resize;
			}

			.confirmModal{
				width: 500px !important;
				z-index: 99999999 !important;
			}

			/* NS Notes Floating Stylings */
			#NS-notes-floating-icon {
				overflow: visible;
				z-index: 9999999;
				position: fixed;
				bottom: 50px;
				left: auto !important;
				right: 5px;
				transition: all 0.3s ease;
				user-select: none;
			}

			#NS-notes-container {
				visibility: hidden;
				z-index: 999999;
				opacity: 0;
				-webkit-transform: translate(0, 20px);
				transform: translate(0, 20px);
				background: #FEFEFE;
				color: black;
				position: fixed;
				right: 15px;
				transition: all 0.5s ease;
				width: 350px;
				height: 400px;
				bottom: 60px;
				border-radius: 5px;
				box-shadow: 0 0 1px 2px #898989;
				overflow-y: auto;
				overflow-x: hidden;
				font-family: Arial;
			}

			#NS-notes-container.show {
				visibility: visible;
				opacity: 1;
				transform: translate(0, 0);
			}

			.NS-notes-title-container{
				padding: 0 10px;
				margin-bottom: 5px;
				position: relative;
			}

			.NS-notes-title-container > p{
				border-bottom: 1px solid #565656;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
				margin: 10px 0 0 0;
				padding: 0 0 10px 0;
				cursor: pointer;
				/* display: flex; */
			}

			span.NS-note-title{
				animation: fade 0.3s ease forwards;
			}

			.NS-note-inline-control{
				position: absolute;
				right: 0;
				background: #FEFEFE;
				padding: 0 15px;
				display: inline;
				opacity: 0;
				transform: translate(10px, 0);
				visibility: hidden;
				transition: all 0.3s ease-in-out;
			}

			.NS-note-inline-control i{
				opacity: 0.5;
				font-size: 1.2em;
				transition: all 0.5s ease;
			}

			.NS-note-inline-control i:hover{
				opacity: 0.8;
			}

			.NS-notes-title-container p:hover > .NS-note-inline-control{
				visibility: visible;
				transform: translate(0, 0);
				opacity: 1;
			}

			.NS-notes-title-container p.NS-edit-mode{
				padding: 0;
				border: none;
			}

			.NS-note-inline-control-save{
				display: none !important;
			}

			p.NS-edit-mode .NS-note-inline-control-save{
				display: inline !important;
			}

			p.NS-edit-mode .NS-note-inline-control-edit{
				display: none;
			}

			.NS-note-title.NS-note-title-edit{
				margin: 0 !important;
				padding: 0 0 10px 0 !important;
				height: inherit !important;
				border-width: 2px !important;
				font-weight: 500;
				opacity: 0.6;
				animation: fade 0.3s ease forwards;
			}

			@keyframes fade{
				0%{opacity: 0; transform: scale(0.95);}
				100%{opacity: 1; transform: scale(1);}
			}

			.NS-notes-input-new-container{
				position: sticky;
				bottom: 0;
				background: white;
				width: 100%;
				padding: 0 10px;
			}

			.NS-notes-input-new-container > input::placeholder{
				color: #898989 !important;
				font-size: 0.9em;
			}

			.NS-notes-input-new-container > button{
				position: absolute;
				right: 12px;
				top: 5px;
				visibility: hidden;
				opacity: 0;
				transition: all 0.5s ease;
			}

			.NS-notes-input-new-container input:valid ~ button{
				visibility: visible;
				opacity: 1;
			}

			/* Notes Editor Inner */
			.NS-notes-content-editor-container{
				width: 100%;
				position: absolute;
				background: #EFEFEF;
				top: 43px;
				left: 0;
				min-height: calc(100% - 43px);
				padding: 13px;
				visibility: hidden;
				opacity: 0;
				transform: translate(200px, 0);
				transition: all 0.3s ease;
			}

			.NS-notes-content-editor-container.show{
				visibility: visible;
				opacity: 1;
				transform: translate(0, 0);
			}
		</style>
	
		<div class="NS-right-float">
			<!-- "pulse" class to pulse icon -->
			<a class="btn-floating" id="NS-notes-floating-icon">
				<i class="material-icons">menu</i>
			</a>

			<div id="NS-notes-container">
				<h5 style="font-weight: 700; border-radius: 5px 0 0 0; padding: 8px 0; margin: 0;" class="row center indigo accent-2 white-text">
					<i class="material-icons left" id="back-to-notes-home-button" style="cursor: pointer; padding: 5px; visibility: hidden; position: absolute; left: 10px; top: 5px;">keyboard_arrow_left</i>
					Notes
				</h5>
				
				<div class="NS-notes-title-container">
					<p note_id="10293">
						<span class="NS-note-title">Test Note 1</span>
						<span class="NS-note-inline-control">
							<i class="NS-note-inline-control-edit material-icons">edit</i>
							<i class="NS-note-inline-control-save material-icons">save</i>
							<i class="NS-note-inline-control-delete material-icons">delete_forever</i>
						</span>
					</p>
					<p note_id="029">
						<span class="NS-note-title">Test Note 2</span>
						<span class="NS-note-inline-control">
							<i class="NS-note-inline-control-edit material-icons">edit</i>
							<i class="NS-note-inline-control-save material-icons">save</i>
							<i class="NS-note-inline-control-delete material-icons">delete_forever</i>
						</span>
					</p>
					<p note_id="1392">
						<span class="NS-note-title">Test Note 3</span>
						<span class="NS-note-inline-control">
							<i class="NS-note-inline-control-edit material-icons">edit</i>
							<i class="NS-note-inline-control-save material-icons">save</i>
							<i class="NS-note-inline-control-delete material-icons">delete_forever</i>
						</span>
					</p>
					<!-- <p note_id="11293" class="NS-edit-mode">
						<input class="NS-note-title NS-note-title-edit validate" required type="text" value="Test Note 4 Editing"/>
						<span class="NS-note-inline-control">
							<i class="NS-note-inline-control-edit material-icons">edit</i>
							<i class="NS-note-inline-control-save material-icons">save</i>
							<i class="NS-note-inline-control-delete material-icons">delete_forever</i>
						</span>
					</p> -->
				</div>
				
				<div class="NS-notes-input-new-container">
					<input id="NS-notes-input-new" class="validate" type="text" placeholder="Create New Note" required/>
					<button id="NS-notes-input-new-button" class="btn btn-small indigo">Add</button>
				</div>
				
				<div class="NS-notes-content-editor-container">
					<div class="row">
						<form class="col s12">
						  <div class="row">
							<div class="input-field col s12">
							  <textarea id="textarea1" class="materialize-textarea"></textarea>
							  <label for="textarea1">Test Note 1:</label>
							</div>
						  </div>
						</form>
					</div>
				</div>
			</div>
			
			<div id="confirmModal" class="modal confirmModal">
				<div class="modal-content">
				  <h4>Confirm This Action:</h4>
				  <p>Delete This Note ?</p>
				</div>
				<div class="modal-footer">
				  <a href="#!" class="modal-close waves-effect waves-green btn-flat" id="okConfirm">Ok</a>
				  <a href="#!" class="modal-close waves-effect waves-green btn-flat" id="cancelConfirm">Cancel</a>
				</div>
			</div>
			
		</div>
	`;
	/* IMPORTING ALL JS */
/* 	javascript:
	var jq = document.createElement('script');
	jq.onload = function(){};
	jq.src = "chrome-extension://"+chrome.runtime.id+"/js/jquery/jquery.min.js";
	//document.querySelector('NS-extension-container').appendChild(jq);
	chatShadowContainer.appendChild(jq);
	
	javascript:
	var jqu = document.createElement('script');
	jqu.onload = function(){};
	jqu.src = "chrome-extension://"+chrome.runtime.id+"/js/jquery/jquery-ui.min.js";
	//document.querySelector('NS-extension-container').appendChild(jqu);
	chatShadowContainer.appendChild(jqu);
	
	javascript:
	var mat = document.createElement('script');
	mat.onload = function(){};
	mat.src = "chrome-extension://"+chrome.runtime.id+"/js/materialize/materialize.min.js";
	//document.querySelector('NS-extension-container').appendChild(mat);
	chatShadowContainer.appendChild(mat);
	
	setTimeout(function(){
		javascript:
		var inc = document.createElement('script');
		inc.onload = function(){};
		inc.src = "chrome-extension://"+chrome.runtime.id+"/js/functions/inject_chat.js";
		//document.querySelector('NS-extension-container').appendChild(inc);
		chatShadowContainer.appendChild(inc);
	}, 500); */
	
	setTimeout(function(){
		extensionContainer.shadowRoot.appendChild(chatShadowContainer);
	}, 1000);
	

	
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
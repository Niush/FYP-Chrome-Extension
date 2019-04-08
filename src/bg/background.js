/** START EXTENSION AFTER FEW SECONDS DELAY **/
let START_DELAY = 500;
let datauri = ""; //Stores current data uri the latest one

// Take Screen shot of that active page -quality changed //
function takeScreenShot(tabInfo, quality=100, coords, callback){
	chrome.tabs.captureVisibleTab(tabInfo.windowId,{'quality': quality},function(screenshotUrl) {
		//datauri = screenshotUrl;
		if(coords == null){
			cropData(screenshotUrl, tabInfo.width, tabInfo.height); //No x and y
		}else{
			cropData(screenshotUrl, coords.w, coords.h, coords.x, coords.y, function(data){
				callback();
			});
		}
		/* chrome.tabs.create({url: screenshotUrl}, function(){
			console.log(screenshotUrl);
		}); */
	});
}

var DEFAULT_COORDS = {
	w: 1000,
	h: 1000,
	x: 0,
	y: 0
};

function cropData(str, w=DEFAULT_COORDS.w, h=DEFAULT_COORDS.h, x=DEFAULT_COORDS.x, y=DEFAULT_COORDS.y, callback=function(){}) {
	var img = new Image();
	var canvas;
	
	img.onload = function() {
		canvas = document.createElement('canvas');
		canvas.width = w;
		canvas.height = h;
	
		var ctx = canvas.getContext('2d');
	
		ctx.drawImage(img, x, y, w, h, 0, 0, w, h);
		datauri = canvas.toDataURL('image/jpeg', 1); // set 0.5 for low
		callback(datauri);
		//dataURItoBlob(canvas);
	};
	
	img.src = str;
}

function dataURItoBlob(canvas) {
	canvas.toBlob(function(blob) {
		var newImg = document.createElement('img'),
			url = URL.createObjectURL(blob);

		newImg.onload = function() {
			URL.revokeObjectURL(url);
		};

		newImg.src = url;
		document.body.appendChild(newImg);
		return url;
	});
}

function injectToAll(){
	// Add a `manifest` property to the `chrome` object.
	chrome.manifest = chrome.app.getDetails();

	var injectIntoTab = function (tab) {
		// FIRST CHECK IF INJECT CAN BE DONE IN THIS URL or PAGE (NOTE: CANNOT INJECT TO internal urls)
		chrome.tabs.executeScript(tab.id, {
		  code: '',
		}, _=>{
		  let e = chrome.runtime.lastError;
		  // IF Error does not occur and Inject can load in this page //
		  if(e == undefined){
			//console.log(tab.id, _, e);
			injectConfirm(); // Inject them js and css
		  }
		});
		
		function injectConfirm(){
			// You could iterate through the content scripts here
			var scripts = chrome.manifest.content_scripts[1].js;
			var css = chrome.manifest.content_scripts[0].css;
			var i = 0, s = scripts.length;
			for( ; i < s; i++ ) {
				chrome.tabs.executeScript(tab.id, {
					file: scripts[i]
				});
			}
			var j = 0, c = css.length;
			for( ; j < c; j++ ) {
				chrome.tabs.insertCSS(tab.id, {
					file: css[j]
				});
			}
		}
	}

	// Get all windows
	chrome.windows.getAll({
		populate: true
	}, function (windows) {
		var i = 0, w = windows.length, currentWindow;
		for( ; i < w; i++ ) {
			currentWindow = windows[i];
			var j = 0, t = currentWindow.tabs.length, currentTab;
			for( ; j < t; j++ ) {
				currentTab = currentWindow.tabs[j];
				// Skip chrome:// and https:// pages
				if( ! currentTab.url.match(/(chrome|chrome-extension|opera|vivaldi|brave):\/\//gi) ) {
					injectIntoTab(currentTab);
				}
			}
		}
	});
}

function showNotification(titleInput, messageInput, tabId){
	chrome.notifications.create({
		type: 'progress',
		message: messageInput,
		iconUrl: '../../icons/icon128.png',
		title: titleInput,
		priority: 2,
		requireInteraction: true,
		progress: 0,
	}, function(noti_id){
		if(localStorage.hasOwnProperty('play_notification_sound') && localStorage.getItem('play_notification_sound') == "false"){
			console.log('Silent Notication Shown');
		}else{
			let notificationSound = new Audio('../../sound/notification.ogg');
			notificationSound.play();
		}
		
		chrome.notifications.onClicked.addListener(function(){
			let x = 0;
			let fillProgress = setInterval(function(){
				chrome.notifications.update(noti_id, {progress: x+=10});
				if(x >= 100){
					clearInterval(fillProgress);
					chrome.notifications.clear(noti_id, function(){
						var updateProperties = { 'active': true };
						//chrome.tabs.update(tabId, updateProperties, (tab) => { });
					});
				}
			}, 50);
		});
	});
}

  /****************************/
 /*** M A I N ---- ON LOAD ***/
/****************************/
document.addEventListener('DOMContentLoaded', function() {	
	let u; // USER
	
	/* Use Callbacks if needed / Promise might not work */
	/* First run that checks Install Event is auto trigerred */
	
	setTimeout(function(){
		
		checkFirstRun();

		u = new User(); // Define User - Although no parameters LOL// //Also could callback
		
		chrome.tabs.onActivated.addListener(function(activeInfo) {
			checkTabFeature(activeInfo);
		});
		
		chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
			checkTabFeature(tab);
		});
		
		function checkTabFeature(activeInfo){
			chrome.tabs.executeScript(activeInfo.tabId, {
			  code: '',
			}, _=>{
			  let e = chrome.runtime.lastError;
			  if(e != undefined){ //If error during inject it is internal page so dull icon
				chrome.browserAction.setIcon({path: "../../icons/icon48_grey.png"});
			  }else{
				chrome.browserAction.setIcon({path: "../../icons/icon48.png"});
				u = new User();
				
				/* chrome.tabs.executeScript(activeInfo.tabId, { file: "../../js/jquery/jquery.min.js" }, function () {
					chrome.tabs.executeScript(activeInfo.tabId, { file: "../../js/jquery/jquery-ui.min.js" }, function(){
						chrome.tabs.executeScript(activeInfo.tabId, { file: "../../js/materialize/materialize.min.js" }, function(){
							chrome.tabs.executeScript(activeInfo.tabId, { file: "../../js/functions/inject_chat.js" }, function(){
								
							});
						});
					});
				}); */
			  }
			});
		}
		
		if(internetStatus()){
			//Check if in queue//
			//AJAX TO DATABASE old + new//
		}else{
			//Store for later upload//
		}
		/******************/

		//SEND AND RECEVIE MESSAGES FROM OTHER JS//
		chrome.runtime.onMessage.addListener(
		  function(request, sender, sendResponse) {
			console.log("MESSAGE: " + request.action);
			//console.log(sender);
			// If request to screenshot //
			if(request.action.toLowerCase() == "screenshot"){
				//console.log(request.tabInfo);
				takeScreenShot(request.tabInfo, request.quality);
				// Take Screenshot &
				// Send Back Response of DataURI woth delay
				setTimeout(function(){
					sendResponse({
						response: datauri,
					});
				}, 1200);
				
				return true;
			}
			
			// If request to screenshot for specific note in that page //
			if(request.action.toLowerCase() == "screenshot_note"){
				if(typeof chrome.app.isInstalled!=='undefined'){
					chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
						chrome.tabs.sendMessage(tabs[0].id,{
							action: "open_screenshot",
							note_id: request.note_id
						}, function (response) {
							sendResponse({response: true});
						});
					});
				}
				sendResponse({response: true});
			}
			
			// If request to screenshot Now with coords and active tab - after Capture button click on that screenshot container //
			if(request.action.toLowerCase() == "screenshot_now"){
				//console.log(request);
				chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
					u = new User(function(){
						takeScreenShot(tabs[0], 70, request.coords, function(){
							let note_id = request.note_id;
							let curNote = u.get_note(note_id);
							curNote.note = curNote.note + '<p><img src="'+ datauri +'"/></p>';
							u.edit_note(note_id, curNote.note, function(){
								sendResponse({response: true, "note_id": note_id});
								datauri = null;
							});
						});
					});
				});
				return true;
			}
			
			// If request to chat_disabled_check //
			if(request.action.toLowerCase() == "note_disabled_check"){
				u = new User();
				if(u.check_disable_note(getHostName(sender.url)) == 0){
					sendResponse({
						response: true,
					});
				}else{
					sendResponse({
						response: false,
					});
				}
				//console.log(sender);
				return true;
			}
			
			// focus or not this page //
			if(request.action.toLowerCase() == "focus_check"){
				u = new User();
				//console.log(sender.tab.id);
				if(u.check_focus(getHostName(sender.url))){
					sendResponse({
						response: true,
					});
				}else{
					sendResponse({
						response: false,
					});
				}
				return false;
			}
			
			// Check If focus page is crossed limit //
			if(request.action.toLowerCase() == "check_limit_cross"){
				u = new User();
				if(u.check_limit_cross(getHostName(sender.url))){
					sendResponse({
						response: true,
					});
				}else{
					sendResponse({
						response: false,
					});
				}
				return false;
			}
			
			// Increment the focus time every call which is made probably every 5 seconds //
			if(request.action.toLowerCase() == "increment_focus"){
				u = new User(function(){
					if(u.increment_focus(getHostName(sender.url))){
						sendResponseHelper();
						//u = new User();
					}else{
						sendResponse({
							response: false,
						});
					}
					return false;
				});
				
				function sendResponseHelper(){
					sendResponse({
						response: true,
					});
				}
			}
			
			// Increment Wb Access Tries of Focus Limit exceeded pages //
			if(request.action.toLowerCase() == "increment_total_tries"){
				u = new User(function(){
					u.increment_total_tries(getHostName(sender.url));
					return true;
				});
			}
			
			// If request to A block or Lock Webpage (lockpage) //
			if(request.action.toLowerCase() == "sync"){
				u = new User(function(){
					u.syncNow('app', function(status){
						if(status == true){
							sendResponse({
								response: true,
							});
						}else{
							sendResponse({
								response: status,
							});
						}
					});
					
					return true;
				});
			}
			
			if(request.action.toLowerCase() == "dim_time"){
				u = new User();
				var currentD = new Date();
				var dimStart = new Date();
				dimStart.setHours(u.dim_time[0].slice(0,2), u.dim_time[0].slice(3,5), u.dim_time[0].slice(6,8));
				var dimEnd = new Date();
				dimEnd.setHours(u.dim_time[1].slice(0,2), u.dim_time[1].slice(3,5), u.dim_time[1].slice(6,8));
				if(currentD >= dimStart && currentD < dimEnd ){
					sendResponse({
						response: true,
					});
					return true;
				}else{
					sendResponse({
						response: false,
					});
					return false;
				}
			}
			
			if(request.action.toLowerCase() == "close_tab"){
				chrome.tabs.query({ active: true }, function(tabs) {
					chrome.tabs.remove(tabs[0].id);
				});
			}
		  }
		);
		
		injectToAll(); // Called to Inject to all opened pages //
			
	}, START_DELAY);
	
});
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

function showNotification(titleInput, messageInput, tabId=null, interaction=true){
	chrome.notifications.create({
		type: 'progress',
		message: messageInput,
		iconUrl: '../../icons/icon128.png',
		title: titleInput,
		priority: 2,
		requireInteraction: interaction,
		progress: 0,
	}, function(noti_id){
		if(localStorage.hasOwnProperty('play_notification_sound') && localStorage.getItem('play_notification_sound') == "false"){
			console.log('Silent Notication Shown');
		}else{
			let notificationSound = new Audio('../../sound/notification.ogg');
			notificationSound.play();
		}
		
		chrome.notifications.onClicked.addListener(function(id){
			let x = 0;
			let fillProgress = setInterval(function(){
				chrome.notifications.update(id, {progress: x+=10});
				if(x >= 100){
					clearInterval(fillProgress);
					chrome.notifications.clear(id, function(){
						var updateProperties = { 'active': true };
						//chrome.tabs.update(tabId, updateProperties, (tab) => { });
					});
				}
			}, 50);
		});
		
		if(interaction == false){
			setTimeout(function(){
				chrome.notifications.clear(noti_id);
			}, 2000);
		}
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

		u = new User(function(){
			chrome.contextMenus.removeAll();
			chrome.contextMenus.create({
				title: "Sync Data",
				contexts: ["browser_action","page"],
				onclick: function() {
					u.syncNow('app', function(){
						alert('Sync Success');
					});
				}
			});
			chrome.contextMenus.create({
				title: "Open All Notes",
				contexts: ["browser_action","page"],
				onclick: function() {
					openNotes();
				}
			});
			
			chrome.contextMenus.create({
				title: "Capture Visible Screen",
				contexts: ["browser_action","page"],
				onclick: function() {
					chrome.tabs.getSelected(null, function(tab) {
						takeScreenShot(tab, 100, {w: tab.width, h: tab.height}, function(){
							chrome.tabs.create({url: datauri});
						});
					});
				}
			});
			
			chrome.contextMenus.create({
				title: "Open Chat for this Page",
				contexts: ["browser_action","page"],
				onclick: function() {
					chrome.tabs.getSelected(null, function(tab) {
						openChat(tab.url, tab.id);
					});
				}
			});
			
			chrome.contextMenus.create({
				type: "separator"
			});
			
			if(u.passphrase == '' || u.user_id == '' || u.username == ''){
				chrome.contextMenus.create({
				title: "Login/Register",
				contexts: ["browser_action","page"],
					onclick: function() {
						openLogin();
					}
				});
			}else{
				chrome.contextMenus.create({
				title: "View Account Info",
				contexts: ["browser_action","page"],
					onclick: function() {
						openAccount();
					}
				});
			}
			
			chrome.contextMenus.create({
				title: "App Settings",
				contexts: ["browser_action","page"],
				onclick: function() {
					openSettings();
				}
			});
			
			chrome.contextMenus.create({
				type: "separator"
			});
			
			chrome.contextMenus.create({
				title: "Lock Webpage",
				contexts: ["browser_action"],
				onclick: function() {
					chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
						if( ! tabs[0].url.match(/(chrome|file|chrome-extension|opera|vivaldi|brave):\/\//gi) ) {
							chrome.tabs.sendMessage(tabs[0].id, {action: "lockpage"}, function(response) {
								try{
									if(response.response.toLowerCase().search('reverted') == -1){
										chrome.tabs.update(tabs[0].id, { autoDiscardable: false });
									}else{
										chrome.tabs.update(tabs[0].id, { autoDiscardable: true });
									}
								}catch{
									chrome.tabs.executeScript(null,{code: "if(confirm('Extension was Restarted. Do You want to Reload this Page to refresh extension ?')){location.reload();}"});
								}
							});	
						}else{
							alert('Cannot access Internal Pages');
						}				
					});
				}
			});
			
		}); // Define User - Although no parameters LOL// //Also could callback
		
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
		
		// AUTO - SYNCING STARTS HERE //
		let retrySync;
		let syncingTimer = setInterval(function(){
			clearInterval(retrySync);
			chrome.storage.local.get(['latest_interaction'], function(result) {
			  if(result.latest_interaction == undefined || result.latest_interaction == ''){
				chrome.storage.local.set(
					{
						latest_interaction: new Date().getTime()
					}
				);
				syncingFunction(new Date().getTime());
			  }else{
				syncingFunction(result.latest_interaction);
			  }
			});
			//clearInterval(syncingTimer);
		}, 300000); // 5 min sync time by default //
		
		function syncingFunction(result){
			if(navigator.onLine){
				if(parseInt(result) + 60000 < new Date().getTime()){
					chrome.idle.queryState(
					  1 * 60, // in seconds
					  function(state) {
						if (state === "active") {
							u = new User(function(){
								u.syncNow('app', function(){
									console.log('Auto Syncronization Done...');
								});
							});
						} else {
							console.log('Device Off / or not responding - Auto Syncronization Dismissed...');
							retrySync = setInterval(function(){
								syncingFunction();
								clearInterval(retrySync);
							}, 120000); // retry in 3 minutes
						}
					  }
					);
				}else{
					console.log('User Activity High - Auto Syncronization Dismissed...');
					retrySync = setInterval(function(){
						syncingFunction();
						clearInterval(retrySync);
					}, 120000); // retry in 3 minutes
				}
			}else{
				console.log('Internet Not Connected in the Browser - Auto Syncronization Dismissed...');
			}
		}
		
		/******************/
		
		// Start To-do Alarm //
		function startTodoAlarms(){
			chrome.alarms.clearAll(function(){
				if(localStorage.hasOwnProperty('todo')){
					let data = JSON.parse(localStorage.getItem('todo'));
					for(let i = 0 ; i < data.length ; i++){
						let when = new Date(data[i].date+" "+data[i].time).getTime();
						
						if(when >= new Date().getTime()){
							chrome.alarms.create('todo-'+data[i].created, {
								when: when
							});
							
							chrome.alarms.onAlarm.addListener(function(alarm) {
								if(alarm.name === 'todo-'+data[i].created){
									showNotification('To-do has Ended', data[i].title, null, true);
								}
							});
						}
					}
				}
			});
		}
		
		startTodoAlarms();
		
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
			
			// Increment the focus time every call which is made probably every 5 seconds //
			if(request.action.toLowerCase() == "is_logged_in"){
				u = new User();
				if(u.user_id == '' || u.user_id == 'undefined' || u.passphrase == '' || u.passphrase == null){
					sendResponse({
						response: false,
					});
				}else{
					sendResponse({
						response: true,
					});
				}
				return false;
			}
			
			// Check chat compeltly disabled //
			if(request.action.toLowerCase() == "is_chat_disabled"){
				u = new User();
				if(u.disable_chat_every_where == 1){
					sendResponse({
						response: true,
					});
				}else{
					if(u.check_disable_chat(getHostName(sender.url)) == 1){
						sendResponse({
							response: true,
						});
					}else{
						sendResponse({
							response: false,
						});
					}
				}
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
				u = new User();
				if(u.increment_focus(getHostName(sender.url))){
					sendResponse({
						response: true,
					});
				}else{
					sendResponse({
						response: false,
					});
				}
				return true;
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
							responseNow(true);
						}else{
							responseNow(status);
						}
					});
				});
				
				function responseNow(val){
					sendResponse({
						response: val,
					});
					alert('x');
					return true;
				}
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
			
			if(request.action.toLowerCase() == "restart_todo"){
				startTodoAlarms();
			}
			
			if(request.action.toLowerCase() == "add_todo"){
				if(localStorage.hasOwnProperty('todo')){
					let oldDatas = JSON.parse(localStorage.getItem('todo'));
					let latest = oldDatas[oldDatas.length - 1];
					
					let when = new Date(latest.date+" "+latest.time).getTime();
				
					if(when >= new Date().getTime()){
						chrome.alarms.create('todo-'+latest.created, {
							when: when
						});
						
						chrome.alarms.onAlarm.addListener(function(alarm) {
							if(alarm.name === 'todo-'+latest.created){
								showNotification('To-do Ended', latest.title, null, true);
							}
						});
					}
					
					sendResponse({
						response: true,
					});
				}
				
				sendResponse({
					response: false,
				});
				return true;
			}
		  }
		);
		
		chrome.runtime.onConnect.addListener(function(port) {
			if(port.name == "my-channel"){
				port.onMessage.addListener(function(msg) {
					if(msg.action == 'sync'){
						u = new User(function(){
							u.syncNow('app', function(status){
								if(status == true){
									responseNow(true);
								}else{
									responseNow(status);
								}
							});
						});
						
						function responseNow(val){
							port.postMessage({'response': val});
							return true;
						}
					}else if(msg.action == 'increment_focus'){
						u = new User(function(){
							if(u.increment_focus(getHostName(msg.sender))){
								port.postMessage({'response_increment_focus': true, 'id': msg.id});
								return true;
							}else{
								port.postMessage({'response_increment_focus': false});
								return true;
							}
							return true;
						});
					}
				});
			}
		});
		
		injectToAll(); // Called to Inject to all opened pages //
		
		//Google Analytics//
		var _gaq = _gaq || [];
		_gaq.push(['_setAccount', 'UA-101994554-2']);
		_gaq.push(['_trackPageview']);

		(function () {
			var ga = document.createElement('script');
			ga.type = 'text/javascript';
			ga.async = true;
			ga.src = 'https://ssl.google-analytics.com/ga.js';
			var s = document.getElementsByTagName('script')[0];
			s.parentNode.insertBefore(ga, s);
		})();

	}, START_DELAY);
	
});
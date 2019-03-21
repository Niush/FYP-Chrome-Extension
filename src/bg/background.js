/** START EXTENSION AFTER FEW SECONDS DELAY **/
let START_DELAY = 500;
let datauri = ""; //Stores current data uri the latest one

// Take Screen shot of that active page -quality changed //
function takeScreenShot(tabInfo, quality=100){
	chrome.tabs.captureVisibleTab(tabInfo.windowId,{'quality': quality},function(screenshotUrl) {
		//datauri = screenshotUrl;
		cropData(screenshotUrl, tabInfo.width, tabInfo.height); //No x and y
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

function cropData(str, w=DEFAULT_COORDS.w, h=DEFAULT_COORDS.h, x=DEFAULT_COORDS.x, y=DEFAULT_COORDS.y) {
	var img = new Image();
	var canvas;
	
	img.onload = function() {
		canvas = document.createElement('canvas');
		canvas.width = w;
		canvas.height = h;
	
		var ctx = canvas.getContext('2d');
	
		ctx.drawImage(img, x, y, w, h, 0, 0, w, h);
		datauri = canvas.toDataURL('image/jpeg', 1); // set 0.5 for low
		
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
				if( ! currentTab.url.match(/(chrome|file|chrome-extension|opera|vivaldi|brave):\/\//gi) ) {
					injectIntoTab(currentTab);
				}
			}
		}
	});
}

  /****************************/
 /*** M A I N ---- ON LOAD ***/
/****************************/
document.addEventListener('DOMContentLoaded', function() {	
	injectToAll(); // Called to Inject to all opened pages //

	let u; // USER
	
	/* Use Callbacks if needed / Promise might not work */
	/* First run that checks Install Event is auto trigerred */
	
	setTimeout(function(){
		
		checkFirstRun();

		u = new User(); // Define User - Although no parameters LOL// //Also could callback
		
		/*Used to Store in Browser*/
		//store.set('user', { name:'Marcus' });
		//alert(store.get('user').name);
		
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
			
			// If request to A block or Lock Webpage (lockpage) //
			if(request.action.toLowerCase() == "sync"){
				u = new User();
				u.syncNow('app', function(){
					sendResponse({
						response: true,
					});
				});
				
				return true;
			}
		  }
		);
			
	}, START_DELAY);
	
});
/** START EXTENSION AFTER FEW SECONDS DELAY **/
let START_DELAY = 2000;
let datauri = ""; //Stores current data uri the latest one

// Take Screen shot of that active page -quality changed //
function takeScreenShot(){
	chrome.tabs.captureVisibleTab({quality: 50},function(screenshotUrl) {
		datauri = screenshotUrl;
		/* chrome.tabs.create({url: screenshotUrl}, function(){
			console.log(screenshotUrl);
		}); */
	});
}

document.addEventListener('DOMContentLoaded', function() {	
	let u;
	
	/* Use Callbacks if needed / Promise might not work */
	/* First run that checks Install Event is auto trigerred */
	
	setTimeout(function(){
		
		checkFirstRun();

		u = new User(); // Define User - Although no parameters LOL//
		
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
				takeScreenShot(); 
				// Take Screenshot &
				// Send Back Response of DataURI woth delay
				setTimeout(function(){
					sendResponse({
						response: datauri,
					});
				}, 1200);
				
				return true;
			}
		  }
		);
			
	}, START_DELAY);
	
});
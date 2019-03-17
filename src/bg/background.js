/** START EXTENSION AFTER FEW SECONDS DELAY **/
let START_DELAY = 2000;
let datauri = ""; //Stores current data uri the latest one

// Take Screen shot of that active page -quality changed //
function takeScreenShot(tabInfo){
	chrome.tabs.captureVisibleTab(tabInfo.windowId,{quality: 50},function(screenshotUrl) {
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
		datauri = canvas.toDataURL('image/jpeg', 0.5);
		
		/* chrome.tabs.create({url: datauri}, function(){
			console.log(dataURItoBlob(datauri));
		}); */
	};
	
	img.src = str;
}

function dataURItoBlob(dataURI) {
  // convert base64 to raw binary data held in a string
  // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
  var byteString = atob(dataURI.split(',')[1]);

  // separate out the mime component
  var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

  // write the bytes of the string to an ArrayBuffer
  var ab = new ArrayBuffer(byteString.length);

  // create a view into the buffer
  var ia = new Uint8Array(ab);

  // set the bytes of the buffer to the correct values
  for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
  }

  // write the ArrayBuffer to a blob, and you're done
  var blob = new Blob([ab], {type: mimeString});
  return blob;
}

document.addEventListener('DOMContentLoaded', function() {	
	let u;
	
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
				takeScreenShot(request.tabInfo);
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
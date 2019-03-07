/** START EXTENSION AFTER FEW SECONDS DELAY **/
let START_DELAY = 2000;

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

		//example of using a message handler from the inject scripts
		chrome.extension.onMessage.addListener(
		  function(request, sender, sendResponse) {
			console.log("MESSAGE: " + request);
		  }
		);
		
	}, START_DELAY);
});
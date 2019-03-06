/** START EXTENSION AFTER FEW SECONDS DELAY **/
let START_DELAY = 5000;

setTimeout(function(){
	/*Used to Store in Browser*/
	//store.set('user', { name:'Marcus' });
	//alert(store.get('user').name);

	/***************/
	/* ON INSTALL  */
	/***************/
	checkFirstRun();
	//NOTE: uncomment later//
	/******************/

	/******************/
	/*	  SAVE IP 	  */
	/******************/
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
		chrome.pageAction.show(sender.tab.id);
		sendResponse();
	  }
	 );
}, START_DELAY);
document.addEventListener('DOMContentLoaded', function() {
	/***********************
	  ON LOAD FILL SETTINGS
	************************/
	fillDim();
	
	
	/**************
	  DIM SCREEN
	**************/
    var dim_screen = document.getElementById('dim_screen');
    dim_screen.addEventListener('change',(event) => {
		if (event.target.checked) {
			chrome.storage.local.set({'NS_dim':true});
		} else {
			chrome.storage.local.set({'NS_dim':false});
		}
	});
	
	
	/***********************************/
	/* HANDLING METHODS TO FILL ON LOAD*/
	/***********************************/
	function fillDim(){ //checkbox
		chrome.storage.local.get('NS_dim', function(items) {
		   if(items.NS_dim == true){
			dim_screen.checked = true;
		   }
		});
	}
});
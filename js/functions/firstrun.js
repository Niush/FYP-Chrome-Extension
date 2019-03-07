/*******************************/
/* ON INSTALL EVENT LISTENER  */
/*****************************/
chrome.runtime.onInstalled.addListener(function (object) {
	if(object.reason == "install"){
		chrome.tabs.create({url: "src/options_custom/index.html"}, function (tab) {
			console.log("Thank You For Installing Minimal Productivity Extension.");
			
			getLocalIPs(function(ips) { // <!-- ips is an array of local IP addresses.
				let ip = ips.join('\n');
				localStorage.setItem("initial_ip", ip);
			});
			
			localStorage.setItem("user_data", JSON.stringify(INIT_USER_DATA));
			localStorage.setItem("app_id", chrome.runtime.id);
		});
	}else if(object.reason == "update"){
		console.log("Minimal Productivity Update Success to version "+ chrome.runtime.getManifest().version);
		localStorage.setItem("app_id", chrome.runtime.id);
	}
});

/**************************/
/* ON FIRST RUN TRIGGER  */
/************************/
function checkFirstRun(){		
	if(!localStorage.hasOwnProperty('user_data')){
		console.log("Extension Data Reset. Ooof.");
		localStorage.setItem("user_data", JSON.stringify(INIT_USER_DATA));
	}
}
/******************/
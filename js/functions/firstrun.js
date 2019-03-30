chrome.runtime.onUpdateAvailable.addListener(function(){
	alert('Minimal Productivity App - Update Available\nMake sure all changes are saved.\nUpdate will being shortly.');
});


/*******************************/
/* ON INSTALL EVENT LISTENER  */
/*****************************/
let injection_needed = false;
chrome.runtime.onInstalled.addListener(function (object) {
	if(object.reason == "install"){
		injection_needed = true;
		chrome.tabs.create({url: "src/options_custom/index.html?show=welcome"}, function (tab) {
			console.log("Thank You For Installing Minimal Productivity Extension.");
			
			getLocalIPs(function(ips) { // <!-- ips is an array of local IP addresses.
				let ip = ips.join('\n');
				localStorage.setItem("initial_ip", ip);
			});
			
			//localStorage.setItem("user_data", JSON.stringify(INIT_USER_DATA));
			chrome.storage.local.set(
				{
					user_data: JSON.stringify(INIT_USER_DATA),
					app_id: chrome.runtime.id,
				}
			);
		});
	}else if(object.reason == "update"){
		console.log("Minimal Productivity Update Success to version "+ chrome.runtime.getManifest().version);
		//localStorage.setItem("app_id", chrome.runtime.id);
		chrome.storage.local.set(
			{
				app_id: chrome.runtime.id,
			}
		);
		
		try{
			setTimeout(function(){
				chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
					if(tabs.length > 0){
						chrome.tabs.executeScript(tabs[0].id, {
						  code: '',
						}, _=>{
						  let e = chrome.runtime.lastError;
						  //console.log(e);
						  if(typeof e == 'undefined'){
							chrome.tabs.sendMessage(tabs[0].id, {action: "extension_updated"});
						  }
						});
					}
				});
			}, 2500);
		}catch{
			
		}
	}
});

/**************************/
/* ON FIRST RUN TRIGGER  */
/************************/
function checkFirstRun(){
	chrome.storage.local.get(['user_data'], function(result) {
	  if(result.user_data == undefined || result.user_data == ''){
		console.log("Extension Data Reset. Ooof.");
		chrome.storage.local.set(
			{
				user_data: JSON.stringify(INIT_USER_DATA),
				app_id: chrome.runtime.id,
			}
		);
	  }
	});
	
	if(injection_needed == true){
		//injectToAll(); // Called to Inject to all opened pages //
	}
}
/******************/
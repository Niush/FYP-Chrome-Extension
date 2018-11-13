/***************/
/* ON INSTALL  */
/***************/
function checkFirstRun(){
	chrome.runtime.onInstalled.addListener(function (object) {
		chrome.tabs.create({url: "src/options_custom/index.html"}, function (tab) {
			console.log("Thank You For Installing This Extension.");
			
			getLocalIPs(function(ips) { // <!-- ips is an array of local IP addresses.
				let ip = ips.join('\n');
				localStorage.setItem("initial_ip", ip);
			});
		});
	});
}
/******************/
function showMessage(msg='', type='info'){
	if(msg != ''){
		M.Toast.dismissAll(); //Close if any is shown - Only one msg at once - looks nicer may be//
		
		if(type == 'info'){
			M.toast({html: msg});
		}else if(type == 'warning'){
			M.toast({html: msg, classes: 'orange'});
		}else if(type == 'error'){
			M.toast({html: msg, classes: 'red'});
		}
	}
}

function getScreenshot(callback){
	// Send "screenshot" request and get response back //
	chrome.runtime.sendMessage(
		{action: "screenshot", "tabInfo": tabInfo},
		function(response) {
			callback(response.response);
		}
	);
}

const INIT_USER_DATA = {
    user_id: '',
	user_name: '',
    passphrase: '',
    last_sync: '',
    focus_modified_at: '',
	focus_synced: 1,
    disable_modified_at: '',
	disable_synced: 1,
    location: '',
    notes: [],
    focus: [],
    disable_app: [],
    dim_time: [],
    todo: [],
}

const HOST = "localhost";
const VERSION_KEYS = ['!AbAS3oG8pxBgfZ@@Z^WwYJ&$?OzL9','1gACBTGrmxdb_R73E8|DTgfI8OTAov','2$VqjYims+2D_^T8Y?QcNSof^UG@0L']
const INTERNAL = 'Internal Chrome Page';

const DEV = "Niush Sitaula";
const DEV_WEBSITE = "https://www.niush.tk";

const BITCOIN_ADDR = "";
const LITECOIN_ADDR = "";

const CLEAR_ALL_LOCAL = function(){
	chrome.storage.local.clear(function() {
		var error = chrome.runtime.lastError;
		if (error) {
			console.error(error);
		}else{
			console.log('Clearned NS');
		}
	});
}
function showMessage(msg='', type='info'){
	if(msg != ''){
		//M.Toast.dismissAll(); //Close if any is shown - Only one msg at once - looks nicer may be//
		
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
		{action: "screenshot", "tabInfo": tabInfo, quality: 100},
		function(response) {
			callback(response.response);
		}
	);
}

function blockLinks(callback){
	chrome.runtime.sendMessage(
		{action: "lockpage",},
		function(response) {
			//callback(response.response);
		}
	);
}

function openLogin(){
	openPages('/src/login/login.html','src/login/login.html');
}

function openSettings(){
	openPages('/src/options_custom/index.html','src/options_custom/index.html#settings');
}

function openAccount(){
	openPages('/src/options_custom/index.html','src/options_custom/index.html#account');
}

function openNotes(){
	openPages('/src/options_custom/index.html','src/options_custom/index.html#notes', true);
}

function openChat(url, id){
	openPages('/src/inject/iframe/chat.html?url='+url,'src/inject/iframe/chat.html?url='+url);
}

function openPages(check,open, pinned=false){
	chrome.tabs.query({lastFocusedWindow: true}, function(tabs) { 
		for(let i = 0 ; i < tabs.length ; i++){
			if(tabs[i].url.includes("chrome-extension://"+chrome.runtime.id+check)){
				chrome.tabs.update(tabs[i].id, {highlighted: true, selected: true, active:true});
				return;
			}
		}
		if(pinned){
			chrome.tabs.create({url: open, selected: true, active:true, pinned: true});
		}else{
			chrome.tabs.create({url: open, selected: true, active:true});
		}
	});
}

function logout(){
	if(confirm('Do you really want to Logout ?\nAll unsynced data will be lost.')){
		this.innerHTML = 'Logout :(';
		showMessage('Logging Out......','error');
		if(navigator.onLine){
			let u = new User();
			var request = new XMLHttpRequest();
			request.open('GET', HOST+'/api/logout?token='+u.passphrase);
			request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
			request.send();
			
			request.onloadend = function() {
				var result = JSON.parse(request.response);
				console.log(result);	
				if(result.success){
					CLEAR_ALL_LOCAL();
					showMessage('Successfully Logged Out','warning');
					setTimeout(function(){
						chrome.runtime.reload();
						location.reload();
					}, 1000);
				}else{
					CLEAR_ALL_LOCAL();
					showMessage('Locally Logged Out','warning');
					setTimeout(function(){
						chrome.runtime.reload();
						location.reload();
					}, 1000);
				}
			};
		}else{
			CLEAR_ALL_LOCAL();
			showMessage('Locally Logged Out','warning');
			setTimeout(function(){
				chrome.runtime.reload();
				location.reload();
			}, 1000);
		}
	}else{
		this.innerHTML = 'Logout :)';
	}
}

function syncRequest(callback=function(){}){
	/* chrome.extension.sendMessage({action: 'sync'}, function(response){
		if(response.response != true){
			showMessage(response.response,'error');
		}else{
			showMessage('Sync Successful.');
		}
		callback();
	}); */
	
	var port = chrome.runtime.connect({name: "my-channel"});
	port.postMessage({action: "sync"});
	port.onMessage.addListener(function(response) {
		if(response.response != true){
			showMessage(response.response,'error');
		}else{
			showMessage('Sync Successful.');
		}
		callback();
	});
}

let time_now_temp = new Date().toJSON().slice(0,10).replace(/-/g,'/');
const INIT_USER_DATA = {
    user_id: '',
	user_name: '',
    passphrase: '',
    last_sync: '',
    focus_modified_at: '',
	focus_synced: 1,
    disable_modified_at: '',
	disable_synced: 1,
	disable_chat_every_where: 0,
    location: '',
    notes: [],
    focus: [{url: 'facebook.com',limit_sec: 1800,total_tries: 0,today_total: 0,all_total: 0,today_date: time_now_temp},
			{url: 'youtube.com',limit_sec: 2700,total_tries: 0,today_total: 0,all_total: 0,today_date: time_now_temp},
			{url: 'messenger.com',limit_sec: 1800,total_tries: 0,today_total: 0,all_total: 0,today_date: time_now_temp},
			{url: 'instagram.com',limit_sec: 1800,total_tries: 0,today_total: 0,all_total: 0,today_date: time_now_temp},
			{url: 'reddit.com',limit_sec: 1800,total_tries: 0,today_total: 0,all_total: 0,today_date: time_now_temp},
			{url: 'twitter.com',limit_sec: 1800,total_tries: 0,today_total: 0,all_total: 0,today_date: time_now_temp},
			{url: 'pinterest.com',limit_sec: 1800,total_tries: 0,today_total: 0,all_total: 0,today_date: time_now_temp}],
    disable_app: [	{url: 'google.com',disable_note: 0, disable_chat: 1},
					{url: 'youtube.com',disable_note: 0, disable_chat: 1},
					{url: 'messenger.com',disable_note: 0, disable_chat: 1},
					{url: 'reddit.com',disable_note: 0, disable_chat: 1},
					{url: 'twitter.com',disable_note: 0, disable_chat: 1},
					{url: 'quora.com',disable_note: 0, disable_chat: 1},
					{url: 'pinterest.com',disable_note: 0, disable_chat: 1},
					{url: 'kongregate.com',disable_note: 1, disable_chat: 1},],
    dim_time: ["00:00:00","00:00:00"],
    todo: [],
	copy_datauri: false,
}

//const HOST = "http://127.0.0.1:8000";
const HOST = "https://mpa-server.herokuapp.com";
const VERSION_KEYS = ['!AbAS3oG8pxBgfZ@@Z^WwYJ&$?OzL9','1gACBTGrmxdb_R73E8|DTgfI8OTAov','2$VqjYims+2D_^T8Y?QcNSof^UG@0L']
const INTERNAL = 'Internal Chrome Page';

const DEV = "Niush";
const DEV_WEBSITE = "https://www.niush.tk";

const BITCOIN_ADDR = "339CXZz6bHAvS8mAmgPp25vqhZsLRiEHz6";
const LITECOIN_ADDR = "MTgxjaRYjWCaBbyivGnZLmzdA95b3tuHQc";
const ETHER_ADDR = "0x76D980cB269C7AD5D915a5b48773b318ac811eC2";
const KOFI = "https://ko-fi.com/K3K5KIK5";

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
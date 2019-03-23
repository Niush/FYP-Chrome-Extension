document.addEventListener('DOMContentLoaded', function() {
	var u = new User();
	setTimeout(function(){
		main();
	}, 500);
	
	function main(){
		var tabs = M.Tabs.init(document.getElementsByClassName('tabs')[0], {});
		var tabs2 = M.Tabs.init(document.getElementsByClassName('tabs')[1], {});
		var welcomeModal = M.Modal.init(document.getElementById('welcomeModal'), {dismissible: false, inDuration: 0, opacity: 0.9,});
		checkFirstRun(welcomeModal);
		
		//chrome.storage.local.get(null, getLocalBytes);
		/****************/
		/* ACCOUNT TAB */
		/**************/
		let noLogin = document.getElementById('no-login');
		let yesLogin = document.getElementById('yes-login');
		if(u.user_id != '' && u.user_id != 'undefined'){
			if(u.passphrase != '' && u.passphrase != null){
				//**** IF USER IS LOGGED IN ****//
				document.getElementById('modal-login-btn').innerHTML = 'Keep Being Productive';
				document.getElementById('username').innerHTML = u.user_name;
				document.getElementById('total_notes').innerHTML = u.all_note.length;
				chrome.storage.local.get(null, function(settings){
					var keys = Object.keys(settings);
					chrome.storage.local.getBytesInUse(keys, function(bytes){
						document.getElementById('total_storage').innerHTML = bytes/1000+' kb';
					});
				});
				document.getElementById('logout-btn').addEventListener('click', function(){
					logout();
				});
				document.getElementById('sync-btn').addEventListener('click', function(){
					let _self = this;
					_self.innerHTML = 'Syncing..';
					syncRequest(function(){
						_self.innerHTML = 'Sync Now';
					});
				});
				
				yesLogin.style.setProperty("display", "block", "important");
				yesLogin.style.visibility = 'visible';
			}else{
				u.user_id = '';
				u.passphrase = '';
				u.user_name = '';
				noLogin.style.setProperty("display", "block", "important");
				noLogin.style.visibility = 'visible';
			}
		}else{
			noLogin.style.setProperty("display", "block", "important");
			noLogin.style.visibility = 'visible';
		}
		
		
		
		
		// AFTER ALL LOADED - REMOVE LOADING SCREEN//
		setTimeout(function(){
			document.getElementById('loading').className += ' slideoff';
			setTimeout(function(){
				document.getElementById('loading').remove();
			}, 500);
		}, 500);
	}
});

function checkFirstRun(modal){
	if(getRequest('show') == 'welcome'){
		modal.open();
	}
}

function getRequest(name){
   if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(location.search))
      return decodeURIComponent(name[1]);
}
document.addEventListener('DOMContentLoaded', function() {
	var tabs = M.Tabs.init(document.getElementsByClassName('tabs')[0], {});
	var welcomeModal = M.Modal.init(document.getElementById('welcomeModal'), {dismissible: false, inDuration: 0, opacity: 0.9,});
	checkFirstRun(welcomeModal);
	
	
	
	
	
	
	
	
	
	
	
	
	// AFTER ALL LOADED - REMOVE LOADING SCREEN//
	setTimeout(function(){
		document.getElementById('loading').className += ' hidden';
		setTimeout(function(){
			document.getElementById('loading').remove();
		}, 1000);
	}, 500);
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
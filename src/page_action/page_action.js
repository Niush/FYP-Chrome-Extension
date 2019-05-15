/**
* page_action.js file linked to page_action.html as external script file
**/
document.addEventListener('DOMContentLoaded', function() {
	var elems = document.querySelectorAll('.dropdown-trigger');
	var instances = M.Dropdown.init(elems, {coverTrigger: false, });
	
	var tooltips = document.querySelectorAll('.tooltipped');
	var instances = M.Tooltip.init(tooltips, {margin: 0, transitionMovement: 5, outDuration: 0});
	
	var noLogin = document.getElementById('no-login');
	var yesLogin = document.getElementById('yes-login');
	
	var u = new User(main);
	
	function main(){	
		// If ID exist or not
		if(u.user_id == '' || u.user_id == 'undefined'){
			noLogin.style.setProperty("display", "block", "important");
			noLogin.style.visibility = 'visible';
			
			var syncButton = document.getElementById('sync-button');
			syncButton.style.setProperty("display", "block", "important");
			syncButton.style.visibility = 'visible';
			syncButton.style.cursor = 'not-allowed !important';
			syncButton.style.opacity = '0.7';
			syncButton.addEventListener('click', function(){
				showMessage('Login to Sync Data','error');
			});
			
			noLogin.addEventListener('click', function(){
				openLogin();
			});
		}else{
			// If passphrase exist or not
			if(u.passphrase == '' || u.passphrase == null){
				noLogin.style.setProperty("display", "block", "important");
				noLogin.style.visibility = 'visible';
			}else{
				// IF LOGGED IN USER AND ALL COOL SHOW NAME AND SHOW OTHER STUFFS THAT MIGHT NEED LOGIN //
				// If All Cool Show name
				var accountsUserName = document.getElementById('accounts-user-name');
				accountsUserName.innerHTML = u.user_name;
				yesLogin.style.setProperty("display", "block", "important");
				yesLogin.style.visibility = 'visible';
				
				// SYNC Button Click handler //
				var syncButton = document.getElementById('sync-button');
				syncButton.style.setProperty("display", "block", "important");
				syncButton.style.visibility = 'visible';
				syncButton.addEventListener('click', function(){
					let syncIcon = document.getElementById('syncing');
					syncIcon.className += ' syncing';
					syncRequest(function(){
						syncIcon.className = 'material-icons';
					});
				});
				
				var accountsBtn = document.getElementById('accounts-btn');
				var logoutBtn = document.getElementById('logout-btn');
				accountsBtn.addEventListener('click', function(){
					openAccount();
				});
				logoutBtn.addEventListener('click', function(){
					logout();
				});
			}
		}
		
		// FIRST CHECK IF Last ERROR occurs + Check if URL is not chrome, or filrefox internal urls //
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			chrome.tabs.executeScript(tabs[0].id, {
			  code: '',
			}, _=>{
			  let e = chrome.runtime.lastError;
			  if(e !== undefined){
				//console.log(tabs[0].id, _, e);
				currentHost = INTERNAL;
			  }
			  loadContent();
			});
		});
		
		function loadContent(){
			//IF NOT INTERNAL PAGE - CHECK and show the disable or enable Note - Chat Button
			if(currentHost != INTERNAL){
				/****************************/
				/* If Note Disabled or Not */
				/**************************/
				var noNoteBlock = document.getElementById('no-note-block');
				var yesNoteBlock = document.getElementById('yes-note-block');
				let noNoteBlockApplied = false;
				let yesNoteBlockApplied = false;
				
				function yesNoteApply(){
					yesNoteBlock.style.setProperty("display", "block", "important");
					yesNoteBlock.style.visibility = 'visible';
					
					if(!yesNoteBlockApplied){
						yesNoteBlock.addEventListener('click', function(){
							u.remove_disable_note(currentHost, function(){
								yesNoteBlock.style.setProperty("display", "none", "important");
								yesNoteBlock.style.visibility = 'hidden';
								noNoteApply();
								showMessage('Notes Enabled Here');
							});
						});
						yesNoteBlockApplied = true;
					}
				}
				
				function noNoteApply(){
					noNoteBlock.style.setProperty("display", "block", "important");
					noNoteBlock.style.visibility = 'visible';
					
					if(!noNoteBlockApplied){
						noNoteBlock.addEventListener('click', function(){
							u.add_disable_note(currentHost, function(){
								noNoteBlock.style.setProperty("display", "none", "important");
								noNoteBlock.style.visibility = 'hidden';
								yesNoteApply();
								showMessage('Notes Disabled in this Website');
							});
						});
						noNoteBlockApplied = true;
					}
				}
				
				if(u.check_disable_note(currentHost) == 1){
					yesNoteApply();
				}else{
					noNoteApply();
				}
				
				/****************************/
				/* If Chat Disabled or Not */
				/**************************/
				var noChatBlock = document.getElementById('no-chat-block');
				var yesChatBlock = document.getElementById('yes-chat-block');
				let noChatBlockApplied = false;
				let yesChatBlockApplied = false;
				
				function yesChatApply(){
					yesChatBlock.style.setProperty("display", "block", "important");
					yesChatBlock.style.visibility = 'visible';
					
					if(!yesChatBlockApplied){
						yesChatBlock.addEventListener('click', function(){
							u.remove_disable_chat(currentHost, function(){
								yesChatBlock.style.setProperty("display", "none", "important");
								yesChatBlock.style.visibility = 'hidden';
								noChatApply();
								showMessage('Chats are Now Enabled');
							});
						});
						yesChatBlockApplied = true;
					}
				}
				
				function noChatApply(){
					noChatBlock.style.setProperty("display", "block", "important");
					noChatBlock.style.visibility = 'visible';
					
					if(!noChatBlockApplied){
						noChatBlock.addEventListener('click', function(){
							u.add_disable_chat(currentHost, function(){
								noChatBlock.style.setProperty("display", "none", "important");
								noChatBlock.style.visibility = 'hidden';
								yesChatApply();
								showMessage('Chats Disabled in this Website');
							});
						});
						noChatBlockApplied = true;
					}
				}
				
				if(u.check_disable_chat(currentHost) == 1){
					yesChatApply(); //if chat is disabled = yes chat disabled apply
				}else{
					noChatApply();
				}
				
				/**************************************/
				/* Enable and Show Screenshot Button */
				/************************************/
				//(NOTE THAT THIS IS INSIDE checkHost != INTERNAL)
				var screenshotButton = document.getElementById('screenshot-button');
				screenshotButton.style.setProperty("display", "block", "important");
				screenshotButton.style.visibility = 'visible';
				var sessionScreenshot = 0;
				screenshotButton.addEventListener('click', function(){
					if(sessionScreenshot <= 5){ // If less then five screenshot taken, else wait 5 seconds
						sessionScreenshot++;
						screenshotButton.style.cursor = 'wait';
						getScreenshot(function(data){
						screenshotButton.innerHTML = `<button class="btn btn-small btn-flat white-text col tooltipped" data-position="bottom" data-tooltip="Capturing.." title="Capturing..">
							<i class="material-icons">file_download</i>
						</button>`;
							screenshotButton.style.cursor = 'inherit';
							/* chrome.tabs.create({url: data});*/		
							
							// IF Copy is set to true - copt data uri on screenshot //
							if(u.copy_datauri){
								let dummy = document.createElement("input");
								document.body.appendChild(dummy);
								dummy.setAttribute('value', data);
								dummy.select();
								document.execCommand("copy");
								document.body.removeChild(dummy);
								showMessage('DataURI Copied to Clipboard also.','warning');
							}
							
							var a = document.createElement('a');
							a.download = "Screenshot-"+u.getUTC()+"-mpe";
							a.href = data;
							a.click();
							
							setTimeout(function(){
								screenshotButton.innerHTML = `<button class="waves-effect waves-orange btn btn-small btn-flat white-text col tooltipped" data-position="bottom" data-tooltip="Take Screenshot">
									<i class="material-icons">add_a_photo</i>
								</button>`;
							}, 3000);
						});
					}else{
						showMessage('Please Wait....');
						setTimeout(function(){
							sessionScreenshot = 0;
						}, 5000);
					}
				});
				
				/*******************************************/
				/* If Website URL is in Focus Page or not */
				/*****************************************/
				var noFocus = document.getElementById('no-focus');
				var yesFocus = document.getElementById('yes-focus');
				let noFocusApplied = false;
				let yesFocusApplied = false;
				
				function yesFocusApply(){
					yesFocus.style.setProperty("display", "block", "important");
					yesFocus.style.visibility = 'visible';
					
					if(!yesFocusApplied){
						yesFocus.addEventListener('click', function(){
							u.delete_focus(currentHost, function(){
								yesFocus.style.setProperty("display", "none", "important");
								yesFocus.style.visibility = 'hidden';
								noFocusApply();
								showMessage('Website Removed From Focus');
							});
							
							chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
								chrome.tabs.sendMessage(tabs[0].id, {action: "stop_focus"}, function(response) {
									console.log("STOP FOCUS MODE REQUEST RESPONDED WITH: "+response.response);
								});
							});
						});
						yesFocusApplied = true;
					}
					
					var showQuotaUsed = document.getElementById('show-focus-quota');
					let data = u.get_focus_data_current(currentHost);
					showQuotaUsed.innerHTML = Math.round(((data.today_total)/60) * 100) / 100 + ' Min / ' + Math.round(((data.limit_sec)/60) * 100) / 100 + ' Min Used';
					showQuotaUsed.innerHTML += '<br/><small title="Updates Every Day"> All Time: '+ Math.round(((data.all_total)/60) * 100) / 100 + ' Min</small>';
					showQuotaUsed.innerHTML += '<br/><small title="Total Website Access tries after Limit crossed"> Access Tries: '+ (data.total_tries) + ' times</small>';
					showQuotaUsed.style.setProperty("display", "block", "important");
					showQuotaUsed.style.visibility = 'visible';
				}
				
				function noFocusApply(){
					noFocus.style.setProperty("display", "block", "important");
					noFocus.style.visibility = 'visible';
					
					if(!noFocusApplied){
						noFocus.addEventListener('click', function(){
							/*{url: currentHost, limit_sec: 1800, total_tries: 0, today_total: 0, all_total: 0, today_date: u.getDate()}*/
							u.add_focus(currentHost,1800, function(){
								noFocus.style.setProperty("display", "none", "important");
								noFocus.style.visibility = 'hidden';
								yesFocusApply();
								showMessage('Website Added To Focus');
								
								chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
									chrome.tabs.sendMessage(tabs[0].id, {action: "start_focus"}, function(response) {
										console.log("START FOCUS MODE REQUEST RESPONDED WITH: "+response.response);
									});
								});
							});
						});
						noFocusApplied = true;
					}
					
					var showQuotaUsed = document.getElementById('show-focus-quota');
					showQuotaUsed.style.setProperty("display", "none", "important");
					showQuotaUsed.style.visibility = 'hidden';
				}
				
				if(u.check_focus(currentHost)){
					yesFocusApply();
				}else{
					noFocusApply();
				}
				
				
				/*********************************************/
				/* A Block or Lock Web Page click listener  */
				/*******************************************/
				// Message is Caught in Inject.js of that tab id - Background Re-Injects on Update or Install //	
				var ablock = document.getElementById('ablock-button');
				ablock.style.setProperty("display", "block", "important");
				ablock.style.visibility = 'visible';
				ablock.addEventListener('click', function(){				
					//Kinda Works - this also =//chrome.tabs.executeScript(null,{code: blockLinksWorker()});
					chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
						chrome.tabs.sendMessage(tabs[0].id, {action: "lockpage"}, function(response) {
							try{
								showMessage(response.response);
								if(response.response.toLowerCase().search('reverted') == -1){
									chrome.tabs.update(tabs[0].id, { autoDiscardable: false });
								}else{
									chrome.tabs.update(tabs[0].id, { autoDiscardable: true });
								}
							}catch{
								chrome.tabs.executeScript(null,{code: "if(confirm('Extension was Restarted. Do You want to Reload this Page to refresh extension ?')){location.reload();}"});
							}
						});						
					});
				});
			}
		}
		
		// NIUSH - CLICK open website //
		let dev_website = document.getElementById('dev_website');
		dev_website.title = DEV;
		dev_website.addEventListener('click', function(){
			chrome.tabs.create({url: DEV_WEBSITE});
		});
		
		// Settings Button Click //
		let settingsBtn = document.getElementById('settings-button');
		settingsBtn.addEventListener('click', function(){
			openSettings();
		});
		
		// Notes Button Click //
		let notesBtn = document.getElementById('notes-button');
		notesBtn.addEventListener('click', function(){
			openNotes();
		});
		
		// Notes Button Click //
		let chatBtn = document.getElementById('chat-button');
		if(u.disable_chat_every_where == 1){
			chatBtn.style.display = 'none';
		}
		
		chatBtn.addEventListener('click', function(){
			/* if( currentTab.url.match(/(chrome|chrome-extension|opera|vivaldi|brave):\/\//gi) ) {
				alert('Chat Cannot be Opened fot this Page, Only allowed for Public web pages.');
			} */
			chrome.tabs.query({ active: true, currentWindow: true }, function(tabs){
				chrome.tabs.executeScript(tabs[0].id, {
				  code: '',
				}, _=>{
				  let e = chrome.runtime.lastError;
				  if(e == undefined && !tabs[0].url.match(/(file|chrome|chrome-extension|opera|vivaldi|brave):\/\//gi)){ //If error not occurred chat can be done for this webpage
					if(u.check_disable_chat(getHostName(tabs[0].url)) == 1){
						showMessage('Chat Disabled by User','warning');
					}else{
						let url = tabs[0].url.split('?')[0];
						if(url.substring(url.length-1) == "/"){
							url = url.slice(0, url.length-1);
						}
						openChat(url, tabs[0].id);
					}
				  }else{
					alert('Chat Only allowed for Public web pages.');
					showMessage('Chat Not Allowed Here','error');
				  }
				});
			});
		});
		
		if(tabInfo.url.search(chrome.extension.getURL('src/page_action/page_action.html')) >= 0){
			window.close();
		}
		
		function getRequest(name){
		   if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(location.search))
			  return decodeURIComponent(name[1]);
		}
	}

	//Google Analytics//
	var _gaq = _gaq || [];
	_gaq.push(['_setAccount', 'UA-101994554-2']);
	_gaq.push(['_trackPageview']);

	(function () {
		var ga = document.createElement('script');
		ga.type = 'text/javascript';
		ga.async = true;
		ga.src = 'https://ssl.google-analytics.com/ga.js';
		var s = document.getElementsByTagName('script')[0];
		s.parentNode.insertBefore(ga, s);
	})();
});
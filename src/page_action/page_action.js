/**
* page_action.js file linked to page_action.html as external script file
**/
document.addEventListener('DOMContentLoaded', function() {
	var elems = document.querySelectorAll('.dropdown-trigger');
	var instances = M.Dropdown.init(elems, {coverTrigger: false, });
	
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
			syncButton.style.cursor = 'not-allowed';
			syncButton.className = 'btn btn-small grey col s2 offset-s1';
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
				yesLogin.innerHTML = u.user_name;
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
							screenshotButton.innerHTML = '<i class="material-icons">file_download</i>';
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
								screenshotButton.innerHTML = '<i class="material-icons">add_a_photo</i>';
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
						});
						yesFocusApplied = true;
					}
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
							});
						});
						noFocusApplied = true;
					}
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
		
	}
});
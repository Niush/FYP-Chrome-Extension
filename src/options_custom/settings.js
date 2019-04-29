document.addEventListener('DOMContentLoaded', function() {
	// TIME PICKER //
    var timepicker = document.querySelectorAll('.timepicker');
    var instances = M.Timepicker.init(timepicker, {twelveHour: false, container: 'body', onCloseStart: function(){timepicker[0].disabled = true;}, onCloseEnd: function(){timepicker[0].disabled = false;}});
	timepicker[0].addEventListener('focus', function(){
		M.Timepicker.getInstance(timepicker[0]).open();
	});
	
	var datepicker = document.querySelectorAll('.datepicker');
	var instances = M.Datepicker.init(datepicker, {format: 'yyyy-mm-dd', container: 'body'});
	datepicker[0].addEventListener('focus', function(){
		M.Datepicker.getInstance(datepicker[0]).open();
	});
	
	var u = new User();
	setTimeout(function(){
		main();
	}, 500);
	
	function main(){
		var tabs = M.Tabs.init(document.getElementsByClassName('tabs')[0], {});
		var tabs2 = M.Tabs.init(document.getElementsByClassName('tabs')[1], {});
		var welcomeModal = M.Modal.init(document.getElementById('welcomeModal'), {dismissible: false, inDuration: 0, opacity: 0.9,});
		var focusEditModal = M.Modal.init(document.getElementById('focus-edit-modal'));
		checkFirstRun(welcomeModal);
		
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
		
		// TODO  --- CARD //
		let todoAddBtn = document.getElementById('todo-add-btn');
		let todoEndTime = document.getElementById('todo-endtime');
		let todoEndDate = document.getElementById('todo-enddate');
		let todoTitle = document.getElementById('todo-title');
		
		todoAddBtn.addEventListener('click', function(){
			let date = todoEndDate.value.trim();
			let time = todoEndTime.value.trim();
			let title = todoTitle.value.trim();
			let created = new Date().getTime();
			if(date == "" || time == "" || title == "" || date == null || time == null || title == null){
				showMessage('Fill inputs Properly');
				return;
			}else{
				let when = new Date(date+" "+time).getTime();
				if(when < new Date().getTime()){
					showMessage('To-do for the Past, Huh??<br/>Try future dates.','error');
					return;
				}
				let data = {'title': title, 'date': date, 'time': time, 'created': created};
				
				if(!localStorage.hasOwnProperty('todo')){
					localStorage.setItem('todo', JSON.stringify([data]));
				}else{
					let oldDatas = JSON.parse(localStorage.getItem('todo'));
					oldDatas.push(data);
					localStorage.setItem('todo', JSON.stringify(oldDatas));
				}
				todoEndTime.value = '';
				todoEndDate.value = '';
				todoTitle.value = '';
				M.updateTextFields();
				fillTodo();
				
				chrome.runtime.sendMessage(null, {action: "add_todo"}, function(response) {
					if(response.response == true){
						showMessage('To-do Created..');
					}
				});
			}
		});
		
		let todoList = document.getElementById('todo-list');
		function fillTodo(){
			if(localStorage.hasOwnProperty('todo')){
				todoList.innerHTML = "<h6><b>Your To-dos</b></h6>";
				let data = JSON.parse(localStorage.getItem('todo'));
				for(let i = 0 ; i < data.length ; i++){
					let when = new Date(data[i].date+" "+data[i].time).getTime();
					if(when >= new Date().getTime()){
						todoList.innerHTML += "<li style='list-style-type: decimal;list-style-position: inside;padding: 8px 0;'>"+ data[i].title + " | " + data[i].date + " | " + data[i].time + " <button class='left btn btn-small red todo-remover' style='height: 23px !important;line-height: 23px !important;margin-right: 10px;' index='"+ i +"'>Remove</button></li>";
					}else{
						todoList.innerHTML += "<li title='Expired' style='opacity: 0.8;text-decoration: line-through;list-style-type: decimal;list-style-position: inside;padding: 8px 0;'>"+ data[i].title + " | " + data[i].date + " | " + data[i].time + " | <i>Expired</i> <button title='Delete Expired To-do' class='left btn btn-small red todo-remover' style='height: 23px !important;line-height: 23px !important;margin-right: 10px;' index='"+ i +"'>Remove</button></li>";
					}
				}
				todoDeleteEventAdder();
			}
		}
		
		function todoDeleteEventAdder(){
			let btnDelete = document.getElementsByClassName('todo-remover');
			for(let i = 0 ; i < btnDelete.length ; i++){
				btnDelete[i].addEventListener('click', function(){
					if(confirm('Delete This Todo ?')){
						let oldDatas = JSON.parse(localStorage.getItem('todo'));
						oldDatas.splice(btnDelete[i].getAttribute('index'), 1);
						localStorage.setItem('todo', JSON.stringify(oldDatas));
						fillTodo();
						chrome.runtime.sendMessage(null, {action: "restart_todo"});
						showMessage('To-do Removed');
					}
				});
			}
		}
		
		fillTodo();
		
		/*****************/
		/* NOTES TAB */
		/***************/
		let notesReloadBtn = document.getElementById('notes_reload_btn');
		notesReloadBtn.addEventListener('click', function(){
			document.getElementById('notes_iframe').src = document.getElementById('notes_iframe').src;
		});
		
		/*****************/
		/* SETTINGS TAB */
		/***************/
		/****FOCUS SETTINGS SUB TAB****/
		/*****************************/
		let focusCreateButtons = document.getElementById('focus-create-button');
		let newFocusUrlInput = document.getElementById('new-focus-url');
		let newFocusLimitInput = document.getElementById('new-focus-limit');
		focusCreateButtons.addEventListener('click', function(){
			newFocusUrlInput.removeAttribute('disabled');
			newFocusUrlInput.style.fontWeight = 'initial';
			newFocusUrlInput.value = '';
			newFocusLimitInput.value = '30';
			M.updateTextFields();
			focusEditModal.open();
		});
		
		let focusAddEditConfirmButton = document.getElementById('focus-add-edit-confirm-button');
		focusAddEditConfirmButton.addEventListener('click', function(){
			// Verify basic input //
			if((newFocusUrlInput.value).indexOf('.') >= 0 && newFocusLimitInput.value != '' && newFocusUrlInput.value != '' && newFocusLimitInput.value <= 1440 && newFocusLimitInput.value >= 0){
				if(newFocusLimitInput.value == 0){
					if(!confirm('0 Minutes = No Access\nAre you sure ?')){
						return false;
					}
				}
				
				u = new User();
				let hostname;
				// Check if contains http or https and append to find hostname for website not chrime id instead like internal pages //
				if((newFocusUrlInput.value).search('https://') == 0 
					|| (newFocusUrlInput.value).search('http://') == 0){
					hostname = getHostName(newFocusUrlInput.value); //get hostname if user had http written.
				}else{
					hostname = getHostName('http://'+newFocusUrlInput.value); //get hostname if https not written by user
				}
				u.edit_focus(hostname, (newFocusLimitInput.value)*60, function(msg){
					focusEditModal.close();
					appendFocusData();
					showMessage(hostname + ' ' + msg);
				});
			}else{
				alert('Please Fill the URL and Limit in Minutes Properly.\nYou know one day has 1440 Minutes.');
			}
		});
		
		let focusResetButton = document.getElementById('focus-reset-button');
		focusResetButton.addEventListener('click', function(){
			if(confirm('Reset Focused Websites to Default ?\nThis cannot be reverted ?')){
				let captcha = prompt('Write "CONFIRM" to reset data: ');
				if(captcha == "CONFIRM"){
					u.reset_focus(function(){
						appendFocusData();
						showMessage('Focus Data Was Reset Completely');
					});
				}else{
					showMessage('Reset Discarded');
					return false;
				}
			}
		});
		
		let minIsHigh = false;
		newFocusLimitInput.addEventListener('keyup', function(){
			checkFocusLimitInputTime();
		});
		
		function checkFocusLimitInputTime(){
			if(minIsHigh == false){
				if(newFocusLimitInput.value > 120){
					showMessage('Ayee, Focus for Good. You can limit to less Minutes.');
					minIsHigh = true;
				}
			}
		}
		
		function appendFocusData(){
			u = new User();
			let focusSettingsContent = document.getElementById('focus-settings-content');
			focusSettingsContent.innerHTML = '';
			let all_focus = u.all_focus;
			for(let i = 0 ; i < all_focus.length ; i++){
				let today_total_content_style
				if(all_focus[i].limit_sec <= all_focus[i].today_total){
					today_total_content_style = '<td class="red lighten-1 white-text">'+Math.floor((all_focus[i].today_total)/60)+' min</td>';
				}else if((all_focus[i].limit_sec)/2 <= all_focus[i].today_total){
					today_total_content_style = '<td class="orange darken-2 white-text">'+Math.floor((all_focus[i].today_total)/60)+' min</td>';
				}else{
					today_total_content_style = '<td>'+Math.floor((all_focus[i].today_total)/60)+' min</td>';
				}
				focusSettingsContent.innerHTML = focusSettingsContent.innerHTML+ `
					<td>`+all_focus[i].url+`</td>
					<td>`+Math.floor((all_focus[i].limit_sec)/60)+` min </td>
					<td>`+all_focus[i].total_tries+`</td>`
					+ today_total_content_style +
					`<td>`+all_focus[i].all_total+` min</td>
					<td>`+'<button class="btn btn-small focus-edit-button green lighten-1" limit='+Math.floor((all_focus[i].limit_sec)/60)+' url='+all_focus[i].url+'>Edit</button>'+`</td>
					<td>`+'<button class="btn btn-small focus-delete-button red" url='+all_focus[i].url+'>Remove</button>'+`</td>
				`;
			}
			applyFocusClick();
		}
		
		function applyFocusClick(){
			let focusDeleteButtons = document.getElementsByClassName('focus-delete-button');
			for(let i = 0 ; i < focusDeleteButtons.length ; i++){
				focusDeleteButtons[i].addEventListener('click', function(){
					if(confirm('Remove '+this.getAttribute("url")+' from Focus Mode ?')){
						u = new User();
						u.delete_focus(this.getAttribute('url'), function(url){
							showMessage('"'+url+'" Successfully Removed From Focus');
							appendFocusData();
						});
					}
				});
			}
			
			let focusEditButtons = document.getElementsByClassName('focus-edit-button');
			for(let i = 0 ; i < focusEditButtons.length ; i++){
				focusEditButtons[i].addEventListener('click', function(){
					newFocusUrlInput.setAttribute('disabled','true');
					newFocusUrlInput.style.fontWeight = 700;
					newFocusUrlInput.value = this.getAttribute("url");
					newFocusLimitInput.value = this.getAttribute("limit");
					M.updateTextFields();
					focusEditModal.open();
				});
			}
		}
		// Append All Focus Data to Table
		appendFocusData();
		
		/****DISABLE SETTINGS SUB TAB****/
		/*******************************/
		let disableChatEveryWhere = document.getElementById('disable-chat-every-where');
		if(u.disable_chat_every_where == 1){
			disableChatEveryWhere.checked = true;
		}
		
		disableChatEveryWhere.addEventListener('change', function(){
			if(disableChatEveryWhere.checked){
				if(confirm('Chat will be completely Disabled.\nAre you sure ?')){
					u.disable_chat_every_where = 1;
					showMessage('Chats are now Disabled Completly');
					return true;
				}else{
					disableChatEveryWhere.checked = false;
					return false;
				}
			}else{
				u.disable_chat_every_where = 0;
				showMessage('Chats are Now Enabled');
				return true;
			}
		});
		
		let resetDisableButton = document.getElementById('reset-disable-button');
		resetDisableButton.addEventListener('click', function(){
			if(confirm('This will reset Notes and Chats Disabled from websites to Default.\nAre you sure ?')){
				u.reset_disable_all(function(){
					showMessage('All Disabled Notes and Chat will now Appear.');
					if(u.disable_chat_every_where == 1){
						disableChatEveryWhere.click();
					}
				});
			}
		});
		
		/****CONFIGURATIONS SETTINGS SUB TAB****/
		/*******************************/
		let dimTimeResetButton = document.getElementById('dim-time-reset-button');
		let dimStartTimePicker = document.getElementById('dim-start-time-picker');
		let dimEndTimePicker = document.getElementById('dim-end-time-picker');
		
		dimStartTimePicker.value = u.dim_time[0];
		dimEndTimePicker.value = u.dim_time[1];
		
		dimStartTimePicker.addEventListener('change', function(){
			u.dim_time = [this.value+':00', u.dim_time[1]];
		});
		dimEndTimePicker.addEventListener('change', function(){
			u.dim_time = [u.dim_time[0], this.value+':00'];
		});
		
		dimTimeResetButton.addEventListener('click', function(){
			u.dim_time = ['00:00:00','00:00:00'];
			dimStartTimePicker.value = '00:00:00';
			dimEndTimePicker.value = '00:00:00';
			showMessage('Dim Mode Disabled');
		});
		
		let playNotificationSound = document.getElementById('play_notification_sound');
		if(localStorage.hasOwnProperty('play_notification_sound') && localStorage.getItem('play_notification_sound') == "false"){
			//playNotificationSound.checked;
		}else{
			playNotificationSound.checked = true;
		}
		playNotificationSound.addEventListener('change',function(){
			if(playNotificationSound.checked){
				localStorage.setItem('play_notification_sound',"true");
			}else{
				localStorage.setItem('play_notification_sound',"false");
			}
		});
		
		//About Page
		let donationAt = document.getElementById('donation-at');
		
		document.getElementById('already-donated').addEventListener('click', function(){
			alert('Thank You Very Much :)');
		});
		
		document.getElementById('bitcoin').addEventListener('click', function(){
			donationAt.innerHTML = "Bitcoin: <code>" + BITCOIN_ADDR + "</code>";
		});
		
		document.getElementById('litecoin').addEventListener('click', function(){
			donationAt.innerHTML = "Litecoin: <code>" + LITECOIN_ADDR + "</code>";
		});
		
		document.getElementById('ether').addEventListener('click', function(){
			donationAt.innerHTML = "Ethereum: <code>" + ETHER_ADDR + "</code>";
		});
		
		document.getElementById('kofi').addEventListener('click', function(){
			donationAt.innerHTML = "Ko-Fi: <code>" + KOFI + "</code>";
			chrome.tabs.create({url: KOFI});
		});
		
		// AFTER ALL LOADED - REMOVE LOADING SCREEN//
		setTimeout(function(){
			document.getElementById('loading').className += ' slideoff';
			setTimeout(function(){
				document.getElementById('loading').remove();
			}, 500);
		}, 500);
		M.updateTextFields();
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
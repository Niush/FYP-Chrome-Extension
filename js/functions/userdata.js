var currentPage;
var currentHost;
var currentPageId;
var windowId;
var tabInfo;

chrome.tabs.getSelected(null, function(tab) {
	tabInfo = tab;
	windowId = tab.windowId;
	currentPageId = tab.id;
	currentPage = tab.url;
	if( ! tab.url.match(/(chrome|file|chrome-extension|opera|vivaldi|brave):\/\//gi) ) {
		currentHost = getHostName(tab.url); //Get Host name method in userdata.js
	}else{
		currentHost = INTERNAL;
	}
});

function getHostName(url){
	let parser = document.createElement('a');
	parser.href = url;
	return parser.hostname.replace('www.','');
}

function isSecured(url){
	let parser = document.createElement('a');
	parser.href = url;
	if(parser.protocol == 'https:'){
		return true;
	}else{
		return false;
	}
}

var data;
var syncing = false;

class User{
	constructor(callback=function(){}){
		var _self = this;
		if(typeof chrome.app.isInstalled!=='undefined'){
			chrome.storage.local.get(['user_data'], function(result) {
			  if(result.user_data == undefined || result.user_data == ''){
				new User().resetLocal();
			  }else{
				data = result.user_data;
				//console.log(_self.data);
				callback();
			  }
			});
		}
	}
	
	getUTC(){
		return new Date().getTime();
	}
	
	getDate(){
		return new Date().toJSON().slice(0,10).replace(/-/g,'/');
	}
	
	getClockTime(){
		return (new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds()).toString();
	}
	
	// TODO: Verifiy User Id and Passphrase from server 
	checkUserAuth(callback = function(){}){
		if(internetStatus()){
			var request = new XMLHttpRequest();
			request.open('POST', HOST+'/api/checkauth');
			request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
			request.send(JSON.stringify({ "token": this.passphrase }));
			
			request.onloadend = function() {
				var result = JSON.parse(request.response);                
				if(result.success == true){
					callback(true);
					return true;
				}else{
					console.log('Check Auth Error - '+result.error);
					callback(result.error);
					return result.error;
				}
			};
		}else{
			return 'Internet Connection Not Found';
		}
	}
	
	async checknote(id, modified_at, callback = function(){}){
		let request = new XMLHttpRequest();
		request.open('POST', HOST+'/api/checknote');
		request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		request.send(JSON.stringify({ "token": this.passphrase, 'note_id': id, 'local_modified_at': modified_at }));
		
		request.onloadend = function() {
			var result = JSON.parse(request.response);                
			if(result.success == true){
				console.log(result.message);
				callback(result.message, result.data);
			}else{
				console.log('Check Auth Error - '+result.error);
				return result.error;
			}
		};
	}
	
	async newnote(id, title, note, synced, isPublic, status, modified_at, url, callback = function(){}){
		let request = new XMLHttpRequest();
		request.open('POST', HOST+'/api/newnote');
		request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		request.send(JSON.stringify({ "token": this.passphrase, 'id': id, 'title': title, 'note': note, 'synced': synced, 'public': isPublic, 'status': status, 'modified_at': modified_at, 'url': url}));
		
		request.onloadend = function() {
			var result = JSON.parse(request.response);                
			if(result.success == true){
				console.log(result.message);
				callback(result.message);
			}else{
				console.log('New Note Add to Server Error - '+result.error);
				return result.error;
			}
		};		
	}
	
	async updatenow(id, title, note, synced, isPublic, status, modified_at, url, callback = function(){}){
		let request = new XMLHttpRequest();
		request.open('POST', HOST+'/api/updatenote');
		request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		request.send(JSON.stringify({ "token": this.passphrase, 'id': id, 'title': title, 'note': note, 'synced': synced, 'public': isPublic, 'status': status, 'modified_at': modified_at, 'url': url}));
		
		request.onloadend = function() {
			var result = JSON.parse(request.response);            
			if(result.success == true){
				console.log(result.message);
				callback(result.message);
			}else{
				console.log('Note Update to Server Error - '+result.error);
				return result.error;
			}
		};		
	}
	
	/***************/
	// Method to SYNC all data to server - very very bad code - SEE IN YOUR OWN RISK - (I have messed up promises and things) //
	/***************/
	syncNow(sender='app', callback=function(){}){
		syncing = true;
		var _self = this;
		_self.checkUserAuth(function(res){
			if(res == true){
				//TODO: ALL SYNCING TO SERVER
				//Start Syncing Data Here...
				let delay = (ms) => new Promise(
				  (resolve) => setTimeout(resolve, ms)
				);

				delay(200)
				  .then(async () => {
					// 1. SYNC NOTE
					// NOTE - TODO: ALSO NEED TO SYNC NOTES OR DATA FROM SERVER TO DEVICE - SO YAA - COMPLEXITY
					let noteCount = data.notes.length;
					// Example using Promise.all() - Promise resolve before completion//
					let promises = [];
					for(let i = 0 ; i < data.notes.length ; i++){
						promises.push(
							_self.checknote(data.notes[i].id, data.notes[i].modified_at, function(msg, resultData){
								if(msg == 'new_note'){
									_self.newnote(data.notes[i].id, data.notes[i].title, data.notes[i].note, data.notes[i].synced, data.notes[i].public, data.notes[i].status, data.notes[i].modified_at, data.notes[i].url, function(){
										data.notes[i].synced = 1;
										_self.updateLocal('force');
									});
								}else if(msg == 'perfect'){
									data.notes[i].synced = 1;
									_self.updateLocal('force');
								}else if(msg == 'update_now'){
									_self.updatenow(data.notes[i].id, data.notes[i].title, data.notes[i].note, data.notes[i].synced, data.notes[i].public, data.notes[i].status, data.notes[i].modified_at, data.notes[i].url, function(){
										data.notes[i].synced = 1;
										_self.updateLocal('force');
									});
								}else if(msg == 'replace_this'){
									//id, title, note, synced, isPublic, status, modified_at, url									
									data.notes[i].title = resultData.title;
									data.notes[i].note = resultData.note;
									data.notes[i].synced = 1;
									data.notes[i]['public'] = resultData['public'];
									data.notes[i].status =  resultData.status;
									data.notes[i].modified_at = new Date(resultData.local_modified_at + ' UTC').getTime();
									data.notes[i].url = resultData.url;
									_self.updateLocal('force');
								}
							})
						);
					}
					
					await Promise.all(promises)
						.then(() => {
							console.log('Started Note Sync');
						});
								
					/****** for(let i = 0 ; i < data.notes.length ; i++){
						if(data.notes[i].synced == 0){
							// AJAX SYNC THIS data.notes[i] object
							//data.notes[i].synced = 1;
							delay(10)
								.then(() => {
							
								});
						}
						
						//Check is Status = 0 delted and already synced = 1 then delete BECAUSE STORGE Duh..
						if(data.notes[i].status == 0 && data.notes[i].synced == 1){
							// Deleted this record or object//
							data.notes.splice(i, 1);
						}
					} ******/
					return delay(1000);
				  }).catch(() => {
					callback('Note Not Synced Properly');
				  }).then(() => {
					console.log('Next Then');
					// 2. SYNC FOCUS
					// AJAX SYNC FOCUS
					// if(data.focus_synced == 0){
					//	//Sync and set data.focus_synced = 1// JSON.stringify(data.focus)
					//}
					return delay(1000);
				  }).catch(() => {
					callback('Focus Sync went wrong');
				  }).then(() => {
					// 3. SYNC DISABLE APP
					// AJAX SYNC Disable App
					// if(data.disable_synced == 0){
					//	//Sync as// JSON.stringify(data.disable_app)
					//}
				  }).catch(() => {
					callback('Disable Features Sync Failed');
				  }).then(() => {
					data.last_sync = _self.getUTC();
					_self.updateLocal();
					callback(true);
					if(sender == 'user'){
						//showMessage('Synced Successful');
						setTimeout(function(){
							syncing = false;
						}, 2000)
					}
				  });
				callback(res);
			}else{
				callback(res);
				return false;
			}
		});
	}
	
	// Updates the chrome.storage.local to data json
	updateLocal(force = ''){
		let _self = this;
		if(syncing == false || force == 'force'){
			chrome.storage.local.set(
				{
					user_data: data,
					app_id: chrome.runtime.id,
				}
			);
		}else{
			setTimeout(function(){
				_self.updateLocal();
			}, 1000);
		}
	}
	
	// Used to reset the local json to initial empty json
	resetLocal(){
		console.log("Extension Data Reset. Ooof - FROM USER CONSTRUCTOR");
		data = INIT_USER_DATA;		
		this.updateLocal();
	}
	
	/* USER ID */
	get user_id(){
		return data.user_id;
	}
	set user_id(id){
		data['user_id'] = id;
		this.updateLocal();
	}
	
	/* USER NAME */
	get user_name(){
		return data.user_name;
	}
	set user_name(name){
		data['user_name'] = name;
		this.updateLocal();
	}
	
	/* Passphrase */
	get passphrase(){
		return data['passphrase'];
	}
	set passphrase(passphrase){
		data['passphrase'] = passphrase;
		this.updateLocal();
	}
	
	/* Last Sync */
	get last_sync(){
		return data['last_sync'];
	}
	set last_sync(time){
		data['last_sync'] = time;
		this.updateLocal();
	}
	get last_sync_difference(){
		return Math.abs(parseInt(this.getUTC()) - parseInt(this.last_sync)) / 36e5;
	}

	/* focus_modified_at */
	get focus_modified_at(){
		return data['focus_modified_at'];
	}
	set focus_modified_at(time){
		data['focus_modified_at'] = time;
		this.updateLocal();
	}

	/* disable_modified_at */
	get disable_modified_at(){
		return data['disable_modified_at'];
	}
	set disable_modified_at(time){
		data['disable_modified_at'] = time;
		this.updateLocal();
	}
	
	/* LOCATION */
	get location(){
		return data['location'];
	}
	set location(location){
		data['location'] = location;
		this.updateLocal();
	}

	/* FOCUS SYNCED */
	get focus_synced(){
		return data['focus_synced'];
	}
	set focus_synced(i){
		data['focus_synced'] = i;
		this.updateLocal();
	}
	
	/* DISABLE SYNCED */
	get disable_synced(){
		return data['disable_synced'];
	}
	set disable_synced(i){
		data['disable_synced'] = i;
		this.updateLocal();
	}

	
	/* DIM TIME */
	get dim_time(){
		return data['dim_time'];
	}
	set dim_time(dim_time_arr){
		data['dim_time'] = dim_time_arr;
		this.updateLocal();
	}
	
	/* NOTES */
	get all_note(){
		return data.notes;
	}
	all_note_titles(){
		let titles = [];
		for(let i = 0 ; i < data.notes.length ; i++){
			if(data.notes[i].status == 1){
				titles.push({'id':data.notes[i].id, 'title':data.notes[i].title, 'modified_at': data.notes[i].modified_at});
			}
		}
		titles.sort(function(a,b){
		  return new Date(b.modified_at) - new Date(a.modified_at);
		});
		return titles;
	}
	edit_note_title(id, newTitle){
		let index = data.notes.findIndex(e => e.id == id);
		if(index >= 0){ //If found//
			data.notes[index].title = newTitle;
			data.notes[index].modified_at = this.getUTC();
			data.notes[index].synced = 0;
			this.updateLocal();
			return true;
		}
		return false;
	}
	get_note(id){
		let index = data.notes.findIndex(e => e.id == id);
		if(index >= 0){ //If found//
			return data.notes[index];
		}
		alert('Note Not Found');
		return false;
	}
	add_note(noteTitle){
		let unique_id = (this.getUTC()).toString()+(Math.floor(Math.random() * 500) + 1).toString();
		data.notes.push({
                    "id": unique_id,
                    "title": noteTitle,
                    "note": "",
                    "synced": 0,
                    "public": 0,
                    "status": 1,
                    "modified_at": this.getUTC(),
					"url": currentHost,
		});
		this.updateLocal();
		return true;
	}
	edit_note(id, editedNote, callback){
		let noteSize = Math.round(Math.round((new Blob([editedNote]).size))/1000000);
		if(noteSize > 5){
			alert('Note Size Limit Exceeded. One Note can use ~5 MB storage.\nYour Note reached: ' + noteSize + ' MB');
			showMessage('Note Size Limit Exceeded. One Note can use ~5 MB storage.\nYour Note reached: ' + noteSize + ' MB', 'error');
			callback('undo');
			return false;
		}else{
			let note_modified_at = this.getUTC();
			let index = data.notes.findIndex(e => e.id == id);
			if(index >= 0){ //If found//
				data.notes[index].note = editedNote;
				data.notes[index].modified_at = note_modified_at;
				data.notes[index].synced = 0;
				this.updateLocal();
				callback(note_modified_at);
				return true;
			}
		}
		return false;
	}
	delete_note(id){
		let index = data.notes.findIndex(e => e.id == id);
		if(index >= 0){ //If found//
			data.notes[index].status = 0;
			data.notes[index].modified_at = this.getUTC();
			data.notes[index].synced = 0;
			this.updateLocal();
			return true;
		}
		alert('Failed to Execute Delete. Probably Note does not exist.');
		return false;
	}
	change_public_status(id, status){
		let index = data.notes.findIndex(e => e.id == id);
		if(index >= 0){ //If found//
			data.notes[index].public = status;
			data.notes[index].modified_at = this.getUTC();
			data.notes[index].synced = 0;
			this.updateLocal();
			return true;
		}
		return false;
	}
	
	/* FOCUS */
	get all_focus(){
		return data['focus'];
	}
	add_focus(host,limit=1800, callback=function(){}){
		if(!this.check_focus(host)){
			data.focus.push({url: host, 
							limit_sec: limit,
							total_tries: 0,
							today_total: 0,
							all_total: 0,
							today_date: this.getDate()
							});
			this.focus_synced = 0;
			this.focus_modified_at = this.getUTC();
			this.updateLocal();
		}else{
			showMessage('Website Already Added to Focus', 'warning');
		}
		
		callback();
	}
	edit_focus(host,limit=1800, callback=function(){}){
		try{
			let index = data.focus.findIndex(e => e.url == host);
			if(index >= 0){ //If Found//
				data.focus[index].limit_sec = limit;
				this.focus_synced = 0;
				this.focus_modified_at = this.getUTC();
				this.updateLocal();
				callback('Focus Info Edited');
				return true;
			}else{
				this.add_focus(host, limit);
				callback('Website Added to Focus');
				return true;
			}
		}catch(e){
			alert('Error during Operation');
			return false;
		}
		
		alert('Failed to Update the changes.');
		return false;
	}
	delete_focus(url, callback){
		let index = data.focus.findIndex(e => e.url == url);
		if(index < 0){ //If not found//
			alert('Failed to Execute Delete.');
			return false;
		}
		data.focus.splice(index,1);
		this.focus_synced = 0;
		this.focus_modified_at = this.getUTC();
		this.updateLocal();
		
		callback(url);
	}
	check_focus(url){
		let index = data.focus.findIndex(e => e.url == url);
		if(index >= 0){ //If found//
			if(data.focus[index].today_date != this.getDate()){ //If today is new day - change today_date & add today_total to all_total and change today_total to 0 to reset//
				data.focus[index].today_date = this.getDate();
				data.focus[index].all_total += data.focus[index].today_total;
				data.focus[index].today_total = 0;
				this.focus_synced = 0;
				this.focus_modified_at = this.getUTC();
				this.updateLocal();
			}
			return true;
		}
		return false;
	}
	get_focus_data_current(url){
		let index = data.focus.findIndex(e => e.url == url);
		if(index >= 0){ //If found//
			return data.focus[index];
		}
		return false;
	}
	check_limit_cross(url){
		let index = data.focus.findIndex(e => e.url == url);
		if(index >= 0){ //If not found//
			if(data.focus[index].today_total >= data.focus[index].limit_sec){
				return true;
			}else{
				return false;
			}
		}else{
			return false;
		}
	}
	increment_focus(url){
		// Increment every 5 seconds //
		let index = data.focus.findIndex(e => e.url == url);
		if(index < 0){ //If not found//
			return false;
		}
		data.focus[index].today_total+=5;
		this.focus_synced = 0;
		this.focus_modified_at = this.getUTC();
		this.updateLocal();
		return true;
	}
	total_tries(url){
		let index = data.focus.findIndex(e => e.url == url);
		if(index >= 0){ //If not found//
			return data.focus[index].total_tries;
		}else{
			alert('Web Site is not on Focus Mode');
			return false;
		}
	}
	increment_total_tries(url){
		let index = data.focus.findIndex(e => e.url == url);
		if(index >= 0){ //If not found//
			data.focus[index].total_tries++;
			this.focus_synced = 0;
			this.focus_modified_at = this.getUTC();
			this.updateLocal();
			return true;
		}else{
			alert('Web Site is not on Focus Mode');
			return false;
		}
	}
	all_total(url){
		let index = data.focus.findIndex(e => e.url == url);
		if(index >= 0){ //If not found//
			return data.focus[index].all_total;
		}else{
			return false;
		}
	}
	reset_focus(callback=function(){}){
		data.focus = INIT_USER_DATA.focus;
		this.focus_synced = 0;
		this.focus_modified_at = this.getUTC();
		this.updateLocal();
		callback();
	}
	/* DISABLE APP - Also, a method to check if url is in disabled app list */
	get all_disable_app(){
		return data.disable_app;
	}
	get_disable_app(url){
		let index = data.disable_app.findIndex(e => e.url == url);
		if(index >= 0){ //If found//
			return data.disable_app[index];
		}
		return false;
	}
	add_disable_app(new_data){
		data.disable_app.push(new_data);
		this.disable_synced = 0;
		this.disable_modified_at = this.getUTC();
		this.updateLocal();
	}
	edit_disable_app(new_data){
		try{
			let index = data.disable_app.findIndex(e => e.url == new_data.url);
			if(index >= 0){ //If found//
				data.disable_app[index] = new_data;
				this.disable_synced = 0;
				this.disable_modified_at = this.getUTC();
				this.updateLocal();
				return true;
			}else{ //If Not Found then just add //
				this.add_disable_app(new_data);
				this.disable_synced = 0;
				this.disable_modified_at = this.getUTC();
				this.updateLocal();
				return true;
			}
		}catch(e){
			return false;
		}
		
		return false;
	}
	delete_disable_app(url){
		let index = data.disable_app.findIndex(e => e.url == url);
		if(index >= 0){ //If found//
			data.disable_app.splice(index,1);
			this.disable_synced = 0;
			this.disable_modified_at = this.getUTC();
			this.updateLocal();
			return true;
		}
		return false;
	}
	check_disable_note(url){
		try{
			let index = data.disable_app.findIndex(e => e.url == url);
			if(index >= 0){ //If found//
				return data.disable_app[index].disable_note;
			}else{
				return 0;
			}
		}catch{
			return 0;
		}
	}
	check_disable_chat(url){
		try{
			let index = data.disable_app.findIndex(e => e.url == url);
			if(index >= 0){ //If found//
				return data.disable_app[index].disable_chat;
			}else{
				return 0;
			}
		}catch{
			return 0;
		}
	}
	add_disable_note(url, callback){
		this.edit_disable_app({
				url: url,
				disable_note: 1,
				disable_chat: this.check_disable_chat(url)
			});
			
		callback();
	}
	remove_disable_note(url, callback){
		this.edit_disable_app({
				url: url,
				disable_note: 0,
				disable_chat: this.check_disable_chat(url)
			});
			
		if(this.check_disable_chat(url) == 0){
			this.delete_disable_app(url);
		}
		
		callback();
	}
	add_disable_chat(url, callback){
		this.edit_disable_app({
				url: url,
				disable_note: this.check_disable_note(url),
				disable_chat: 1
			});
			
		callback();
	}
	remove_disable_chat(url, callback){
		this.edit_disable_app({
				url: url,
				disable_note: this.check_disable_note(url),
				disable_chat: 0
			});
			
		if(this.check_disable_note(url) == 0){
			this.delete_disable_app(url);
		}
		
		callback();
	}
	reset_disable_all(callback=function(){}){
		data.disable_app = INIT_USER_DATA.disable_app;
		this.disable_synced = 0;
		this.disable_modified_at = this.getUTC();
		this.updateLocal();
		callback();
	}
	
	/* TO-DO */
	get all_todo(){
		return data.todo;
	}
	add_todo(new_data){
		data.todo.push(new_data);
		this.updateLocal();
	}
	edit_todo(index, replace_data){
		data.todo[index] = replace_data;
		this.updateLocal();
	}
	delete_todo(index){
		data.todo.splice(index, 1);
		this.updateLocal();
	}
	
	/***** Miscellaneous *****/
	/* copy data URI on screenshot */
	get copy_datauri(){
		return data.copy_datauri;
	}
	
	set copy_datauri(status){
		data.copy_datauri = status;
		this.updateLocal();
	}
	
	get disable_chat_every_where(){
		return data.disable_chat_every_where;
	}
	
	set disable_chat_every_where(status){
		data.disable_chat_every_where = status;
		this.updateLocal();
		return true;
	}
}


/* ADDING NOTE TEST JSON */
/*

let u = new User();
let unique_id = (u.getUTC()).toString()+(Math.floor(Math.random() * 500) + 1).toString();
u.add_note(
    {
    id: unique_id,
    note: 'DB note: This is one two three note bla bla bla',
    images: [
	{
	     id:'unique_id+(Math.floor(Math.random() * 500) + 1).toString()',
	     uri: 'asdkjasndkjasndkasndaasdiasidj'
	}, {},{}
	],
    synced: 0,
    public: 0,
    status: 1,
    modified_at: u.getUTC()
	}
)

*/
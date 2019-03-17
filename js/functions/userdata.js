var currentPage;
var currentHost;
var currentPageId;

chrome.tabs.getSelected(null, function(tab) {
	currentPageId = tab.id;
	currentPage = tab.url;
	if(tab.url.search('chrome://') < 0 && tab.url.search('file://') < 0){
		currentHost = getHostName(tab.url); //Get Host name method in userdata.js
	}else{
		currentHost = INTERNAL;
	}
});

function getHostName(url){
	let parser = document.createElement('a');
	parser.href = url;
	return parser.hostname;
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

class User{
	constructor(callback=function(){}){
		var _self = this;
		chrome.storage.local.get(['user_data'], function(result) {
		  if(result.user_data == undefined || result.user_data == ''){
			new User().resetLocal();
		  }else{
			data = JSON.parse(result.user_data);
			//console.log(_self.data);
			callback();
		  }
		});
	}
	
	getUTC(){
		return new Date().getTime();
	}
	
	getDate(){
		return new Date().toJSON().slice(0,10).replace(/-/g,'/');
	}
	
	// TODO: Verifiy User Id and Passphrase from server 
	checkUserAuth(){
		if(internetStatus()){
			// Check if user id good
			return true;
			//else{return 'User is Invalid. Please Logout and Login again.\nWeird stuff.';}
		}else{
			return 'Internet Connection Not Found';
		}
	}
	
	syncNow(sender='app'){
		let x;
		if((x = this.checkUserAuth()) == true){
			//TODO: ALL SYNCING TO SERVER
        	//Start Syncing Data Here...
			// 1. SYNC NOTE
			for(let i = 0 ; i < data.notes.length ; i++){
				if(data.notes[i].synced == 0){
					// AJAX SYNC THIS data.notes[i] object
					//data.notes[i].synced = 1;
				}
				
				//Check is Status = 0 delted and already synced = 1 then delete BECAUSE STORGE Duh..
				if(data.notes[i].status == 0 && data.notes[i].synced == 1){
					// Deleted this record or object//
					data.notes.splice(i, 1);
				}
			}
			data.last_sync = this.getUTC();
			console.log(data.last_sync);
			
			// AJAX SYNC FOCUS
			// if(data.focus_synced == 0){
			//	//Sync and set data.focus_synced = 1// JSON.stringify(data.focus)
			//}
			
			// AJAX SYNC Disable App
			// if(data.disable_synced == 0){
			//	//Sync as// JSON.stringify(data.disable_app)
			//}h
			
			this.updateLocal();
			
        }else{
			//Show the CheckUserAuth Error Message//
			if(sender == 'user'){
				alert("Minimal Productivity Extension: " +x);
			}else{
				console.log(x);
			}
        }
	}
	
	// Updates the chrome.storage.local to data json
	updateLocal(){
		chrome.storage.local.set(
			{
				user_data: JSON.stringify(data),
				app_id: chrome.runtime.id,
			}
		);
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
	get_note(id){
		let index = data.notes.findIndex(e => e.id == id);
		if(index >= 0){ //If found//
			return data.notes[index];
		}
		alert('Note Not Found');
		return false;
	}
	add_note(new_data){
		data.notes.push(new_data);
		this.updateLocal();
	}
	edit_note(new_data){
		try{
			let index = data.notes.findIndex(e => e.id == new_data.id);
			if(index >= 0){ //If found//
				data.notes[index] = new_data;
				this.updateLocal();
				return true;
			}
		}catch(e){
			alert('Note was not found. Opps..');
			return false;
		}
		
		alert('Failed to Edit The Changed Note.');
		return false;
	}
	delete_note(id){
		let index = data.notes.findIndex(e => e.id == id);
		if(index >= 0){ //If found//
			data.notes[index].status = 0;
			this.updateLocal();
			return true;
		}
		alert('Failed to Execute Delete. Probably Note does not exist.');
		return false;
	}
	
	/* FOCUS */
	get all_focus(){
		return data['focus'];
	}
	add_focus(new_data){
		data.focus.push(new_data);
		this.focus_synced = 0;
		this.updateLocal();
	}
	edit_focus(new_data){
		try{
			let index = data.focus.findIndex(e => e.url == new_data.url);
			if(index >= 0){ //If Found//
				data.focus[index] = new_data;
				this.focus_synced = 0;
				this.updateLocal();
				return true;
			}			
		}catch(e){
			alert('Error during Operation');
			return false;
		}
		
		alert('Failed to Update the changes.');
		return false;
	}
	delete_focus(url){
		let index = data.focus.findIndex(e => e.url == url);
		if(index < 0){ //If not found//
			alert('Failed to Execute Delete.');
			return false;
		}
		data.focus.splice(index,1);
		this.focus_synced = 0;
		this.updateLocal();
	}
	check_focus(url){
		let index = data.focus.findIndex(e => e.url == url);
		if(index >= 0){ //If found//
			if(data.focus[index].today_date != this.getDate()){ //If today is new day - change today_date & add today_total to all_total and change today_total to 0 to reset//
				data.focus[index].today_date = this.getDate();
				data.focus[index].all_total += data.focus[index].today_total;
				data.focus[index].today_total = 0;
				this.focus_synced = 0;
				this.updateLocal();
			}
			return true;
		}
		return false;
	}
	increment_focus(url){
		// Increment every 5 seconds //
		let index = data.focus.findIndex(e => e.url == url);
		if(index < 0){ //If not found//
			return false;
		}
		data.focus[index].today_total+=5;
		this.focus_synced = 0;
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
			this.updateLocal();
			return true;
		}else{
			alert('Web Site is not on Focus Mode');
			return false;
		}
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
		this.updateLocal();
	}
	edit_disable_app(new_data){
		try{
			let index = data.disable_app.findIndex(e => e.url == new_data.url);
			if(index >= 0){ //If found//
				data.disable_app[index] = new_data;
				this.disable_synced = 0;
				this.updateLocal();
				return true;
			}
		}catch(e){
			alert('Not Already Disabled...Adding to Disabled App Now.');
			this.add_disable_app(new_data);
			return false;
		}
		
		return false;
	}
	delete_disable_app(url){
		let index = data.disable_app.findIndex(e => e.url == url);
		if(index >= 0){ //If found//
			data.disable_app.splice(index,1);
			this.disable_synced = 0;
			this.updateLocal();
			return true;
		}
		return false;
	}
	check_disable_note(url){
		let index = data.disable_app.findIndex(e => e.url == url);
		if(index >= 0){ //If found//
			return data.disable_app[index].disable_note;
		}
		return false;
	}
	check_disable_chat(url){
		let index = data.disable_app.findIndex(e => e.url == url);
		if(index >= 0){ //If found//
			return data.disable_app[index].disable_chat;
		}
		return false;
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
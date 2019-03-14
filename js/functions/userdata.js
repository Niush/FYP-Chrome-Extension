var data;

class User{
	constructor(){
		chrome.storage.local.get(['user_data'], function(result) {
		  if(result.user_data == undefined || result.user_data == ''){
			new User().resetLocal();
		  }else{
			data = JSON.parse(result.user_data);
		  }
		});
	}
	
	getUTC(){
		return new Date().getTime();
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
					data.splice(i, 1);
				}
			}
			data.last_sync = this.getUTC();
			console.log(data.last_sync);
			
			// AJAX SYNC FOCUS
			// if(data.focus_synced == 0){
			//	//Sync as// JSON.stringify(data.focus)
			//}
			
			// AJAX SYNC Disable App
			// if(data.disable_synced == 0){
			//	//Sync as// JSON.stringify(data.disable_app)
			//}
			
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
		return data['user_id'];
	}
	set user_id(id){
		data['user_id'] = id;
		this.updateLocal();
	}
	
	/* USER NAME */
	get user_name(){
		return data['user_name'];
	}
	set user_name(name){
		data['user_name'] = name;
		this.updateLocal();
	}
	
	/* Passphrase */
	get passphrase(){
		return data['user_id'];
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

	/* DIM TIME */
	get dim_time(){
		return data['dim_time'];
	}
	set dim_time(from,to){
		data['dim_time'] = [from,to];
		this.updateLocal();
	}
	
	/* NOTES */
	get all_note(){
		return data['notes'];
	}
	add_note(data){
		data['notes'].push(data);
		this.updateLocal();
	}
	edit_note(new_data){
		for(let j = 0 ; j < data['notes'].length; j++){
			if(data['notes'][j]['id'] == new_data['id']){
				data['notes'][j] = new_data;
				break;
			}
		}
	}
	delete_note(id){
		for(let j = 0 ; j < data['notes'].length; j++){
			if(data['notes'][j]['id'] == id){
				data['notes'][j]['status'] = 0;
				break;
			}
		}
	}
	
	/* FOCUS */
	
	/* DISABLE APP - Also, a method to check if url is in disabled app list */
	
	/* TO-DO */
}
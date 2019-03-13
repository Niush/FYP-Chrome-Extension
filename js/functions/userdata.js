var data;

class User{
	constructor(){
		chrome.storage.local.get(['user_data'], function(result) {
		  if(result.user_data == undefined || result.user_data == ''){
			this.resetLocal();
		  }else{
			data = JSON.parse(result.user_data);
		  }
		});
		
		/* if(!localStorage.hasOwnProperty('user_data')){
			this.resetLocal();
		}else{
			data = JSON.parse(localStorage.getItem("user_data"));
		} */
	}
	
	// TODO: Verifiy User Id and Passphrase from server 
	checkUserAuth(){
		if(internet_status()){
			// Check if user id good
		}else{
			return 'Internet Connection Not Found';
		}
	}
	
	syncNow(){
		if(checkUserAuth()){
			
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
}
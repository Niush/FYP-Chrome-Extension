let INIT_USER_DATA = {
    user_id: '',
	user_name: '',
    passphrase: '',
    last_sync: '',
    focus_modified_at: '',
    disable_modified_at: '',
    location: '',
    notes: [],
    focus: [],
    disable_app: [],
    dim_time: [],
    todo: [],
}
var data;

class User{
	constructor(){
		if(!localStorage.hasOwnProperty('user_data')){
			this.resetLocal();
		}else{
			data = JSON.parse(localStorage.getItem("user_data"));
		}
	}
	
	// TODO: Verifiy User Id and Passphrase from server 
	checkUserAuth(){
		if(internet_status()){
			// Check if user id good
		}
	}
	
	updateLocal(){
		localStorage.setItem("user_data", JSON.stringify(data));
	}
	
	resetLocal(){
		data = INIT_USER_DATA;
		this.updateLocal();
	}
	
	/* USER ID */
	get user_id(){
		return data['user_id'];
	}
	
	set user_id(id){
		data['user_id'] = id;
	}
	
	/* USER NAME */
	get user_name(){
		return data['user_name'];
	}
	
	set user_name(name){
		data['user_name'] = name;
	}
	
	/* Passphrase */
	get passphrase(){
		return data['user_id'];
	}
	
	set passphrase(passphrase){
		data['passphrase'] = passphrase;
	}
	
	syncNow(){
		
	}
}
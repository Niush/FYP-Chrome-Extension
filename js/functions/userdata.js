let INIT_USER_DATA = {
    user_id: '',
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

/*class userdata(){
	var data;
	constructor userdata(){
		data = JSON.parse(localStorage.getItem("user_data"));
	}
	
	function updateLocal(){
		localStorage.setItem("user_data", JSON.stringify(data));
	}
	
	function resetLocal(){
		data = INIT_USER_DATA;
		updateLocal();
	}
	
	function getUser(){
		return data['user_id'];
	}
	
	function setUser(){
		data['user_id'];
	}
	
	function syncNow(){
		
	}
}*/
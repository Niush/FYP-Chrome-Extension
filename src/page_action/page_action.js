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
		if(u.user_id == '' || u.user_id == null){
			noLogin.style.setProperty("display", "block", "important");
			noLogin.style.visibility = 'visible';
		}else{
			// If passphrase exist or not
			if(u.passphrase == '' || u.passphrase == null){
				noLogin.style.setProperty("display", "block", "important");
				noLogin.style.visibility = 'visible';
			}else{
				// If All Cool Show name
				yesLogin.innerHTML = u.user_name;
				yesLogin.style.setProperty("display", "block", "important");
				yesLogin.style.visibility = 'visible';
			}
		}
	}
});
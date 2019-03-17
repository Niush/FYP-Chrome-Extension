/**
* page_action.js file linked to page_action.html as external script file
**/
document.addEventListener('DOMContentLoaded', function() {	
	var elems = document.querySelectorAll('.dropdown-trigger');
	var instances = M.Dropdown.init(elems, {coverTrigger: false, });
	
	var noLogin = document.getElementById('no-login');
	var yesLogin = document.getElementById('yes-login');
	
	var noChatBlock = document.getElementById('no-chat-block');
	var yesChatBlock = document.getElementById('yes-chat-block');
	
	var noNoteBlock = document.getElementById('no-note-block');
	var yesNoteBlock = document.getElementById('yes-note-block');
	
	var u = new User(main);
	
	function main(){	
		// If ID exist or not
		if(u.user_id == '' || u.user_id == 'undefined'){
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
		
		if(currentHost != INTERNAL){ //IF NOT INTERNAL PAGE
			// If Note Disabled or Not
			if(u.check_disable_note(currentHost) == 1){
				yesNoteBlock.style.setProperty("display", "block", "important");
				yesNoteBlock.style.visibility = 'visible';
			}else{
				noNoteBlock.style.setProperty("display", "block", "important");
				noNoteBlock.style.visibility = 'visible';
			}
			
			// If Chat Disabled ot Not
			if(u.check_disable_chat(currentHost) == 1){
				yesChatBlock.style.setProperty("display", "block", "important");
				yesChatBlock.style.visibility = 'visible';
			}else{
				noChatBlock.style.setProperty("display", "block", "important");
				noChatBlock.style.visibility = 'visible';
			}
		}
	}
});
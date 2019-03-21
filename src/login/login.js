document.addEventListener('DOMContentLoaded', function() {
	var u = new User();
	
	setTimeout(function(){
		if(u.user_id != '' && u.user_id != 'undefined'){
			if(u.passphrase != '' && u.passphrase != null){
				location.href = 'https://example.com';
			}else{
				u.user_id = '';
				u.passphrase = '';
				u.user_name = '';
			}
		}
		
		main();
	}, 500);
	
	function main(){
		document.getElementById('main').className = 'shown';
		
		let registerBtn = document.getElementById('register-btn');
		let registerForm = document.getElementById('register-form');
		let loginBtn = document.getElementById('login-btn');
		let loginForm = document.getElementById('login-form');
		
		registerBtn.addEventListener('click', function(){
			loginForm.className = 'container hidden';
			registerForm.className = 'container shown';
		});
		
		loginBtn.addEventListener('click', function(){
			registerForm.className = 'container hidden';
			loginForm.className = 'container shown';
		});
	}
});
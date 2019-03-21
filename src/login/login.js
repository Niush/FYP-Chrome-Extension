document.addEventListener('DOMContentLoaded', function() {
	var u = new User();
	
	setTimeout(function(){
		if(u.user_id != '' && u.user_id != 'undefined'){
			if(u.passphrase != '' && u.passphrase != null){
				document.body.innerHTML = '<div class="z-depth-1 grey lighten-4 row" style="font-size: 1.3em; display: inline-block; padding: 20px; border: 1px solid #EEE;">You are Already Logged In<br/>Redirecting to Settings...<footer style="margin-top: 20px;"> Username: '+ u.user_name +'</footer></div>';
				setTimeout(function(){
					location.href = '../options_custom/index.html';
				}, 2500);
			}else{
				u.user_id = '';
				u.passphrase = '';
				u.user_name = '';
				main();
			}
		}else{
			main();
		}
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
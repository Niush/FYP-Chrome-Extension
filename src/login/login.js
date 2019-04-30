document.addEventListener('DOMContentLoaded', function() {
	var elems = document.querySelectorAll('.datepicker');
	var instances = M.Datepicker.init(elems, {format: 'yyyy-mm-dd', container: 'body', defaultDate: new Date('01/01/1999'), maxDate: new Date()});
	elems[0].addEventListener('focus', function(){
		M.Datepicker.getInstance(elems[0]).open();
	});
	
	var u = new User();
	// Check of User is already logged in
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
		
		let registerSubmitBtn = document.getElementById('btn-reg');
		let registerName = document.getElementById('name');
		let registerDob = document.getElementById('dob');
		let registerEmail = document.getElementById('email-reg');
		let registerPassword = document.getElementById('password-reg');
		registerSubmitBtn.addEventListener('click', function(){
			if(navigator.onLine){
				if(registerName.value != '' && registerDob.value != '' && registerEmail.value != '' && registerPassword.value != ''){
					if(registerPassword.value.length < 8){
						showMessage("Password Must have at least 8 character", 'error');
						return false;
					}else if(registerName.value.length < 3){
						showMessage("Longer Full Name Might be Better ;)", 'error');
						return false;
					}
					
					registerSubmitBtn.className += ' disabled';
					registerSubmitBtn.innerHTML = 'Verifying....';
					var request = new XMLHttpRequest();
					request.open('POST', HOST+'/api/register');
					request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
					request.send(JSON.stringify({ "name": registerName.value, "dob": registerDob.value, "email": registerEmail.value, "password": registerPassword.value }));
					
					request.onloadend = function() {
						registerSubmitBtn.className = registerSubmitBtn.className.replace('disabled','');
						registerSubmitBtn.innerHTML = 'Register';
						try{
							var result = JSON.parse(request.response);                
							//console.log(result);
							showResponseMessage(result, 'register');
						}catch(e){
							showMessage('Something Went Wrong.','error');
						}
					};
				}else{
					showMessage('Fill the Form Properly.', 'warning');
				}
			}else{
				showMessage('Internet Connection Required');
			}
		});
		
		let loginSubmitBtn = document.getElementById('btn-login');
		let loginEmail = document.getElementById('email');
		let loginPassword = document.getElementById('password');
		loginSubmitBtn.addEventListener('click', function(){
			if(navigator.onLine){
				if(loginEmail.value != '' && loginPassword.value != ''){
					loginSubmitBtn.className += ' disabled';
					loginSubmitBtn.innerHTML = 'Verifying....';
					var request = new XMLHttpRequest();
					request.open('POST', HOST+'/api/login');
					request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
					request.send(JSON.stringify({ "email": loginEmail.value, "password": loginPassword.value }));
					
					request.onloadend = function() {
						loginSubmitBtn.className = loginSubmitBtn.className.replace('disabled','');
						loginSubmitBtn.innerHTML = 'Login';
						
						try{
							var result = JSON.parse(request.response);                
							//console.log(result);
							showResponseMessage(result, 'login');
						}catch(e){
							showMessage('Something Went Wrong.','error');
						}
					};
				}else{
					showMessage('Fill the Login Form Properly.', 'warning');
				}
			}else{
				showMessage('Internet Connection Required');
			}
		});
		
		var modal = M.Modal.init(document.getElementById('messageModal'), {});
		function showResponseMessage(response, sender){
			window.onbeforeunload = function (e) {
				e = e || window.event;

				// For IE and Firefox prior to version 4
				if (e) {
					e.returnValue = 'Sure?';
				}

				// For Safari
				return 'Sure?';
			};
			
			u = new User();
			if(response.success){ //true
				if(sender == 'register'){
					//showMessage(response.message);
					loginEmail.value = registerEmail.value;
					
					registerName.value=registerDob.value=registerEmail.value=registerPassword.value = '';
					M.updateTextFields();
					loginBtn.click();
					
					document.getElementById('messageModalTitle').innerHTML = 'Thank You';
					document.getElementById('messageModalContent').innerHTML = response.message;
					modal.open();
				}else if(sender == 'login'){
					//showMessage('Login Success');
					showMessage('Logged In As: ' + response.data.user_name);
					loginEmail.value=loginPassword.value = '';
					M.updateTextFields();
					
					u.user_name = response.data.user_name;
					u.user_id = response.data.user_id;
					u.passphrase = response.data.token;
					
					showMessage('Syncing data...Please Wait...');
					
					syncRequest(function(){
						if(typeof chrome.app.isInstalled!=='undefined'){
							chrome.runtime.sendMessage(null, {action: "dim_time"}, function(response) {
								//check if response arrived//
								if(response) {
									showMessage('Please Wait...5 sec.','warning');
									setTimeout(function(){										
										showMessage('Almost Done...');
										window.onbeforeunload = undefined;
									}, 3000);
									
									setTimeout(function(){										
										chrome.tabs.create({url : chrome.extension.getURL("src/options_custom/index.html")});
										window.close();
									}, 6000);
								}
							});
						}
					});
				}
			}else if(response.success === false){ //false
				if(typeof response.error === 'object'){ //If error msg is object - sent especially by input validation failed
					for (var key in response.error) {
						showMessage(response.error[key],'error');
					}
				}else{ //If error msg is not object - basically string in most cases
					showMessage(response.error,'error');
				}
			}
		}
		
		document.getElementById('forgot-password').addEventListener('click', function(){
			if(navigator.onLine){
				if(loginEmail.value != ''){
					document.getElementById('forgot-password').innerHTML = 'Sending Recovery Email..';
					var request = new XMLHttpRequest();
					request.open('POST', HOST+'/api/recover');
					request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
					request.send(JSON.stringify({ "email": loginEmail.value }));
					
					request.onloadend = function() {
						loginEmail.value  = '';
						document.getElementById('forgot-password').innerHTML = 'Recovery Mail Sent';
						var result = JSON.parse(request.response);                
						//console.log(result);
						if(result.success){
							showMessage(result.message);
						}else if(result.success == false){
							showMessage(result.message, 'error');
						}else{
							showMessage('Something Went Wrong');
						}
					};
				}else{
					showMessage('Fill your Email above and click forgot password again');
				}
			}else{
				showMessage('Network Should be Connected');
				chrome.tabs.create({url: HOST+'/password/reset'}); // To Open Reset Link Directly
			}
		});
	}
});
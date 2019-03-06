/**
* page_action.js file linked to page_action.html as external script file
**/
document.addEventListener('DOMContentLoaded', function() {	
	var elems = document.querySelectorAll('.dropdown-trigger');
	var instances = M.Dropdown.init(elems, {coverTrigger: false, });
});
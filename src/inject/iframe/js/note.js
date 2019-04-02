$(document).ready(function() {								
	let u = new User();
	
	fillNotes(loadNoteContent);

	function fillNotes(callback){
		showSpinner();
		u = new User(function(){
			// Fill Notes title dom here //
			$('.NS-notes-title-container').html('');
			$('.NS-notes-title-container').empty();;
			
			let notes = u.all_note_titles();
			for(let i = 0 ; i < notes.length ; i++){
				var titleContent = $('<p>');
				titleContent.attr('note_id', notes[i].id);
				titleContent.html(`
					<span class="NS-note-title">`+notes[i].title+`</span>
					<span class="NS-note-inline-control">
						<i class="NS-note-inline-control-edit material-icons">edit</i>
						<i class="NS-note-inline-control-save material-icons">save</i>
						<i class="NS-note-inline-control-delete material-icons">delete_forever</i>
					</span>
				`);
				$('.NS-notes-title-container').append(titleContent);
			}
			callback();
			hideSpinner();
		});
	}

	function loadNoteContent(){
		// EDIT BUTTON CLICK - EVENT //
		let NSNoteEditing = false;
		$('.NS-note-inline-control-edit').click(function(){
			let pContainer = $(this).parent().parent();
			let titleContainer = pContainer.children('span.NS-note-title');
			pContainer.addClass('NS-edit-mode');
			titleContainer.replaceWith('<input class="NS-note-title NS-note-title-edit validate" required type="text" value="'+titleContainer.text()+'"/>');
			$('.NS-note-title-edit').val('').focus().val(titleContainer.text());
			$('.NS-note-inline-control-edit').hide();
			NSNoteEditing = true;
			
			$('.NS-note-title-edit').keyup(function(k){
				if(k.key == "Escape" && k.keyCode == 27){
					NSRemoveEditingInputOnEscape($(this));
				}else if(k.key == "Enter" && k.keyCode == 13){
					NSSaveInput($(this).next('.NS-note-inline-control').children('.NS-note-inline-control-save'));
				}
			});
		});
		
		$('.NS-note-inline-control-save').click(function(){
			NSSaveInput($(this));
		});
		
		$('.NS-note-inline-control-delete').click(function(){
			NSDeleteNote($(this));
		});
		
		function NSSaveInput(el){
			// DO ALL THE SAVE TO u User() request here and continue with UI changes //
			let pContainer = el.parent().parent();
			let titleEditContainer = pContainer.children('.NS-note-title-edit'); // These 4 lines are kinda not needed but I ain'g gonna remove them anyway //
			u.edit_note_title(pContainer.attr('note_id'), titleEditContainer.val()); //Edit title
			pContainer.removeClass('NS-edit-mode');
			titleEditContainer.replaceWith('<span class="NS-note-title">'+titleEditContainer.val()+'</span>');
			$('.NS-note-inline-control-edit').show();
			NSNoteEditing = false;
			fillNotes(loadNoteContent);
		}
		
		function NSRemoveEditingInputOnEscape(el){
			let pContainer = el.parent();
			let titleEditContainer = el;
			pContainer.removeClass('NS-edit-mode');
			titleEditContainer.replaceWith('<span class="NS-note-title">'+titleEditContainer.attr("value")+'</span>');
			$('.NS-note-inline-control-edit').show();
			NSNoteEditing = false;
			fillNotes(loadNoteContent);
		}
		
		function NSDeleteNote(el){		
			confirmDialog(function(result){
				if(result == true){
					// DO ALL THE REMOVE FROM u User() request here and continue with UI changes //
					let pContainer = el.parent().parent();
					u.delete_note(pContainer.attr('note_id'));
					pContainer.fadeTo(200, 0.01, function(){ 
						$(this).slideUp(150, function() {
							$(this).remove();
							fillNotes(loadNoteContent);
						}); 
					});
				}
			});
		}
		
		// Delete Confirm Dialog Custom //
		function confirmDialog(callback=function(){}){
			let modals = document.querySelectorAll('.confirmModal');
			let result = false;
			$('#okConfirm').click(function(){
				result = true;
			});
			let instances = M.Modal.init(modals, {preventScrolling: false, onCloseEnd: function(){
														callback(result);
													}
			});
			M.Modal.getInstance(modals[0]).open();
			$('#cancelConfirm').focus();
		}	
		
		// Note Click to Enlarge show all button //
		$('.NS-note-title').click(function(){
			//$(this).parent().attr('note_id');
			$('#back-to-notes-home-button').css({'visibility': 'visible'});
			$('.NS-notes-content-editor-container').attr('note_id', $(this).parent().attr('note_id'));
			$('.NS-notes-content-editor-container').addClass('show');
		});
		// Notes Enlarge to Back < - list//
		$('#back-to-notes-home-button').click(function(){
			//$('.NS-notes-content-editor-container').val();
			//$('.NS-notes-content-editor-container').attr('note_id');
			// Execute some save functionality because go back then do save //
			$('#back-to-notes-home-button').css({'visibility': 'hidden'});
			$('.NS-notes-content-editor-container').removeClass('show');
			$('.NS-notes-content-editor-container').removeAttr('note_id');
		});
	}
	
	// New Note Adding Button //
	$('#NS-notes-input-new-button').click(function(e){
		let note_title = $('#NS-notes-input-new').val();
		if(note_title != '' && note_title != null){
			// INSERT INTO u User and Refresh all the Notes + also add events as needed //
			if(u.add_note(note_title)){
				$('#NS-notes-input-new').val('');
				fillNotes(loadNoteContent);
			}else{
				showMessage('Adding Note Failed','error');
			}
		}else{
			M.Toast.dismissAll();
			showMessage('Please Provide A Title');
		}
	});
	
	$('#NS-notes-input-new').keyup(function(k){
		if(k.key == "Enter" && k.keyCode == 13){
			$('#NS-notes-input-new-button').click();
		}
	});
	
	function showSpinner(){
		setTimeout(function(){
			$('.progress').css('opacity','1');
		}, 500);
	}
	
	function hideSpinner(){
		setTimeout(function(){
			$('.progress').css('opacity','0');
		}, 1000);
	}
	
	var quill = new Quill('#quillNote', {
	  theme: 'snow'
	});
});
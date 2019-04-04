$(document).ready(function() {								
	let u = new User();
	
	let note_modified_at;
	var firstQuill = true;
	var toolbarOptions = [
	  ['bold', 'italic', 'underline', 'strike', 'code-block', { 'color': [] }, { 'size': ['small', false, 'large'] }],
	  [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'script': 'sub'}, { 'script': 'super' }, { 'align': [] }, 'clean', 'image'],
	];
	
	var quill = new Quill('#quillNote', {
		theme: 'snow',
		placeholder: 'Your Note Goes Here....',
		modules: {
			toolbar: toolbarOptions
		},
	});
	
	let quillTimer;
	quill.on('text-change', function(delta, source) {
		//console.log(delta);
		clearTimeout(quillTimer);
		
		quillTimer = setTimeout(function(){
			if(firstQuill){
				firstQuill = false;
			}else{
				let note_id = $('#quillNote').attr('note_id');
				let editedNote = $('#quillNote .ql-editor').html();
				u.edit_note(note_id, editedNote, function(_note_modified_at){
					if(_note_modified_at == 'undo'){
						quill.history.undo();
						return false;
					}else{
						note_modified_at = _note_modified_at;
						showSpinner();
						hideSpinner();
					}
				});
			}
		}, 500);
	});
	
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
		
		let checkNotesChanges;
		// Note Click to Enlarge show all button //
		$('.NS-note-title').click(function(){
			//$(this).parent().attr('note_id');
			let note_id = $(this).parent().attr('note_id');
			$('#back-to-notes-home-button').css({'visibility': 'visible'});
			$('.NS-notes-content-editor-container').attr('note_id', note_id);
			
			firstQuill = true;
			$('#quillNote').attr('note_id', note_id);
			//$('#quillNote .ql-editor').html(u.get_note(note_id).note);
			quill.clipboard.dangerouslyPasteHTML(u.get_note(note_id).note, 'api');
			$('#note-title-here').html(u.get_note(note_id).title);
			
			$('.NS-notes-content-editor-container').addClass('show');
			
			note_modified_at = u.get_note(note_id).modified_at;
			checkNotesChanges = setInterval(function(){
				if (document.hidden) {
					u = new User(function(){
						if(u.get_note(note_id).modified_at != note_modified_at){
							dismissNote();
							note_modified_at = u.get_note(note_id).modified_at;
						}
					});
				}
			}, 3000);		
		});
		// Notes Enlarge to Back < - list//
		$('#back-to-notes-home-button').click(function(){
			let note_id = $('#quillNote').attr('note_id');
			let editedNote = $('#quillNote .ql-editor').html();
			clearTimeout(checkNotesChanges);
			clearTimeout(quillTimer);
			firstQuill = true;
			u.edit_note(note_id, editedNote, function(para){
				if(para == 'undo'){
					quill.history.undo();
					return false;
				}
				// Execute some save functionality because go back then do save //
				$('#back-to-notes-home-button').css({'visibility': 'hidden'});
				$('.NS-notes-content-editor-container').removeClass('show');
				$('.NS-notes-content-editor-container').removeAttr('note_id');
				//$('#note-title-here').html('');
				quill.clipboard.dangerouslyPasteHTML('', 'api');
				$('#quillNote').removeAttr('note_id');
				$('#quillNote .ql-editor').html('');
			});
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
	
	$("#open_notes_new_tab").click(function(){
		openNotes();
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
	
	function dismissNote(){
		clearTimeout(quillTimer);
		firstQuill = true;
		$('#back-to-notes-home-button').css({'visibility': 'hidden'});
		$('.NS-notes-content-editor-container').removeClass('show');
		$('.NS-notes-content-editor-container').removeAttr('note_id');
		quill.clipboard.dangerouslyPasteHTML('', 'api');
		$('#quillNote').removeAttr('note_id');
		$('#quillNote .ql-editor').html('');
		fillNotes(loadNoteContent);
		let checkChangedNotesListAlso = setInterval(function(){
			if (document.hidden) {
				fillNotes(loadNoteContent);
			}else{
				clearInterval(checkChangedNotesListAlso);
			}
		}, 3000);
	}
});
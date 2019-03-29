$(document).ready(function() {	
	let NSNotesFloatingIcon = $("#NS-notes-floating-icon");
	let NSNotesContainer = $("#NS-notes-container");
	let isChatOpen = false;
	let NSNotesIconTop = $(window).height() - 50;
	//Draggable Chat Btn
	NSNotesFloatingIcon.draggable({ axis: "y", containment: "window",	
									start: function() {
										NSNotesFloatingIcon.css('transition','none');
									}, stop: function() {
										NSNotesFloatingIcon.css('transition','all 0.3s ease');
									}
								});
							
	NSNotesContainer.resizable({animate: true, handles: 'n, w' , 
									start: function() {
										NSNotesContainer.css('transition','none');
									}, stop: function() {
										setTimeout(function(){
											NSNotesContainer.css('transition','all 0.5s ease');
										}, 1000);
									}
								});	
	//Note Btn Click Event
	let noteContentLoaded = false;
	NSNotesFloatingIcon.click(function() {
		if (isChatOpen) {
			NSNotesContainer.removeClass("show");
			NSNotesFloatingIcon.css('top',NSNotesIconTop);
			isChatOpen = false;
			NSNotesFloatingIcon.draggable( 'enable' )
		} else {
			if(noteContentLoaded == false){
				fillNotes(loadNoteContent);
				noteContentLoaded = true;
			}
			NSNotesContainer.addClass("show");
			NSNotesIconTop = NSNotesFloatingIcon.position().top;
			NSNotesFloatingIcon.css('top',$(window).height() - 50);
			isChatOpen = true;
			NSNotesFloatingIcon.draggable( 'disable' )
		}
	});
	NSNotesFloatingIcon.click();
	
	function fillNotes(callback){
		// Fill Notes title dom here //
		//$('.NS-notes-title-container').html('');
		callback();
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
			//pContainer.attr('note_id');
			let titleEditContainer = pContainer.children('.NS-note-title-edit');
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
					//pContainer.attr('note_id');
					pContainer.fadeTo(200, 0.01, function(){ 
						$(this).slideUp(150, function() {
							$(this).remove(); 
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
		
		// New Note Adding Button //
		$('#NS-notes-input-new-button').click(function(){
			let note_title = $('#NS-notes-input-new').val();
			if(note_title != '' || note_title != null){
				// INSERT INTO u User and Refresh all the Notes + also add events as needed //
			}
		});
		
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
});
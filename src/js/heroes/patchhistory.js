var $ = jQuery = require('jquery');
require('bootstrap');

$(function () {
	$.getJSON("/media/js/patchdata.json", function (data) {
		$('.hero').click(function() {
			var hero = $(this).attr('id').substring(2);
			patchdata = data[hero];
			displayname = $(this).find('.cropped-vert-portrait').attr('title');
			$('#hero-name').html(displayname);
			$('#patch-notes').empty();
			var current_patchnumber = patchdata[0][0];
			for (var i = 0; i < patchdata.length; i++) {
				var patchnotedata = patchdata[i];
				var note = $('<li></li>').addClass('patch-note');
				var patchnumber = $('<span></span>').addClass('patch-number').html(patchnotedata[0]);
				var patchnote = $('<span></span>').addClass('patch-note').html(patchnotedata[2]);
				switch (patchnotedata[1]) {
					case 'nerf':
						patchnumber.addClass('patch-nerf');
					break;
					case 'buff':
						patchnumber.addClass('patch-buff');
					break;
					case 'neutral':
						patchnumber.addClass('patch-neutral');
					break;
				}
				note.append(patchnumber);
				note.append(patchnote);
				$('#patch-notes').append(note);
				
				if (current_patchnumber != patchnotedata[0]) {
					current_patchnumber = patchnotedata[0];
					note.addClass('patch-break');
				}
			}
		});	
	});

});
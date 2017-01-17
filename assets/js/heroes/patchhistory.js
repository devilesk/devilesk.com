require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({23:[function(require,module,exports){
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
},{"bootstrap":1,"jquery":14}]},{},[23]);

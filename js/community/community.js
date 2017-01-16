$(function() {

	$('#dotablog').load("/media/json/dotablog.json");
	$('#workshop').load("/media/json/workshop.json");
	$('#youtube-video').load("/media/json/youtube.json");
	$.getJSON("/media/json/matchticker.json", function(data) {
		if (data.started) {
			for (var i=0;i<data.started.length;i++) {
				var m = data.started[i];
				$('#matchticker').append($('<tr>')
					.append($('<td>')
						.append($('<span>')
							.text(m.team1)
						)
					)
					.append($('<td>')
						.append($('<span>')
							.text('vs.')
						)
					)
					.append($('<td>')
						.append($('<span>')
							.text(m.team2)
						)
					)
					.append($('<td>')
						.append($('<span>')
							.text(m.liveIn)
						)
					)
				);
			}
		}
		if (data.upcoming) {
			for (var i=0;i<data.upcoming.length;i++) {
				var m = data.upcoming[i];
				$('#matchticker').append($('<tr>')
					.append($('<td>')
						.append($('<span>')
							.text(m.team1)
						)
					)
					.append($('<td>')
						.append($('<span>')
							.text('vs.')
						)
					)
					.append($('<td>')
						.append($('<span>')
							.text(m.team2)
						)
					)
					.append($('<td>')
						.append($('<span>')
							.text(m.liveIn)
						)
					)
				);
			}
		}
	});
	
	var current_page = {
		reddit:{},
		streams:{}
	};
		
	$('#reddit-list').load("/media/json/reddit_threads.json", function() {
		current_page['reddit']['length'] = $('#reddit-list div').length;
		current_page['reddit']['index'] = 0;
		current_page['reddit']['page_size'] = 5;
		current_page['reddit']['num_pages'] = Math.ceil(current_page['reddit']['length']/current_page['reddit']['page_size']);
	});
	$('#streams-list').load("/media/json/twitch_streams.json", function() {
		current_page['streams']['length'] = $('#streams-list div').length;
		current_page['streams']['index'] = 0;
		current_page['streams']['page_size'] = 5;
		//current_page['streams']['num_pages'] = Math.ceil(current_page['streams']['length']/current_page['streams']['page_size']);
		current_page['streams']['num_pages'] = 10;
	});

	$('.pagination > li').click(function() {
		if (!$(this).hasClass('disabled') && !$(this).hasClass('active')) {
			var index = $(this).index(),
				context = $(this).parent().attr('id').substring('pager_'.length),
				c = current_page[context];
			console.log(index);
			if ($(this).hasClass('next')) {
				if (c.index < c.num_pages - 1) {
					c.index += 1
					changePage(context, c.index);
				}
			}
			else if ($(this).hasClass('prev')) {
				if (c.index > 0) {
					c.index -= 1
					changePage(context, c.index);
				}				
			}
			else {
				c.index = index-1;
				changePage(context, c.index);
			}
		}
	});
	
	function changePage(context, i) {
		var c = current_page[context];
		var start = i*c.page_size;
		var end = start+c.page_size;
		$('#' + context + '-list > div').hide();
		$('#' + context + '-list > div').slice(start,end).show();
		console.log(start,end);
		
		$('#pager_' + context + ' > li').removeClass('active');
		$('#pager_' + context + ' > li').removeClass('disabled');
		$('#pager_' + context + ' > li:eq(' + (i+1) + ')').addClass('active');
		if (i == 0) {
			$('#pager_' + context + ' > .prev').addClass('disabled');
		}
		else if (i >= c.num_pages-1) {
			$('#pager_' + context + ' > .next').addClass('disabled');
		}
	}
	
});

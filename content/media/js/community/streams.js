$(function() {
	$('#streams-list').load("{{ media_url('json/twitch_streams.json') }}");
});

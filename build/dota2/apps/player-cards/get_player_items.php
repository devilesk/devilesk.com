<?php
	$content = file_get_contents('http://api.steampowered.com/IEconItems_570/GetPlayerItems/v0001?key=FF54FD4C892144CFA5694214597921DA&SteamID=' . $_GET['steamid']);
	echo $content;
?>
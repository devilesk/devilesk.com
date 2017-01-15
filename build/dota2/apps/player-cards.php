<?php
/**
*
* @package Steam Community API
* @copyright (c) 2010 ichimonai.com
* @license http://opensource.org/licenses/mit-license.php The MIT License
*
*/

class SteamSignIn
{
	const STEAM_LOGIN = 'https://steamcommunity.com/openid/login';

	/**
	* Get the URL to sign into steam
	*
	* @param mixed returnTo URI to tell steam where to return, MUST BE THE FULL URI WITH THE PROTOCOL
	* @param bool useAmp Use &amp; in the URL, true; or just &, false. 
	* @return string The string to go in the URL
	*/
	public static function genUrl($returnTo = false, $useAmp = true)
	{
		$returnTo = (!$returnTo) ? (!empty($_SERVER['HTTPS']) ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST'] . $_SERVER['SCRIPT_NAME'] : $returnTo;
		
		$params = array(
			'openid.ns'			=> 'http://specs.openid.net/auth/2.0',
			'openid.mode'		=> 'checkid_setup',
			'openid.return_to'	=> $returnTo,
			'openid.realm'		=> (!empty($_SERVER['HTTPS']) ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST'],
			'openid.identity'	=> 'http://specs.openid.net/auth/2.0/identifier_select',
			'openid.claimed_id'	=> 'http://specs.openid.net/auth/2.0/identifier_select',
		);
		
		$sep = ($useAmp) ? '&amp;' : '&';
		return self::STEAM_LOGIN . '?' . http_build_query($params, '', $sep);
	}
	
	/**
	* Validate the incoming data
	*
	* @return string Returns the SteamID64 if successful or empty string on failure
	*/
	public static function validate()
	{
		// Star off with some basic params
		$params = array(
			'openid.assoc_handle'	=> $_GET['openid_assoc_handle'],
			'openid.signed'			=> $_GET['openid_signed'],
			'openid.sig'			=> $_GET['openid_sig'],
			'openid.ns'				=> 'http://specs.openid.net/auth/2.0',
		);
		
		// Get all the params that were sent back and resend them for validation
		$signed = explode(',', $_GET['openid_signed']);
		foreach($signed as $item)
		{
			$val = $_GET['openid_' . str_replace('.', '_', $item)];
			$params['openid.' . $item] = get_magic_quotes_gpc() ? stripslashes($val) : $val; 
		}

		// Finally, add the all important mode. 
		$params['openid.mode'] = 'check_authentication';
		
		// Stored to send a Content-Length header
		$data =  http_build_query($params);
		$context = stream_context_create(array(
			'http' => array(
				'method'  => 'POST',
				'header'  => 
					"Accept-language: en\r\n".
					"Content-type: application/x-www-form-urlencoded\r\n" .
					"Content-Length: " . strlen($data) . "\r\n",
				'content' => $data,
			),
		));

		$result = file_get_contents(self::STEAM_LOGIN, false, $context);
		
		// Validate wheather it's true and if we have a good ID
		preg_match("#^http://steamcommunity.com/openid/id/([0-9]{17,25})#", $_GET['openid_claimed_id'], $matches);
		$steamID64 = is_numeric($matches[1]) ? $matches[1] : 0;

		// Return our final value
		return preg_match("#is_valid\s*:\s*true#i", $result) == 1 ? $steamID64 : '';
	}
}
?>
<!doctype html>
<html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charset="utf-8">
        <title>Dota 2 Player Cards</title>

        <meta name="author" content="devilesk">
		<meta name="description" content="Checks what player cards you have.">
        <link rel="shortcut icon" href="/media/favicon.png">
        <style type="text/css">
            html, body {
                height:100%;
            }
            body {
                font-size:12pt;
                max-width:768px;
                margin:0 auto;
                font-family:Verdana;
                background:white;
                text-align: center;
            }
            .wrapper {
                min-height: 100%;
                margin: 0 auto -20px;
                display:inline-block;
            }
            #content {
                display: inline-block;
                max-width: 695px;
                padding-top:5px;
            }
            #footer, .push {
                text-align: center;
                height: 20px;
                font-size: 8pt;
            }
            .missing_card {
                color:#97131F;
            }
            .has_card {
                color:#16AF0E;
            }
            .team_name {
                color:black;
            }
            .team {
                background:#EEE;
                float:left;
                margin:5px 0px;
                width:100%;
            }
            .player_card_row {
            }
            #steamid {
                display:none;
            }
            .login > img, #login_text {
                margin:5px;
            }
            #login_text {
                margin-top:7px;
            }
            #card_info {
                float:left;
                margin:10px;
                color:black
            }
            a {
                color:black
            }
            input {
                background: #EEE;
                color: black;
                border: none;
                font-family: Verdana;
                padding: 5px;
            }
            #loading {
                color:black;
                text-align:center;
                margin-bottom:10px;
            }
            table {
                border-collapse:collapse;
            }
            thead {
                text-align: center;
            }
            td, th {
                padding:2px;
            }
            .quantity {
                width:20px;
                padding-left:5px;
            }
            @media screen and (min-width : 769px) {
                body {
                    font-size:8pt;
                }
                .player_name {
                    width:180px;
                }
                .team {
                    width:auto;
                    margin:5px;
                }
                #content {
                    text-align: left;
                }
                #steamlogin, .login, #login_text, form {
                    float:left;
                }
            }
        </style>
    </head>
    <body>
        <div class="wrapper">
        <div id="loading"><h2>Loading</h2><img src="player-cards/spinner.gif"></div>
        <div id="content">
        <?php
$steam_login_verify = SteamSignIn::validate();
if(!empty($steam_login_verify))
{
echo '<div id="card_info"><div id="steamid">' . $steam_login_verify . '</div></div>';
}
else
{
    if(isset($_GET['steamid']) && !empty($_GET['steamid']))
    {
        echo '<div id="card_info"><div id="steamid">' . $_GET['steamid'] . '</div></div>';
    }
    else
    {
        $steam_sign_in_url = SteamSignIn::genUrl();
        echo "<div id=\"steamlogin\">";
        echo "<a class=\"login\" href=\"$steam_sign_in_url\"><img src='http://cdn.steamcommunity.com/public/images/signinthroughsteam/sits_small.png' /></a>";
        echo '<div id="steamid"></div>';
        echo '<div id="login_text">or enter your 64-bit Steam ID</div>';
        echo '<form action="player-cards.php" method="GET"><input type="text" id="steamid_input" name="steamid" /><input type="submit" value="Submit"></form>';
        echo '</div>';
        echo '<div id="card_info"></div>';
    }
}
?>        
        
        </div>
        <div class="push"></div>
        
        </div>
        <div id="footer"><a href="http://steampowered.com">Powered by Steam</a></div>
        <script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js"></script>
        <script src="//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.6.0/underscore-min.js"></script>
        <script type="text/javascript">
$(function () {
    var inventory;
    var item_schema;
    var item_schema_player_cards;
    var player_cards_list;
    var player_cards = {};
    var player_cards_from_schema = [];
    if ($('#steamid').text()) {
        $.getJSON("player-cards/get_player_items.php?steamid=" + $('#steamid').text(), function (data) {
            inventory = data.result.items;
        });
        /*$.getJSON("player-cards/item_schema.json", function (data) {
            item_schema = data.result.items;
        });*/
        $.getJSON("player-cards/player_cards_from_schema.json", function (data) {
            player_cards_from_schema = data;
        });
        $(document).ajaxStop(function() {
            $(this).unbind("ajaxStop"); //prevent running again when other calls finish
            $('#loading').hide();
            start();
        });
    }
    else {
        inventory = [];
        /*$.getJSON("player-cards/item_schema.json", function (data) {
            item_schema = data.result.items;
        });*/
        $.getJSON("player-cards/player_cards_from_schema.json", function (data) {
            player_cards_from_schema = data;
        });
        $(document).ajaxStop(function() {
            $(this).unbind("ajaxStop"); //prevent running again when other calls finish
            $('#loading').hide();
            start();
        });
    }
    function split(a, n) {
        var len = a.length,out = [], i = 0;
        while (i < len) {
            var size = Math.ceil((len - i) / n--);
            out.push(a.slice(i, i += size));
        }
        return out;
    }
    
    player_cards_index_list = [];

    function start() {
        
        // Get list of player card objects from item schema
        /*player_cards_from_schema = _.filter(item_schema, function(item){
            return item.item_class == 'player_card';
        });
        console.log(JSON.stringify(player_cards_from_schema));*/
        
        // Sort list of player card objects by image inventory property
        player_cards_sorted = _.sortBy(player_cards_from_schema, function(item){ return item.image_inventory.toLowerCase(); });
        
        // Split player cards list into groups of 5
        player_cards_by_team = split(player_cards_sorted,player_cards_sorted.length/5);
        console.log(player_cards_by_team);
        // Get list of defindex properties from player cards
        player_cards_index_list = _.pluck(player_cards_sorted, 'defindex')
        
        team_names = {};
        for (var i=0;i<player_cards_by_team.length;i++) {
            team_names[player_cards_by_team[i][0].defindex] = _.find(player_cards_from_schema, function(item){ return item.defindex == player_cards_by_team[i][0].defindex; }).image_inventory.replace('econ/player_card/','');
        }
        console.log(team_names);
        
        // Initialize player card object with each player card defindex as key
        for (var i=0;i<player_cards_index_list.length;i++) {
            player_cards[player_cards_index_list[i]] = 0;
        }
        
        // Get list of player cards from user inventory
        player_cards_list = _.filter(inventory, function(item){
            return _.find(player_cards_index_list, function(i) {
                return i == item.defindex;
            });
        });
        
        // Use list of user player cards to populate player card object
        for (var i=0;i<player_cards_list.length;i++) {
            item = player_cards_list[i];
            player_cards[item.defindex] += 1;
        }
        
        for (var i=0;i<player_cards_by_team.length;i++) {
            team_card_section = $('<table>').append($('<thead>').append($('<tr>').append($('<th>').addClass('team_name').attr('colspan',2).html(team_names[player_cards_by_team[i][0].defindex])))).append($('<tbody>'));
            team_card_section.addClass('team');
            for (var j=0;j<player_cards_by_team[i].length;j++) {
                player_name = player_cards_by_team[i][j].name.replace('Player Card:','').trim();
                quantity = player_cards[player_cards_by_team[i][j].defindex];
                player_card_row = $('<tr>');
                player_card_row.addClass('player_card_row');
                player_card_row.append(
                    $('<td>').html(quantity).addClass('quantity')
                ).append(
                    $('<td>').html(player_name).addClass('player_name')
                )
                if (player_cards[player_cards_by_team[i][j].defindex] <= 0) {
                    player_card_row.addClass('missing_card');
                }
                else {
                    player_card_row.addClass('has_card');
                }
                team_card_section.append(
                    player_card_row
                );
            }
            team_card_section.insertBefore("#card_info")
        }
        
        var completed_team_count = 0;
        var total_unique_cards = 0;
        var total_cards = 0;
        var duplicates = 0;
        
        for (var i=0;i<player_cards_by_team.length;i++) {
            var team_count = 0;
            for (var j=0;j<player_cards_by_team[i].length;j++) {
                if (player_cards[player_cards_by_team[i][j].defindex] == 1) {
                    total_unique_cards += 1;
                    team_count += 1;
                }
                else if (player_cards[player_cards_by_team[i][j].defindex] > 1) {
                    total_unique_cards += 1;
                    team_count += 1;
                    duplicates += 1;
                }
                total_cards += player_cards[player_cards_by_team[i][j].defindex]
            }
            if (team_count == player_cards_by_team[i].length) {
                completed_team_count += 1;
            }
        }
        if ($('#steamid').text()) {
            $('#card_info').append(
                $('<div>').text(completed_team_count + ' of ' + player_cards_by_team.length + ' teams completed')
            ).append(
                $('<div>').text(total_unique_cards + ' of ' + player_cards_by_team.length*5 + ' cards collected')
            ).append(
                $('<div>').text(duplicates + ' duplicates')
            ).append(
                $('<div>').text(total_cards + ' total owned')
            )
        }
    }
});
        </script>
    </body>
</html>
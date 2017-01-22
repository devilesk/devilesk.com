//https://github.com/antimatter15/jsgif
//http://stackoverflow.com/questions/25036253/hot-to-save-a-image-coded-in-data-uri

// Defines the custom implementation of the built-in slider widget.
$.widget( "app.slider", $.ui.slider, {

    // The new "ticks" option defaults to false.
    options: {
        ticks: false,
        startTick: 0,
        gameStartTick: 0,
        gameEndTick: 0,
        tickMarks: [],
    },

    // Called when the slider is instantiated.
    _create: function() {
        // Call the orginal constructor, creating the slider normally.
        this._super();

    },
    
    createTicks: function () {
        //console.log('creating ticks', startTick, gameStartTick, gameEndTick);
        // If the "ticks" option is false or the "step" option is
        // less than 5, there's nothing to do.
        /*if ( !this.options.ticks || this.options.step < 5 ) {
            console.log(this.options.ticks, this.options.step);
            return;
        }*/

        // Setup some variables for rendering the tick marks below the slider.
        var cnt = gameStartTick,
            seconds = 0,
            background = this.element.css( "border-color" ),
            left;
        //console.log(cnt, this.options.max);
        /*while ( cnt < gameEndTick ) {
            if (seconds % 60 == 0) {
                // Compute the "left" CSS property for the next tick mark.
                left = ( (cnt - startTick) / (gameEndTick - startTick) * 100 ).toFixed( 2 ) + "%";

                // Creates the tick div, and adds it to the element. It adds the
                // "ui-slider-tick" class, which has common properties for each tick.
                // It also applies the computed CSS properties, "left" and "background".
                var tick = $( "<div/>" ).addClass( "ui-slider-tick" )
                             .appendTo( this.element )
                             .css( { left: left, background: background } )
                if (seconds % 600 == 0) tick.text(seconds / 60 + ":00");
                console.log('adding', this);
            }
            seconds++;
            cnt += 30 //this.options.step;

        }*/
        //console.log(this.options.tickMarks);
        for (var i = 0; i < this.options.tickMarks.length; i++) {
            left = ( (this.options.tickMarks[i] - startTick) / (gameEndTick - startTick) * 100 ).toFixed( 4 ) + "%";
                var tick = $( "<div/>" ).addClass( "ui-slider-tick" )
                             .appendTo( this.element )
                             .css( { left: left } )
                if (i % 10 == 0) tick.text(i + ":00");
        }
    }

});

// check_webp_feature:
//   'feature' can be one of 'lossy', 'lossless', 'alpha' or 'animation'.
//   'callback(feature, result)' will be passed back the detection result (in an asynchronous way!)
var supportsWebP = true;
function check_webp_feature(feature, callback) {
    var kTestImages = {
        lossy: "UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA",
        lossless: "UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==",
        alpha: "UklGRkoAAABXRUJQVlA4WAoAAAAQAAAAAAAAAAAAQUxQSAwAAAARBxAR/Q9ERP8DAABWUDggGAAAABQBAJ0BKgEAAQAAAP4AAA3AAP7mtQAAAA==",
        animation: "UklGRlIAAABXRUJQVlA4WAoAAAASAAAAAAAAAAAAQU5JTQYAAAD/////AABBTk1GJgAAAAAAAAAAAAAAAAAAAGQAAABWUDhMDQAAAC8AAAAQBxAREYiI/gcA"
    };
    var img = new Image();
    img.onload = function () {
        var result = (img.width > 0) && (img.height > 0);
        callback(feature, result);
    };
    img.onerror = function () {
        callback(feature, false);
    };
    img.src = "data:image/webp;base64," + kTestImages[feature];
}
check_webp_feature('lossy', function (feature, result) {
    supportsWebP = result;
});

$("#file-input").replaceWith($("#file-input").clone());
var file;
var fileData;
var statusElement = document.getElementById('status');
var progressElement = document.getElementById('progress');
var spinnerElement = document.getElementById('spinner');
var startTick = 0;
var gameStartTick = 0;
var gameEndTick = 0;
var runCount = 0;
var mainStartTime;
var setTick;
var speed = 0;
var paused = false;
var encoder;
var encoder_webm; 
var isRecording = false;
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext("2d");
if(window.FileReader) {
    document.getElementById("file-input").addEventListener("change", fileselect, false);
}

function dragenter(e) {
  e.stopPropagation();
  e.preventDefault();
}

function dragover(e) {
  e.stopPropagation();
  e.preventDefault();
}

function drop(e) {
  e.stopPropagation();
  e.preventDefault();

  var dt = e.dataTransfer;
  var files = dt.files;
  handleFiles(files);
}

if(window.FileReader) {
    document.getElementById("file-input").addEventListener("change", fileselect, false);
    dropbox.addEventListener("dragenter", dragenter, false);
    dropbox.addEventListener("dragover", dragover, false);
    dropbox.addEventListener("drop", drop, false);
}

function fileselect() {
    handleFiles(this.files);
}

function handleFiles(files) {
    var fileList = files; /* now you can work with the file list */
    var reader = new FileReader();
    file = files[0];
    console.log(file);
    $('#spinner').show();
    Module.setStatus('Loading replay...');
    $("#file-input").hide();
    $( "#file-input" ).prop( "disabled", true );
    $( "#save-gif" ).prop( "disabled", true );
    $( "#save-webm" ).prop( "disabled", true );
    $('#replay-file-name').text(file.name);
    $('#dropbox').hide();
    reader.onload = function(e) {
        console.log('file read', reader.result.slice(0, 8));
        fileData = reader.result;
        setTimeout(function () {
            if (runCount != 0) {
                //Module.run();
            }
            else {
                /*var stream = FS.open(file.name, 'w+');
                var data = new Uint8Array(fileData);
                console.log('data length', data.length);
                FS.write(stream, data, 0, data.length, 0);
                FS.close(stream);
                console.log('file written');*/
                Module['preRun'][1]();
                Module['preRun'][0]();
                //Module.callMain([file.name]);
            }
            console.log('module run');
            runCount++;
        }, 0);
    }
    reader.readAsArrayBuffer(file);
}

var slidingValue = 0;
/*function initSlider(startTick, gameEndTick) {
    //console.log('initSlider');
    setTick = Module.cwrap('setTick', 'number', ['number']);
    $("#slider").slider({
        value: startTick,
        min: startTick,
        max: gameEndTick,
        step: 1,
        slide: function(event, ui) {
            slidingValue = ui.value;
        },
        stop: function(event, ui) {
            //console.log(slidingValue);
            console.log(slidingValue);
            lastTickUpdate = slidingValue;
            setTick(slidingValue);
        },
        ticks: true
    });
    //Module.setStatus('');
}*/
var lastTickUpdate = 0;
function updateSlider(tick) {
    //console.log('updateSlider', tick);
    if (tick - lastTickUpdate >= 30) {
        lastTickUpdate = tick;
        //console.log('updateSlider', tick);
        $("#slider").slider('value', tick);
        if (isRecording) {
            encoder.addFrame(ctx);
            if (supportsWebP) encoder_webm.add(canvas);
            //encoder_webm.add(ctx);
            //console.log('adding frame');
        }
    }
}

var sliderTicks = [];
function addSliderTick(tick) {
    sliderTicks.push(tick);
}
var changeSetting;
/*var img = document.getElementById('embedImage');
var button = document.getElementById('saveImage');
button.onclick = function () {
    $('#embedImage').hide();
    setTimeout(function () {
        window.location.href = img.src.replace('image/gif', 'image/octet-stream');
    }, 1000);
};*/
function mainDone(_startTick, _gameEndTick) {
    startTick = _startTick;
    gameEndTick = _gameEndTick;
    setTick = Module.cwrap('setTick', 'number', ['number']);
    $("#slider").slider({
        value: startTick,
        min: startTick,
        max: gameEndTick,
        step: 1,
        slide: function(event, ui) {
            slidingValue = ui.value;
        },
        stop: function(event, ui) {
            //console.log(slidingValue);
            lastTickUpdate = slidingValue;
            setTick(slidingValue);
        },
        ticks: true
    });
    
    //$("#slider").slider("option", "min", startTick); // left handle should be at the left end, but it doesn't move
    $("#slider").slider("option", "startTick", startTick );
    $("#slider").slider("option", "gameStartTick", gameStartTick );
    $("#slider").slider("option", "gameEndTick", gameEndTick );
    $("#slider").slider("option", "tickMarks", sliderTicks );
    //$slide.slider("value", $slide.slider("value"));
    //$("#slider").slider('value', startTick);
    $("#slider").slider("createTicks");
    setTick(startTick);
    console.log('mainDone');
    //console.log('Replay parsed in:' + ((Date.now() - mainStartTime) / 1000) + ' seconds');
    Module.print('Replay parsed in ' + ((Date.now() - mainStartTime) / 1000) + ' seconds');
    $('#parser-settings').hide();
    $('#replay-controls').show();
    if (!supportsWebP) $('#save-webm').hide();
    $('#share').show();
    /*var setTick = Module.cwrap('setTick', 'number', ['number']);
    $("#slider").slider({
        value: startTick,
        min: startTick,
        max: gameEndTick,
        step: 30,
        slide: function(event, ui) {
            setTick(ui.value);
        }
    });*/
    Module.setStatus('');
    changeSetting = Module.cwrap('changeSetting', 'number', ['number']);
    //draw toggle
    $('#showPlayerInfo').click(function() {
        if (!$(this).is(':checked')) {
            changeSetting(0);
        }
        else {
            changeSetting(1);
        }
    });
    $('#showCreep').click(function() {
        if (!$(this).is(':checked')) {
            changeSetting(2);
        }
        else {
            changeSetting(3);
        }
    });
    $('#showHero').click(function() {
        if (!$(this).is(':checked')) {
            changeSetting(4);
        }
        else {
            changeSetting(5);
        }
    });
    $('#showCourier').click(function() {
        if (!$(this).is(':checked')) {
            changeSetting(6);
        }
        else {
            changeSetting(7);
        }
    });
    $('#showWard').click(function() {
        if (!$(this).is(':checked')) {
            changeSetting(8);
        }
        else {
            changeSetting(9);
        }
    });
    $('#showGraphs').click(function() {
        if (!$(this).is(':checked')) {
            changeSetting(10);
            $( "#showBackground" ).prop( "checked", true );
            $( "#showCreep" ).prop( "checked", true );
            $( "#showHero" ).prop( "checked", true );
            $( "#showCourier" ).prop( "checked", true );
            $( "#showWard" ).prop( "checked", true );
            $( "#showBuilding" ).prop( "checked", true );
        }
        else {
            changeSetting(11);
            $( "#showBackground" ).prop( "checked", false );
            $( "#showCreep" ).prop( "checked", false );
            $( "#showHero" ).prop( "checked", false );
            $( "#showCourier" ).prop( "checked", false );
            $( "#showWard" ).prop( "checked", false );
            $( "#showBuilding" ).prop( "checked", false );
        }
    });
    $('#showBackground').click(function() {
        if (!$(this).is(':checked')) {
            changeSetting(12);
        }
        else {
            changeSetting(13);
        }
    });
    $('#showDraft').click(function() {
        if (!$(this).is(':checked')) {
            changeSetting(14);
        }
        else {
            changeSetting(15);
        }
    });
    $('#showBuilding').click(function() {
        if (!$(this).is(':checked')) {
            changeSetting(16);
        }
        else {
            changeSetting(17);
        }
    });
    
    $('#play-pause').click(function() {
        if (paused) {
            paused = false;
            changeSetting(201);
            $('#play-pause > span').removeClass('glyphicon-play');
            $('#play-pause > span').addClass('glyphicon-pause');
            
        }
        else {
            paused = true;
            changeSetting(200);
            $('#play-pause > span').removeClass('glyphicon-pause');
            $('#play-pause > span').addClass('glyphicon-play');
        }
    });
    
    $('#speed-slower').click(function() {
        if (speed <= 0) return;
        speed--;
        changeSpeed();
    });
    $('#speed-faster').click(function() {
        if (speed >= 5) return;
        speed++;
        changeSpeed();
    });
    
    $('#record').click(function() {
        if (!isRecording) {
            encoder = new GIFEncoder();
            if (supportsWebP) encoder_webm = new Whammy.Video(5);
            
            encoder.setRepeat(0);
            encoder.start();
            isRecording = true;
            
            //encoder.addFrame(ctx);
            //console.log('record start');
            $('#record-label').text('Stop');
            $('#record-icon').removeClass('glyphicon-record');
            $('#record-icon').addClass('glyphicon-stop');
            $( "#save-gif" ).prop( "disabled", true );
            $( "#save-webm" ).prop( "disabled", true );
        }
        else {
            $('#record-label').text('Record');
            $('#record-icon').removeClass('glyphicon-stop');
            $('#record-icon').addClass('glyphicon-record');
            $( "#save-gif" ).prop( "disabled", false );
            if (supportsWebP) $( "#save-webm" ).prop( "disabled", false );
            encoder.finish();
            /*var binary_gif = encoder.stream().getData() //notice this is different from the as3gif package!
            //var data_url = 'data:image/gif;base64,'+encode64(binary_gif);
            //var myWindow = window.open("", "MsgWindow", "width=200, height=100");
            //myWindow.location.href = 'data:image/octet-stream;base64,'+encode64(binary_gif);
            var blob = b64toBlob(encode64(binary_gif), 'image/gif');
            var blobUrl = URL.createObjectURL(blob);
            saveAs(blob, 'replay.gif');
            var blob_webm = encoder_webm.compile();
            saveAs(blob_webm, 'replay.webm');
            //window.location = blobUrl;
            //$('#embedImage').attr('src', data_url);*/
            isRecording = false;
            //console.log('record stop');
            
        }
    });
    $('#save-gif').click(function() {
        var binary_gif = encoder.stream().getData() //notice this is different from the as3gif package!
        var blob = b64toBlob(encode64(binary_gif), 'image/gif');
        //var blobUrl = URL.createObjectURL(blob);
        saveAs(blob, 'replay.gif');
    });
    $('#save-webm').click(function() {
        if (supportsWebP) {
            var blob_webm = encoder_webm.compile();
            saveAs(blob_webm, 'replay.webm');
        }
    });
    
    // skip button
    $('#skipPregame').click(function() {
        setTick(startTick);
        $("#slider").slider('value', startTick);
    });
    $('#skipStart').click(function() {
        setTick(gameStartTick);
        $("#slider").slider('value', gameStartTick);
    });
    $('#skipEnd').click(function() {
        setTick(gameEndTick);
        $("#slider").slider('value', gameEndTick);
    });
}

function b64toBlob(b64Data, contentType, sliceSize) {
    contentType = contentType || '';
    sliceSize = sliceSize || 512;

    var byteCharacters = atob(b64Data);
    var byteArrays = [];

    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        var slice = byteCharacters.slice(offset, offset + sliceSize);

        var byteNumbers = new Array(slice.length);
        for (var i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        var byteArray = new Uint8Array(byteNumbers);

        byteArrays.push(byteArray);
    }

    var blob = new Blob(byteArrays, {type: contentType});
    return blob;
}

function changeSpeed() {
    switch(speed) {
        case 0:
            changeSetting(202);
            $('#playback-speed').text('1x');
            break;
        case 1:
            changeSetting(203);
            $('#playback-speed').text('2x');
            break;
        case 2:
            changeSetting(204);
            $('#playback-speed').text('4x');
            break;
        case 3:
            changeSetting(205);
            $('#playback-speed').text('8x');
            break;
        case 4:
            changeSetting(206);
            $('#playback-speed').text('16x');
            break;
        case 5:
            changeSetting(207);
            $('#playback-speed').text('32x');
            break;
        default:
            changeSetting(202);
            $('#playback-speed').text('1x');
            break;
    }
}

var Module = {
    noInitialRun: true,
    //noExitRuntime: true,
    preRun: [function () {
        var stream = FS.open(file.name, 'w+');
        var data = new Uint8Array(fileData);
        console.log('data length', data.length);
        FS.write(stream, data, 0, data.length, 0);
        FS.close(stream);
        console.log('file written');
        //FS.createFolder("/", "assets", true, true);
        //FS.createPreloadedFile('/assets', 'dota_map.jpg', 'http://dev.devilesk.com/dota2/apps/replay/viewer2/assets/dota_map.jpg', true, true);
        //console.log(FS.readFile('/assets/dota_map.jpg').length);
        //setTimeout(function () {Module.callMain([file.name]); }, 0);
        //odule.callMain([file.name]);
        //Module.run();
        //FS.init();
        mainStartTime = Date.now();
        //memoryprofiler_add_hooks();
    }],
    postRun: [],
    print: (function() {
        var element = document.getElementById('output');
        if (element) element.value = ''; // clear browser cache
        return function(text) {
            text = Array.prototype.slice.call(arguments).join(' ');
            // These replacements are necessary if you render to raw HTML
            //text = text.replace(/&/g, "&amp;");
            //text = text.replace(/</g, "&lt;");
            //text = text.replace(/>/g, "&gt;");
            //text = text.replace('\n', '<br>', 'g');
            console.log(text);
            var d = text.split(',')
            if (d[0].trim() == 'stateChange') {
                if (d[1].trim() == '4') {
                    //console.log(d[3].trim(), parseInt(d[3].trim()));
                    startTick = parseInt(d[3].trim());
                } else if (d[1].trim() == '5') {
                    //console.log(d[3].trim(), parseInt(d[3].trim()));
                    gameStartTick = parseInt(d[3].trim());
                } else if (d[1].trim() == '6') {
                    //console.log(d[3].trim(), parseInt(d[3].trim()));
                    gameEndTick = parseInt(d[3].trim());
                }
            }
            else {
                if (element) {
                    element.value += text + "\n";
                    element.scrollTop = element.scrollHeight; // focus on bottom
                }
            }
        };
    })(),
    printErr: function(text) {
        text = Array.prototype.slice.call(arguments).join(' ');
        if (0) { // XXX disabled for safety typeof dump == 'function') {
            dump(text + '\n'); // fast, straight to the real console
        } else {
            console.error(text);
        }
    },
    canvas: (function() {
        var canvas = document.getElementById('canvas');
        // As a default initial behavior, pop up an alert when webgl context is lost. To make your
        // application robust, you may want to override this behavior before shipping!
        // See http://www.khronos.org/registry/webgl/specs/latest/1.0/#5.15.2
        canvas.addEventListener("webglcontextlost", function(e) {
            alert('WebGL context lost. You will need to reload the page.');
            e.preventDefault();
        }, false);
        return canvas;
    })(),
    setStatus: function(text) {
        console.log(text);
        if (!Module.setStatus.last) Module.setStatus.last = {
            time: Date.now(),
            text: ''
        };
        if (text === Module.setStatus.text) return;
        var m = text.match(/([^(]+)\((\d+(\.\d+)?)\/(\d+)\)/);
        var now = Date.now();
        if (m && now - Date.now() < 30) return; // if this is a progress update, skip it if too soon
        if (m) {
            text = m[1];
            progressElement.value = parseInt(m[2]) * 100;
            progressElement.max = parseInt(m[4]) * 100;
            progressElement.hidden = false;
            spinnerElement.hidden = false;
        } else {
            progressElement.value = null;
            progressElement.max = null;
            progressElement.hidden = true;
            if (!text || text == 'Replay viewer ready.') {
                spinnerElement.style.display = 'none';
                if (text == 'Replay viewer ready.') {
                    $('#file-input-container').show(); 
                }
            }
        }
        statusElement.innerHTML = text;
    },
    totalDependencies: 0,
    monitorRunDependencies: function(left) {
        this.totalDependencies = Math.max(this.totalDependencies, left);
        Module.setStatus(left ? 'Preparing... (' + (this.totalDependencies - left) + '/' + this.totalDependencies + ')' : 'Replay viewer ready.');
        if (!left && file) {
            var arguments = [file.name];
            if ($('#parseCreep').is(':checked')) arguments.push('--parsecreep');
            if ($('#parseHero').is(':checked')) arguments.push('--parsehero');
            if ($('#parseCourier').is(':checked')) arguments.push('--parsecourier');
            if ($('#parseWard').is(':checked')) arguments.push('--parseward');
            if ($('#parseBuilding').is(':checked')) arguments.push('--parsebuilding');
            if ($('#parseItem').is(':checked')) arguments.push('--parseitem');
            Module.callMain(arguments);
        }
    }
};
Module.setStatus('Downloading...');
window.onerror = function(event) {
    // TODO: do not warn on ok events like simulating an infinite loop or exitStatus
    Module.setStatus('Exception thrown, see JavaScript console');
    spinnerElement.style.display = 'none';
    Module.setStatus = function(text) {
        if (text) Module.printErr('[post-exception status] ' + text);
    };
};

function imgurUpload() {
    //var ctx = canvas.getContext("2d");
    ctx.save()
    try {
        var img = canvas.toDataURL('image/jpeg', .8).split(',')[1];
    } catch (e) {
        var img = canvas.toDataURL().split(',')[1];
    }
    // open the popup in the click handler so it will not be blocked
    var w = window.open();
    w.document.write('Uploading...');
    //w.document.write(img);
    // upload to imgur using jquery/CORS
    // https://developer.mozilla.org/En/HTTP_access_control
    $.ajax({
        url: 'https://api.imgur.com/3/image',
        type: 'POST',
        beforeSend: function(xhr) {
            xhr.setRequestHeader('Authorization', 'Client-ID ' + 'e6d3cc2364556b2');
        },
        data: {
            type: 'base64',
            // get your key here, quick and fast http://imgur.com/register/api_anon
            //key: 'e6d3cc2364556b2',
            //name: 'neon.jpg',
            //title: 'test title',
            //caption: 'test caption',
            image: img
        },
        dataType: 'json'
    }).success(function(data) {
        alert('Upload successful. ' + data.data.link);
        w.document.write('Upload successful. ' + data.data.link);
        var a = document.createElement('a');
        //a.style.float = 'left';
        a.href = data.data.link;
        a.target = "_blank";
        a.innerHTML = "imgur link";
        document.getElementById('sharelink').innerHTML = "";
        document.getElementById('sharelink').appendChild(a);
    }).error(function() {
        alert('Could not reach api.imgur.com. Sorry :(');
        w.document.write('Could not reach api.imgur.com. Sorry :(');
    });
}

canvas.addEventListener("mousedown", getCursorPosition, false);

function getCursorPosition(event) {
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    console.log("x: " + x + " y: " + y);
    if (isInsideRect(x, y, 1024 + 4 + 244, 4, 50, 16)) {
        console.log(102);
        changeSetting(102);
    }
    else if (isInsideRect(x, y, 1024 + 4 + 244 + 50, 4, 50, 16)) {
        console.log(103);
        changeSetting(103);
    }
    else if (isInsideRect(x, y, 1024 + 4 + 244 + 50 + 50, 4, 35, 16)) {
        console.log(104);
        changeSetting(104);
    }
    else if (isInsideRect(x, y, 1024 + 4 + 244 + 50 + 50 + 35, 4, 75, 16)) {
        console.log(105);
        changeSetting(105);
    }
    else if (isInsideRect(x, y, 1024 + 4 + 244 + 50 + 50 + 35 + 75, 4, 50, 16)) {
        console.log(106);
        changeSetting(106);
    }
}

function isInsideRect(pX, pY, x, y, w, h) {
    if (pX < x) return false;
    if (pX > x + w) return false;
    if (pY < y) return false;
    if (pY > y + h) return false;
    return true;
}

$('input:radio[name="parseSetting"]').change(
    function(){

        // checks that the clicked radio button is the one of value 'Yes'
        // the value of the element is the one that's checked (as noted by @shef in comments)
        if ($(this).val() == 0) {
            $( "#parseCreep" ).prop( "checked", true );
            $( "#parseHero" ).prop( "checked", true );
            $( "#parseCourier" ).prop( "checked", true );
            $( "#parseWard" ).prop( "checked", true );
            $( "#parseBuilding" ).prop( "checked", true );
            $( "#parseItem" ).prop( "checked", true );
            $( "#parseCreep" ).prop( "disabled", true );
            $( "#parseHero" ).prop( "disabled", true );
            $( "#parseCourier" ).prop( "disabled", true );
            $( "#parseWard" ).prop( "disabled", true );
            $( "#parseBuilding" ).prop( "disabled", true );
            $( "#parseItem" ).prop( "disabled", true );
        }
        else if ($(this).val() == 1) {
            $( "#parseCreep" ).prop( "checked", false );
            $( "#parseHero" ).prop( "checked", true );
            $( "#parseCourier" ).prop( "checked", false );
            $( "#parseWard" ).prop( "checked", false );
            $( "#parseBuilding" ).prop( "checked", false );
            $( "#parseItem" ).prop( "checked", true );
            $( "#parseCreep" ).prop( "disabled", true );
            $( "#parseHero" ).prop( "disabled", true );
            $( "#parseCourier" ).prop( "disabled", true );
            $( "#parseWard" ).prop( "disabled", true );
            $( "#parseBuilding" ).prop( "disabled", true );
            $( "#parseItem" ).prop( "disabled", true );
        }
        else if ($(this).val() == 2) {
            $( "#parseCreep" ).prop( "disabled", false );
            $( "#parseHero" ).prop( "disabled", false );
            $( "#parseCourier" ).prop( "disabled", false );
            $( "#parseWard" ).prop( "disabled", false );
            $( "#parseBuilding" ).prop( "disabled", false );
            $( "#parseItem" ).prop( "disabled", false );
        }
    });
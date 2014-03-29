// Copyright 2010 William Malone (www.williammalone.com)
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/*jslint browser: true */
/*global G_vmlCanvasManager */
            ColorPicker.fixIndicators(
                    document.getElementById('slider-indicator'),
                    document.getElementById('picker-indicator'));

            var cp = ColorPicker(
                    document.getElementById('slider'), 
                    document.getElementById('picker'), 

                    function(hex, hsv, rgb, pickerCoordinate, sliderCoordinate) {

                        ColorPicker.positionIndicators(
                            document.getElementById('slider-indicator'),
                            document.getElementById('picker-indicator'),
                            sliderCoordinate, pickerCoordinate
                        );

                        $('#brushcolor').val(hex.substring(1,hex.length).toUpperCase());
                        $('#brushcolor').css('background',hex);
                });
				$('#brushcolor').change(function() {
					cp.setHex('#' + $(this).val());
				});
var heroIconContainerExpand = 0;
var heroIconSaveCount = 0;
var images = {};
var isCtrl = false;
var 		clickX = [],
		clickY = [],
		clickColor = [],
		clickTool = [],
		clickSize = [],
		clickDrag = [],
		clickIcon = [],
		clickXUndo = [],
		clickYUndo = [],
		clickColorUndo = [],
		clickToolUndo = [],
		clickSizeUndo = [],
		clickDragUndo = [],
		clickIconUndo = [];
$("#canvasDiv").mouseover(function(){
    document.onselectstart = function(){ return false; };
}).mouseout(function(){
        document.onselectstart = null;
});

var drawingApp = (function () {

	"use strict";
	var getHeight = function() {
       return $('html').height() - $('.navbar').outerHeight(true)-5;
	};
	var canvas, canvasMenu,
		spriteloc,
		canvasBG,
		selectedRadio = 'radio1',
		scaleTotal = 1,
		scaleTotalprev = 1,
		scaleX = 1,
		scaleY = 1,
		mouseXprev = 0,
		mouseYprev = 0,
		xTransform = 0,
		yTransform = 0,
		context,
		contextBG,
		initialWidth = 2048,
		initialHeight = 2048,
		canvasWidth = getHeight(),//5087*.19657951641,
		canvasHeight = getHeight(),//4916*.19657951641,
		colorPurple = "#cb3594",
		dragStart = 0,
		paint = false,
		pan = false,
		curColor = colorPurple,
		curTool = "m",
		curSize = 1,
		totalLoadResources = 5,
		curLoadResNum = 0,
		
		resizeCanvas = function() {
			canvasWidth = getHeight();
			canvasHeight = getHeight();
			canvas.width = canvasWidth;
			canvas.height = canvasHeight;
			canvasBG.width = canvasWidth;
			canvasBG.height = canvasHeight;
			$('#canvasContainers').width(canvasWidth);
			$('#canvasContainers').height(canvasHeight);
			scaleX = canvasWidth/initialWidth;
			scaleY = canvasHeight/initialHeight;
			xTransform = 0;
			yTransform = 0;
		scaleTotal = 1;
		scaleTotalprev = 1;
			redraw(0);
		},
		
		// Clears the canvas.
		clearCanvas = function () {
			//context.clearRect(0, 0, canvas.width, canvas.height);
			context.save();
			contextBG.save();
			context.setTransform(1,0,0,1,0,0);
			contextBG.setTransform(1,0,0,1,0,0);
			// Will always clear the right space
			context.clearRect(0,0,context.canvas.width,context.canvas.height);
			contextBG.clearRect(0,0,context.canvas.width,context.canvas.height);
			context.restore();
			contextBG.restore();
		},

		// Redraws the canvas.
		redraw = function (start) {

			var locX,
				locY,
				radius,
				i,
				selected;

			// Make sure required resources are loaded before redrawing
			/*if (curLoadResNum < totalLoadResources) {
				return;
			}*/

			if (start == 0) {
			clearCanvas();
			};

			// Keep the drawing in the drawing area
			context.save();
			context.beginPath();
			context.rect(0, 0, canvas.width, canvas.height);
			context.clip();
			
			

			// Draw the outline image
			if (start == 0) {
			contextBG.drawImage(images.background, 0, 0, canvas.width, canvas.height);
			//contextBG.fillRect(0, 0, canvas.width, canvas.height);
			}

			// For each point drawn
			i = start;
			while (i < clickX.length && !pan) {
				
				radius = clickSize[i];
				// Set the drawing path
				context.beginPath();
				// If dragging then draw a line between the two points
				
				if (clickTool[i] == "b") {
					context.globalCompositeOperation = "source-over";
					if (!clickDrag[i]) {
						dragStart = i;
						if (clickIcon[i] == "ward_observer" || clickIcon[i] == "ward_sentry") {
							//context.drawImage(images[clickIcon[i]] ,clickX[i]/initialWidth*canvasWidth-16*clickSize[i]/2,clickY[i]/initialHeight*canvasHeight-16*clickSize[i], 16*clickSize[i], 16*clickSize[i])
							context.drawImage(images['spritesheet'],spriteloc[clickIcon[i]].x,spriteloc[clickIcon[i]].y,32,32,clickX[i]/initialWidth*canvasWidth-16*clickSize[i]/2,clickY[i]/initialHeight*canvasHeight-16*clickSize[i], 16*clickSize[i], 16*clickSize[i])
						}
						else {
							//context.drawImage(images[clickIcon[i]] ,clickX[i]/initialWidth*canvasWidth-16*clickSize[i]/2,clickY[i]/initialHeight*canvasHeight-16*clickSize[i]/2, 16*clickSize[i], 16*clickSize[i])
							context.drawImage(images['spritesheet'],spriteloc[clickIcon[i]].x,spriteloc[clickIcon[i]].y,32,32,clickX[i]/initialWidth*canvasWidth-16*clickSize[i]/2,clickY[i]/initialHeight*canvasHeight-16*clickSize[i]/2, 16*clickSize[i], 16*clickSize[i])
						}
					}
					else {
						clickDrag[i] = false;
						clickX.splice(dragStart, i-dragStart);
						clickY.splice(dragStart, i-dragStart);
						clickTool.splice(dragStart, i-dragStart);
						clickColor.splice(dragStart, i-dragStart);
						clickSize.splice(dragStart, i-dragStart);
						clickDrag.splice(dragStart, i-dragStart);
						clickIcon.splice(dragStart, i-dragStart);
						
						dragStart = i;
						
					}
				}
				else if (clickTool[i] == "h") {
					context.globalCompositeOperation = "source-over";
					if (clickIcon[i] == "ward_observer" || clickIcon[i] == "ward_sentry") {
						//context.drawImage(images[clickIcon[i]] ,clickX[i]/initialWidth*canvasWidth-16*clickSize[i]/2,clickY[i]/initialHeight*canvasHeight-16*clickSize[i], 16*clickSize[i], 16*clickSize[i])
						context.drawImage(images['spritesheet'],spriteloc[clickIcon[i]].x,spriteloc[clickIcon[i]].y,32,32,clickX[i]/initialWidth*canvasWidth-16*clickSize[i]/2,clickY[i]/initialHeight*canvasHeight-16*clickSize[i], 16*clickSize[i], 16*clickSize[i])
					}
					else {
						//context.drawImage(images[clickIcon[i]] ,clickX[i]/initialWidth*canvasWidth-16*clickSize[i]/2,clickY[i]/initialHeight*canvasHeight-16*clickSize[i]/2, 16*clickSize[i], 16*clickSize[i])
						context.drawImage(images['spritesheet'],spriteloc[clickIcon[i]].x,spriteloc[clickIcon[i]].y,32,32,clickX[i]/initialWidth*canvasWidth-16*clickSize[i]/2,clickY[i]/initialHeight*canvasHeight-16*clickSize[i]/2, 16*clickSize[i], 16*clickSize[i])
					}
				}
				else {
					if (clickDrag[i] && i) {
						context.moveTo(clickX[i - 1]/initialWidth*canvasWidth, clickY[i - 1]/initialHeight*canvasHeight);
					} else {
						// The x position is moved over one pixel so a circle even if not dragging
						context.moveTo(clickX[i]/initialWidth*canvasWidth - 1, clickY[i]/initialHeight*canvasHeight);
					}
					context.lineTo(clickX[i]/initialWidth*canvasWidth, clickY[i]/initialHeight*canvasHeight);
					
					// Set the drawing color
					if (clickTool[i] === "e") {
						context.globalCompositeOperation = "destination-out"; // To erase instead of draw over with white
						context.strokeStyle = 'white';
						context.globalAlpha = 1;

			
					} else {
						context.globalCompositeOperation = "source-over";	// To erase instead of draw over with white
						context.strokeStyle = clickColor[i];
					}
					context.lineCap = "round";
					context.lineJoin = "round";
					context.lineWidth = radius;
					context.stroke();
				}
				i = i+1;
			}
			context.closePath();

			context.globalCompositeOperation = "source-over";// To erase instead of draw over with white
			context.restore();
			if (clickTool[clickX.length-1] === "e") {
				context.globalCompositeOperation = "destination-over";
				//context.drawImage(images.background, 0, 0, canvas.width, canvas.height);
				context.globalCompositeOperation = "source-over";
			}
			context.globalAlpha = 1; // No IE support

		},

		// Adds a point to the drawing array.
		// @param x
		// @param y
		// @param dragging
		addClick = function (x, y, dragging) {
		//console.log(x,y,canvasWidth,canvasHeight,initialWidth,initialHeight,scaleTotal,yTransform,xTransform);
			clickX.push(x/canvasWidth*initialWidth*(1/scaleTotal)-xTransform*(1/scaleTotal));
			clickY.push(y/canvasHeight*initialHeight*(1/scaleTotal)-yTransform*(1/scaleTotal));
			if (selectedRadio == 'radio1') {
				//console.log('m');
				clickTool.push('m');
			}
			else if (selectedRadio == 'radio2') {
				//console.log('e');
				clickTool.push('e');
			}
			else if (selectedRadio == 'radio3' && $('#herobrush').is(':checked')) {
				//console.log('h');
				clickTool.push('h');
			}
			else if (selectedRadio == 'radio3' && !($('#herobrush').is(':checked'))) {
				//console.log('b');
				clickTool.push('b');
			}
			clickColor.push('#' + document.getElementById('brushcolor').value);
			clickSize.push(parseInt($( "#amount" ).val()));
			clickDrag.push(dragging);
			clickIcon.push($('#hero').val());
			clickXUndo.length = 0;
			clickYUndo.length = 0;
			clickToolUndo.length = 0;
			clickColorUndo.length = 0;
			clickSizeUndo.length = 0;
			clickDragUndo.length = 0;
			clickIconUndo.length = 0;
		},

		// Add mouse and touch event listeners to the canvas
		createUserEvents = function () {

			var 
getOffset = function(evt) {
  var el = evt.target,
      x = 0,
      y = 0;

  while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
    x += el.offsetLeft - el.scrollLeft;
    y += el.offsetTop - el.scrollTop;
    el = el.offsetParent;
  }

  x = evt.clientX - x;
  y = evt.clientY - y;

  return { x: x, y: y };
},
			press = function (e) {
				// Mouse down location
					var m = getOffset(e),
					mouseX = m.x,
					mouseY = m.y;
				if (e.currentTarget.id == 'canvas' && e.button == 0 &&  isCtrl==false) {
					paint = true;
					addClick(mouseX, mouseY, false);
					if (selectedRadio == 'radio3' && !($('#herobrush').is(':checked'))) {
						clearCanvas();
						redraw(0);
					}
					else {
						redraw(clickX.length - 1);
					}
				}
				else {
				
					//context.translate(mouseX-mouseXprev,mouseY-mouseYprev);
					mouseXprev = mouseX;
					mouseYprev = mouseY;
					pan=true;
				}
			},
				drag = function (e) {
					var m = getOffset(e),
					mouseX = m.x,
					mouseY = m.y;
					if (paint) {
						addClick(mouseX, mouseY, true);
						if (e.currentTarget.id == 'canvas' && e.button == 0 && isCtrl==false) {
							if (selectedRadio == 'radio1') {
								redraw(clickX.length - 1);
							}
							else if (selectedRadio == 'radio2') {
								redraw(clickX.length - 1);
							}
							else if (selectedRadio == 'radio3' && $('#herobrush').is(':checked')) {
								redraw(clickX.length - 1);
							}
							else if (selectedRadio == 'radio3' && !($('#herobrush').is(':checked'))) {
								clearCanvas();
								redraw(0);
							}
						}
						
					}
					if (pan) {
						paint = false;
						context.translate((mouseX-mouseXprev)*(1/scaleTotal), (mouseY-mouseYprev)*(1/scaleTotal));
						contextBG.translate((mouseX-mouseXprev)*(1/scaleTotal), (mouseY-mouseYprev)*(1/scaleTotal));
						xTransform = xTransform+(mouseX-mouseXprev)*(initialWidth/canvasWidth);
						yTransform = yTransform+(mouseY-mouseYprev)*(initialHeight/canvasHeight);
						//console.log(xTransform,yTransform);
						mouseXprev = mouseX;
						mouseYprev = mouseY;
						redraw(0);
					}							
					
					// Prevent the whole page from dragging if on mobile
					e.preventDefault();
				},

				release = function () {
					if (paint) {
						redraw(0);
					}
					paint = false;
					if (pan == true) {
						pan = false;
						redraw(0);
						
					}
					
					//redraw(clickX.length - 1);
				},

				cancel = function () {
					paint = false;
					if (pan == true) {
						pan = false;
						redraw(0);
					}
					
				};

			// Add mouse event listeners to canvas element
			//document.getElementById("hero").addEventListener("onblur", press, false);
			canvas.addEventListener("mousedown", press, false);
			canvas.addEventListener("mousemove", drag, false);
			canvas.addEventListener("mouseup", release);
			canvas.addEventListener("mouseout", cancel, false);

			// Add touch event listeners to canvas element
			canvas.addEventListener("touchstart", press, false);
			canvas.addEventListener("touchmove", drag, false);
			canvas.addEventListener("touchend", release, false);
			canvas.addEventListener("touchcancel", cancel, false);
			var handleScroll = function(evt){
				var delta = evt.wheelDelta ? evt.wheelDelta/40 : evt.detail ? -evt.detail : 0;
				if (delta > 0) {
					zoomin();
				}
				else {
					zoomout();
				}
				return evt.preventDefault() && false;
			};
			canvas.addEventListener('DOMMouseScroll',handleScroll,false);
			canvas.addEventListener('mousewheel',handleScroll,false);

			$("#viewbutton").click(view);
			$("#sharebutton").click(share);
			$("#zoomoutbutton").click(zoomout);
			$("#zoominbutton").click(zoomin);
			$("#undobutton").click(undo);
			$("#redobutton").click(redo);
			$("#recenterbutton").click(recenter);
			$("#clearbutton").click(function() {
				clickX.length = 0;
				clickY.length = 0;
				clickTool.length = 0;
				clickColor.length = 0;
				clickSize.length = 0;
				clickDrag.length = 0;
				clickIcon.length = 0;
				clickXUndo.length = 0;
				clickYUndo.length = 0;
				clickToolUndo.length = 0;
				clickColorUndo.length = 0;
				clickSizeUndo.length = 0;
				clickDragUndo.length = 0;
				clickIconUndo.length = 0;
				clearCanvas();
				context.setTransform(1,0,0,1,0,0);
				contextBG.setTransform(1,0,0,1,0,0);
				scaleTotal = 1;
				scaleTotalprev = 1;
				mouseXprev = 0;
				mouseYprev = 0;
				xTransform = 0;
				yTransform = 0;
				redraw(0);
			});
		},
		
		share = function() {
			context.save()
			contextBG.save()
			context.setTransform(1,0,0,1,0,0);		
			contextBG.setTransform(1,0,0,1,0,0);		
			redraw(0);
			context.globalCompositeOperation="destination-over";
			context.drawImage(canvasBG, 0, 0);
			try {
				var img = canvas.toDataURL('image/jpeg', .8).split(',')[1];
			} catch(e) {
				var img = canvas.toDataURL().split(',')[1];
			}
			context.restore();
			contextBG.restore();
			redraw(0);
			// open the popup in the click handler so it will not be blocked
			var w = window.open();
			w.document.write('Uploading...');
			//w.document.write(img);
			// upload to imgur using jquery/CORS
			// https://developer.mozilla.org/En/HTTP_access_control
			$.ajax({
				url: 'https://api.imgur.com/3/image',
				type: 'POST',
				beforeSend: function (xhr) {
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
		},
		recenter = function () {
			resizeCanvas();
		},
		view = function () {
			var context = canvas.getContext('2d');
			var w = window.open('/dota2/apps/drawablemap/viewimage.html');
			var newCanvas = w.document.createElement('canvas');
			var newContext = newCanvas.getContext('2d');

			//set dimensions
			newCanvas.setAttribute('width', canvasWidth*scaleTotal);
			newCanvas.setAttribute('height', canvasHeight*scaleTotal);
			newCanvas.id = "canvas"

			//apply the old canvas to the new one		
			context.save()
			contextBG.save()
			context.setTransform(1,0,0,1,0,0);		
			contextBG.setTransform(1,0,0,1,0,0);		
			redraw(0);
			context.globalCompositeOperation="destination-over";
			context.drawImage(canvasBG, 0, 0);
			newContext.scale(scaleTotal,scaleTotal);
			newContext.drawImage(canvas, 0, 0);
			
			context.restore();
			contextBG.restore();
			redraw(0);
			w.onload = function() {
				w.document.getElementById('canvasContainers').appendChild(newCanvas);
			}
		},
		/*
		zoomout2 = function(evt) {
						if (scaleTotal*.8 >= .8) {
							var mousex = evt.pageX - canvas.offsetLeft;
							var mousey = evt.pageY - canvas.offsetTop;
							//alert(evt.clientY);
							var w = canvas.width*scaleTotal,
								h = canvas.height*scaleTotal;
								
							context.translate(mousex, mousey);
							xTransform = xTransform+mousex;
							yTransform = yTransform+mousey;
							
							
							context = canvas.getContext("2d");
							clearCanvas();
							

							context.scale(.8, .8);
							context.translate(-mousex, -mousey);
							xTransform = xTransform-mousex;
							yTransform = yTransform-mousey;
							scaleTotal = scaleTotal * .8;
							redraw(0);
						}
		},

		zoomin2 = function(evt) {
						if (scaleTotal*1.25 <= (1/.19657951641)) {
							var mousex = evt.pageX - canvas.offsetLeft;
							var mousey = evt.pageY - canvas.offsetTop;
							var w = canvas.width*scaleTotal,
								h = canvas.height*scaleTotal;
								
							context.translate(mousex, mousey);	
							xTransform = xTransform+mousex;
							yTransform = yTransform+mousey;
							
							
							context = canvas.getContext("2d");
							clearCanvas();
							

							context.scale(1.25, 1.25);
							context.translate(-mousex, -mousey);
							xTransform = xTransform-mousex;
							yTransform = yTransform-mousey;
							scaleTotal = scaleTotal * 1.25;
							redraw(0);
						}
		},*/
		
		zoomout = function() {
						if (scaleTotal*.8 >= .8) {
							var w = canvas.width*(initialWidth/canvasWidth)*scaleTotal,
								h = canvas.height*(initialWidth/canvasWidth)*scaleTotal;
							scaleTotal = scaleTotal * .8;
							context = canvas.getContext("2d");
							contextBG = canvasBG.getContext("2d");
							clearCanvas();
							context.translate(canvas.width/2, canvas.height/2);
							contextBG.translate(canvas.width/2, canvas.height/2);
							xTransform = xTransform+w/2;
							yTransform = yTransform+h/2;
							context.scale(.8, .8);
							contextBG.scale(.8, .8);
							redraw(0);
							context.translate(-canvas.width/2, -canvas.height/2);
							contextBG.translate(-canvas.width/2, -canvas.height/2);
							xTransform = xTransform-w*.8/2;
							yTransform = yTransform-h*.8/2;
							redraw(0);
						}
		},
		
		zoomin = function() {
						if (scaleTotal*1.25 <= (1/.19657951641)) {
							var w = canvas.width*(initialWidth/canvasWidth)*scaleTotal,
								h = canvas.height*(initialWidth/canvasWidth)*scaleTotal;
							scaleTotal = scaleTotal * 1.25;
							context = canvas.getContext("2d");
							contextBG = canvasBG.getContext("2d");
							clearCanvas();
							context.translate(canvas.width/2, canvas.height/2);
							contextBG.translate(canvas.width/2, canvas.height/2);
							xTransform = xTransform+w/2;
							yTransform = yTransform+h/2;
							context.scale(1.25, 1.25);
							contextBG.scale(1.25, 1.25);
							context.translate(-canvas.width/2, -canvas.height/2);
							contextBG.translate(-canvas.width/2, -canvas.height/2);
							xTransform = xTransform-w*1.25/2;
							yTransform = yTransform-h*1.25/2;
							redraw(0);
						}
		},
		
		undo = function() {
			if (clickX.length > 0) {
				var isdragging = clickDrag.pop();
				clickXUndo.push(clickX.pop());
				clickYUndo.push(clickY.pop());
				clickToolUndo.push(clickTool.pop());
				clickColorUndo.push(clickColor.pop());
				clickSizeUndo.push(clickSize.pop());
				clickDragUndo.push(isdragging);
				clickIconUndo.push(clickIcon.pop());
				while (clickX.length > 0 && isdragging) {
					isdragging = clickDrag.pop();
					clickXUndo.push(clickX.pop());
					clickYUndo.push(clickY.pop());
					clickToolUndo.push(clickTool.pop());
					clickColorUndo.push(clickColor.pop());
					clickSizeUndo.push(clickSize.pop());
					clickDragUndo.push(isdragging);
					clickIconUndo.push(clickIcon.pop());

				}
				clearCanvas();
				redraw(0);
			}
		},
		
		redo = function() {
			if (clickXUndo.length > 0) {
				clickX.push(clickXUndo.pop());
				clickY.push(clickYUndo.pop());
				clickTool.push(clickToolUndo.pop());
				clickColor.push(clickColorUndo.pop());
				clickSize.push(clickSizeUndo.pop());
				clickDrag.push(clickDragUndo.pop());
				clickIcon.push(clickIconUndo.pop());
				while (clickXUndo.length > 0 && clickDragUndo[clickDragUndo.length-1]) {
					clickX.push(clickXUndo.pop());
					clickY.push(clickYUndo.pop());
					clickTool.push(clickToolUndo.pop());
					clickColor.push(clickColorUndo.pop());
					clickSize.push(clickSizeUndo.pop());
					clickDrag.push(clickDragUndo.pop());
					clickIcon.push(clickIconUndo.pop());
				}
				clearCanvas();
				redraw(0);
			}
		},

		// Calls the redraw function after all neccessary resources are loaded.
		resourceLoaded = function () {

			curLoadResNum += 1;
			if (curLoadResNum === totalLoadResources) {
				redraw();
				createUserEvents();
			}
		},

		// Creates a canvas element, loads images, adds events, and draws the canvas for the first time.
		init = function () {
			// Create the canvas (Necessary for IE because it doesn't know what a canvas element is)
			canvas = document.createElement('canvas');
			canvas.setAttribute('width', initialWidth);
			canvas.setAttribute('height', initialHeight);
			canvas.setAttribute('id', 'canvas');
			//canvas.style.border = "solid";
			//canvas.style.borderWidth = "1px";
			document.getElementById('canvasDiv').appendChild(canvas);
			if (typeof G_vmlCanvasManager !== "undefined") {
				canvas = G_vmlCanvasManager.initElement(canvas);
			}
			context = canvas.getContext("2d"); // Grab the 2d canvas context
			// Note: The above code is a workaround for IE 8 and lower. Otherwise we could have used:
			//     context = document.getElementById('canvas').getContext("2d");

			// Create the canvas (Necessary for IE because it doesn't know what a canvas element is)
			canvasBG = document.createElement('canvas');
			canvasBG.setAttribute('width', initialWidth);
			canvasBG.setAttribute('height', initialHeight);
			canvasBG.setAttribute('id', 'canvas');
			//canvasBG.style.border = "solid";
			//canvasBG.style.borderWidth = "1px";
			document.getElementById('canvasDivBackground').appendChild(canvasBG);
			if (typeof G_vmlCanvasManager !== "undefined") {
				canvas = G_vmlCanvasManager.initElement(canvasBG);
			}
			contextBG = canvasBG.getContext("2d"); // Grab the 2d canvas context
			// Note: The above code is a workaround for IE 8 and lower. Otherwise we could have used:
			//     context = document.getElementById('canvas').getContext("2d");
		
			spriteloc = {
    "abaddon": {
        "x": 5,
        "y": 5
    },
    "alchemist": {
        "x": 47,
        "y": 5
    },
    "ancient_apparition": {
        "x": 89,
        "y": 5
    },
    "antimage": {
        "x": 131,
        "y": 5
    },
    "axe": {
        "x": 173,
        "y": 5
    },
    "bane": {
        "x": 215,
        "y": 5
    },
    "batrider": {
        "x": 257,
        "y": 5
    },
    "beastmaster": {
        "x": 299,
        "y": 5
    },
    "bloodseeker": {
        "x": 341,
        "y": 5
    },
    "bm_earth": {
        "x": 383,
        "y": 5
    },
    "bm_fire": {
        "x": 425,
        "y": 5
    },
    "bm_storm": {
        "x": 5,
        "y": 47
    },
    "bounty_hunter": {
        "x": 47,
        "y": 47
    },
    "brewmaster": {
        "x": 89,
        "y": 47
    },
    "bristleback": {
        "x": 131,
        "y": 47
    },
    "broodmother": {
        "x": 173,
        "y": 47
    },
    "centaur": {
        "x": 215,
        "y": 47
    },
    "chaos_knight": {
        "x": 257,
        "y": 47
    },
    "chen": {
        "x": 299,
        "y": 47
    },
    "clinkz": {
        "x": 341,
        "y": 47
    },
    "crystal_maiden": {
        "x": 383,
        "y": 47
    },
    "dark_seer": {
        "x": 425,
        "y": 47
    },
    "dazzle": {
        "x": 5,
        "y": 89
    },
    "death_prophet": {
        "x": 47,
        "y": 89
    },
    "disruptor": {
        "x": 89,
        "y": 89
    },
    "doom": {
        "x": 131,
        "y": 89
    },
    "doom_bringer": {
        "x": 173,
        "y": 89
    },
    "dragon_knight": {
        "x": 215,
        "y": 89
    },
    "drow": {
        "x": 257,
        "y": 89
    },
    "drow_ranger": {
        "x": 299,
        "y": 89
    },
    "earth_spirit": {
        "x": 341,
        "y": 89
    },
    "earthshaker": {
        "x": 383,
        "y": 89
    },
    "elder_titan": {
        "x": 425,
        "y": 89
    },
    "ember_spirit": {
        "x": 5,
        "y": 131
    },
    "enchantress": {
        "x": 47,
        "y": 131
    },
    "enigma": {
        "x": 89,
        "y": 131
    },
    "faceless_void": {
        "x": 131,
        "y": 131
    },
    "furion": {
        "x": 173,
        "y": 131
    },
    "gyrocopter": {
        "x": 215,
        "y": 131
    },
    "huskar": {
        "x": 257,
        "y": 131
    },
    "invoker": {
        "x": 299,
        "y": 131
    },
    "jakiro": {
        "x": 341,
        "y": 131
    },
    "juggernaut": {
        "x": 383,
        "y": 131
    },
    "keeper_of_the_light": {
        "x": 425,
        "y": 131
    },
    "kunkka": {
        "x": 5,
        "y": 173
    },
    "lanaya": {
        "x": 47,
        "y": 173
    },
    "legion_commander": {
        "x": 89,
        "y": 173
    },
    "legion_commander_alt1": {
        "x": 131,
        "y": 173
    },
    "leshrac": {
        "x": 173,
        "y": 173
    },
    "lich": {
        "x": 215,
        "y": 173
    },
    "life_stealer": {
        "x": 257,
        "y": 173
    },
    "lina": {
        "x": 299,
        "y": 173
    },
    "lina_alt1": {
        "x": 341,
        "y": 173
    },
    "lion": {
        "x": 383,
        "y": 173
    },
    "lone_druid": {
        "x": 425,
        "y": 173
    },
    "luna": {
        "x": 5,
        "y": 215
    },
    "lycan": {
        "x": 47,
        "y": 215
    },
    "magnataur": {
        "x": 89,
        "y": 215
    },
    "medusa": {
        "x": 131,
        "y": 215
    },
    "meepo": {
        "x": 173,
        "y": 215
    },
    "mirana": {
        "x": 215,
        "y": 215
    },
    "morphling": {
        "x": 257,
        "y": 215
    },
    "naga_siren": {
        "x": 299,
        "y": 215
    },
    "necrolyte": {
        "x": 341,
        "y": 215
    },
    "nevermore": {
        "x": 383,
        "y": 215
    },
    "night_stalker": {
        "x": 425,
        "y": 215
    },
    "nyx_assassin": {
        "x": 5,
        "y": 257
    },
    "obsidian_destroyer": {
        "x": 47,
        "y": 257
    },
    "ogre_magi": {
        "x": 89,
        "y": 257
    },
    "omniknight": {
        "x": 131,
        "y": 257
    },
    "phantom_assassin": {
        "x": 173,
        "y": 257
    },
    "phantom_lancer": {
        "x": 215,
        "y": 257
    },
    "phoenix": {
        "x": 257,
        "y": 257
    },
    "puck": {
        "x": 299,
        "y": 257
    },
    "pudge": {
        "x": 341,
        "y": 257
    },
    "pugna": {
        "x": 383,
        "y": 257
    },
    "queenofpain": {
        "x": 425,
        "y": 257
    },
    "rattletrap": {
        "x": 5,
        "y": 299
    },
    "razor": {
        "x": 47,
        "y": 299
    },
    "riki": {
        "x": 89,
        "y": 299
    },
    "rikimaru": {
        "x": 131,
        "y": 299
    },
    "roshan": {
        "x": 173,
        "y": 299
    },
    "rubick": {
        "x": 215,
        "y": 299
    },
    "sand_king": {
        "x": 257,
        "y": 299
    },
    "sandking": {
        "x": 299,
        "y": 299
    },
    "shadow_demon": {
        "x": 341,
        "y": 299
    },
    "shadow_shaman": {
        "x": 383,
        "y": 299
    },
    "shredder": {
        "x": 425,
        "y": 299
    },
    "silencer": {
        "x": 5,
        "y": 341
    },
    "skeleton_king": {
        "x": 47,
        "y": 341
    },
    "skywrath_mage": {
        "x": 89,
        "y": 341
    },
    "slardar": {
        "x": 131,
        "y": 341
    },
    "slark": {
        "x": 173,
        "y": 341
    },
    "sniper": {
        "x": 215,
        "y": 341
    },
    "spectre": {
        "x": 257,
        "y": 341
    },
    "spirit_break": {
        "x": 299,
        "y": 341
    },
    "spirit_breaker": {
        "x": 341,
        "y": 341
    },
    "storm_spirit": {
        "x": 383,
        "y": 341
    },
    "sven": {
        "x": 425,
        "y": 341
    },
    "templar_assassin": {
        "x": 5,
        "y": 383
    },
    "terrorblade": {
        "x": 47,
        "y": 383
    },
    "terrorblade_alt1": {
        "x": 89,
        "y": 383
    },
    "tidehunter": {
        "x": 131,
        "y": 383
    },
    "tinker": {
        "x": 173,
        "y": 383
    },
    "tiny": {
        "x": 215,
        "y": 383
    },
    "treant": {
        "x": 257,
        "y": 383
    },
    "troll_warlord": {
        "x": 299,
        "y": 383
    },
    "tusk": {
        "x": 341,
        "y": 383
    },
    "undying": {
        "x": 383,
        "y": 383
    },
    "ursa": {
        "x": 425,
        "y": 383
    },
    "vengefulspirit": {
        "x": 5,
        "y": 425
    },
    "venomancer": {
        "x": 47,
        "y": 425
    },
    "viper": {
        "x": 89,
        "y": 425
    },
    "visage": {
        "x": 131,
        "y": 425
    },
    "ward_observer": {
        "x": 173,
        "y": 425
    },
    "ward_sentry": {
        "x": 215,
        "y": 425
    },
    "warlock": {
        "x": 257,
        "y": 425
    },
    "weaver": {
        "x": 299,
        "y": 425
    },
    "windrunner": {
        "x": 341,
        "y": 425
    },
    "wisp": {
        "x": 383,
        "y": 425
    },
    "witch_doctor": {
        "x": 425,
        "y": 425
    },
    "zuus": {
        "x": 467,
        "y": 5
    }
}

			var sources = {
			spritesheet: "/media/images/miniherospritesheet.png",
			background: "{{ media_url('images/dota_map.jpg') }}"
			};
			loadImages(sources, function(images) {
			clearCanvas();
			redraw(0);
			createUserEvents();			
			});
			
			$(document).on('change', 'input:radio[id^="radio"]', function (event) {
				selectedRadio = $(this).attr('id');
			});

$('.miniherosprite').click(function() {
	if ($('#iconSavedContainer').find(':last-child').attr('id') == undefined || $('#iconSavedContainer').find(':last-child').attr('id').substring(5) != $(this).attr('id').substring(6)) {
		var icon_img = $('<div class=\'miniherosprite miniherosprite-' + $(this).attr('id').substring(6) + ' img_icon\'></div>').attr('id','icon_'+$(this).attr('id').substring(6));
		icon_img.click(function() {
			$('#hero').val($(this).attr('id').substring(5));
			selectedRadio = 'radio3';
			$('#radio1').parent().removeClass('active');
			$('#radio2').parent().removeClass('active');
			$('#radio3').parent().addClass('active');
		});
		if (heroIconSaveCount < 10) {
			heroIconSaveCount += 1;
		}
		else {
			$('#iconSavedContainer').find(':first-child').remove();
		}
		$('#iconSavedContainer').append(icon_img);
	}
	$('#hero').val($(this).attr('id').substring(6));
	selectedRadio = 'radio3';
	$('#radio1').parent().removeClass('active');
	$('#radio2').parent().removeClass('active');
	$('#radio3').parent().addClass('active');
});
$(".dropdown-menu input").click(function(e) {
            e.stopPropagation();// prevent the default anchor functionality
});
$(".dropdown-menu label").click(function(e) {
			if ($(this).parent().attr('id') != 'radiogroup') {
				e.stopPropagation();// prevent the default anchor functionality
			}
});
$(".dropdown-menu select").click(function(e) {
            e.stopPropagation();// prevent the default anchor functionality
});
$(".dropdown-menu img").click(function(e) {
            //e.stopPropagation();// prevent the default anchor functionality
});
			
			var $window = $(window).on('resize', function(){
			   var height = $('html').height() - $('.navbar').outerHeight(true)-5;
			   //console.log($('.navbar').outerHeight(true));
			   $('#canvasContainers').height(height);
			   $('#canvasDiv').height(height);
			   $('#canvasDivBackground').height(height);
			   //console.log('resizing');
			   resizeCanvas();
			}).trigger('resize');
		};
	
	document.onkeyup=function(e) {
	if(e.which == 17) isCtrl=false;
}
document.onkeydown=function(e) {
	if(e.which == 17) isCtrl=true;
	if(e.which == 90 && isCtrl == true) {
		//run code for CTRL+Z
		undo();
		return false; 
	} 
	if(e.which == 89 && isCtrl == true) {
		//run code for CTRL+Y
		redo();
		return false; 
	}
}

	return {
		init: init
	};
}());

function loadImages(sources, callback) {

var loadedImages = 0;
var numImages = 0;
// get num of sources
for(var src in sources) {
  numImages++;
}
for(var src in sources) {
  images[src] = new Image();
  images[src].onload = function() {
	if(++loadedImages >= numImages) {
	  callback(images);
	}
  };
  images[src].src = sources[src];
}
}

 $(function() {
$( "#size_slider" ).slider({
range: "min",
value: 5,
min: 1,
max: 100,
slide: function( event, ui ) {
$( "#amount" ).val(ui.value );
}
});
$( "#amount" ).val( $( "#size_slider" ).slider( "value" ) );

//moveScroller();

});

function moveScroller() {
    var move = function() {
        var st = $(window).scrollTop();
        var ot = $("#scroller-anchor").offset().top;
        var s = $("#scroller");
        if(st > ot) {
            s.css({
                position: "fixed",
                top: "0px"
            });
        } else {
            if(st <= ot) {
                s.css({
                    position: "relative",
                    top: ""
                });
            }
        }
    };
    $(window).scroll(move);
    move();
}

$('#amount').change(function(){
    $( '#slider' ).slider( "value", $( "#amount" ).val());
});

$('#iconContainerExpand').click(function() {
	if (heroIconContainerExpand) {
		heroIconContainerExpand = 0;
		$(this).html('-');
		$('.icons').show();
	}
	else {
		heroIconContainerExpand = 1;
		$(this).html('+');
		$('.icons').hide();
	}
});

$('#hero').change(function() {
	var icon_img = $('<div class=\'miniherosprite miniherosprite-' + $(this).val() + ' img_icon\'></div>').attr('id','icon_'+$(this).val());
	//var icon_img = $('<img class=\'img_icon\'>').attr('id','icon_'+$(this).val()).attr('src','{{ media_url('images/miniheroes/') }}' + $(this).val() + '.png');
	icon_img.click(function() {
		$('#hero').val($(this).attr('id').substring(5));
		$("#radio3").attr('checked', 'checked');
	});
	if (heroIconSaveCount < 10) {
		heroIconSaveCount += 1;
	}
	else {
		$('#iconSavedContainer').find(':first-child').remove();
	}
	$('#iconSavedContainer').append(icon_img);
});


function getUrlVars() {
    var vars = [], hash, hashes;
	if (window.location.href.indexOf('?') > -1) {
		hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');

		for(var i = 0; i < hashes.length; i++)
		{
			hash = hashes[i].split('=');
			vars.push(hash[0]);
			vars[hash[0]] = hash[1];
		}
	}
	else {
		hashes = window.location.href.split('/');
		vars.id = hashes[hashes.length-1];
	}
	if ((typeof vars.id == 'undefined') || (vars.id == 'drawablemap') || (vars.id == '') || (vars.id == 'drawablemap.html')) {
		drawingApp.init();
	}
	else {
		getSaveData(vars.id);
	}
}

function save() {
	var value = JSON.stringify([clickX ,
		clickY ,
		clickColor ,
		clickTool ,
		clickSize ,
		clickDrag ,
		clickIcon ,
		clickXUndo ,
		clickYUndo ,
		clickColorUndo ,
		clickToolUndo ,
		clickSizeUndo ,
		clickDragUndo ,
		clickIconUndo]);
	$.ajax({
		type: "POST",
		url: "drawablemap.py",
		data: {'data':value},
		dataType: "json",
		success: function(data){
			var a = document.createElement('a');
			//a.style.float = 'left';
			a.href = "/dota2/apps/drawablemap/" + data.data;
			a.target = "_blank";
			a.innerHTML = "test.devilesk.com/dota2/apps/drawablemap/" + data.data;
			document.getElementById('savelink').innerHTML = "";
			document.getElementById('savelink').appendChild(a);
		},
		failure: function(errMsg) {
			alert("Save request failed.");
		}
	});
}

function getSaveData(value) {
$.ajax({
    type: "POST",
    url: "drawablemap.py",
    data: {'id':value},
    dataType: "json",
    success: function(data){
		if (data != "no file") {
			result = JSON.parse(data);
			clickX = result[0];
			clickY = result[1];
			clickColor = result[2];
			clickTool = result[3];
			clickSize = result[4];
			clickDrag = result[5];
			clickIcon = result[6];
			clickXUndo = result[7];
			clickYUndo = result[8];
			clickColorUndo = result[9];
			clickToolUndo = result[10];
			clickSizeUndo = result[11];
			clickDragUndo = result[12];
			clickIconUndo = result[13];
		}
		else {
			alert("Drawing could not be found.");
		}
		drawingApp.init();
	},
    failure: function(errMsg) {
        alert("Request failed.");
		drawingApp.init();
    }
});
}

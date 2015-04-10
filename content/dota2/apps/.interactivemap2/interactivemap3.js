$(function(){function p(e){var n=new OpenLayers.Size(21,25);var r=new OpenLayers.Pixel(-(n.w/2),-n.h);var i=new OpenLayers.Icon("/dota2/images/miniheroes/ward_observer.png",n,r);var s=t.getLonLatFromPixel(e.xy);var o=new OpenLayers.Marker(s,i);l.addMarker(o);var u=OpenLayers.Geometry.Polygon.createRegularPolygon(new OpenLayers.Geometry.Point(s.lon,s.lat),S(1600),30);var a=new OpenLayers.Feature.Vector(u);f.addFeatures(a);o.radius_feature=a;var c=function(e){f.removeFeatures(o.radius_feature);l.removeMarker(o);OpenLayers.Event.stop(e)};o.events.register("mousedown",this,c)}function d(e){var n=new OpenLayers.Size(21,25);var r=new OpenLayers.Pixel(-(n.w/2),-n.h);var i=new OpenLayers.Icon("/dota2/images/miniheroes/ward_sentry.png",n,r);var s=t.getLonLatFromPixel(e.xy);var o=new OpenLayers.Marker(s,i);l.addMarker(o);var u={strokeColor:"#007FFF",strokeOpacity:1,strokeWidth:1,fillColor:"#007FFF",fillOpacity:.4};var a=OpenLayers.Geometry.Polygon.createRegularPolygon(new OpenLayers.Geometry.Point(s.lon,s.lat),S(800),30);var c=new OpenLayers.Feature.Vector(a,null,u);f.addFeatures(c);o.radius_feature=c;var h=function(e){f.removeFeatures(o.radius_feature);l.removeMarker(o);OpenLayers.Event.stop(e)};o.events.register("mousedown",this,h)}function v(e){console.log(e)}function m(e){var t=e.geometry;var n="units";var r=e.order;var i=e.measure;var s=document.getElementById("output");var o="";if(r==1){if(e.units=="km"){o+="distance: "+(i*3214.07509338).toFixed(0)+" "+n}else{o+="distance: "+(i*3.21407509338).toFixed(0)+" "+n}}else{o+="distance: "+(i*3.21407509338).toFixed(0)+" "+n+"<sup>2</"+"sup>"}s.innerHTML=o}function g(e){var t=e.geometry;var n="units";var r=e.order;var i=e.measure;var s=document.getElementById("output");var o="";if(r==1){if(e.units=="km"){o+="radius: "+(i*3214.07509338).toFixed(0)+" "+n}else{o+="radius: "+(i*3.21407509338).toFixed(0)+" "+n}}else{o+="distance: "+(i*3.21407509338).toFixed(0)+" "+n+"<sup>2</"+"sup>"}s.innerHTML=o}function y(e){console.log(e);var t=e.geometry;var n="units";var r=e.order;var i=e.measure;var s=document.getElementById("output");var o="";if(r==1){if(i>0){if(e.geometry.components.length>2){this.cancel()}if(e.units=="km"){var u=OpenLayers.Geometry.Polygon.createRegularPolygon(new OpenLayers.Geometry.Point(e.geometry.components[0].x,e.geometry.components[0].y),i*1e3,30)}else{var u=OpenLayers.Geometry.Polygon.createRegularPolygon(new OpenLayers.Geometry.Point(e.geometry.components[0].x,e.geometry.components[0].y),i,30)}var f=new OpenLayers.Feature.Vector(u);a.removeFeatures(e.geometry.circle_features);if("circle_features"in e.geometry){e.geometry.circle_features.length=0;e.geometry.circle_features.push(f)}else{e.geometry.circle_features=[f]}a.addFeatures(f)}if(e.units=="km"){o+="radius: "+(i*3214.07509338).toFixed(0)+" "+n}else{o+="radius: "+(i*3.21407509338).toFixed(0)+" "+n}}else{o+="distance: "+(i*3.21407509338).toFixed(0)+" "+n+"<sup>2</"+"sup>"}s.innerHTML=o}function T(e,n,r,i,s,o){var u=new OpenLayers.Feature(e,n);u.closeBox=s;u.popupClass=r;u.data.popupContentHTML=i;u.data.overflow=o?"auto":"hidden";var a=u.createMarker();var f=function(e){if(this.popup==null){this.popup=this.createPopup(this.closeBox);t.addPopup(this.popup);this.popup.show()}else{this.popup.toggle()}currentPopup=this.popup;OpenLayers.Event.stop(e)};if(e.name=="Towers"){a.events.register("mouseover",u,f);a.events.register("mouseout",u,f)}e.addMarker(a);return a}function A(e){var n=this.map.getResolution();var r=Math.round((e.left-this.maxExtent.left)/(n*this.tileSize.w));var i=Math.round((this.maxExtent.top-e.top)/(n*this.tileSize.h));var s=t.getZoom();var o=s+"/tile_"+r+"_"+i+"."+this.type;var u=this.url;if(u instanceof Array){u=this.selectUrl(o,u)}return u+o}$("#controls-max").click(function(){$("#controlslist").toggle();$("#output").toggle();$(this).hide();$("#controls-min").show()});$("#controls-min").click(function(){$("#controlslist").toggle();$("#output").toggle();$(this).hide();$("#controls-max").show()});var t=new OpenLayers.Map("map",{maxExtent:new OpenLayers.Bounds(0,0,5120,5120),numZoomLevels:3,maxResolution:4,units:"m",projection:"EPSG:900913",displayProjection:new OpenLayers.Projection("EPSG:4326")});var n=new OpenLayers.Layer.TMS("Dota 2 Map","/dota2/apps/interactivemap2/tiles/",{type:"png",getURL:A});t.addLayer(n);t.zoomToMaxExtent();var r=new OpenLayers.Control.LayerSwitcher({ascending:false});t.addControl(r);r.maximizeControl();var i=new OpenLayers.Layer.Vector("Day Vision Range");t.addLayer(i);var s=new OpenLayers.Layer.Vector("Night Vision Range");t.addLayer(s);var o=new OpenLayers.Layer.Vector("True Sight Range");t.addLayer(o);var u=new OpenLayers.Layer.Vector("Attack Range");t.addLayer(u);var a=new OpenLayers.Layer.Vector("Drawn Circles");t.addLayer(a);var f=new OpenLayers.Layer.Vector("Ward Vision");t.addLayer(f);var l=new OpenLayers.Layer.Markers("Placed Wards");t.addLayer(l);polyOptions={sides:30};OpenLayers.Control.Click=OpenLayers.Class(OpenLayers.Control,{defaultHandlerOptions:{single:true,"double":false,pixelTolerance:0,stopSingle:false,stopDouble:false},initialize:function(e){this.handlerOptions=OpenLayers.Util.extend({},this.defaultHandlerOptions);OpenLayers.Control.prototype.initialize.apply(this,arguments);this.handler=new OpenLayers.Handler.Click(this,{click:this.onClick,dblclick:this.onDblclick},this.handlerOptions)},onClick:v,onDblclick:function(e){var t=document.getElementById(this.key+"Output");var n="dblclick "+e.xy;t.value=t.value+n+"\n"}});var c=OpenLayers.Util.getParameters(window.location.href).renderer;c=c?[c]:OpenLayers.Layer.Vector.prototype.renderers;drawControls={line:new OpenLayers.Control.Measure(OpenLayers.Handler.Path,{persist:true,immediate:true,handlerOptions:{layerOptions:{renderers:c}}}),circle:new OpenLayers.Control.Measure(OpenLayers.Handler.Path,{persist:true,immediate:true,handlerOptions:{layerOptions:{renderers:c}}}),observerclick:new OpenLayers.Control.Click({onClick:p,handlerOptions:{single:true}}),sentryclick:new OpenLayers.Control.Click({onClick:d,handlerOptions:{single:true}}),polygonControl:new OpenLayers.Control.DrawFeature(a,OpenLayers.Handler.RegularPolygon,{handlerOptions:polyOptions}),select:new OpenLayers.Control.SelectFeature(a,{hover:true,highlightOnly:false,callbacks:{click:function(e){var t=document.getElementById("output");t.innerHTML="";a.removeFeatures(e)}},overFeature:function(e){var t=document.getElementById("output");var n="radius: "+(.565352*Math.sqrt(e.geometry.getArea())*3.21407509338).toFixed(0)+" units";t.innerHTML=n;this.highlight(e)},outFeature:function(e){var t=document.getElementById("output");t.innerHTML="";this.unhighlight(e)}})};for(var h in drawControls){if(h=="line"){drawControls[h].events.on({measure:m,measurepartial:m})}if(h=="circle"){drawControls[h].events.on({measure:g,measurepartial:y})}t.addControl(drawControls[h])}toggleControl=function(e){for(h in drawControls){var t=drawControls[h];if(e.value==h&&e.checked){t.activate()}else{t.deactivate()}if((e.value=="polygonControl"||e.value=="circle")&&e.checked){drawControls["select"].activate()}else{drawControls["select"].deactivate()}}var e=document.getElementById("output");e.innerHTML=""};var b=new OpenLayers.Size(21,25);var w=new OpenLayers.Pixel(-(b.w/2),-b.h);var E=new OpenLayers.Icon("http://www.openlayers.org/dev/img/marker.png",b,w);var S=function(e){return e/(8150- -8200)*5087};var x=function(e){console.log(e);console.log(a);if(!e.object.showinfo){var t=OpenLayers.Geometry.Polygon.createRegularPolygon(new OpenLayers.Geometry.Point(e.object.lonlat.lon,e.object.lonlat.lat),S(e.object.day_vision_radius),30);var n=new OpenLayers.Feature.Vector(t);i.addFeatures(n);e.object.day_vision_feature=n;var r={strokeColor:"#007FFF",strokeOpacity:1,strokeWidth:1,fillColor:"#007FFF",fillOpacity:.4};var t=OpenLayers.Geometry.Polygon.createRegularPolygon(new OpenLayers.Geometry.Point(e.object.lonlat.lon,e.object.lonlat.lat),S(e.object.true_sight_radius),30);var n=new OpenLayers.Feature.Vector(t,null,r);o.addFeatures(n);e.object.true_sight_feature=n;var t=OpenLayers.Geometry.Polygon.createRegularPolygon(new OpenLayers.Geometry.Point(e.object.lonlat.lon,e.object.lonlat.lat),S(e.object.night_vision_radius),30);var n=new OpenLayers.Feature.Vector(t);console.log(n);s.addFeatures(n);e.object.night_vision_feature=n;var r={strokeColor:"#FF0000",strokeOpacity:1,strokeWidth:1,fillColor:"#FF0000",fillOpacity:.4};var t=OpenLayers.Geometry.Polygon.createRegularPolygon(new OpenLayers.Geometry.Point(e.object.lonlat.lon,e.object.lonlat.lat),S(e.object.attack_range_radius),30);var n=new OpenLayers.Feature.Vector(t,null,r);u.addFeatures(n);e.object.attack_range_feature=n}else{i.removeFeatures(e.object.day_vision_feature);s.removeFeatures(e.object.night_vision_feature);o.removeFeatures(e.object.true_sight_feature);u.removeFeatures(e.object.attack_range_feature)}e.object.showinfo=!e.object.showinfo};$.getJSON("/dota2/apps/interactivemap2/data.json",function(n){console.log(n);var r={npc_dota_roshan_spawner:"Roshan",dota_item_rune_spawner:"Runes",ent_dota_tree:"Trees",npc_dota_fort:"Ancients",ent_dota_shop:"Shops",npc_dota_tower:"Towers",npc_dota_barracks:"Barracks",npc_dota_building:"Buildings",trigger_multiple:"Neutral Camps Spawn Boxes",npc_dota_neutral_spawner:"Neutral Camps"};var i={};for(var s in n){if(s!="trigger_multiple"&&s!="ent_dota_tree"){i[s]=new OpenLayers.Layer.Markers(r[s]);t.addLayer(i[s]);i[s].setVisibility(false);for(var o=0;o<n[s].length;o++){e=n[s][o];var u=OpenLayers.Popup.FramedCloud;var a="Click to toggle range overlay";var f=T(i[s],new OpenLayers.LonLat(e[0],5120-e[1]),u,a,false);f.day_vision_radius=1800;f.night_vision_radius=800;f.true_sight_radius=900;f.attack_range_radius=700;f.showInfo=false;if(s=="npc_dota_tower"){f.events.register("mousedown",i[s],x)}}}if(s=="ent_dota_tree"){i[s]=new OpenLayers.Layer.Markers(r[s]);t.addLayer(i[s]);i[s].setVisibility(false);i[s].data=n[s]}if(s=="trigger_multiple"){i["npc_dota_neutral_spawner_box"]=new OpenLayers.Layer.Vector(r[s]);t.addLayer(i["npc_dota_neutral_spawner_box"]);i["npc_dota_neutral_spawner_box"].setVisibility(false);for(var o=0;o<n[s].length;o++){e=n[s][o];var l={strokeColor:"#00FF00",strokeOpacity:1,strokeWidth:1,fillColor:"#00FF00",fillOpacity:.4};var c=[];for(var h=0;h<e.length;h++){c.push(new OpenLayers.Geometry.Point(e[h][0],5120-e[h][1]))}var p=new OpenLayers.Geometry.LinearRing(c);var d=new OpenLayers.Feature.Vector(p,null,l);i["npc_dota_neutral_spawner_box"].addFeatures([d])}}}var v=t.getLayersByName("Placed Wards")[0];t.raiseLayer(v,t.layers.length);console.log(t.layers);t.events.register("changelayer",null,function(t){if(t.property==="visibility"&&t.layer.name==r["ent_dota_tree"]&&!t.layer.loaded){for(var n=0;n<t.layer.data.length;n++){e=t.layer.data[n];var i=OpenLayers.Popup.FramedCloud;var s="Tower";var o=T(t.layer,new OpenLayers.LonLat(e[0],5120-e[1]),i,s,false)}t.layer.loaded=!t.layer.loaded}})});var N=5087,C=4916,k=[-8200,8150],L=[8239,-7639];var S=function(e){return e/(k[1]-k[0])*N}})
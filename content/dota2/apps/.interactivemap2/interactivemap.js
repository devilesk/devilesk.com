//http://gis.ibbeck.de/ginfo/apps/OLExamples/OL29/Thaleskreis/thaleskreis.asp
$(function() {
    var SENTRY_VISION_RADIUS = 850,
        OBSERVER_VISION_RADIUS = 1600,
        map_w = 5120,
        map_h = 5120,
        map_x_boundaries = [-8200, 8200],
        map_y_boundaries = [7558, -8842];
    $('#controls-max').click(function() {
        $('#controlslist').toggle();
        $('#output').toggle();
        $(this).hide();
        $('#controls-min').show();
    });
    $('#controls-min').click(function() {
        $('#controlslist').toggle();
        $('#output').toggle();
        $(this).hide();
        $('#controls-max').show();
    });
    $('#coordControl').change(function() {
        if (this.checked) {
            $('#coords').show();
        } else {
            $('#coords').hide();
        }
    });
    var map = new OpenLayers.Map('map', {
        maxExtent: new OpenLayers.Bounds(0, 0, 5120, 5120),
        numZoomLevels: 3,
        maxResolution: 4,
        units: 'm',
        projection: "EPSG:900913",
        displayProjection: new OpenLayers.Projection("EPSG:900913")
    });
    var layerNames = {
        npc_dota_roshan_spawner: 'Roshan',
        dota_item_rune_spawner: 'Runes',
        ent_dota_tree: 'Trees',
        npc_dota_fort: 'Ancients',
        ent_dota_shop: 'Shops',
        npc_dota_tower: 'Towers',
        npc_dota_barracks: 'Barracks',
        npc_dota_building: 'Buildings',
        trigger_multiple: 'Neutral Camps Spawn Boxes',
        npc_dota_neutral_spawner: 'Neutral Camps',
    }
    var wms = new OpenLayers.Layer.TMS("Dota 2 Map", "/dota2/apps/interactivemap2/tiles/", {
        type: 'png',
        getURL: get_my_url
    });
    map.addLayer(wms);
    map.zoomToMaxExtent();
    var ls = new OpenLayers.Control.LayerSwitcher({
        'ascending': false
    })
    map.addControl(ls);
    ls.maximizeControl();
    var dayRangeLayer = new OpenLayers.Layer.Vector("Day Vision Range");
    map.addLayer(dayRangeLayer);
    var nightRangeLayer = new OpenLayers.Layer.Vector("Night Vision Range");
    map.addLayer(nightRangeLayer);
    var trueSightRangeLayer = new OpenLayers.Layer.Vector("True Sight Range");
    map.addLayer(trueSightRangeLayer);
    var attackRangeLayer = new OpenLayers.Layer.Vector("Attack Range");
    map.addLayer(attackRangeLayer);
    var polygonLayer = new OpenLayers.Layer.Vector("Drawn Circles");
    map.addLayer(polygonLayer);
    var wardVisionLayer = new OpenLayers.Layer.Vector("Ward Vision");
    map.addLayer(wardVisionLayer);
    var iconLayer = new OpenLayers.Layer.Markers("Placed Wards");
    map.addLayer(iconLayer);
    polyOptions = {
        sides: 30
    };
    OpenLayers.Control.Click = OpenLayers.Class(OpenLayers.Control, {
        defaultHandlerOptions: {
            'single': true,
            'double': false,
            'pixelTolerance': 0,
            'stopSingle': false,
            'stopDouble': false
        },
        initialize: function(options) {
            this.handlerOptions = OpenLayers.Util.extend({}, this.defaultHandlerOptions);
            OpenLayers.Control.prototype.initialize.apply(this, arguments);
            this.handler = new OpenLayers.Handler.Click(this, {
                'click': this.onClick,
                'dblclick': this.onDblclick
            }, this.handlerOptions);
        },
        onClick: handleOnClick,
        onDblclick: function(evt) {
            var output = document.getElementById(this.key + "Output");
            var msg = "dblclick " + evt.xy;
            output.value = output.value + msg + "\n";
        }
    });
    var renderer = OpenLayers.Util.getParameters(window.location.href).renderer;
    renderer = (renderer) ? [renderer] : OpenLayers.Layer.Vector.prototype.renderers;
    drawControls = {
        line: new OpenLayers.Control.Measure(OpenLayers.Handler.Path, {
            persist: true,
            immediate: true,
            handlerOptions: {
                layerOptions: {
                    renderers: renderer
                }
            }
        }),
        circle: new OpenLayers.Control.Measure(OpenLayers.Handler.Path, {
            persist: true,
            immediate: true,
            handlerOptions: {
                layerOptions: {
                    renderers: renderer
                }
            }
        }),
        observerclick: new OpenLayers.Control.Click({
            onClick: handleObserverClick,
            handlerOptions: {
                "single": true
            }
        }),
        sentryclick: new OpenLayers.Control.Click({
            onClick: handleSentryClick,
            handlerOptions: {
                "single": true
            }
        }),
        polygonControl: new OpenLayers.Control.DrawFeature(polygonLayer, OpenLayers.Handler.RegularPolygon, {
            handlerOptions: polyOptions
        }),
        select: new OpenLayers.Control.SelectFeature(polygonLayer, {
            hover: true,
            highlightOnly: false,
            callbacks: {
                click: function(feature) {
                    var element = document.getElementById('output');
                    element.innerHTML = "";
                    polygonLayer.removeFeatures(feature);
                }
            },
            overFeature: function(feature) {
                var element = document.getElementById('output');
                var out = "radius: " + (0.565352 * Math.sqrt(feature.geometry.getArea()) * 3.21407509338).toFixed(0) + " units";
                element.innerHTML = out;
                this.highlight(feature);
            },
            outFeature: function(feature) {
                var element = document.getElementById('output');
                element.innerHTML = "";
                this.unhighlight(feature);
            }
        })
    };
    for (var key in drawControls) {
        if (key == 'line') {
            drawControls[key].events.on({
                "measure": handleMeasurements,
                "measurepartial": handleMeasurements
            })
        }
        if (key == 'circle') {
            drawControls[key].events.on({
                "measure": handleCircleMeasurements,
                "measurepartial": handleCircleMeasurementsPartial
            })
        }
        map.addControl(drawControls[key]);
    }
    map.events.register("mousemove", map, function(e) {
        var position = this.events.getMousePosition(e),
            lonlat = map.getLonLatFromPixel(e.xy),
            xy = getMapCoordinates(lonlat.lon, 5120 - lonlat.lat);
        position.x = xy[0].toFixed(0);
        position.y = xy[1].toFixed(0);
        OpenLayers.Util.getElement("coords").innerHTML = position;
    });

    function getMapCoordinates(x, y) {
        var x_r = lerp(map_x_boundaries[0], map_x_boundaries[1], x / map_w),
            y_r = lerp(map_y_boundaries[0], map_y_boundaries[1], y / map_h);
        return [x_r, y_r];
    }

    function lerp(minVal, maxVal, pos_r) {
        return (pos_r * (maxVal - minVal) + minVal)
    }

    function handleObserverClick(event) {
        var size = new OpenLayers.Size(21, 25);
        var offset = new OpenLayers.Pixel(-(size.w / 2), -size.h);
        var icon = new OpenLayers.Icon('ward_observer.png', size, offset);
        var latlon = map.getLonLatFromPixel(event.xy);
        var latlon_pt = new OpenLayers.Geometry.Point(latlon.lon, latlon.lat);
        var marker = new OpenLayers.Marker(latlon, icon)
        iconLayer.addMarker(marker);
        var circle = OpenLayers.Geometry.Polygon.createRegularPolygon(new OpenLayers.Geometry.Point(latlon.lon, latlon.lat), getScaledRadius(OBSERVER_VISION_RADIUS), 40);
        var feature = new OpenLayers.Feature.Vector(circle);
        wardVisionLayer.addFeatures(feature);
        marker.radius_feature = feature;
        var markerClick = function(evt) {
            wardVisionLayer.removeFeatures(marker.radius_feature);
            iconLayer.removeMarker(marker);
            OpenLayers.Event.stop(evt);
        };
        marker.events.register("mousedown", this, markerClick);
    }

    function handleSentryClick(event) {
        var size = new OpenLayers.Size(21, 25);
        var offset = new OpenLayers.Pixel(-(size.w / 2), -size.h);
        var icon = new OpenLayers.Icon('ward_sentry.png', size, offset);
        var latlon = map.getLonLatFromPixel(event.xy);
        var marker = new OpenLayers.Marker(latlon, icon)
        iconLayer.addMarker(marker);
        var style = {
            strokeColor: "#007FFF",
            strokeOpacity: 1,
            strokeWidth: 1,
            fillColor: "#007FFF",
            fillOpacity: 0.4
        };
        var circle = OpenLayers.Geometry.Polygon.createRegularPolygon(new OpenLayers.Geometry.Point(latlon.lon, latlon.lat), getScaledRadius(SENTRY_VISION_RADIUS), 30);
        var feature = new OpenLayers.Feature.Vector(circle, null, style);
        wardVisionLayer.addFeatures(feature);
        marker.radius_feature = feature;
        var markerClick = function(evt) {
            wardVisionLayer.removeFeatures(marker.radius_feature);
            iconLayer.removeMarker(marker);
            OpenLayers.Event.stop(evt);
        };
        marker.events.register("mousedown", this, markerClick);
    }

    function handleOnClick(event) {
        console.log(event);
    }

    function handleMeasurements(event) {
        var geometry = event.geometry;
        var units = 'units';
        var order = event.order;
        var measure = event.measure;
        var element = document.getElementById('output');
        var out = "";
        if (order == 1) {
            if (event.units == 'km') {
                out += "distance: " + (measure * 3214.07509338).toFixed(0) + " " + units;
            } else {
                out += "distance: " + (measure * 3.21407509338).toFixed(0) + " " + units;
            }
        } else {
            out += "distance: " + (measure * 3.21407509338).toFixed(0) + " " + units + "<sup>2</" + "sup>";
        }
        element.innerHTML = out;
    }

    function handleCircleMeasurements(event) {
        var geometry = event.geometry;
        var units = 'units';
        var order = event.order;
        var measure = event.measure;
        var element = document.getElementById('output');
        var out = "";
        if (order == 1) {
            if (event.units == 'km') {
                out += "radius: " + (measure * 3214.07509338).toFixed(0) + " " + units;
            } else {
                out += "radius: " + (measure * 3.21407509338).toFixed(0) + " " + units;
            }
        } else {
            out += "distance: " + (measure * 3.21407509338).toFixed(0) + " " + units + "<sup>2</" + "sup>";
        }
        element.innerHTML = out;
    }

    function handleCircleMeasurementsPartial(event) {
        console.log(event);
        var geometry = event.geometry;
        var units = 'units';
        var order = event.order;
        var measure = event.measure;
        var element = document.getElementById('output');
        var out = "";
        if (order == 1) {
            if (measure > 0) {
                if (event.geometry.components.length > 2) {
                    this.cancel();
                }
                if (event.units == 'km') {
                    var circle = OpenLayers.Geometry.Polygon.createRegularPolygon(new OpenLayers.Geometry.Point(event.geometry.components[0].x, event.geometry.components[0].y), measure * 1000, 30);
                } else {
                    var circle = OpenLayers.Geometry.Polygon.createRegularPolygon(new OpenLayers.Geometry.Point(event.geometry.components[0].x, event.geometry.components[0].y), measure, 30);
                }
                var feature = new OpenLayers.Feature.Vector(circle);
                polygonLayer.removeFeatures(event.geometry.circle_features);
                if ('circle_features' in event.geometry) {
                    event.geometry.circle_features.length = 0;
                    event.geometry.circle_features.push(feature);
                } else {
                    event.geometry.circle_features = [feature];
                }
                polygonLayer.addFeatures(feature);
            }
            if (event.units == 'km') {
                out += "radius: " + (measure * 3214.07509338).toFixed(0) + " " + units;
            } else {
                out += "radius: " + (measure * 3.21407509338).toFixed(0) + " " + units;
            }
        } else {
            out += "distance: " + (measure * 3.21407509338).toFixed(0) + " " + units + "<sup>2</" + "sup>";
        }
        element.innerHTML = out;
    }
    toggleControl = function(element) {
        for (key in drawControls) {
            var control = drawControls[key];
            if (element.value == key && element.checked) {
                control.activate();
            } else {
                control.deactivate();
            }
            if ((element.value == 'polygonControl' || element.value == 'circle') && element.checked) {
                drawControls['select'].activate();
            } else {
                drawControls['select'].deactivate();
            }
        }
        var element = document.getElementById('output');
        element.innerHTML = "";
    }
    var size = new OpenLayers.Size(21, 25);
    var offset = new OpenLayers.Pixel(-(size.w / 2), -size.h);
    var icon = new OpenLayers.Icon('http://www.openlayers.org/dev/img/marker.png', size, offset);
    var getScaledRadius = function(r) {
        return r / (map_x_boundaries[1] - map_x_boundaries[0]) * map_w;
    }
    var markerClick = function(e) {
        console.log(e);
        console.log(polygonLayer);
        if (!e.object.showinfo) {
            var circle = OpenLayers.Geometry.Polygon.createRegularPolygon(new OpenLayers.Geometry.Point(e.object.lonlat.lon, e.object.lonlat.lat), getScaledRadius(e.object.day_vision_radius), 30);
            var feature = new OpenLayers.Feature.Vector(circle);
            dayRangeLayer.addFeatures(feature);
            e.object.day_vision_feature = feature;
            var style = {
                strokeColor: "#007FFF",
                strokeOpacity: 1,
                strokeWidth: 1,
                fillColor: "#007FFF",
                fillOpacity: 0.4
            };
            var circle = OpenLayers.Geometry.Polygon.createRegularPolygon(new OpenLayers.Geometry.Point(e.object.lonlat.lon, e.object.lonlat.lat), getScaledRadius(e.object.true_sight_radius), 30);
            var feature = new OpenLayers.Feature.Vector(circle, null, style);
            trueSightRangeLayer.addFeatures(feature);
            e.object.true_sight_feature = feature;
            var circle = OpenLayers.Geometry.Polygon.createRegularPolygon(new OpenLayers.Geometry.Point(e.object.lonlat.lon, e.object.lonlat.lat), getScaledRadius(e.object.night_vision_radius), 30);
            var feature = new OpenLayers.Feature.Vector(circle);
            console.log(feature);
            nightRangeLayer.addFeatures(feature);
            e.object.night_vision_feature = feature;
            var style = {
                strokeColor: "#FF0000",
                strokeOpacity: 1,
                strokeWidth: 1,
                fillColor: "#FF0000",
                fillOpacity: 0.4
            };
            var circle = OpenLayers.Geometry.Polygon.createRegularPolygon(new OpenLayers.Geometry.Point(e.object.lonlat.lon, e.object.lonlat.lat), getScaledRadius(e.object.attack_range_radius), 30);
            var feature = new OpenLayers.Feature.Vector(circle, null, style);
            attackRangeLayer.addFeatures(feature);
            e.object.attack_range_feature = feature;
        } else {
            dayRangeLayer.removeFeatures(e.object.day_vision_feature);
            nightRangeLayer.removeFeatures(e.object.night_vision_feature);
            trueSightRangeLayer.removeFeatures(e.object.true_sight_feature);
            attackRangeLayer.removeFeatures(e.object.attack_range_feature);
        }
        e.object.showinfo = !e.object.showinfo;
    };

    function addMarker(markers, ll, popupClass, popupContentHTML, closeBox, overflow) {
        var feature = new OpenLayers.Feature(markers, ll);
        feature.closeBox = closeBox;
        feature.popupClass = popupClass;
        feature.data.popupContentHTML = popupContentHTML;
        feature.data.overflow = (overflow) ? "auto" : "hidden";
        var marker = feature.createMarker();
        var markerClick = function(evt) {
            if (this.popup == null) {
                this.popup = this.createPopup(this.closeBox);
                map.addPopup(this.popup);
                this.popup.show();
            } else {
                this.popup.toggle();
            }
            currentPopup = this.popup;
            OpenLayers.Event.stop(evt);
        };
        if (markers.name == 'Towers') {
            marker.events.register("mouseover", feature, markerClick);
            marker.events.register("mouseout", feature, markerClick);
        }
        markers.addMarker(marker);
        return marker;
    }
    $.getJSON("/dota2/apps/interactivemap2/data.json", function(data) {
        console.log(data);
        var markers = {}
        for (var k in data) {
            if (k != 'trigger_multiple' && k != 'ent_dota_tree') {
                markers[k] = new OpenLayers.Layer.Markers(layerNames[k]);
                map.addLayer(markers[k]);
                markers[k].setVisibility(false);
                for (var i = 0; i < data[k].length; i++) {
                    e = data[k][i];
                    var popupClass = OpenLayers.Popup.FramedCloud;
                    var popupContentHTML = 'Click to toggle range overlay';
                    var marker = addMarker(markers[k], new OpenLayers.LonLat(e[0], 5120 - e[1]), popupClass, popupContentHTML, false);
                    marker.day_vision_radius = 1800;
                    marker.night_vision_radius = 800;
                    marker.true_sight_radius = 900;
                    marker.attack_range_radius = 700;
                    marker.showInfo = false;
                    if (k == 'npc_dota_tower') {
                        marker.events.register("mousedown", markers[k], markerClick);
                    }
                    //markers[k].addMarker(marker);
                }
            }
            if (k == 'ent_dota_tree') {
                markers[k] = new OpenLayers.Layer.Markers(layerNames[k]);
                map.addLayer(markers[k]);
                markers[k].setVisibility(false);
                markers[k].data = data[k]
            }
            if (k == 'trigger_multiple') {
                markers['npc_dota_neutral_spawner_box'] = new OpenLayers.Layer.Vector(layerNames[k]);
                map.addLayer(markers['npc_dota_neutral_spawner_box']);
                markers['npc_dota_neutral_spawner_box'].setVisibility(false);
                for (var i = 0; i < data[k].length; i++) {
                    e = data[k][i];
                    var style = {
                        strokeColor: "#00FF00",
                        strokeOpacity: 1,
                        strokeWidth: 1,
                        fillColor: "#00FF00",
                        fillOpacity: 0.4
                    };
                    var pnt = [];
                    for (var j = 0; j < e.length; j++) {
                        pnt.push(new OpenLayers.Geometry.Point(e[j][0], 5120 - e[j][1]));
                    }
                    var ln = new OpenLayers.Geometry.LinearRing(pnt);
                    var pf = new OpenLayers.Feature.Vector(ln, null, style);
                    markers['npc_dota_neutral_spawner_box'].addFeatures([pf]);
                }
            }
        }
        var vecLyr = map.getLayersByName('Placed Wards')[0];
        map.raiseLayer(vecLyr, map.layers.length);
        console.log(map.layers);
        map.events.register('changelayer', null, function(evt) {
            if (evt.property === "visibility" && evt.layer.name == layerNames['ent_dota_tree'] && !evt.layer.loaded) {
                for (var i = 0; i < evt.layer.data.length; i++) {
                    e = evt.layer.data[i];
                    var popupClass = OpenLayers.Popup.FramedCloud;
                    var popupContentHTML = 'Tower';
                    var marker = addMarker(evt.layer, new OpenLayers.LonLat(e[0], 5120 - e[1]), popupClass, popupContentHTML, false);
                    //marker.day_vision_radius = 1800;
                    //marker.night_vision_radius = 800;
                    //marker.true_sight_radius = 900;
                    //marker.attack_range_radius = 700;
                    //marker.showInfo = false;
                    //marker.events.register("mousedown", evt.layer, markerClick);
                }
                evt.layer.loaded = !evt.layer.loaded;
            }
        });
    });
    var getScaledRadius = function(r) {
        return r / (map_x_boundaries[1] - map_x_boundaries[0]) * map_w;
    }

    function get_my_url(bounds) {
        var res = this.map.getResolution();
        var x = Math.round((bounds.left - this.maxExtent.left) / (res * this.tileSize.w));
        var y = Math.round((this.maxExtent.top - bounds.top) / (res * this.tileSize.h));
        var z = map.getZoom();
        var path = z + "/tile_" + x + "_" + y + "." + this.type;
        var url = this.url;
        if (url instanceof Array) {
            url = this.selectUrl(path, url);
        }
        return url + path;
    }
});
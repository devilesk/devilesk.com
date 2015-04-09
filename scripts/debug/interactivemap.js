var SENTRY_VISION_RADIUS = 850,
    OBSERVER_VISION_RADIUS = 1600,
    TOWER_DAY_VISION_RADIUS = 1800,
    TOWER_NIGHT_VISION_RADIUS = 800,
    TOWER_TRUE_SIGHT_RADIUS = 900,
    TOWER_ATTACK_RANGE_RADIUS = 700,
    map_data_path = "/dota2/apps/interactivemap2/data.json",
    map_tile_path = "/dota2/apps/interactivemap2/tiles/",
    //map_tile_path = ["http://map1.devilesk.com/dota2/apps/interactivemap2/tiles/", "http://map2.devilesk.com/dota2/apps/interactivemap2/tiles/"],
    marker_icon_path = "http://www.openlayers.org/dev/img/marker.png",
    ward_icon_path = "ward_observer.png",
    sentry_icon_path = "ward_sentry.png",
    map_w = 5120,
    map_h = 5120,
    map_x_boundaries = [-8200, 8200],
    map_y_boundaries = [7558, -8842],
    map = new OpenLayers.Map("map", {
        maxExtent: new OpenLayers.Bounds(0, 0, 5120, 5120),
        numZoomLevels: 3,
        maxResolution: 4,
        units: "m",
        projection: "EPSG:900913",
        displayProjection: new OpenLayers.Projection("EPSG:900913")
    }),
    layerNames = {
        npc_dota_roshan_spawner: "Roshan",
        dota_item_rune_spawner: "Runes",
        ent_dota_tree: "Trees",
        npc_dota_fort: "Ancients",
        ent_dota_shop: "Shops",
        npc_dota_tower: "Towers",
        npc_dota_barracks: "Barracks",
        npc_dota_building: "Buildings",
        trigger_multiple: "Neutral Camps Spawn Boxes",
        npc_dota_neutral_spawner: "Neutral Camps"
    },
    wms = new OpenLayers.Layer.TMS("Dota 2 Map", map_tile_path, {
        type: "png",
        getURL: getMyURL
    }),
    ls = new OpenLayers.Control.LayerSwitcher({
        ascending: false
    }),
    dayRangeLayer = new OpenLayers.Layer.Vector("Day Vision Range"),
    nightRangeLayer = new OpenLayers.Layer.Vector("Night Vision Range"),
    trueSightRangeLayer = new OpenLayers.Layer.Vector("True Sight Range"),
    attackRangeLayer = new OpenLayers.Layer.Vector("Attack Range"),
    polygonLayer = new OpenLayers.Layer.Vector("Drawn Circles"),
    wardVisionLayer = new OpenLayers.Layer.Vector("Ward Vision"),
    iconLayer = new OpenLayers.Layer.Markers("Placed Wards"),
    renderer = OpenLayers.Util.getParameters(window.location.href).renderer,
    drawControls,
    size = new OpenLayers.Size(21, 25),
    offset = new OpenLayers.Pixel(-(size.w / 2), -size.h),
    icon = new OpenLayers.Icon(marker_icon_path, size, offset),
    lastDistance,
    request = new XMLHttpRequest();

function markerClick(e) {
    var circle,
        feature,
        style;
    if (!e.object.showinfo) {
        circle = OpenLayers.Geometry.Polygon.createRegularPolygon(new OpenLayers.Geometry.Point(e.object.lonlat.lon, e.object.lonlat.lat), getScaledRadius(e.object.day_vision_radius), 30);
        feature = new OpenLayers.Feature.Vector(circle);
        dayRangeLayer.addFeatures(feature);
        e.object.day_vision_feature = feature;
        
        style = {
            strokeColor: "#007FFF",
            strokeOpacity: 1,
            strokeWidth: 1,
            fillColor: "#007FFF",
            fillOpacity: .4
        };
        circle = OpenLayers.Geometry.Polygon.createRegularPolygon(new OpenLayers.Geometry.Point(e.object.lonlat.lon, e.object.lonlat.lat), getScaledRadius(e.object.true_sight_radius), 30);
        feature = new OpenLayers.Feature.Vector(circle, null, style);
        trueSightRangeLayer.addFeatures(feature);
        e.object.true_sight_feature = feature;
        
        circle = OpenLayers.Geometry.Polygon.createRegularPolygon(new OpenLayers.Geometry.Point(e.object.lonlat.lon, e.object.lonlat.lat), getScaledRadius(e.object.night_vision_radius), 30);
        feature = new OpenLayers.Feature.Vector(circle);
        nightRangeLayer.addFeatures(feature);
        e.object.night_vision_feature = feature;
        
        style = {
            strokeColor: "#FF0000",
            strokeOpacity: 1,
            strokeWidth: 1,
            fillColor: "#FF0000",
            fillOpacity: .4
        };
        circle = OpenLayers.Geometry.Polygon.createRegularPolygon(new OpenLayers.Geometry.Point(e.object.lonlat.lon, e.object.lonlat.lat), getScaledRadius(e.object.attack_range_radius), 30);
        feature = new OpenLayers.Feature.Vector(circle, null, style);
        attackRangeLayer.addFeatures(feature);
        e.object.attack_range_feature = feature;
    }
    else {
        dayRangeLayer.removeFeatures(e.object.day_vision_feature);
        nightRangeLayer.removeFeatures(e.object.night_vision_feature);
        trueSightRangeLayer.removeFeatures(e.object.true_sight_feature);
        attackRangeLayer.removeFeatures(e.object.attack_range_feature);
    }
    e.object.showinfo = !e.object.showinfo;
};

function getMapCoordinates(x, y) {
    var x_r = lerp(map_x_boundaries[0], map_x_boundaries[1], x / map_w),
        y_r = lerp(map_y_boundaries[0], map_y_boundaries[1], y / map_h);
    return [x_r, y_r];
}

function lerp(minVal, maxVal, pos_r) {
    return pos_r * (maxVal - minVal) + minVal;
}

function createWardMarker(img, xy) {
    var size = new OpenLayers.Size(21, 25),
        offset = new OpenLayers.Pixel(-(size.w / 2), -size.h),
        icon = new OpenLayers.Icon(img, size, offset),
        latlon = map.getLonLatFromPixel(xy),
        marker = new OpenLayers.Marker(latlon, icon);
    return marker;
}

function handleObserverClick(event) {
    var marker = createWardMarker(ward_icon_path, event.xy);
        circle = OpenLayers.Geometry.Polygon.createRegularPolygon(new OpenLayers.Geometry.Point(marker.lonlat.lon, marker.lonlat.lat), getScaledRadius(OBSERVER_VISION_RADIUS), 40),
        feature = new OpenLayers.Feature.Vector(circle);
    iconLayer.addMarker(marker);
    wardVisionLayer.addFeatures(feature);
    marker.radius_feature = feature;
    marker.events.register("mousedown", this, wardMarkerRemove);
}

function handleSentryClick(event) {
    var marker = createWardMarker(sentry_icon_path, event.xy),
        style = {
            strokeColor: "#007FFF",
            strokeOpacity: 1,
            strokeWidth: 1,
            fillColor: "#007FFF",
            fillOpacity: .4
        },
        circle = OpenLayers.Geometry.Polygon.createRegularPolygon(new OpenLayers.Geometry.Point(marker.lonlat.lon, marker.lonlat.lat), getScaledRadius(SENTRY_VISION_RADIUS), 30),
        feature = new OpenLayers.Feature.Vector(circle, null, style);
    iconLayer.addMarker(marker);
    wardVisionLayer.addFeatures(feature);
    marker.radius_feature = feature;
    marker.events.register("mousedown", this, wardMarkerRemove);
}

function wardMarkerRemove(evt) {
    wardVisionLayer.removeFeatures(evt.object.radius_feature);
    iconLayer.removeMarker(evt.object);
    OpenLayers.Event.stop(evt);
}

function handleOnClick(event) {
    console.log('handleOnClick');
}

function calculateDistance(order, units, measure) {
    if (order == 1) {
        if (units == "km") {
            return measure * 3214.07509338;
        }
        else {
            return measure * 3.21407509338;
        }
    }
    else {
        return measure * 3.21407509338;
    }
}

function handleMeasurements(event) {
    var out = "";
    if (event.order == 1) {
        out += "Distance: " + calculateDistance(event.order, event.units, event.measure).toFixed(0) + " units";
    }
    else {
        out += "Distance: " + calculateDistance(event.order, event.units, event.measure).toFixed(0) + " units<sup>2</" + "sup>";
    }
    document.getElementById("output").innerHTML = out;
    
    lastDistance = calculateDistance(event.order, event.units, event.measure);
    document.getElementById("traveltime").innerHTML = (lastDistance / document.getElementById("movespeed").value).toFixed(2);
    
    document.getElementById("traveltime-container").style.display = '';
}

function handleCircleMeasurements(event) {
    var element = document.getElementById("output"),
        out = "";
    if (event.order == 1) {
        out += "Radius: " + calculateDistance(event.order, event.units, event.measure).toFixed(0) + " units";
    }
    else {
        out += "Distance: " + calculateDistance(event.order, event.units, event.measure).toFixed(0) + " units<sup>2</" + "sup>";
    }
    element.innerHTML = out;
}

function handleCircleMeasurementsPartial(event) {
    drawControls["select"].deactivate();
    var element = document.getElementById("output"),
        out = "",
        circle,
        feature,
        self = this;
    if (event.order == 1) {
        if (event.measure > 0) {
            if (event.units == "km") {
                circle = OpenLayers.Geometry.Polygon.createRegularPolygon(new OpenLayers.Geometry.Point(event.geometry.components[0].x, event.geometry.components[0].y), event.measure * 1e3, 30);
            }
            else {
                circle = OpenLayers.Geometry.Polygon.createRegularPolygon(new OpenLayers.Geometry.Point(event.geometry.components[0].x, event.geometry.components[0].y), event.measure, 30);
            }
            feature = new OpenLayers.Feature.Vector(circle);
            polygonLayer.removeFeatures(event.geometry.circle_features);
            if ("circle_features" in event.geometry) {
                event.geometry.circle_features.length = 0;
                event.geometry.circle_features.push(feature);
            }
            else {
                event.geometry.circle_features = [feature];
            }
            feature.measure_control = this;
            feature.is_measuring = true;
            polygonLayer.addFeatures(feature);
            if (event.geometry.components.length > 2) {
                setTimeout(function () {
                    feature.is_measuring = false;
                    drawControls["select"].activate();
                    self.cancel();
                }, 0);
            }
        }
        out += "Radius: " + calculateDistance(event.order, event.units, event.measure).toFixed(0) + " units";
    }
    else {
        out += "Distance: " + calculateDistance(event.order, event.units, event.measure).toFixed(0) + " units<sup>2</" + "sup>";
    }
    element.innerHTML = out;
}

function toggleControl() {
    var control;
    for (var key in drawControls) {
        control = drawControls[key];
        if (this.value == key && this.checked) {
            control.activate();
        }
        else {
            control.deactivate();
        }
        if ((this.value == "polygonControl" || this.value == "circle") && this.checked) {
            drawControls["select"].activate();
        }
        else {
            drawControls["select"].deactivate();
        }
    }
    document.getElementById("output").innerHTML = "";
    
    document.getElementById("traveltime-container").style.display = 'none';
};

function addMarker(markers, ll, popupClass, popupContentHTML, closeBox, overflow) {
    var feature = new OpenLayers.Feature(markers, ll),
        marker;
    feature.closeBox = closeBox;
    feature.popupClass = popupClass;
    feature.data.popupContentHTML = popupContentHTML;
    feature.data.overflow = overflow ? "auto" : "hidden";
    marker = feature.createMarker();
    
    function markerClick(evt) {
        if (this.popup == null) {
            this.popup = this.createPopup(this.closeBox);
            map.addPopup(this.popup);
            this.popup.show();
        }
        else {
            this.popup.toggle();
        }
        currentPopup = this.popup;
        OpenLayers.Event.stop(evt);
    };
    
    if (markers.name == "Towers") {
        marker.events.register("mouseover", feature, markerClick);
        marker.events.register("mouseout", feature, markerClick);
    }
    markers.addMarker(marker);
    return marker;
}

function getScaledRadius(r) {
    return r / (map_x_boundaries[1] - map_x_boundaries[0]) * map_w
};

function getMyURL(bounds) {
    var res = this.map.getResolution(),
        x = Math.round((bounds.left - this.maxExtent.left) / (res * this.tileSize.w)),
        y = Math.round((this.maxExtent.top - bounds.top) / (res * this.tileSize.h)),
        z = map.getZoom(),
        path = z + "/tile_" + x + "_" + y + "." + this.type,
        url = this.url;
    if (url instanceof Array) {
        url = this.selectUrl(path, url)
    }
    return url + path
}

function onDataLoad(data) {
    var markers = {},
        marker,
        vecLyr = map.getLayersByName("Placed Wards")[0],
        style = {
            strokeColor: "#00FF00",
            strokeOpacity: 1,
            strokeWidth: 1,
            fillColor: "#00FF00",
            fillOpacity: .4
        },
        pnt = [], ln, pf;
    for (var k in data) {
        if (k != "trigger_multiple" && k != "ent_dota_tree") {
            markers[k] = new OpenLayers.Layer.Markers(layerNames[k]);
            map.addLayer(markers[k]);
            markers[k].setVisibility(false);
            for (var i = 0; i < data[k].length; i++) {
                marker = addMarker(markers[k], new OpenLayers.LonLat(data[k][i][0], 5120 - data[k][i][1]), OpenLayers.Popup.FramedCloud, "Click to toggle range overlay", false);
                marker.day_vision_radius = TOWER_DAY_VISION_RADIUS;
                marker.night_vision_radius = TOWER_NIGHT_VISION_RADIUS;
                marker.true_sight_radius = TOWER_TRUE_SIGHT_RADIUS;
                marker.attack_range_radius = TOWER_ATTACK_RANGE_RADIUS;
                marker.showInfo = false;
                if (k == "npc_dota_tower") {
                    marker.events.register("mousedown", markers[k], markerClick);
                }
            }
        }
        else if (k == "ent_dota_tree") {
            markers[k] = new OpenLayers.Layer.Markers(layerNames[k]);
            map.addLayer(markers[k]);
            markers[k].setVisibility(false);
            markers[k].data = data[k];
        }
        else if (k == "trigger_multiple") {
            markers["npc_dota_neutral_spawner_box"] = new OpenLayers.Layer.Vector(layerNames[k]);
            map.addLayer(markers["npc_dota_neutral_spawner_box"]);
            markers["npc_dota_neutral_spawner_box"].setVisibility(false);
            for (var i = 0; i < data[k].length; i++) {
                pnt = [];
                for (var j = 0; j < data[k][i].length; j++) {
                    pnt.push(new OpenLayers.Geometry.Point(data[k][i][j][0], 5120 - data[k][i][j][1]));
                }
                ln = new OpenLayers.Geometry.LinearRing(pnt);
                pf = new OpenLayers.Feature.Vector(ln, null, style);
                markers["npc_dota_neutral_spawner_box"].addFeatures([pf]);
            }
        }
    }
    
    map.raiseLayer(vecLyr, map.layers.length);
    map.events.register("changelayer", null, function (evt) {
        if (evt.property === "visibility" && evt.layer.name == layerNames["ent_dota_tree"] && !evt.layer.loaded) {
            for (var i = 0; i < evt.layer.data.length; i++) {
                marker = addMarker(evt.layer, new OpenLayers.LonLat(evt.layer.data[i][0], 5120 - evt.layer.data[i][1]), OpenLayers.Popup.FramedCloud, "Tower", false);
            }
            evt.layer.loaded = !evt.layer.loaded;
        }
    })
}

map.addLayer(wms);
map.zoomToMaxExtent();
map.addControl(ls);
map.addLayer(dayRangeLayer);
map.addLayer(nightRangeLayer);
map.addLayer(trueSightRangeLayer);
map.addLayer(attackRangeLayer);
map.addLayer(polygonLayer);
map.addLayer(wardVisionLayer);
map.addLayer(iconLayer);
ls.maximizeControl();

OpenLayers.Control.Click = OpenLayers.Class(OpenLayers.Control, {
    defaultHandlerOptions: {
        single: true,
        "double": false,
        pixelTolerance: 0,
        stopSingle: false,
        stopDouble: false
    },
    initialize: function (options) {
        this.handlerOptions = OpenLayers.Util.extend({}, this.defaultHandlerOptions);
        OpenLayers.Control.prototype.initialize.apply(this, arguments);
        this.handler = new OpenLayers.Handler.Click(this, {
            click: this.onClick,
            dblclick: this.onDblclick
        }, this.handlerOptions);
    },
    onClick: handleOnClick,
    onDblclick: function (evt) {
        var output = document.getElementById(this.key + "Output"),
            msg = "dblclick " + evt.xy;
        output.value = output.value + msg + "\n";
    }
});
renderer = renderer ? [renderer] : OpenLayers.Layer.Vector.prototype.renderers;
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
        persist: false,
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
            single: true
        }
    }),
    sentryclick: new OpenLayers.Control.Click({
        onClick: handleSentryClick,
        handlerOptions: {
            single: true
        }
    }),
    polygonControl: new OpenLayers.Control.DrawFeature(polygonLayer, OpenLayers.Handler.RegularPolygon, {
        handlerOptions: {
            sides: 30
        }
    }),
    select: new OpenLayers.Control.SelectFeature(polygonLayer, {
        hover: true,
        highlightOnly: false,
        callbacks: {
            click: function (feature) {
                var element = document.getElementById("output");
                if (feature.measure_control && feature.is_measuring) {
                    feature.measure_control.cancel();
                    feature.is_measuring = false;
                    this.highlight(feature);
                }
                else {
                    element.innerHTML = "";
                    polygonLayer.removeFeatures(feature);
                }
            }
        },
        overFeature: function (feature) {
            var element = document.getElementById("output"),
                out = "Radius: " + (.565352 * Math.sqrt(feature.geometry.getArea()) * 3.21407509338).toFixed(0) + " units";
            element.innerHTML = out;
            this.highlight(feature);
        },
        outFeature: function (feature) {
            var element = document.getElementById("output");
            element.innerHTML = "";
            this.unhighlight(feature)
        }
    })
};
for (var key in drawControls) {
    if (key == "line") {
        drawControls[key].events.on({
            measure: handleMeasurements,
            measurepartial: handleMeasurements
        })
    }
    if (key == "circle") {
        drawControls[key].events.on({
            measure: handleCircleMeasurements,
            measurepartial: handleCircleMeasurementsPartial
        })
    }
    map.addControl(drawControls[key]);
}
map.events.register("mousemove", map, function (e) {
    var position = this.events.getMousePosition(e),
        lonlat = map.getLonLatFromPixel(e.xy),
        xy = getMapCoordinates(lonlat.lon, 5120 - lonlat.lat);
    position.x = xy[0].toFixed(0);
    position.y = xy[1].toFixed(0);
    OpenLayers.Util.getElement("coords").innerHTML = position;
});

document.getElementById("controls-max").addEventListener("click", function (e){
    document.getElementById("controls-list").style.display = '';
    document.getElementById("output-panel").style.display = '';
    document.getElementById("controls-min").style.display = 'block';
    this.style.display = 'none';
}, false);
document.getElementById("controls-min").addEventListener("click", function (e){
    document.getElementById("controls-list").style.display = 'none';
    document.getElementById("output-panel").style.display = 'none';
    document.getElementById("controls-max").style.display = 'block';
    this.style.display = 'none';
}, false);
document.getElementById("coordControl").addEventListener("change", function (e){
    if (this.checked) {
        document.getElementById("coords").style.display = 'block';
    }
    else {
        document.getElementById("coords").style.display = 'none';
    }
}, false);
document.getElementById("movespeed").addEventListener("change", function (e){
    document.getElementById("traveltime").innerHTML = (lastDistance / document.getElementById("movespeed").value).toFixed(2);
}, false);
document.getElementById('noneToggle').addEventListener('click', toggleControl, false);
document.getElementById('lineToggle').addEventListener('click', toggleControl, false);
document.getElementById('circleToggle').addEventListener('click', toggleControl, false);
document.getElementById('observerToggle').addEventListener('click', toggleControl, false);
document.getElementById('sentryToggle').addEventListener('click', toggleControl, false);

request.open('GET', map_data_path, true);

request.onload = function () {
    if (request.status >= 200 && request.status < 400) {
        var data = JSON.parse(request.responseText);
        onDataLoad(data);
    }
    else {
        alert('Error loading page.');
    }
};

request.onerror = function () {
    alert('Error loading page.');
};

request.send();


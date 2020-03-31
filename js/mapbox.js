
const layerData = {};

const layerColor = {
    nearby: '#664422',
};

const paths = {
    stop: '',
}

const getBearingBetweenPoints = (start, end) => {
    if (start && end && Array.isArray(start) && Array.isArray(end)) {
        start0 = parseFloat(parseFloat(start[0]).toFixed(6));
        start1 = parseFloat(parseFloat(start[1]).toFixed(6));
        var end0 = parseFloat(parseFloat(end[0]).toFixed(6));
        var end1 = parseFloat(parseFloat(end[1]).toFixed(6));
        if (start0 != end0 || start1 != end1) {
            var simpleAngle = Math.acos(Math.abs(start0 - end0) / Math.abs(start1 - end1)) * (180 / Math.PI);
            if (!isNaN(simpleAngle)) {
                return simpleAngle;
            }
            var TWOPI = 6.2831853071795865;
            var RAD2DEG = 57.2957795130823209;
            // if (a1 = b1 and a2 = b2) throw an error
            var theta = Math.atan2(end0 - start0, start1 - end1);
            if (theta < 0.0) {
                theta += TWOPI;
            }
            return RAD2DEG * theta;
        }
    }
    return undefined;
};

const removeLayerElement = (id, layerName) => {
    delete map.getSource(layerName)._data.features.array.filter(f => f.id == id);
}

const resetMap = () => {
    Object.keys(mapLayerData.Point).forEach(k => {
        if (map.getLayer(k)) {
            map.removeLayer(k);
        }
        if (map.getSource(k)) {
            map.getSource(k).setData(undefined);
            map.removeSource(k);
        }
    });
    delete mapLayerData.Point;
    mapLayerData.Point = {};
    Object.keys(mapLayerData.LineString).forEach(k => {
        if (map.getLayer(k)) {
            map.removeLayer(k);
        }
        if (map.getSource(k)) {
            map.getSource(k).setData(undefined);
            map.removeSource(k);
        }
    });
    delete mapLayerData.LineString;
    mapLayerData.LineString = {};
};

const initMapBox = () => {
    mapboxgl.accessToken = 'pk.eyJ1IjoidGhsYWVnbGVyIiwiYSI6ImNqdHE2MjJxYzBjMmM0ZG0yOG05MWRtamwifQ.lqlEy_y5MpGM-T1PltBP-A';
    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/light-v10',
        // style: 'mapbox://styles/mapbox/streets-v11',
        // style: 'mapbox://styles/mapbox/satellite-v9',
        zoom: 0.5,
        center: {
            lat: $('#map').data('latitude') || 45.0,
            lng: $('#map').data('longitude') || 10.0
        },
        // pitch : 45,
        // bearing : -17.6,
        antialias: true
    });

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            currPosition = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            map.setCenter(currPosition);
            // setCenter(currPosition);
        });
    }
    // setCenter(map.getCenter());

    map.addControl(new mapboxgl.NavigationControl());
    map.addControl(new mapboxgl.GeolocateControl({
        positionOptions: {
            enableHighAccuracy: true
        },
        trackUserLocation: true
    }));

    Object.keys(paths).forEach(k => {
        map.loadImage(filePathPrefix + 'images/mapicon/icon_' + k + '.png', (error, image) => {
            if (error) throw error;
            map.addImage('icon_' + k, image);
        });
    });

    map.on('click', function (e) {
        // Use featuresAt to get features within a given radius of the click event
        // Use layer option to avoid getting results from other layers
        var bbox = [
            [e.point.x - 5, e.point.y - 5],
            [e.point.x + 5, e.point.y + 5]
        ];
        map.queryRenderedFeatures(bbox);
        var features = map.queryRenderedFeatures(bbox);
        var html = '';
        if (features && features.length > 0) {
            var clickedFeature = features[0];
            if (clickedFeature && clickedFeature.properties && clickedFeature.properties.label) {
                var html = '<div class="map-popup"><ul class="list-group list-group-sm">';
                Object.keys(clickedFeature.properties).forEach(key => {
                    if (key == 'image_url') {
                        var srcUrl = clickedFeature.properties[key];
                        html += '<li class="list-group-item"><img src="' + srcUrl + '" ></li>';
                    } else {
                        html += '<li class="list-group-item py-1">' + key + ': ' + clickedFeature.properties[key] + '</li>';
                    }
                });
                html += '</ul></div>';
            }
        }

        if (html != '') {
            var tooltip = new mapboxgl.Popup()
                .setLngLat(e.lngLat)
                .setHTML(html)
                .addTo(map);
            // map.flyTo({ center: clickedFeature.geometry.coordinates });
        }
    });

}
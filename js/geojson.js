const mapLayerData = {
    Point: {},
    LineString: {},
    Polygon: {},
    Circle: {},
};

const updateGeoJson = (entity) => {
    if (entity && entity.geojson) {
        var featureWrapper = entity.geojson;

        if (entity.trip && entity.trip.shape) {
            var lineStringId = entity.provider_id + ':' + entity.trip_id + '-line-string';
            var idProps = { id: lineStringId };
            featureWrapper.features.push({
                id: lineStringId,
                type: 'Feature',
                geometry: polyline.toGeoJSON(entity.trip.shape.encoded_polyline),
                properties: { ...featureWrapper.features[0].properties, ...idProps },
            });
        }

        if (featureWrapper.type == 'FeatureCollection') {
            if (featureWrapper.features && Array.isArray(featureWrapper.features)) {
                featureWrapper.features.forEach(feature => updateGeoJsonFeature(feature));
            }
        } else if (featureWrapper.type == 'Feature') {
            updateGeoJsonFeature(featureWrapper);
        } else {
            console.error('Unknown GeoJson ', featureWrapper);
        }
    }
};

const updateGeoJsonFeature = (feature) => {
    if (feature.geometry.type == 'Point') {
        updateGeoJsonPoint(feature);
    } else if (feature.geometry.type == 'LineString') {
        updateGeoJsonLineString(feature);
    } else if (feature.geometry.type == 'Polygon') {
        updateGeoJsonPolygon(feature);
    } else {
        console.error('Unknown GeoJson Feature ', feature);
    }
};

const updateGeoJsonPoint = (feature) => {
    if (feature.properties.type == 'VehiclePosition') {
        feature.properties.id = 'VehiclePosition_' + feature.properties.transport_booking_id;
        feature.id = feature.properties.id;
    }
    var layerId = feature.properties.id;
    if (!mapLayerData.Point[layerId]) {
        mapLayerData.Point[layerId] = {
            type: 'FeatureCollection',
            features: [],
        }
    }
    var existing = false;
    var j = 0;
    for (j in mapLayerData.Point[layerId].features) {
        if (mapLayerData.Point[layerId].features[j].id == feature.id) {
            var previousPosition = mapLayerData.Point[layerId].features[j].geometry.coordinates;
            var previousBearing = mapLayerData.Point[layerId].features[j].properties.rotation;
            if (previousPosition[0] == feature.geometry.coordinates[0] && previousPosition[1] == feature.geometry.coordinates[1]) {
                return;
            }
            if (!feature.properties.rotation || feature.properties.rotation == 0 || feature.properties.rotation == 0.0) {
                if (previousPosition) {
                    var newBearing = getBearingBetweenPoints(previousPosition, feature.geometry.coordinates);
                    if (newBearing) {
                        feature.properties.rotation = newBearing;
                    } else {
                        feature.properties.rotation = previousBearing;
                    }
                }
            }
            updateGeoJsonLineString(feature);
            mapLayerData.Point[layerId].features[j] = feature;
            existing = true;
        }
    }
    if (!existing) {
        mapLayerData.Point[layerId].features.push(feature);
    }

    if (!map.getLayer(layerId)) {
        map.addLayer({
            id: layerId,
            type: 'symbol',
            source: {
                type: 'geojson',
                data: mapLayerData.Point[layerId],
            },
            layout: {
                'icon-image': 'icon_{icon}',
                // 'icon-image': 'bus',
                // 'icon-image': './images/{icon}.svg',
                // 'icon-image': {
                //     type: 'identity',
                //     property: 'icon',
                // },
                'icon-size': 0.6,
                'icon-rotate': {
                    type: 'identity',
                    property: 'rotation',
                },
                'icon-rotation-alignment': 'map',
                'icon-allow-overlap': true,
                'icon-ignore-placement': true,
                'text-ignore-placement': true,
                // 'text-field': '{title}',
                'text-font': ['Open Sans Semibold',
                    'Arial Unicode MS Bold',
                ],
                'text-anchor': 'top',
            },
            paint: {
                'icon-color': {
                    type: 'identity',
                    property: 'color',
                },
                'icon-halo-color': {
                    type: 'identity',
                    property: 'color',
                },
                'icon-halo-width': 2.0,
                'icon-opacity': 0.8,
            }
        });
    } else {
        map.getSource(layerId).setData(mapLayerData.Point[layerId]);
        // map.getSource(layerId)._data.features.push(geojson);
    }
};
const updateGeoJsonLineString = (feature) => {
    var layerId = feature.properties.id;
    if (!mapLayerData.LineString[layerId]) {
        mapLayerData.LineString[layerId] = {
            type: 'FeatureCollection',
            features: [],
        }
    }
    var existing = false;
    var j = 0;
    for (j in mapLayerData.LineString[layerId].features) {
        if (mapLayerData.LineString[layerId].features[j].id == feature.id) {
            mapLayerData.LineString[layerId].features[j].geometry.coordinates.push(feature.geometry.coordinates);
            existing = true;
        }
    }
    if (!existing) {
        if (feature.geometry.type == 'LineString') {
            mapLayerData.LineString[layerId].features.push(feature);
        } else {
            mapLayerData.LineString[layerId].features.push({
                id: feature.id,
                type: 'Feature',
                geometry: {
                    id: feature.geometry.id,
                    type: 'LineString',
                    coordinates: [
                        feature.geometry.coordinates
                    ]
                },
                properties: feature.properties,
            });
        }
    }

    if (!map.getLayer(layerId)) {
        map.addLayer({
            id: layerId,
            type: 'line',
            source: {
                type: 'geojson',
                data: mapLayerData.LineString[layerId],
            },
            paint: {
                'line-width': 5,
                'line-color': {
                    type: 'identity',
                    property: 'color',
                },
                'line-opacity': 0.8,
            },
        });
    } else {
        map.getSource(layerId).setData(mapLayerData.LineString[layerId]);
        // map.getSource(layerId)._data.features.push(geojson);
    }
};
const updateGeoJsonPolygon = (feature) => {
    // exclude air and intercity 
    if (feature.properties.transport_mode != 'AIRPLANE' && feature.properties.provider_id != 'nz_intercity') {
        var layerId = feature.properties.id;
        if (!mapLayerData.Polygon[layerId]) {
            mapLayerData.Polygon[layerId] = {
                type: 'FeatureCollection',
                features: [],
            }
        }
        var existing = false;
        var j = 0;
        for (j in mapLayerData.Polygon[layerId].features) {
            if (mapLayerData.Polygon[layerId].features[j].id == feature.id) {
                mapLayerData.Polygon[layerId].features[j] = feature;
                existing = true;
            }
        }
        if (!existing) {
            mapLayerData.Polygon[layerId].features.push(feature);
        }

        if (!map.getLayer(layerId)) {
            map.addLayer({
                id: layerId,
                type: 'fill',
                source: {
                    type: 'geojson',
                    data: mapLayerData.Polygon[layerId],
                },
                paint: {
                    'fill-color': {
                        type: 'identity',
                        property: 'color',
                    },
                    'fill-opacity': 0.5,
                    'fill-outline-color': '#000000',
                    // 'line-color': '#333333',
                    // 'line-width': 2
                },
            });
        } else {
            map.getSource(layerId).setData(mapLayerData.Polygon[layerId]);
        }
    }
};

const toggleLayer = (layerId) => {
    var visibility = map.getLayoutProperty(layerId, 'visibility');

    Object.keys(mapLayerData.Circle).forEach(key => {
        if (key != layerId && key != layerId + '-label') {
            map.setLayoutProperty(key, 'visibility', 'none');
            map.setLayoutProperty(key + '-label', 'visibility', 'none');
        }
    });
    if (visibility === 'visible') {
        map.setLayoutProperty(layerId, 'visibility', 'none');
        map.setLayoutProperty(layerId + '-label', 'visibility', 'none');
    } else {
        map.setLayoutProperty(layerId, 'visibility', 'visible');
        map.setLayoutProperty(layerId + '-label', 'visibility', 'visible');
    }
}


const updateGeoJsonCircle = async (featureCollectionOrFeature, layerId = undefined) => {
    // Feature collection
    var featureCollection;
    var newOrUpdatedFeatures = [];
    if (featureCollectionOrFeature && featureCollectionOrFeature.features && featureCollectionOrFeature.features.length > 0) {
        newOrUpdatedFeatures = newOrUpdatedFeatures.concat(featureCollectionOrFeature.features);
        layerId = featureCollectionOrFeature.id;
        featureCollection = featureCollectionOrFeature;
    } else if (featureCollectionOrFeature && featureCollectionOrFeature.type == 'Feature') {
        newOrUpdatedFeatures.push(featureCollectionOrFeature);
        if (!layerId) {
            layerId = 'countries';
        }
    } else {
        return;
    }

    if (!mapLayerData.Circle[layerId]) {
        mapLayerData.Circle[layerId] = {
            id: layerId,
            type: 'FeatureCollection',
            features: newOrUpdatedFeatures,
        }
    } else {
        mapLayerData.Circle[layerId].features = mapLayerData.Circle[layerId].features.concat(newOrUpdatedFeatures);
    }

    if (map.getSource(layerId)) {
        map.getSource(layerId).setData(mapLayerData.Circle[layerId]);
    } else {
        map.addSource(layerId, {
            type: 'geojson',
            data: mapLayerData.Circle[layerId],
        });
    }

    if (!map.getLayer(layerId)) {
        map.addLayer({
            id: layerId,
            type: 'circle',
            source: layerId,
            layout: {
                visibility: 'visible',
            },
            // source: {
            //     type: 'geojson',
            //     data: mapLayerData.Circle[layerId],
            // },
            paint: {
                'circle-radius': {
                    type: 'identity',
                    property: 'radius',
                },
                'circle-color': {
                    type: 'identity',
                    property: 'color',
                },
                'circle-blur': 0.2,
            },
        });
    }
    if (!map.getLayer(layerId + '-label')) {
        map.addLayer({
            id: layerId + '-label',
            type: 'symbol',
            source: layerId,
            // source: {
            //     type: 'geojson',
            //     data: mapLayerData.Circle[layerId],
            // },
            layout: {
                visibility: 'visible',
                'text-field': {
                    type: 'identity',
                    property: 'label',
                },
                'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                'text-size': 12,
            },
        });
    }
};
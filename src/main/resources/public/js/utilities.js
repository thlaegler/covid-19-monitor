
const getParameterByName = (name, url) => {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
};

const zoomToRadius = (zoom) => {
    return (559959.436 * Math.pow(1 / 2, zoom)) * 50;
}

const radiusToZoom = (radius) => {
    return Math.sqrt(1 / ((radius / 20) / 559959.436)) / 6;
}

const utcTimestamp = () => {
    return Math.round((new Date()).getTime() / 1000);
}

const timeDifference = (time) => {
    var actual = moment(time, 'HH:mm:ss');
    var now = moment();
    var diffMinutes = actual.diff(now, 'minutes', false);
    var diffSeconds = Math.abs(actual.diff(now, 'seconds', false) % 60);
    var diff;
    // if (diffMinutes < 10 && diffMinutes > -10) {
    //     diff = '0' + (diffMinutes + ' minutes');
    // } else {
    //     diff = (diffMinutes + ':' + ((diffSeconds < 10 && diffSeconds > -10) ? ('0' + diffSeconds) : diffSeconds));
    // }
    diff = ((diffMinutes > 0 && diffSeconds > 0) ? '+' : '') + diffMinutes + ':' + ((diffSeconds < 10 && diffSeconds > -10) ? ('0' + diffSeconds) : diffSeconds);
    return diff;
    // var date1 = Date.parse(time1);
    // // var date2 = Date.parse(time2);
    // if (date2 < date1) {
    //     date2.setDate(date2.getDate() + 1);
    // }

    // var diff = date2 - date1;
    // var msec = diff;
    // var hh = Math.floor(msec / 1000 / 60 / 60);
    // msec -= hh * 1000 * 60 * 60;
    // var mm = Math.floor(msec / 1000 / 60);
    // msec -= mm * 1000 * 60;
    // var ss = Math.floor(msec / 1000);
    // msec -= ss * 1000;
    // // diff = 28800000 => hh = 8, mm = 0, ss = 0, msec = 0
    // return mm;
}

const setCenter = (center) => {

    // console.log('Map recentered: ', center);
    if (!map.getCenter() == center) {
        map.setCenter(center);
    }
    // if (!settings.mapLockDirections) {
    //     getNearBy(center.lat, center.lng);
    // }
};

const cacheCurrentLocation = (p) => {
    currentLocation = {
        lat: p.coords.latitude,
        lng: p.coords.longitude,
    };
};

function splitLocation(val) {
    return val.split(/,\s*/);
}

function extractLastTerm(term) {
    return splitLocation(term).pop();
}

const otpTimeFormat = (input) => {
    var timeNow = new Date().toLocaleString().substr(12, 5);
    if (timeNow.startsWith('0')) {
        timeNow = timeNow.replace('0', '');
    }
    var hour = timeNow.split(':')[0];
    if (hour > 12) {
        timeNow = timeNow.replace(hour, hour - 12);
    } else {
        timeNow = timeNow + 'am';
    }
    return timeNow;
}

const getPixelWidth = (duration, factor) => Math.round(duration * factor);

const getPixelsLeft = (startTime, minTime, factor) => Math.round(((startTime / 1000) - minTime) * factor);

const ProviderType = {
    ALL: 'ALL', //
    PUBLIC_TRANSPORT: 'PUBLIC_TRANSPORT', //
    TAXI: 'TAXI', //
    TRANSPORT: 'TRANSPORT', //
    DELIVERY: 'DELIVERY', //
    RESTAURANT: 'RESTAURANT', //
    MICRO_MOBILITY: 'MICRO_MOBILITY', //
    LOGISTICS: 'LOGISTICS', //
    DISPATCHER: 'DISPATCHER', //
    API_PROVIDER: 'API_PROVIDER', //
    API_CONSUMER: 'API_CONSUMER'
};

const TransportType = {
    UNDEFINED: 'UNDEFINED', //
    PASSENGER: 'PASSENGER', //
    FOOD_DELIVERY: 'FOOD_DELIVERY', //
    COOLED_FOOD: 'COOLED_FOOD', //
    HOT_FOOD: 'HOT_FOOD', //
    DELIVERY: 'DELIVERY', //
    CHARTER: 'CHARTER', //
    RIDESHARE: 'RIDESHARE', //
    PARCEL: 'PARCEL', //
    FREIGHT: 'FREIGHT', //
    BULK: 'BULK', //
    LIVING_ANIMAL: 'LIVING_ANIMAL', //
    PACKAGED_FREIGHT: 'PACKAGED_FREIGHT', //
    CONTAINER: 'CONTAINER'
}
const TransportMode = {
    UNDEFINED: 'UNDEFINED', //
    ALL: 'ALL', //
    WALK: 'WALK', //
    BICYCLE: 'BICYCLE', //
    CAR: 'CAR', //
    TRAM: 'TRAM', //
    SUBWAY: 'SUBWAY', //
    RAIL: 'RAIL', //
    BUS: 'BUS', //
    FERRY: 'FERRY', //
    CABLE_CAR: 'CABLE_CAR', //
    GONDOLA: 'GONDOLA', //
    FUNICULAR: 'FUNICULAR', //
    TRANSIT: 'TRANSIT', //
    LEG_SWITCH: 'LEG_SWITCH', //
    AIRPLANE: 'AIRPLANE', //
    TAXI: 'TAXI', //
    MICRO_MOBILITY: 'MICRO_MOBILITY', //
    E_SCOOTER: 'E_SCOOTER', //
    TRUCK: 'TRUCK', //
    SHIP: 'SHIP'
}
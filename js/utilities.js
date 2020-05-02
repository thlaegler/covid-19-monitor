const currentColorScale = [];
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

const groupBy = function (xs, key) {
    return xs.reduce(function (rv, x) {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
    }, {});
};

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
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

const rgbToHex = (rgb) => {
    var hex = Number(rgb).toString(16);
    if (hex.length < 2) {
        hex = "0" + hex;
    }
    return hex;
};

const fullColorHex = (rgbArray) => {
    var red = rgbToHex(rgbArray[0]);
    var green = rgbToHex(rgbArray[1]);
    var blue = rgbToHex(rgbArray[2]);
    return '#' + red + green + blue;
};

const interpolateColor = (color1, color2, factor = 0.5) => {
    var result = color1.slice();
    for (var i = 0; i < 3; i++) {
        result[i] = Math.round(result[i] + factor * (color2[i] - color1[i]));
    }
    return fullColorHex(result);
};

const interpolateColors = (color1, color2, steps) => {
    var stepFactor = 1 / (steps - 1),
        interpolatedColorArray = [];

    // color1 = color1.match(/\d+/g).map(Number);
    // color2 = color2.match(/\d+/g).map(Number);
    color1 = hexToRgb(color1);
    color2 = hexToRgb(color2);

    for (var i = 0; i < steps; i++) {
        interpolatedColorArray.push(interpolateColor(color1, color2, stepFactor * i));
    }

    return interpolatedColorArray;
}

const hexToRgb = (hex) => {
    if (hex.charAt(0) === '#') {
        hex = hex.substr(1);
    }
    if ((hex.length < 2) || (hex.length > 6)) {
        return false;
    }
    var values = hex.split(''),
        r,
        g,
        b;

    if (hex.length === 2) {
        r = parseInt(values[0].toString() + values[1].toString(), 16);
        g = r;
        b = r;
    } else if (hex.length === 3) {
        r = parseInt(values[0].toString() + values[0].toString(), 16);
        g = parseInt(values[1].toString() + values[1].toString(), 16);
        b = parseInt(values[2].toString() + values[2].toString(), 16);
    } else if (hex.length === 6) {
        r = parseInt(values[0].toString() + values[1].toString(), 16);
        g = parseInt(values[2].toString() + values[3].toString(), 16);
        b = parseInt(values[4].toString() + values[5].toString(), 16);
    } else {
        return false;
    }
    return [r, g, b];
}

const getColorScale = (minColor, maxColor, mediumColor = '#ffae1a') => {
    var colorScale = interpolateColors(minColor, mediumColor, 50);
    colorScale = colorScale.concat(interpolateColors(mediumColor, maxColor, 50));
    return colorScale;
}

//generateColor("rgb(94, 79, 162)", "rgb(247, 148, 89)")
const generateColor2 = (value, minValue, maxValue, colorScale = currentColorScale) => {
    if (value && value != 0) {
        var percentage = ((value - minValue) / (maxValue - minValue)) * 100;
        percentage = Math.floor(percentage < 0 ? 0 : percentage >= 100 ? 99 : percentage);
        return colorScale[percentage];
    } else {
        return '#bfbfbf';
    }
}

const generateColor = (value, minValue, minColor, maxValue, maxColor) => {
    if (value && value != 0) {
        var colorScale = getColorScale(minColor, maxColor);
        return generateColor2(value, minValue, maxValue, colorScale);
    } else {
        return '#bfbfbf';
    }
}

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
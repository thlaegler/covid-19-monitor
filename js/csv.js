const parseValues = function (value, state) {
    value = $.csv.hooks.castToScalar(value, state);
    // Only try to parse values that include a '.' or '/' or '-'
    // if (value.match(/(\.|\/|\-)/g)) {
    //     const date = new Date(value);

    //     if (date != 'Invalid Date')
    //         return date;
    // }

    return value;
};

const removeEmptyLines = function (csv, state) {
    var lines = $.csv.splitLines(csv);
    var output = [];
    for (var i = 0, len = lines.length; i < len; i++) {
        if (lines[i] !== '') {
            output.push(lines[i]);
        }
    }
    return output.join('\n');
};

const csvOptions = {
    separator: ',',
    delimiter: '"',
    headers: true,
    // onPreParse: removeEmptyLines,
    // onParseValue: $.csv.hooks.castToScalar,
    onParseValue: parseValues,
};

// const loadCsvFocusCountrySnaps2 = (callback, toObject = true) => {
//     focusCountries.forEach(country => {
//         var fileName = filePathPrefix + 'data/byCountry/' + country + '.csv';
//         $.get(fileName, function (csvString) {
//             if (toObject) {
//                 callback($.csv.toObjects(csvString, csvOptions));
//             } else {
//                 callback($.csv.toArray(csvString, csvOptions));
//             }
//         });
//         console.log('Imported CSV-file ' + fileName);
//     });
//     console.log('Imported all focus country CSV-files');
// };

const loadCsvCovid19Snapshots = async (countryNames, callback) => {
    await asyncForEach(countryNames, async (countryName) => {
        var fileName = filePathPrefix + 'data/byCountry/' + countryName + '.csv';
        $.get(fileName, function (csvString) {
            updateSnapshots($.csv.toObjects(csvString, csvOptions));
        });
        console.log('Imported CSV-file ' + fileName);
    });
    console.log('Imported CSV-files: ', countryNames.join(', '));
    if (callback) {
        callback();
    }
};

const loadCsvCovid19ByCountry = (countryName, callback) => {
    var fileName = filePathPrefix + 'data/byCountry/' + countryName + '.csv';
    $.get(fileName, function (csvString) {
        callback($.csv.toObjects(csvString, csvOptions));
    });
    console.log('Imported CSV-file ' + fileName);
}

const loadCsvCovid19ByDate = (dateId, callback) => {
    var fileName = filePathPrefix + 'data/byDate/' + dateId + '.csv';
    $.get(fileName, function (csvString) {
        callback($.csv.toObjects(csvString, csvOptions));
    });
    console.log('Imported CSV-file ' + fileName);
}

const loadCsvCountries = (callback) => {
    var fileName = filePathPrefix + 'data/countries_export.csv';
    $.get(fileName, function (csvString) {
        callback($.csv.toObjects(csvString, csvOptions));
    });
    console.log('Imported CSV-file ' + fileName);
};
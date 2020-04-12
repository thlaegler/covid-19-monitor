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
//         var fileName = filePathPrefix + 'data/by_country/' + country + '.csv';
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

const loadCsvCovid19Snapshots = async (countryNames, callback = undefined) => {
    await asyncForEach(countryNames, async (countryName) => {
        $('.loader-text').html('Loading ' + countryName + ' ...');
        var fileName = filePathPrefix + 'data/by_country/' + countryName + '.csv';
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
    $('.loader-text').html('Loading ' + countryName + ' ...');
    var fileName = filePathPrefix + 'data/by_country/' + countryName + '.csv';
    $.get(fileName, function (csvString) {
        callback($.csv.toObjects(csvString, csvOptions));
    });
    console.log('Imported CSV-file ' + fileName);
}

const loadCsvCovid19ByDate = (dateId, callback) => {
    $('.loader-text').html('Loading Dates ...');
    var fileName = filePathPrefix + 'data/by_date/' + dateId + '.csv';
    $.get(fileName, function (csvString) {
        callback($.csv.toObjects(csvString, csvOptions));
    });
    console.log('Imported CSV-file ' + fileName);
}

const loadCsvCountries = (callback) => {
    $('.loader-text').html('Loading Countries ...');
    var fileName = filePathPrefix + 'data/countries.csv';
    $.get(fileName, function (csvString) {
        callback($.csv.toObjects(csvString, csvOptions));
    });
    console.log('Imported CSV-file ' + fileName);
};
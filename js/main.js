var geoJsonFeatures;
var firstDateId;
var latestDateId;
var allDates = {};
var allCountries = {};
var allSnapshotsByCountry = {};
var allSnapshotsByDate = {};
var selectedSnapshots = {}; // Subset of allSnapshotsByDate
// var filePathPrefix = '';
var filePathPrefix = 'https://raw.githubusercontent.com/thlaegler/covid-19-monitor/master/';

const determineSign = (it) => {
    return it == 0 ? '' : ((it > 0) ? '+' : '');
}

const incrementDateByDays = (dateId, days) => {
    var date = new Date(dateId);
    date.setDate(date.getDate() + days);
    return date.toISOString().substring(0, 10);
}

const makeRadius = (value) => {
    if (isFinite(value)) {
        var valu = 5 + value;
        return valu > 85 ? 85 : valu;
    } else {
        return 5;
    }
}

const arrayTocountryObject = (array) =>
    array.reduce((obj, item) => {
        obj[item.country] = item
        return obj
    }, {});

const groupallSnapshotsByDateId = (snapshots, dateIds) => {
    var allSnapshotsByDate = {};
    dateIds.forEach(dateId => {
        allSnapshotsByDate[dateId] = snapshots.filter(snap => snap.dateId == dateId);
    });
    return allSnapshotsByDate;
};

const groupSnapshotsByCountry = (snapshots, countries) => {
    var allSnapshotsByCountry = {};
    countries.forEach(c => {
        allSnapshotsByCountry[c] = snapshots.filter(snap => snap.country == c);
    });
    return allSnapshotsByCountry;
};

const updatePerspective = async (perspectiveId = 'confirmed_absolute') => {
    $('.loader-modal').show();
    closeSidenav();
    var selectedCountryNames = $('#input-countries').val();//.filter(co => co && co != '').join(',');
    var selectedDateIds = $('#input-dateIds').val();//.filter(da => da && da != '').join(',');

    var missingCountries = selectedCountryNames.filter(sc => !allSnapshotsByCountry[sc]);
    await loadCsvCovid19Snapshots(missingCountries);

    // TODO: Just the selected snapshots
    var selectedSnapshots = allSnapshotsByDate;

    if (selectedSnapshots && latestDateId && selectedSnapshots[latestDateId]) {
        geoJsonFeatures = Object.values(selectedSnapshots[latestDateId])
            .filter(snap => selectedCountryNames.includes(snap.country))
            .map(snap => buildGeojsonFeature(snap, allCountries[snap.country]));
    } else {
        geoJsonFeatures = [];
    }
    updateGeoJsonCircle({
        id: 'countries',
        type: 'FeatureCollection',
        features: geoJsonFeatures,
    });

    var perspect = perspectives[perspectiveId];
    if (perspect) {
        $('#chart_over_time').css('display', 'none')
        $('#button-chart_over_time').css('display', 'none')
        $('#chart_latest').css('display', 'none')
        $('#button-chart_latest').css('display', 'none')
        $('#chart_tertiary').css('display', 'none')
        $('#button-chart_tertiary').css('display', 'none')

        // Update Title
        $('#details-title').html(perspect.title);

        // Update Map
        if (map.getSource('countries')) {
            var data = map.getSource('countries')._data;
            if (!data.features || data.features.length == 0) {
                data.features = [];
            }
            var features = data.features.map(f => {
                if (f && f.properties) {
                    f.properties.title = perspect.title;
                    f.properties.radius = perspect.radius(f.properties);
                    f.properties.color = perspect.color(f.properties);
                    f.properties.label = perspect.label(f.properties);
                    return f;
                }
            });
            data.features = features;
            map.getSource('countries').setData(data);
        } else {

        }

        // Update Charts
        perspect.makeCharts();

        // TODO: Update Tables
    }
    $('.loader-modal').hide();
}

const constructOverTimeChartArray = (title, selector1, selector2, dateShift) => {
    var selectedCountries = $('#input-countries').val();
    var overTimeArray = [[''].concat(selectedCountries)];
    Object.values(allDates).forEach(d => {
        var newDateId = d.dateId;
        if (dateShift && dateShift > 0) {
            var newDateId = incrementDateByDays(newDateId, dateShift);
        }
        var row = [newDateId];
        selectedCountries.forEach(c => {
            if (allSnapshotsByDate[newDateId][c]) {
                var snap = allSnapshotsByDate[newDateId][c];
                var result = (snap[selector1]) ? (selector2 ? snap[selector1][selector2] : snap[selector1]) : 0.0;
                row.push(result ? Number(result) : Number(0.0));
            } else {
                row.push(Number(0.0));
            }
        });
        overTimeArray.push(row);
    });
    return overTimeArray;
}

const constructLatestChartArray = (title, selector1, selector2) => {
    var latestArray = [['Country', title]];
    if (selector1 == 'country') {
        countries.forEach(ct => latestArray.push([ct.country, ct[selector2]]));
    } else {
        if (allSnapshotsByDate[latestDateId]) {
            var snaps = allSnapshotsByDate[latestDateId];
            Object.values(snaps).forEach(snap => latestArray.push([snap.country, Number(selector2 ? (snap[selector1] ? snap[selector1][selector2] : 0) : snap[selector1])]));
        }
    }
    latestArray.sort(function (a, b) { return b[1] - a[1] });
    return latestArray;
};

const buildGeojsonFeature = (snap, country) => {
    if (country && country.latitude && country.longitude) {
        return {
            id: snap.id,
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [country.longitude, country.latitude],
            },
            properties: {
                id: country.country,
                label: '',
                color: '#ffffff',
                radius: 0.0,
                source: country.source + ',' + snap.source,
                dateId: snap.dateId,
                country: country.country,
                caseFatalityRisk: snap.caseFatalityRisk,
                recoveryRate: snap.recoveryRate,
                incidencePer100k: snap.incidencePer100k,
                immunizationRate: snap.immunizationRate,
                doublingTime: snap.doublingTime,

                // COUNTRY / POPULATION
                populationAbsolute: country ? country.populationAbsolute : undefined,
                populationDensity: country ? (country.populationDensity) : undefined,
                urbanPopulationRatio: country ? (country.urbanPopulationRatio) : undefined,
                populationNetChange: country ? country.populationNetChange : undefined,
                landArea: country ? (country.landArea) : undefined,
                migrants: country ? country.migrants : undefined,
                populationMedianAge: country ? (country.populationMedianAge) : undefined,
                populationYearlyChange: country ? (country.populationYearlyChange) : undefined,
                fertilityRate: country ? (country.fertilityRate) : undefined,
                populationWorldShare: country ? (country.populationWorldShare) : undefined,
                acuteCareBedsAbsolute: country ? (country.acuteCareBedsAbsolute) : undefined,
                acuteCareBedsPer100k: country ? (country.acuteCareBedsPer100k) : undefined,
                criticalCareBedsAbsolute: country ? (country.criticalCareBedsAbsolute) : undefined,
                criticalCareBedsPer100k: country ? (country.criticalCareBedsPer100k) : undefined,
                criticalCareAcuteCareRatio: country ? (country.criticalCareAcuteCareRatio) : undefined,
                gdpAbsolute: country ? (country.gdpAbsolute) : undefined,
                gdpPerCapita: country ? (country.gdpPerCapita) : undefined,
                healthExpenditureOfGdp: country ? (country.healthExpenditureOfGdp) : undefined,
                healthExpenditurePerCapita: country ? (country.healthExpenditurePerCapita) : undefined,
                populationOver65: country ? (country.populationOver65) : undefined,
                populationOver65Ratio: country ? (country.populationOver65Ratio) : undefined,

                // CONFIRMED
                confirmedValue: snap.confirmed,
                confirmedDelta: snap.confirmedDelta,
                confirmedGrowthRate: snap.confirmedGrowthRate,

                // REOVERED
                recoveredValue: snap.recovered,
                recoveredDelta: snap.recoveredDelta,
                recoveredGrowthRate: snap.recoveredGrowthRates,

                // DEATH
                deceasedValue: snap.deceased,
                deceasedDelta: snap.deceasedDelta,
                deceasedGrowthRate: snap.deceasedGrowthRate,

                // CALUCLATED
                calculatedAcuteCareAbsolute: snap.calculatedAcuteCareAbsolute,
                calculatedAcuteCarePer100k: snap.calculatedAcuteCarePer100k,
                calculatedAcuteCareBedUtilization: snap.calculatedAcuteCareBedUtilization,
                calculatedCriticalCareAbsolute: snap.calculatedCriticalCareAbsolute,
                calculatedCriticalCarePer100k: snap.calculatedCriticalCarePer100k,
                calculatedCriticalCareBedUtilization: snap.calculatedCriticalCareBedUtilization,
                calculatedConfirmedCases: snap.calculatedConfirmedCases,
                calculatedConfirmedIncidencePer100k: snap.calculatedConfirmedIncidencePer100k,
                calculatedConfirmedCasesDelta: snap.calculatedConfirmedCasesDelta,
                // calculatedConfirmedCases7Days: snap.calculatedConfirmedCases7Days,
                // calculatedConfirmedIncidencePer100k7Days: snap.calculatedConfirmedIncidencePer100k7Days,
                // calculatedConfirmedCases7DaysDelta: snap.calculatedConfirmedCases7DaysDelta,
            },
        }
    }
};
const handleGraphQlResponse = async (snapshots, handler) => {
    // if (response && response.countries && response.countries.length > 0 && response.countryDateSnapshots && response.countryDateSnapshots.length > 0) {
    //     countries = response.countries;
    //     var additionalAcuteCareRate = $('#input-acute_care_additional_rate').val() || 0;
    //     var additionalCriticalCareRate = $('#input-critical_care_additional_rate').val() || 0;

    //     if (additionalAcuteCareRate != 0 || additionalCriticalCareRate != 0) {
    //         countries = countries.map(c => {
    //             c.acuteCareBeds = c.acuteCareBeds + (c.acuteCareBeds * (additionalAcuteCareRate / 100));
    //             c.acuteCareBedsPer100k = c.acuteCareBedsPer100k + (c.acuteCareBedsPer100k * (additionalAcuteCareRate / 100));
    //             c.criticalCareBeds = c.criticalCareBeds + (c.criticalCareBeds * (additionalCriticalCareRate / 100));
    //             c.criticalCareBedsPer100k = c.criticalCareBedsPer100k + (c.criticalCareBedsPer100k * (additionalCriticalCareRate / 100));
    //             return c;
    //         });
    //     }
    //     countries.sort(function (a, b) { return b.country - a.country });
    //     countries = arrayTocountryObject(countries);
    //     snapshots = response.countryDateSnapshots;
    snapshots.map(snap => {
        if (snap.confirmed) {
            // Apply undetected factor
            var undetectedFactor = parseFloat($('#input-estimated_undetected_factor').val());
            snap.confirmed.value = snap.confirmed.value * (1 + undetectedFactor);
            snap.caseFatalityRisk = snap.caseFatalityRisk / (1 + undetectedFactor);
            snap.recoveryRate = snap.recoveryRate / (1 + undetectedFactor);
            snap.incidencePer100k = snap.incidencePer100k * (1 + undetectedFactor);
            snap.immunizationRate = snap.immunizationRate * (1 + undetectedFactor);

            // TODO: Use time-shift for confirmed cases
            var death = (snap.death && snap.death.value) ? snap.death.value : 0;
            var death7Delta = (snap.death && snap.death.delta7Days) ? snap.death.delta7Days : 0;
            var recovered = (snap.recovered && snap.recovered.value) ? snap.recovered.value : 0;
            var recovered7Delta = (snap.recovered && snap.recovered.delta7Days) ? snap.recovered.delta7Days : 0;
            snap.calculatedAcuteCareAbsolute = ((snap.confirmed.value - snap.confirmed.delta7Days) - (recovered - recovered7Delta) - (death - death7Delta)) * ($('#input-acute_care_rate').val() / 100);
            snap.calculatedAcuteCareAbsolute = (snap.calculatedAcuteCareAbsolute < 0) ? 0 : snap.calculatedAcuteCareAbsolute;
            snap.calculatedAcuteCarePer100k = snap.calculatedAcuteCareAbsolute / (allCountries[snap.country].populationAbsolute / 100000);
            snap.calculatedAcuteCareBedUtilization = (snap.calculatedAcuteCarePer100k / allCountries[snap.country].acuteCareBedsPer100k) * 100;

            snap.calculatedCriticalCareAbsolute = ((snap.confirmed.value - snap.confirmed.delta7Days) - (recovered - recovered7Delta) - (death - death7Delta)) * ($('#input-critical_care_rate').val() / 100);
            snap.calculatedCriticalCareAbsolute = (snap.calculatedCriticalCareAbsolute < 0) ? 0 : snap.calculatedCriticalCareAbsolute;
            snap.calculatedCriticalCarePer100k = snap.calculatedCriticalCareAbsolute / (allCountries[snap.country].populationAbsolute / 100000);
            snap.calculatedCriticalCareBedUtilization = (snap.calculatedCriticalCarePer100k / allCountries[snap.country].criticalCareBedsPer100k) * 100;

            // Forecast
            var growthRate24 = parseFloat(snap.confirmed.growthRate);
            var growthRate7 = parseFloat(snap.confirmed.growthRate7Days);
            if ($('#input-reproduction_rate').val() && $('#input-reproduction_rate').val() != '') {
                growthRate24 = parseFloat($('#input-reproduction_rate').val());
                growthRate7 = Math.pow((parseFloat($('#input-reproduction_rate')) / 100) + 1, 7);
            }
            snap.calculatedConfirmedCases = snap.confirmed.value * Math.pow((growthRate24 / 100) + 1, 1);
            snap.calculatedConfirmedIncidencePer100k = snap.incidencePer100k * Math.pow((growthRate24 / 100) + 1, 1);
            snap.calculatedConfirmedCasesDelta = snap.calculatedConfirmedCases - snap.confirmed.value;
            snap.calculatedConfirmedCases7Days = snap.confirmed.value * Math.pow((growthRate7 / 100) + 1, 1);
            snap.calculatedConfirmedCases7DaysDelta = snap.calculatedConfirmedCases7Days - snap.confirmed.value;
            snap.calculatedConfirmedIncidencePer100k7Days = snap.incidencePer100k * Math.pow((growthRate7 / 100) + 1, 1);
        }
    });
    snapshots.sort(function (a, b) { return b.country - a.country });
    // dateIds = Array.from(new Set(snapshots.map(snap => snap.dateId)));
    // dateIds.sort(function (a, b) { return b - a });
    // firstDateId = dateIds[0];
    // latestDateId = dateIds[dateIds.length - 1];
    // countries = Array.from(new Set(snapshots.map(snap => snap.country)));
    // countries.sort(function (a, b) { return b.country - a.country });
    // snapshotsGroupedByDateId = groupallSnapshotsByDateId(snapshots, countries);
    // allSnapshotsByCountry = groupSnapshotsByCountry(snapshots, countries);
    geoJsonFeatures = allSnapshotsByDate[latestDateId].map(snap => buildGeojsonFeature(snap, countries[snap.country]));

    updateGeoJsonCircle({
        id: 'countries',
        type: 'FeatureCollection',
        features: geoJsonFeatures,
    });

    updatePerspective('confirmed_absolute');
    // Simulation input fields
    var simulationCountry = $('#input-country').val();
    var simulationCountriesnaps = allSnapshotsByCountry[simulationCountry];
    if (simulationCountriesnaps) {
        $('#input-reproduction_rate').val(parseFloat(simulationCountriesnaps[simulationCountriesnaps.length - 1].confirmed.growthRate).toFixed(2));
    }
    // }
    $('.loader-modal').hide();
}

const updateSnapshots = async (csvSnapshot) => {
    if (csvSnapshot && csvSnapshot.length > 0) {
        var currentCountry = csvSnapshot[0].country;
        var groupedByDate = {};
        await asyncForEach(csvSnapshot, cs => groupedByDate[cs.dateId] = cs);
        var previous;
        Object.values(allDates).forEach(d => {
            var snap = groupedByDate[d.dateId];
            if (!snap) {
                snap = {
                    date: d.dateId,
                    t: Number(d.t),
                    country: currentCountry,
                    confirmed: previous ? previous.confirmed : 0,
                    recovered: previous ? previous.recovered : 0,
                    deceased: previous ? previous.deceased : 0,
                };
            }

            if (snap.confirmed) {
                var countr = allCountries[snap.country];

                snap.confirmedGrowthRate = (snap.confirmedGrowthRate - 1) * 100;
                snap.recoveredGrowthRate = (snap.recoveredGrowthRate - 1) * 100;
                snap.deceasedGrowthRate = (snap.deceasedGrowthRate - 1) * 100;
                snap.recoveryRate = snap.recoveryRate * 100;
                snap.immunizationRate = snap.immunizationRate * 100;
                snap.caseFatalityRisk = snap.caseFatalityRisk * 100;

                // Apply undetected factor
                var undetectedFactor = parseFloat($('#input-estimated_undetected_factor').val() || 0);
                snap.confirmed.value = snap.confirmed.value * (1 + undetectedFactor);
                snap.recovered.value = snap.recovered.value * (1 + undetectedFactor);
                snap.deceased.value = snap.deceased.value * (1 + undetectedFactor);
                snap.caseFatalityRisk = snap.caseFatalityRisk / (1 + undetectedFactor);
                snap.recoveryRate = snap.recoveryRate / (1 + undetectedFactor);
                snap.incidencePer100k = snap.incidencePer100k * (1 + undetectedFactor);
                snap.immunizationRate = snap.immunizationRate * (1 + undetectedFactor);

                // TODO: Use time-shift for confirmed cases
                if (countr) {
                    var deceased = snap.deceased ? snap.deceased : 0;
                    var recovered = snap.recovered ? snap.recovered : 0;
                    snap.calculatedAcuteCareAbsolute = ((snap.confirmed - snap.confirmedDelta) - (recovered) - (deceased)) * ($('#input-acute_care_rate').val() / 100);
                    snap.calculatedAcuteCareAbsolute = (snap.calculatedAcuteCareAbsolute < 0) ? 0 : snap.calculatedAcuteCareAbsolute;
                    snap.calculatedAcuteCarePer100k = snap.calculatedAcuteCareAbsolute / (countr.populationAbsolute / 100000);
                    snap.calculatedAcuteCareBedUtilization = (snap.calculatedAcuteCarePer100k / countr.acuteCareBedsPer100k) * 100;

                    snap.calculatedCriticalCareAbsolute = ((snap.confirmed - snap.confirmedDelta) - (recovered) - (deceased)) * ($('#input-critical_care_rate').val() / 100);
                    snap.calculatedCriticalCareAbsolute = (snap.calculatedCriticalCareAbsolute < 0) ? 0 : snap.calculatedCriticalCareAbsolute;
                    snap.calculatedCriticalCarePer100k = snap.calculatedCriticalCareAbsolute / (countr.populationAbsolute / 100000);
                    snap.calculatedCriticalCareBedUtilization = (snap.calculatedCriticalCarePer100k / countr.criticalCareBedsPer100k) * 100;
                } else {
                    console.warn('No data about country ' + countr);
                }
                // Forecast
                var growthRate24 = parseFloat(snap.confirmedGrowthRate);
                // var growthRate7 = parseFloat(snap.confirmed.growthRate7Days);
                if ($('#input-reproduction_rate').val() && $('#input-reproduction_rate').val() != '') {
                    growthRate24 = parseFloat($('#input-reproduction_rate').val());
                    // growthRate7 = Math.pow((parseFloat($('#input-reproduction_rate')) / 100) + 1, 7);
                }
                snap.calculatedConfirmedCases = snap.confirmed.value * Math.pow((growthRate24 / 100) + 1, 1);
                snap.calculatedConfirmedIncidencePer100k = snap.incidencePer100k * Math.pow((growthRate24 / 100) + 1, 1);
                snap.calculatedConfirmedCasesDelta = snap.calculatedConfirmedCases - snap.confirmed.value;
            }

            if (!allSnapshotsByDate[d.dateId]) {
                allSnapshotsByDate[d.dateId] = {};
            }
            allSnapshotsByDate[d.dateId][currentCountry] = snap;
            if (!allSnapshotsByCountry[currentCountry]) {
                allSnapshotsByCountry[currentCountry] = {};
            }
            allSnapshotsByCountry[currentCountry][d.dateId] = snap;

            previous = snap;
        });
    }
};

const focusCountries = ['United States', 'China', 'France', 'Iceland', 'Palestine', 'Israel', 'Turkey', 'Malaysia', 'Indonesia', 'Sri Lanka', 'Greece', 'India', 'Hong Kong', 'Macao', 'Singapore', 'Saudi Arabia', 'Philippines', 'Canada', 'Germany', 'Spain', 'Iran', 'Italy', 'Switzerland', 'South Korea', 'Austria', 'Norway', 'Sweden', 'Russia', 'Denmark', 'Poland', 'Portugal', 'Taiwan', 'Japan', 'New Zealand', 'Brazil', 'Thailand', 'Belgium', 'Austria', 'Netherlands', 'Australia', 'United Kingdom']
// const focusCountries = ['New Zealand'];
const initSelectCountries = (countries) => {
    countries.sort(function (a, b) { return b.country - a.country });

    countries.forEach(c => {
        var selected = focusCountries.includes(c.country) ? ' selected' : '';
        $('#input-countries').append('<option value="' + c.country + '" ' + selected + '>' + c.country + '</option>');
        var selected2 = c.country == 'United States' ? ' selected' : '';
        $('#input-country').append('<option value="' + c.country + '" ' + selected2 + '>' + c.country + '</option>');

        allCountries[c.country] = c;
    });
    // if (allDates && Object.values(allDates).length > 0) {
    //     updatePerspective();
    // }
};

const focusDateIds = ['2020-02-25', '2020-02-26', '2020-02-27', '2020-02-28', '2020-02-29', '2020-03-01', '2020-03-02', '2020-03-03', '2020-03-04', '2020-03-05', '2020-03-06', '2020-03-07', '2020-03-08', '2020-03-09', '2020-03-10', '2020-03-11', '2020-03-12', '2020-03-13', '2020-03-14', '2020-03-15', '2020-03-16', '2020-03-17', '2020-03-18', '2020-03-19', '2020-03-20', '2020-03-21', '2020-03-22', '2020-03-23', '2020-03-24', '2020-03-25', '2020-03-26', '2020-03-27', '2020-03-28', '2020-03-29', '2020-03-30', '2020-03-31', '2020-04-01', '2020-04-02', '2020-04-03', '2020-04-04', '2020-04-05', '2020-04-06', '2020-04-07', '2020-04-08'];
const initSelectDateIds = (countryDateSnapshots) => {
    countryDateSnapshots.sort(function (a, b) { return b.dateId - a.dateId });
    firstDateId = countryDateSnapshots[0].dateId;
    latestDateId = countryDateSnapshots[countryDateSnapshots.length - 1].dateId;
    updateTimeAgo(countryDateSnapshots[countryDateSnapshots.length - 1].importDate);

    countryDateSnapshots.forEach(snap => {
        var selected = focusDateIds.includes(snap.dateId) ? ' selected' : '';
        $('#input-dateIds').append('<option value="' + snap.dateId + '" ' + selected + '>' + snap.dateId + '</option>');
        $('#input-start_dateId').append('<option value="' + snap.dateId + '" ' + selected + '>' + snap.dateId + '</option>');

        allDates[snap.dateId] = {
            t: snap.t,
            dateId: snap.dateId
        };
    });
    // if (allCountries && Object.values(allCountries).length > 0) {
    //     updatePerspective();
    // }
};

const updateTimeAgo = (actualUtcTimeString) => {
    var nowUtcString = new Date().toISOString();
    var now = new Date(nowUtcString);
    var actual = new Date(actualUtcTimeString + '.000Z');
    var minutes = ((now - actual) / 1000) / 60;
    var minutesRound = Math.floor(minutes);
    var hoursRound = Math.floor(minutes / 60);
    var ago = (hoursRound == 0) ? (minutesRound + ' mins') : hoursRound + ' hrs'
    $('#last-update-ago').html('updated ' + ago + ' ago');
}

function openParameters() {
    closeSidenav();
    document.getElementById("sidenav-parameters").style.width = "100%";
    $('.navbar-toggler').click();
}
function openSimulations() {
    closeSidenav();
    document.getElementById("sidenav-simulations").style.width = "100%";
    $('.navbar-toggler').click();
}

function closeSidenav() {
    document.getElementById("sidenav-parameters").style.width = "0";
    document.getElementById("sidenav-simulations").style.width = "0";
}

const changeLanguage = (languageCode) => {
    if (languageCode) {
        i18next.changeLanguage(languageCode);
    }
    $('body').localize();
    $('[data-toggle="tooltip"]').tooltip('dispose');
    $('[data-toggle="tooltip"]').tooltip();
}

const initLanguage = () => {
    i18next
        .use(i18nextXHRBackend)
        .use(i18nextBrowserLanguageDetector)
        .init({
            debug: true,
            fallbackLng: 'en',
            ns: ['common'],
            defaultNS: 'common',
            backend: {
                loadPath: filePathPrefix + 'locales/{{lng}}/{{ns}}.json',
                crossDomain: true
            }
        }, function (err, t) {
            jqueryI18next.init(i18next, $, {
                tName: 't', // --> appends $.t = i18next.t
                i18nName: 'i18n', // --> appends $.i18n = i18next
                handleName: 'localize', // --> appends $(selector).localize(opts);
                selectorAttr: 'data-i18n', // selector for translating elements
                targetAttr: 'i18n-target', // data-() attribute to grab target element to translate (if diffrent then itself)
                optionsAttr: 'i18n-options', // data-() attribute that contains options, will load/set if useOptionsAttr = true
                useOptionsAttr: false, // see optionsAttr
                // parseDefaultValueFromContent: true // parses default values from content ele.val or ele.text
            });
            changeLanguage();
        }
        );
}

const initSlider = (elementName, min, max, step) => {
    var select = $('#select-' + elementName);
    var slider = $('<div id="slider_' + elementName + '" class="form-control form-control-sm"></div>').insertAfter(select).slider({
        // range: true,
        min: min,
        max: max,
        step: step,
        value: select[0].selectedIndex,
        slide: function (event, ui) {
            select[0].selectedIndex = (ui.value - min) * (1 / step);
        }
    });
    select.on('change', function () {
        slider.slider('value', this.value);
    });
    slider.css('background', 'linear-gradient(90deg, rgba(187,187,187,1) 10%, rgba(0,255,61,1) 30%, rgba(251,255,0,1) 50%, rgba(255,151,0,1) 75%, rgba(255,0,0,1) 100%)');
}

const initNestedForm = (elementName) => {
    $('#container-' + elementName).nestedForm({
        forms: '.nested-form',
        adder: '#button-' + elementName + '_add',
        remover: '.button-' + elementName + '_remove',
        // associations: 'assocs',
        startIndex: 0,
        afterAddForm: function (container, form) {
            var j = $('.nested-form').length - 1;
            form.find('input').each(function () { $(this).attr('id', 'input-' + $(this).attr('name') + '_' + j) });
        },
    });
}

const initSimulationCrossFields = () => {
    $('#select-country').change(function () {
        var selCountryName = $(this).val();
        var selCountry = allCountries[selCountryName];
        var selDate = $('#input-start_dateId').val() || new Date().toISOString().substring(0, 10);
        var selSnap = allSnapshotsByCountry[selCountryName][selDate];
        var latentDuration = $('#input-latent_duration').val() || 5.5;
        $('#input-total_population').val(selCountry.populationAbsolute);
        $('#input-initial_latent').val(selSnap.confirmedDelta * latentDuration);
        $('#input-initial_infectious').val(selSnap.confirmed - selSnap.recovered - selSnap.deceased);
        $('#input-initial_recovered').val(selSnap.recovered);
        $('#input-initial_deceased').val(selSnap.deceased);
    });
};

const initCharts = async () => {
    await google.charts.load('current', { 'packages': ['corechart'] });
}

const initCsv = () => {
    loadCsvCountries(initSelectCountries, true);
    loadCsvCovid19ByCountry('China', initSelectDateIds, true);
    loadCsvCovid19Snapshots(focusCountries, updatePerspective);
};

const init = async () => {
    $('.loader-modal').show();

    await initCharts();
    initLanguage();
    initCsv();

    initSlider('base_reproduction_number', 1.0, 3.5, 0.1);
    initSlider('case_fatality_risk', 0.0, 5.0, 0.1);
    initNestedForm('interventions');
    initSimulationCrossFields();

    initMapBox();
    map.setZoom(0.5);
    map.setCenter({ lng: 0.0, lat: 0.0 });

    $('.change-perspective').unbind().on('click touchstart', event => {
        var element = $(event.currentTarget);
        // var id = element.attr('id');
        var target = element.data('target');
        var originalTitle = element.data('original-title');
        // var text = event.currentTarget.text;
        $('.navbar-toggler').click();
        updatePerspective(target);
        $('#details-title').html(originalTitle);
        document.title = originalTitle;
        closeSidenav();
    });
    // changeLanguage();

    // Change reproduction rate value for simulation according to latest 24-hour growth-rate of given country.
    // $('#input-country').unbind().change(event => {
    //     var selectedCountry = $(event.currentTarget).val();
    //     var simulationCountriesnaps = allSnapshotsByCountry[selectedCountry];
    //     $('#input-reproduction_rate').val(parseFloat(simulationCountriesnaps[simulationCountriesnaps.length - 1].confirmed.growthRate).toFixed(2));

    // });
    $('[data-toggle="tooltip"]').tooltip('dispose');
    $('[data-toggle="tooltip"]').tooltip();

    $('.loader-modal').hide();
}
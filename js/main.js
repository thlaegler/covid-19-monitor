var geoJsonFeatures;
var firstDateId;
var latestDateId;
var allDates = {};
var allCountries = {};
var allSnapshotsByCountry = {};
var allSnapshotsByDate = {};

var filePathPrefix = 'https://raw.githubusercontent.com/thlaegler/covid-19-monitor/master/'; // local dev
// var filePathPrefix = ''; // local prod

const determineSign = (it) => {
    return it == 0 ? '' : ((it > 0) ? '+' : '');
}

const countryCode2EmojiFlag = (countryCode) => {
    if (countryCode) {
        return countryCode.toUpperCase().replace(/./g, char => String.fromCodePoint(char.charCodeAt(0) + 127397));
    }
    return '';
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

const arrayToObjects = (array, identifier) =>
    array.reduce((obj, item) => {
        var id = item[identifier];
        obj[id] = item;
        return obj;
    }, {});

const groupSnapshotsByDateId = async (snapshots, dateIds) => {
    await asyncForEach(dateIds, dateId => {
        allSnapshotsByDate[dateId] = snapshots.filter(snap => snap.dateId == dateId);
    });
};

const groupSnapshotsByCountry = async (snapshots, countryNames) => {
    await asyncForEach(countryNames, c => {
        allSnapshotsByCountry[c] = snapshots.filter(snap => snap.country == c);
    });
};

const updatePerspective = async (perspectiveId = 'confirmed_absolute') => {
    $('.loader-modal').show();
    closeSidenav();
    var selectedCountryNames = $('#input-countries').val();//.filter(co => co && co != '').join(',');
    var selectedDateIds = $('#input-dateIds').val();//.filter(da => da && da != '').join(',');

    var missingCountries = selectedCountryNames.filter(sc => !allSnapshotsByCountry[sc]);
    if (missingCountries && missingCountries.length > 0) {
        await loadCsvCovid19Snapshots(missingCountries);
    }

    var perspect = perspectives[perspectiveId];
    if (perspect) {
        $('#title_over_time').css('display', 'none');
        $('#chart_over_time').css('display', 'none');
        $('#button-chart_over_time').css('display', 'none');
        $('#table_chart_over_time').css('display', 'none');

        $('#title_latest').css('display', 'none');
        $('#chart_latest').css('display', 'none');
        $('#button-chart_latest').css('display', 'none');
        $('#table_chart_latest').css('display', 'none');

        $('#title_tertiary').css('display', 'none');
        $('#chart_tertiary').css('display', 'none');
        $('#button-chart_tertiary').css('display', 'none');
        $('#table_tertiary').css('display', 'none');

        // Update Title
        var title = '';
        var description = '';
        if (perspect.titleKey) {
            title = i18next.t(perspect.titleKey + '.link');
            description = i18next.t(perspect.titleKey + '.tooltip');
            $('#details-title').html(title);
            $('#details-title').attr('data-i18n', perspect.titleKey + '.link');
            $('#details-description').html(description);
            $('#details-description').attr('data-i18n', perspect.titleKey + '.tooltip');
        } else {
            title = perspect.title;
            $('#details-title').html(perspect.title);
            $('#details-description').html(perspect.title);
        }

        // Update Map
        // if (!map.getSource('countries')) {
        //     await initMapGeoJson();
        // }
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

        // Update Charts
        perspect.makeCharts(title);

        // TODO: Update Tables
    }
    $('.loader-modal').hide();
}

const constructOverTimeChartArray = (title, selector1, selector2, dateShift) => {
    var selectedCountries = $('#input-countries').val();
    var selectedDateIds = $('#input-dateIds').val();
    var overTimeArray = [[''].concat(selectedCountries.map(cn => allCountries[cn].flag + ' ' + cn))];
    Object.values(selectedDateIds).forEach(dateId => {
        // if (dateShift && dateShift > 0) {
        //     var dateId = incrementDateByDays(dateId, dateShift);
        // }
        var row = [dateId];
        selectedCountries.forEach(c => {
            if (allSnapshotsByDate[dateId][c]) {
                var snap = allSnapshotsByDate[dateId][c];
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
    var selectedCountries = $('#input-countries').val();
    var latestArray = [['Country', title]];
    if (selector1 == 'country') {
        selectedCountries.forEach(c => latestArray.push([c, allCountries[c][selector2]]));
    } else {
        if (allSnapshotsByDate[latestDateId]) {
            var snaps = allSnapshotsByDate[latestDateId];
            Object.values(snaps)
                .filter(snap => selectedCountries.includes(snap.country))
                .forEach(snap => {
                    var vall = selector2 ? (snap[selector1] ? snap[selector1][selector2] : 0) : snap[selector1];
                    vall = isNaN(vall) ? vall : Number(vall);
                    latestArray.push([snap.flag + ' ' + snap.country, vall]);
                });
        }
    }
    latestArray.sort(function (a, b) { return b[1] - a[1] });
    return latestArray;
};

const buildGeojsonFeature = (snap) => {
    var country = allCountries[snap.country];
    if (country && country.latitude && country.longitude) {
        return {
            id: snap.country,
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
                flag: countryCode2EmojiFlag(snap.countryCode),
                caseFatalityRisk: snap.caseFatalityRisk,
                recoveryRate: snap.recoveryRate,
                incidencePer100k: snap.incidencePer100k,
                immunizationRate: snap.immunizationRate,
                doublingTime: snap.doublingTime,
                doublingTimeLast7Days: snap.doublingTimeLast7Days,

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
                confirmed: snap.confirmed,
                confirmedDelta: snap.confirmedDelta,
                confirmedGrowthRate: snap.confirmedGrowthRate,

                // RECOVERED
                recovered: snap.recovered,
                recoveredDelta: snap.recoveredDelta,
                recoveredGrowthRate: snap.recoveredGrowthRate,

                // DEATH
                deceased: snap.deceased,
                deceasedDelta: snap.deceasedDelta,
                deceasedGrowthRate: snap.deceasedGrowthRate,

                // INFECTIOUS
                infectious: snap.infectious,
                infectiousDelta: snap.infectiousDelta,
                infectiousGrowthRate: snap.infectiousGrowthRate,

                // TESTED
                tested: snap.tested,
                testedDelta: snap.testedDelta,
                testedPer1k: snap.testedPer1k,

                // CALUCLATED
                mobility: snap.mobility,
                responseStringency: snap.responseStringency,
                estimateReproductionNumber: snap.estimateReproductionNumber,
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

const updateSnapshots = async (csvSnapshot) => {
    if (csvSnapshot && csvSnapshot.length > 0) {
        var currentCountry = csvSnapshot[0].country;
        var previous;

        if (!allSnapshotsByCountry[currentCountry]) {
            allSnapshotsByCountry[currentCountry] = {};
        }
        await asyncForEach(Object.values(allDates), d => {
            if (!allSnapshotsByDate[d.dateId]) {
                allSnapshotsByDate[d.dateId] = {};
            }
        });

        var j = 0;
        await asyncForEach(csvSnapshot, snap => {
            // var snap = allSnapshotsByCountry[currentCountry][cs.dateId];
            if (!snap) {
                snap = {
                    dateId: d.dateId,
                    t: Number(d.t),
                    country: currentCountry,
                    confirmed: previous ? previous.confirmed : 0,
                    recovered: previous ? previous.recovered : 0,
                    deceased: previous ? previous.deceased : 0,
                    infectious: previous ? previous.infectious : 0,
                };
            }

            snap.flag = countryCode2EmojiFlag(snap.countryCode);

            if (snap.confirmed) {
                var infectiousDuration = Number($('#input-infectious_duration').val());
                var latentDuration = Number($('#input-latent_duration').val());

                var countr = allCountries[snap.country];

                snap.confirmedGrowthRate = snap.confirmedGrowthRate <= 0 ? 0 : ((snap.confirmedGrowthRate - 1) * 100);
                snap.recoveredGrowthRate = snap.recoveredGrowthRate <= 0 ? 0 : ((snap.recoveredGrowthRate - 1) * 100);
                snap.deceasedGrowthRate = snap.deceasedGrowthRate <= 0 ? 0 : ((snap.deceasedGrowthRate - 1) * 100);
                snap.infectiousGrowthRate = snap.infectiousGrowthRate <= 0 ? 0 : ((snap.infectiousGrowthRate - 1) * 100);
                snap.recoveryRate = snap.recoveryRate * 100;
                snap.immunizationRate = snap.immunizationRate * 100;
                snap.caseFatalityRisk = snap.caseFatalityRisk * 100;

                // Apply undetected factor
                // var undetectedFactor = parseFloat($('#input-estimated_undetected_factor').val() || 0);
                // snap.confirmed = snap.confirmed * (1 + undetectedFactor);
                // snap.recovered = snap.recovered * (1 + undetectedFactor);
                // snap.deceased = snap.deceased * (1 + undetectedFactor);
                // snap.infectious = snap.infectious * (1 + undetectedFactor);
                // snap.caseFatalityRisk = snap.caseFatalityRisk / (1 + undetectedFactor);
                // snap.recoveryRate = snap.recoveryRate / (1 + undetectedFactor);
                // snap.incidencePer100k = snap.incidencePer100k * (1 + undetectedFactor);
                // snap.immunizationRate = snap.immunizationRate * (1 + undetectedFactor);

                // TODO: Use time-shift for confirmed cases
                if (countr) {
                    var base = snap.infectious;
                    if (j >= infectiousDuration) {
                        base = csvSnapshot[j - infectiousDuration].infectious;
                    }
                    snap.calculatedAcuteCareAbsolute = base * ($('#input-acute_care_rate').val() / 100);
                    snap.calculatedAcuteCareAbsolute = (snap.calculatedAcuteCareAbsolute < 0) ? 0 : snap.calculatedAcuteCareAbsolute;
                    snap.calculatedAcuteCarePer100k = snap.calculatedAcuteCareAbsolute / (countr.populationAbsolute / 100000);
                    snap.calculatedAcuteCareBedUtilization = (snap.calculatedAcuteCarePer100k / countr.acuteCareBedsPer100k) * 100;

                    snap.calculatedCriticalCareAbsolute = base * ($('#input-critical_care_rate').val() / 100);
                    snap.calculatedCriticalCareAbsolute = (snap.calculatedCriticalCareAbsolute < 0) ? 0 : snap.calculatedCriticalCareAbsolute;
                    snap.calculatedCriticalCarePer100k = snap.calculatedCriticalCareAbsolute / (countr.populationAbsolute / 100000);
                    snap.calculatedCriticalCareBedUtilization = (snap.calculatedCriticalCarePer100k / countr.criticalCareBedsPer100k) * 100;

                } else {
                    console.warn('No data about country ' + countr);
                }
                snap.estimateReproductionNumber = ((snap.confirmedDelta / snap.infectious) * (infectiousDuration + (0.5 * latentDuration))) * (1 - snap.immunizationRate);

                // Forecast
                var growthRate24 = parseFloat(snap.confirmedGrowthRate);
                // var growthRate7 = parseFloat(snap.confirmed.growthRate7Days);
                // if ($('#input-reproduction_rate').val() && $('#input-reproduction_rate').val() != '') {
                //     growthRate24 = parseFloat($('#input-reproduction_rate').val());
                // growthRate7 = Math.pow((parseFloat($('#input-reproduction_rate')) / 100) + 1, 7);
                // }
                snap.calculatedConfirmedCases = snap.confirmed.value * Math.pow((growthRate24 / 100) + 1, 1);
                snap.calculatedConfirmedIncidencePer100k = snap.incidencePer100k * Math.pow((growthRate24 / 100) + 1, 1);
                snap.calculatedConfirmedCasesDelta = snap.calculatedConfirmedCases - snap.confirmed.value;
            }

            // Average Doubling time of last 7 days
            var allGrowth = [];
            var growthSum = 0;
            for (var k = 0; k < 7; k++) {
                var currSnap = csvSnapshot[j - k];
                if (currSnap && currSnap.confirmedGrowthRate > 0) {
                    allGrowth.push(currSnap.confirmedGrowthRate);
                    growthSum = growthSum + currSnap.confirmedGrowthRate;
                }
            }

            var weeklyAverageGrowth = ((growthSum / allGrowth.length) / 100) + 1;
            if (weeklyAverageGrowth && isFinite(weeklyAverageGrowth) && !isNaN(weeklyAverageGrowth)) {
                var doubl = Math.log(2) / Math.log(weeklyAverageGrowth);
                if (doubl && isFinite(doubl) && !isNaN(doubl)) {
                    snap.doublingTimeLast7Days = doubl;
                }
            }

            allSnapshotsByCountry[currentCountry][snap.dateId] = snap;
            allSnapshotsByDate[snap.dateId][currentCountry] = snap;
            previous = snap;

            j++;
        });

        var lastSnap = allSnapshotsByCountry[currentCountry][latestDateId];
        var feature = buildGeojsonFeature(lastSnap);
        updateGeoJsonCircle(feature);
    }
};

const doApply = async () => {
    $('.loader-modal').show();

    closeSidenav();

    window.scrollTo(0, 0);

    var selectedCountryNames = $('#input-countries').val();//.filter(co => co && co != '').join(',');
    // var selectedDateIds = $('#input-dateIds').val();//.filter(da => da && da != '').join(',');

    var missingCountryNames = selectedCountryNames.filter(sc => !allSnapshotsByCountry[sc]);
    if (missingCountryNames && missingCountryNames.length > 0) {
        await asyncForEach(missingCountryNames, async (countryName) => {
            $('.loader-text').html('Loading ' + countryName + ' ...');
            var fileName = filePathPrefix + 'data/by_country/' + countryName + '.csv';
            await $.get(fileName, async (csvString) => {
                updateSnapshots($.csv.toObjects(csvString, csvOptions));
            });
            console.log('Imported CSV-file ' + fileName);
        });
    }

    updatePerspective();

    $('#button-interventions_remove_0').click();

    $('.loader-modal').hide();
}

const focusCountries = ['United States',
    'China',
    'France',
    'Iceland',
    'Palestine',
    'Ireland',
    'Israel',
    'Turkey',
    'Malaysia',
    'Indonesia',
    'Sri Lanka',
    'Greece',
    'India',
    'Singapore',
    'Saudi Arabia',
    'Philippines',
    'Canada',
    'Germany',
    'Spain',
    'Iran',
    'Italy',
    'Switzerland',
    'South Korea',
    'Austria',
    'Norway',
    'Sweden',
    'Russia',
    'Denmark',
    'Poland',
    'Portugal',
    'Taiwan',
    'Japan',
    'New Zealand',
    'Brazil',
    'Thailand',
    'Belgium',
    'Austria',
    'Netherlands',
    'Australia',
    'Vietnam',
    'United Kingdom']
const initSelectCountries = async (countries) => {
    countries.sort(function (a, b) { return b.country - a.country });

    await asyncForEach(countries, c => {
        c.flag = countryCode2EmojiFlag(c.countryCode);
        var selected = focusCountries.includes(c.country) ? ' selected' : '';
        $('#input-countries').append('<option value="' + c.country + '" ' + selected + '>' + c.flag + ' ' + c.country + '</option>');
        var selected2 = c.country == 'United States' ? ' selected' : '';
        $('#input-simulation_country').append('<option value="' + c.country + '" ' + selected2 + '>' + c.flag + ' ' + c.country + '</option>');
        allCountries[c.country] = c;
    });
};

const focusDateIds = ['2020-02-25', '2020-02-26', '2020-02-27', '2020-02-28',
    '2020-02-29', '2020-03-01', '2020-03-02', '2020-03-03', '2020-03-04', '2020-03-05',
    '2020-03-06', '2020-03-07', '2020-03-08', '2020-03-09', '2020-03-10', '2020-03-11',
    '2020-03-12', '2020-03-13', '2020-03-14', '2020-03-15', '2020-03-16', '2020-03-17',
    '2020-03-18', '2020-03-19', '2020-03-20', '2020-03-21', '2020-03-22', '2020-03-23',
    '2020-03-24', '2020-03-25', '2020-03-26', '2020-03-27', '2020-03-28', '2020-03-29',
    '2020-03-30', '2020-03-31', '2020-04-01', '2020-04-02', '2020-04-03', '2020-04-04',
    '2020-04-05', '2020-04-06', '2020-04-07', '2020-04-08', '2020-04-09', '2020-04-08',
    '2020-04-10', '2020-04-11', '2020-04-12', '2020-04-13', '2020-04-14', '2020-04-15',
    '2020-04-16', '2020-04-17', '2020-04-18', '2020-04-19', '2020-04-20', '2020-04-21'];
const initSelectDateIds = async (countryDateSnapshots) => {
    countryDateSnapshots.sort(function (a, b) { return b.dateId - a.dateId });
    firstDateId = countryDateSnapshots[0].dateId;
    latestDateId = countryDateSnapshots[countryDateSnapshots.length - 1].dateId;
    updateTimeAgo(countryDateSnapshots[countryDateSnapshots.length - 1].importDate);

    await asyncForEach(countryDateSnapshots, snap => {
        var selected = focusDateIds.includes(snap.dateId) ? ' selected' : '';
        $('#input-dateIds').append('<option value="' + snap.dateId + '" ' + selected + '>' + snap.dateId + '</option>');
        $('#input-simulation_start_dateId').append('<option value="' + snap.dateId + '" ' + selected + '>' + snap.dateId + '</option>');

        allDates[snap.dateId] = {
            t: snap.t,
            dateId: snap.dateId
        };
    });
    updateSnapshots(countryDateSnapshots);
};

const updateTimeAgo = (actualUtcTimeString) => {
    var nowUtcString = new Date().toISOString();
    var now = new Date(nowUtcString);
    var actual = new Date(actualUtcTimeString);
    var minutes = ((now - actual) / 1000) / 60;
    var minutesRound = Math.floor(minutes);
    var hoursRound = Math.floor(minutes / 60);
    var ago = (hoursRound == 0) ? (minutesRound + ' mins') : hoursRound + ' hrs'
    $('#last-update-ago').html('updated ' + ago + ' ago');
}

function openParameters() {
    $('.navbar-toggler').click();
    closeSidenav();
    document.getElementById("sidenav-parameters").style.width = "100%";
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}
function openSimulations() {
    $('.navbar-toggler').click();
    closeSidenav();
    document.getElementById("sidenav-simulations").style.width = "100%";
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
    var selDate = $('#input-simulation_start_dateId').val() || new Date().toISOString().substring(0, 10);
    var selCountryName = $('#input-simulation_country').val();
    setSimulationCrossFields(selDate, selCountryName);
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
            changeLanguage('en');
        });
    // changeLanguage();
}

const initSlider = (elementName, min, max, step) => {
    var select = $('#input-' + elementName);
    var slider = $('<div id="slider_' + elementName + '"></div>').insertAfter(select).slider({
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
    slider.slider('value', select.val());
    slider.css('background', 'linear-gradient(90deg, rgba(187,187,187,1) 10%, rgba(0,255,61,1) 30%, rgba(251,255,0,1) 50%, rgba(255,151,0,1) 75%, rgba(255,0,0,1) 100%)');
}

const initNestedForm = (elementName) => {
    $('#container-' + elementName).nestedForm({
        forms: '.nested-form',
        adder: '#button-' + elementName + '_add',
        remover: '.button-' + elementName + '_remove',
        // associations: 'assocs',
        startIndex: 0,
        afterAddForm: (container, form) => {
            var j = $('.nested-form').length - 1;
            form.find('input').each(function () { $(this).attr('id', 'input-' + $(this).attr('name') + '_' + j) });
        },
        afterRemoveForm: (container) => container.remove(),
    }).find('#button-' + elementName + '_remove_0').click();
    // $('#button-' + elementName + '_remove_0').click();
}

const initSimulationCrossFields = () => {
    $('#input-simulation_country').change(function () {
        var selCountryName = $(this).val();
        var selDate = $('#input-simulation_start_dateId').val() || new Date().toISOString().substring(0, 10);
        setSimulationCrossFields(selDate, selCountryName);
    });
    $('#input-simulation_start_dateId').change(function () {
        var selDate = $(this).val();
        var selCountryName = $('#input-simulation_country').val();
        setSimulationCrossFields(selDate, selCountryName);
    });
};
const setSimulationCrossFields = (selDate, selCountryName) => {
    var selCountry = allCountries[selCountryName];
    var selSnap = allSnapshotsByCountry[selCountryName][selDate];
    var latentDuration = $('#input-latent_duration').val() || 5.5;
    if (selSnap) {
        $('#input-total_population').val(selCountry.populationAbsolute);
        $('#input-initial_latent').val(Math.floor(selSnap.confirmedDelta * latentDuration));
        $('#input-initial_infectious').val(selSnap.infectious);
        $('#input-initial_recovered').val(selSnap.recovered);
        $('#input-initial_deceased').val(selSnap.deceased);
    }
};

const init = () => {
    $('.loader-modal').show();
    window.scrollTo(0, 0);

    // Charts
    google.charts.load('current', { 'packages': ['corechart', 'table'] });

    // Language
    initLanguage();

    // Initial Data
    loadCsvCountries(initSelectCountries);
    loadCsvCovid19ByCountry('China', initSelectDateIds);

    // Map
    initMapBox();
    map.setZoom(0.5);
    map.setCenter({ lng: 0.0, lat: 0.0 });

    // Form
    initSlider('base_reproduction_number', 0.0, 7.0, 0.1);
    initSlider('case_fatality_risk', 0.0, 5.0, 0.1);
    initSlider('latent_duration', 1.0, 6.5, 0.1);
    initSlider('infectious_duration', 2.5, 14.0, 0.1);
    initNestedForm('interventions');
    initSimulationCrossFields();

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

    $('#title_over_time').css('display', 'none');
    $('#chart_over_time').css('display', 'none');
    $('#button-chart_over_time').css('display', 'none');
    $('#table_chart_over_time').css('display', 'none')

    $('#title_latest').css('display', 'none');
    $('#chart_latest').css('display', 'none');
    $('#button-chart_latest').css('display', 'none');
    $('#table_chart_latest').css('display', 'none')

    $('#title_tertiary').css('display', 'none');
    $('#chart_tertiary').css('display', 'none');
    $('#button-chart_tertiary').css('display', 'none');
    $('#table_tertiary').css('display', 'none')


    $('[data-toggle="tooltip"]').tooltip('dispose');
    $('[data-toggle="tooltip"]').tooltip();
    // $('#button-interventions_remove_0').click();
    $('.loader-modal').hide();

    $('#sidenav-parameters').width('100%');

    // $('#button-apply').click();
}
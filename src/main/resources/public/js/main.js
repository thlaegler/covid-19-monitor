var countryDetailsMini;
var countryDateSnapshotsMini;
var currentPerspectiveId;
var snapshots;
var countryDetails;
var countries;
var dateIds;
var firstDateId;
var latestDateId;
var countryRegions;
var snapshotsGroupedByDateId;
var snapshotsGroupedByCountry;
var geoJsonFeatures;

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

const arrayToCountryRegionObject = (array) =>
    array.reduce((obj, item) => {
        obj[item.countryRegion] = item
        return obj
    }, {});

const groupSnapshotsByDateId = (snapshots, dateIds) => {
    var snapshotsGroupedByDateId = {};
    dateIds.forEach(dateId => {
        snapshotsGroupedByDateId[dateId] = snapshots.filter(snap => snap.dateId == dateId);
    });
    return snapshotsGroupedByDateId;
};

const groupSnapshotsByCountry = (snapshots, countryRegions) => {
    var snapshotsGroupedByCountry = {};
    countryRegions.forEach(c => {
        snapshotsGroupedByCountry[c] = snapshots.filter(snap => snap.countryRegion == c);
    });
    return snapshotsGroupedByCountry;
};

const updatePerspective = (perspectiveId) => {
    if(!perspectiveId) {
        perspectiveId = currentPerspectiveId;
    }
    currentPerspectiveId = perspectiveId;
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
        var data = map.getSource('countries')._data;
        var features = data.features.map(f => {
            f.properties.title = perspect.title;
            f.properties.radius = perspect.radius(f.properties);
            f.properties.color = perspect.color(f.properties);
            f.properties.label = perspect.label(f.properties);
            return f;
        });
        data.features = features;
        map.getSource('countries').setData(data);

        // Update Charts
        perspect.makeCharts();

        // TODO: Update Table
    }
}

const constructOverTimeChartArray = (title, selector1, selector2, dateShift) => {
    var overTimeArray = [[''].concat(countryRegions.map(c => c))]
    dateIds.forEach(dateId => {
        var newDateId = dateId;
        if (dateShift && dateShift > 0) {
            var newDateId = incrementDateByDays(dateId, dateShift);
        }
        var row = [newDateId];
        countryRegions.forEach(c => {
            if (snapshotsGroupedByDateId[dateId]) {
                var result = snapshotsGroupedByDateId[dateId].filter(snap => snap.countryRegion == c).map(snap => {
                    return (snap[selector1]) ? (selector2 ? snap[selector1][selector2] : snap[selector1]) : 0.0;
                })[0];
                row.push(result ? result : 0.0);
            } else {
                row.push(0.0);
            }
        });
        overTimeArray.push(row);
    });
    return overTimeArray;
}

const constructLatestChartArray = (title, selector1, selector2) => {
    var latestArray = [['Country', title]];
    if (selector1 == 'countryDetail') {
        countryDetails.forEach(ct => latestArray.push([ct.countryRegion, ct[selector2]]));
    } else {
        if (snapshotsGroupedByDateId[latestDateId]) {
            var snaps = snapshotsGroupedByDateId[latestDateId];
            snaps.forEach(snap => latestArray.push([snap.countryRegion, selector2 ? (snap[selector1] ? snap[selector1][selector2] : 0) : snap[selector1]]));
        }
    }
    latestArray.sort(function (a, b) { return b[1] - a[1] });
    return latestArray;
};

const buildGeojsonFeature = (snap, country) => {
    if (country.location) {
        return {
            id: snap.id,
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [country.location.lon, country.location.lat],
            },
            properties: {
                id: country.countryRegion,
                label: '',
                color: '#ffffff',
                radius: 0.0,
                source: country.source + ',' + snap.source,
                dateId: snap.dateId,
                countryRegion: country.countryRegion,
                mortalityRate: snap.mortalityRate,
                recoveryRate: snap.recoveryRate,
                incidencePer100k: snap.incidencePer100k,
                immunizationRate: snap.immunizationRate,

                // COUNTRY / POPULATION
                populationAbsolute: country ? country.populationAbsolute : undefined,
                populationDensity: country ? (country.populationDensity) : undefined,
                urbanPopulation: country ? (country.urbanPopulation) : undefined,
                populationNetChange: country ? country.populationNetChange : undefined,
                landArea: country ? (country.landArea) : undefined,
                migrants: country ? country.migrants : undefined,
                populationMedianAge: country ? (country.populationMedianAge) : undefined,
                populationChangeYearly: country ? (country.populationChangeYearly) : undefined,
                fertilityRate: country ? (country.fertilityRate) : undefined,
                populationWorldShare: country ? (country.populationWorldShare) : undefined,
                acuteCareBeds: country ? (country.acuteCareBeds) : undefined,
                acuteCareBedsPer100k: country ? (country.acuteCareBedsPer100k) : undefined,
                criticalCareBeds: country ? (country.criticalCareBeds) : undefined,
                criticalCareBedsPer100k: country ? (country.criticalCareBedsPer100k) : undefined,
                criticalCareAcuteCareBedRatio: country ? (country.criticalCareAcuteCareBedRatio) : undefined,
                gdpAbsolute: country ? (country.gdpAbsolute) : undefined,
                gdpPerCapita: country ? (country.gdpPerCapita) : undefined,
                healthExpenditureOfGdp: country ? (country.healthExpenditureOfGdp) : undefined,
                healthExpenditurePerCapita: country ? (country.healthExpenditurePerCapita) : undefined,
                populationOver65: country ? (country.populationOver65) : undefined,
                populationOver65Ratio: country ? (country.populationOver65Ratio) : undefined,

                // CONFIRMED
                confirmedValue: snap.confirmed.value,
                confirmedValue24Hours: snap.confirmed.value24HoursAgo,
                confirmedValue7Days: snap.confirmed.value7DaysAgo,
                confirmedDelta24Hours: snap.confirmed.delta24Hours,
                confirmedDelta7Days: snap.confirmed.delta7Days,
                confirmedGrowthRateLast24Hours: snap.confirmed.growthRateLast24Hours,
                confirmedGrowthRateLast7Days: snap.confirmed.growthRateLast7Days,

                // REOVERED
                recoveredValue: snap.recovered.value,
                recoveredValue24Hours: snap.recovered.value24HoursAgo,
                recoveredValue7Days: snap.recovered.value7DaysAgo,
                recoveredDelta24Hours: snap.recovered.delta24Hours,
                recoveredDelta7Days: snap.recovered.delta7Days,
                recoveredGrowthRateLast24Hours: snap.recovered.growthRateLast24Hours,
                recoveredGrowthRateLast7Days: snap.recovered.growthRateLast7Days,

                // DEATH
                deathValue: snap.death.value,
                deathValue24Hours: snap.death.value24HoursAgo,
                deathValue7Days: snap.death.value7DaysAgo,
                deathDelta24Hours: snap.death.delta24Hours,
                deathDelta7Days: snap.death.delta7Days,
                deathGrowthRateLast24Hours: snap.death.growthRateLast24Hours,
                deathGrowthRateLast7Days: snap.death.growthRateLast7Days,

                // CALUCLATED
                calculatedAcuteCareAbsolute: snap.calculatedAcuteCareAbsolute,
                calculatedAcuteCarePer100k: snap.calculatedAcuteCarePer100k,
                calculatedAcuteCareBedUtilization: snap.calculatedAcuteCareBedUtilization,
                calculatedCriticalCareAbsolute: snap.calculatedCriticalCareAbsolute,
                calculatedCriticalCarePer100k: snap.calculatedCriticalCarePer100k,
                calculatedCriticalCareBedUtilization: snap.calculatedCriticalCareBedUtilization,
                calculatedConfirmedCases24Hours: snap.calculatedConfirmedCases24Hours,
                calculatedConfirmedIncidencePer100k24Hours: snap.calculatedConfirmedIncidencePer100k24Hours,
                calculatedConfirmedCases24HoursDelta: snap.calculatedConfirmedCases24HoursDelta,
                calculatedConfirmedCases7Days: snap.calculatedConfirmedCases7Days,
                calculatedConfirmedIncidencePer100k7Days: snap.calculatedConfirmedIncidencePer100k7Days,
                calculatedConfirmedCases7DaysDelta: snap.calculatedConfirmedCases7DaysDelta,
            },
        }
    }
};
const handleGraphQlResponse = async (response, handler) => {
    if (response && response.countryDetails && response.countryDetails.length > 0 && response.countryDateSnapshots && response.countryDateSnapshots.length > 0) {
        countryDetails = response.countryDetails;
        var additionalAcuteCareRate = $('#input-acute_care_additional_rate').val() || 0;
        var additionalCriticalCareRate = $('#input-critical_care_additional_rate').val() || 0;

        if (additionalAcuteCareRate != 0 || additionalCriticalCareRate != 0) {
            countryDetails = countryDetails.map(c => {
                c.acuteCareBeds = c.acuteCareBeds + (c.acuteCareBeds * (additionalAcuteCareRate / 100));
                c.acuteCareBedsPer100k = c.acuteCareBedsPer100k + (c.acuteCareBedsPer100k * (additionalAcuteCareRate / 100));
                c.criticalCareBeds = c.criticalCareBeds + (c.criticalCareBeds * (additionalCriticalCareRate / 100));
                c.criticalCareBedsPer100k = c.criticalCareBedsPer100k + (c.criticalCareBedsPer100k * (additionalCriticalCareRate / 100));
                return c;
            });
        }
        countryDetails.sort(function (a, b) { return b.countryRegion - a.countryRegion });
        countries = arrayToCountryRegionObject(countryDetails);
        snapshots = response.countryDateSnapshots;
        snapshots.map(snap => {
            if (snap.confirmed) {
                // Apply undetected factor
                var undetectedFactor = parseFloat($('#input-estimated_undetected_factor').val());
                snap.confirmed.value = snap.confirmed.value * (1 + undetectedFactor);
                snap.mortalityRate = snap.mortalityRate / (1 + undetectedFactor);
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
                snap.calculatedAcuteCarePer100k = snap.calculatedAcuteCareAbsolute / (countries[snap.countryRegion].populationAbsolute / 100000);
                snap.calculatedAcuteCareBedUtilization = (snap.calculatedAcuteCarePer100k / countries[snap.countryRegion].acuteCareBedsPer100k) * 100;

                snap.calculatedCriticalCareAbsolute = ((snap.confirmed.value - snap.confirmed.delta7Days) - (recovered - recovered7Delta) - (death - death7Delta)) * ($('#input-critical_care_rate').val() / 100);
                snap.calculatedCriticalCareAbsolute = (snap.calculatedCriticalCareAbsolute < 0) ? 0 : snap.calculatedCriticalCareAbsolute;
                snap.calculatedCriticalCarePer100k = snap.calculatedCriticalCareAbsolute / (countries[snap.countryRegion].populationAbsolute / 100000);
                snap.calculatedCriticalCareBedUtilization = (snap.calculatedCriticalCarePer100k / countries[snap.countryRegion].criticalCareBedsPer100k) * 100;

                // Forecast
                var growthRate24 = parseFloat(snap.confirmed.growthRateLast24Hours);
                var growthRate7 = parseFloat(snap.confirmed.growthRateLast7Days);
                if ($('#input-reproduction_rate').val() && $('#input-reproduction_rate').val() != '') {
                    growthRate24 = parseFloat($('#input-reproduction_rate').val());
                    growthRate7 = Math.pow((parseFloat($('#input-reproduction_rate')) / 100) + 1, 7);
                }
                snap.calculatedConfirmedCases24Hours = snap.confirmed.value * Math.pow((growthRate24 / 100) + 1, 1);
                snap.calculatedConfirmedIncidencePer100k24Hours = snap.incidencePer100k * Math.pow((growthRate24 / 100) + 1, 1);
                snap.calculatedConfirmedCases24HoursDelta = snap.calculatedConfirmedCases24Hours - snap.confirmed.value;
                snap.calculatedConfirmedCases7Days = snap.confirmed.value * Math.pow((growthRate7 / 100) + 1, 1);
                snap.calculatedConfirmedCases7DaysDelta = snap.calculatedConfirmedCases7Days - snap.confirmed.value;
                snap.calculatedConfirmedIncidencePer100k7Days = snap.incidencePer100k * Math.pow((growthRate7 / 100) + 1, 1);
            }
        });
        snapshots.sort(function (a, b) { return b.countryRegion - a.countryRegion });
        dateIds = Array.from(new Set(snapshots.map(snap => snap.dateId)));
        dateIds.sort(function (a, b) { return b - a });
        firstDateId = dateIds[0];
        latestDateId = dateIds[dateIds.length - 1];
        countryRegions = Array.from(new Set(snapshots.map(snap => snap.countryRegion)));
        countryRegions.sort(function (a, b) { return b.countryRegion - a.countryRegion });
        snapshotsGroupedByDateId = groupSnapshotsByDateId(snapshots, dateIds);
        snapshotsGroupedByCountry = groupSnapshotsByCountry(snapshots, countryRegions);
        geoJsonFeatures = snapshotsGroupedByDateId[latestDateId].map(snap => buildGeojsonFeature(snap, countryDetails.filter(c => c.countryRegion == snap.countryRegion)[0]));
        updateGeoJsonCircle({
            id: 'countries',
            type: 'FeatureCollection',
            features: geoJsonFeatures,
        });

        updatePerspective('confirmed_absolute');
        // Simulation input fields
        var simulationCountry = $('#input-country').val();
        var simulationCountrySnaps = snapshotsGroupedByCountry[simulationCountry];
        if (simulationCountrySnaps) {
            $('#input-reproduction_rate').val(parseFloat(simulationCountrySnaps[simulationCountrySnaps.length - 1].confirmed.growthRateLast24Hours).toFixed(2));
        }
    }
    $('.loader-modal').hide();
}

const getCountriesMini = () => {
    var variables = {
        request: {
            orderBy: 'countryRegion',
            orderDirection: 'ASC',
        }
    }
    queryOrMutateGraphQl('countryDetails', queryCountryDetailsMini(), variables, countryDetails => updateCountryDetails(countryDetails), $('#inputBaseUrl').val(), '');
}

//'Luxembourg', 'Liechtenstein', 'Monaco', 'Andorra', 
const focusCountries = ['United States', 'China', 'France', 'Iceland', 'Israel', 'Turkey', 'Malaysia', 'Indonesia', 'Sri Lanka', 'India', 'Singapore', 'Saudi Arabia', 'Philippines', 'Canada', 'Germany', 'Spain', 'Iran', 'Italy', 'Switzerland', 'South Korea', 'Austria', 'Sweden', 'Russia', 'Denmark', 'Taiwan', 'Japan', 'New Zealand', 'Brazil', 'Thailand', 'Austria', 'Netherlands', 'Australia', 'United Kingdom']
const updateCountryDetails = (countryDetails) => {
    countryDetailsMini = countryDetails;
    countryDetails.forEach(c => {
        var selected = focusCountries.includes(c.countryRegion) ? ' selected' : '';
        $('#input-countries').append('<option value="' + c.id + '" ' + selected + '>' + c.countryRegion + '</option>');
        var selected2 = c.countryRegion == 'United States' ? ' selected' : '';
        $('#input-country').append('<option value="' + c.id + '" ' + selected2 + '>' + c.countryRegion + '</option>');
    });
    // $('#input-country').change();
    if (countryDateSnapshotsMini) {
        apply();
    }
};

const getDateIdsMini = () => {
    var variables = {
        request: {
            countryRegion: 'Germany',
            orderBy: 'dateId',
            orderDirection: 'ASC',
        }
    }
    queryOrMutateGraphQl('countryDateSnapshots', queryDateIdsMini(), variables, countryDateSnapshots => updateDateIds(countryDateSnapshots), $('#inputBaseUrl').val(), '');
}

const focusDateIds = ['2020-03-01', '2020-03-02', '2020-03-03', '2020-03-04', '2020-03-05', '2020-03-06', '2020-03-07', '2020-03-08', '2020-03-09', '2020-03-10', '2020-03-11', '2020-03-12', '2020-03-13', '2020-03-14', '2020-03-15', '2020-03-16', '2020-03-17', '2020-03-18', '2020-03-19', '2020-03-20', '2020-03-21', '2020-03-22', '2020-03-23', '2020-03-24', '2020-03-25', '2020-03-26', '2020-03-27', '2020-03-28', '2020-03-29', '2020-03-30', '2020-03-31', '2020-04-01', '2020-04-02', '2020-04-03', '2020-04-04', '2020-04-05', '2020-04-06', '2020-04-07', '2020-04-08', '2020-04-09', '2020-04-10', '2020-04-11', '2020-04-12', '2020-04-13', '2020-04-14'];
const updateDateIds = (countryDateSnapshots) => {
    countryDateSnapshotsMini = countryDateSnapshots;
    var size = countryDateSnapshots.length;
    var i = 0;
    countryDateSnapshots.forEach(snap => {
        i++;
        var selected = i == size || focusDateIds.includes(snap.dateId) ? ' selected' : '';
        $('#input-dateIds').append('<option value="' + snap.dateId + '" ' + selected + '>' + snap.dateId + '</option>');
        $('#input-start_dateId').append('<option value="' + snap.dateId + '" ' + selected + '>' + snap.dateId + '</option>');
    });
    if (countryDetailsMini) {
        apply();
    }
    updateTimeAgo(countryDateSnapshotsMini[countryDateSnapshotsMini.length - 1].importDate);
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

function simulate() {
    $('.loader-modal').show();
    closeSidenav();

    // Form input values
    var selectedCountryName = $('#input-country').val();
    var startDateId = $('#input-start_dateId').val();
    var retentionDays = parseFloat($('#input-retention_days').val()) || 7;
    var mortalityRate = parseFloat($('#input-mortality_rate').val()) || 1;
    mortalityRate = mortalityRate / 100;
    var reproductionRate = parseFloat($('#input-reproduction_rate').val());
    var herdImmunityRate = parseFloat($('#input-herd_immunity_rate').val()) || 70;
    var simulationHorizon = parseFloat($('#input-simulation_horizon').val()) || 100;
    var acuteCaseRate = $('#input-acute_care_rate').val() / 100;
    var criticalCaseRate = $('#input-critical_care_rate').val() / 100;
    var acuteCareAdditionalRate = $('#input-acute_care_additional_rate').val();
    acuteCareAdditionalRate = 1 + (acuteCareAdditionalRate / 100);
    var criticalCareAdditionalRate = $('#input-critical_care_additional_rate').val();
    criticalCareAdditionalRate = 1 + (criticalCareAdditionalRate / 100);

    if (startDateId && startDateId != '' && selectedCountryName && selectedCountryName != '') {
        var selectedCountry = countries[selectedCountryName];
        var snaps = snapshotsGroupedByCountry[selectedCountryName];
        var startSimulationSnap = snaps.filter(c => c.dateId == startDateId)[0];
        if (!reproductionRate || reproductionRate == '' || reproductionRate == 0) {
            reproductionRate = startSimulationSnap.confirmed.growthRateLast24Hours;
        }
        herdImmunityRate = (herdImmunityRate / 100);
        reproductionRate = (reproductionRate / 100);

        // Ramp up last 14 days
        var rampUpDate = new Date(startSimulationSnap.dateId);
        rampUpDate.setDate(rampUpDate.getDate() - 14);
        var rampUpEndDate = new Date(startDateId);
        var simulationValueArray = [];
        for (var rampUpDateIterate = rampUpDate; rampUpDateIterate <= rampUpEndDate; rampUpDateIterate.setDate(rampUpDateIterate.getDate() + 1)) {
            var dateId = rampUpDateIterate.toISOString().substring(0, 10);
            var snap = snaps.filter(c => c.dateId == dateId)[0];
            if (snap) {
                var infectious = snap.confirmed.value - snap.recovered.value - snap.death.value;
                var infectiousDelta = snap.confirmed.delta24Hours - snap.recovered.delta24Hours - snap.death.delta24Hours;
                simulationValueArray.push({
                    dateId: dateId,
                    acuteCareCases: snap.calculatedAcuteCareAbsolute,
                    criticalCareCases: snap.calculatedCriticalCareAbsolute,
                    confirmed: snap.confirmed.value,
                    confirmedDelta: snap.confirmed.delta24Hours,
                    recovered: snap.recovered.value,
                    recoveredDelta: snap.recovered.delta24Hours,
                    deceased: snap.death.value,
                    deceasedDelta: snap.death.delta24Hours,
                    infectious: infectious,
                    infectiousDelta: infectiousDelta,
                    suspectible: selectedCountry.populationAbsolute - snap.confirmed.value,
                });
            } else {
                simulationValueArray.push(
                    {
                        dateId: dateId,
                        acuteCareCapacity: selectedCountry.acuteCareBeds,
                        criticalCareCapacity: selectedCountry.criticalCareBeds,
                    });
            }
        }

        var endDate = new Date(startSimulationSnap.dateId);
        endDate.setDate(endDate.getDate() + simulationHorizon);
        var endDateId = endDate.toISOString().substring(0, 10);
        var i = simulationValueArray.length;

        // Iterate Simulation Horizon
        rampUpEndDate.setDate(rampUpEndDate.getDate() + 1);
        for (var currentDate = rampUpEndDate; currentDate <= endDate; currentDate.setDate(currentDate.getDate() + 1)) {
            var dateId = currentDate.toISOString().substring(0, 10);
            var previous = simulationValueArray[i - 1];
            var weekAgo = simulationValueArray[i - retentionDays];
            var herdFactor = (1 - ((previous.confirmed / selectedCountry.populationAbsolute) * herdImmunityRate)) / 1;

            var confirmedDelta = previous.infectious * reproductionRate * herdFactor;
            var recoveredDelta = weekAgo.confirmedDelta * (1 - mortalityRate);
            var deceasedDelta = weekAgo.confirmedDelta * mortalityRate;
            var infectiousDelta = confirmedDelta - recoveredDelta - deceasedDelta;
            var infectious = (previous.infectious + infectiousDelta) > 0 ? (previous.infectious + infectiousDelta) : 0;

            simulationValueArray.push({
                dateId: dateId,
                acuteCareCases: (previous.infectious + infectiousDelta) * acuteCaseRate,
                criticalCareCases: (previous.infectious + infectiousDelta) * criticalCaseRate,
                confirmed: previous.confirmed + confirmedDelta,
                confirmedDelta: confirmedDelta,
                recovered: previous.recovered + recoveredDelta,
                recoveredDelta: recoveredDelta,
                deceased: previous.deceased + deceasedDelta,
                deceasedDelta: deceasedDelta,
                infectious: infectious,
                infectiousDelta: infectiousDelta,
                suspectible: selectedCountry.populationAbsolute - (previous.confirmed + confirmedDelta),
            });
            i++;
        }

        var title = 'over next ' + simulationHorizon + ' days for ' + selectedCountryName + ' (' + startDateId + ' - ' + endDateId + '; assumed daily growth rate: ' + parseFloat(reproductionRate * 100).toFixed(2) + '%)';
        $('#details-title').html('Simulation of Acute & Critical/Intensive Care Cases ' + title);

        var acuteArray = [['Date', 'Optimisitc Acute Care Capacity', 'Acute Care Capacity', 'Acute Care Cases']].concat(simulationValueArray.map(elem => [elem.dateId, Math.round(selectedCountry.acuteCareBeds * acuteCareAdditionalRate * 1.05), Math.round(selectedCountry.acuteCareBeds), Math.round(elem.acuteCareCases)]));
        var criticalArray = [['Date', 'Optimisitc Critical/Intensive Care Capacity', 'Critical/Intensive Care Capacity', 'Critical/Intensive Care Cases']].concat(simulationValueArray.map(elem => [elem.dateId, Math.round(selectedCountry.criticalCareBeds * criticalCareAdditionalRate * 1.05), Math.round(selectedCountry.criticalCareBeds), Math.round(elem.criticalCareCases)]));
        var casesArray = [['Date', 'Confirmed', 'Recovered', 'Deceased', 'Infectious', 'Suspectible']].concat(simulationValueArray.map(elem => [elem.dateId, Math.round(elem.confirmed), Math.round(elem.recovered), Math.round(elem.deceased), Math.round(elem.infectious), Math.round(elem.suspectible)]));

        drawChart(google.visualization.arrayToDataTable(criticalArray), new google.visualization.LineChart(document.getElementById('chart_over_time')), 'Simulation of Critical Cases ' + title);
        drawChart(google.visualization.arrayToDataTable(acuteArray), new google.visualization.LineChart(document.getElementById('chart_latest')), 'Simulation of Acute Cases ' + title);
        drawChart(google.visualization.arrayToDataTable(casesArray), new google.visualization.LineChart(document.getElementById('chart_tertiary')), 'Simulation of Cases ' + title);
    }
    $('.loader-modal').hide();
}

function apply() {
    $('.loader-modal').show();
    closeSidenav();
    var countries = $('#input-countries').val().filter(co => co && co != '').join(',');
    var dates = $('#input-dateIds').val().filter(da => da && da != '').join(',');
    var variables = {
        request: {
            countryRegion: countries,
            dateId: dates,
            orderBy: 'dateId',
            orderDirection: 'ASC',
        }
    }
    // $('#details-title').html(originalTitle);
    $('#details-countries').html(countries);
    $('#details-dates').html(dates);
    queryOrMutateGraphQl(undefined, queryCountryDateSnapshots($('#checkbox-confirmed').prop("checked"), $('#checkbox-recovered').prop("checked"), $('#checkbox-deceased').prop("checked")), variables, messages => handleGraphQlResponse(messages, 'selectLayer-confirmed-absolute'), $('#inputBaseUrl').val(), '');
}
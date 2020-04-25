const defaultSimulationRequest = () => {
    return {
        initialPopulation: 83000000,
        initialDate: new Date().toISOString().substring(0, 10),
        initialLatent: 1,
        initialInfectious: 0,
        initialRecovered: 0,
        initialDeceased: 0,
        country: 'Germany',
        simulationDuration: 365,
        baseReproductionNumber: 3.3,
        caseFatalityRisk: 0.01,
        infectionFatalityRate: 1.0,
        criticalCareRate: 0.05,
        acuteCareRate: 0.15,
        latentDuration: 5,
        infectiousDuration: 14,
        interventions: [],
    };
};

const isInDateRange = (date, start, end) => {
    return (
        isFinite(date) &&
            isFinite(start) &&
            isFinite(end) ?
            start <= date && date <= end :
            NaN
    );
}

/**
 * SEIR Simulation Model: S -> E -> I -> [ R | D ]
 * @param {*} simulationRequest 
 */
const buildSimulationData = (simulationRequest) => {
    var simulationData = [];

    var currentCountryName = simulationRequest.country;
    var currentCountry = allCountries[currentCountryName];
    var criticalCareUntreatedFatalityRisk = $('#input-critical_care_untreated_fatality_risk').val() || 0.12;
    var criticalCareHospitalizationRate = ($('#input-critical_care_rate').val() / 100);
    var acuteCareUntreatedFatalityRisk = $('#input-acute_care_untreated_fatality_risk').val() || 0.05;
    var acuteCareHospitalizationRate = ($('#input-acute_care_rate').val() / 100);

    var beta = simulationRequest.baseReproductionNumber / simulationRequest.infectiousDuration; // S->E
    var alpha = 1 / simulationRequest.latentDuration; // E->I
    var gamma = (1 / simulationRequest.infectiousDuration) * (1 - simulationRequest.caseFatalityRisk); // I->R
    var theta = (1 / simulationRequest.infectiousDuration) * simulationRequest.caseFatalityRisk; // I->D

    var t = 0;
    var startDateId = incrementDateByDays(simulationRequest.initialDate, 1);
    var startDate = new Date(startDateId);
    simulationData.push({
        t: t,
        dateId: startDateId,
        country: simulationRequest.country,
        E: simulationRequest.initialLatent,
        I: simulationRequest.initialInfectious,
        R: simulationRequest.initialRecovered,
        D: simulationRequest.initialDeceased,
        S: simulationRequest.initialPopulation - simulationRequest.initialLatent - simulationRequest.initialInfectious - simulationRequest.initialRecovered - simulationRequest.initialDeceased,
        D_overload: simulationRequest.initialDeceased,
        intervention: -1,
    });

    var endDate = new Date();
    endDate.setDate(startDate.getDate() + simulationRequest.simulationDuration);

    t++;
    for (var dateIterate = startDate; dateIterate <= endDate; dateIterate.setDate(dateIterate.getDate() + 1)) {
        var previousData = simulationData[t - 1];
        var intervention = -1;

        var baseReproductionNumber = simulationRequest.baseReproductionNumber;
        if (simulationRequest.interventions && simulationRequest.interventions.length > 0) {
            var currentInterventions = simulationRequest.interventions.filter(i => isInDateRange(dateIterate, new Date(i.startDate), new Date(i.endDate)));
            if (currentInterventions && currentInterventions.length >= 1) {
                baseReproductionNumber = currentInterventions[0].baseReproductionNumber;
                intervention = currentInterventions[0].intervention;
            }
        }
        beta = baseReproductionNumber / simulationRequest.infectiousDuration; // S->E

        var dE = ((previousData.S / simulationRequest.initialPopulation) * previousData.I * beta) - (previousData.E * alpha);
        var dI = previousData.E * alpha - (previousData.I * (gamma + theta));
        var dR = previousData.I * gamma;
        var dD = previousData.I * theta;
        var dS = (-1) * (previousData.S / simulationRequest.initialPopulation) * previousData.I * beta;

        var criticalCareOverload = (((previousData.I + dI) * criticalCareHospitalizationRate) - currentCountry.criticalCareBedsAbsolute) * criticalCareUntreatedFatalityRisk;
        var acuteCareOverload = (((previousData.I + dI) * acuteCareHospitalizationRate) - currentCountry.acuteCareBedsAbsolute) * acuteCareUntreatedFatalityRisk;
        var dD_overload = dD + (criticalCareOverload > 0 ? criticalCareOverload : 0) + (acuteCareOverload > 0 ? acuteCareOverload : 0);

        simulationData.push({
            t: t,
            dateId: dateIterate.toISOString().substring(0, 10),
            country: simulationRequest.country,
            E: previousData.E + dE,
            I: previousData.I + dI,
            R: previousData.R + dR,
            D: previousData.D + dD,
            S: previousData.S + dS,
            D_overload: previousData.D_overload + dD_overload,
            intervention: intervention,
        });
        console.log('Simulated ' + dateIterate.toISOString().substring(0, 10));
        t++;
    }

    return simulationData;
};

const updateMap = (data) => { };

const updateChart = (simulationData) => {
    var currentCountryName = simulationData[0].country;
    var currentCountry = allCountries[currentCountryName];
    var countrySnaps = allSnapshotsByCountry[currentCountryName];
    var latentDuration = $('#input-latent_duration').val() || 5.5;
    var isLogScale = $('#input-log_scale').prop('checked');
    var withRecovered = $('#input-with_suspectible_and_recovered').prop('checked');

    var infs = simulationData.map(s => s.I);
    var maxInf = Math.max(...infs);
    var simulationDataByDate = arrayToObjects(simulationData, 'dateId');

    var seirDataArray = [['Date', 'Suspectible (Simulation)', 'Exposed/Latent (Simulation)', 'Infectious (Simulation)', 'Recovered (Simulation)', 'Deceased (Simulation)', 'Deceased (Simulation, incl. Capacity Exceedance)', 'Suspectible (Actual)', 'Exposed/Latent (Estimated)', 'Infectious (Actual)', 'Recovered (Actual)', 'Deceased (Actual)', 'Interventions', { type: 'string', role: 'style' }]];
    seirDataArray = seirDataArray.concat(Object.values(allDates)
        // .filter(d => d.dateId != latestDateId)
        .map(d => {
            var snap = countrySnaps[d.dateId];
            var result = [d.dateId];
            var sim = simulationDataByDate[d.dateId];
            if (sim) {
                result = result.concat([withRecovered ? Math.floor(sim.S) : 0, Math.floor(sim.E), Math.floor(sim.I), withRecovered ? Math.floot(sim.R) : 0, Math.floor(sim.D), Math.floor(sim.D_overload)]);
            } else {
                result = result.concat([undefined, undefined, undefined, undefined, undefined, undefined]);
            }
            if (snap) {
                var s = Math.floor(currentCountry.populationAbsolute - snap.infectious);
                var e = Math.floor(snap.confirmedDelta * latentDuration);
                var i = Math.floor(snap.infectious);
                var r = Math.floor(snap.recovered);
                var de = Math.floor(snap.deceased);
                result = result.concat([withRecovered ? s : 0, e, i, withRecovered ? r : 0, de, maxInf, (sim && sim.intervention >= 0 ? 'color: pink;' : 'opacity: 0.0;')]);
            } else {
                result = result.concat([undefined, undefined, undefined, undefined, undefined, maxInf, (sim && sim.intervention >= 0 ? 'color: pink;' : 'opacity: 0.0;')]);
            }
            return result;
        }));
    // seirDataArray = seirDataArray.concat(simulationData.map(data => [data.dateId, Math.floor(data.S), Math.floor(data.E), Math.floor(data.I), Math.floor(data.R), Math.floor(data.D), undefined, undefined, undefined, undefined, undefined]));
    seirDataArray = seirDataArray.concat(simulationData.filter(data => data.dateId > latestDateId).map(data => {
        return [data.dateId, withRecovered ? Math.floor(data.S) : 0, Math.floor(data.E), Math.floor(data.I), withRecovered ? Math.floor(data.R) : 0, Math.floor(data.D), Math.floor(data.D_overload), undefined, undefined, undefined, undefined, undefined, maxInf, (data.intervention >= 0 ? 'color: pink;' : 'opacity: 0.0;')];
    }));
    drawChart(
        google.visualization.arrayToDataTable(seirDataArray),
        new google.visualization.ComboChart(document.getElementById('chart_over_time')),
        'SEIR-Model with R₀=' + $('#input-base_reproduction_number').val(),
        isLogScale ? { vAxis: { scaleType: 'log' } } : {
            seriesType: 'line',
            series: { 11: { type: 'area' } }
        });

    var criticalCareArray = [['Date', 'Critical Care Cases', 'Critical Care Capacity']]
        .concat(simulationData.map(data => [data.dateId, Math.floor(data.I * ($('#input-critical_care_rate').val() / 100)), currentCountry.criticalCareBedsAbsolute]));
    drawChart(
        google.visualization.arrayToDataTable(criticalCareArray),
        new google.visualization.LineChart(document.getElementById('chart_latest')),
        'Critical Care Utilization',
        isLogScale ? { vAxis: { scaleType: 'log' } } : {});

    var acuteCareArray = [['Date', 'Acute Care Cases', 'Acute Care Capacity']]
        // .concat(Object.values(allSnapshotsByCountry[currentCountryName]).map(snap => [snap.dateId, undefined, snap.confirmed - snap.recovered - snap.deceased, currentCountry.acuteCareBedsAbsolute]))
        .concat(simulationData.map(data => [data.dateId, Math.floor(data.I * ($('#input-acute_care_rate').val() / 100)), currentCountry.acuteCareBedsAbsolute]));
    drawChart(
        google.visualization.arrayToDataTable(acuteCareArray),
        new google.visualization.LineChart(document.getElementById('chart_tertiary')),
        'Acute Care Utilization',
        isLogScale ? { vAxis: { scaleType: 'log' } } : {});
};

const updateTable = (data) => { };

const doSimulate = () => {
    closeSidenav();
    window.scrollTo(0, 0);

    var simulationRequest = defaultSimulationRequest();
    simulationRequest.country = $('#input-simulation_country').val();
    simulationRequest.initialDate = $('#input-simulation_start_dateId').val();
    simulationRequest.simulationDuration = Number($('#input-simulation_horizon').val());
    simulationRequest.latentDuration = Number($('#input-latent_duration').val());
    simulationRequest.infectiousDuration = Number($('#input-infectious_duration').val());
    simulationRequest.baseReproductionNumber = Number($('#input-base_reproduction_number').val());
    simulationRequest.caseFatalityRisk = Number($('#input-case_fatality_risk').val()) / 100;

    simulationRequest.initialPopulation = Number($('#input-total_population').val());
    simulationRequest.initialLatent = Number($('#input-initial_latent').val() || 1);
    simulationRequest.initialInfectious = Number($('#input-initial_infectious').val() || 1);
    simulationRequest.initialRecovered = Number($('#input-initial_recovered').val() || 0);
    simulationRequest.initialDeceased = Number($('#input-initial_deceased').val() || 0);

    var nestedForms = $('.nested-form');
    // var interventionsNested = nestedForms.is(':visible');
    jQuery.each(nestedForms, (index, domElem) => {
        var element = $(domElem);
        var ids = element.find('.button-interventions_remove').attr('id').split('_');
        var id = ids[ids.length - 1];
        simulationRequest.interventions.push({
            intervention: id,
            baseReproductionNumber: Number(element.find('#input-interventions_base_reproduction_number_' + id).val()),
            startDate: element.find('#input-interventions_start_date_' + id).val(),
            endDate: element.find('#input-interventions_end_date_' + id).val(),
        });
    });
    // if (interventionsNested && nestedForms.length > 0) {
    //     for (var j = 0; j < $('.nested-form').length; j++) {
    //         simulationRequest.interventions.push({
    //             intervention: j,
    //             baseReproductionNumber: Number($('#input-interventions_base_reproduction_number_' + j).val()),
    //             startDate: $('#input-interventions_start_date_' + j).val(),
    //             endDate: $('#input-interventions_end_date_' + j).val(),
    //         });
    //     }
    // }
    var simulationData = buildSimulationData(simulationRequest);

    updateMap(simulationData);
    updateChart(simulationData);
    updateTable(simulationData);

    $('#details-title').html('Simulation for ' + simulationRequest.country + ' starting from ' + simulationRequest.initialDate + ' over next ' + simulationRequest.simulationDuration + ' Days');
    $('#details-description').html('SEIR Simulation for ' + simulationRequest.country + ' using Base Reproduction Number R₀=' + simulationRequest.baseReproductionNumber);
};
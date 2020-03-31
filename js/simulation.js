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

    var beta = simulationRequest.baseReproductionNumber / simulationRequest.infectiousDuration; // S->E
    var alpha = 1 / simulationRequest.latentDuration; // E->I
    var gamma = (1 / simulationRequest.infectiousDuration) * (1 - simulationRequest.caseFatalityRisk); // I->R
    var theta = (1 / simulationRequest.infectiousDuration) * simulationRequest.caseFatalityRisk; // I->D

    var t = 0;
    var startDate = new Date(simulationRequest.initialDate);
    simulationData.push({
        t: t,
        date: simulationRequest.initialDate,
        E: simulationRequest.initialLatent,
        I: simulationRequest.initialInfectious,
        R: simulationRequest.initialRecovered,
        D: simulationRequest.initialDeceased,
        S: simulationRequest.initialPopulation - simulationRequest.initialLatent - simulationRequest.initialInfectious - simulationRequest.initialRecovered - simulationRequest.initialDeceased,
    });
    startDate.setDate(startDate.getDate() + 1);

    var endDate = new Date();
    endDate.setDate(startDate.getDate() + simulationRequest.simulationDuration);

    t++;
    for (var dateIterate = startDate; dateIterate <= endDate; dateIterate.setDate(dateIterate.getDate() + 1)) {
        var previousData = simulationData[t - 1];

        var baseReproductionNumber = simulationRequest.baseReproductionNumber;
        if (simulationRequest.interventions && simulationRequest.interventions.length > 0) {
            var currentInterventions = simulationRequest.interventions.filter(i => isInDateRange(dateIterate, new Date(i.startDate), new Date(i.endDate)));
            if (currentInterventions && currentInterventions.length >= 1) {
                baseReproductionNumber = currentInterventions[0].baseReproductionNumber;
            }
        }
        beta = baseReproductionNumber / simulationRequest.infectiousDuration; // S->E

        var dE = ((previousData.S / simulationRequest.initialPopulation) * previousData.I * beta) - (previousData.E * alpha);
        var dI = previousData.E * alpha - (previousData.I * (gamma + theta));
        var dR = previousData.I * gamma;
        var dD = previousData.I * theta;
        var dS = (-1) * (previousData.S / simulationRequest.initialPopulation) * previousData.I * beta;

        simulationData.push({
            t: t,
            date: dateIterate.toISOString().substring(0, 10),
            E: previousData.E + dE,
            I: previousData.I + dI,
            R: previousData.R + dR,
            D: previousData.D + dD,
            S: previousData.S + dS,
        });
        console.log('Simulated ' + dateIterate.toISOString().substring(0, 10));
        t++;
    }

    return simulationData;
};

const updateMap = (simulationData) => { };

const updateChart = (simulationData) => {
    var dataArray = [['Date', 'Exposed/Latent', 'Infectious', 'Recovered', 'Deceased']].concat(simulationData.map(data => [data.date, Math.floor(data.E), Math.floor(data.I), Math.floor(data.R), Math.floor(data.D)]));
    // var dataArray = [['Date', 'Suspectible', 'Exposed/Latent', 'Infectious', 'Recovered', 'Deceased']].concat(simulationData.map(data => [data.date, data.S, data.E, data.I, data.R, data.D]));
    drawChart(
        google.visualization.arrayToDataTable(dataArray),
        new google.visualization.LineChart(document.getElementById('chart_over_time')),
        'Title');
};

const updateTable = (simulationData) => { };

const simulate = () => {
    closeSidenav();

    var simulationRequest = defaultSimulationRequest();
    simulationRequest.country = $('#input-country').val();
    simulationRequest.initialDate = $('#input-start_dateId').val() || new Date().toISOString().substring(0, 10);
    simulationRequest.initialPopulation = Number($('#input-total_population').val() || 83000000);
    simulationRequest.simulationDuration = Number($('#input-simulation_horizon').val() || 365);
    simulationRequest.baseReproductionNumber = Number($('#select-base_reproduction_number').val() || 3.3);
    simulationRequest.caseFatalityRisk = Number($('#select-case_fatality_risk').val() || 1.0) / 100;
    simulationRequest.latentDuration = Number($('#input-latent_duration').val() || 5.5);
    simulationRequest.infectiousDuration = Number($('#input-infectious_duration').val() || 10);

    simulationRequest.initialLatent = Number($('#input-initial_latent').val() || 1);
    simulationRequest.initialInfectious = Number($('#input-initial_infectious').val() || 1);
    simulationRequest.initialRecovered = Number($('#input-initial_recovered').val() || 0);
    simulationRequest.initialDeceased = Number($('#input-initial_deceased').val() || 0);

    var interventionsNested = $('.nested-form').is(':visible');
    if (interventionsNested.length > 0) {
        for (var j = 0; j < $('.nested-form').length; j++) {
            simulationRequest.interventions.push({
                baseReproductionNumber: $('#input-interventions_base_reproduction_number_' + j).val(),
                startDate: $('#input-interventions_start_date_' + j).val(),
                endDate: $('#input-interventions_end_date_' + j).val(),
            });
        }
    }
    var simulationData = buildSimulationData(simulationRequest);

    updateMap(simulationData);
    updateChart(simulationData);
    updateTable(simulationData);

    $('#details-title').html('Simulation ' + simulationRequest.country + ' starting from ' + simulationRequest.initialDate + ' for next ' + simulationRequest.simulationDuration + ' days');
};
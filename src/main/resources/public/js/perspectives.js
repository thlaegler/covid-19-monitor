const perspectives = {
    confirmed_absolute: {
        title: 'Absolute Number of Confirmed Cases',
        color: (props) => props.confirmedValue > 10000 ? '#ff0000' : (props.confirmedValue > 3000 ? '#ff6f00' : (props.confirmedValue > 500 ? '#ffcc00' : (props.confirmedValue > 0 ? '#77ff00' : '#bfbfbf'))),
        radius: (props) => makeRadius(props.confirmedValue / 4000),
        label: (props) => props.confirmedValue + ' Cases \n ' + determineSign(props.confirmedDelta24Hours) + props.confirmedDelta24Hours + ' Cases (' + determineSign(props.confirmedGrowthRateLast24Hours) + parseFloat(props.confirmedGrowthRateLast24Hours).toFixed(2) + '%)',
        makeCharts: () => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(perspectives['confirmed_absolute'].title + ' (' + latestDateId + ')', 'confirmed', 'value')), new google.visualization.BarChart(document.getElementById('chart_latest')), perspectives['confirmed_absolute'].title + ' (' + latestDateId + ')');
            drawChart(google.visualization.arrayToDataTable(constructOverTimeChartArray(perspectives['confirmed_absolute'].title + ' (' + firstDateId + ' - ' + latestDateId + ')', 'confirmed', 'value')), new google.visualization.LineChart(document.getElementById('chart_over_time')), perspectives['confirmed_absolute'].title + ' (' + firstDateId + ' - ' + latestDateId + ')'
            // , { vAxis: {scaleType: 'log'}}
            );
        },
    },
    confirmed_growth24Hours: {
        title: 'Growth Rate in % of Confirmed Cases compared to 24 Hours ago',
        color: (props) => (props.confirmedGrowthRateLast24Hours > 100 ? '#ff0000' : (props.confirmedGrowthRateLast24Hours > 50 ? '#ff6f00' : (props.confirmedGrowthRateLast24Hours > 20 ? '#ffcc00' : (props.confirmedGrowthRateLast24Hours > 0 ? '#77ff00' : '#bfbfbf')))),
        radius: (props) => makeRadius(props.confirmedGrowthRateLast24Hours / 2),
        label: (props) => determineSign(props.confirmedGrowthRateLast24Hours) + parseFloat(props.confirmedGrowthRateLast24Hours).toFixed(2) + '% \n ' + determineSign(props.confirmedDelta24Hours) + props.confirmedDelta24Hours + ' Cases',
        makeCharts: () => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(perspectives['confirmed_growth24Hours'].title + ' (' + latestDateId + ')', 'confirmed', 'growthRateLast24Hours')), new google.visualization.BarChart(document.getElementById('chart_latest')), perspectives['confirmed_growth24Hours'].title + ' (' + latestDateId + ')');
            drawChart(google.visualization.arrayToDataTable(constructOverTimeChartArray(perspectives['confirmed_growth24Hours'].title + ' (' + firstDateId + ' - ' + latestDateId + ')', 'confirmed', 'growthRateLast24Hours')), new google.visualization.LineChart(document.getElementById('chart_over_time')), perspectives['confirmed_growth24Hours'].title + ' (' + firstDateId + ' - ' + latestDateId + ')');
        },
    },
    confirmed_delta24Hours: {
        title: 'Delta of Confirmed Cases compared to 24 Hours ago',
        color: (props) => (props.confirmedDelta24Hours > 6000 ? '#ff0000' : (props.confirmedDelta24Hours > 1000 ? '#ff6f00' : (props.confirmedDelta24Hours > 200 ? '#ffcc00' : (props.confirmedDelta24Hours > 0 ? '#77ff00' : '#bfbfbf')))),
        radius: (props) => makeRadius(props.confirmedDelta24Hours / 800),
        label: (props) => '+' + Math.round(props.confirmedDelta24Hours) + ' Cases \n ' + determineSign(props.confirmedGrowthRateLast24Hours) + parseFloat(props.confirmedGrowthRateLast24Hours).toFixed(2) + ' %',
        makeCharts: () => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(perspectives['confirmed_delta24Hours'].title + ' (' + latestDateId + ')', 'confirmed', 'delta24Hours')), new google.visualization.BarChart(document.getElementById('chart_latest')), perspectives['confirmed_delta24Hours'].title + ' (' + latestDateId + ')');
            drawChart(google.visualization.arrayToDataTable(constructOverTimeChartArray(perspectives['confirmed_delta24Hours'].title + ' (' + firstDateId + ' - ' + latestDateId + ')', 'confirmed', 'delta24Hours')), new google.visualization.LineChart(document.getElementById('chart_over_time')), perspectives['confirmed_delta24Hours'].title + ' (' + firstDateId + ' - ' + latestDateId + ')');
        },
    },
    confirmed_growth7Days: {
        title: 'Growth Rate in % of Confirmed Cases compared to 7 Days ago',
        color: (props) => (props.confirmedGrowthRateLast7Days > 500 ? '#ff0000' : (props.confirmedGrowthRateLast7Days > 200 ? '#ff6f00' : (props.confirmedGrowthRateLast7Days > 80 ? '#ffcc00' : (props.confirmedGrowthRateLast7Days > 0 ? '#77ff00' : '#bfbfbf')))),
        radius: (props) => makeRadius(props.confirmedGrowthRateLast7Days / 10),
        label: (props) => determineSign(props.confirmedGrowthRateLast7Days) + parseFloat(props.confirmedGrowthRateLast7Days).toFixed(2) + '% \n ' + determineSign(props.confirmedDelta7Days) + props.confirmedDelta7Days + ' Cases',
        makeCharts: () => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(perspectives['confirmed_growth7Days'].title + ' (' + latestDateId + ')', 'confirmed', 'growthRateLast7Days')), new google.visualization.BarChart(document.getElementById('chart_latest')), perspectives['confirmed_growth7Days'].title + ' (' + latestDateId + ')');
            drawChart(google.visualization.arrayToDataTable(constructOverTimeChartArray(perspectives['confirmed_growth7Days'].title + ' (' + firstDateId + ' - ' + latestDateId + ')', 'confirmed', 'growthRateLast7Days')), new google.visualization.LineChart(document.getElementById('chart_over_time')), perspectives['confirmed_growth7Days'].title + ' (' + firstDateId + ' - ' + latestDateId + ')');
        },
    },
    confirmed_delta7Days: {
        title: 'Delta of Confirmed Cases compared to 7 Days ago',
        color: (props) => (props.confirmedDelta7Days > 60000 ? '#ff0000' : (props.confirmedDelta7Days > 10000 ? '#ff6f00' : (props.confirmedDelta7Days > 2000 ? '#ffcc00' : (props.confirmedDelta7Days > 0 ? '#77ff00' : '#bfbfbf')))),
        radius: (props) => makeRadius(props.confirmedDelta7Days / 4000),
        label: (props) => '+' + Math.round(props.confirmedDelta7Days) + ' Cases \n ' + determineSign(props.confirmedGrowthRateLast7Days) + parseFloat(props.confirmedGrowthRateLast7Days).toFixed(2) + ' %',
        makeCharts: () => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(perspectives['confirmed_delta7Days'].title + ' (' + latestDateId + ')', 'confirmed', 'delta7Days')), new google.visualization.BarChart(document.getElementById('chart_latest')), perspectives['confirmed_delta7Days'].title + ' (' + latestDateId + ')');
            drawChart(google.visualization.arrayToDataTable(constructOverTimeChartArray(perspectives['confirmed_delta7Days'].title + ' (' + firstDateId + ' - ' + latestDateId + ')', 'confirmed', 'delta7Days')), new google.visualization.LineChart(document.getElementById('chart_over_time')), perspectives['confirmed_delta7Days'].title + ' (' + firstDateId + ' - ' + latestDateId + ')');
        },
    },
    confirmed_incidence_per100k: {
        title: 'Incidence of Confirmed Cases per 100.000 Capita',
        color: (props) => (props.incidencePer100k > 100.0 ? '#ff0000' : (props.incidencePer100k > 30.0 ? '#ff6f00' : (props.incidencePer100k > 5.0 ? '#ffcc00' : (props.incidencePer100k > 0.0 ? '#77ff00' : '#bfbfbf')))),
        radius: (props) => makeRadius(props.incidencePer100k / 5),
        label: (props) => parseFloat(props.incidencePer100k).toFixed(2) + ' \n Cases per 100k',
        makeCharts: () => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(perspectives['confirmed_incidence_per100k'].title + ' (' + latestDateId + ')', 'incidencePer100k')), new google.visualization.BarChart(document.getElementById('chart_latest')), perspectives['confirmed_incidence_per100k'].title + ' (' + latestDateId + ')');
            drawChart(google.visualization.arrayToDataTable(constructOverTimeChartArray(perspectives['confirmed_incidence_per100k'].title + ' (' + firstDateId + ' - ' + latestDateId + ')', 'incidencePer100k')), new google.visualization.LineChart(document.getElementById('chart_over_time')), perspectives['confirmed_incidence_per100k'].title + ' (' + firstDateId + ' - ' + latestDateId + ')');
        },
    },
    recovered_absolute: {
        title: 'Absolute Number of Recovered Cases',
        color: (props) => props.recoveredValue > 10000 ? '#ff0000' : (props.recoveredValue > 3000 ? '#ff6f00' : (props.recoveredValue > 500 ? '#ffcc00' : (props.recoveredValue > 0 ? '#77ff00' : '#bfbfbf'))),
        radius: (props) => makeRadius(props.recoveredValue / 500),
        label: (props) => props.recoveredValue + ' Cases \n ' + determineSign(props.recoveredDelta24Hours) + props.recoveredDelta24Hours + ' Cases (' + determineSign(props.recoveredGrowthRateLast24Hours) + parseFloat(props.recoveredGrowthRateLast24Hours).toFixed(2) + '%)',
        makeCharts: () => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(perspectives['recovered_absolute'].title + ' (' + latestDateId + ')', 'recovered', 'value')), new google.visualization.BarChart(document.getElementById('chart_latest')), perspectives['recovered_absolute'].title + ' (' + latestDateId + ')');
            drawChart(google.visualization.arrayToDataTable(constructOverTimeChartArray(perspectives['recovered_absolute'].title + ' (' + firstDateId + ' - ' + latestDateId + ')', 'recovered', 'value')), new google.visualization.LineChart(document.getElementById('chart_over_time')), perspectives['recovered_absolute'].title + ' (' + firstDateId + ' - ' + latestDateId + ')');
        },
    },
    recovered_growth24Hours: {
        title: 'Growth Rate in % of Recovered Cases compared to 24 Hours ago',
        color: (props) => (props.recoveredGrowthRateLast24Hours > 100 ? '#77ff00' : (props.recoveredGrowthRateLast24Hours > 50 ? '#ffcc00' : (props.recoveredGrowthRateLast24Hours > 20 ? '#ff6f00' : (props.recoveredGrowthRateLast24Hours > 0 ? '#ff0000' : '#bfbfbf')))),
        radius: (props) => makeRadius(props.recoveredGrowthRateLast24Hours / 3),
        label: (props) => determineSign(props.recoveredGrowthRateLast24Hours) + parseFloat(props.recoveredGrowthRateLast24Hours).toFixed(2) + '% \n ' + determineSign(props.recoveredDelta24Hours) + props.recoveredDelta24Hours + ' Cases',
        makeCharts: () => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(perspectives['recovered_growth24Hours'].title + ' (' + latestDateId + ')', 'recovered', 'growthRateLast24Hours')), new google.visualization.BarChart(document.getElementById('chart_latest')), perspectives['recovered_growth24Hours'].title + ' (' + latestDateId + ')');
            drawChart(google.visualization.arrayToDataTable(constructOverTimeChartArray(perspectives['recovered_growth24Hours'].title + ' (' + firstDateId + ' - ' + latestDateId + ')', 'recovered', 'growthRateLast24Hours')), new google.visualization.LineChart(document.getElementById('chart_over_time')), perspectives['recovered_growth24Hours'].title + ' (' + firstDateId + ' - ' + latestDateId + ')');
        },
    },
    recovered_delta24Hours: {
        title: 'Delta of Recovered Cases compared to 24 Hours ago',
        color: (props) => (props.recoveredDelta24Hours > 600 ? '#77ff00' : (props.recoveredDelta24Hours > 100 ? '#ffcc00' : (props.recoveredDelta24Hours > 20 ? '#ff6f00' : (props.recoveredDelta24Hours > 0 ? '#ff0000' : '#bfbfbf')))),
        radius: (props) => makeRadius(props.recoveredDelta24Hours / 100),
        label: (props) => '+' + Math.round(props.recoveredDelta24Hours) + ' Cases \n ' + determineSign(props.recoveredGrowthRateLast24Hours) + parseFloat(props.recoveredGrowthRateLast24Hours).toFixed(2) + ' %',
        makeCharts: () => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(perspectives['recovered_delta24Hours'].title + ' (' + latestDateId + ')', 'recovered', 'delta24Hours')), new google.visualization.BarChart(document.getElementById('chart_latest')), perspectives['recovered_delta24Hours'].title + ' (' + latestDateId + ')');
            drawChart(google.visualization.arrayToDataTable(constructOverTimeChartArray(perspectives['recovered_delta24Hours'].title + ' (' + firstDateId + ' - ' + latestDateId + ')', 'recovered', 'delta24Hours')), new google.visualization.LineChart(document.getElementById('chart_over_time')), perspectives['recovered_delta24Hours'].title + ' (' + firstDateId + ' - ' + latestDateId + ')');
        },
    },
    recovered_growth7Days: {
        title: 'Growth Rate in % of Recovered Cases compared to 7 Days ago',
        color: (props) => (props.recoveredGrowthRateLast7Days > 500 ? '#77ff00' : (props.recoveredGrowthRateLast7Days > 200 ? '#ffcc00' : (props.recoveredGrowthRateLast7Days > 80 ? '#ff6f00' : (props.recoveredGrowthRateLast7Days > 0 ? '#ff0000' : '#bfbfbf')))),
        radius: (props) => makeRadius(props.recoveredGrowthRateLast7Days / 100),
        label: (props) => determineSign(props.recoveredGrowthRateLast7Days) + parseFloat(props.recoveredGrowthRateLast7Days).toFixed(2) + '% \n ' + determineSign(props.recoveredDelta7Days) + props.recoveredDelta7Days + ' Cases',
        makeCharts: () => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(perspectives['recovered_growth7Days'].title + ' (' + latestDateId + ')', 'recovered', 'growthRateLast7Days')), new google.visualization.BarChart(document.getElementById('chart_latest')), perspectives['recovered_growth7Days'].title + ' (' + latestDateId + ')');
            drawChart(google.visualization.arrayToDataTable(constructOverTimeChartArray(perspectives['recovered_growth7Days'].title + ' (' + firstDateId + ' - ' + latestDateId + ')', 'recovered', 'growthRateLast7Days')), new google.visualization.LineChart(document.getElementById('chart_over_time')), perspectives['recovered_growth7Days'].title + ' (' + firstDateId + ' - ' + latestDateId + ')');
        },
    },
    recovered_delta7Days: {
        title: 'Delta of Recovered Cases compared to 7 Days ago',
        color: (props) => (props.recoveredDelta7Days > 5000 ? '#77ff00' : (props.recoveredDelta7Days > 2000 ? '#ff6f00' : (props.recoveredDelta7Days > 600 ? '#ffcc00' : (props.recoveredDelta7Days > 0 ? '#77ff00' : '#bfbfbf')))),
        radius: (props) => makeRadius(props.recoveredDelta7Days / 100),
        label: (props) => '+' + Math.round(props.recoveredDelta7Days) + ' Cases \n ' + determineSign(props.recoveredGrowthRateLast7Days) + parseFloat(props.recoveredGrowthRateLast7Days).toFixed(2) + ' %',
        makeCharts: () => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(perspectives['recovered_delta7Days'].title + ' (' + latestDateId + ')', 'recovered', 'delta7Days')), new google.visualization.BarChart(document.getElementById('chart_latest')), perspectives['recovered_delta7Days'].title + ' (' + latestDateId + ')');
            drawChart(google.visualization.arrayToDataTable(constructOverTimeChartArray(perspectives['recovered_delta7Days'].title + ' (' + firstDateId + ' - ' + latestDateId + ')', 'recovered', 'delta7Days')), new google.visualization.LineChart(document.getElementById('chart_over_time')), perspectives['recovered_delta7Days'].title + ' (' + firstDateId + ' - ' + latestDateId + ')');
        },
    },
    recovery_rate: {
        title: 'Recovery Rate in %',
        color: (props) => (props.recoveryRate > 70 ? '#77ff00' : (props.recoveryRate > 30 ? '#ffcc00' : (props.recoveryRate > 8 ? '#ff6f00' : (props.recoveryRate > 0 ? '#ff0000' : '#bfbfbf')))),
        radius: (props) => makeRadius(props.recoveryRate / 2),
        label: (props) => parseFloat(props.recoveryRate).toFixed(2) + '%',
        makeCharts: () => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(perspectives['recovery_rate'].title + ' (' + latestDateId + ')', 'recoveryRate')), new google.visualization.BarChart(document.getElementById('chart_latest')), perspectives['recovery_rate'].title + ' (' + latestDateId + ')');
            drawChart(google.visualization.arrayToDataTable(constructOverTimeChartArray(perspectives['recovery_rate'].title + ' (' + firstDateId + ' - ' + latestDateId + ')', 'recoveryRate')), new google.visualization.LineChart(document.getElementById('chart_over_time')), perspectives['recovery_rate'].title + ' (' + firstDateId + ' - ' + latestDateId + ')');
        },
    },
    immunization_rate: {
        title: 'Immunization Rate in %',
        color: (props) => (props.immunizationRate > 1 ? '#77ff00' : (props.immunizationRate > 0.5 ? '#ffcc00' : (props.immunizationRate > 0.1 ? '#ff6f00' : (props.immunizationRate > 0 ? '#ff0000' : '#bfbfbf')))),
        radius: (props) => makeRadius(props.immunizationRate * 100),
        label: (props) => parseFloat(props.immunizationRate).toFixed(2) + '%',
        makeCharts: () => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(perspectives['immunization_rate'].title + ' (' + latestDateId + ')', 'recoveryRate')), new google.visualization.BarChart(document.getElementById('chart_latest')), perspectives['immunization_rate'].title + ' (' + latestDateId + ')');
            drawChart(google.visualization.arrayToDataTable(constructOverTimeChartArray(perspectives['immunization_rate'].title + ' (' + firstDateId + ' - ' + latestDateId + ')', 'immunizationRate')), new google.visualization.LineChart(document.getElementById('chart_over_time')), perspectives['immunization_rate'].title + ' (' + firstDateId + ' - ' + latestDateId + ')');
        },
    },
    deceased_absolute: {
        title: 'Absolute Number of Deceased Cases',
        color: (props) => (props.deathValue > 500 ? '#ff0000' : (props.deathValue > 100 ? '#ff6f00' : (props.deathValue > 20 ? '#ffcc00' : (props.deathValue > 0 ? '#77ff00' : '#bfbfbf')))),
        radius: (props) => makeRadius(props.deathValue / 100),
        label: (props) => props.deathValue + ' Cases \n ' + determineSign(props.deathDelta24Hours) + props.deathDelta24Hours + ' Cases (' + determineSign(props.deathGrowthRateLast24Hours) + parseFloat(props.deathGrowthRateLast24Hours).toFixed(2) + '%)',
        makeCharts: () => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(perspectives['deceased_absolute'].title + ' (' + latestDateId + ')', 'death', 'value')), new google.visualization.BarChart(document.getElementById('chart_latest')), perspectives['deceased_absolute'].title + ' (' + latestDateId + ')');
            drawChart(google.visualization.arrayToDataTable(constructOverTimeChartArray(perspectives['deceased_absolute'].title + ' (' + firstDateId + ' - ' + latestDateId + ')', 'death', 'value')), new google.visualization.LineChart(document.getElementById('chart_over_time')), perspectives['deceased_absolute'].title + ' (' + firstDateId + ' - ' + latestDateId + ')');
        },
    },
    deceased_growth24Hours: {
        title: 'Growth Rate in % of Deceased Cases compared to 24 Hours ago',
        color: (props) => (props.deathGrowthRateLast24Hours > 100 ? '#ff0000' : (props.deathGrowthRateLast24Hours > 50 ? '#ff6f00' : (props.deathGrowthRateLast24Hours > 20 ? '#ffcc00' : (isFinite(props.deathGrowthRateLast24Hours) && props.deathGrowthRateLast24Hours > 0 ? '#77ff00' : '#bfbfbf')))),
        radius: (props) => makeRadius(props.deathGrowthRateLast24Hours / 2),
        label: (props) => determineSign(props.deathGrowthRateLast24Hours) + parseFloat(props.deathGrowthRateLast24Hours).toFixed(2) + '% \n ' + determineSign(props.deathDelta24Hours) + props.deathDelta24Hours + ' Cases',
        makeCharts: () => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(perspectives['deceased_growth24Hours'].title + ' (' + latestDateId + ')', 'death', 'growthRateLast24Hours')), new google.visualization.BarChart(document.getElementById('chart_latest')), perspectives['deceased_growth24Hours'].title + ' (' + latestDateId + ')');
            drawChart(google.visualization.arrayToDataTable(constructOverTimeChartArray(perspectives['deceased_growth24Hours'].title + ' (' + firstDateId + ' - ' + latestDateId + ')', 'death', 'growthRateLast24Hours')), new google.visualization.LineChart(document.getElementById('chart_over_time')), perspectives['deceased_growth24Hours'].title + ' (' + firstDateId + ' - ' + latestDateId + ')');
        },
    },
    deceased_delta24Hours: {
        title: 'Delta of Deceased Cases compared to 24 Hours ago',
        color: (props) => (props.deathDelta24Hours > 500 ? '#ff0000' : (props.deathDelta24Hours > 200 ? '#ff6f00' : (props.deathDelta24Hours > 60 ? '#ffcc00' : (props.deathDelta24Hours > 0 ? '#77ff00' : '#bfbfbf')))),
        radius: (props) => makeRadius(props.deathDelta24Hours / 35),
        label: (props) => '+' + Math.round(props.deathDelta24Hours) + ' Cases \n ' + determineSign(props.deathGrowthRateLast24Hours) + parseFloat(props.deathGrowthRateLast24Hours).toFixed(2) + ' %',
        makeCharts: () => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(perspectives['deceased_delta24Hours'].title + ' (' + latestDateId + ')', 'death', 'delta24Hours')), new google.visualization.BarChart(document.getElementById('chart_latest')), perspectives['deceased_delta24Hours'].title + ' (' + latestDateId + ')');
            drawChart(google.visualization.arrayToDataTable(constructOverTimeChartArray(perspectives['deceased_delta24Hours'].title + ' (' + firstDateId + ' - ' + latestDateId + ')', 'death', 'delta24Hours')), new google.visualization.LineChart(document.getElementById('chart_over_time')), perspectives['deceased_delta24Hours'].title + ' (' + firstDateId + ' - ' + latestDateId + ')');
        },
    },
    deceased_growth7Days: {
        title: 'Growth Rate in % of Deceased Cases compared to 7 Days ago',
        color: (props) => (props.deathGrowthRateLast7Days > 500 ? '#ff0000' : (props.deathGrowthRateLast7Days > 200 ? '#ff6f00' : (props.deathGrowthRateLast7Days > 80 ? '#ffcc00' : (isFinite(props.deathGrowthRateLast7Days) && props.deathGrowthRateLast7Days > 0 ? '#77ff00' : '#bfbfbf')))),
        radius: (props) => makeRadius(props.deathGrowthRateLast7Days / 10),
        label: (props) => determineSign(props.deathGrowthRateLast7Days) + parseFloat(props.deathGrowthRateLast7Days).toFixed(2) + '% \n ' + determineSign(props.deathDelta7Days) + props.deathDelta7Days + ' Cases',
        makeCharts: () => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(perspectives['deceased_growth7Days'].title + ' (' + latestDateId + ')', 'death', 'growthRateLast7Days')), new google.visualization.BarChart(document.getElementById('chart_latest')), perspectives['deceased_growth7Days'].title + ' (' + latestDateId + ')');
            drawChart(google.visualization.arrayToDataTable(constructOverTimeChartArray(perspectives['deceased_growth7Days'].title + ' (' + firstDateId + ' - ' + latestDateId + ')', 'death', 'growthRateLast7Days')), new google.visualization.LineChart(document.getElementById('chart_over_time')), perspectives['deceased_growth7Days'].title + ' (' + firstDateId + ' - ' + latestDateId + ')');
        },
    },
    deceased_delta7Days: {
        title: 'Delta of Deceased Cases compared to 7 Days ago',
        color: (props) => (props.deathDelta7Days > 5000 ? '#ff0000' : (props.deathDelta7Days > 2000 ? '#ff6f00' : (props.deathDelta7Days > 600 ? '#ffcc00' : (props.deathDelta7Days > 0 ? '#77ff00' : '#bfbfbf')))),
        radius: (props) => makeRadius(props.deathDelta7Days / 350),
        label: (props) => '+' + Math.round(props.deathDelta7Days) + ' Cases \n ' + determineSign(props.deathGrowthRateLast7Days) + parseFloat(props.deathGrowthRateLast7Days).toFixed(2) + ' %',
        makeCharts: () => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(perspectives['deceased_delta7Days'].title + ' (' + latestDateId + ')', 'death', 'delta7Days')), new google.visualization.BarChart(document.getElementById('chart_latest')), perspectives['deceased_delta7Days'].title + ' (' + latestDateId + ')');
            drawChart(google.visualization.arrayToDataTable(constructOverTimeChartArray(perspectives['deceased_delta7Days'].title + ' (' + firstDateId + ' - ' + latestDateId + ')', 'death', 'delta7Days')), new google.visualization.LineChart(document.getElementById('chart_over_time')), perspectives['deceased_delta7Days'].title + ' (' + firstDateId + ' - ' + latestDateId + ')');
        },
    },
    mortality_rate: {
        title: 'Mortality Rate in %',
        color: (props) => (props.mortalityRate > 5 ? '#ff0000' : (props.mortalityRate > 3 ? '#ff6f00' : (props.mortalityRate > 1 ? '#ffcc00' : (isFinite(props.mortalityRate) && props.mortalityRate > 0 ? '#77ff00' : '#bfbfbf')))),
        radius: (props) => makeRadius(props.mortalityRate * 3),
        label: (props) => parseFloat(props.mortalityRate).toFixed(2) + '%',
        makeCharts: () => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(perspectives['mortality_rate'].title + ' (' + latestDateId + ')', 'mortalityRate')), new google.visualization.BarChart(document.getElementById('chart_latest')), perspectives['mortality_rate'].title + ' (' + latestDateId + ')');
            drawChart(google.visualization.arrayToDataTable(constructOverTimeChartArray(perspectives['mortality_rate'].title + ' (' + firstDateId + ' - ' + latestDateId + ')', 'mortalityRate')), new google.visualization.LineChart(document.getElementById('chart_over_time')), perspectives['mortality_rate'].title + ' (' + firstDateId + ' - ' + latestDateId + ')');
        },
    },
    acute_care_beds_absolute: {
        title: 'Absolute Acute Care Bed Capacity',
        color: (props) => (props.acuteCareBeds > 200000 ? '#77ff00' : (props.acuteCareBeds > 80000 ? '#ffcc00' : (props.acuteCareBeds > 30000 ? '#ff6f00' : (props.acuteCareBeds > 0.0 ? '#ff0000' : (isFinite(props.acuteCareBeds) && props.acuteCareBeds > 0.0) ? '#ff0000' : '#bfbfbf')))),
        radius: (props) => makeRadius(props.acuteCareBeds / 70000),
        label: (props) => Math.round(props.acuteCareBeds) + ' Beds',
        makeCharts: () => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(perspectives['acute_care_beds_absolute'].title + ' (' + latestDateId + ')', 'countryDetail', 'acuteCareBeds')), new google.visualization.BarChart(document.getElementById('chart_latest')), perspectives['acute_care_beds_absolute'].title + ' (' + latestDateId + ')');
        },
    },
    acute_care_beds_per100k: {
        title: 'Acute Care Beds Capacity per 100.000 Capita',
        color: (props) => (props.acuteCareBedsPer100k > 450 ? '#77ff00' : (props.acuteCareBedsPer100k > 300 ? '#ffcc00' : (props.acuteCareBedsPer100k > 150 ? '#ff6f00' : (isFinite(props.acuteCareBedsPer100k) && props.acuteCareBedsPer100k > 0.0 ? '#ff0000' : '#bfbfbf')))),
        radius: (props) => makeRadius(props.acuteCareBedsPer100k / 10),
        label: (props) => Math.round(props.acuteCareBedsPer100k) + ' \n Beds per 100k',
        makeCharts: () => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(perspectives['acute_care_beds_per100k'].title + ' (' + latestDateId + ')', 'countryDetail', 'acuteCareBedsPer100k')), new google.visualization.BarChart(document.getElementById('chart_latest')), perspectives['acute_care_beds_per100k'].title + ' (' + latestDateId + ')');
        },
    },
    critical_care_beds_absolute: {
        title: 'Absolute Critical/Intensive Care Bed Capacity',
        color: (props) => (props.criticalCareBeds > 10000 ? '#77ff00' : (props.criticalCareBeds > 5000 ? '#ffcc00' : (props.criticalCareBeds > 1000 ? '#ff6f00' : (isFinite(props.criticalCareBeds) && props.criticalCareBeds > 0.0 ? '#ff0000' : '#bfbfbf')))),
        radius: (props) => makeRadius(props.criticalCareBeds / 1000),
        label: (props) => Math.round(props.criticalCareBeds) + ' Beds',
        makeCharts: () => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(perspectives['critical_care_beds_absolute'].title + ' (' + latestDateId + ')', 'countryDetail', 'criticalCareBeds')), new google.visualization.BarChart(document.getElementById('chart_latest')), perspectives['critical_care_beds_absolute'].title + ' (' + latestDateId + ')');
        },
    },
    critical_care_beds_per100k: {
        title: 'Critical/Intensive Care Beds Capacity per 100.000 Capita',
        color: (props) => (props.criticalCareBedsPer100k > 10 ? '#77ff00' : (props.criticalCareBedsPer100k > 5 ? '#ffcc00' : (props.criticalCareBedsPer100k > 3 ? '#ff6f00' : (isFinite(props.criticalCareBedsPer100k) && props.criticalCareBedsPer100k > 0.0 ? '#ff0000' : '#bfbfbf')))),
        radius: (props) => makeRadius(props.criticalCareBedsPer100k),
        label: (props) => Math.round(props.criticalCareBedsPer100k) + ' \n Beds per 100k',
        makeCharts: () => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(perspectives['critical_care_beds_per100k'].title + ' (' + latestDateId + ')', 'countryDetail', 'criticalCareBedsPer100k')), new google.visualization.BarChart(document.getElementById('chart_latest')), perspectives['critical_care_beds_per100k'].title + ' (' + latestDateId + ')');
        },
    },

    // POPULATION
    gdp_absolute: {
        title: 'Absolute GDP in US$',
        color: (props) => (props.gdpAbsolute > 30000000000 ? '#77ff00' : (props.gdpAbsolute > 20000000000 ? '#ffcc00' : (props.gdpAbsolute > 10000000000 ? '#ff6f00' : (isFinite(props.gdpAbsolute) && props.gdpAbsolute > 0.0 ? '#ff0000' : '#bfbfbf')))),
        radius: (props) => makeRadius(props.gdpAbsolute / 10000000000),
        label: (props) => parseFloat(props.gdpAbsolute).toFixed(2) + ' US$',
        makeCharts: () => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(perspectives['gdp_absolute'].title + ' (' + latestDateId + ')', 'countryDetail', 'gdpAbsolute')), new google.visualization.BarChart(document.getElementById('chart_latest')), perspectives['gdp_absolute'].title + ' (' + latestDateId + ')');
        },
    },
    gdp_perCapita: {
        title: 'GDP in US$ per Capita',
        color: (props) => (props.gdpPerCapita > 30000 ? '#77ff00' : (props.gdpPerCapita > 20000 ? '#ffcc00' : (props.gdpPerCapita > 10000 ? '#ff6f00' : (isFinite(props.gdpPerCapita) && props.gdpPerCapita > 0.0 ? '#ff0000' : '#bfbfbf')))),
        radius: (props) => makeRadius(props.gdpPerCapita / 800),
        label: (props) => parseFloat(props.gdpPerCapita).toFixed(2) + ' US$ \n per Capita',
        makeCharts: () => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(perspectives['gdp_perCapita'].title + ' (' + latestDateId + ')', 'countryDetail', 'gdpPerCapita')), new google.visualization.BarChart(document.getElementById('chart_latest')), perspectives['gdp_perCapita'].title + ' (' + latestDateId + ')');
        },
    },
    health_expenditure_gdp: {
        title: 'Health Expenditure in % of GDP',
        color: (props) => (props.healthExpenditureOfGdp > 9 ? '#77ff00' : (props.healthExpenditureOfGdp > 6 ? '#ffcc00' : (props.healthExpenditureOfGdp > 3 ? '#ff6f00' : (isFinite(props.healthExpenditureOfGdp) && props.healthExpenditureOfGdp > 0.0 ? '#ff0000' : '#bfbfbf')))),
        radius: (props) => makeRadius(props.healthExpenditureOfGdp * 2),
        label: (props) => parseFloat(props.healthExpenditureOfGdp).toFixed(2) + ' %',
        makeCharts: () => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(perspectives['health_expenditure_gdp'].title + ' (' + latestDateId + ')', 'countryDetail', 'healthExpenditureOfGdp')), new google.visualization.BarChart(document.getElementById('chart_latest')), perspectives['health_expenditure_gdp'].title + ' (' + latestDateId + ')');
        },
    },
    health_expenditure_perCapita: {
        title: 'Health Expenditure in US$ per Capita',
        color: (props) => (props.healthExpenditurePerCapita > 3200 ? '#77ff00' : (props.healthExpenditurePerCapita > 2000 ? '#ffcc00' : (props.healthExpenditurePerCapita > 8000 ? '#ff6f00' : (isFinite(props.healthExpenditurePerCapita) && props.healthExpenditurePerCapita > 0.0 ? '#ff0000' : '#bfbfbf')))),
        radius: (props) => makeRadius(props.healthExpenditurePerCapita / 800),
        label: (props) => Math.round(props.healthExpenditurePerCapita) + ' US$ \n per Capita',
        makeCharts: () => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(perspectives['health_expenditure_perCapita'].title + ' (' + latestDateId + ')', 'countryDetail', 'healthExpenditurePerCapita')), new google.visualization.BarChart(document.getElementById('chart_latest')), perspectives['health_expenditure_perCapita'].title + ' (' + latestDateId + ')');
        },
    },
    population_absolute: {
        title: 'Absolute Population',
        color: (props) => (props.populationAbsolute > 150000000 ? '#ff0000' : (props.populationAbsolute > 80000000 ? '#ff6f00' : (props.populationAbsolute > 30000000 ? '#ffcc00' : (isFinite(props.populationAbsolute) && props.populationAbsolute > 0.0 ? '#77ff00' : '#bfbfbf')))),
        radius: (props) => makeRadius(props.populationAbsolute / 7000000),
        label: (props) => Math.round(props.populationAbsolute / 1000000) + ' Million',
        makeCharts: () => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(perspectives['population_absolute'].title + ' (' + latestDateId + ')', 'countryDetail', 'populationAbsolute')), new google.visualization.BarChart(document.getElementById('chart_latest')), perspectives['population_absolute'].title + ' (' + latestDateId + ')');
        },
    },
    population_urban: {
        title: 'Urban Population in %',
        color: (props) => (props.urbanPopulation > 90 ? '#ff0000' : (props.urbanPopulation > 75 ? '#ff6f00' : (props.urbanPopulation > 60 ? '#ffcc00' : (isFinite(props.urbanPopulation) && props.urbanPopulation > 0.0 ? '#77ff00' : '#bfbfbf')))),
        radius: (props) => makeRadius(props.urbanPopulation / 3),
        label: (props) => parseFloat(props.urbanPopulation).toFixed(2) + ' %',
        makeCharts: () => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(perspectives['population_urban'].title + ' (' + latestDateId + ')', 'countryDetail', 'urbanPopulation')), new google.visualization.BarChart(document.getElementById('chart_latest')), perspectives['population_urban'].title + ' (' + latestDateId + ')');
        },
    },
    population_density: {
        title: 'Population Density in P/Km²',
        color: (props) => (props.populationDensity > 150 ? '#ff0000' : (props.populationDensity > 70 ? '#ff6f00' : (props.populationDensity > 20 ? '#ffcc00' : (isFinite(props.populationDensity) && props.populationDensity > 0.0 ? '#77ff00' : '#bfbfbf')))),
        radius: (props) => makeRadius(props.populationDensity / 6),
        label: (props) => parseFloat(props.populationDensity).toFixed(2) + ' P/Km²',
        makeCharts: () => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(perspectives['population_density'].title + ' (' + latestDateId + ')', 'countryDetail', 'populationDensity')), new google.visualization.BarChart(document.getElementById('chart_latest')), perspectives['population_density'].title + ' (' + latestDateId + ')');
        },
    },
    population_median_age: {
        title: 'Population Median Age in years',
        color: (props) => (props.populationMedianAge > 40 ? '#ff0000' : (props.populationMedianAge > 35 ? '#ff6f00' : (props.populationMedianAge > 30 ? '#ffcc00' : (isFinite(props.populationMedianAge) && props.populationMedianAge > 0.0 ? '#77ff00' : '#bfbfbf')))),
        radius: (props) => makeRadius(props.populationMedianAge / 2),
        label: (props) => Math.round(props.populationMedianAge) + ' years',
        makeCharts: () => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(perspectives['population_median_age'].title + ' (' + latestDateId + ')', 'countryDetail', 'populationMedianAge')), new google.visualization.BarChart(document.getElementById('chart_latest')), perspectives['population_median_age'].title + ' (' + latestDateId + ')');
        },
    },
    population_over65_absolute: {
        title: 'Absolute Population over 65 years',
        color: (props) => (props.populationOver65 > 10000000 ? '#ff0000' : (props.populationOver65 > 3000000 ? '#ff6f00' : (props.populationOver65 > 1000000 ? '#ffcc00' : (isFinite(props.populationOver65) && props.populationOver65 > 0.0 ? '#77ff00' : '#bfbfbf')))),
        radius: (props) => makeRadius(props.populationOver65 / 1000000),
        label: (props) => parseFloat(props.populationOver65 / 1000000).toFixed(2) + ' Million',
        makeCharts: () => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(perspectives['population_over65_absolute'].title + ' (' + latestDateId + ')', 'countryDetail', 'populationOver65')), new google.visualization.BarChart(document.getElementById('chart_latest')), perspectives['population_over65_absolute'].title + ' (' + latestDateId + ')');
        },
    },
    population_over65_ratio: {
        title: 'Population over 65 years in % of total Population',
        color: (props) => (props.populationOver65Ratio > 20 ? '#ff0000' : (props.populationOver65Ratio > 15 ? '#ff6f00' : (props.populationOver65Ratio > 10 ? '#ffcc00' : (isFinite(props.populationOver65Ratio) && props.populationOver65Ratio > 0.0 ? '#77ff00' : '#bfbfbf')))),
        radius: (props) => makeRadius(props.populationOver65Ratio * 2),
        label: (props) => parseFloat(props.populationOver65Ratio).toFixed(2) + ' %',
        makeCharts: () => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(perspectives['population_over65_ratio'].title + ' (' + latestDateId + ')', 'countryDetail', 'populationOver65Ratio')), new google.visualization.BarChart(document.getElementById('chart_latest')), perspectives['population_over65_ratio'].title + ' (' + latestDateId + ')');
        },
    },
    fertility_rate: {
        title: 'Fertility Rate',
        color: (props) => (props.fertilityRate > 2.1 ? '#77ff00' : (props.fertilityRate > 1.8 ? '#ffcc00' : (props.fertilityRate > 1.4 ? '#ff6f00' : (isFinite(props.fertilityRate) && props.fertilityRate > 0.0 ? '#ff0000' : '#bfbfbf')))),
        radius: (props) => makeRadius(props.fertilityRate * 12),
        label: (props) => parseFloat(props.fertilityRate).toFixed(2),
        makeCharts: () => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(perspectives['fertility_rate'].title + ' (' + latestDateId + ')', 'countryDetail', 'fertilityRate')), new google.visualization.BarChart(document.getElementById('chart_latest')), perspectives['fertility_rate'].title + ' (' + latestDateId + ')');
        },
    },

    // CALCULATED
    calculated_acute_care_beds_absolute: {
        title: 'Calculated: Absolute Number of Acute Care Cases',
        color: (props) => (props.calculatedAcuteCareAbsolute > 5000 ? '#ff0000' : (props.calculatedAcuteCareAbsolute > 2000 ? '#ff6f00' : (props.calculatedAcuteCareAbsolute > 600 ? '#ffcc00' : (isFinite(props.calculatedAcuteCareAbsolute) && props.calculatedAcuteCareAbsolute > 0.0 ? '#77ff00' : '#bfbfbf')))),
        radius: (props) => makeRadius(props.calculatedAcuteCareAbsolute / 400),
        label: (props) => Math.round(props.calculatedAcuteCareAbsolute),
        makeCharts: () => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(perspectives['calculated_acute_care_beds_absolute'].title + ' (' + latestDateId + ')', 'calculatedAcuteCareAbsolute')), new google.visualization.BarChart(document.getElementById('chart_latest')), perspectives['calculated_acute_care_beds_absolute'].title + ' (' + latestDateId + ')');
            drawChart(google.visualization.arrayToDataTable(constructOverTimeChartArray(perspectives['calculated_acute_care_beds_absolute'].title + ' (' + firstDateId + ' - ' + latestDateId + ')', 'calculatedAcuteCareAbsolute')), new google.visualization.LineChart(document.getElementById('chart_over_time')), perspectives['calculated_acute_care_beds_absolute'].title + ' (' + firstDateId + ' - ' + latestDateId + ')');
        },
    },
    calculated_acute_care_cases_per100k: {
        title: 'Calculated: Acute Care Cases per 100.000 Capita',
        color: (props) => (props.calculatedAcuteCarePer100k > 15 ? '#ff0000' : (props.calculatedAcuteCarePer100k > 7 ? '#ff6f00' : (props.calculatedAcuteCarePer100k > 3 ? '#ffcc00' : (isFinite(props.calculatedAcuteCarePer100k) && props.calculatedAcuteCarePer100k > 0.0 ? '#77ff00' : '#bfbfbf')))),
        radius: (props) => makeRadius(props.calculatedAcuteCarePer100k * 1),
        label: (props) => parseFloat(props.calculatedAcuteCarePer100k).toFixed(2),
        makeCharts: () => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(perspectives['calculated_acute_care_cases_per100k'].title + ' (' + latestDateId + ')', 'calculatedAcuteCarePer100k')), new google.visualization.BarChart(document.getElementById('chart_latest')), perspectives['calculated_acute_care_cases_per100k'].title + ' (' + latestDateId + ')');
            drawChart(google.visualization.arrayToDataTable(constructOverTimeChartArray(perspectives['calculated_acute_care_cases_per100k'].title + ' (' + firstDateId + ' - ' + latestDateId + ')', 'calculatedAcuteCarePer100k')), new google.visualization.LineChart(document.getElementById('chart_over_time')), perspectives['calculated_acute_care_cases_per100k'].title + ' (' + firstDateId + ' - ' + latestDateId + ')');
        },
    },
    calculated_acute_care_beds_utilization: {
        title: 'Calculated: Acute Care Beds Utilization in %',
        color: (props) => (isFinite(props.calculatedAcuteCareBedUtilization)) ? (props.calculatedAcuteCareBedUtilization > 20 ? '#ff0000' : (props.calculatedAcuteCareBedUtilization > 10 ? '#ff6f00' : (props.calculatedAcuteCareBedUtilization > 3 ? '#ffcc00' : (isFinite(props.calculatedAcuteCareBedUtilization) && props.calculatedAcuteCareBedUtilization > 0.0) ? '#77ff00' : '#bfbfbf'))) : '#bfbfbf',
        radius: (props) => makeRadius(props.calculatedAcuteCareBedUtilization * 2),
        label: (props) => isFinite(props.calculatedAcuteCareBedUtilization) ? (parseFloat(props.calculatedAcuteCareBedUtilization).toFixed(2) + '%') : '',
        makeCharts: () => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(perspectives['calculated_acute_care_beds_utilization'].title + ' (' + latestDateId + ')', 'calculatedAcuteCareBedUtilization')), new google.visualization.BarChart(document.getElementById('chart_latest')), perspectives['calculated_acute_care_beds_utilization'].title + ' (' + latestDateId + ')');
            drawChart(google.visualization.arrayToDataTable(constructOverTimeChartArray(perspectives['calculated_acute_care_beds_utilization'].title + ' (' + firstDateId + ' - ' + latestDateId + ')', 'calculatedAcuteCareBedUtilization')), new google.visualization.LineChart(document.getElementById('chart_over_time')), perspectives['calculated_acute_care_beds_utilization'].title + ' (' + firstDateId + ' - ' + latestDateId + ')');
        },
    },
    calculated_critical_care_absolute: {
        title: 'Calculated: Absolute Number of Critical/Intensive Care Cases',
        color: (props) => (props.calculatedCriticalCareAbsolute > 1000 ? '#ff0000' : (props.calculatedCriticalCareAbsolute > 500 ? '#ff6f00' : (props.calculatedCriticalCareAbsolute > 100 ? '#ffcc00' : (props.calculatedCriticalCareAbsolute > 0.0 ? '#77ff00' : '#bfbfbf')))),
        radius: (props) => makeRadius(props.calculatedCriticalCareAbsolute / 80),
        label: (props) => Math.round(props.calculatedCriticalCareAbsolute),
        makeCharts: () => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(perspectives['calculated_critical_care_absolute'].title + ' (' + latestDateId + ')', 'calculatedCriticalCareAbsolute')), new google.visualization.BarChart(document.getElementById('chart_latest')), perspectives['calculated_critical_care_absolute'].title + ' (' + latestDateId + ')');
            drawChart(google.visualization.arrayToDataTable(constructOverTimeChartArray(perspectives['calculated_critical_care_absolute'].title + ' (' + firstDateId + ' - ' + latestDateId + ')', 'calculatedCriticalCareAbsolute')), new google.visualization.LineChart(document.getElementById('chart_over_time')), perspectives['calculated_critical_care_absolute'].title + ' (' + firstDateId + ' - ' + latestDateId + ')');
        },
    },
    calculated_critical_care_cases_per100k: {
        title: 'Calculated: Critical/Intensive Care Cases per 100.000 Capita',
        color: (props) => (props.calculatedCriticalCarePer100k > 10 ? '#ff0000' : (props.calculatedCriticalCarePer100k > 5 ? '#ff6f00' : (props.calculatedCriticalCarePer100k > 2 ? '#ffcc00' : (props.calculatedCriticalCarePer100k > 0.0 ? '#77ff00' : '#bfbfbf')))),
        radius: (props) => makeRadius(props.calculatedCriticalCarePer100k * 2),
        label: (props) => parseFloat(props.calculatedCriticalCarePer100k).toFixed(2),
        makeCharts: () => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(perspectives['calculated_critical_care_cases_per100k'].title + ' (' + latestDateId + ')', 'calculatedCriticalCarePer100k')), new google.visualization.BarChart(document.getElementById('chart_latest')), perspectives['calculated_critical_care_cases_per100k'].title + ' (' + latestDateId + ')');
            drawChart(google.visualization.arrayToDataTable(constructOverTimeChartArray(perspectives['calculated_critical_care_cases_per100k'].title + ' (' + firstDateId + ' - ' + latestDateId + ')', 'calculatedCriticalCarePer100k')), new google.visualization.LineChart(document.getElementById('chart_over_time')), perspectives['calculated_critical_care_cases_per100k'].title + ' (' + firstDateId + ' - ' + latestDateId + ')');
        },
    },
    calculated_critical_care_beds_utilization: {
        title: 'Calculated: Critical/Intensive Care Beds Utilization in %',
        color: (props) => (isFinite(props.calculatedAcuteCareBedUtilization)) ? (props.calculatedCriticalCareBedUtilization > 20 ? '#ff0000' : (props.calculatedCriticalCareBedUtilization > 10 ? '#ff6f00' : (props.calculatedCriticalCareBedUtilization > 3 ? '#ffcc00' : (isFinite(props.calculatedCriticalCareBedUtilization) && props.calculatedCriticalCareBedUtilization > 0.0 ? '#77ff00' : '#bfbfbf')))) : '#bfbfbf',
        radius: (props) => makeRadius(props.calculatedCriticalCareBedUtilization / 2),
        label: (props) => isFinite(props.calculatedCriticalCareBedUtilization) ? (parseFloat(props.calculatedCriticalCareBedUtilization).toFixed(2) + '%') : '',
        makeCharts: () => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(perspectives['calculated_critical_care_beds_utilization'].title + ' (' + latestDateId + ')', 'calculatedCriticalCareBedUtilization')), new google.visualization.BarChart(document.getElementById('chart_latest')), perspectives['calculated_critical_care_beds_utilization'].title + ' (' + latestDateId + ')');
            drawChart(google.visualization.arrayToDataTable(constructOverTimeChartArray(perspectives['calculated_critical_care_beds_utilization'].title + ' (' + firstDateId + ' - ' + latestDateId + ')', 'calculatedCriticalCareBedUtilization')), new google.visualization.LineChart(document.getElementById('chart_over_time')), perspectives['calculated_critical_care_beds_utilization'].title + ' (' + firstDateId + ' - ' + latestDateId + ')');
        },
    },

    // PREDICTION
    calculated_confirmed_24Hours: {
        title: 'Calculated: Simulation of Cases next 24 Hours',
        color: (props) => (props.calculatedConfirmedCases24Hours > 100000 ? '#ff0000' : (props.calculatedConfirmedCases24Hours > 30000 ? '#ff6f00' : (props.calculatedConfirmedCases24Hours > 5000 ? '#ffcc00' : (isFinite(props.calculatedConfirmedCases24Hours) && props.calculatedConfirmedCases24Hours > 0.0 ? '#77ff00' : '#bfbfbf')))),
        radius: (props) => makeRadius(props.calculatedConfirmedCases24Hours / 1000),
        label: (props) => Math.round(props.calculatedConfirmedCases24Hours) + ' \n ' + determineSign(props.calculatedConfirmedCases24HoursDelta) + Math.round(props.calculatedConfirmedCases24HoursDelta),
        makeCharts: () => {
            var newFirstDateId = incrementDateByDays(firstDateId, 1);
            var newLatestDateId = incrementDateByDays(latestDateId, 1);
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(perspectives['calculated_confirmed_24Hours'].title + ' (' + newLatestDateId + ')', 'calculatedConfirmedCases24Hours')), new google.visualization.BarChart(document.getElementById('chart_latest')), perspectives['calculated_confirmed_24Hours'].title + ' (' + newLatestDateId + ')');
            drawChart(google.visualization.arrayToDataTable(constructOverTimeChartArray(perspectives['calculated_confirmed_24Hours'].title + ' (' + newFirstDateId + ' - ' + newLatestDateId + ')', 'calculatedConfirmedCases24Hours', undefined, 1)), new google.visualization.LineChart(document.getElementById('chart_over_time')), perspectives['calculated_confirmed_24Hours'].title + ' (' + newFirstDateId + ' - ' + newLatestDateId + ')');
        },
    },
    calculated_confirmed_7Days: {
        title: 'Calculated: Simulation of Cases next 7 Days',
        color: (props) => (props.calculatedConfirmedCases7Days > 100000 ? '#ff0000' : (props.calculatedConfirmedCases7Days > 30000 ? '#ff6f00' : (props.calculatedConfirmedCases7Days > 5000 ? '#ffcc00' : (isFinite(props.calculatedConfirmedCases7Days) && props.calculatedConfirmedCases7Days > 0.0 ? '#77ff00' : '#bfbfbf')))),
        radius: (props) => makeRadius(props.calculatedConfirmedCases7Days / 1000),
        label: (props) => Math.round(props.calculatedConfirmedCases7Days) + ' \n ' + determineSign(props.calculatedConfirmedCases7DaysDelta) + Math.round(props.calculatedConfirmedCases7DaysDelta),
        makeCharts: () => {
            var newFirstDateId = incrementDateByDays(firstDateId, 7);
            var newLatestDateId = incrementDateByDays(latestDateId, 7);
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(perspectives['calculated_confirmed_7Days'].title + ' (' + newLatestDateId + ')', 'calculatedConfirmedCases7Days')), new google.visualization.BarChart(document.getElementById('chart_latest')), perspectives['calculated_confirmed_7Days'].title + ' (' + newLatestDateId + ')');
            drawChart(google.visualization.arrayToDataTable(constructOverTimeChartArray(perspectives['calculated_confirmed_7Days'].title + ' (' + newFirstDateId + ' - ' + newLatestDateId + ')', 'calculatedConfirmedCases7Days', undefined, 7)), new google.visualization.LineChart(document.getElementById('chart_over_time')), perspectives['calculated_confirmed_7Days'].title + ' (' + newFirstDateId + ' - ' + newLatestDateId + ')');
        },
    },
    calculated_confirmed_incidence_24Hours: {
        title: 'Calculated: Simulation of Incidence Cases next 24 Hours per 100.000 Capita',
        color: (props) => (props.calculatedConfirmedIncidencePer100k24Hours > 100.0 ? '#ff0000' : (props.calculatedConfirmedIncidencePer100k24Hours > 30.0 ? '#ff6f00' : (props.calculatedConfirmedIncidencePer100k24Hours > 5.0 ? '#ffcc00' : (props.calculatedConfirmedIncidencePer100k24Hours > 0.0 ? '#77ff00' : '#bfbfbf')))),
        radius: (props) => makeRadius(props.calculatedConfirmedIncidencePer100k24Hours / 1.5),
        label: (props) => parseFloat(props.calculatedConfirmedIncidencePer100k24Hours).toFixed(2) + ' \n Cases per 100k',
        makeCharts: () => {
            var newFirstDateId = incrementDateByDays(firstDateId, 1);
            var newLatestDateId = incrementDateByDays(latestDateId, 1);
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(perspectives['calculated_confirmed_incidence_24Hours'].title + ' (' + newLatestDateId + ')', 'calculatedConfirmedIncidencePer100k24Hours')), new google.visualization.BarChart(document.getElementById('chart_latest')), perspectives['calculated_confirmed_incidence_24Hours'].title + ' (' + newLatestDateId + ')');
            drawChart(google.visualization.arrayToDataTable(constructOverTimeChartArrayChartArray(perspectives['calculated_confirmed_incidence_24Hours'].title + ' (' + newFirstDateId + ' - ' + newLatestDateId + ')', 'calculatedConfirmedIncidencePer100k24Hours', undefined, 7)), new google.visualization.LineChart(document.getElementById('chart_over_time')), perspectives['calculated_confirmed_incidence_24Hours'].title + ' (' + newFirstDateId + ' - ' + newLatestDateId + ')');
        },
    },
    calculated_confirmed_incidence_7Days: {
        title: 'Calculated: Simulation of Incidence Cases next 7 Days per 100.000 Capita',
        color: (props) => (props.calculatedConfirmedIncidencePer100k7Days > 100.0 ? '#ff0000' : (props.calculatedConfirmedIncidencePer100k7Days > 30.0 ? '#ff6f00' : (props.calculatedConfirmedIncidencePer100k7Days > 5.0 ? '#ffcc00' : (props.calculatedConfirmedIncidencePer100k7Days > 0.0 ? '#77ff00' : '#bfbfbf')))),
        radius: (props) => makeRadius(props.calculatedConfirmedIncidencePer100k7Days / 1.5),
        label: (props) => parseFloat(props.calculatedConfirmedIncidencePer100k7Days).toFixed(2) + ' \n Cases per 100k',
        makeCharts: () => {
            var newFirstDateId = incrementDateByDays(firstDateId, 7);
            var newLatestDateId = incrementDateByDays(latestDateId, 7);
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(perspectives['calculated_confirmed_incidence_7Days'].title + ' (' + newLatestDateId + ')', 'calculatedConfirmedIncidencePer100k7Days')), new google.visualization.BarChart(document.getElementById('chart_latest')), perspectives['calculated_confirmed_incidence_7Days'].title + ' (' + newLatestDateId + ')');
            drawChart(google.visualization.arrayToDataTable(constructOverTimeChartArray(perspectives['calculated_confirmed_incidence_7Days'].title + ' (' + newFirstDateId + ' - ' + newLatestDateId + ')', 'calculatedConfirmedIncidencePer100k7Days', undefined, 7)), new google.visualization.LineChart(document.getElementById('chart_over_time')), perspectives['calculated_confirmed_incidence_7Days'].title + ' (' + newFirstDateId + ' - ' + newLatestDateId + ')');
        },
    },
};
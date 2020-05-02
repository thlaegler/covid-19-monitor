const perspectives = {

    // TEST CAPACITY
    tested_absolute: {
        title: 'Tests: Total Number of Tests',
        titleKey: 'tested.absolute',
        color: (props) => generateColor(props['tested'], 0, '#ff0000', 1000000, '#00ff00'),
        radius: (props) => makeRadius(props['tested'] / 100000),
        label: (props) => props['tested'] + ' Tests \n ' + determineSign(props['testedDelta']) + props['testedDelta'] + ' Tests',
        makeCharts: (title) => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(title + ' (' + latestDateId + ')', 'tested')), new google.visualization.BarChart(document.getElementById('chart_latest')), title + ' (' + latestDateId + ')');
            drawChart(google.visualization.arrayToDataTable(constructOverTimeChartArray(title + ' (' + firstDateId + ' - ' + latestDateId + ')', 'tested')), new google.visualization.LineChart(document.getElementById('chart_over_time')), title + ' (' + firstDateId + ' - ' + latestDateId + ')');
        },
    },
    tested_per1k: {
        title: 'Tests per 1000 Capita',
        titleKey: 'tested.per1k',
        color: (props) => generateColor(props['testedPer1k'], 0, '#ff0000', 20, '#00ff00'),
        radius: (props) => makeRadius(props['testedPer1k']),
        label: (props) => parseFloat(props['testedPer1k']).toFixed(2) + ' \n Tests per 1k Capita',
        makeCharts: (title) => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(title + ' (' + latestDateId + ')', 'testedPer1k')), new google.visualization.BarChart(document.getElementById('chart_latest')), title + ' (' + latestDateId + ')');
            drawChart(google.visualization.arrayToDataTable(constructOverTimeChartArray(title + ' (' + firstDateId + ' - ' + latestDateId + ')', 'testedPer1k')), new google.visualization.LineChart(document.getElementById('chart_over_time')), title + ' (' + firstDateId + ' - ' + latestDateId + ')');
        },
    },
    tested_delta: {
        title: 'Tests: Delta of new Tests compared to yesterday',
        titleKey: 'tested.delta',
        color: (props) => generateColor(props['testedDelta'], 0, '#ff0000', 10000, '#00ff00'),
        radius: (props) => makeRadius(props['testedDelta'] / 3000),
        label: (props) => '+' + Math.round(props['testedDelta']) + ' Tests',
        makeCharts: (title) => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(title + ' (' + latestDateId + ')', 'testedDelta')), new google.visualization.BarChart(document.getElementById('chart_latest')), title + ' (' + latestDateId + ')');
            drawChart(google.visualization.arrayToDataTable(constructOverTimeChartArray(title + ' (' + firstDateId + ' - ' + latestDateId + ')', 'testedDelta')), new google.visualization.LineChart(document.getElementById('chart_over_time')), title + ' (' + firstDateId + ' - ' + latestDateId + ')');
        },
    },

    // CONFIRMED
    confirmed_absolute: {
        title: 'Confirmed Cases: Absolute Number of Cases',
        titleKey: 'confirmed.absolute',
        color: (props) => generateColor(props['confirmed'], 0, '#00ff00', 100000, '#ff0000'),
        radius: (props) => makeRadius(props['confirmed'] / 10000),
        label: (props) => props['confirmed'] + ' Cases \n ' + determineSign(props['confirmedDelta']) + props['confirmedDelta'] + ' Cases (' + determineSign(props['confirmedGrowthRate']) + parseFloat(props['confirmedGrowthRate']).toFixed(2) + '%)',
        makeCharts: (title) => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(title + ' (' + latestDateId + ')', 'confirmed')), new google.visualization.BarChart(document.getElementById('chart_latest')), title + ' (' + latestDateId + ')');
            drawChart(google.visualization.arrayToDataTable(constructOverTimeChartArray(title + ' (' + firstDateId + ' - ' + latestDateId + ')', 'confirmed')), new google.visualization.LineChart(document.getElementById('chart_over_time')), title + ' (' + firstDateId + ' - ' + latestDateId + ')');
        },
    },
    confirmed_log: {
        title: 'Confirmed Cases: Absolute Number of Cases on logarithmic Scale',
        titleKey: 'confirmed.log',
        color: (props) => generateColor(props['confirmed'], 0, '#00ff00', 100000, '#ff0000'),
        radius: (props) => makeRadius(props['confirmed'] / 10000),
        label: (props) => props['confirmed'] + ' Cases \n ' + determineSign(props['confirmedDelta']) + props['confirmedDelta'] + ' Cases (' + determineSign(props['confirmedGrowthRate']) + parseFloat(props['confirmedGrowthRate']).toFixed(2) + '%)',
        makeCharts: (title) => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(title + ' (' + latestDateId + ')', 'confirmed')), new google.visualization.BarChart(document.getElementById('chart_latest')), title + ' (' + latestDateId + ')');
            drawChart(google.visualization.arrayToDataTable(constructOverTimeChartArray(title + ' (' + firstDateId + ' - ' + latestDateId + ')', 'confirmed')), new google.visualization.LineChart(document.getElementById('chart_over_time')), title + ' (' + firstDateId + ' - ' + latestDateId + ')'
                , { vAxis: { scaleType: 'log' } }
            );
        },
    },
    confirmed_growth_rate: {
        title: 'Confirmed Cases: Growth Rate in % compared to yesterday',
        titleKey: 'confirmed.growthRate',
        color: (props) => generateColor(props['confirmedGrowthRate'], 0, '#00ff00', 5, '#ff0000'),
        radius: (props) => makeRadius(props['confirmedGrowthRate'] * 2),
        label: (props) => determineSign(props['confirmedGrowthRate']) + parseFloat(props['confirmedGrowthRate']).toFixed(2) + '% \n ' + determineSign(props['confirmedDelta']) + props['confirmedDelta'] + ' Cases',
        makeCharts: (title) => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(title + ' (' + latestDateId + ')', 'confirmedGrowthRate')), new google.visualization.BarChart(document.getElementById('chart_latest')), title + ' (' + latestDateId + ')');
            drawChart(google.visualization.arrayToDataTable(constructOverTimeChartArray(title + ' (' + firstDateId + ' - ' + latestDateId + ')', 'confirmedGrowthRate')), new google.visualization.LineChart(document.getElementById('chart_over_time')), title + ' (' + firstDateId + ' - ' + latestDateId + ')');
        },
    },
    confirmed_delta: {
        title: 'Confirmed Cases: Delta of new Cases compared to yesterday',
        titleKey: 'confirmed.delta',
        color: (props) => generateColor(props['confirmedDelta'], 0, '#00ff00', 5000, '#ff0000'),
        radius: (props) => makeRadius(props['confirmedDelta'] / 500),
        label: (props) => '+' + Math.round(props['confirmedDelta']) + ' Cases \n ' + determineSign(props['confirmedGrowthRate']) + parseFloat(props['confirmedGrowthRate']).toFixed(2) + ' %',
        makeCharts: (title) => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(title + ' (' + latestDateId + ')', 'confirmedDelta')), new google.visualization.BarChart(document.getElementById('chart_latest')), title + ' (' + latestDateId + ')');
            drawChart(google.visualization.arrayToDataTable(constructOverTimeChartArray(title + ' (' + firstDateId + ' - ' + latestDateId + ')', 'confirmedDelta')), new google.visualization.LineChart(document.getElementById('chart_over_time')), title + ' (' + firstDateId + ' - ' + latestDateId + ')');
        },
    },
    // confirmed_growth7Days: {
    //     title: 'Growth Rate in % of Confirmed Cases compared to 7 Days ago',
    //     color: (props) => (props['confirmedGrowthRate']7Days > 500 ? '#ff0000' : (props['confirmedGrowthRate']7Days > 200 ? '#ff6f00' : (props['confirmedGrowthRate']7Days > 80 ? '#ffcc00' : (props['confirmedGrowthRate']7Days > 0 ? '#77ff00' : '#bfbfbf')))),
    //     radius: (props) => makeRadius(props['confirmedGrowthRate']7Days / 10),
    //     label: (props) => determineSign(props['confirmedGrowthRate']7Days) + parseFloat(props['confirmedGrowthRate']7Days).toFixed(2) + '% \n ' + determineSign(props['confirmedDelta']7Days) + props['confirmedDelta']7Days + ' Cases',
    //     makeCharts: (title) => {
    //         drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(perspectives['confirmed_growth7Days'].title + ' (' + latestDateId + ')', 'confirmed', 'growthRate7Days')), new google.visualization.BarChart(document.getElementById('chart_latest')), perspectives['confirmed_growth7Days'].title + ' (' + latestDateId + ')');
    //         drawChart(google.visualization.arrayToDataTable(constructOverTimeChartArray(perspectives['confirmed_growth7Days'].title + ' (' + firstDateId + ' - ' + latestDateId + ')', 'confirmed', 'growthRate7Days')), new google.visualization.LineChart(document.getElementById('chart_over_time')), perspectives['confirmed_growth7Days'].title + ' (' + firstDateId + ' - ' + latestDateId + ')');
    //     },
    // },
    // confirmed_delta7Days: {
    //     title: 'Delta of Confirmed Cases compared to 7 Days ago',
    //     color: (props) => (props['confirmedDelta']7Days > 60000 ? '#ff0000' : (props['confirmedDelta']7Days > 10000 ? '#ff6f00' : (props['confirmedDelta']7Days > 2000 ? '#ffcc00' : (props['confirmedDelta']7Days > 0 ? '#77ff00' : '#bfbfbf')))),
    //     radius: (props) => makeRadius(props['confirmedDelta']7Days / 4000),
    //     label: (props) => '+' + Math.round(props['confirmedDelta']7Days) + ' Cases \n ' + determineSign(props['confirmedGrowthRate']7Days) + parseFloat(props['confirmedGrowthRate']7Days).toFixed(2) + ' %',
    //     makeCharts: (title) => {
    //         drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(perspectives['confirmed_delta7Days'].title + ' (' + latestDateId + ')', 'confirmed', 'delta7Days')), new google.visualization.BarChart(document.getElementById('chart_latest')), perspectives['confirmed_delta7Days'].title + ' (' + latestDateId + ')');
    //         drawChart(google.visualization.arrayToDataTable(constructOverTimeChartArray(perspectives['confirmed_delta7Days'].title + ' (' + firstDateId + ' - ' + latestDateId + ')', 'confirmed', 'delta7Days')), new google.visualization.LineChart(document.getElementById('chart_over_time')), perspectives['confirmed_delta7Days'].title + ' (' + firstDateId + ' - ' + latestDateId + ')');
    //     },
    // },
    confirmed_incidence_per100k: {
        title: 'Incidence of Confirmed Cases per 100.000 Capita',
        titleKey: 'confirmed.incidencePer100k',
        color: (props) => generateColor(props['incidencePer100k'], 0, '#00ff00', 500, '#ff0000'),
        radius: (props) => makeRadius(props['incidencePer100k'] * 0.05),
        label: (props) => parseFloat(props['incidencePer100k']).toFixed(2) + ' \n Cases per 100k',
        makeCharts: (title) => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(perspectives['confirmed_incidence_per100k'].title + ' (' + latestDateId + ')', 'incidencePer100k')), new google.visualization.BarChart(document.getElementById('chart_latest')), title + ' (' + latestDateId + ')');
            drawChart(google.visualization.arrayToDataTable(constructOverTimeChartArray(title + ' (' + firstDateId + ' - ' + latestDateId + ')', 'incidencePer100k')), new google.visualization.LineChart(document.getElementById('chart_over_time')), title + ' (' + firstDateId + ' - ' + latestDateId + ')');
        },
    },
    confirmed_doubling_time: {
        title: 'Doubling Time in Days',
        titleKey: 'confirmed.doublingTime',
        color: (props) => generateColor(props['doublingTime'], 0, '#ff0000', 50, '#00ff00'),
        radius: (props) => makeRadius(props['doublingTime'] * 0.3),
        label: (props) => parseFloat(props['doublingTime']).toFixed(1) + ' Days',
        makeCharts: (title) => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(title + ' (' + latestDateId + ')', 'doublingTime')), new google.visualization.BarChart(document.getElementById('chart_latest')), title + ' (' + latestDateId + ')');
            drawChart(google.visualization.arrayToDataTable(constructOverTimeChartArray(title + ' (' + firstDateId + ' - ' + latestDateId + ')', 'doublingTime')), new google.visualization.LineChart(document.getElementById('chart_over_time')), title + ' (' + firstDateId + ' - ' + latestDateId + ')');
        },
    },
    confirmed_doubling_time_last_7days: {
        title: 'Doubling Time in Days (using Growth Rate of last 7 Days)',
        titleKey: 'confirmed.doublingTimeLast7Days',
        color: (props) => generateColor(props['doublingTimeLast7Days'], 0, '#ff0000', 50, '#00ff00'),
        radius: (props) => makeRadius(props['doublingTimeLast7Days'] * 0.3),
        label: (props) => parseFloat(props['doublingTimeLast7Days']).toFixed(1) + ' Days',
        makeCharts: (title) => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(perspectives['confirmed_doubling_time_last_7days'].title + ' (' + latestDateId + ')', 'doublingTimeLast7Days')), new google.visualization.BarChart(document.getElementById('chart_latest')), perspectives['confirmed_doubling_time_last_7days'].title + ' (' + latestDateId + ')');
            drawChart(google.visualization.arrayToDataTable(constructOverTimeChartArray(perspectives['confirmed_doubling_time_last_7days'].title + ' (' + firstDateId + ' - ' + latestDateId + ')', 'doublingTimeLast7Days')), new google.visualization.LineChart(document.getElementById('chart_over_time')), perspectives['confirmed_doubling_time_last_7days'].title + ' (' + firstDateId + ' - ' + latestDateId + ')');
        },
    },

    // INFECTIOUS / ACTIVE
    infectious_absolute: {
        title: 'Absolute Number of Active Cases',
        titleKey: 'infectious.absolute',
        color: (props) => generateColor(props['infectious'], 0, '#00ff00', 10000, '#ff0000'),
        radius: (props) => makeRadius(props['infectious'] / 10000),
        label: (props) => props['infectious'] + ' Cases \n ' + determineSign(props.infectiousDelta) + props.infectiousDelta + ' Cases (' + determineSign(props.infectiousGrowthRate) + parseFloat(props.infectiousGrowthRate).toFixed(2) + '%)',
        makeCharts: (title) => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(title + ' (' + latestDateId + ')', 'infectious')), new google.visualization.BarChart(document.getElementById('chart_latest')), title + ' (' + latestDateId + ')');
            drawChart(google.visualization.arrayToDataTable(constructOverTimeChartArray(title + ' (' + firstDateId + ' - ' + latestDateId + ')', 'infectious')), new google.visualization.LineChart(document.getElementById('chart_over_time')), title + ' (' + firstDateId + ' - ' + latestDateId + ')');
        },
    },
    infectious_growth_rate: {
        title: 'Active Cases: Growth Rate in % compared to yesterday',
        titleKey: 'infectious.growthRate',
        color: (props) => generateColor(props['infectiousGrowthRate'], 0, '#00ff00', 5, '#ff0000'),
        radius: (props) => makeRadius(props['infectiousGrowthRate'] > 0 ? (props['infectiousGrowthRate']) * 2 : (-2 * props['infectiousGrowthRate'])),
        label: (props) => determineSign(props['infectiousGrowthRate']) + parseFloat(props['infectiousGrowthRate']).toFixed(2) + '% \n ' + determineSign(props.infectiousDelta) + props.infectiousDelta + ' Cases',
        makeCharts: (title) => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(title + ' (' + latestDateId + ')', 'infectiousGrowthRate')), new google.visualization.BarChart(document.getElementById('chart_latest')), title + ' (' + latestDateId + ')');
            drawChart(google.visualization.arrayToDataTable(constructOverTimeChartArray(title + ' (' + firstDateId + ' - ' + latestDateId + ')', 'infectiousGrowthRate')), new google.visualization.LineChart(document.getElementById('chart_over_time')), title + ' (' + firstDateId + ' - ' + latestDateId + ')');
        },
    },
    infectious_delta: {
        title: 'Active Cases: Difference to yesterday',
        titleKey: 'infectious.delta',
        color: (props) => generateColor(props['infectiousDelta'], 0, '#00ff00', 5000, '#ff0000'),
        radius: (props) => makeRadius(props['infectiousDelta'] > 0 ? (props['infectiousDelta'] / 100) : (-0.02 * props['infectiousDelta'])),
        label: (props) => determineSign(props['infectiousDelta']) + Math.round(props['infectiousDelta']) + ' Cases \n ' + determineSign(props.infectiousGrowthRate) + parseFloat(props.infectiousGrowthRate).toFixed(2) + ' %',
        makeCharts: (title) => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(title + ' (' + latestDateId + ')', 'infectiousDelta')), new google.visualization.BarChart(document.getElementById('chart_latest')), title + ' (' + latestDateId + ')');
            drawChart(google.visualization.arrayToDataTable(constructOverTimeChartArray(title + ' (' + firstDateId + ' - ' + latestDateId + ')', 'infectiousDelta')), new google.visualization.LineChart(document.getElementById('chart_over_time')), title + ' (' + firstDateId + ' - ' + latestDateId + ')');
        },
    },

    // RECOVERED
    recovered_absolute: {
        title: 'Absolute Number of Recovered Cases',
        titleKey: 'recovered.absolute',
        color: (props) => generateColor(props['recovered'], 0, '#ff0000', 100000, '#00ff00'),
        radius: (props) => makeRadius(props['recovered'] / 3000),
        label: (props) => props['recovered'] + ' Cases \n ' + determineSign(props.recoveredDelta) + props.recoveredDelta + ' Cases (' + determineSign(props.recoveredGrowthRate) + parseFloat(props.recoveredGrowthRate).toFixed(2) + '%)',
        makeCharts: (title) => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(title + ' (' + latestDateId + ')', 'recovered')), new google.visualization.BarChart(document.getElementById('chart_latest')), title + ' (' + latestDateId + ')');
            drawChart(google.visualization.arrayToDataTable(constructOverTimeChartArray(title + ' (' + firstDateId + ' - ' + latestDateId + ')', 'recovered')), new google.visualization.LineChart(document.getElementById('chart_over_time')), title + ' (' + firstDateId + ' - ' + latestDateId + ')');
        },
    },
    recovered_growth_rate: {
        title: 'Recovered Cases: Growth Rate in % compared to yesterday',
        titleKey: 'recovered.growthRate',
        color: (props) => generateColor(props['recoveredGrowthRate'], 0, '#ff0000', 5, '#00ff00'),
        radius: (props) => makeRadius(props.recoveredGrowthRate * 2),
        label: (props) => determineSign(props.recoveredGrowthRate) + parseFloat(props.recoveredGrowthRate).toFixed(2) + '% \n ' + determineSign(props.recoveredDelta) + props.recoveredDelta + ' Cases',
        makeCharts: (title) => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(title + ' (' + latestDateId + ')', 'recoveredGrowthRate')), new google.visualization.BarChart(document.getElementById('chart_latest')), title + ' (' + latestDateId + ')');
            drawChart(google.visualization.arrayToDataTable(constructOverTimeChartArray(title + ' (' + firstDateId + ' - ' + latestDateId + ')', 'recoveredGrowthRate')), new google.visualization.LineChart(document.getElementById('chart_over_time')), title + ' (' + firstDateId + ' - ' + latestDateId + ')');
        },
    },
    recovered_delta: {
        title: 'Recovered Cases: New Cases compared to yesterday',
        titleKey: 'recovered.delta',
        color: (props) => generateColor(props['recoveredDelta'], 0, '#ff0000', 5000, '#00ff00'),
        radius: (props) => makeRadius(props.recoveredDelta / 100),
        label: (props) => '+' + Math.round(props.recoveredDelta) + ' Cases \n ' + determineSign(props.recoveredGrowthRate) + parseFloat(props.recoveredGrowthRate).toFixed(2) + ' %',
        makeCharts: (title) => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(title + ' (' + latestDateId + ')', 'recoveredDelta')), new google.visualization.BarChart(document.getElementById('chart_latest')), title + ' (' + latestDateId + ')');
            drawChart(google.visualization.arrayToDataTable(constructOverTimeChartArray(title + ' (' + firstDateId + ' - ' + latestDateId + ')', 'recoveredDelta')), new google.visualization.LineChart(document.getElementById('chart_over_time')), title + ' (' + firstDateId + ' - ' + latestDateId + ')');
        },
    },
    // recovered_growth7Days: {
    //     title: 'Growth Rate in % of Recovered Cases compared to 7 Days ago',
    //     color: (props) => (props.recoveredGrowthRate7Days > 500 ? '#77ff00' : (props.recoveredGrowthRate7Days > 200 ? '#ffcc00' : (props.recoveredGrowthRate7Days > 80 ? '#ff6f00' : (props.recoveredGrowthRate7Days > 0 ? '#ff0000' : '#bfbfbf')))),
    //     radius: (props) => makeRadius(props.recoveredGrowthRate7Days / 100),
    //     label: (props) => determineSign(props.recoveredGrowthRate7Days) + parseFloat(props.recoveredGrowthRate7Days).toFixed(2) + '% \n ' + determineSign(props.recoveredDelta7Days) + props.recoveredDelta7Days + ' Cases',
    //     makeCharts: (title) => {
    //         drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(perspectives['recovered_growth7Days'].title + ' (' + latestDateId + ')', 'recovered', 'growthRate7Days')), new google.visualization.BarChart(document.getElementById('chart_latest')), perspectives['recovered_growth7Days'].title + ' (' + latestDateId + ')');
    //         drawChart(google.visualization.arrayToDataTable(constructOverTimeChartArray(perspectives['recovered_growth7Days'].title + ' (' + firstDateId + ' - ' + latestDateId + ')', 'recovered', 'growthRate7Days')), new google.visualization.LineChart(document.getElementById('chart_over_time')), perspectives['recovered_growth7Days'].title + ' (' + firstDateId + ' - ' + latestDateId + ')');
    //     },
    // },
    // recovered_delta7Days: {
    //     title: 'Delta of Recovered Cases compared to 7 Days ago',
    //     color: (props) => (props.recoveredDelta7Days > 5000 ? '#77ff00' : (props.recoveredDelta7Days > 2000 ? '#ff6f00' : (props.recoveredDelta7Days > 600 ? '#ffcc00' : (props.recoveredDelta7Days > 0 ? '#77ff00' : '#bfbfbf')))),
    //     radius: (props) => makeRadius(props.recoveredDelta7Days / 100),
    //     label: (props) => '+' + Math.round(props.recoveredDelta7Days) + ' Cases \n ' + determineSign(props.recoveredGrowthRate7Days) + parseFloat(props.recoveredGrowthRate7Days).toFixed(2) + ' %',
    //     makeCharts: (title) => {
    //         drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(perspectives['recovered_delta7Days'].title + ' (' + latestDateId + ')', 'recovered', 'delta7Days')), new google.visualization.BarChart(document.getElementById('chart_latest')), perspectives['recovered_delta7Days'].title + ' (' + latestDateId + ')');
    //         drawChart(google.visualization.arrayToDataTable(constructOverTimeChartArray(perspectives['recovered_delta7Days'].title + ' (' + firstDateId + ' - ' + latestDateId + ')', 'recovered', 'delta7Days')), new google.visualization.LineChart(document.getElementById('chart_over_time')), perspectives['recovered_delta7Days'].title + ' (' + firstDateId + ' - ' + latestDateId + ')');
    //     },
    // },
    recovery_rate: {
        title: 'Recovery Rate in %',
        titleKey: 'recovered.recoveryRate',
        color: (props) => generateColor(props['recoveryRate'], 0, '#ff0000', 80, '#00ff00'),
        radius: (props) => makeRadius((props.recoveryRate) / 3),
        label: (props) => parseFloat(props.recoveryRate).toFixed(2) + '%',
        makeCharts: (title) => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(title + ' (' + latestDateId + ')', 'recoveryRate')), new google.visualization.BarChart(document.getElementById('chart_latest')), title + ' (' + latestDateId + ')');
            drawChart(google.visualization.arrayToDataTable(constructOverTimeChartArray(title + ' (' + firstDateId + ' - ' + latestDateId + ')', 'recoveryRate')), new google.visualization.LineChart(document.getElementById('chart_over_time')), title + ' (' + firstDateId + ' - ' + latestDateId + ')');
        },
    },
    immunization_rate: {
        title: 'Immunization Rate in %',
        titleKey: 'recovered.immunizationRate',
        color: (props) => generateColor(props['immunizationRate'], 0, '#ff0000', 0.2, '#00ff00'),
        radius: (props) => makeRadius(props.immunizationRate * 50),
        label: (props) => parseFloat(props.immunizationRate).toFixed(2) + '%',
        makeCharts: (title) => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(title + ' (' + latestDateId + ')', 'recoveryRate')), new google.visualization.BarChart(document.getElementById('chart_latest')), title + ' (' + latestDateId + ')');
            drawChart(google.visualization.arrayToDataTable(constructOverTimeChartArray(title + ' (' + firstDateId + ' - ' + latestDateId + ')', 'immunizationRate')), new google.visualization.LineChart(document.getElementById('chart_over_time')), title + ' (' + firstDateId + ' - ' + latestDateId + ')');
        },
    },


    deceased_absolute: {
        title: 'Absolute Number of Deceased Cases',
        titleKey: 'deceased.absolute',
        color: (props) => generateColor(props['deceased'], 0, '#00ff00', 10000, '#ff0000'),
        radius: (props) => makeRadius(props['deceased'] / 1000),
        label: (props) => props['deceased'] + ' Cases \n ' + determineSign(props.deceasedDelta) + props.deceasedDelta + ' Cases (' + determineSign(props.deceasedGrowthRate) + parseFloat(props.deceasedGrowthRate).toFixed(2) + '%)',
        makeCharts: (title) => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(title + ' (' + latestDateId + ')', 'deceased')), new google.visualization.BarChart(document.getElementById('chart_latest')), title + ' (' + latestDateId + ')');
            drawChart(google.visualization.arrayToDataTable(constructOverTimeChartArray(title + ' (' + firstDateId + ' - ' + latestDateId + ')', 'deceased')), new google.visualization.LineChart(document.getElementById('chart_over_time')), title + ' (' + firstDateId + ' - ' + latestDateId + ')');
        },
    },
    deceased_growth_rate: {
        title: 'Deceased Cases: Growth Rate in % compared to yesterday',
        titleKey: 'deceased.growthRate',
        color: (props) => generateColor(props['deceasedGrowthRate'], 0, '#00ff00', 5, '#ff0000'),
        radius: (props) => makeRadius(props.deceasedGrowthRate * 2),
        label: (props) => determineSign(props.deceasedGrowthRate) + parseFloat(props.deceasedGrowthRate).toFixed(2) + '% \n ' + determineSign(props.deceasedDelta) + props.deceasedDelta + ' Cases',
        makeCharts: (title) => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(title + ' (' + latestDateId + ')', 'deceasedGrowthRate')), new google.visualization.BarChart(document.getElementById('chart_latest')), title + ' (' + latestDateId + ')');
            drawChart(google.visualization.arrayToDataTable(constructOverTimeChartArray(title + ' (' + firstDateId + ' - ' + latestDateId + ')', 'deceasedGrowthRate')), new google.visualization.LineChart(document.getElementById('chart_over_time')), title + ' (' + firstDateId + ' - ' + latestDateId + ')');
        },
    },
    deceased_delta: {
        title: 'Deceased Cases: New Cases compared to yesterday',
        titleKey: 'deceased.delta',
        color: (props) => generateColor(props['deceasedDelta'], 0, '#00ff00', 5000, '#ff0000'),
        radius: (props) => makeRadius(props.deceasedDelta / 35),
        label: (props) => '+' + Math.round(props.deceasedDelta) + ' Cases \n ' + determineSign(props.deceasedGrowthRate) + parseFloat(props.deceasedGrowthRate).toFixed(2) + ' %',
        makeCharts: (title) => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(title + ' (' + latestDateId + ')', 'deceasedDelta')), new google.visualization.BarChart(document.getElementById('chart_latest')), title + ' (' + latestDateId + ')');
            drawChart(google.visualization.arrayToDataTable(constructOverTimeChartArray(title + ' (' + firstDateId + ' - ' + latestDateId + ')', 'deceasedDelta')), new google.visualization.LineChart(document.getElementById('chart_over_time')), title + ' (' + firstDateId + ' - ' + latestDateId + ')');
        },
    },
    // deceased_growth7Days: {
    //     title: 'Growth Rate in % of Deceased Cases compared to 7 Days ago',
    //     color: (props) => (props.deceasedGrowthRate7Days > 500 ? '#ff0000' : (props.deceasedGrowthRate7Days > 200 ? '#ff6f00' : (props.deceasedGrowthRate7Days > 80 ? '#ffcc00' : (isFinite(props.deceasedGrowthRate7Days) && props.deceasedGrowthRate7Days > 0 ? '#77ff00' : '#bfbfbf')))),
    //     radius: (props) => makeRadius(props.deceasedGrowthRate7Days / 10),
    //     label: (props) => determineSign(props.deceasedGrowthRate7Days) + parseFloat(props.deceasedGrowthRate7Days).toFixed(2) + '% \n ' + determineSign(props.deceasedDelta7Days) + props.deceasedDelta7Days + ' Cases',
    //     makeCharts: (title) => {
    //         drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(perspectives['deceased_growth7Days'].title + ' (' + latestDateId + ')', 'deceased', 'growthRate7Days')), new google.visualization.BarChart(document.getElementById('chart_latest')), perspectives['deceased_growth7Days'].title + ' (' + latestDateId + ')');
    //         drawChart(google.visualization.arrayToDataTable(constructOverTimeChartArray(perspectives['deceased_growth7Days'].title + ' (' + firstDateId + ' - ' + latestDateId + ')', 'deceased', 'growthRate7Days')), new google.visualization.LineChart(document.getElementById('chart_over_time')), perspectives['deceased_growth7Days'].title + ' (' + firstDateId + ' - ' + latestDateId + ')');
    //     },
    // },
    // deceased_delta7Days: {
    //     title: 'Delta of Deceased Cases compared to 7 Days ago',
    //     color: (props) => (props.deceasedDelta7Days > 5000 ? '#ff0000' : (props.deceasedDelta7Days > 2000 ? '#ff6f00' : (props.deceasedDelta7Days > 600 ? '#ffcc00' : (props.deceasedDelta7Days > 0 ? '#77ff00' : '#bfbfbf')))),
    //     radius: (props) => makeRadius(props.deceasedDelta7Days / 350),
    //     label: (props) => '+' + Math.round(props.deceasedDelta7Days) + ' Cases \n ' + determineSign(props.deceasedGrowthRate7Days) + parseFloat(props.deceasedGrowthRate7Days).toFixed(2) + ' %',
    //     makeCharts: (title) => {
    //         drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(perspectives['deceased_delta7Days'].title + ' (' + latestDateId + ')', 'deceased', 'delta7Days')), new google.visualization.BarChart(document.getElementById('chart_latest')), perspectives['deceased_delta7Days'].title + ' (' + latestDateId + ')');
    //         drawChart(google.visualization.arrayToDataTable(constructOverTimeChartArray(perspectives['deceased_delta7Days'].title + ' (' + firstDateId + ' - ' + latestDateId + ')', 'deceased', 'delta7Days')), new google.visualization.LineChart(document.getElementById('chart_over_time')), perspectives['deceased_delta7Days'].title + ' (' + firstDateId + ' - ' + latestDateId + ')');
    //     },
    // },
    case_fatality_risk: {
        title: 'Case Fatality Risk (CFR) in %',
        titleKey: 'deceased.caseFatalityRisk',
        color: (props) => generateColor(props['caseFatalityRisk'], 0, '#00ff00', 10, '#ff0000'),
        radius: (props) => makeRadius(props['caseFatalityRisk'] * 2),
        label: (props) => parseFloat(props['caseFatalityRisk']).toFixed(2) + '%',
        makeCharts: (title) => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(title + ' (' + latestDateId + ')', 'caseFatalityRisk')), new google.visualization.BarChart(document.getElementById('chart_latest')), title + ' (' + latestDateId + ')');
            drawChart(google.visualization.arrayToDataTable(constructOverTimeChartArray(title + ' (' + firstDateId + ' - ' + latestDateId + ')', 'caseFatalityRisk')), new google.visualization.LineChart(document.getElementById('chart_over_time')), title + ' (' + firstDateId + ' - ' + latestDateId + ')');
        },
    },
    acute_care_beds_absolute: {
        title: 'Absolute Acute Care Bed Capacity',
        color: (props) => (props['acuteCareBedsAbsolute'] > 200000 ? '#77ff00' : (props['acuteCareBedsAbsolute'] > 80000 ? '#ffcc00' : (props['acuteCareBedsAbsolute'] > 30000 ? '#ff6f00' : (props.acuteCareBeds > 0.0 ? '#ff0000' : (isFinite(props.acuteCareBeds) && props.acuteCareBeds > 0.0) ? '#ff0000' : '#bfbfbf')))),
        radius: (props) => makeRadius(props['acuteCareBedsAbsolute'] / 70000),
        label: (props) => Math.round(props['acuteCareBedsAbsolute']) + ' Beds',
        makeCharts: (title) => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(title + ' (' + latestDateId + ')', 'country', 'acuteCareBedsAbsolute')), new google.visualization.BarChart(document.getElementById('chart_latest')), title + ' (' + latestDateId + ')');
        },
    },
    acute_care_beds_per100k: {
        title: 'Acute Care Beds Capacity per 100.000 Capita',
        color: (props) => (props.acuteCareBedsPer100k > 450 ? '#77ff00' : (props.acuteCareBedsPer100k > 300 ? '#ffcc00' : (props.acuteCareBedsPer100k > 150 ? '#ff6f00' : (isFinite(props.acuteCareBedsPer100k) && props.acuteCareBedsPer100k > 0.0 ? '#ff0000' : '#bfbfbf')))),
        radius: (props) => makeRadius(props.acuteCareBedsPer100k / 10),
        label: (props) => Math.round(props.acuteCareBedsPer100k) + ' \n Beds per 100k',
        makeCharts: (title) => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(perspectives['acute_care_beds_per100k'].title + ' (' + latestDateId + ')', 'country', 'acuteCareBedsPer100k')), new google.visualization.BarChart(document.getElementById('chart_latest')), perspectives['acute_care_beds_per100k'].title + ' (' + latestDateId + ')');
        },
    },
    critical_care_beds_absolute: {
        title: 'Absolute Critical/Intensive Care Bed Capacity',
        color: (props) => (props['criticalCareBedsAbsolute'] > 10000 ? '#77ff00' : (props['criticalCareBedsAbsolute'] > 5000 ? '#ffcc00' : (props['criticalCareBedsAbsolute'] > 1000 ? '#ff6f00' : (isFinite(props['criticalCareBedsAbsolute']) && props['criticalCareBedsAbsolute'] > 0.0 ? '#ff0000' : '#bfbfbf')))),
        radius: (props) => makeRadius(props['criticalCareBedsAbsolute'] / 1000),
        label: (props) => Math.round(props['criticalCareBedsAbsolute']) + ' Beds',
        makeCharts: (title) => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(title + ' (' + latestDateId + ')', 'country', 'criticalCareBedsAbsolute')), new google.visualization.BarChart(document.getElementById('chart_latest')), title + ' (' + latestDateId + ')');
        },
    },
    critical_care_beds_per100k: {
        title: 'Critical/Intensive Care Beds Capacity per 100.000 Capita',
        color: (props) => (props.criticalCareBedsPer100k > 10 ? '#77ff00' : (props.criticalCareBedsPer100k > 5 ? '#ffcc00' : (props.criticalCareBedsPer100k > 3 ? '#ff6f00' : (isFinite(props.criticalCareBedsPer100k) && props.criticalCareBedsPer100k > 0.0 ? '#ff0000' : '#bfbfbf')))),
        radius: (props) => makeRadius(props.criticalCareBedsPer100k),
        label: (props) => Math.round(props.criticalCareBedsPer100k) + ' \n Beds per 100k',
        makeCharts: (title) => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(perspectives['critical_care_beds_per100k'].title + ' (' + latestDateId + ')', 'country', 'criticalCareBedsPer100k')), new google.visualization.BarChart(document.getElementById('chart_latest')), perspectives['critical_care_beds_per100k'].title + ' (' + latestDateId + ')');
        },
    },

    // POPULATION
    gdp_absolute: {
        title: 'Absolute GDP in US$',
        color: (props) => generateColor(props['gdpAbsolute'], 0, '#ff0000', 30000000000, '#00ff00'),
        radius: (props) => makeRadius(props.gdpAbsolute / 10000000000),
        label: (props) => parseFloat(props.gdpAbsolute).toFixed(2) + ' US$',
        makeCharts: (title) => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(title + ' (' + latestDateId + ')', 'country', 'gdpAbsolute')), new google.visualization.BarChart(document.getElementById('chart_latest')), title + ' (' + latestDateId + ')');
        },
    },
    gdp_perCapita: {
        title: 'GDP in US$ per Capita',
        color: (props) => generateColor(props['gdpPerCapita'], 0, '#ff0000', 30000, '#00ff00'),
        radius: (props) => makeRadius(props.gdpPerCapita / 800),
        label: (props) => parseFloat(props.gdpPerCapita).toFixed(2) + ' US$ \n per Capita',
        makeCharts: (title) => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(title + ' (' + latestDateId + ')', 'country', 'gdpPerCapita')), new google.visualization.BarChart(document.getElementById('chart_latest')), title + ' (' + latestDateId + ')');
        },
    },
    health_expenditure_gdp: {
        title: 'Health Expenditure in % of GDP',
        color: (props) => generateColor(props['healthExpenditureOfGdp'], 0, '#ff0000', 10, '#00ff00'),
        radius: (props) => makeRadius(props.healthExpenditureOfGdp * 2),
        label: (props) => parseFloat(props.healthExpenditureOfGdp).toFixed(2) + ' %',
        makeCharts: (title) => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(title + ' (' + latestDateId + ')', 'country', 'healthExpenditureOfGdp')), new google.visualization.BarChart(document.getElementById('chart_latest')), title + ' (' + latestDateId + ')');
        },
    },
    health_expenditure_perCapita: {
        title: 'Health Expenditure in US$ per Capita',
        color: (props) => generateColor(props['healthExpenditurePerCapita'], 0, '#ff0000', 3200, '#00ff00'),
        radius: (props) => makeRadius(props.healthExpenditurePerCapita / 800),
        label: (props) => Math.round(props.healthExpenditurePerCapita) + ' US$ \n per Capita',
        makeCharts: (title) => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(title + ' (' + latestDateId + ')', 'country', 'healthExpenditurePerCapita')), new google.visualization.BarChart(document.getElementById('chart_latest')), title + ' (' + latestDateId + ')');
        },
    },
    population_absolute: {
        title: 'Absolute Population',
        color: (props) => generateColor(props['populationAbsolute'], 0, '#00ff00', 150000000, '#ff0000'),
        radius: (props) => makeRadius(props.populationAbsolute / 7000000),
        label: (props) => Math.round(props.populationAbsolute / 1000000) + ' Million',
        makeCharts: (title) => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(title + ' (' + latestDateId + ')', 'country', 'populationAbsolute')), new google.visualization.BarChart(document.getElementById('chart_latest')), title + ' (' + latestDateId + ')');
        },
    },
    population_urban: {
        title: 'Urban Population in %',
        color: (props) => generateColor(props['urbanPopulationRatio'], 0, '#00ff00', 100, '#ff0000'),
        radius: (props) => makeRadius(props.urbanPopulationRatio / 3),
        label: (props) => parseFloat(props.urbanPopulationRatio).toFixed(2) + ' %',
        makeCharts: (title) => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(title + ' (' + latestDateId + ')', 'country', 'urbanPopulationRatio')), new google.visualization.BarChart(document.getElementById('chart_latest')), title + ' (' + latestDateId + ')');
        },
    },
    population_density: {
        title: 'Population Density in P/Km²',
        color: (props) => generateColor(props['populationDensity'], 0, '#00ff00', 150, '#ff0000'),
        radius: (props) => makeRadius(props.populationDensity / 6),
        label: (props) => Math.floor(props.populationDensity) + ' P/Km²',
        makeCharts: (title) => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(title + ' (' + latestDateId + ')', 'country', 'populationDensity')), new google.visualization.BarChart(document.getElementById('chart_latest')), title + ' (' + latestDateId + ')');
        },
    },
    population_median_age: {
        title: 'Population Median Age in years',
        color: (props) => generateColor(props['populationMedianAge'], 0, '#00ff00', 40, '#ff0000'),
        radius: (props) => makeRadius(props['populationMedianAge'] / 2),
        label: (props) => Math.round(props['populationMedianAge']) + ' years',
        makeCharts: (title) => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(title + ' (' + latestDateId + ')', 'country', 'populationMedianAge')), new google.visualization.BarChart(document.getElementById('chart_latest')), title + ' (' + latestDateId + ')');
        },
    },
    population_over65_absolute: {
        title: 'Absolute Population over 65 years',
        color: (props) => generateColor(props['populationOver65'], 0, '#00ff00', 10000000, '#ff0000'),
        radius: (props) => makeRadius(props['populationOver65'] / 1000000),
        label: (props) => parseFloat(props['populationOver65'] / 1000000).toFixed(2) + ' Million',
        makeCharts: (title) => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(perspectives['population_over65_absolute'].title + ' (' + latestDateId + ')', 'country', 'populationOver65')), new google.visualization.BarChart(document.getElementById('chart_latest')), perspectives['population_over65_absolute'].title + ' (' + latestDateId + ')');
        },
    },
    population_over65_ratio: {
        title: 'Population over 65 years in % of total Population',
        color: (props) => generateColor(props['populationOver65Ratio'], 0, '#00ff00', 20, '#ff0000'),
        radius: (props) => makeRadius(props['populationOver65Ratio'] * 2),
        label: (props) => parseFloat(props['populationOver65Ratio']).toFixed(2) + ' %',
        makeCharts: (title) => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(perspectives['population_over65_ratio'].title + ' (' + latestDateId + ')', 'country', 'populationOver65Ratio')), new google.visualization.BarChart(document.getElementById('chart_latest')), perspectives['population_over65_ratio'].title + ' (' + latestDateId + ')');
        },
    },
    fertility_rate: {
        title: 'Fertility Rate',
        color: (props) => generateColor(props['fertilityRate'], 0, '#ff0000', 2, '#00ff00'),
        radius: (props) => 10,
        label: (props) => parseFloat(props['fertilityRate']).toFixed(2),
        makeCharts: (title) => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(title + ' (' + latestDateId + ')', 'country', 'fertilityRate')), new google.visualization.BarChart(document.getElementById('chart_latest')), title + ' (' + latestDateId + ')');
        },
    },

    // RESTRICTIONS
    apple_mobility: {
        title: 'Apple Mobility Trend in % compared to usual Mobility (Baseline 2020-02-13 100%)',
        color: (props) => generateColor(props['appleMobility'], 50, '#00ff00', 100, '#ff0000'),
        radius: (props) => makeRadius(props['appleMobility'] / 2),
        label: (props) => parseFloat(props['appleMobility']).toFixed(2) + ' %',
        makeCharts: (title) => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(title + ' (' + latestDateId + ')', 'appleMobility')), new google.visualization.BarChart(document.getElementById('chart_latest')), title + ' (' + latestDateId + ')');
            drawChart(google.visualization.arrayToDataTable(constructOverTimeChartArray(title + ' (' + firstDateId + ' - ' + latestDateId + ')', 'appleMobility')), new google.visualization.LineChart(document.getElementById('chart_over_time')), title + ' (' + firstDateId + ' - ' + latestDateId + ')');
        },
    },
    google_mobility: {
        title: 'Google Mobility Trend in % compared to usual Mobility (Baseline=0 2020-02-15)',
        color: (props) => generateColor(props['googleMobility'], -50, '#00ff00', 0, '#ff0000'),
        radius: (props) => makeRadius(props['googleMobility'] / 2),
        label: (props) => parseFloat(props['googleMobility']).toFixed(2) + ' %',
        makeCharts: (title) => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(title + ' (' + latestDateId + ')', 'googleMobility')), new google.visualization.BarChart(document.getElementById('chart_latest')), title + ' (' + latestDateId + ')');
            drawChart(google.visualization.arrayToDataTable(constructOverTimeChartArray(title + ' (' + firstDateId + ' - ' + latestDateId + ')', 'googleMobility')), new google.visualization.LineChart(document.getElementById('chart_over_time')), title + ' (' + firstDateId + ' - ' + latestDateId + ')');
        },
    },
    response_stringency: {
        title: 'Oxford Government Response Stringency Index',
        color: (props) => generateColor(props['responseStringency'], 0, '#ff0000', 100, '#00ff00'),
        radius: (props) => makeRadius(props['responseStringency'] / 3),
        label: (props) => parseFloat(props['responseStringency']).toFixed(2),
        makeCharts: (title) => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(title + ' (' + latestDateId + ')', 'responseStringency')), new google.visualization.BarChart(document.getElementById('chart_latest')), title + ' (' + latestDateId + ')');
            drawChart(google.visualization.arrayToDataTable(constructOverTimeChartArray(title + ' (' + firstDateId + ' - ' + latestDateId + ')', 'responseStringency')), new google.visualization.LineChart(document.getElementById('chart_over_time')), title + ' (' + firstDateId + ' - ' + latestDateId + ')');
        },
    },
    travel_restrictions: {
        title: 'Travel Restrictions',
        color: (props) => '#bfbfbf',
        radius: (props) => 10,
        label: (props) => '',
        makeCharts: async (title) => {
            var selectedCountryNames = $('#input-countries').val();
            var desc = $('#details-description');
            desc.html('');
            var elem = $(desc.append('<div></div>').children()[0]);
            await asyncForEach(selectedCountryNames, cn => {
                var c = allCountries[cn];
                elem.append('<h5>' + c.country + '</h5><div>' + c['travelRestriction'] + '</div>');
            });
            elem.accordion({
                collapsible: true,
                heightStyle: 'content',
                icons: {
                    header: "ui-icon-circle-arrow-e",
                    activeHeader: "ui-icon-circle-arrow-s"
                },
            });
        },
    },
    health_restrictions: {
        title: 'Public Health Restrictions',
        color: (props) => '#bfbfbf',
        radius: (props) => 10,
        label: (props) => '',
        makeCharts: async (title) => {
            var selectedCountryNames = $('#input-countries').val();
            var desc = $('#details-description');
            desc.html('');
            var elem = $(desc.append('<div></div>').children()[0]);
            await asyncForEach(selectedCountryNames, cn => {
                var c = allCountries[cn];
                elem.append('<h5>' + c.country + '</h5><div>' + c['healthRestriction'] + '</div>');
            });
            elem.accordion({
                collapsible: true,
                heightStyle: 'content',
                icons: {
                    header: "ui-icon-circle-arrow-e",
                    activeHeader: "ui-icon-circle-arrow-s"
                },
            });
        },
    },

    // ESTIMATES / CALCULATED
    estimate_reproduction_number: {
        title: 'Estimated effective Reproduction Number',
        color: (props) => generateColor(props['estimateReproductionNumber'], 0, '#00ff00', 2, '#ff0000'),
        radius: (props) => makeRadius(props['estimateReproductionNumber'] * 15),
        label: (props) => parseFloat(props['estimateReproductionNumber']).toFixed(2),
        makeCharts: (title) => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(title + ' (' + latestDateId + ')', 'estimateReproductionNumber')), new google.visualization.BarChart(document.getElementById('chart_latest')), title + ' (' + latestDateId + ')');
            drawChart(google.visualization.arrayToDataTable(constructOverTimeChartArray(title + ' (' + firstDateId + ' - ' + latestDateId + ')', 'estimateReproductionNumber')), new google.visualization.LineChart(document.getElementById('chart_over_time')), title + ' (' + firstDateId + ' - ' + latestDateId + ')');
        },
    },
    calculated_acute_care_beds_absolute: {
        title: 'Calculated: Absolute Number of Acute Care Cases',
        color: (props) => (props.calculatedAcuteCareAbsolute > 5000 ? '#ff0000' : (props.calculatedAcuteCareAbsolute > 2000 ? '#ff6f00' : (props.calculatedAcuteCareAbsolute > 600 ? '#ffcc00' : (isFinite(props.calculatedAcuteCareAbsolute) && props.calculatedAcuteCareAbsolute > 0.0 ? '#77ff00' : '#bfbfbf')))),
        radius: (props) => makeRadius(props.calculatedAcuteCareAbsolute / 400),
        label: (props) => Math.round(props.calculatedAcuteCareAbsolute),
        makeCharts: (title) => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(title + ' (' + latestDateId + ')', 'calculatedAcuteCareAbsolute')), new google.visualization.BarChart(document.getElementById('chart_latest')), title + ' (' + latestDateId + ')');
            drawChart(google.visualization.arrayToDataTable(constructOverTimeChartArray(title + ' (' + firstDateId + ' - ' + latestDateId + ')', 'calculatedAcuteCareAbsolute')), new google.visualization.LineChart(document.getElementById('chart_over_time')), title + ' (' + firstDateId + ' - ' + latestDateId + ')');
        },
    },
    calculated_acute_care_cases_per100k: {
        title: 'Calculated: Acute Care Cases per 100.000 Capita',
        color: (props) => (props.calculatedAcuteCarePer100k > 15 ? '#ff0000' : (props.calculatedAcuteCarePer100k > 7 ? '#ff6f00' : (props.calculatedAcuteCarePer100k > 3 ? '#ffcc00' : (isFinite(props.calculatedAcuteCarePer100k) && props.calculatedAcuteCarePer100k > 0.0 ? '#77ff00' : '#bfbfbf')))),
        radius: (props) => makeRadius(props.calculatedAcuteCarePer100k * 1),
        label: (props) => parseFloat(props.calculatedAcuteCarePer100k).toFixed(2),
        makeCharts: (title) => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(perspectives['calculated_acute_care_cases_per100k'].title + ' (' + latestDateId + ')', 'calculatedAcuteCarePer100k')), new google.visualization.BarChart(document.getElementById('chart_latest')), perspectives['calculated_acute_care_cases_per100k'].title + ' (' + latestDateId + ')');
            drawChart(google.visualization.arrayToDataTable(constructOverTimeChartArray(perspectives['calculated_acute_care_cases_per100k'].title + ' (' + firstDateId + ' - ' + latestDateId + ')', 'calculatedAcuteCarePer100k')), new google.visualization.LineChart(document.getElementById('chart_over_time')), perspectives['calculated_acute_care_cases_per100k'].title + ' (' + firstDateId + ' - ' + latestDateId + ')');
        },
    },
    calculated_acute_care_beds_utilization: {
        title: 'Calculated: Acute Care Beds Utilization in %',
        color: (props) => (isFinite(props.calculatedAcuteCareBedUtilization)) ? (props.calculatedAcuteCareBedUtilization > 20 ? '#ff0000' : (props.calculatedAcuteCareBedUtilization > 10 ? '#ff6f00' : (props.calculatedAcuteCareBedUtilization > 3 ? '#ffcc00' : (isFinite(props.calculatedAcuteCareBedUtilization) && props.calculatedAcuteCareBedUtilization > 0.0) ? '#77ff00' : '#bfbfbf'))) : '#bfbfbf',
        radius: (props) => makeRadius(props.calculatedAcuteCareBedUtilization * 2),
        label: (props) => isFinite(props.calculatedAcuteCareBedUtilization) ? (parseFloat(props.calculatedAcuteCareBedUtilization).toFixed(2) + '%') : '',
        makeCharts: (title) => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(title + ' (' + latestDateId + ')', 'calculatedAcuteCareBedUtilization')), new google.visualization.BarChart(document.getElementById('chart_latest')), title + ' (' + latestDateId + ')');
            drawChart(google.visualization.arrayToDataTable(constructOverTimeChartArray(title + ' (' + firstDateId + ' - ' + latestDateId + ')', 'calculatedAcuteCareBedUtilization')), new google.visualization.LineChart(document.getElementById('chart_over_time')), title + ' (' + firstDateId + ' - ' + latestDateId + ')');
        },
    },
    calculated_critical_care_absolute: {
        title: 'Calculated: Absolute Number of Critical/Intensive Care Cases',
        color: (props) => (props.calculatedCriticalCareAbsolute > 1000 ? '#ff0000' : (props.calculatedCriticalCareAbsolute > 500 ? '#ff6f00' : (props.calculatedCriticalCareAbsolute > 100 ? '#ffcc00' : (props.calculatedCriticalCareAbsolute > 0.0 ? '#77ff00' : '#bfbfbf')))),
        radius: (props) => makeRadius(props.calculatedCriticalCareAbsolute / 80),
        label: (props) => Math.round(props.calculatedCriticalCareAbsolute),
        makeCharts: (title) => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(title + ' (' + latestDateId + ')', 'calculatedCriticalCareAbsolute')), new google.visualization.BarChart(document.getElementById('chart_latest')), title + ' (' + latestDateId + ')');
            drawChart(google.visualization.arrayToDataTable(constructOverTimeChartArray(title + ' (' + firstDateId + ' - ' + latestDateId + ')', 'calculatedCriticalCareAbsolute')), new google.visualization.LineChart(document.getElementById('chart_over_time')), title + ' (' + firstDateId + ' - ' + latestDateId + ')');
        },
    },
    calculated_critical_care_cases_per100k: {
        title: 'Calculated: Critical/Intensive Care Cases per 100.000 Capita',
        color: (props) => (props.calculatedCriticalCarePer100k > 10 ? '#ff0000' : (props.calculatedCriticalCarePer100k > 5 ? '#ff6f00' : (props.calculatedCriticalCarePer100k > 2 ? '#ffcc00' : (props.calculatedCriticalCarePer100k > 0.0 ? '#77ff00' : '#bfbfbf')))),
        radius: (props) => makeRadius(props.calculatedCriticalCarePer100k * 2),
        label: (props) => parseFloat(props.calculatedCriticalCarePer100k).toFixed(2),
        makeCharts: (title) => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(perspectives['calculated_critical_care_cases_per100k'].title + ' (' + latestDateId + ')', 'calculatedCriticalCarePer100k')), new google.visualization.BarChart(document.getElementById('chart_latest')), perspectives['calculated_critical_care_cases_per100k'].title + ' (' + latestDateId + ')');
            drawChart(google.visualization.arrayToDataTable(constructOverTimeChartArray(perspectives['calculated_critical_care_cases_per100k'].title + ' (' + firstDateId + ' - ' + latestDateId + ')', 'calculatedCriticalCarePer100k')), new google.visualization.LineChart(document.getElementById('chart_over_time')), perspectives['calculated_critical_care_cases_per100k'].title + ' (' + firstDateId + ' - ' + latestDateId + ')');
        },
    },
    calculated_critical_care_beds_utilization: {
        title: 'Calculated: Critical/Intensive Care Beds Utilization in %',
        color: (props) => (isFinite(props.calculatedAcuteCareBedUtilization)) ? (props.calculatedCriticalCareBedUtilization > 20 ? '#ff0000' : (props.calculatedCriticalCareBedUtilization > 10 ? '#ff6f00' : (props.calculatedCriticalCareBedUtilization > 3 ? '#ffcc00' : (isFinite(props.calculatedCriticalCareBedUtilization) && props.calculatedCriticalCareBedUtilization > 0.0 ? '#77ff00' : '#bfbfbf')))) : '#bfbfbf',
        radius: (props) => makeRadius(props.calculatedCriticalCareBedUtilization / 2),
        label: (props) => isFinite(props.calculatedCriticalCareBedUtilization) ? (parseFloat(props.calculatedCriticalCareBedUtilization).toFixed(2) + '%') : '',
        makeCharts: (title) => {
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(title + ' (' + latestDateId + ')', 'calculatedCriticalCareBedUtilization')), new google.visualization.BarChart(document.getElementById('chart_latest')), title + ' (' + latestDateId + ')');
            drawChart(google.visualization.arrayToDataTable(constructOverTimeChartArray(title + ' (' + firstDateId + ' - ' + latestDateId + ')', 'calculatedCriticalCareBedUtilization')), new google.visualization.LineChart(document.getElementById('chart_over_time')), title + ' (' + firstDateId + ' - ' + latestDateId + ')');
        },
    },

    // PREDICTION
    calculated_confirmed_: {
        title: 'Calculated: Simulation of Cases next 24 Hours',
        color: (props) => (props.calculatedConfirmedCases > 100000 ? '#ff0000' : (props.calculatedConfirmedCases > 30000 ? '#ff6f00' : (props.calculatedConfirmedCases > 5000 ? '#ffcc00' : (isFinite(props.calculatedConfirmedCases) && props.calculatedConfirmedCases > 0.0 ? '#77ff00' : '#bfbfbf')))),
        radius: (props) => makeRadius(props.calculatedConfirmedCases / 1000),
        label: (props) => Math.round(props.calculatedConfirmedCases) + ' \n ' + determineSign(props.calculatedConfirmedCasesDelta) + Math.round(props.calculatedConfirmedCasesDelta),
        makeCharts: (title) => {
            var newFirstDateId = incrementDateByDays(firstDateId, 1);
            var newLatestDateId = incrementDateByDays(latestDateId, 1);
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(title + ' (' + newLatestDateId + ')', 'calculatedConfirmedCases')), new google.visualization.BarChart(document.getElementById('chart_latest')), title + ' (' + newLatestDateId + ')');
            drawChart(google.visualization.arrayToDataTable(constructOverTimeChartArray(title + ' (' + newFirstDateId + ' - ' + newLatestDateId + ')', 'calculatedConfirmedCases', undefined, 1)), new google.visualization.LineChart(document.getElementById('chart_over_time')), title + ' (' + newFirstDateId + ' - ' + newLatestDateId + ')');
        },
    },
    calculated_confirmed_7Days: {
        title: 'Calculated: Simulation of Cases next 7 Days',
        color: (props) => (props.calculatedConfirmedCases7Days > 100000 ? '#ff0000' : (props.calculatedConfirmedCases7Days > 30000 ? '#ff6f00' : (props.calculatedConfirmedCases7Days > 5000 ? '#ffcc00' : (isFinite(props.calculatedConfirmedCases7Days) && props.calculatedConfirmedCases7Days > 0.0 ? '#77ff00' : '#bfbfbf')))),
        radius: (props) => makeRadius(props.calculatedConfirmedCases7Days / 1000),
        label: (props) => Math.round(props.calculatedConfirmedCases7Days) + ' \n ' + determineSign(props.calculatedConfirmedCases7DaysDelta) + Math.round(props.calculatedConfirmedCases7DaysDelta),
        makeCharts: (title) => {
            var newFirstDateId = incrementDateByDays(firstDateId, 7);
            var newLatestDateId = incrementDateByDays(latestDateId, 7);
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(perspectives['calculated_confirmed_7Days'].title + ' (' + newLatestDateId + ')', 'calculatedConfirmedCases7Days')), new google.visualization.BarChart(document.getElementById('chart_latest')), perspectives['calculated_confirmed_7Days'].title + ' (' + newLatestDateId + ')');
            drawChart(google.visualization.arrayToDataTable(constructOverTimeChartArray(perspectives['calculated_confirmed_7Days'].title + ' (' + newFirstDateId + ' - ' + newLatestDateId + ')', 'calculatedConfirmedCases7Days', undefined, 7)), new google.visualization.LineChart(document.getElementById('chart_over_time')), perspectives['calculated_confirmed_7Days'].title + ' (' + newFirstDateId + ' - ' + newLatestDateId + ')');
        },
    },
    calculated_confirmed_incidence_: {
        title: 'Calculated: Simulation of Incidence Cases next 24 Hours per 100.000 Capita',
        color: (props) => (props.calculatedConfirmedIncidencePer100k > 100.0 ? '#ff0000' : (props.calculatedConfirmedIncidencePer100k > 30.0 ? '#ff6f00' : (props.calculatedConfirmedIncidencePer100k > 5.0 ? '#ffcc00' : (props.calculatedConfirmedIncidencePer100k > 0.0 ? '#77ff00' : '#bfbfbf')))),
        radius: (props) => makeRadius(props.calculatedConfirmedIncidencePer100k / 1.5),
        label: (props) => parseFloat(props.calculatedConfirmedIncidencePer100k).toFixed(2) + ' \n Cases per 100k',
        makeCharts: (title) => {
            var newFirstDateId = incrementDateByDays(firstDateId, 1);
            var newLatestDateId = incrementDateByDays(latestDateId, 1);
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(title + ' (' + newLatestDateId + ')', 'calculatedConfirmedIncidencePer100k')), new google.visualization.BarChart(document.getElementById('chart_latest')), title + ' (' + newLatestDateId + ')');
            drawChart(google.visualization.arrayToDataTable(constructOverTimeChartArrayChartArray(title + ' (' + newFirstDateId + ' - ' + newLatestDateId + ')', 'calculatedConfirmedIncidencePer100k', undefined, 7)), new google.visualization.LineChart(document.getElementById('chart_over_time')), title + ' (' + newFirstDateId + ' - ' + newLatestDateId + ')');
        },
    },
    calculated_confirmed_incidence_7Days: {
        title: 'Calculated: Simulation of Incidence Cases next 7 Days per 100.000 Capita',
        color: (props) => (props.calculatedConfirmedIncidencePer100k7Days > 100.0 ? '#ff0000' : (props.calculatedConfirmedIncidencePer100k7Days > 30.0 ? '#ff6f00' : (props.calculatedConfirmedIncidencePer100k7Days > 5.0 ? '#ffcc00' : (props.calculatedConfirmedIncidencePer100k7Days > 0.0 ? '#77ff00' : '#bfbfbf')))),
        radius: (props) => makeRadius(props.calculatedConfirmedIncidencePer100k7Days / 1.5),
        label: (props) => parseFloat(props.calculatedConfirmedIncidencePer100k7Days).toFixed(2) + ' \n Cases per 100k',
        makeCharts: (title) => {
            var newFirstDateId = incrementDateByDays(firstDateId, 7);
            var newLatestDateId = incrementDateByDays(latestDateId, 7);
            drawChart(google.visualization.arrayToDataTable(constructLatestChartArray(perspectives['calculated_confirmed_incidence_7Days'].title + ' (' + newLatestDateId + ')', 'calculatedConfirmedIncidencePer100k7Days')), new google.visualization.BarChart(document.getElementById('chart_latest')), perspectives['calculated_confirmed_incidence_7Days'].title + ' (' + newLatestDateId + ')');
            drawChart(google.visualization.arrayToDataTable(constructOverTimeChartArray(perspectives['calculated_confirmed_incidence_7Days'].title + ' (' + newFirstDateId + ' - ' + newLatestDateId + ')', 'calculatedConfirmedIncidencePer100k7Days', undefined, 7)), new google.visualization.LineChart(document.getElementById('chart_over_time')), perspectives['calculated_confirmed_incidence_7Days'].title + ' (' + newFirstDateId + ' - ' + newLatestDateId + ')');
        },
    },
};
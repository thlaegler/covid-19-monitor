function drawChart(data, chart, title = 'Unknown Title', options2, dateShift) {
    var chartElement = $('#' + chart.container.id);
    var downloadButton = $('#button-' + chart.container.id);

    var options = {
        title: title,
        width: '100%',
        height: '640px', //'100%',
        // curveType: 'function',
        legend: { position: 'bottom' },
        // colors: ['green','yellow', 'organge', 'red'],
        chartArea: {
            width: '72%',
            height: '75%',
            top: 5,
        },
    };
    options = { ...options, ...options2 };
    chartElement.css('display', 'inherit')

    google.visualization.events.addListener(chart, 'ready', function () {
        downloadButton.css('display', 'inherit')
        downloadButton.attr("href", chart.getImageURI());
    });

    chart.draw(data, options);
}
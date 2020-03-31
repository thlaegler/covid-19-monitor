function drawChart(data, chart, title = 'Unknown Title', options2, dateShift) {
    var chartElement = $('#' + chart.container.id);
    var downloadButton = $('#button-' + chart.container.id);

    var options = {
        title: title,
        width: '100%',
        height: '100vh',
        // curveType: 'function',
        legend: { position: 'bottom' },
        // colors: ['green','yellow', 'organge', 'red'],
        chartArea: {
            width: '80%',
            height: '85%',
            // right: 20,
            // top: 15,
        },
    };
    options = { ...options, ...options2 };
    chartElement.css('display', 'inherit')

    google.visualization.events.addListener(chart, 'ready', function () {
        downloadButton.css('display', 'inherit')
        downloadButton.attr("href", chart.getImageURI());
        downloadButton.attr("target", '_blank');
    });

    chart.draw(data, options);
}
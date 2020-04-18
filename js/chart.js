function drawChart(data, chart, title = 'Unknown Title', options2, dateShift) {
    var options = {
        title: title,
        width: '100%',
        height: '640px', //'100%',
        // curveType: 'function',
        legend: { position: 'bottom' },
        crosshair: { trigger: "both", orientation: "both" },
        // colors: ['green','yellow', 'organge', 'red'],
        pointShape: 'diamond',
        chartArea: {
            width: '72%',
            height: '75%',
            // top: 5,
        },
        // trendlines: { 0: {} },
    };
    options = { ...options, ...options2 };

    // TITLE
    var titleId = chart.container.id.replace('chart', 'title');
    var titleElement = $('#' + titleId);
    titleElement.css('display', 'inherit')

    // CHART
    var chartElement = $('#' + chart.container.id);
    var downloadButton = $('#button-' + chart.container.id);
    chartElement.css('display', 'inherit')

    google.visualization.events.addListener(chart, 'ready', function () {
        downloadButton.css('display', 'inherit')
        downloadButton.attr("href", chart.getImageURI());
    });
    chart.draw(data, options);

    // TABLE
    var tableId = chart.container.id.replace('chart', 'table');
    var tableElement = $('#' + tableId);
    tableElement.css('display', 'inherit')

    var dataTable = new google.visualization.DataTable();

    data.Ff.forEach(f => {
        dataTable.addColumn(f.type, f.label);
    });

    dataTable.addRows(data.eg.map(e => e.c.map(c => c.v)));

    var table = new google.visualization.Table(document.getElementById(tableId));

    options.showRowNumber = false;
    options.page = 'enable';
    options.width = '100%';
    options.height = '85%';

    table.draw(dataTable, options);
}
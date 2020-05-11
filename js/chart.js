const trendline = {
    // type: 'exponential',
    type: 'polynomial',
    // degree: 2,
    lineWidth: 20,
    opacity: 0.2,
    //visibleInLegend: true,
    //pointsVisible: true, showR2: true,
};

const drawChart = async (data, chart, title = 'Unknown Title', options2, dateShift) => {
    var fields = data.Ff;
    var entities = data.eg;
    var isKf = false;
    var isHg = false;
    if (data.Kf !== undefined) {
        isKf = true;
        fields = data.Kf;
    }
    if (data.hg !== undefined) {
        isHg = true;
        entities = data.hg;
    }

    const dateFormatter = new google.visualization.DateFormat({
        pattern: 'yyyy-MM-dd',
    });
    var withTrendline = $('#input-with_trendlines').prop('checked');

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
        // hAxis: { format: 'yyyy-MM-dd' },
        // vAxis: { format: 'yyyy-MM-dd' },
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

    if (withTrendline) {
        options['trendlines'] = {};
    }
    await asyncForEach(fields, (f, index) => {
        if (f.type == 'datetime') {
            f.type = 'date';
            f.pattern = 'yyyy-MM-dd';
        }
        if (withTrendline && index < fields.length - 1) {
            options['trendlines'][index] = trendline;
        }
    });

    if (fields[0].type == 'date') {
        options['hAxis'] = { format: 'yyyy-MM-dd' };
        dateFormatter.format(data, 0);
    }
    if(isKf) {
        data.Kf = fields;
    } else {
        data.Ff = fields;
    }

    chart.draw(data, options);


    // TABLE
    var tableId = chart.container.id.replace('chart', 'table');
    var tableElement = $('#' + tableId);
    tableElement.css('display', 'inherit')

    var dataTable = new google.visualization.DataTable();

    await asyncForEach(fields, (f) => dataTable.addColumn(f));

    dataTable.addRows(entities.map(e => e.c.map(c => c.v)));
    // dateFormatter.format(dataTable, 0);

    var table = new google.visualization.Table(document.getElementById(tableId));

    options.showRowNumber = false;
    options.page = 'enable';
    options.width = '100%';
    options.height = '85%';

    table.draw(dataTable, options);
}
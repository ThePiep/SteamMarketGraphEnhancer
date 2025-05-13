var startAtZero = false;
var zoomAmount = 30;
var termDescription = "Month";

function CreatePriceHistoryGraph( line1, numYAxisTicks, strFormatPrefix, strFormatSuffix )
{
    var itemName = getItemName();
    var plot = $J.jqplot('pricehistory', [line1], {
        title:{text: 'Median Sale Prices for ' + itemName, textAlign: 'left' },
        gridPadding:{left: 45, right:45, top:25},
        axesDefaults:{ showTickMarks:false },
        axes:{
            xaxis:{
                renderer:$J.jqplot.DateAxisRenderer,
                tickOptions:{formatString:'%b %#d %Y<span class="priceHistoryTime"> %#I%p<span>'},
                pad: 1
            },
            yaxis: {
                pad: 1.1,
                tickOptions:{formatString:strFormatPrefix + '%0.2f' + strFormatSuffix, labelPosition:'start', showMark: false},
                numberTicks: numYAxisTicks
            }
        },
        grid: {
            gridLineColor: '#1b2939',
            borderColor: '#1b2939',
            background: '#101822'
        },
        cursor: {
            show: true,
            zoom: true,
            showTooltip: false
        },
        highlighter: {
            show: true,
            lineWidthAdjust: 2.5,
            sizeAdjust: 5,
            showTooltip: true,
            tooltipLocation: 'n',
            tooltipOffset: 20,
            fadeTooltip: true,
            yvalues: 2,
            formatString: '<strong>%s</strong><br>%s<br>%d sold'
        },
        series:[{lineWidth:3, markerOptions:{show: false, style:'circle'}}],
        seriesColors: [ "#688F3E" ]
    });

    plot.defaultNumberTicks = numYAxisTicks;
    return plot;
}

function GetYAXisForPriceHistoryGraph( plotPriceHistory, timeMin, timeMax )
{
	var min = startAtZero ? 0 : -1;
	var max = 0.06;
	for ( var index in plotPriceHistory.series[0].data )
	{
		var rgData = plotPriceHistory.series[0].data[index];
		if ( rgData[0] >= timeMin.getTime() && rgData[0] <= timeMax.getTime() )
		{
			if ( rgData[1] > max )
			{
				max = rgData[1];
			}

			if ( (rgData[1] < min || min == -1))
			{
				min = rgData[1];
			}
		}
	}

	return $J.jqplot.LinearTickGenerator( min, max, null, plotPriceHistory.defaultNumberTicks, false, false );
}

function getFirstAndLastValue( plotPriceHistory, timeMin, timeMax ) {
    var filtered = plotPriceHistory.series[0].data.filter((data) => {
        return data[0] >= timeMin.getTime() && data[0] <= timeMax.getTime();
    })
    var first = filtered[0][1];
    return [filtered[0][1], filtered[filtered.length - 1][1]];
}

function getPercentChange( plotPriceHistory, timeMin, timeMax ) {
    var filtered = plotPriceHistory.series[0].data.filter((data) => {
        return data[0] >= timeMin.getTime() && data[0] <= timeMax.getTime();
    })
    var first = filtered[0][1];
    var last = filtered[filtered.length - 1][1];
    var percentChange = ((last - first) / (first)) * 100;
    return percentChange;
}

function getItemName() {
    var url = window.location.href;
    var urlParts = url.split('?')[0].split('/');
    var endOfUrl = urlParts[urlParts.length - 1];
    return decodeURIComponent(endOfUrl);
}

function createGraphTitle(itemName, percentChange) {
    var title = 'Median Sale Prices for ' + itemName + `<div style="float:right; margin-right:45px"> (<a style="color: ${percentChange > 0 ? "#5ba32b":"#D94126" };">${percentChange > 0 ? "+" : ""}${percentChange.toFixed(2)}%</a>, ${termDescription})</div>`;
    return title;
}

function pricehistory_zoomDays( plotPriceHistory, timePriceHistoryEarliest, timePriceHistoryLatest, days )
{
    if ( days == -1 ) {
        // Lifetime
        return pricehistory_zoomLifetime( plotPriceHistory, timePriceHistoryEarliest, timePriceHistoryLatest );
    }

	var timeSelected = new Date( timePriceHistoryLatest.getTime() - ( days * 24 * 60 * 60 * 1000 ) );

    var percentChange = getPercentChange(plotPriceHistory, timeSelected, timePriceHistoryLatest);
    var itemName = getItemName();
    plotPriceHistory.title.text = createGraphTitle(itemName, percentChange);

	plotPriceHistory.axes.xaxis.ticks = [];
	plotPriceHistory.resetZoom();
	plotPriceHistory.axes.xaxis.reset();
	plotPriceHistory.axes.y2axis.reset();

	var ticks = ( days == 7 ) ? 7 : 6;
	plotPriceHistory.axes.xaxis.tickInterval = days / ticks + " days";
	plotPriceHistory.axes.xaxis.min = timeSelected;
	plotPriceHistory.axes.xaxis.max = timePriceHistoryLatest;

	var rgYAxis = GetYAXisForPriceHistoryGraph( plotPriceHistory, timeSelected, timePriceHistoryLatest );
	plotPriceHistory.axes.yaxis.min = rgYAxis[0];
	plotPriceHistory.axes.yaxis.max = rgYAxis[1];
	plotPriceHistory.axes.yaxis.numberTicks = rgYAxis[2];
	plotPriceHistory.axes.yaxis.tickInterval = rgYAxis[4];

	plotPriceHistory.replot();

	$J('#pricehistory .jqplot-yaxis').children().first().remove();
	$J('#pricehistory .jqplot-yaxis').children().last().remove();

	return false;
}

function pricehistory_zoomLifetime( plotPriceHistory, timePriceHistoryEarliest, timePriceHistoryLatest )
{
    var percentChange = getPercentChange(plotPriceHistory, timePriceHistoryEarliest, timePriceHistoryLatest);
    var itemName = getItemName();
    plotPriceHistory.title.text = createGraphTitle(itemName, percentChange);

	plotPriceHistory.axes.xaxis.ticks = [];
	plotPriceHistory.resetZoom();
	plotPriceHistory.axes.xaxis.reset();
	plotPriceHistory.axes.y2axis.reset();

	var days = (timePriceHistoryLatest.getTime() - timePriceHistoryEarliest.getTime()) / ( 24 * 60 * 60 * 1000 );
	if ( days / 7 < 1 )
	{
		var difference = timePriceHistoryLatest.getTime() - timePriceHistoryEarliest.getTime();
		plotPriceHistory.axes.xaxis.ticks = [timePriceHistoryEarliest, new Date( timePriceHistoryEarliest.getTime() + difference * 0.25  ), new Date( timePriceHistoryEarliest.getTime() + difference * 0.5  ), new Date( timePriceHistoryEarliest.getTime() + difference * 0.75  ), timePriceHistoryLatest];
	}
	else
	{
		plotPriceHistory.axes.xaxis.tickInterval = (days / 7) + " days";
	}

	plotPriceHistory.axes.xaxis.min = timePriceHistoryEarliest;
	plotPriceHistory.axes.xaxis.max = timePriceHistoryLatest;

	var rgYAxis = GetYAXisForPriceHistoryGraph( plotPriceHistory, timePriceHistoryEarliest, timePriceHistoryLatest );
	plotPriceHistory.axes.yaxis.min = rgYAxis[0];
	plotPriceHistory.axes.yaxis.max = rgYAxis[1];
	plotPriceHistory.axes.yaxis.numberTicks = rgYAxis[2];
	plotPriceHistory.axes.yaxis.tickInterval = rgYAxis[4];

	plotPriceHistory.replot();

	$J('#pricehistory .jqplot-yaxis').children().first().remove();
	$J('#pricehistory .jqplot-yaxis').children().last().remove();

	return false;
}

function pricehistory_zoomMonthOrLifetime( plotPriceHistory, timePriceHistoryEarliest, timePriceHistoryLatest )
{
	var timeMonthAgo = new Date( timePriceHistoryLatest.getTime() - ( 30 * 24 * 60 * 60 * 1000 ) );
	plotPriceHistory.resetZoom();

	var days = (timePriceHistoryLatest.getTime() - timePriceHistoryEarliest.getTime()) / ( 24 * 60 * 60 * 1000 );
    if (timePriceHistoryEarliest > timeMonthAgo) {
        pricehistory_zoomLifetime( plotPriceHistory, timePriceHistoryEarliest, timePriceHistoryLatest );
    } else {
        pricehistory_zoomDays( plotPriceHistory, timePriceHistoryEarliest, timePriceHistoryLatest, 30 );
    }

	return false;
}
var $ = require('jQuery');

var stock = {};
var startDate = '2012-11-01';
var endDate = '2013-10-28';
var yahooResponse = {"query":{"count":12,"created":"2013-12-24T02:44:14Z","lang":"en-US","diagnostics":{"url":[{"execution-start-time":"1","execution-stop-time":"2","execution-time":"1","content":"http://www.datatables.org/yahoo/finance/yahoo.finance.historicaldata.xml"},{"execution-start-time":"7","execution-stop-time":"48","execution-time":"41","content":"http://ichart.finance.yahoo.com/table.csv?g=d&f=2013&e=26&c=2013&b=10&a=10&d=10&s=CMG"},{"execution-start-time":"50","execution-stop-time":"54","execution-time":"4","content":"http://ichart.finance.yahoo.com/table.csv?g=d&f=2013&e=26&c=2013&b=10&a=10&d=10&s=CMG"}],"publiclyCallable":"true","cache":[{"execution-start-time":"6","execution-stop-time":"7","execution-time":"1","method":"GET","type":"MEMCACHED","content":"254594297b0ae5a81c3ef6f9dba1396e"},{"execution-start-time":"49","execution-stop-time":"49","execution-time":"0","method":"GET","type":"MEMCACHED","content":"344c321643301117e627eafd90bb68e1"}],"query":[{"execution-start-time":"7","execution-stop-time":"49","execution-time":"42","params":"{url=[http://ichart.finance.yahoo.com/table.csv?g=d&f=2013&e=26&c=2013&b=10&a=10&d=10&s=CMG]}","content":"select * from csv(0,1) where url=@url"},{"execution-start-time":"50","execution-stop-time":"55","execution-time":"5","params":"{columnsNames=[Date,Open,High,Low,Close,Volume,Adj_Close], url=[http://ichart.finance.yahoo.com/table.csv?g=d&f=2013&e=26&c=2013&b=10&a=10&d=10&s=CMG]}","content":"select * from csv(2,0) where url=@url and columns=@columnsNames"}],"javascript":{"execution-start-time":"5","execution-stop-time":"61","execution-time":"55","instructions-used":"100277","table-name":"yahoo.finance.historicaldata"},"user-time":"62","service-time":"47","build-version":"0.2.2090"},"results":{"quote":[{"Symbol":"CMG","Date":"2013-11-26","Open":"532.16","High":"532.77","Low":"525.00","Close":"525.00","Volume":"392800","Adj_Close":"525.00"},{"Symbol":"CMG","Date":"2013-11-25","Open":"537.55","High":"540.94","Low":"530.88","Close":"532.31","Volume":"201500","Adj_Close":"532.31"},{"Symbol":"CMG","Date":"2013-11-22","Open":"544.00","High":"544.00","Low":"536.48","Close":"537.48","Volume":"221100","Adj_Close":"537.48"},{"Symbol":"CMG","Date":"2013-11-21","Open":"534.90","High":"542.00","Low":"531.20","Close":"539.22","Volume":"382100","Adj_Close":"539.22"},{"Symbol":"CMG","Date":"2013-11-20","Open":"536.00","High":"542.51","Low":"528.46","Close":"531.66","Volume":"254400","Adj_Close":"531.66"},{"Symbol":"CMG","Date":"2013-11-19","Open":"539.00","High":"541.81","Low":"537.73","Close":"538.16","Volume":"246000","Adj_Close":"538.16"},{"Symbol":"CMG","Date":"2013-11-18","Open":"547.23","High":"550.28","Low":"535.16","Close":"537.51","Volume":"274200","Adj_Close":"537.51"},{"Symbol":"CMG","Date":"2013-11-15","Open":"545.99","High":"549.50","Low":"544.88","Close":"546.97","Volume":"309800","Adj_Close":"546.97"},{"Symbol":"CMG","Date":"2013-11-14","Open":"534.30","High":"544.67","Low":"534.30","Close":"543.92","Volume":"255300","Adj_Close":"543.92"},{"Symbol":"CMG","Date":"2013-11-13","Open":"534.55","High":"538.38","Low":"533.11","Close":"537.58","Volume":"216800","Adj_Close":"537.58"},{"Symbol":"CMG","Date":"2013-11-12","Open":"535.76","High":"537.73","Low":"532.00","Close":"535.42","Volume":"226600","Adj_Close":"535.42"},{"Symbol":"CMG","Date":"2013-11-11","Open":"535.71","High":"537.24","Low":"534.00","Close":"536.44","Volume":"164400","Adj_Close":"536.44"}]}}}

stock.symbol = "AAPL";

//TODO This function doesn't work for more than about 1 year worth of data. Need to re-write to cross years and accumulate 
// quotes into a cleaner/leaner format at the daily level before processing into weekly quotes. Not too easy so not writing yet.
function getData(stock, startDate, endDate) {
	console.log("Retrieving stock data for " + stock.symbol)
    var url = "http://query.yahooapis.com/v1/public/yql";
    // var data = encodeURIComponent("select * from yahoo.finance.quotes where symbol in ('" + symbol + "')");
	var data = encodeURIComponent("select * from yahoo.finance.historicaldata where symbol in ('" + stock.symbol + "') and startDate = '" + startDate + "' and endDate = '" + endDate + "'");
    $.getJSON(url, 'q=' + data + "&format=json&diagnostics=true&env=http://datatables.org/alltables.env")
        .done(function (data) {
			populateStockFromYahooQueryData(stock, data);
			// console.log("Response: \n" + JSON.stringify(data))
    });
}

function populateStockFromYahooQueryData(stock, data) {
	stock.dailyQuotes = createDailyQuotes(data)
	stock.weeklyQuotes = createWeeklyQuotes(stock.dailyQuotes)
	printDailyQuotes(stock.dailyQuotes)
	printWeeklyQuotes(stock.weeklyQuotes)	
	// movingAverageForQuotes(stock.dailyQuotes.reverse(), 2, "Close", "Open2DayMA")
	var avgs = movingAverageForQuotes(stock.weeklyQuotes.reverse(), 10, "Close")
	for (var i = 0; i < avgs.length; i++) {
		console.log(i + " Avg: " + avgs[i])
	}
}

function movingAverageForQuotes(quotes, studyPeriod, valueLabel) {
	// assume quotes come in the order to be averaged
	studyPeriod = studyPeriod >= 1 ? studyPeriod : 1
	valueLabel = valueLabel || "Close"
	
	if (studyPeriod > quotes.length) { return [];}
	
	var ma = [];
	var inputs = [];
	var accum = 0;
	
	// console.log("mAFQ study period: " + studyPeriod)
	// console.log("mAFQ valueLabel: " + valueLabel)

	var length = quotes.length;
	for (var i = 0; i < length; i++) {
		var input = parseFloat(quotes[i][valueLabel])
		accum += input;
		inputs.push(input)
		if (i < studyPeriod - 1) {
			ma[i] = 0;
		} else {
			ma[i] = Math.round(100 * (accum / studyPeriod))/100;
			accum -= inputs[i+1-studyPeriod];
		}
	}

	return ma;
}

function testMovingAverage() {
	var quotes = [];
	for (var i = 0; i < 100; i++) {
		var quote = {"testVal": i}
		quotes.push(quote)
	}
	var avgs = movingAverageForQuotes(quotes, 50, "testVal")
	for (var i = 0; i < avgs.length; i++) {
		console.log(i + " Avg: " + avgs[i])
	}
}


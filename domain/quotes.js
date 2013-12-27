var $ = require('jQuery');

exports.Quote = function(aQuoteLikeObject) {

	var date
	if (aQuoteLikeObject["Date"]) {
		var dateComps = aQuoteLikeObject["Date"].split("-")
		date = new Date(dateComps[0], dateComps[1] - 1, dateComps[2])  // month is zero indexed
	} else {
		date = new Date(2001, 0, 1)
	}
	var open = aQuoteLikeObject["Open"] || 0
	var high = aQuoteLikeObject["High"] || 0 
	var low = aQuoteLikeObject["Low"] || 0
	var close = aQuoteLikeObject["Close"] || 0
	var volume = aQuoteLikeObject["Volume"] || 0
	var adjClose = aQuoteLikeObject["Adj_Close"] || 0

	this.date = function() {return date;}
	this.open = function() {return open;}
	this.high = function() {return high;}
	this.low = function() {return low;}
	this.close = function() {return close;}
	this.volume = function() {return volume;}
	this.adjClose = function() {return adjClose;}
	
}

exports.getDailyQuotes = function(symbol, startDate, endDate) {
    var url = "http://query.yahooapis.com/v1/public/yql";
	var data = encodeURIComponent("select * from yahoo.finance.historicaldata where symbol in ('" + symbol + "') and startDate = '" + startDate + "' and endDate = '" + endDate + "'");
    $.getJSON(url, 'q=' + data + "&format=json&diagnostics=true&env=http://datatables.org/alltables.env")
        .done(function (data) {
			console.log("Yahoo response: " + data)
			return createDailyQuotes(data);
    });
}

exports.sampleYahooResponse = {"query":{"count":12,"created":"2013-12-24T02:44:14Z","lang":"en-US","diagnostics":{"url":[{"execution-start-time":"1","execution-stop-time":"2","execution-time":"1","content":"http://www.datatables.org/yahoo/finance/yahoo.finance.historicaldata.xml"},{"execution-start-time":"7","execution-stop-time":"48","execution-time":"41","content":"http://ichart.finance.yahoo.com/table.csv?g=d&f=2013&e=26&c=2013&b=10&a=10&d=10&s=CMG"},{"execution-start-time":"50","execution-stop-time":"54","execution-time":"4","content":"http://ichart.finance.yahoo.com/table.csv?g=d&f=2013&e=26&c=2013&b=10&a=10&d=10&s=CMG"}],"publiclyCallable":"true","cache":[{"execution-start-time":"6","execution-stop-time":"7","execution-time":"1","method":"GET","type":"MEMCACHED","content":"254594297b0ae5a81c3ef6f9dba1396e"},{"execution-start-time":"49","execution-stop-time":"49","execution-time":"0","method":"GET","type":"MEMCACHED","content":"344c321643301117e627eafd90bb68e1"}],"query":[{"execution-start-time":"7","execution-stop-time":"49","execution-time":"42","params":"{url=[http://ichart.finance.yahoo.com/table.csv?g=d&f=2013&e=26&c=2013&b=10&a=10&d=10&s=CMG]}","content":"select * from csv(0,1) where url=@url"},{"execution-start-time":"50","execution-stop-time":"55","execution-time":"5","params":"{columnsNames=[Date,Open,High,Low,Close,Volume,Adj_Close], url=[http://ichart.finance.yahoo.com/table.csv?g=d&f=2013&e=26&c=2013&b=10&a=10&d=10&s=CMG]}","content":"select * from csv(2,0) where url=@url and columns=@columnsNames"}],"javascript":{"execution-start-time":"5","execution-stop-time":"61","execution-time":"55","instructions-used":"100277","table-name":"yahoo.finance.historicaldata"},"user-time":"62","service-time":"47","build-version":"0.2.2090"},"results":{"quote":[{"Symbol":"CMG","Date":"2013-11-26","Open":"532.16","High":"532.77","Low":"525.00","Close":"525.00","Volume":"392800","Adj_Close":"525.00"},{"Symbol":"CMG","Date":"2013-11-25","Open":"537.55","High":"540.94","Low":"530.88","Close":"532.31","Volume":"201500","Adj_Close":"532.31"},{"Symbol":"CMG","Date":"2013-11-22","Open":"544.00","High":"544.00","Low":"536.48","Close":"537.48","Volume":"221100","Adj_Close":"537.48"},{"Symbol":"CMG","Date":"2013-11-21","Open":"534.90","High":"542.00","Low":"531.20","Close":"539.22","Volume":"382100","Adj_Close":"539.22"},{"Symbol":"CMG","Date":"2013-11-20","Open":"536.00","High":"542.51","Low":"528.46","Close":"531.66","Volume":"254400","Adj_Close":"531.66"},{"Symbol":"CMG","Date":"2013-11-19","Open":"539.00","High":"541.81","Low":"537.73","Close":"538.16","Volume":"246000","Adj_Close":"538.16"},{"Symbol":"CMG","Date":"2013-11-18","Open":"547.23","High":"550.28","Low":"535.16","Close":"537.51","Volume":"274200","Adj_Close":"537.51"},{"Symbol":"CMG","Date":"2013-11-15","Open":"545.99","High":"549.50","Low":"544.88","Close":"546.97","Volume":"309800","Adj_Close":"546.97"},{"Symbol":"CMG","Date":"2013-11-14","Open":"534.30","High":"544.67","Low":"534.30","Close":"543.92","Volume":"255300","Adj_Close":"543.92"},{"Symbol":"CMG","Date":"2013-11-13","Open":"534.55","High":"538.38","Low":"533.11","Close":"537.58","Volume":"216800","Adj_Close":"537.58"},{"Symbol":"CMG","Date":"2013-11-12","Open":"535.76","High":"537.73","Low":"532.00","Close":"535.42","Volume":"226600","Adj_Close":"535.42"},{"Symbol":"CMG","Date":"2013-11-11","Open":"535.71","High":"537.24","Low":"534.00","Close":"536.44","Volume":"164400","Adj_Close":"536.44"}]}}}

exports.createDailyQuotes = function(yahooQueryResults) {
	var results = yahooQueryResults.query.results.quote
	var dateComps;

	for (var indexedQuote in results) {
	    if (results.hasOwnProperty(indexedQuote)) {
			var quote = results[indexedQuote]
			dateComps = quote["Date"].split("-")
			quote["ActualDate"] = new Date(dateComps[0], dateComps[1] - 1, dateComps[2])
	    }
	 }
	
	return results;
}

exports.createWeeklyQuotes = function(dailyQuotes) {
	var weeklyQuotes = Array();
	var weeklyQuoteCurrentDay = 0; // no current quote
	var currWeeklyQuote;
	var date = new Date();
	
	for (var indexedQuote in dailyQuotes) {
	    if (dailyQuotes.hasOwnProperty(indexedQuote)) {
			var quote = dailyQuotes[indexedQuote];
			dateComps = quote["Date"].split("-");
			date.setFullYear(dateComps[0], dateComps[1] - 1, dateComps[2]);
			if (currWeeklyQuote && (date.getDay() < weeklyQuoteCurrentDay)) {
				// this is an EARLIER day, so update Open/StartDate, not Close/EndDate
				currWeeklyQuote["StartDate"] = quote["Date"]
				currWeeklyQuote["Open"] = quote["Open"]
				currWeeklyQuote["High"] = Math.max(currWeeklyQuote["High"], quote["High"])
				currWeeklyQuote["Low"] = Math.min(currWeeklyQuote["Low"], quote["Low"])
				weeklyQuoteCurrentDay = date.getDay()						
				currWeeklyQuote["Count"]++						
			} else {
				currWeeklyQuote = {};
				currWeeklyQuote["StartDate"] = quote["Date"]
				currWeeklyQuote["EndDate"] = quote["Date"]
				currWeeklyQuote["Open"] = quote["Open"]
				currWeeklyQuote["Close"] = quote["Close"]
				currWeeklyQuote["High"] = quote["High"]
				currWeeklyQuote["Low"] = quote["Low"]
				currWeeklyQuote["Count"] = 1
				weeklyQuoteCurrentDay = date.getDay()
				weeklyQuotes.push(currWeeklyQuote)
			}
	    }
	 }

	return weeklyQuotes;
}

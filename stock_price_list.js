var $ = require('jQuery');

// not sure if this is alright as global - maybe we should explicitly set it as $.weekday?
var weekday=new Array(7);
weekday[0]="Sunday";
weekday[1]="Monday";
weekday[2]="Tuesday";
weekday[3]="Wednesday";
weekday[4]="Thursday";
weekday[5]="Friday";
weekday[6]="Saturday";

var stock = {};
var startDate = '2013-10-01';
var endDate = '2013-11-26';

stock.symbol = "CMG";

getData(stock, startDate, endDate);

function createWeeklyQuotes(dailyQuotes) {
	var weeklyQuotes = Array();
	var weeklyQuoteCurrentDay = 0; // no current quote
	var currWeeklyQuote;
	var date = new Date();
	
	for (var indexedQuote in dailyQuotes) {
	    if (dailyQuotes.hasOwnProperty(indexedQuote)) {
			var quote = dailyQuotes[indexedQuote];
			dateComps = quote["date"].split("-");
			date.setFullYear(dateComps[0], dateComps[1] - 1, dateComps[2]);
			if (currWeeklyQuote && (date.getDay() < weeklyQuoteCurrentDay)) {
				// this is an EARLIER day, so update Open/StartDate, not Close
				currWeeklyQuote["StartDate"] = quote["date"]
				currWeeklyQuote["Open"] = quote["Open"]
				currWeeklyQuote["High"] = Math.max(currWeeklyQuote["High"], quote["High"])
				currWeeklyQuote["Low"] = Math.min(currWeeklyQuote["Low"], quote["Low"])
				weeklyQuoteCurrentDay = date.getDay()						
				currWeeklyQuote["Count"]++						
			} else {
				currWeeklyQuote = {};
				currWeeklyQuote["StartDate"] = quote["date"]
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

function printDailyQuotes(quotes) {
	console.log(quotes.length + " Daily Quotes:")
	console.log("Start, Open, High, Low, Close, Volume, Adj. Close, Day of Week, Day Name")
	
	for (var indexedQuote in quotes) {
	    if (quotes.hasOwnProperty(indexedQuote)) {
			var quote = quotes[indexedQuote]
			console.log(quote["date"] + ", " +
				quote["Open"] + ", " +
				quote["High"] + ", " + 
				quote["Low"] + ", " +
				quote["Close"] + ", " +
				quote["Volume"] + ", " +
				quote["Adj_Close"] + ", " +
				quote["ActualDate"].getDay() + ", " +
				weekday[quote["ActualDate"].getDay()]);	
	    }
	 }	
}

function printWeeklyQuotes(weeklyQuotes) {
	console.log(weeklyQuotes.length + " Weekly Quotes:")
	console.log("Start, End, Open, High, Low, Close, Count")
	
	for (var i = 0; i < weeklyQuotes.length; i++) {
		quote = weeklyQuotes[i]
		console.log(quote["StartDate"] + ", " +
			quote["EndDate"] + ", " +
			quote["Open"] + ", " +
			quote["High"] + ", " + 
			quote["Low"] + ", " +
			quote["Close"] + ", " +
			quote["Count"]);		        
	}	
}

function createDailyQuotes(yahooQueryResults) {
	console.log("creating daily quotes")
	console.log("Count: " + yahooQueryResults.query.count + " retrieved on " + yahooQueryResults.query.created)
	var results = yahooQueryResults.query.results.quote
	var dateComps;

	for (var indexedQuote in results) {
	    if (results.hasOwnProperty(indexedQuote)) {
			var quote = results[indexedQuote]
			dateComps = quote["date"].split("-")
			quote["ActualDate"] = new Date(dateComps[0], dateComps[1] - 1, dateComps[2])
	    }
	 }
	
	return results;
}

function getData(stock, startDate, endDate) {
	console.log("Retrieving stock data for " + stock.symbol)
    var url = "http://query.yahooapis.com/v1/public/yql";
    // var data = encodeURIComponent("select * from yahoo.finance.quotes where symbol in ('" + symbol + "')");
	var data = encodeURIComponent("select * from yahoo.finance.historicaldata where symbol in ('" + stock.symbol + "') and startDate = '" + startDate + "' and endDate = '" + endDate + "'");
    $.getJSON(url, 'q=' + data + "&format=json&diagnostics=true&env=http://datatables.org/alltables.env")
        .done(function (data) {
			stock.dailyQuotes = createDailyQuotes(data)
			stock.weeklyQuotes = createWeeklyQuotes(stock.dailyQuotes)
			printDailyQuotes(stock.dailyQuotes)
			printWeeklyQuotes(stock.weeklyQuotes)
		
			console.log("All done with " + stock.symbol + ".")
    });
}

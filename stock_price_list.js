var $ = require('jQuery');

getData();
// getHistoricalQuotes();

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

function printDailyQuote(quote) {
	var weekday=new Array(7);
	weekday[0]="Sunday";
	weekday[1]="Monday";
	weekday[2]="Tuesday";
	weekday[3]="Wednesday";
	weekday[4]="Thursday";
	weekday[5]="Friday";
	weekday[6]="Saturday";

	if (!quote) {
		console.log("Start, Open, High, Low, Close, Volume, Adj. Close, Day of Week, Day Name")
	} else {
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

function getData() {
    var url = "http://query.yahooapis.com/v1/public/yql";
    var symbol = "AMZN";
    // var data = encodeURIComponent("select * from yahoo.finance.quotes where symbol in ('" + symbol + "')");
	var dateComps;
	var startDate = '2013-11-01';
	var endDate = '2013-11-26';
	var data = encodeURIComponent('select * from yahoo.finance.historicaldata where symbol in ("AAPL") and startDate = "' + startDate + '" and endDate = "' + endDate + '"');

	
    $.getJSON(url, 'q=' + data + "&format=json&diagnostics=true&env=http://datatables.org/alltables.env")
        .done(function (data) {
	// this method obviously needs some extraction and class structure - currently spiking algorithm and data format
			var theThing = data.query
			var results = theThing
			
			console.log("Count: " + theThing.count + " retrieved on " + theThing.created )

			results = theThing.results.quote
			printDailyQuote();
			for (var indexedQuote in results) {
			    if (results.hasOwnProperty(indexedQuote)) {
					var quote = results[indexedQuote]
					dateComps = quote["date"].split("-")
					quote["ActualDate"] = new Date(dateComps[0], dateComps[1] - 1, dateComps[2])
					printDailyQuote(quote)
			    }
			 }

			printWeeklyQuotes(createWeeklyQuotes(results))
		
		console.log("All done.")
    });
}

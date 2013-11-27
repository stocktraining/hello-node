var $ = require('jQuery');

getData();
// getHistoricalQuotes();

function getData() {
    var url = "http://query.yahooapis.com/v1/public/yql";
    var symbol = "AMZN";
    // var data = encodeURIComponent("select * from yahoo.finance.quotes where symbol in ('" + symbol + "')");
	var dateComps;
	var startDate = '2013-01-01';
	var endDate = '2013-11-26';
	var data = encodeURIComponent('select * from yahoo.finance.historicaldata where symbol in ("AAPL") and startDate = "' + startDate + '" and endDate = "' + endDate + '"');

	var weekday=new Array(7);
	weekday[0]="Sunday";
	weekday[1]="Monday";
	weekday[2]="Tuesday";
	weekday[3]="Wednesday";
	weekday[4]="Thursday";
	weekday[5]="Friday";
	weekday[6]="Saturday";
	
    $.getJSON(url, 'q=' + data + "&format=json&diagnostics=true&env=http://datatables.org/alltables.env")
        .done(function (data) {
			var theThing = data.query
			var results = theThing
			
			console.log("Count: " + theThing.count + " retrieved on " + theThing.created )

			results = theThing.results.quote
			// console.log(JSON.stringify(results))
			console.log("Start, End, Open, High, Low, Close, Volume, Adj. Close, Day of Week, Day Name")
			for (var indexedQuote in results) {
			    if (results.hasOwnProperty(indexedQuote)) {
					var quote = results[indexedQuote];
					dateComps = quote["date"].split("-");
					date = new Date(dateComps[0], dateComps[1] - 1, dateComps[2]);
					quote["Day"] = date.getDay(); 
			        console.log(indexedQuote + " : " + quote["date"] + ", " +
						quote["Date"] + ", " +
						quote["Open"] + ", " +
						quote["High"] + ", " + 
						quote["Low"] + ", " +
						quote["Close"] + ", " +
						quote["Volume"] + ", " +
						quote["Adj_Close"] + ", " +
						quote["Day"] + ", " +
						weekday[date.getDay()])
			    }
			 }
		
		console.log("All done.")
    });
}

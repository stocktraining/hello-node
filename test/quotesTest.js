var assert = require('chai').assert;
var quote = require('../domain/quotes.js');
var chai = require('chai');
chai.use(require('chai-datetime'));

var weekday=new Array(7);
weekday[0]="Sunday";
weekday[1]="Monday";
weekday[2]="Tuesday";
weekday[3]="Wednesday";
weekday[4]="Thursday";
weekday[5]="Friday";
weekday[6]="Saturday";

suite('QuoteCreation', function() {
  test("quotes are constructed correctly and are immutable", function() {
	var aQuote;
	var aQuoteLikeObject = {}

	aQuoteLikeObject["Date"] = "2013-01-01"
	aQuoteLikeObject["Open"] = "2"
	aQuoteLikeObject["High"] = "5" 
	aQuoteLikeObject["Low"] = "1"
	aQuoteLikeObject["Close"] = "4.4"
	aQuoteLikeObject["Volume"] = "3000"
	aQuoteLikeObject["Adj_Close"] = "4.4"

	aQuote = new quote.Quote(aQuoteLikeObject)
	
	assert.isDefined(aQuote.date)
	assert.isDefined(aQuote.open)
	assert.isDefined(aQuote.high)
	assert.isDefined(aQuote.low)
	assert.isDefined(aQuote.close)
	assert.isDefined(aQuote.adjClose)
	assert.isDefined(aQuote.volume)
	
	assert.equalDate(new Date(2013, 0, 1), aQuote.date())

  })
});

suite('DailyQuoteRetrieval', function(){
  test("getDailyQuotes is defined", function() {
    assert.isDefined(quote.getDailyQuotes);
  }),
// need to figure out how to test the async call to yahoo.
  test("getDailyQuotes async call as expected when online", function() {
	var startDate = '2012-12-01'; // Sunday
	var endDate = '2013-12-07';   // Saturday
	var symbol = 'AAPL'
	
	var dailyQuotes = quote.getDailyQuotes(symbol, startDate, endDate)
	
	// assert.equal(5, dailyQuotes.length)
  })
});

suite('DailyQuoteCreation', function(){
  test("createDailyQuotes is defined", function() {
    assert.isDefined(quote.createDailyQuotes);
  }),
  test("createDailyQuotes on known response creates correct quotes", function() {
	var dailyQuotes = quote.createDailyQuotes(quote.sampleYahooResponse)
	
	// printDailyQuotes(dailyQuotes)
	assert.equal(12, dailyQuotes.length)
  })
});

suite('WeeklyQuoteCreation', function(){
  test("createWeeklyQuotes is defined", function() {
    assert.isDefined(quote.createWeeklyQuotes);
  }),
  test("createWeeklyQuotes on known response creates correct quotes", function() {
	var dailyQuotes = quote.createDailyQuotes(quote.sampleYahooResponse)
	var weeklyQuotes = quote.createWeeklyQuotes(dailyQuotes)
	
	// printWeeklyQuotes(weeklyQuotes)
	assert.equal(3, weeklyQuotes.length)
	assert.equal(2, weeklyQuotes[0]["Count"])
	assert.equal(5, weeklyQuotes[1]["Count"])
	assert.equal(5, weeklyQuotes[2]["Count"])
  })
});

function printDailyQuotes(quotes) {
	console.log(quotes.length + " Daily Quotes:")
	console.log("Start, Open, High, Low, Close, Volume, Adj. Close, Day of Week, Day Name")
	
	for (var indexedQuote in quotes) {
	    if (quotes.hasOwnProperty(indexedQuote)) {
			var quote = quotes[indexedQuote]
			console.log(quote["Date"] + ", " +
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
		var quote = weeklyQuotes[i]
		console.log(quote["StartDate"] + ", " +
			quote["EndDate"] + ", " +
			quote["Open"] + ", " +
			quote["High"] + ", " + 
			quote["Low"] + ", " +
			quote["Close"] + ", " +
			quote["Count"]);		        
	}	
}

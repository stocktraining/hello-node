var assert = require("chai").assert;
var quote = require("../domain/quotes.js");
var chai = require("chai");
var fs = require("fs");
chai.use(require("chai-datetime"));

var weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

suite('QuoteCreation', function() {
    test("quotes are constructed correctly and are immutable", function() {
        var aQuote;
        var aQuoteLikeObject = {};
        var aDate = new Date(2013, 0, 1);

        aQuoteLikeObject["Symbol"] = "CMG";
        aQuoteLikeObject["Date"] = "2013-01-01";
        aQuoteLikeObject["Open"] = "2";
        aQuoteLikeObject["High"] = "5";
        aQuoteLikeObject["Low"] = "1";
        aQuoteLikeObject["Close"] = "4.4";
        aQuoteLikeObject["Volume"] = "3000";
        aQuoteLikeObject["Adj_Close"] = "4.4";

        aQuote = new quote.Quote(aQuoteLikeObject);

        assert.isDefined(aQuote.symbol);
        assert.isDefined(aQuote.date);
        assert.isDefined(aQuote.open);
        assert.isDefined(aQuote.high);
        assert.isDefined(aQuote.low);
        assert.isDefined(aQuote.close);
        assert.isDefined(aQuote.adjClose);
        assert.isDefined(aQuote.volume);
        assert.isDefined(aQuote.startDate);
        assert.isDefined(aQuote.endDate);
        assert.isDefined(aQuote.count);

        assert.equal("CMG", aQuote.symbol());
        assert.equalDate(aDate, aQuote.date());
        assert.equal(2, aQuote.open());
        assert.equal(5, aQuote.high());
        assert.equal(1, aQuote.low());
        assert.equal(4.4, aQuote.close());
        assert.equal(3000, aQuote.volume());
        assert.equal(4.4, aQuote.adjClose());
        // dates default to Date if not supplied
        assert.equalDate(aDate, aQuote.startDate());
        assert.equalDate(aDate, aQuote.endDate());
        assert.equal(1, aQuote.count());

        var date2 = new Date(2012, 5, 5);
        var date3 = new Date(2013, 5, 8);
        aQuoteLikeObject.startDate = date2;
        aQuoteLikeObject.endDate = date3;
        aQuoteLikeObject["Count"] = 5;

        aQuote = new quote.Quote(aQuoteLikeObject);

        assert.equalDate(date2, aQuote.startDate());
        assert.equalDate(date3, aQuote.endDate());
        assert.equal(5, aQuote.count());
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
        var symbol = 'AAPL';
        var dailyQuotes = quote.getDailyQuotes(symbol, startDate, endDate);
    // assert.equal(5, dailyQuotes.length)
    })
});

suite('DailyQuoteCreation', function(){
    test("createDailyQuotes is defined", function() {
        assert.isDefined(quote.createDailyQuotes);
    }),
    test("createDailyQuotes on known response creates correct quotes", function() {
        var sampleResponse = fs.readFileSync("test/resources/sampleYahooQueryResults.txt", {enconding: "utf8"}).toString();
        var sampleYahooResponse = JSON.parse(sampleResponse);

        var dailyQuotes = quote.createDailyQuotes(sampleYahooResponse);

        assert.equal(12, dailyQuotes.length);
        assert.equal("CMG", dailyQuotes[0].symbol());
    })
});

suite('WeeklyQuoteCreation', function(){
    test("createWeeklyQuotes is defined", function() {
        assert.isDefined(quote.createWeeklyQuotes);
    }),
    test("createWeeklyQuotes on known response creates correct quotes", function() {
        var sampleResponse = fs.readFileSync("test/resources/sampleYahooQueryResults.txt", {enconding: "utf8"}).toString();
        var sampleYahooResponse = JSON.parse(sampleResponse);
        var dailyQuotes = quote.createDailyQuotes(sampleYahooResponse);
        var weeklyQuotes = quote.createWeeklyQuotes(dailyQuotes);

        // printWeeklyQuotes(weeklyQuotes)
        assert.equal(3, weeklyQuotes.length);
        assert.equal(2, weeklyQuotes[0].count());
        assert.equal(5, weeklyQuotes[1].count());
        assert.equal(5, weeklyQuotes[2].count());
    })
});

function printDailyQuotes(quotes) {
    console.log(quotes.length + " Daily Quotes:");
    console.log("Start, Open, High, Low, Close, Volume, Adj. Close, Day of Week, Day Name");

    for (var indexedQuote in quotes) {
        if (quotes.hasOwnProperty(indexedQuote)) {
            var quote = quotes[indexedQuote];
            console.log(quote.symbol() + ", " +
                quote.date() + ", " +
                quote.open() + ", " +
                quote.high() + ", " + 
                quote.low() + ", " +
                quote.close() + ", " +
                quote.volume() + ", " +
                quote.adjClose() + ", " +
                (quote.date()).getDay() + ", " +
                weekday[(quote.date()).getDay()]);  
        }
     }  
};

function printWeeklyQuotes(weeklyQuotes) {
    console.log(weeklyQuotes.length + " Weekly Quotes:");
    console.log("Start, End, Open, High, Low, Close, Count");

    for (var i = 0; i < weeklyQuotes.length; i++) {
        var quote = weeklyQuotes[i];
        console.log(quote.startDate() + ", " +
            quote.endDate() + ", " +
            quote.open() + ", " +
            quote.high() + ", " + 
            quote.low() + ", " +
            quote.close() + ", " +
            quote.count());             
    }   
};


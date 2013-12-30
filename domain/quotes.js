var $ = require('jquery');

var Quote = exports.Quote = function(aQuoteLikeObject) {
  this._symbol = aQuoteLikeObject["Symbol"] || "";
  this._aDate;
  if (aQuoteLikeObject["Date"]) {
    var dateComps = aQuoteLikeObject["Date"].split("-")
    this._aDate = new Date(dateComps[0], dateComps[1] - 1, dateComps[2])  // month is zero indexed
  } else {
    this._aDate = new Date(2001, 0, 1)
  }
  this._open = aQuoteLikeObject["Open"] || 0;
  this._high = aQuoteLikeObject["High"] || 0;
  this._low = aQuoteLikeObject["Low"] || 0;
  this._close = aQuoteLikeObject["Close"] || 0;
  this._volume = aQuoteLikeObject["Volume"] || 0;
  this._adjClose = aQuoteLikeObject["Adj_Close"] || 0;
  this._startDate = aQuoteLikeObject.startDate || this._aDate;
  this._endDate = aQuoteLikeObject.endDate || this._aDate;
  this._count = aQuoteLikeObject["Count"] || 1;
}

Quote.prototype = {
  symbol: function() {return this._symbol;},
  date: function() {return this._aDate;},
  open: function() {return this._open;},
  high: function() {return this._high;},
  low: function() {return this._low;},
  close: function() {return this._close;},
  volume: function() {return this._volume;},
  adjClose: function() {return this._adjClose;},
  startDate: function() {return this._startDate;},
  endDate: function() {return this._endDate;},
  count: function() {return this._count;},
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


exports.createDailyQuotes = function(yahooQueryResults) {
  var results = yahooQueryResults.query.results.quote
  var dailyQuotes = []

  for(var i = 0; i < results.length; i++) {
    dailyQuotes.push(new Quote(results[i]))
  }
  
  return dailyQuotes;
}

exports.createWeeklyQuotes = function(dailyQuotes) {
  var weeklyQuotes = [];
  var weeklyQuoteCurrentDay = 0; // no current quote
  var currWeeklyQuote;
  var date;
  var newWeeklyQuote;
  
  for (var indexedQuote in dailyQuotes) {
      if (dailyQuotes.hasOwnProperty(indexedQuote)) {
      var quote = dailyQuotes[indexedQuote];
      date = quote.date()
      if (currWeeklyQuote && (date.getDay() < weeklyQuoteCurrentDay)) {
        // this is an EARLIER day, so update Open/StartDate, not Close/EndDate
        currWeeklyQuote["StartDate"] = quote.date()
        currWeeklyQuote["Open"] = quote.open()
        currWeeklyQuote["High"] = Math.max(currWeeklyQuote["High"], quote.high())
        currWeeklyQuote["Low"] = Math.min(currWeeklyQuote["Low"], quote.low())
        weeklyQuoteCurrentDay = date.getDay();
        currWeeklyQuote["Count"]++;
      } else {
        if (currWeeklyQuote) {
          weeklyQuotes.push(new exports.Quote(currWeeklyQuote))
        }
        currWeeklyQuote = {};
        currWeeklyQuote["Symbol"] = quote.symbol()
        currWeeklyQuote["Date"] = "2012-12-12"
        currWeeklyQuote["StartDate"] = quote.date()
        currWeeklyQuote["EndDate"] = quote.date()
        currWeeklyQuote["Open"] = quote.open()
        currWeeklyQuote["Close"] = quote.close()
        currWeeklyQuote["High"] = quote.high()
        currWeeklyQuote["Low"] = quote.low()
        currWeeklyQuote["Count"] = 1
        weeklyQuoteCurrentDay = date.getDay()
      }
      }
    }
    if (currWeeklyQuote) {
      weeklyQuotes.push(new exports.Quote(currWeeklyQuote))
    }

  return weeklyQuotes;
}

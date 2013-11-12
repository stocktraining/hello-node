// Run this by installing node.js and then "node hello-node.js"
var $ = require('jQuery');

console.log("Hello node!");
getData();

function getData() {
    var url = "http://query.yahooapis.com/v1/public/yql";
    var symbol = "AMZN";
    var data = encodeURIComponent("select * from yahoo.finance.quotes where symbol in ('" + symbol + "')");

    $.getJSON(url, 'q=' + data + "&format=json&diagnostics=true&env=http://datatables.org/alltables.env")
        .done(function (data) {
		console.log(symbol + " bid price: " + data.query.results.quote.LastTradePriceOnly)
    });
}
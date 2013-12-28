var assert = require('chai').assert;
var mac = require('../domain/movingAverageCalculator.js');
var quote = require('../domain/quotes.js');

suite('movingAverageCalculation', function () {
    test("quotes are constructed correctly and are immutable", function () {
        assert.isDefined(mac.movingAverageForQuotes)
    }),
        test("returns empty array if passed null/empty quotes", function () {
            assert.equal(0, mac.movingAverageForQuotes(null, 1).length);
            assert.equal(0, mac.movingAverageForQuotes([], 0).length);
        }),
        test("returns empty array if study period > quote length", function () {
            assert.equal(0, mac.movingAverageForQuotes([1, 2], 3).length);
        }),
        test("use default study period of 1", function() {
            var quotes = [
                new quote.Quote({"Close": 100}),
                new quote.Quote({"Close": 110}),
                new quote.Quote({"Close": 115}),
                new quote.Quote({"Close": 125})
            ];
            assert.deepEqual(mac.movingAverageForQuotes(quotes), [100, 110, 115, 125]);
        }),
        test("study period works as expected", function() {
            var quotes = [
                new quote.Quote({"Close": 105}),
                new quote.Quote({"Close": 110}),
                new quote.Quote({"Close": 115}),
                new quote.Quote({"Close": 120}),
                new quote.Quote({"Close": 125})
            ];
            assert.deepEqual(mac.movingAverageForQuotes(quotes, 1), [105, 110, 115, 120, 125]);
            assert.deepEqual(mac.movingAverageForQuotes(quotes, 2), [0, 107.5, 112.5, 117.5, 122.5]);
            assert.deepEqual(mac.movingAverageForQuotes(quotes, 3), [0, 0, 110, 115, 120]);
            assert.deepEqual(mac.movingAverageForQuotes(quotes, 4), [0, 0, 0, 112.5, 117.5]);
            assert.deepEqual(mac.movingAverageForQuotes(quotes, 5), [0, 0, 0, 0, 115]);
        }),
        test("rounds to 2 decimals, no more no less", function() {
            var quotes = [
                new quote.Quote({"Close": 1}),
                new quote.Quote({"Close": 1.1}),
                new quote.Quote({"Close": 1.111}),
                new quote.Quote({"Close": 1.12})
            ];
            assert.deepEqual(mac.movingAverageForQuotes(quotes, 1), [1, 1.1, 1.11, 1.12]);
            assert.deepEqual(mac.movingAverageForQuotes(quotes, 2), [0, 1.05, 1.11, 1.12]);
        })
});

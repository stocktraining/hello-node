var assert = require('chai').assert;
var strategies = require('../domain/crossoverStrategies.js');
var signal = require('../domain/signals.js');

suite('SignalGeneration', function(){
  test("generate is defined", function() {
    assert.isDefined(signal.generateSignals);
  }),
  test("returns empty array if quotes is null", function() {
	var anObject = {};
	assert.equal(0, signal.generateSignals(null, anObject, anObject).length)
  }),
  test("returns empty array if keyValues is null", function() {
	var anObject = {};
	assert.equal(0, signal.generateSignals(anObject, null, anObject).length)
  }),
  test("returns empty array if strategy is null", function() {
	var anObject = {};
	assert.equal(0, signal.generateSignals(anObject, anObject, null).length)
  }),
  test("returns empty array if quotes length does not match key value length", function() {
	var array1 = [1];
	var array2 = [1, 2];
	var anObject = {};	
	assert.equal(0, signal.generateSignals(array1, array2, anObject).length)
  }),
  test("includes 3 signals by default", function() {
	var quotes = [{"Close" : 1}]
	var avgs = [1]
	var signals = signal.generateSignals(quotes, avgs, strategies.basicCrossoverStrategy)

	assert.equal(true, signals[0].indexOf("Begin Study Period with 1 total quotes.") != -1)	
	assert.equal(true, signals[1].indexOf("Begin trading on index 0.") != -1)	
	assert.equal(true, signals[2].indexOf("End trading with position flat.") != -1)	
  }),
  test("uses Close label by default", function() {
	var quotes = [{"Close" : 1}, {"Close" : 2}]
	var avgs = [1.5, 1.5]
	var signals = signal.generateSignals(quotes, avgs, strategies.basicCrossoverStrategy)

	assert.equal(4, signals.length)
  }),
  test("allows override label", function() {
	var quotes = [{"testVal" : 1}, {"testVal" : 2}]
	var avgs = [1.5, 1.5]
	var signals = signal.generateSignals(quotes, avgs, strategies.basicCrossoverStrategy, "testVal")

	assert.equal(4, signals.length)
	assert.equal(true, signals[3].indexOf("long") != -1)
  }),
  test("generates Buy signal on crossover", function() {
	var quotes = [{"Close" : 1}, {"Close" : 2}]
	var avgs = [1.5, 1.5]
	var signals = signal.generateSignals(quotes, avgs, strategies.basicCrossoverStrategy)

	assert.equal(4, signals.length)
	assert.equal(true, signals[2].indexOf("Buy") != -1)	
  }),
  test("generates Sell signal on crossover", function() {
	var quotes = [{"Close" : 2}, {"Close" : 1}]
	var avgs = [1.5, 1.5]
	var signals = signal.generateSignals(quotes, avgs, strategies.basicCrossoverStrategy)

	assert.equal(5, signals.length)
	assert.equal(true, signals[3].indexOf("Sell") != -1)	
  }),
  test("includes key value in signal", function() {
	var quotes = [{"Close" : 2}, {"Close" : 1}]
	var avgs = [1.5, 1.7]
	var signals = signal.generateSignals(quotes, avgs, strategies.basicCrossoverStrategy)

	assert.equal(true, signals[2].indexOf("1.5") != -1)	
	assert.equal(true, signals[3].indexOf("1.7") != -1)	
  }),
  test("includes ending position", function() {
	var quotes = [{"Close" : 1}, {"Close" : 2}]
	var avgs = [1.5, 1.5]
	var signals = signal.generateSignals(quotes, avgs, strategies.basicCrossoverStrategy)

	assert.equal(4, signals.length)
	assert.equal(true, signals[3].indexOf("long") != -1)
	
	quotes.push({"Close" : 1})
	avgs.push(1)
	signals = signal.generateSignals(quotes, avgs, strategies.basicCrossoverStrategy)

	assert.equal(5, signals.length)
	assert.equal(true, signals[4].indexOf("flat") != -1)
  })
});

// handy for outputting the signals for inspection
// for (var i = 0; i < signals.length; i++) {
//     console.log(i + " : " + signals[i])
// }

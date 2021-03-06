var assert = require('chai').assert;
var strategies = require('../domain/crossoverStrategies.js');
var signal = require('../domain/signals.js');
var quote = require('../domain/quotes.js');

suite('SignalCreation', function () {
    test("signals are constructed correctly and are immutable", function () {
        var aSignal = new signal.Signal(0, 1, "12-13-2013", 123.45, "A description")

        assert.isDefined(aSignal.fromPosition);
        assert.isDefined(aSignal.toPosition);
        assert.isDefined(aSignal.date);
        assert.isDefined(aSignal.price);
        assert.isDefined(aSignal.description);

        assert.equal(0, aSignal.fromPosition());
        assert.equal(1, aSignal.toPosition());
        assert.equal("12-13-2013", aSignal.date());
        assert.equal(123.45, aSignal.price());
        assert.equal("A description", aSignal.description());

        aSignal.fromPos = 10; // shouldn't work because signal constructor makes it immutable
        assert.equal(0, aSignal.fromPosition())

        aSignal.toPos = 10; // shouldn't work because signal constructor makes it immutable
        assert.equal(1, aSignal.toPosition())

        aSignal.transDate = "10"; // shouldn't work because signal constructor makes it immutable
        assert.equal("12-13-2013", aSignal.date())

        aSignal.transPrice = 10; // shouldn't work because signal constructor makes it immutable
        assert.equal(123.45, aSignal.price())
    }),
        test("boolean transactional works", function () {
            assert.isTrue((new signal.Signal(0, 1)).transactional());
            assert.isTrue((new signal.Signal(1, 0)).transactional());
            assert.isFalse((new signal.Signal(1, 1)).transactional());
            assert.isFalse((new signal.Signal(0, 0)).transactional());
        })
});

suite('SignalGeneration', function () {
    test("generate is defined", function () {
        assert.isDefined(signal.generateSignals);
    }),
        test("returns empty array if quotes is null", function () {
            var anObject = {};
            assert.equal(0, signal.generateSignals(null, anObject, anObject).length)
        }),
        test("returns empty array if keyValues is null", function () {
            var anObject = {};
            assert.equal(0, signal.generateSignals(anObject, null, anObject).length)
        }),
        test("returns empty array if strategy is null", function () {
            var anObject = {};
            assert.equal(0, signal.generateSignals(anObject, anObject, null).length)
        }),
        test("returns empty array if quotes length does not match key value length", function () {
            var array1 = [1];
            var array2 = [1, 2];
            var anObject = {};
            assert.equal(0, signal.generateSignals(array1, array2, anObject).length)
        }),
        test("returns empty array if passed empty arrays", function () {
            assert.equal(0, signal.generateSignals([], [], {}).length)
        }),
        test("includes 3 signals by default", function () {
            var quotes = [
                new quote.Quote({"Close": 1})
            ]
            var avgs = [1];
            var signals = signal.generateSignals(quotes, avgs, strategies.basicCrossoverStrategy)

            assert.equal(true, signals[0].description().indexOf("Begin Study Period with 1 total quotes.") != -1);
            assert.equal(true, signals[1].description().indexOf("Begin trading on index 0.") != -1);
            assert.equal(true, signals[2].description().indexOf("End trading with position flat.") != -1);
        }),
        test("uses Close label by default", function () {
            var quotes = [
                new quote.Quote({"Close": 1}),
                new quote.Quote({"Close": 2})
            ];
            var avgs = [1.5, 1.5];
            var signals = signal.generateSignals(quotes, avgs, strategies.basicCrossoverStrategy);

            assert.equal(4, signals.length)
        }),
//        test("allows override label", function () {
//            var quotes = [
//                {"testVal": 1},
//                {"testVal": 2}
//            ];
//            var avgs = [1.5, 1.5];
//            var signals = signal.generateSignals(quotes, avgs, strategies.basicCrossoverStrategy, "testVal")
//
//            assert.equal(4, signals.length)
//            assert.equal(true, signals[3].indexOf("long") != -1)
//        }),
        test("generates Buy signal on crossover", function () {
            var quotes = [
                new quote.Quote({"Close": 1}),
                new quote.Quote({"Close": 2})
            ];
            var avgs = [1.5, 1.5];
            var signals = signal.generateSignals(quotes, avgs, strategies.basicCrossoverStrategy)

            assert.equal(4, signals.length)
            assert.equal(true, signals[2].description().indexOf("Buy") != -1)
        }),
        test("generates Sell signal on crossover", function () {
            var quotes = [
                new quote.Quote({"Close": 2}),
                new quote.Quote({"Close": 1})
            ];
            var avgs = [1.5, 1.5];
            var signals = signal.generateSignals(quotes, avgs, strategies.basicCrossoverStrategy);

            assert.equal(5, signals.length);
            assert.equal(true, signals[3].description().indexOf("Sell") != -1)
        }),
        test("includes key value in signal", function () {
            var quotes = [
                new quote.Quote({"Close": 2}),
                new quote.Quote({"Close": 1})
            ];
            var avgs = [1.5, 1.7];
            var signals = signal.generateSignals(quotes, avgs, strategies.basicCrossoverStrategy);

            assert.equal(true, signals[2].description().indexOf("1.5") != -1);
            assert.equal(true, signals[3].description().indexOf("1.7") != -1);
        }),
        test("includes ending position", function () {
            var quotes = [
                new quote.Quote({"Close": 1}),
                new quote.Quote({"Close": 2})
            ];
            var avgs = [1.5, 1.5];
            var signals = signal.generateSignals(quotes, avgs, strategies.basicCrossoverStrategy);

            assert.equal(4, signals.length);
            assert.equal(true, signals[3].description().indexOf("long") != -1);
            assert.equal(true, signals[3].toPosition());

            quotes.push(new quote.Quote({"Close": 1}));
            avgs.push(1);
            signals = signal.generateSignals(quotes, avgs, strategies.basicCrossoverStrategy);

            assert.equal(5, signals.length);
            assert.equal(true, signals[4].description().indexOf("flat") != -1)
            assert.equal(false, signals[4].toPosition());
        })
});

suite('SignalBuyAndHoldReturnCalculation', function () {
    test("buyAndHoldReturn is defined", function () {
        assert.isDefined(signal.buyAndHoldReturn);
    }),
        test("buyAndHoldReturn is correct for a break even trade", function () {
            var quotes = [
                new quote.Quote({"Close": 100}),
                new quote.Quote({"Close": 90.55}),
                new quote.Quote({"Close": 110.10}),
                new quote.Quote({"Close": 100})
            ];
            var avgs = [110, 105, 110, 120];
            var signals = signal.generateSignals(quotes, avgs, strategies.basicCrossoverStrategy);

            assert.equal(0, signal.buyAndHoldReturn(signals));
        }),
        test("buyAndHoldReturn is correct for a winning trade", function () {
            var quotes = [
                new quote.Quote({"Close": 100}),
                new quote.Quote({"Close": 90.55}),
                new quote.Quote({"Close": 110.10}),
                new quote.Quote({"Close": 125.25})
            ];
            var avgs = [110, 105, 110, 120];
            var signals = signal.generateSignals(quotes, avgs, strategies.basicCrossoverStrategy);

            assert.equal(25.25, signal.buyAndHoldReturn(signals));
        }),
        test("buyAndHoldReturn is correct for a losing trade", function () {
            var quotes = [
                new quote.Quote({"Close": 100}),
                new quote.Quote({"Close": 90.55}),
                new quote.Quote({"Close": 110.10}),
                new quote.Quote({"Close": 98.00})
            ];
            var avgs = [110, 105, 110, 120];
            var signals = signal.generateSignals(quotes, avgs, strategies.basicCrossoverStrategy);

            assert.equal(-2, signal.buyAndHoldReturn(signals));
        })
});

suite('calculateReturn', function () {
    test("calculateReturn is defined", function () {
        assert.isDefined(signal.calculateReturn);
    }),
        test("calculateReturn is correct for a break even trade", function () {
            var quotes = [
                new quote.Quote({"Close": 100}),  // buys here since 100 > 99
                new quote.Quote({"Close": 90.55}),
                new quote.Quote({"Close": 100}),  // sells here for break even
                new quote.Quote({"Close": 110.10})
            ];
            var avgs = [99, 90, 110, 120];
            var signals = signal.generateSignals(quotes, avgs, strategies.basicCrossoverStrategy);

            assert.equal(0, signal.calculateReturn(signals));
        }),
        test("calculateReturn is correct for a winning trade", function () {
            var quotes = [
                new quote.Quote({"Close": 100}), // buy here since 100 > 90
                new quote.Quote({"Close": 90.55}),
                new quote.Quote({"Close": 110.11}), // sell here since 110.10 < 111
                new quote.Quote({"Close": 125.25})
            ];
            var avgs = [90, 90, 111, 130];
            var signals = signal.generateSignals(quotes, avgs, strategies.basicCrossoverStrategy);

            assert.equal(10.11, signal.calculateReturn(signals));
        }),
        test("calculateReturn is correct for a compound winning trade", function () {
            var quotes = [
                new quote.Quote({"Close": 100}),
                new quote.Quote({"Close": 110}),
                new quote.Quote({"Close": 100}),
                new quote.Quote({"Close": 110})
            ];
            var avgs = [99, 111, 99, 111];
            var signals = signal.generateSignals(quotes, avgs, strategies.basicCrossoverStrategy);

            assert.equal(21, signal.calculateReturn(signals));
        }),
        test("calculateReturn is correct for a losing trade", function () {
            var quotes = [
                new quote.Quote({"Close": 100}),
                new quote.Quote({"Close": 90.00}),  // buy since 90.0 > 89
                new quote.Quote({"Close": 110.10}),
                new quote.Quote({"Close": 81.00})  // sell since 81 < 95
            ];
            var avgs = [110, 89, 110, 95];
            var signals = signal.generateSignals(quotes, avgs, strategies.basicCrossoverStrategy);

            assert.equal(-10, signal.calculateReturn(signals));
        })
});

// handy for outputting the signals for inspection
// for (var i = 0; i < signals.length; i++) {
//     console.log(i + " : " + signals[i].description())
// }

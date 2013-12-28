exports.Signal = function (fromPosition, toPosition, date, price, description) {

//	this.fromPos = fromPosition  --> this style would expose the variable for manipulation

    var fromPos = fromPosition;
    var toPos = toPosition;
    var transDate = date;
    var transPrice = price;
    var desc = description;

    // TODO rewrite class so that these methods are on the class prototype instead of part of each instantiated object.
    this.fromPosition = function () {
        return fromPos;
    };
    this.toPosition = function () {
        return toPos;
    };
    this.date = function () {
        return transDate;
    };
    this.price = function () {
        return transPrice;
    };
    this.description = function () {
        return desc;
    };
    this.transactional = function () {
        return fromPos != toPos;
    }
}

exports.generateSignals = function (quotes, keyValues, strategy) {
    if (!quotes || !keyValues || !strategy || quotes.length != keyValues.length || quotes.length == 0) {
        return [];
    }

    var signals = [];
    var index = 0;
    var numberOfValues = keyValues.length;
    var position = 0; // 0 indicates flat, > 0 indicates number of units
    var action;
    var description;

    description = "Begin Study Period with " + numberOfValues + " total quotes.";
    signals.push(new exports.Signal(0, 0, quotes[0].date(), quotes[0].close(), description));
    while (index < numberOfValues && keyValues[index] == 0) {
        index++
    }
    description = "Begin trading on index " + index + ".";
    signals.push(new exports.Signal(0, 0, quotes[index].date(), quotes[index].close(), description));
    for (; index < numberOfValues; index++) {
        var newPos = strategy.position(quotes[index].close(), keyValues[index]);
        if (newPos != position) {
            action = newPos > position ? "Buy" : "Sell";
            description = action + " at " + quotes[index].close() + " based on key value of " + keyValues[index];
            signals.push(new exports.Signal(position, newPos, quotes[index].date(), quotes[index].close(), description));
            position = newPos;
        }
    }
    description = "End trading with position " + (position ? "long" : "flat") + ".";
    signals.push(new exports.Signal(position, position, quotes[index - 1].date(), quotes[index - 1].close(), description));

    return signals;
};

exports.buyAndHoldReturn = function(signals) {
  // some embedded knowledge here, might be nice to make it programmatic.
  // [0] is studyPeriod
  // [1] is start trading
  // [length-1] is ending amount

    return 100*(signals[signals.length-1].price() - signals[1].price())/signals[1].price();
};
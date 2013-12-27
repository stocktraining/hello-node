
exports.Signal = function(fromPosition, toPosition, date, price) {

//	this.fromPos = fromPosition  --> this style would expose the variable for manipulation
	
	var fromPos = fromPosition
	var toPos = toPosition
	var transDate = date
	var transPrice = price
	
	this.fromPosition = function() {return fromPos;}
	this.toPosition = function() {return toPos;}
	this.date = function() {return transDate;}
	this.price = function() {return transPrice;}
}

exports.generateSignals = function(quotes, keyValues, strategy, quoteValueLabel) {
	if (!quotes || !keyValues || !strategy || quotes.length != keyValues.length) {
		return [];
	}
	
	quoteValueLabel = quoteValueLabel || "Close"
	
	var signals = []
	var index = 0
	var numberOfValues = keyValues.length
	var position = 0 // 0 indicates flat, 1 indicates long
	var action
	
	signals.push("Begin Study Period with " + numberOfValues + " total quotes.");
	while (index < numberOfValues && keyValues[index] == 0) {
		index++
	}
	signals.push("Begin trading on index " + index + ".");
	for (;index < numberOfValues; index++) {
		var newPos = strategy.position(quotes[index][quoteValueLabel], keyValues[index])
		if (newPos != position) {
			position = newPos;
			action = position ? "Buy" : "Sell"
			signals.push(action + " at " + quotes[index][quoteValueLabel] + " based on key value of " + keyValues[index])
		}
	}
	signals.push("End trading with position " + (position ? "long" : "flat") + ".");
	return signals;
}

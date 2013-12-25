
exports.basicCrossoverStrategy = {
	positionLong: function(val, keyVal) { return val > keyVal; },
	position: function(val, keyVal) { return this.positionLong(val, keyVal) ? 1 : 0; }
}

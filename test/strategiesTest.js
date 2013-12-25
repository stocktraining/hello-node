var assert = require('chai').assert;
var strategies = require('../domain/strategies/crossoverStrategies.js');

suite('BasicCrossover', function(){
  test("basicCrossoverStrategy is defined", function() {
    assert.isDefined(strategies.basicCrossoverStrategy);
  }),
  test("bCS flat for equal values", function() {
	assert.equal(false, strategies.basicCrossoverStrategy.positionLong(1, 1))
	assert.equal(0, strategies.basicCrossoverStrategy.position(1, 1))
  }),
  test("bCS long for above values", function() {
		assert.equal(true, strategies.basicCrossoverStrategy.positionLong(1.1, 1))
		assert.equal(1, strategies.basicCrossoverStrategy.position(1.1, 1))
  }),
  test("bCS flat for below values", function() {
		assert.equal(false, strategies.basicCrossoverStrategy.positionLong(.9, 1))
		assert.equal(0, strategies.basicCrossoverStrategy.position(.9, 1))
  })
});


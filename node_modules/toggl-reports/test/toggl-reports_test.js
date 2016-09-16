'use strict';

var Reports = require('../lib/toggl-reports.js');

/*
  ======== A Handy Little Mocha Reference ========
  https://github.com/visionmedia/mocha/

  Test assertions:
    assert.fail(actual, expected, message, operator)
    assert(value, message), assert.ok(value, [message])
    assert.equal(actual, expected, [message])
    assert.notEqual(actual, expected, [message])
    assert.deepEqual(actual, expected, [message])
    assert.notDeepEqual(actual, expected, [message])
    assert.strictEqual(actual, expected, [message])
    assert.notStrictEqual(actual, expected, [message])
    assert.throws(block, [error], [message])
    assert.doesNotThrow(block, [message])
    assert.ifError(value)

    Apart from assert, Mocha allows you to use any of the following assertion libraries:
    - should.js
    - chai
    - expect.js
    - better-assert
*/

var assert = require('assert');


describe('The api client', function(){
  describe('is invoked without an api key', function(){
    it('should trow an error', function(done){

      assert.throws(function(){
        new Reports();
      });

      done();
    })
  });

  describe('is invoked without an ua property', function(){
    it('should always have a default ua property', function(done){

      var reports = new Reports('foobar');

      assert.equal(reports.ua, 'node-toggl-reports');

      done();
    })
  });
});


describe('Report functions', function(){

  describe('weekly', function(){
    it('should throw an error when there is no workspace_id', function(done){

      var reports = new Reports('foobar');

      assert.throws(function(){
        reports.weekly();
      });

      done();
    });

    it('should not throw an error when a string is passed as first param', function(done){

      var reports = new Reports('foobar');

      assert.doesNotThrow(function(){
        reports.weekly('some-bogus-workspace-id');
      });

      done();
    })
  });

  describe('summary', function(){
    it('should throw an error when there is no workspace_id', function(done){

      var reports = new Reports('foobar');

      assert.throws(function(){
        reports.summary();
      });

      done();
    })
  });

  describe('detailed', function(){
    it('should throw an error when there is no workspace_id', function(done){

      var reports = new Reports('foobar');

      assert.throws(function(){
        reports.detailed();
      });

      done();
    })
  });

});

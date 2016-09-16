/*
 * toggl-reports
 * https://github.com/anthonyringoet/toggl-reports
 *
 * Copyright (c) 2014 Anthony Ringoet
 * Licensed under the MIT license.
 */

'use strict';

var request = require('superagent');

module.exports = Client;

function Client(key, ua) {
  if (!(this instanceof Client)) return new Client(key, ua);
  if (!key) throw new TypeError('A valid api token is required');
  this.remote = 'https://toggl.com/reports/api/v2';
  this.ua = ua || 'node-toggl-reports';
  this.key = key;
}


// weekly call: options object
// - workspace_id

Client.prototype.weekly = function(options, fn){
  if (options){

    if (typeof options === 'string'){
      var original = options;
      options = {};
      options.workspace_id = original;
    }
  }
  else{
    throw new TypeError('A workspace_id is required');
  }

  options.user_agent = this.ua;

  request
  .get(this.remote + '/weekly')
  .auth(this.key, 'api_token')
  .query(options)
  .end(function(err, res){
    if (err) return fn(err);
    if (res.error) return fn(new Error(res.body.error));

    fn(null, res.body);
  });
}

// detailed call: options object
// - workspace_id
// - since
// - until
// - page

Client.prototype.detailed = function(options, fn){
  if (!options || !options.workspace_id) throw new TypeError('A workspace_id is required');

  options.user_agent = this.ua;

  request
  .get(this.remote + '/details')
  .auth(this.key, 'api_token')
  .query(options)
  .end(function(err, res){
    if (err) return fn(err);
    if (res.error) return fn(new Error(res.body.error));

    fn(null, res.body);
  });
}


// summary call: options object
// - workspace_id
// - since
// - until
// - grouping
// - subgrouping

Client.prototype.summary = function(options, fn){
  if (!options || !options.workspace_id) throw new TypeError('A workspace_id is required');

  options.user_agent = this.ua;

  request
  .get(this.remote + '/summary')
  .auth(this.key, 'api_token')
  .query(options)
  .end(function(err, res){
    if (err) return fn(err);
    if (res.error) return fn(new Error(res.body.error));

    fn(null, res.body);
  });
}
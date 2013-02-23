/*
 * GET nearby trails, returns JSON
 */


exports.index = function(req, res){
  var Trails = require('../models/trails');
  Trails.fetch(function(err, result) {
    res.contentType('application/json');
    if (err) res.send(err);
    else res.send(result);
  });
};
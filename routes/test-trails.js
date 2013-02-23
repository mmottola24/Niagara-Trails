
/*
 * Test Page
 */

exports.list = function(req, res){
  var Trails = require('../models/trails');
  Trails.fetch(function(err, result) {
    if (err) res.send(err);
    else res.send(result);
  });
};
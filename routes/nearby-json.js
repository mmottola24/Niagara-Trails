/*
 * GET nearby trails, returns JSON
 */


exports.index = function(req, res){
  var Trails = require('../models/trails');

  var lat = parseFloat(req.query['lat']),
  	lng = parseFloat(req.query['lng']),
  	radius = parseFloat(req.query['radius']);

  if (isNaN(lat) || isNaN(lng) || isNaN(radius)) {
  	res.send('Parameter error');
  	return;
  }

  Trails.getNearestTrails(lat, lng, radius, function(err, result) {
  	res.contentType('application/json');
    if (err) res.send(err);
    else res.send(result);
  });
};
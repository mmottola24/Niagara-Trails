
/*
 * GET nearby trails
 */

exports.index = function(req, res){
  res.render('nearby_trails', { title: 'Nearby Trails in Niagara', page_name: 'nearby-trails' });
};

/*
 * GET about page
 */

exports.index = function(req, res){
  res.render('about', { title: 'About Niagara Trails', page_name: 'about' });
};
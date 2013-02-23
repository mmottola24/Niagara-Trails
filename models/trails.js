module.exports = {
	apiPath: 'http://niagaraodi.cloudapp.net:8080/v1/Niagara%20Open%20Data/NiagaraTrails/?&format=kml',
	fetch: function(callback) {
		var xml2js = require('xml2js'),
		request = require('request');

		request(
			this.apiPath,
			function(err, response, body) {
				if (!err && response.statusCode == 200) {
					xml2js.parseString(body, function(err, result) {
						if (typeof callback === 'function') {
							callback(err, result);
						}
					});
				}
				if (typeof callback === 'function') {
					callback(err, null);
				}
			}
		);
	}
};
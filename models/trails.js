module.exports = {

	apiPath: 'http://niagaraodi.cloudapp.net:8080/v1/Niagara%20Open%20Data/NiagaraTrails/?&format=kml',

	fetch: function(callback) {
		var xml2js = require('xml2js'),
		request = require('request'),
		trails = this;

		request(
			trails.apiPath,
			function(err, response, body) {
				if (!err && response.statusCode == 200) {
					xml2js.parseString(body, function(err, result) {
						if (typeof callback === 'function') {
							if (err) { callback(err, null); return; }
							trails.organize(result, callback);
						}
					});
				}
				if (typeof callback === 'function') {
					callback(err, null);
				}
			}
		);
	},

	organize: function(fullData, callback) {
		var trimData = {},
			trails = this;

		if (!fullData.hasOwnProperty('kml') || !fullData.kml.hasOwnProperty('Document')) {
			callback('KML malformed data: no Document', null);
			return;
		}
		fullData = fullData.kml.Document;
		if (!fullData.length || !fullData[0].hasOwnProperty('Placemark')) {
			callback('KML malformed data: no Placemark', null);
			return;
		}
		fullData = fullData[0].Placemark;

		for(var i = 0; i < fullData.length; i++) {
			var location = trails.normalizeLocation(fullData[i]);
			if (!location) continue;

			if (!trimData.hasOwnProperty(fullData[i].name)) {
				trimData[fullData[i].name] = [];
			}

			trimData[fullData[i].name].push(location);
		}

		if (typeof callback === 'function') {
			callback(null, trimData);
		}
	},

	normalizeLocation: function(fullData) {
		var location = {}, coords;

		if (typeof fullData != 'object'
			|| !fullData.hasOwnProperty('name')
			|| !fullData.hasOwnProperty('LineString')
			|| !fullData.LineString[0].hasOwnProperty('coordinates')) return false;

		location.description = '';
		if (fullData.hasOwnProperty('description')) {
			location.description = fullData.description[0];
		}

		coords = [];
		for(var i = 0; i < fullData.LineString[0].coordinates.length; i++) {
			var coordSet = fullData.LineString[0].coordinates[i];
			coordSet = coordSet.split(' ');
			for(var j = 0; j < coordSet.length; j++) {
				if (!coordSet[j].match(/\d+\.\d+/i)) continue;
				coordSet[j] = coordSet[j].split(',');
				coords.push({
					'lat': coordSet[j][0],
					'lng': coordSet[j][1]
				});
			}
		}

		location.coordinates = coords;

		return location;
	}
};
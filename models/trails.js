module.exports = {

	apiPath: 'http://niagaraodi.cloudapp.net:8080/v1/Niagara%20Open%20Data/NiagaraTrails/?&format=kml',
	trails: null,

	getTrails: function(callback) {
		var trailsObj = this;
		if (trailsObj.trails !== null) {
			if (typeof callback === 'function') {
				callback(null, trailsObj.trails);
			}
		} else {
			trailsObj.fetch(function(err, result) {
				if (typeof callback === 'function') {
					if (err) {
						callback(err, null);
					} else {
						trailsObj.trails = result;
						callback(null, result);
					}
				}
			});
		}
	},

	getNearestTrails: function(lat, lng, radius, callback) {
		var trailsObj = this;
		trailsObj.getTrails(function(err, trails) {
			if (err) {
				if (typeof callback === 'function') callback(err, null);
				return;
			}

			var segment, segLat, segLng, segDistance,
				nearbySegments = [];

			for(var name in trails) {
				if (!trails.hasOwnProperty(name)) continue;

				for(var i = 0; i < trails[name].length; i++) {
					segment = trails[name][i];

					for(var j = 0; j < segment.coordinates.length; j++) {
						segLat = segment.coordinates[j].lat;
						segLng = segment.coordinates[j].lng;
						segDistance = trailsObj.getDistance(lat, lng, segLat, segLng);

						if (segDistance < radius) {
							nearbySegments.push({
								coordinates: segment,
								distance: segDistance,
								trailName: name
							});
						}
					}
				}
			}

			if (typeof callback === 'function') {
				callback(null, nearbySegments);
			}
		});
	},

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
	},

	getDistance: function(lat1, lng1, lat2, lng2) {
		var rads = function(num) {
    		return num * Math.PI / 180;
		};

		return (
	        6371 * Math.acos(
	            Math.cos(
	                rads(lat1)
	            ) *
	            Math.cos(
	                rads(lat2)
	            ) *
	            Math.cos(
	                rads(lng2) - rads(lng1)
	            ) +
	            Math.sin(
	                rads(lat1)
	            ) *
	            Math.sin(
	                rads(lat2)
	            )
	        )
	    );
	}
};
function DataManager(map, addressManager, defaultFilter) {
	this.define = {
		url: 'http://localhost/geovetph/server/index.php',
		map: map,
		addressManager: addressManager,
		previousFilter: null,
		localityClusters: [],
		provinceClusters: [],
		regionClusters: []
	};

	var defaultDate = {};
	var self = this;
	var filter = JSON.parse(JSON.stringify(defaultFilter));
	var geocoderHelper = new GeocoderHelper(new google.maps.Geocoder());
	this.define.geocoderHelper = geocoderHelper;

	defaultDate.from = defaultFilter.date.from;
	defaultDate.to = defaultFilter.date.to;
	filter.date = defaultDate;

	var defaultSeverity = [];
	var severity = defaultFilter.severity;
	var severityLength = severity.length;
	for(var i=0; i<severityLength; i++) {
		if(severity[i].selected) {
			defaultSeverity.push(i);
		}
	}
	if(defaultSeverity.length === severityLength) defaultSeverity = [];
	filter.severity = defaultSeverity;
	this.define.currentFilter = filter;
	// google.maps.event.addListenerOnce(map, 'tilesloaded', function() {
		self._fetchData(self.define.currentFilter, function(results) {
			self.define.data = results;
			self._clusterData(self.define.data);
		});
	// });
}

DataManager.prototype = {
	_fetchData: function(filter, callback) {
		var self = this;
		$.ajax({
			url: this.define.url,
			type: 'POST',
			data: {
				func: 'get',
				type: 6,
				filter: JSON.stringify(filter)
			},
			success: function(results) {
				var data = JSON.parse(results);
				callback(data);
			}
		});
	},

	setFilter: function(filterValues) {
		var self = this;
		this._fetchData(filterValues, function(results) {
			self.define.previousFilter = JSON.parse(JSON.stringify(self.define.currentFilter));
			self.define.currentFilter = filterValues;
			console.log(results);
			console.log("DataManager.setFilter: Data fetched");
		});
	},

	setLocation: function(locationValues) {
		var newFilter = JSON.parse(JSON.stringify(this.define.currentFilter));
		if(locationValues.localityId !== newFilter.location.localityId ||
			locationValues.provinceId !== newFilter.location.provinceId ||
			locationValues.regionId !== newFilter.location.regionId) {
			var self = this;

			newFilter.location.localityId = locationValues.localityId;
			newFilter.location.provinceId = locationValues.provinceId;
			newFilter.location.regionId = locationValues.regionId;

			console.log(this.define.currentFilter.location);
			console.log(newFilter.location);
			console.log("Location changed");

			this._fetchData(newFilter, function(results) {
				self.define.previousFilter = JSON.parse(JSON.stringify(self.define.currentFilter));
				self.define.currentFilter = newFilter;
				console.log(results);
				console.log("DataManager.setLocation: Data fetched");
			});
		}
	},

	getCurrentData: function() {
		return this.define.data;
	},

	_clusterData: function(data) {
		var dataLength = data.length;
		var self = this;
		var geocoderHelper = this.define.geocoderHelper;
		var addToLocalityClusters = function(data, index) {
			if(index < data.length) {
				var item = data[index];

				item.post_id = Number.parseInt(item.post_id);
				item.locality_id = Number.parseInt(item.locality_id);
				item.severity = Number.parseInt(item.severity);
				
				var localityClustersIndex = self._findLocalityCluster(item.locality_id);
				var localityClusters = self.define.localityClusters;
				var address = (item.province_name === "NCR")?
					item.locality_name + ", NCR, Philippines" :
					item.locality_name + ", " + item.province_name + ", " + item.region_long_name + ", Philippines";
				var cluster;

				if(localityClustersIndex === -1) {
					cluster = new GeoCluster(self.define.map, {
						name: address,
						type: 'locality',
						id: item.locality_id
					});

					if(item.locality_longitude !== null && item.locality_latitude !== null) {
						item.locality_latitude = Number.parseFloat(item.locality_latitude);
						item.locality_longitude = Number.parseFloat(item.locality_longitude);
						cluster.setLatLng(item.locality_latitude, item.locality_longitude);
					}
					else geocoderHelper.addRequest(cluster);
					
					localityClusters.push(cluster);
				}
				else cluster = localityClusters[localityClustersIndex];

				cluster.addPost({
					postId: item.post_id,
					severity: item.severity
				});
			}
			else {
				console.log("Finished locality clustering");
			}
			addToProvinceClusters(data, index);
		};
		var addToProvinceClusters = function(data, index) {
			if(index < data.length) {
				if(data[index].province_name !== "NCR") {
					var item = data[index];

					item.post_id = Number.parseInt(item.post_id);
					item.province_id = Number.parseInt(item.province_id);

					var provinceClustersIndex = self._findProvinceCluster(item.province_id);
					var provinceClusters = self.define.provinceClusters;
					var address = item.province_name + ", " + item.region_long_name + ", Philippines";
					var cluster;

					if(provinceClustersIndex === -1) {
						cluster = new GeoCluster(self.define.map, {
							name: address,
							type: 'province',
							nextType: 'locality',
							id: item.province_id
						});
						
						if(item.province_longitude !== null && item.province_latitude !== null) {
							item.province_latitude = Number.parseFloat(item.province_latitude);
							item.province_longitude = Number.parseFloat(item.province_longitude);
							cluster.setLatLng(item.province_latitude, item.province_longitude);
						}
						else geocoderHelper.addRequest(cluster);

						provinceClusters.push(cluster);
					}
					else cluster = provinceClusters[provinceClustersIndex];

					if(cluster.itemExist(item.locality_id) === -1) cluster.addItem(item.locality_id);

					cluster.addPost({
						postId: item.post_id,
						severity: item.severity
					});
				}
			}
			else {
				console.log("Finished province clustering");
			}
			addToRegionClusters(data, index);
		};
		var addToRegionClusters = function(data, index) {
			if(index < data.length) {
				var item = data[index];

				item.post_id = Number.parseInt(item.post_id);
				item.region_id = Number.parseInt(item.region_id);

				var regionClustersIndex = self._findRegionCluster(item.region_id);
				var regionClusters = self.define.regionClusters;
				var address = item.region_long_name + ", Philippines";
				var cluster;

				if(regionClustersIndex === -1) {
					var nextType = (item.province_name === "NCR")? 'locality' : 'province';
					cluster = new GeoCluster(self.define.map, {
						name: address,
						type: 'region',
						nextType: nextType,
						id: item.region_id
					});
					
					if(item.region_longitude !== null && item.region_latitude !== null) {
						item.region_latitude = Number.parseFloat(item.region_latitude);
						item.region_longitude = Number.parseFloat(item.region_longitude);
						cluster.setLatLng(item.region_latitude, item.region_longitude);
					}
					else geocoderHelper.addRequest(cluster);

					regionClusters.push(cluster);
				}
				else cluster = regionClusters[regionClustersIndex];

				var itemCluster = (item.province_name === "NCR")? item.locality_id : item.province_id;
				if(cluster.itemExist(itemCluster) === -1) cluster.addItem(itemCluster);

				cluster.addPost({
					postId: item.post_id,
					severity: item.severity
				});

				addToLocalityClusters(data, index+1);
			}
			else {
				console.log("Finished region clustering");
				geocoderHelper.addRequest(function() {
					console.log("geocoding requests finished");
					var localityClusters = self.define.localityClusters;
					var localityClustersLength = localityClusters.length;
					for(var i=0; i<localityClustersLength; i++) {
						localityClusters[i].prepareMarker();
						var marker = localityClusters[i].getMarker();
						google.maps.event.addDomListener(marker, 'click', function(cluster) {
							console.log("Marker clicked");
							console.log(cluster);
						});
					}

					var provinceClusters = self.define.provinceClusters;
					var provinceClustersLength = provinceClusters.length;
					for(var i=0; i<provinceClustersLength; i++) {
						provinceClusters[i].prepareMarker();
						var marker = provinceClusters[i].getMarker();
						google.maps.event.addDomListener(marker, 'click', function(cluster) {
							console.log("Marker clicked");
							console.log(cluster);
						});
					}

					var regionClusters = self.define.regionClusters;
					var regionClustersLength = regionClusters.length;
					for(var i=0; i<regionClustersLength; i++) {
						regionClusters[i].prepareMarker(true);
						var marker = regionClusters[i].getMarker();
						google.maps.event.addDomListener(marker, 'click', function(cluster) {
							console.log("Marker clicked");
							console.log(cluster);
						});
					}
				});
			}
		};

		addToLocalityClusters(data, 0);
	},

	_findRegionCluster: function(regionId) {
		var regionClusters = this.define.regionClusters;
		var regionClustersLength = regionClusters.length;

		for(var i=0; i<regionClustersLength; i++) {
			if(regionClusters[i].getId() === regionId) {
				return i;
			}
		}

		return -1;
	},

	_findProvinceCluster: function(provinceId) {
		var provinceClusters = this.define.provinceClusters;
		var provinceClustersLength = provinceClusters.length;

		for(var i=0; i<provinceClustersLength; i++) {
			if(provinceClusters[i].getId() === provinceId) {
				return i;
			}
		}

		return -1;
	},

	_findLocalityCluster: function(localityId) {
		var localityClusters = this.define.localityClusters;
		var localityClustersLength = localityClusters.length;

		for(var i=0; i<localityClustersLength; i++) {
			if(localityClusters[i].getId() === localityId) {
				return i;
			}
		}

		return -1;
	},
};

function GeocoderHelper(geocoder) {
	this.define = {
		url: 'http://localhost/geovetph/server/index.php',
		geocoder: geocoder,
		requests: [],
		processing: false
	}
};

GeocoderHelper.prototype = {
	_geocode: function(request, callback) {
		var self = this;
		var geocoder = this.define.geocoder;
		geocoder.geocode({address: request.getAddress()}, function(results, status) {
			if(status === google.maps.GeocoderStatus.OK) {
				var longitude = results[0].geometry.location.lng();
				var latitude = results[0].geometry.location.lat();
				request.setLatLng(latitude, longitude);

				$.ajax({
					url: self.define.url,
					type: 'POST',
					data: {
						func: 'update',
						type: 0,
						table: request.getType(),
						id: request.getId(),
						longitude: longitude,
						latitude: latitude
					},
					success: function(results){
						console.log(results);
					}
				});
				callback();
			}
		});
	},

	_process: function() {
		console.log("processing");
		this.define.processing = true;
		var self = this;
		(function next() {
			if(self.define.requests.length > 0) {
				setTimeout(function() {
					if(self.define.requests.length === 2 && $.isFunction(self.define.requests[1]))
						self._geocode(self.define.requests.shift(), self.define.requests.shift());
					else self._geocode(self.define.requests.shift(), next);
				}, 1000);
			}
			else {
				console.log("processing end");
				self.define.processing = false;
			}
		})();
	},

	addRequest: function(cluster) {
		console.log("adding request");
		this.define.requests.push(cluster);
		if(!this.define.processing) {
			if($.isFunction(cluster)) {
				var callback = this.define.requests.shift();
				callback();
			}
			else this._process();
		}
	}
};

/**
* 	filter format
*		filter: 
*			{
*				location:
*					{
*						localityId: (int),
*						provinceId: (int),
*						regionId: (int)
*					},
*				animal:
*					[(int), ...],
*				disease:
*					[(int), ...],
*				date:
*					{
*						to: (string),
*						from: (string)
*					}
*			}
*
*	default filter
*		defaultFilter:
*			{
*				location:
*					{
*						localityId: null,
*						provinceId: null,
*						regionId: null
*					},
*				animal:
*					[],
*				disease:
*					[],
*				date:
*					{
*						to: (formatted date value),
*						from: (formatted date value)
*					}
*			}
**/
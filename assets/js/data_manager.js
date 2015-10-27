function DataManager(map, defaultFilter) {
	this.define = {
		url: 'http://localhost/geovetph/server/index.php',
		map: map,
		previousFilter: null
	};

	var defaultDate = {};
	var self = this;

	defaultDate.from = defaultFilter.date.from;
	defaultDate.to = defaultFilter.date.to;
	defaultFilter.date = defaultDate;
	this.define.currentFilter = defaultFilter;
	this._fetchData(this.define.currentFilter, function(results) {
		self._clusterData(results);
	});
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

	_clusterData: function(data) {
		console.log(data);
		console.log("DataManager.constructor: Data fetched");
		var map = this.define.map;
		var center = map.getCenter();
		var options = {
			latitude: center.lat(),
			longitude: center.lng(),
			count: 23,
			severity: 1,
			visibility: true
		};

		var gm = new GeoMarker(map, options);
		google.maps.event.addDomListener(gm, 'click', function(){
			console.log("Marker clicked!");
		});

		google.maps.event.addDomListener(gm, 'mouseover', function() {
			console.log("Marker mouse over!");
		});

		google.maps.event.addDomListener(gm, 'mouseout', function() {
			console.log("Marker mouse out!");
		});
	}
};

// function DataCluster(options) {
// 	this.define = {
// 		name: options.name,
// 		type: options.type,
// 		id: options.id,
// 		severity: options.severity || 0,
// 		subClusters: options.subClusters || [],
// 		details: options.details || {}
// 	};

// 	this.define.itemCount = this.define.subClusters.length;
// 	this.define.clusterIcon = new GeoMarker(this.define.severity, this.define.itemCount);
// }

// DataCluster.prototype = {
// 	_restyle: function() {

// 	},
	
// 	addItem: function(item, displayFlag) {
// 		this.define.itemCount++;
// 		this.define.clusterIcon.updateItemCount(this.define.itemCount);
// 		if(this.define.severity < item.severity) {
// 			this.define.severity;
// 			this.define.clusterIcon.updateSeverity(this.define.severity);
// 		}
// 		if(displayFlag) this.define.clusterIcon.show();
// 	},

// 	removeItem: function() {

// 	}

// 	getName: function() {
// 		return this.define.name;
// 	},

// 	getType: function() {
// 		return this.define.type;
// 	},

// 	getId: function() {
// 		return this.define.id;
// 	},

// 	getSeverity: function() {
// 		return this.define.severity;
// 	},

// 	getSubClusters: function() {
// 		return this.define.subClusters;
// 	},

// 	getDetails: function() {
// 		return this.define.details;
// 	},

// 	setSeverity: function(level) {
// 		this.define.severity = level;
// 		this.
// 	},

// 	setDetails: function(details, mergeFlag) {
// 		if(mergeFlag) this.define.details.extend(details);
// 		else this.define.details = details;
// 	}
// }

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
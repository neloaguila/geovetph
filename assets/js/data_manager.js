function DataManager(defaultFilter) {
	this.define = {
		url: 'http://localhost/geovetph/server/index.php',
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

	}
};

function DataCluster(options, style) {
	this.define = {
		name: options.name,
		type: options.type,
		id: options.id,
		details: option.details || {}, // severity, itemCount
		subClusters: options.subClusters || [],
		style: style
	};

	this.define.details.itemCount = this.define.subClusters.length;
}

DataCluster.prototype = {
	_restyle: function() {

	},
	
	add: function(item) {
		this.define.details.itemCount++;
		if(this.define.details.severity < item.severity) this.define.details.severity;
		this._restyle();
	}
}

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
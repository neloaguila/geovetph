function GeoCluster(map, options) {
	this.define = {
		map: map,
		name: options.name,
		type: options.type,
		id: options.id,
		longitude: options.longitude || 0,
		latitude: options.latitude || 0,
		count: options.count || 0,
		severityCount: options.severityCount || [0,0,0],
		innerData: [],
		postData: []
	};
};

GeoCluster.prototype = {
	_updateSeverity: function() {
		var severityLevel = 0;
		var severityCount = this.define.severityCount;
		var severityCountLength = severityCount.length;

		for(var i=0; i<severityCountLength; i++) {
			if(severityCount[i] >= severityCount[severityLevel]) {
				severityLevel = i;
			}
		}

		this.define.severity = severityLevel;
	},

	addItem: function(item) {
		this.define.innerData.push(item);
	},

	addPost: function(item) {
		this.define.postData.push(item.postId);
		this.define.count++;
		this.define.severityCount[item.severity]++;
		this._updateSeverity();
		if(this.define.geomarker) this.define.geomarker.update(this.define.count, this.define.severity);
	},

	itemExist: function(item) {
		return this.define.innerData.indexOf(item);
	},

	getId: function() {
		return this.define.id;
	},

	getPosts: function() {
		return this.define.postData;
	},

	showGeomarker: function() {
		this.define.geomarker.show();
	},

	hideGeomarker: function() {
		this.define.geomarker.hide();
	},

	prepareMarker: function(visibility) {
		var options = {
			latitude: this.define.latitude,
			longitude: this.define.longitude,
			count: this.define.count,
			severity: this.define.severity,
			visibility: visibility || false
		};

		var geomarker = new GeoMarker(this.define.map, this, options);
		this.define.geomarker = geomarker;
	},

	getMarker: function() {
		return this.define.geomarker;
	},

	getInnerData: function() {
		return this.define.innerData;
	},

	getAddress: function() {
		return this.define.name;
	},

	getType: function() {
		return this.define.type;
	},

	setLatLng: function(latitude, longitude) {
		this.define.latitude = latitude;
		this.define.longitude = longitude;
	},

	isVisible: function() {
		return this.define.geomarker.isVisible();
	}
};
function GeoCluster(map, options) {
	this.define = {
		map: map,
		name: options.name,
		address: options.address,
		type: options.type,
		id: options.id,
		longitude: options.longitude || 0,
		latitude: options.latitude || 0,
		count: options.count || 0,
		severityCount: options.severityCount || [0,0,0],
		previousType: options.previousType,
		nextType: options.nextType,
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
			// if(severityCount[i] >= severityCount[severityLevel]) {
			// 	severityLevel = i;
			// }
			if(severityCount[i] !== 0) severityLevel = i;
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

	removeGeomarker: function() {
		this.define.geomarker.setMap(null);
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

	getNextType: function() {
		return this.define.nextType;
	},

	getPreviousType: function() {
		return this.define.previousType;
	},

	getLatLng: function() {
		return new google.maps.LatLng(this.define.latitude, this.define.longitude);
	},

	getLocality: function() {
		return {name: this.define.address.locality, id: this.define.address.localityId};
	},

	getProvince: function() {
		return {name: this.define.address.province, id: this.define.address.provinceId};
	},

	getRegion: function() {
		return {name: this.define.address.region, id: this.define.address.regionId};
	},

	getCount: function() {
		return this.define.count;
	},

	getSeverity: function() {
		return this.define.severityCount;
	},

	setLatLng: function(latitude, longitude) {
		this.define.latitude = latitude;
		this.define.longitude = longitude;
	},

	isVisible: function() {
		return (this.define.geomarker)? this.define.geomarker.isVisible() : false;
	}
};
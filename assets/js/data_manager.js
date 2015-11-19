function DataManager(map, addressManager, defaultFilter, diseaseInfo) {
	this.define = {
		url: 'http://localhost/geovetph/server/index.php',
		map: map,
		addressManager: addressManager,
		diseaseInfo: diseaseInfo,
		previousFilter: null,
		localityClusters: [],
		provinceClusters: [],
		regionClusters: [],
		countryCluster: null,
		minRegionZoom: 6,
		minProvinceZoom: 9,
		minLocalityZoom: 10,
		previousType: -1,
		currentType: -1,
		nextType: -1,
		infoboxDisplayable: true
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
	this.define.severityGuide = severity;
	diseaseInfo.setSeverityGuide(severity);

	this.define.infobox = $('#infobox');

	this.define.currentFilter = filter;
	this._fetchData(self.define.currentFilter, function(results) {
		self.define.diseaseInfo.setData(results);
		self._clusterData(results);
	});

	google.maps.event.addDomListener(map, 'zoom_changed', function() {
		self._displayMarkers();
	});

	google.maps.event.addDomListener(map, 'tilesloaded', function() {
		self.define.infoboxDisplayable = true;
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
				
				var localityClustersIndex = self._findClusterIndex(3, item.locality_id);
				var localityClusters = self.define.localityClusters;
				var address = (item.province_name === "NCR")?
					item.locality_name + ", NCR, Philippines" :
					item.locality_name + ", " + item.province_name + ", " + item.region_long_name + ", Philippines";
				var cluster;

				if(localityClustersIndex === -1) {
					var previousType = (item.province_name === "NCR")? 1 : 2;
					cluster = new GeoCluster(self.define.map, {
						name: address,
						address: {
							locality: item.locality_name,
							localityId: item.locality_id,
							province: item.province_name,
							provinceId: item.province_id,
							region: item.region_name,
							regionId: item.region_id
						},
						type: 3,
						id: item.locality_id,
						previousType: previousType ,
						nextType: -1
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
			addToProvinceClusters(data, index);
		};
		var addToProvinceClusters = function(data, index) {
			if(index < data.length) {
				if(data[index].province_name !== "NCR") {
					var item = data[index];

					item.post_id = Number.parseInt(item.post_id);
					item.province_id = Number.parseInt(item.province_id);
					item.region_id = Number.parseInt(item.region_id);

					var provinceClustersIndex = self._findClusterIndex(2, item.province_id);
					var provinceClusters = self.define.provinceClusters;
					var address = item.province_name + ", " + item.region_long_name + ", Philippines";
					var cluster;

					if(provinceClustersIndex === -1) {
						cluster = new GeoCluster(self.define.map, {
							name: address,
							address: {
								province: item.province_name,
								provinceId: item.province_id,
								region: item.region_name,
								regionId: item.region_id
							},
							type: 2,
							previousType: 1,
							nextType: 3,
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
			addToRegionClusters(data, index);
		};
		var addToRegionClusters = function(data, index) {
			if(index < data.length) {
				var item = data[index];

				item.post_id = Number.parseInt(item.post_id);
				item.region_id = Number.parseInt(item.region_id);

				var regionClustersIndex = self._findClusterIndex(1, item.region_id);
				var regionClusters = self.define.regionClusters;
				var address = item.region_long_name + ", Philippines";
				var cluster;

				if(regionClustersIndex === -1) {
					var nextType = (item.province_name === "NCR")? 3 : 2;
					cluster = new GeoCluster(self.define.map, {
						name: address,
						address: {
							region: item.region_name,
							regionId: item.region_id
						},
						type: 1,
						previousType: 0,
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
					if(item.province_name === "NCR") self.define.provinceClusters.push(cluster);
				}
				else cluster = regionClusters[regionClustersIndex];

				var itemCluster = (item.province_name === "NCR")? item.locality_id : item.province_id;
				if(cluster.itemExist(itemCluster) === -1) cluster.addItem(itemCluster);

				cluster.addPost({
					postId: item.post_id,
					severity: item.severity
				});
			}
			addToCountryCluster(data, index);
		};
		var addToCountryCluster = function(data, index) {
			if(index < data.length) {
				var item = data[index];

				item.post_id = Number.parseInt(item.post_id);

				var countryCluster = self.define.countryCluster;

				var itemCluster = item.region_id;
				if(countryCluster.itemExist(itemCluster) === -1) countryCluster.addItem(itemCluster);

				countryCluster.addPost({
					postId: item.post_id,
					severity: item.severity
				});

				addToLocalityClusters(data, index+1);
			}
			else {
				geocoderHelper.addRequest(function() {
					var localityClusters = self.define.localityClusters;
					var localityClustersLength = localityClusters.length;
					for(var i=0; i<localityClustersLength; i++) {
						localityClusters[i].prepareMarker();
						var marker = localityClusters[i].getMarker();
						google.maps.event.addDomListener(marker, 'click', function(cluster) {
							self.define.map.setCenter(cluster.getLatLng());
							self.define.diseaseInfo.openList(cluster);
						});

						self._attachInfobox(marker);
					}

					var provinceClusters = self.define.provinceClusters;
					var provinceClustersLength = provinceClusters.length;
					for(var i=0; i<provinceClustersLength; i++) {
						provinceClusters[i].prepareMarker();
						var marker = provinceClusters[i].getMarker();
						google.maps.event.addDomListener(marker, 'click', function(cluster) {
							self._hideInfoboxImmediately();
							self.define.infoboxDisplayable = false;

							self.define.map.setCenter(cluster.getLatLng());
							self.define.previousType = cluster.getPreviousType();
							self.define.currentType = cluster.getType();
							self.define.nextType = cluster.getNextType();

							var nextFilter = JSON.parse(JSON.stringify(self.define.currentFilter));
							nextFilter.location.regionId = cluster.getRegion().id;
							nextFilter.location.provinceId = cluster.getProvince().id;
							nextFilter.location.localityId = null;
							self.define.previousFilter = JSON.parse(JSON.stringify(self.define.currentFilter));
							self.define.currentFilter = nextFilter;

							self.define.map.setZoom(self.define.minLocalityZoom);

							self._displayToast(1, {
								currentAddress: cluster.getAddress(),
								currentCount: cluster.getCount()
							}, 2000);

							if(cluster.getRegion().name !== "NCR") {
								self.define.addressManager.setLocation({
									province: {
										name: cluster.getProvince().name,
										province_id: cluster.getProvince().id
									},
									region: {
										name: cluster.getRegion().name,
										region_id: cluster.getRegion().id
									}
								});
							}
						});

						self._attachInfobox(marker);
					}

					var regionClusters = self.define.regionClusters;
					var regionClustersLength = regionClusters.length;
					for(var i=0; i<regionClustersLength; i++) {
						regionClusters[i].prepareMarker();
						var marker = regionClusters[i].getMarker();
						google.maps.event.addDomListener(marker, 'click', function(cluster) {
							self._hideInfoboxImmediately();
							self.define.infoboxDisplayable = false;

							self.define.map.setCenter(cluster.getLatLng());
							self.define.previousType = cluster.getPreviousType();
							self.define.currentType = cluster.getType();
							self.define.nextType = cluster.getNextType();

							var nextFilter = JSON.parse(JSON.stringify(self.define.currentFilter));
							nextFilter.location.regionId = cluster.getRegion().id;
							nextFilter.location.provinceId = null;
							nextFilter.location.localityId = null;
							self.define.previousFilter = JSON.parse(JSON.stringify(self.define.currentFilter));
							self.define.currentFilter = nextFilter;

							self._displayToast(1, {
								currentAddress: cluster.getAddress(),
								currentCount: cluster.getCount()
							}, 2000);

							var zoom = (cluster.getNextType() === 2)? self.define.minProvinceZoom : self.define.minLocalityZoom;
							self.define.map.setZoom(zoom);
							self.define.addressManager.setLocation({
								region: {
									name: cluster.getRegion().name,
									region_id: cluster.getRegion().id
								}
							});
						});

						self._attachInfobox(marker);
					}

					var countryCluster = self.define.countryCluster;
					countryCluster.prepareMarker();
					var marker = countryCluster.getMarker();
					google.maps.event.addDomListener(marker, 'click', function(cluster) {
						self._hideInfoboxImmediately();

						self.define.map.setCenter(cluster.getLatLng());
						self.define.previousType = cluster.getPreviousType();
						self.define.currentType = cluster.getType();
						self.define.nextType = cluster.getNextType();
						self.define.map.setZoom(self.define.minRegionZoom);

						self._displayToast(1, {
							currentAddress: cluster.getAddress(),
							currentCount: cluster.getCount()
						}, 2000);
					});

					self._attachInfobox(marker);

					self._displayMarkers();
					self._displayToast(1, {
						currentAddress: countryCluster.getAddress(),
						currentCount: countryCluster.getCount()
					}, 2000);

					self.define.diseaseInfo.setClusters({
						localityClusters: localityClusters,
						provinceClusters: provinceClusters,
						regionClusters: regionClusters
					});
				});
			}
		};

		this._clearMarkers(null, true);

		this.define.localityClusters = [];
		this.define.provinceClusters = [];
		this.define.regionClusters = [];

		var countryCluster = this.define.countryCluster = new GeoCluster(this.define.map, {
			name: 'Philippines',
			type: 0,
			id: 0,
			nextType: 1,
			previousType: -1
		});

		geocoderHelper.addRequest(countryCluster);

		addToLocalityClusters(data, 0);
	},

	_attachInfobox: function(marker) {
		var self = this;
		google.maps.event.addDomListener(marker, 'mouseover', function(cluster) {
			if(self.define.infoboxTimeout) clearTimeout(self.define.infoboxTimeout);
			var addressMain;
			var addressMore;
			switch(cluster.getType()) {
				case 0:
					addressMain = "Philippines";
					addressMore = null;
					break;
				case 1:
					addressMain = cluster.getRegion().name;
					addressMore = "Philippines";
					break;
				case 2:
					addressMain = cluster.getProvince().name;
					addressMore = cluster.getRegion().name + ", Philippines";
					break;
				case 3:
					addressMain = cluster.getLocality().name;
					addressMore = (cluster.getProvince().name === "NCR")? "" : cluster.getProvince().name + ", ";
					addressMore += cluster.getRegion().name + ", Philippines";
					break;
			}
			var details = {
				addressMain: addressMain,
				count: cluster.getCount(),
				severity: cluster.getSeverity(),
				position: cluster.getLatLng()
			};
			if(addressMore) details.addressMore = addressMore;
			if(self.define.infoboxDisplayable) self._displayInfobox(details, cluster);
		});

		google.maps.event.addDomListener(marker, 'mouseout', function() {
			self._hideInfobox();
		});
	},

	_findClusterIndex: function(type, id) {
		var clusters;
		switch(type) {
			case 1:
				clusters = this.define.regionClusters;
				break;
			case 2:
				clusters = this.define.provinceClusters;
				break;
			case 3:
				clusters = this.define.localityClusters;
				break;
		}

		var clustersLength = clusters.length;
		for(var i=0; i<clustersLength; i++) {
			if(clusters[i].getId() === id) return i;
		}
		return -1;
	},

	_clearMarkers: function(type, deepClear) {
		var countryCluster = this.define.countryCluster;
		var regionClusters = this.define.regionClusters;
		var provinceClusters = this.define.provinceClusters;
		var localityClusters = this.define.localityClusters;

		var clusters = [];
		if(type !== 0) clusters = (countryCluster)? clusters.concat(countryCluster) : [];
		if(type !== 1) clusters = clusters.concat(regionClusters);
		if(type !== 2) clusters = clusters.concat(provinceClusters);
		if(type !== 3) clusters = clusters.concat(localityClusters);
		var clusterLength = clusters.length;

		for(var i=0; i<clusterLength; i++) if(clusters[i].isVisible()) clusters[i].hideGeomarker();
		if(deepClear) for(var i=0; i<clusterLength; i++) clusters[i].removeGeomarker();
	},

	_toggleSubMarkers: function(type, nextType, id) {
		this._clearMarkers();
		var currentCluster;
		var nextCluster;

		switch(type) {
			case 0:
				currentCluster = this.define.countryCluster;
				break;
			case 1:
				currentCluster = this.define.regionClusters;
				break;
			case 2:
				currentCluster = this.define.provinceClusters;
				break;
		}

		switch(nextType) {
			case 1:
				nextCluster = this.define.regionClusters;
				break;
			case 2:
				nextCluster = this.define.provinceClusters;
				break;
			case 3:
				nextCluster = this.define.localityClusters;
				break;
		}

		if(type === 1 && nextType === 3 && this.define.nextType !== 3) {
			var subClusters = currentCluster[this._findClusterIndex(type, id)].getInnerData();
			var subClustersLength = subClusters.length;
			var localityClusters = [];
			for(var i=0; i<subClustersLength; i++) localityClusters = localityClusters.concat(this.define.provinceClusters[this._findClusterIndex(2, subClusters[i])].getInnerData());
			var localityClustersLength = localityClusters.length;
			for(var i=0; i<localityClustersLength; i++) nextCluster[this._findClusterIndex(nextType, localityClusters[i])].showGeomarker();
		}
		else {
			var subClusters = (type === 0)? currentCluster.getInnerData() : currentCluster[this._findClusterIndex(type, id)].getInnerData();
			var subClustersLength = subClusters.length;

			for(var i=0; i<subClustersLength; i++) nextCluster[this._findClusterIndex(nextType, subClusters[i])].showGeomarker();
		}
		
	},

	_toggleMarkersOfType: function(type) {
		this._clearMarkers(type);
		var countryCluster = this.define.countryCluster;
		var regionClusters = this.define.regionClusters;
		var regionClustersLength = regionClusters.length;
		var provinceClusters = this.define.provinceClusters;
		var provinceClustersLength = provinceClusters.length;
		var localityClusters = this.define.localityClusters;
		var localityClustersLength = localityClusters.length;

		switch(type) {
			case 0:
				if(!countryCluster.isVisible()) countryCluster.showGeomarker();
				break;
			case 1:
				for(var i=0; i<regionClustersLength; i++) if(!regionClusters[i].isVisible()) regionClusters[i].showGeomarker();
				break;
			case 2:
				for(var i=0; i<provinceClustersLength; i++) if(!provinceClusters[i].isVisible()) provinceClusters[i].showGeomarker();
				break;
			case 3:
				for(var i=0; i<localityClustersLength; i++) if(!localityClusters[i].isVisible()) localityClusters[i].showGeomarker();
				break;
		}
	},

	_displayMarkers: function() {
		var minRegionZoom = this.define.minRegionZoom;
		var minProvinceZoom = this.define.minProvinceZoom;
		var minLocalityZoom = this.define.minLocalityZoom;
		var zoom = this.define.map.getZoom();
		var regionId = this.define.currentFilter.location.regionId;
		var provinceId = this.define.currentFilter.location.provinceId;

		if(regionId === null) {
			if(zoom < minRegionZoom) {
				this._toggleMarkersOfType(0);
			}
			else if(zoom >= minRegionZoom && zoom < minProvinceZoom) {
				this._toggleMarkersOfType(1);
			}
			else if(zoom >= minProvinceZoom && zoom < minLocalityZoom) {
				this._toggleMarkersOfType(2);

			}
			else if(zoom >= minLocalityZoom) {
				this._toggleMarkersOfType(3);
			}
		}
		else if(provinceId === null) {
			if(zoom >= minProvinceZoom && zoom < minLocalityZoom) this._toggleSubMarkers(this.define.currentType, this.define.nextType, regionId);
			else if(zoom >= minLocalityZoom) {
				if(this.define.nextType === 3) this._toggleSubMarkers(this.define.currentType, this.define.nextType, regionId);
				else this._toggleSubMarkers(this.define.currentType, 3, regionId);
			}
		}
		else {
			if(zoom >= minLocalityZoom) this._toggleSubMarkers(this.define.currentType, this.define.nextType, provinceId);
		}		
	},

	_displayToast: function(type, details, duration) {
		switch(type) {
			case 0:
				var toast = $('<div></div>', {class: 'card inner-toast'});
				var content = $('<div></div>', {class: 'card-content'});
				var action = $('<div></div>', {class: 'card-action grey lighten-5'});
				var actionCount = $('<div></div>');
				var actionText = $('<div></div>');
				toast.css({
					background: 'transparent',
					margin: 0,
					width: '220px',
					lineHeight: '12px',
					fontSize: '12px',
					textAlign: 'center'
				});
				content.css({
					padding: '10px 15px',
					lineHeight: '15px'
				});
				action.css({
					padding: '10px 15px',
					fontWeight: 'bolder',
					color: 'rgba(0,0,0,0.87)'
				});
				actionCount.css({
					padding: '0 10px 5px 10px',
					fontSize: '30px',
					lineHeight: '30px'
				});

				var contentMessage = "There were no posts for " + details.intendedAddress + ". Displaying posts from " + details.currentAddress + ".";
				actionCount.html(details.currentCount);
				actionText.html("Posts from this location");
				content.html(contentMessage);
				action.append(actionCount);
				action.append(actionText);
				toast.append(content);
				toast.append(action);
				break;
			case 1:
				var toast = $('<div></div>', {class: 'card inner-toast'});
				var content = $('<div></div>', {class: 'card-content'});
				var action = $('<div></div>', {class: 'card-action grey lighten-5'});
				var actionCount = $('<div></div>');
				var actionText = $('<div></div>');
				toast.css({
					background: 'transparent',
					margin: 0,
					maxWidth: '220px',
					lineHeight: '12px',
					fontSize: '12px',
					textAlign: 'center'
				});
				content.css({
					padding: '10px 15px',
					lineHeight: '15px'
				});
				action.css({
					padding: '10px 15px',
					fontWeight: 'bolder',
					color: 'rgba(0,0,0,0.87)'
				});
				actionCount.css({
					padding: '0 10px 5px 10px',
					fontSize: '30px',
					lineHeight: '30px'
				});

				var contentMessage = "Displaying posts from " + details.currentAddress + ".";
				actionCount.html(details.currentCount);
				actionText.html("Posts from this location");
				content.html(contentMessage);
				action.append(actionCount);
				action.append(actionText);
				toast.append(content);
				toast.append(action);
				break;
		}

		var durationSet = duration || 2000;
		Materialize.toast(toast, durationSet, 'customize-toast');
	},

	_displayInfobox: function(details, cluster) {
		var self = this;
		var $infobox = this.define.infobox;
		var addressMain = $infobox.find('.address-main');
		var addressMore = $infobox.find('.address-more');
		var totalCount = $infobox.find('.total-count .count div');
		var severityCount = $infobox.find('.severity-count');

		$(addressMain).html(details.addressMain);
		$(addressMore).html("");
		if(details.addressMore) $(addressMore).html(details.addressMore);
		$(totalCount).html(details.count);
		$(severityCount).html("");

		var severityLength = details.severity.length;
		for(var i=0; i<severityLength; i++) {
			var $count = $('<div></div>', {class: 'level'});
			var $countCount = $('<div></div>', {class: 'count'});
			var $countText = $('<div></div>', {class: 'text'});
			$countCount.html(details.severity[i]);
			$countText.html(this.define.severityGuide[i].name);
			$count.append($countCount);
			$count.append($countText);
			$count.css({color: this.define.severityGuide[i].color});
			$(severityCount).append($count);
		}

		this.define.infoboxVisible = true;
		$infobox.stop().show().css('opacity', 1);

		$infobox.on('mouseenter', function(e) {
			if(self.define.infoboxVisible) clearTimeout(self.define.infoboxTimeout);
			$(this).stop().css('opacity', 1);
		});

		$infobox.on('mouseleave', function() {
			self._hideInfobox();
		});

		var viewInfo = $infobox.find('#viewInfo');
		$(viewInfo).off('click').on('click', function() {
			self._hideInfoboxImmediately();
			self.define.diseaseInfo.openList(cluster);
		});
	},

	_hideInfobox: function() {
		var self = this;
		this.define.infoboxTimeout = setTimeout(function() {
			self.define.infobox.animate({opacity: 0}, {
				duration: 1000,
				complete: function() {
					self.define.infoboxVisible = false;
					self.define.infobox.hide();
				}
			});
		}, 2000);
	},

	_hideInfoboxImmediately: function() {
		this.define.infoboxVisible = false;
		this.define.infobox.css('opacity', 1).hide();
	},

	setFilter: function(filterValues) {
		var self = this;
		this._fetchData(filterValues, function(results) {
			self.define.previousFilter = JSON.parse(JSON.stringify(self.define.currentFilter));
			self.define.currentFilter = filterValues;
			self.define.diseaseInfo.setData(results);
			self._clusterData(results);
		});
	},

	setLocation: function(locationValues) {
		var newFilter = JSON.parse(JSON.stringify(this.define.currentFilter));
		if(locationValues.localityId !== newFilter.location.localityId ||
			locationValues.provinceId !== newFilter.location.provinceId ||
			locationValues.regionId !== newFilter.location.regionId) {
			var self = this;

			var localityId = locationValues.localityId;
			var provinceId = locationValues.provinceId;
			var regionId = locationValues.regionId;

			var currentCluster;
			var currentZoom;

			if(regionId === null) {
				currentCluster = this.define.countryCluster;
				currentZoom = this.define.minRegionZoom;
				this._displayToast(1, {
					currentAddress: 'the Philippines',
					currentCount: currentCluster.getCount()
				}, 2000);
			}
			else if(provinceId === null) {
				var index = this._findClusterIndex(1, regionId);
				if(index === -1) {
					currentCluster = this.define.countryCluster;
					currentZoom = this.define.minRegionZoom;
					this._displayToast(0, {
						intendedAddress: locationValues.region,
						currentAddress: currentCluster.getAddress(),
						currentCount: currentCluster.getCount()
					});
					regionId = null;
					this.define.addressManager.setLocation({});
				}
				else {
					currentCluster = this.define.regionClusters[index];
					currentZoom = this.define.minProvinceZoom;
					this._displayToast(1, {
						currentAddress: currentCluster.getAddress(),
						currentCount: currentCluster.getCount()
					}, 2000);
				}
			}
			else if(localityId === null) {
				var index = this._findClusterIndex(2, provinceId);
				if(index === -1) {
					var regionIndex = this._findClusterIndex(1, regionId);
					if(regionIndex === -1) {
						currentCluster = this.define.countryCluster;
						currentZoom = this.define.minRegionZoom;
						this._displayToast(0, {
							intendedAddress: locationValues.province,
							currentAddress: currentCluster.getAddress(),
							currentCount: currentCluster.getCount()
						});
						regionId = null;
						this.define.addressManager.setLocation({});
					}
					else {
						currentCluster = this.define.regionClusters[this._findClusterIndex(1, regionId)];
						currentZoom = this.define.minProvinceZoom;
						this._displayToast(0, {
							intendedAddress: locationValues.province,
							currentAddress: currentCluster.getAddress(),
							currentCount: currentCluster.getCount()
						});
						provinceId = null;
						this.define.addressManager.setLocation({
							region: {
								name: currentCluster.getRegion().name,
								region_id: currentCluster.getRegion().id
							}
						});
					}
				}
				else {
					currentCluster = this.define.provinceClusters[index];
					currentZoom = this.define.minLocalityZoom;
				}
			}

			newFilter.location.localityId = localityId;
			newFilter.location.provinceId = provinceId;
			newFilter.location.regionId = regionId;

			this.define.previousFilter = JSON.parse(JSON.stringify(self.define.currentFilter));
			this.define.currentFilter = newFilter;

			this.define.previousType = currentCluster.getPreviousType();
			this.define.currentType = currentCluster.getType();
			this.define.nextType = currentCluster.getNextType();
			this.define.map.setCenter(currentCluster.getLatLng());	
			this.define.map.setZoom(currentZoom);
		}
	},

	getCurrentData: function() {
		return this.define.data;
	}
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

				if(request.getType() !== 0) {
					var table = (request.getType() === 1)? "region" : (request.getType() === 2)? "province" : "locality";
					$.ajax({
						url: self.define.url,
						type: 'POST',
						data: {
							func: 'update',
							type: 0,
							table: table,
							id: request.getId(),
							longitude: longitude,
							latitude: latitude
						},
						success: function(results){
							console.log(results);
						}
					});
				}
				callback();
			}
		});
	},

	_process: function() {
		this.define.processing = true;
		var self = this;
		(function next() {
			if(self.define.requests.length > 0) {
				setTimeout(function() {
					if(self.define.requests.length === 2 && $.isFunction(self.define.requests[1])) {
						self._geocode(self.define.requests.shift(), self.define.requests.shift());
						self.define.processing = false;
					}
					else self._geocode(self.define.requests.shift(), next);
				}, 1000);
			}
			else self.define.processing = false;
		})();
	},

	addRequest: function(cluster) {
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
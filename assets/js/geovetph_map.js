/**
 *	Container for all the components in the GeoVetPH Map page
 *	which includes an addressManager (AddressManager), a dataFilter
 *	(DataFilter), and the dataManager (DataManager).
 *	
 *	requires the following files:
 *		address_manager.js
 *		data_filter.js
 *		data_manager.js
 *
 */

function GeoVetPHMap(options) {
	this.define = {
		url: 'http://localhost/geovetph/server/index.php',
		defaultFilter: {
			location: {
				regionId: null,
				provinceId: null,
				localityId: null
			},
			animal: [],
			disease: [],
			severity: [
				{name: "Alert", color: 'rgba(255,152,0,1)', selected: true},
				{name: "Warning", color: 'rgba(244,67,54,1)', selected: true},
				{name: "Outbreak", color: 'rgba(173,20,87,1)', selected: true}
			],
			date: {
				selected: "Past week",
				from: "",
				to: ""
			}
		},
		minZoom: options.minZoom || 5,
		maxZoom: options.maxZoom || 11,
		zoom: options.zoom || 6
	};

	var mapStyle = new google.maps.StyledMapType([
		{featureType: 'road', stylers: [{visibility: 'off'}]},
		{featureType: 'poi', stylers: [{visibility: 'off'}]},
		{featureType: 'water', stylers: [{color: '#BDBDBD'}, {lightness: 17}]},
		{featureType: 'landscape', elementType: 'geometry', stylers: [{color: '#F5F5F5'}, {lightness: 100}]},
		{featureType: 'administrative.country', elementType: 'labels', stylers: [{visibility: 'off'}]}
	]);

	var mapStyleId = 'geovetph_map';

	var mapProperties = {
		backgroundColor: "#EEEEEE",
		center: new google.maps.LatLng(12.2566848,122.6217542),
		zoom: this.define.zoom,
		panControl: false,
		rotateControl: false,
		streetViewControl: false,
		mapTypeControl: false,
		zoomControl: false
	};

	var self = this;

	var formatDate = function() {
		// format default date
		var defaults = ["Today", "Past 2 days", "Past 3 days", "Past 4 days", "Past 5 days", "Past 6 days", "Past week", "Past 2 weeks", "Past month, Others..."];
		var defaultDate = (defaults.includes(self.define.defaultFilter.date.selected))?
			self.define.defaultFilter.date.selected : "Past week";
		var fromDate, toDate;

		switch(defaultDate) {
			case "Today":
				toDate = new Date();
				fromDate = new Date();
				break;
			case "Past 2 days":
			case "Past 3 days":
			case "Past 4 days":
			case "Past 5 days":
			case "Past 6 days":
				var days = Number.parseInt(defaultDate.substr(5,1));
				toDate = new Date();
				fromDate = new Date();
				fromDate.setDate(fromDate.getDate() - days);
				break;
			case "Past week":
			case "Past 2 weeks":
				var weeks = Number.parseInt(defaultDate.slice(4,6)) || 1;
				toDate = new Date();
				fromDate = new Date();
				fromDate.setDate(fromDate.getDate() - (7*weeks));
				break;
			case "Past month":
				toDate = new Date();
				fromDate = new Date();
				fromDate.setMonth(fromDate.getMonth() - 1);
				break;
		}
		self.define.defaultFilter.date.to = toDate.getFullYear() + "-" + (toDate.getMonth() + 1) + "-" + toDate.getDate();
		self.define.defaultFilter.date.from = fromDate.getFullYear() + "-" + (fromDate.getMonth() + 1) + "-" + fromDate.getDate();
	};

	formatDate();

	var map = new google.maps.Map(options.mapCanvas, mapProperties);
	var geocoder = new google.maps.Geocoder();
	var addressManager = new AddressManager(options.addressManager);
	var dataFilter = new DataFilter(options.dataFilter, this.define.defaultFilter);
	var dataManager = new DataManager(map, addressManager, this.define.defaultFilter);

	map.mapTypes.set(mapStyleId, mapStyle);
	map.setMapTypeId(mapStyleId);

	this.define.map = map;
	this.define.geocoder = geocoder;
	this.define.addressManager = addressManager;
	this.define.dataFilter = dataFilter;
	this.define.dataManager = dataManager;

	dataFilter.getElement().addEventListener('filter_submit', function(e) {
		self._processFilterData(e.detail.filterValue);
	});

	addressManager.getElement().addEventListener('location_selected', function(e) {
		self._processLocationData(e.detail);
	});
}

GeoVetPHMap.prototype = {
	_processFilterData: function(filter) {
		var location = filter.location;
		var animal = filter.animal;
		var disease = filter.disease;
		var severity = filter.severity;
		var date = filter.date;

		if(location.name !== "" || animal.length !== 0 || disease.length !== 0 || severity.length !== 0 || date.from !== this.define.defaultFilter.date.from || date.to !== this.define.defaultFilter.date.to) {
			var newFilter = JSON.parse(JSON.stringify(this.define.defaultFilter));

			if(animal.length !== 0) {
				var animalLength = animal.length;
				for(var i=0; i<animalLength; i++) {
					newFilter.animal.push(animal[i].id);
				}
			}
			if(disease.length !== 0) {
				var diseaseLength = disease.length;
				for(var i=0; i<diseaseLength; i++) {
					newFilter.disease.push(disease[i].id);
				}
			}
			newFilter.date = date;
			if(severity.length !== 0) {
				newFilter.severity = severity;
			}

			if(location.name != "") {
				var address = location.full_address;
				var get = function(type) {
					var addressLength = address.length;
					for(var i=0; i<addressLength; i++) {
						var types = address[i].types;
						if(types.includes(type)) {
							return [address[i].short_name, address[i].long_name];
						}
					}
					return "";
				};
				var locality = get('locality')[1];
				var region = get('administrative_area_level_1');
				var province = "";
				if(region[0] === "NCR") province = "NCR";
				else province = get('administrative_area_level_2')[0];

				var cityIndex = locality.search("City");
				if(cityIndex && cityIndex + 4 === locality.length) {
					locality = locality.slice(0, locality.length - 5);
				}

				var self = this;
				$.ajax({
					url: this.define.url,
					type: 'POST',
					data: {
						func: 'get',
						type: 5,
						locality: locality,
						province: province,
						region: region
					},
					success: function(results) {
						var data = JSON.parse(results);
						console.log(results);
						if(data !== -1) {
							newFilter.location.regionId = Number.parseInt(data.region.region_id);
							newFilter.location.provinceId = Number.parseInt(data.province.province_id);
							newFilter.location.localityId = Number.parseInt(data.locality.locality_id);

							self.define.dataManager.setFilter(newFilter);
							self.define.addressManager.setLocation(data);
						}
					}
				});
			}
			else {
				this.define.dataManager.setFilter(newFilter);
			}
		}
	},

	_processLocationData: function(location) {
		var locationFilter = JSON.parse(JSON.stringify(this.define.defaultFilter.location));
	
		switch(location.type) {
			case "province":
				locationFilter.provinceId = location.provinceId;
			case "region":
				locationFilter.regionId = location.regionId;
				break;
		}

		this.define.dataManager.setLocation(locationFilter);
	},

	getMap: function() {
		return this.define.map;
	},

	getGeocoder: function() {
		return this.define.geocoder;
	},

	getDataManager: function() {
		return this.define.dataManager;
	},

	getAddressManager: function() {
		return this.define.addressManager;
	},

	getDataFilter: function() {
		return this.define.dataFilter;
	}
}
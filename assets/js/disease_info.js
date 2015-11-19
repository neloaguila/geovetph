function DiseaseInfo(elem, loader) {
	this.define = {
		elem: elem,
		loader: loader,
		data: null,
		diseaseInfoVisisble: false
	};

	var self = this;
	var diseaseList = $(elem).find('#disease-list');
	var diseaseListLoader = this.define.diseaseListLoader = new Loader(diseaseList, {});
	var infoDisease = $(elem).find('#info-disease');
	var infoDiseaseLoader = this.define.infoDiseaseLoader = new Loader(infoDisease, {});
	var closeBtn = $(elem).find('#close-icon');
	$(closeBtn).on('click', function() {
		if(self.define.diseaseInfoVisisble) {
			$(self.define.elem).css('right', '-100%');
			self.define.loader.hideOverlay();
			self.define.diseaseInfoVisisble = false;
			var list = $(self.define.elem).find('ul');
			$(list).html("");
		}
	});
}

DiseaseInfo.prototype = {
	_getItemFromData: function(id) {
		var data = this.define.data;
		return data.find(function(element, index, array) {
			if(element.post_id === id) return true;
			else return false;
		});
	},

	_selectItem: function(item) {
		var info = this._getItemFromData($(item).data('id'));
		var elem = this.define.elem;

		var currentSelected = $(elem).find('li:not(.list-divider).selected');
		$(currentSelected).removeClass('selected');

		$(item).addClass('selected');

		var severity = $(elem).find('#info-disease #severity .severity-level');
		$(severity).css('background', this.define.severityGuide[info.severity].color);
		$(severity).html(this.define.severityGuide[info.severity].name);

		var currDate = new Date(info.date_posted);
		var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
		var dateInsertMonth = months[currDate.getMonth()];

		var date = $(elem).find('#info-disease #date .date');
		$(date).html(dateInsertMonth + " " + currDate.getDate() + ", " + currDate.getFullYear());

		var locationMain = $(elem).find('#info-disease #location .location-main');
		$(locationMain).html(info.locality_name);

		var locationMoreInsert = (info.region_name === "NCR")?
			info.region_name + ", Philippines" :
			info.province_name + ", " + info.region_name + ", Philippines";
		var locationMore = $(elem).find('#info-disease #location .location-more');
		$(locationMore).html(locationMoreInsert);

		var diseaseName = $(elem).find('#info-disease #disease .disease-name');
		$(diseaseName).html(info.disease_name);

		var strain = $(elem).find('#info-disease #disease .strain');
		$(strain).html(info.strain);

		var animalGroup = $(elem).find('#info-disease #animal .animal-group');
		$(animalGroup).html(info.animal_group);

		var animalName = $(elem).find('#info-disease #animal .animal-name');
		$(animalName).html(info.common_name);

		var message = $(elem).find('#info-disease #message .message');
		$(message).html(info.message);
	},

	setSeverityGuide: function(severityGuide) {
		this.define.severityGuide = severityGuide;
	},

	setClusters: function(clusters) {
		this.define.clusters = clusters;
	},

	setData: function(data) {
		this.define.data = data;
	},

	getData: function() {
		return this.define.data;
	},

	isSetData: function() {
		if(this.define.data) return true;
		return false;
	},

	openList: function(cluster) {
		var addressMain;
		var addressMore;
		var self = this;
		var elem = this.define.elem;
		var addressMainDiv = $(elem).find('#address-main');
		var addressMoreDiv = $(elem).find('#address-more');
		var listElem = $(elem).find('#disease-list ul');
		var insertByDate = function($elem, arr) {
			arr.sort(function(a, b) {
				var aDate = new Date(a.date_posted);
				var bDate = new Date(b.date_posted);
				return aDate - bDate;
			});

			var currentDate;
			var arrLength = arr.length;
			for(var i=0; i<arrLength; i++) {
				var item = arr[i];
				if(item.date_posted !== currentDate) {
					currentDate = item.date_posted;
					$newDate = $('<li></li>', {class: 'list-divider list-date'});
					$newDate.html(currentDate);
					$elem.append($newDate);
				}
				var $newItem = $('<li></li>');

				var $severity = $('<div></div>', {class: 'severity-level'});
				var $severityIcon = $('<div></div>', {class: 'severity-icon'});
				$severityIcon.css('background', self.define.severityGuide[item.severity].color);
				$severity.append($severityIcon);

				var $diseaseName = $('<div></div>', {class: 'disease-name'});
				$diseaseName.html(item.disease_name);

				var $animalName = $('<div></div>', {class: 'animal-name'});
				$animalName.html(item.animal_group);

				$newItem.append($severity);
				$newItem.append($diseaseName);
				$newItem.append($animalName);
				$newItem.data('id', item.post_id);
				$newItem.data('index', i);

				$elem.append($newItem);
			}

			var itemList = $elem.find('li:not(.list-divider)');
			$(itemList).on('click', function() {
				self._selectItem(this);
			});
		};
		var populateList = function($elem, cluster) {
			if(cluster.getNextType() === -1) {
				var postData = cluster.getPosts().sort();
				var postDataLength = postData.length;
				var inserts = [];
				for(var i=0; i<postDataLength; i++) {
					var item = self._getItemFromData(postData[i]);
					inserts.push(item);
				}
				insertByDate($elem, inserts);
			}
			else {
				var innerData = cluster.getInnerData().sort();
				var innerDataLength = innerData.length;
				var nextClusters;
				var nextClustersType = cluster.getNextType();

				switch(nextClustersType) {
					case 1:
						nextClusters = self.define.clusters.regionClusters;
						break;
					case 2:
						nextClusters = self.define.clusters.provinceClusters;
						break;
					case 3:
						nextClusters = self.define.clusters.localityClusters;
						break;
				}

				for(var i=0; i<innerDataLength; i++) {
					var nextCluster = nextClusters.find(function(element, index, array) {
						if(element.getId() === innerData[i]) return true;
						else return false;
					});

					var location;
					switch(nextClustersType) {
						case 1:
							location = nextCluster.getRegion().name;
							break;
						case 2:
							location = nextCluster.getProvince().name;
							break;
						case 3:
							location = nextCluster.getLocality().name;
							break;
					}

					$item = $('<li></li>', {class: 'list-divider list-location'});
					$itemText = $('<div></div>', {class: 'list-divider-text'});
					$itemText.html(location);
					$itemInner = $('<ul></ul>', {class: 'list-divider-inner'});
					$item.append($itemText);
					$item.append($itemInner);
					$elem.append($item);

					populateList($itemInner, nextCluster);
				}
			}
		};

		this.define.loader.showOverlay();
		$(this.define.elem).css('right', '0');
		this.define.diseaseInfoVisisble = true;

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

		$(addressMainDiv).html(addressMain);
		$(addressMoreDiv).html("");
		if(addressMore) $(addressMoreDiv).html(addressMore);

		var elem = this.define.elem;
		populateList($($(elem).find('ul')), cluster);	
		var itemList = $(elem).find('li:not(.list-divider)');
		this._selectItem(itemList[0]);
		var count = $(elem).find('#count');
		var countText = (cluster.getCount() > 1)? cluster.getCount() + " posts" : "a post";
		$(count).html("Displaying " + countText + " for this location");
	}
};
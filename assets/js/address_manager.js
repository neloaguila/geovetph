function AddressManager(element) {
	this.define = {
		url: 'http://localhost/geovetph/server/index.php',
		elem: element,
		regionListOpen: false,
		regionSelected: false,
		region: null,
		regionId: -1,
		provinceListOpen: false,
		provinceSelected: false,
		province: null,
		provinceId: -1
	};
	this._initializeElement();
	this._initializeStorage();
}

AddressManager.prototype = {
	_initializeStorage: function() {
		if(typeof(Storage) !== 'undefined') this.define.hasSessionStorage = true;
		else this.define.hasSessionStorage = false;
	},

	_initializeElement: function() {
		var elem = this.define.elem;
		var self = this;
		var country = $(elem).find('#country');
		$(country).on('click', function() {
			self._openRegionList();
		});
	},

	_fetchData: function(type, options, callback) {
		var self = this;
		var data;

		if(self.define.hasSessionStorage && window.sessionStorage.getItem(options.key) !== null) {
			data = JSON.parse(window.sessionStorage.getItem(options.key));
			callback(data);
		}
		else if(!self.define.hasSessionStorage && self.define[options.key] !== undefined) {
			data = JSON.parse(this.define[options.key]);
			callback(data);
		}
		else {
			$.ajax({
				url: self.define.url,
				type: 'POST',
				data: {
					func: 'get',
					type: type,
					id: options.id
				},
				success: function(results) {
					data = JSON.parse(results);
					self._storeData(options.key, results);
					callback(data);
				}
			});
		}
	},

	_storeData: function(key, data) {
		if(this.define.hasSessionStorage && window.sessionStorage.getItem(key) === null) window.sessionStorage.setItem(key, data);
		else this.define[key] = data;
	},

	_clearList: function(level) {
		var list = ['region', 'province'];
		for(var i = level; i < 3; i++) {
			var item = list[i];
			if(this.define[item+'ListOpen']) {
				$('#'+item+'List').remove();
				if(i !== level) this.define[item+'ListOpen'] = false;
			}
			if(this.define[item+'Selected']) {
				$('#'+item).remove();
				this.define[item] = null;
				this.define[item+'Selected'] = false;
			}
		}
	},

	_setListMaxHeight: function(list) {
		var windowHeight = $(window).height();
		var maxListHeight = windowHeight * (0.6);
		var listHeight = list.height();
		var itemHeight = list.find('li').first().height();

		if(listHeight >= maxListHeight) {
			var excess = maxListHeight % itemHeight;
			if(excess < itemHeight/2) {
				maxListHeight -= excess;
			}
			else {
				maxListHeight += (itemHeight - excess);
			}
			list.css('max-height', maxListHeight+'px');
		}

		var self = this;
		$(window).on('resize', function() {
			list.css('max-height', 'none');
			self._setListMaxHeight(list);
		});
	},

	_openRegionList: function() {
		this._clearList(0);

		if(!this.define.regionListOpen) {
			var elem = this.define.elem;
			var $regionList = $('<ul></ul>', {
				id: 'regionList',
				class: 'card-panel'
			});
			var $loader = "<div class='progress'><div class='indeterminate'></div></div>";
			var self = this;

			$regionList.html($loader);
			$(elem).append($regionList);
			this.define.regionListOpen = true;

			this._fetchData(0, {key: 'Philippines'}, function(data) {
				$regionList.html("");
				for(var i in data) {
					var $regionItem = $('<li></li>', {
						class: 'regionItem btn-flat waves-effect waves-red grey lighten-5'
					});
					$regionItem.data('id', Number.parseInt(data[i].region_id));
					$regionItem.data('name', data[i].name);
					$regionItem.html(data[i].name);
					$regionItem.on('click', function() {
						var name = $(this).data('name');
						var id = $(this).data('id');
						self._setRegion(name, id, true);
					});
					$regionList.append($regionItem);
				}
				self._setListMaxHeight($regionList);
			});
		}
		else {
			this.define.regionListOpen = false;
			if(window.CustomEvent) {
				var locationSelected = new CustomEvent('location_selected', {
					detail: {
						type: ''
					},
					bubbles: true,
					cancellable: true
				});
				this.define.elem.dispatchEvent(locationSelected);
			}
		}	
	},

	_setRegion: function(name, id, trigger) {
		var $region = $('<div></div>', {
			id: 'region',
			class: 'card-panel valign-wrapper btn waves-effect waves-red grey lighten-5'
		});
		var $regionSelect = $('<div></div>', {
			class: 'valign'
		});
		var elem = this.define.elem;
		var self = this;

		$('#regionList').remove();
		$regionSelect.html(name);
		$region.append($regionSelect);
		$(elem).append($region);
		$region.data('name', name);
		$region.data('id', id);

		this.define.regionSelected = true;
		this.define.region = name;
		this.define.regionId = id;
		this.define.regionListOpen = false;

		if(name !== 'NCR') {
			$region.on('click', function() {
				self._openProvinceList(name, id);
			});
		}
		else {
			$region.on('click', function() {
				if(window.CustomEvent) {
					var locationSelected = new CustomEvent('location_selected', {
						detail: {
							type: 'region',
							region: name,
							regionId: id
						},
						bubbles: true,
						cancellable: true
					});
					elem.dispatchEvent(locationSelected);
				}
			});
		}

		if(trigger) {
			if(name !== 'NCR') this._openProvinceList(name, id);
			if(window.CustomEvent) {
				var locationSelected = new CustomEvent('location_selected', {
					detail: {
						type: 'region',
						region: name,
						regionId: id
					},
					bubbles: true,
					cancellable: true
				});
				elem.dispatchEvent(locationSelected);
			}
		}
	},

	_openProvinceList: function(name, id) {
		this._clearList(1);

		if(!this.define.provinceListOpen) {
			var elem = this.define.elem;
			var $provinceList = $('<ul></ul>', {
				id: 'provinceList',
				class: 'card-panel'
			});
			var $loader = "<div class='progress'><div class='indeterminate'></div></div>";
			var self = this;

			$provinceList.html($loader);
			$(elem).append($provinceList);
			this.define.provinceListOpen = true;

			this._fetchData(1, {key: name, id: id}, function(data) {
				$provinceList.html("");
				for(var i in data) {
					var $provinceItem = $('<li></li>', {
						class: 'provinceItem btn-flat waves-effect waves-red grey lighten-5'
					});
					$provinceItem.data('id', Number.parseInt(data[i].province_id));
					$provinceItem.data('name', data[i].name);
					$provinceItem.html(data[i].name);
					$provinceItem.on('click', function() {
						var itemName = $(this).data('name');
						var itemId = $(this).data('id');
						self._setProvince(itemName, itemId, true);
					});
					$provinceList.append($provinceItem);
				}
				self._setListMaxHeight($provinceList);
			});
		}
		else {
			this.define.provinceListOpen = false;
			if(window.CustomEvent) {
				var locationSelected = new CustomEvent('location_selected', {
					detail: {
						type: 'region',
						region: name,
						regionId: id
					},
					bubbles: true,
					cancellable: true
				});
				this.define.elem.dispatchEvent(locationSelected);
			}
		}
	},

	_setProvince: function(name, id, trigger) {
		var $province = $('<div></div>', {
			id: 'province',
			class: 'card-panel valign-wrapper btn waves-effect waves-red grey lighten-5'
		});
		var $provinceSelect = $('<div></div>', {
			class: 'valign'
		});
		var elem = this.define.elem;
		var self = this;

		$('#provinceList').remove();
		$provinceSelect.html(name);
		$province.append($provinceSelect);
		$(elem).append($province);
		$province.data('name', name);
		$province.data('id', id);

		this.define.provinceSelected = true;
		this.define.province = name;
		this.define.provinceId = id;
		this.define.provinceListOpen = false;

		$province.on('click', function() {
			if(window.CustomEvent) {
				var locationSelected = new CustomEvent('location_selected', {
					detail: {
						type: 'province',
						province: name,
						provinceId: id,
						region: self.define.region,
						regionId: self.define.regionId
					},
					bubbles: true,
					cancellable: true
				});
				elem.dispatchEvent(locationSelected);
			}
		});

		if(trigger) {
			if(window.CustomEvent) {
				var locationSelected = new CustomEvent('location_selected', {
					detail: {
						type: 'province',
						province: name,
						provinceId: id,
						region: this.define.region,
						regionId: this.define.regionId
					},
					bubbles: true,
					cancellable: true
				});
				elem.dispatchEvent(locationSelected);
			}
		}
	},

	setLocation: function(location) {
		this._clearList(0);
		if(location.region) {
			this._setRegion(location.region.name, Number.parseInt(location.region.region_id), false);
			if(location.region.name !== "NCR") {
				if(location.province) {
					this._setProvince(location.province.name, Number.parseInt(location.province.province_id), false);
				}
			}
		}
		else {
			this.define.regionSelected = false;
			this.define.region = null;
			this.define.regionId = -1;
			this.define.regionListOpen = false;
			this.define.provinceSelected = false;
			this.define.province = null;
			this.define.provinceId = -1;
			this.define.provinceListOpen = false;
		}
	},

	getElement: function() {
		return this.define.elem;
	}
}
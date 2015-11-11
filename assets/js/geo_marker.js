function GeoMarker(map, cluster, options) {
	this.define = {
		map: map,
		cluster: cluster,
		div: document.createElement('div'),
		latitude: options.latitude,
		longitude: options.longitude,
		count: options.count || 0,
		sizeRange: options.sizeRange || [1, 6, 11, 16, 21],
		sizes: options.sizes || [20, 30, 40, 50, 50],
		sizeTextIndex: options.sizeTextIndex || 2,
		severity: options.severity || 0,
		severityRange: options.severityRange || [0, 1, 2],
		severityLevels: options.severityLevels || ['rgba(255,152,0,0.7)', 'rgba(244,67,54,0.7)', 'rgba(173,20,87,0.7)'],
		visibility: options.visibility || false,
		styleValues: options.styleValues || {
			size: 0,
			top: 0,
			left: 0,
			background: 'rgba(255,255,255,0)'
		}
	};

	this.define.div.classname = 'marker';
	this._prepareStyle();
	this.setMap(map);
}

GeoMarker.prototype = new google.maps.OverlayView();

GeoMarker.prototype.onAdd = function() {
	var panes = this.getPanes();
	panes.overlayImage.appendChild(this.define.div);
	this._initializeElement();
};

GeoMarker.prototype.onRemove = function() {
	this.define.div.parentNode.removeChild(this.define.div);
	this.define.div = null;
};

GeoMarker.prototype.draw = function() {
	var div = this.define.div;
	var center = this.getProjection().fromLatLngToDivPixel(new google.maps.LatLng(this.define.latitude, this.define.longitude));
	var size = this.define.styleValues.size;
	var top = this.define.styleValues.top = center.y - (size / 2);
	var left = this.define.styleValues.left = center.x - (size / 2);

	div.style.top = top + 'px';
	div.style.left = left + 'px';
};

GeoMarker.prototype.show = function() {
	this.define.visibility = true;
	this.define.div.style.visibility = 'visible';
};

GeoMarker.prototype.hide = function() {
	this.define.visibility = false;
	this.define.div.style.visibility = 'hidden';
};

GeoMarker.prototype._prepareStyle = function() {
	var self = this;
	var getSizeValue = function() {
		var sizeRangeLength = self.define.sizeRange.length;
		for(var i=0; i<sizeRangeLength; i++) {
			if(self.define.count < self.define.sizeRange[i]) {
				break;
			}
		}
		return self.define.sizes[i-1];
	};
	var getBackgroundValue = function() {
		var severityRangeLength = self.define.severityRange.length;
		for(var i=0; i<severityRangeLength; i++) {
			if(self.define.severity < self.define.severityRange[i]) {
				break;
			}
		}
		return self.define.severityLevels[i-1];
	};
	var styleValues = this.define.styleValues;

	styleValues.size = getSizeValue();
	styleValues.background = getBackgroundValue();

	$(this.define.div).css({
		width: styleValues.size + 'px',
		height: styleValues.size + 'px',
		position: 'absolute',
		top: styleValues.top + 'px',
		left: styleValues.left + 'px',
		borderRadius: '50%',
		background: styleValues.background,
		lineHeight: styleValues.size + 'px',
		fontSize: '11px',
		color: '#fff',
		fontFamily: 'Roboto',
		textAlign: 'center',
		cursor: 'pointer',
		visibility: (self.define.visibility)? 'visible' : 'hidden'
	});

	if(this.define.count >= this.define.sizeRange[this.define.sizeTextIndex]) {
		$(this.define.div).html(this.define.count);
	}
};

GeoMarker.prototype._initializeElement = function() {
	var self = this;

	google.maps.event.addDomListener(this.define.div, 'click', function() {
		google.maps.event.trigger(self, 'click', self.define.cluster);
	});

	google.maps.event.addDomListener(this.define.div, 'mouseover', function() {
		var backgroundValue = self.define.styleValues.background;
		$(self.define.div).css('background', backgroundValue.substring(0, backgroundValue.lastIndexOf(",")) + ",1)");
		google.maps.event.trigger(self, 'mouseover', self.define.cluster);
	});

	google.maps.event.addDomListener(this.define.div, 'mouseout', function() {
		$(self.define.div).css('background', self.define.styleValues.background);
		google.maps.event.trigger(self, 'mouseout', self.define.cluster);
	});
};

GeoMarker.prototype.update = function(newCount, newSeverity) {
	if(newCount !== this.define.count) {
		this.define.count = newCount;

		var sizeRangeLength = this.define.sizeRange.length;
		var newSize;

		for(var i=0; i<sizeRangeLength; i++) {
			if(this.define.count < this.define.sizeRange[i]) {
				newSize = this.define.sizes[i-1];
			}
		}

		if(this.define.styleValues.size !== newSize) {
			this.define.styleValues.size = newSize;
			var div = this.define.div;
			div.style.width = newSize + 'px';
			div.style.height = newSize + 'px';
			div.style.lineHeight = newSize + 'px';
				
			var center = this.getProjection().fromLatLngToDivPixel(new google.maps.LatLng(this.define.latitude, this.define.longitude));
			div.style.top = this.define.styleValues.top = center.y - (newSize / 2);
			div.style.left = this.define.styleValues.left = center.x - (newSize / 2);			
		}

		if(this.define.count >= this.define.sizeRange[this.define.sizeTextIndex]) {
			$(this.define.div).html(this.define.count);
		}
	}

	if(newSeverity !== this.define.severity) {
		this.define.severity = newSeverity;

		var severityRangeLength = this.define.severityRange.length;
		var newBackground;
		for(var i=0; i<severityRangeLength; i++) {
			if(this.define.severity < this.define.severityRange[i]) {
				newBackground = this.define.severityLevels[i-1];
			}
		}
		
		if(this.define.styleValues.background !== newBackground) {
			this.define.styleValues.background = newBackground;
			$(this.define.div).css('background', newBackground);
		}
	}
};

GeoMarker.prototype.isVisible = function() {
	return this.define.visibility;
};
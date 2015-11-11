Loader = function(elem, options) {
	this.define = {
		parentElem: elem,
		coverColor: options.coverColor || '#212121',
		overlayColor: options.overlayColor || '#000',
		overlayOpacity: options.overlayOpacity || 0.5,
		overlayVisible: false,
		coverVisible: false
	}
	
	var $loader = this.define.loader = $('<div></div>', {class: 'loader'});
	var $cover = this.define.cover = $('<div></div>', {class: 'loader-cover'});
	var $overlay = this.define.overlay = $('<div></div>', {class: 'loader-overlay'});
	var $load = this.define.load = $('<div></div>', {class: 'loader-load'});
	
	$loader.append($cover);
	$loader.append($overlay);
	$loader.append($load);
	$(this.define.parentElem).append($loader);

	this._initializeStyles();
};

Loader.prototype = {
	_initializeStyles: function() {
		var $loader = this.define.loader;
		var $cover = this.define.cover;
		var $overlay = this.define.overlay;
		var $load = this.define.load;

		$loader.css({
			width: '100%',
			height: '100%',
			position: 'absolute',
			top: 0,
			left: 0,
			visibility: 'hidden'
		});

		$cover.css({
			width: '100%',
			height: '100%',
			background: this.define.coverColor,
			position: 'absolute',
			top: 0,
			left: 0,
			zIndex: 1000,
			opacity: 0,
			zIndex: 300
		});

		$overlay.css({
			width: '100%',
			height: '100%',
			background: this.define.overlayColor,
			opacity: 0,
			position: 'absolute',
			top: 0,
			left: 0,
			zIndex: 305
		});

		$load.css({
			width: '100%',
			height: '100%',
			opacity: 0,
			position: 'absolute',
			top: 0,
			left: 0,
			display: 'none',
			zIndex: 310
		});
	},

	showOverlay: function(options) {
		this.define.loader.css('visibility', 'visible');
		this.define.overlay.animate({opacity: this.define.overlayOpacity}, 300);
		this.define.overlayVisible = true;
	},

	showCover: function() {

	},

	hideOverlay: function() {
		var self = this;
		this.define.overlay.animate({opacity: 0}, {
			duration: 300,
			complete: function() {
				self.define.loader.css('visibility', 'hidden');
				self.define.overlayVisible = false;
			}
		});
	},

	isVisibleOverlay: function() {
		return this.define.overlayVisible;
	},

	isVisibleCover: function() {

	}
}
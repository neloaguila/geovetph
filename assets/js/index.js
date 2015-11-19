var geovetphmap;

function initApp() {
    loader = new Loader(document.getElementById('main'), {});
	geovetphmap = new GeoVetPHMap({
		mapCanvas: document.getElementById('map-canvas'),
		addressManager: document.getElementById('address-manager'),
		dataFilter: document.getElementById('data-filter'),
		zoomControl: document.getElementById('zoom-control'),
        loader: loader,
        diseaseInfo: document.getElementById('disease-info')
	});
};

$(window).on('load', function() {
	initApp();
});

// Modernirz

function transitionEndEventName () {
    var i,
        undefined,
        el = document.createElement('div'),
        transitions = {
            'transition':'transitionend',
            'OTransition':'otransitionend',  // oTransitionEnd in very old Opera
            'MozTransition':'transitionend',
            'WebkitTransition':'webkitTransitionEnd'
        };

    for (i in transitions) {
        if (transitions.hasOwnProperty(i) && el.style[i] !== undefined) {
            return transitions[i];
        }
    }
    //TODO: throw 'TransitionEnd event is not supported in this browser'; 
}

/*
    Array.prototype.find Polyfill if not existing
*/
if (!Array.prototype.find) {
  Array.prototype.find = function(predicate) {
    if (this === null) {
      throw new TypeError('Array.prototype.find called on null or undefined');
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }
    var list = Object(this);
    var length = list.length >>> 0;
    var thisArg = arguments[1];
    var value;

    for (var i = 0; i < length; i++) {
      value = list[i];
      if (predicate.call(thisArg, value, i, list)) {
        return value;
      }
    }
    return undefined;
  };
}
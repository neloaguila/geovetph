function initApp() {
	$('li.nav').on('click', function() {
		var target = Number.parseInt($(this).data('target'));
		var $cover = $(this).parents('#cover-panel');
		var $contents = $('#contents');

		if(!$cover.hasClass('open')) {
			$cover.addClass('open');
			$('li.nav').each(function() {
				$(this).attr('data-position', 'bottom');
			});
		}

		switch(target) {
			case 0:
				$contents.removeClass().addClass('diseases-open');
				break;
			case 1:
				$contents.removeClass().addClass('notifications-open');
				break;
			case 2:
				$contents.removeClass().addClass('contributors-open');
				break;
			case 3:
				$contents.removeClass().addClass('logs-open');
				break;
			case 4:
				$contents.removeClass().addClass('accounts-open');
				break;
		}
	});
}

$(window).on('load', function() {
	initApp();
});
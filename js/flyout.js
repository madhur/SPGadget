
	
	YUI().use('get', function (Y) {
	   Y.Get.css('css/theme.css', function (err) {
			if (err) {
				Y.log('Error loading CSS: ' + err[0].error, 'error');
				return;
			}

			Y.log('file.css loaded successfully!');
		});
	});



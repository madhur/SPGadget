
function IsGadget()
{
	var IsGadgetrun = (window.System != undefined);
	return IsGadgetrun;

}


	function getTheme()
{
if (IsGadget())
	{
		var selVal = System.Gadget.Settings.readString("theme");
		if (selVal == "" || selVal=="classic")
			selVal = "css/theme.css";
		else if (selVal=="modern")
		selVal="css/theme-modern.css";
		
		return selVal;
	}

	return "css/theme-modern.css";

}


	
	YUI().use('get', function (Y) {
	   Y.Get.css(getTheme(), function (err) {
			if (err) {
				Y.log('Error loading CSS: ' + err[0].error, 'error');
				return;
			}

			Y.log('file.css loaded successfully!');
		});
	});




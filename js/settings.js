// Load the setttings to the form
function initLoad()
{
	var today = new Date();
	var currYear = today.getFullYear();
	var nextYear = today.getFullYear()+1;

	if (IsGadget())
	{
		var storedVal = System.Gadget.Settings.readString("viewoption");
		if (storedVal != "")
			$("#viewoption").val(System.Gadget.Settings.readString("viewoption"));

		storedVal = System.Gadget.Settings.readString("onlymyideas");
		if (storedVal == "true")
			$("#onlymyideas").prop('checked', true);
		else if (storedVal == "false")
			$("#onlymyideas").prop('checked', false);
			
		storedVal=System.Gadget.Settings.readString("theme");
		if (storedVal != "")
			$("#theme").val(System.Gadget.Settings.readString("theme"));
			
		$('#curryear').html("Current Year ("+currYear+")");
		$('#nxtyear').html("Next Year ("+nextYear+")");		
	}
}

// Delegate for the settings closing event.
if (IsGadget())
{
	System.Gadget.onSettingsClosing = SettingsClosing;
}

// --------------------------------------------------------------------
// Handle the Settings dialog closing event.
// Parameters:
// event - event arguments.
// --------------------------------------------------------------------
function SettingsClosing(event)
{

	if (IsGadget())
	{
		// Save the settings if the user clicked OK.
		if (event.closeAction == event.Action.commit)
		{
			System.Gadget.Settings.writeString("viewoption", $("#viewoption").val());
	
			System.Gadget.Settings.writeString("theme", $("#theme").val());
			
			if ($("#onlymyideas").prop('checked'))
				System.Gadget.Settings.writeString("onlymyideas", 'true');
			else
				System.Gadget.Settings.writeString("onlymyideas", 'false');
			System.Gadget.document.parentWindow.settingsHaveChanged();
		}

		// Allow the Settings dialog to close.
		event.cancel = false;

	}
}

function IsGadget()
{
	var IsGadgetrun = (window.System != undefined);
	return IsGadgetrun;

}

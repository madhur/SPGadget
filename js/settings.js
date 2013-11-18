 // Load the setttings to the form
            function initLoad() 
			{
				
				if(IsGadget())
				{
					var storedVal=System.Gadget.Settings.readString("viewoption");
					if(storedVal!="")
						$("#viewoption").val(System.Gadget.Settings.readString("viewoption"));
				}
            }


        // Delegate for the settings closing event. 
		if(IsGadget())
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
		
			if(IsGadget())
			{
            // Save the settings if the user clicked OK.
            if (event.closeAction == event.Action.commit)
            {
                System.Gadget.Settings.writeString("viewoption", $("#viewoption").val());
            }

            // Allow the Settings dialog to close.
            event.cancel = false;
			
			System.Gadget.document.parentWindow.settingsHaveChanged();
			
			}
        }

		function IsGadget()
		{
			var IsGadgetrun = (window.System != undefined);
			return IsGadgetrun;
		
		}
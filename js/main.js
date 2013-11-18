var excelList = "EXCEL Ideas";

var getListItems = "GetListItems";

var ActiveFlyout;
var ActiveCategory;

$().SPServices.defaults.webURL = "https://teams.aexp.com/sites/teamsitewendy/WASTE"; // URL of the target Web
$().SPServices.defaults.listName = excelList; // Name of the list for list

// Enable support of cross domain origin request
jQuery.support.cors = true;
var truncatelength = 30;
var redDays = 1;
var orangeDays = 30;

// Disable caching of AJAX responses - Stop IE reusing cache data for the same requests
$.ajaxSetup(
{
	cache : false
}
);

$(document).ready(function ()
{

	refresh();

	$('#refreshimg').click(function ()
	{
		refresh();

		return false;
	}
	);

	//$('#star').raty();
	$('#accordion').sortable(
	{
		items : 'tbody.category'
	}
	);

	//$('#accordion').disableSelection();
	//$('#accordion tbody.category').draggable();

}
);

function refresh()
{

	$("#refreshimg").attr('src', "images/loading.gif");

	$('#accordion').empty();

	var status = getEXCELData();

	if (status == "success")
	{
		var currentdate = new Date();
		var datetime = "";
		datetime += dateToString(currentdate);
		datetime += " " + currentdate.getHours() + ":"
		 + currentdate.getMinutes() + ":"
		 + currentdate.getSeconds();
		$('#lastrefresh').html(datetime);

	}
	else
	{
		$('#lastrefresh').html("Error retrieving data");

	}

	$("#refreshimg").attr('src', "images/refresh.png");

	//var val=getYearFilter();
	//	$('#header1').append(val);


}

// --------------------------------------------------------------------
// Initialize the gadget.
// --------------------------------------------------------------------
function init()
{
	// Enable Settings dialog for the gadget.
	var IsGadget = (window.System != undefined);
	if (IsGadget)
	{
		System.Gadget.Flyout.file = "flyout.html";
		System.Gadget.Flyout.show = false;
		System.Gadget.settingsUI = "settings.html";

		System.Gadget.onSettingsClosed = SettingsClosed;

	}
}

// --------------------------------------------------------------------
// Handle the Settings dialog closed event.
// event = System.Gadget.Settings.ClosingEvent argument.
// --------------------------------------------------------------------
function SettingsClosed(event)
{
	// User hits OK on the settings page.
	if (event.closeAction == event.Action.commit)
	{
		// refresh();
	}
	// User hits Cancel on the settings page.
	else if (event.closeAction == event.Action.cancel)
	{
		SetContentText("canceled");
	}
}

function settingsHaveChanged()
{
	refresh();

}

function getYear()
{
	new Date().getFullYear()
}

function getEXCELData()
{

	// EstimatedSavings2013
	var functionStatus;

	var myQuery = getQuery();

	$().SPServices(
	{
		operation : "GetListItems",
		async : false,
		listName : excelList,
		CAMLViewFields : "<ViewFields Properties='True'><FieldRef Name='Title' /><FieldRef Name='Project_x0020_Status' /><FieldRef Name='Project_x0020_Director' /><FieldRef Name='Project_x0020_Contact' /><FieldRef Name='Project_x0020_VP' /><FieldRef Name='Estimated_x0020_Savings' /><FieldRef Name='Planned_x0020_Implementation_x00' /><FieldRef Name='Revised_x0020_Implementation_x00' /></ViewFields>",
		CAMLQuery : myQuery,
		completefunc : function (xData, Status)
		{
			if (Status == "error")
			{

				functionStatus = "error";
			}
			else
			{
				functionStatus = "success";
			}
			var resJson = $(xData.responseXML).SPFilterNode("z:row").SPXmlToJson(
				{

					mapping :
					{
						ows_ID :
						{
							mappedName : "ID",
							objectType : "Counter"
						},
						ows_Title :
						{
							mappedName : "Title",
							objectType : "Text"
						},
						ows_Created :
						{
							mappedName : "Created",
							objectType : "DateTime"
						}
					},
					includeAllAttrs : true
				}
				);

			var statuslist = new Array();
			var sum = 0;
			$.each(resJson, function (i, excel)
			{
				if (excel.Project_x0020_Status != null && $('#' + excel.Project_x0020_Status.replace(/ /g, "_")).length == 0)
				{
					$('#accordion').append('<tbody id=' + excel.Project_x0020_Status.replace(/ /g, "_") + ' class="category"><tr class="contentrow"><td class="arrow">> </td><td onclick="javascript:showFlyout(' + excel.Project_x0020_Status.replace(/ /g, "_") + 'sub)" class="content">' + excel.Project_x0020_Status + '</td><td class="amount" id="amnt"></td></tr></tbody><tbody class="subcategory" id=' + excel.Project_x0020_Status.replace(/ /g, "_") + 'sub></tbody>');

					statuslist.push(excel.Project_x0020_Status.replace(/ /g, "_"));

				}
				//insert contacts in the accordion
				$('#' + excel.Project_x0020_Status.replace(/ /g, "_") + 'sub').append('<tr id=' + excel.ID + ' class="idearow"><td class="idea" colspan="2"><a href="https://teams.aexp.com/sites/teamsitewendy/WASTE/Lists/WASTE%20Ideas/dispform.aspx?ID=' + excel.ID + '">' + excel.Title.truncateOnWord(truncatelength) + '</a></td><td class="ideaamount">$ ' + getMoney(excel.Estimated_x0020_Savings) + '</td></tr>');

				var previousSum = $('#' + excel.Project_x0020_Status.replace(/ /g, "_")).attr("sum");
				if (typeof(previousSum) == "undefined")
					previousSum = 0;

				previousSum = Number(previousSum) + Number(excel.Estimated_x0020_Savings);
				$('#' + excel.Project_x0020_Status.replace(/ /g, "_")).attr("sum", previousSum);

				//Calculate heat map based on date
				var impDate
				if (excel.Project_x0020_Status == "In Progress")
				{
					if (excel.Revised_x0020_Implementation_x00 !== undefined)
					{
						impDate = excel.Revised_x0020_Implementation_x00;
					}
					else
					{
						if (excel.Planned_x0020_Implementation_x00 !== undefined)
						{
							impDate = excel.Planned_x0020_Implementation_x00;
						}
						else
						{
							//error condition, no date defined .... Do nothing

						}

					}

					var color;
					var ideaDate = Date.parse(impDate);

					if (Date.today().isAfter(ideaDate))
					{

						color = "red";
						$('#' + excel.ID).addClass("red");

					}
					else if (Date.today().add(orangeDays).days().isAfter(ideaDate))
					{

						color = "orange";
						$('#' + excel.ID).addClass("orange");
					}

				}

			}
			);

			$.each(statuslist, function (i, list)
			{

				var sum = $("#" + list).attr("sum");

				sum = "$ " + getMoney(sum);

				$("#" + list).find('#amnt').html(sum);

			}
			);

		}
	}
	);

	$(document).ready(function ()
	{
		var body = document.body;
		var height = 100 + $('tbody.category').size() * 40;
		setBodyHeight(body, height);
	}
	);

	return functionStatus;
}

// --------------------------------------------------------------------
// Display the Flyout
// --------------------------------------------------------------------
function showFlyout(status)
{
	ActiveFlyout = status;
	var index = status.id.indexOf("sub");
	if (index != -1)
		ActiveCategory = status.id.substring(0, index).replace(/_/g, " ");

	var IsGadget = (window.System != undefined);
	if (IsGadget)
	{

		System.Gadget.Flyout.file = "flyout.html";
		System.Gadget.Flyout.onShow = FlyoutLoaded;
		System.Gadget.Flyout.show = !System.Gadget.Flyout.show;

	}

}

function FlyoutLoaded()
{

	var approvedDOM = $(ActiveFlyout).html();
	var flyoutDOM = System.Gadget.Flyout.document.getElementById('faccordion');
	$(flyoutDOM).empty();
	$(flyoutDOM).append(approvedDOM);

	var heading = System.Gadget.Flyout.document.getElementById('heading');
	var size = $(flyoutDOM).find('tr').size()
		$(heading).html(size + ' ideas in ' + '"' + ActiveCategory.valueOf() + '"');

	var legend = System.Gadget.Flyout.document.getElementById('legend');

	var body = System.Gadget.Flyout.document.body;
	var height = 40 + size * 25;
	if (height > window.screen.availHeight)
		height = window.screen.availHeight;

	if (ActiveCategory.valueOf() == "In Progress")
	{

		$(legend).css("display", "block");
		height = height + 43;

	}
	else
	{
		$(legend).css("display", "none");
	}

	setBodyHeight(body, height);

}

function getMoney(number)
{
	var n = number,
	c = isNaN(c = Math.abs(c)) ? 2 : c,
	d = d == undefined ? "." : d,
	t = t == undefined ? "," : t,
	s = n < 0 ? "-" : "",
	i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "",
	j = (j = i.length) > 3 ? j % 3 : 0;
	return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
};

function dateToString(date)
{
	var month = date.getMonth() + 1;
	var day = date.getDate();
	var dateOfString = (("" + day).length < 2 ? "0" : "") + day + "/";
	dateOfString += (("" + month).length < 2 ? "0" : "") + month + "/";
	dateOfString += date.getFullYear();
	return dateOfString;
}

function ResizeWindowTo(sElemId)
{
	document.body.leftMargin = 0;
	document.body.topMargin = 0;
	var oElem = document.getElementById(sElemId);
	var nHigh = oElem.offsetHeight;
	var nWide = oElem.offsetWidth;
	document.body.style.height = nHigh;
	document.body.style.width = nWide;
}

function rateit()
{
	//var body=document.body;
	//setBodyHeight(body,260);


}

function setBodyHeight(body, height)
{

	$(body).animate(
	{
		height : height
	}, 125, function ()
	{
		// Animation complete.

	}
	);

	$(body).css("overflow", "auto");

}

function getYearFilter()
{
	var selVal = System.Gadget.Settings.readString("viewoption");

	return selVal;

}

function getIdeaAmount(excel)
{
	if (filterSetting == "nofilter" || filterSetting == "")
	{
		return excel.Estimated_x0020_Savings;
	}
	else if (filterSetting == "currentyear")
	{

		return excel.EstimatedSavings2013;
	}
	else if (filterSetting == "nextyear")
	{

		return excel.EstimatedSavings2014;
	}
	
	else if (filterSetting == "previousyear")
	{

		return excel.EstimatedSavings2012;
	}


}

function getQuery()
{

	var myQuery;

	var filterSetting = getYearFilter();

	if (filterSetting == "nofilter" || filterSetting == "")
		myQuery = "<Query><Where><And><Or><Or><Eq><FieldRef Name='Project_x0020_Contact' /><Value Type='Integer'><UserID/></Value></Eq><Eq><FieldRef Name='Project_x0020_Director' /><Value Type='Integer'><UserID/></Value></Eq></Or><Or><Eq><FieldRef Name='Project_x0020_VP' /><Value Type='Integer'><UserID/></Value></Eq><Eq><FieldRef Name='FTE_x0020_Contributors' /><Value Type='Integer'><UserID/></Value></Eq></Or></Or><Neq><FieldRef Name='Project_x0020_Status' /><Value Type='Text'>Canceled</Value></Neq></And></Where></Query>";
	else if (filterSetting == "currentyear")
	{

		myQuery = "<Query><Where><And><And><Or><Or><Eq><FieldRef Name='Project_x0020_Contact' /><Value Type='Integer'><UserID/></Value></Eq><Eq><FieldRef Name='Project_x0020_Director' /><Value Type='Integer'><UserID/></Value></Eq></Or><Or><Eq><FieldRef Name='Project_x0020_VP' /><Value Type='Integer'><UserID/></Value></Eq><Eq><FieldRef Name='FTE_x0020_Contributors' /><Value Type='Integer'><UserID/></Value></Eq></Or></Or><Neq><FieldRef Name='Project_x0020_Status' /><Value Type='Text'>Canceled</Value></Neq></And><Neq><FieldRef Name='EstimatedSavings2013' /><Value Type='Integer'>0</Value></Neq> </And></Where></Query>";

	}
	else if (filterSetting == "nextyear")
	{

		myQuery = "<Query><Where><And><And><Or><Or><Eq><FieldRef Name='Project_x0020_Contact' /><Value Type='Integer'><UserID/></Value></Eq><Eq><FieldRef Name='Project_x0020_Director' /><Value Type='Integer'><UserID/></Value></Eq></Or><Or><Eq><FieldRef Name='Project_x0020_VP' /><Value Type='Integer'><UserID/></Value></Eq><Eq><FieldRef Name='FTE_x0020_Contributors' /><Value Type='Integer'><UserID/></Value></Eq></Or></Or><Neq><FieldRef Name='Project_x0020_Status' /><Value Type='Text'>Canceled</Value></Neq></And><Neq><FieldRef Name='EstimatedSavings2014' /><Value Type='Integer'>0</Value></Neq></And></Where></Query>";

	}

	return myQuery;

}

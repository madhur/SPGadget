"use strict";

var excelList = "Idea";
var getListItems = "GetListItems";
var versionList = "EXCEL Gadget";


var ActiveFlyout;
var ActiveCategory;

$().SPServices.defaults.webURL = "https://teams.aexp.com/sites/excel/"; // URL of the target Web
$().SPServices.defaults.listName = excelList; // Name of the list for list


// Enable support of cross domain origin request
jQuery.support.cors = true;
var truncatelength = 30;
var redDays = 1;
var orangeDays = 30;
var installedVersion;

// Disable caching of AJAX responses - Stop IE reusing cache data for the same requests
$.ajaxSetup(
{
	cache : false
}
);

$(document).ready(function ()
{
	if(IsGadget())
		installedVersion = System.Gadget.version;
	
	//window.prompt("Installed Version = "+parseInt(installedVersion.split(".")[0]));
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
	});
	//$('#accordion').disableSelection();
	//$('#accordion tbody.category').draggable();
//	console.log(versionValue);
}
);

function refresh()
{
	var versionErrorFlag = 0;
	var Err_Message="";
	YUI().use('get', function (Y) {
	   Y.Get.css(getTheme(), function (err) {
			if (err) {
				Y.log('Error loading CSS: ' + err[0].error, 'error');
				return;
			}
			Y.log('file.css loaded successfully!');
		});
	});

	$("#refreshimg").attr('src', "images/loading.gif");

	$('#accordion').empty();

	var responseVersion = getVersionInformation();
	$.each(responseVersion, function (i, ver)
	{
		if(ver.LinkTitle == "Err_Version")
			Err_Message = ver.Value;
	});
	
	$.each(responseVersion, function (i, ver)
	{
		
		if(i==0 && ver.Value>installedVersion)
		{
			//window.prompt(Err_Message);
			$("#versionError").html("<tr><td></td></tr>");
			$("#versionError").append("<tr><td><center>"+Err_Message+"</center></td></tr>");
			//"<td class='status'>Version Error: </td><td class='time'><span id='version'>"+Err_Message+"</span></td>");
			versionErrorFlag = 1;
			return;
		}
	});
	
	
	if(versionErrorFlag==0)
	{
		var status = getEXCELData();
		
		if (status == "success")
		{
			var currentdate = new Date();
			var datetime;
			var mm = currentdate.getMonth()+1;
			if(mm<10)
				mm="0"+mm;
			datetime = mm+"/"+currentdate.getDate()+"/"+currentdate.getFullYear();
			//datetime += dateToString(currentdate);
			
			datetime += " " + currentdate.getHours() + ":"
			+ currentdate.getMinutes() + ":"
			+ currentdate.getSeconds();
			$('.status').html("Last sync: ");
			$('#lastrefresh').html(datetime);
		}
		else
		{
			$('#lastrefresh').html("Error retrieving data");
		}
	}
		$("#refreshimg").attr('src', "images/refresh.png");
	
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

function getVersionInformation()
{
	var responseVersionJSON;
	var versionQuery = getVersionQuery();
	
    	$().SPServices(
    	{
    		operation: "GetListItems",
    		async: false,
    		listName: versionList,
    		CAMLViewFields: "<ViewFields Properties='True'><FieldRef Name='LinkTitle' /><FieldRef Name='Value' /></ViewFields>",
    		CAMLQuery: versionQuery,
    		completefunc: function(xData, Status)
    		{
    			responseVersionJSON = $(xData.responseXML).SPFilterNode("z:row").SPXmlToJson(
    			{
    				mapping:
    				{},
    				includeAllAttrs: true
    			});
    		}

    		/*****************************************************************/
    	});

    	return responseVersionJSON;
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
		CAMLViewFields : "<ViewFields Properties='True'><FieldRef Name='Idea_x0020_Name' /><FieldRef Name='Executor' /><FieldRef Name='Director' /><FieldRef Name='Idea_x0020_Status' /><FieldRef Name='VP' /><FieldRef Name='Total_x0020_Savings' /><FieldRef Name='_x0031_st_x0020_Mo_x0020_Saves_x' /><FieldRef Name='Revised_x0020_1st_x0020_Mo_x0020' /><FieldRef Name='Savings1' /><FieldRef Name='Savings2' /><FieldRef Name='Savings3' /><FieldRef Name='Savings4' /><FieldRef Name='Savings5' /><FieldRef Name='SavingsHeader1' /><FieldRef Name='SavingsHeader2' /><FieldRef Name='SavingsHeader3' /><FieldRef Name='SavingsHeader4' /><FieldRef Name='SavingsHeader5' /></ViewFields>",
		CAMLQuery : myQuery,
		completefunc : function (xData, Status)
		{
			// window.prompt("Status = "+Status);
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
					},
					includeAllAttrs : true
				}
				);

			var statuslist = new Array();
			var sum = 0;

			$('#accordion').empty();
			$.each(resJson, function (i, excel)
			{
				//alert(excel.ID);
				if (excel.Idea_x0020_Status != null && $('#' + excel.Idea_x0020_Status.replace(/ /g, "_")).length == 0)
				{
					$('#accordion').append('<tbody id=' + excel.Idea_x0020_Status.replace(/ /g, "_") + ' class="category"><tr class="contentrow"><td class="arrow">> </td><td onclick="javascript:showFlyout(' + excel.Idea_x0020_Status.replace(/ /g, "_") + 'sub)" class="content">' + excel.Idea_x0020_Status + '</td><td class="amount" id="amnt"></td></tr></tbody><tbody class="subcategory" id=' + excel.Idea_x0020_Status.replace(/ /g, "_") + 'sub></tbody>');

					statuslist.push(excel.Idea_x0020_Status.replace(/ /g, "_"));

				}
				//insert contacts in the accordion
				$('#' + excel.Idea_x0020_Status.replace(/ /g, "_") + 'sub').append('<tr id=' + excel.ID + ' class="idearow"><td class="idea" colspan="2"><a href="https://teams.aexp.com/sites/excel/SitePages/manage.aspx?q=' + excel.ID + '">' + excel.Idea_x0020_Name.truncateOnWord(truncatelength) + '</a></td><td class="ideaamount">$ ' + getMoney(getIdeaAmount(excel)) + '</td></tr>');

				var previousSum = $('#' + excel.Idea_x0020_Status.replace(/ /g, "_")).attr("sum");
				if (typeof(previousSum) == "undefined")
					previousSum = 0;

				//alert(previousSum);
				previousSum = Number(previousSum) + Number(getIdeaAmount(excel));
				
				var impDate;
				$('#' + excel.Idea_x0020_Status.replace(/ /g, "_")).attr("sum", previousSum);

				//Calculate heat map based on date
				if (excel.Idea_x0020_Status == "In Progress")
				{
					
					if (excel.Revised_x0020_1st_x0020_Mo_x0020 !== undefined)
					{
						
						impDate = excel.Revised_x0020_1st_x0020_Mo_x0020;
						
					}
					else
					{
						if (excel._x0031_st_x0020_Mo_x0020_Saves_x !== undefined)
						{
							
							impDate = excel._x0031_st_x0020_Mo_x0020_Saves_x;
						
						}
						else
						{
							//error condition, no date defined .... Do nothing

						}

					}

					
					var color;
					var todayDate = new Date();
					var ideaDate = Date.parse(impDate);
					
					if (Date.today().isAfter(ideaDate))
					{
					
						color = "red";
						//$('#' + excel.ID).addClass("red");
						$('#' + excel.ID).css('background-color', 'red');

					}
					else if (Date.today().add(orangeDays).days().isAfter(ideaDate))
					{
						color = "orange";
						//$('#' + excel.ID).addClass("orange");
						$('#' + excel.ID).css('background-color', 'orange');
					}

				}

			}
			);

			var total=0;	
			$.each(statuslist, function (i, list)
			{

				var sum = $("#" + list).attr("sum");
				total = total + parseInt(sum);
				sum = "$ " + getMoney(sum);
	
				$("#" + list).find('#amnt').html(sum);
			}
			);
			
			$('#accordion').append('<tbody id="totalsum" class="category"><tr class="contentrow" style="cursor:default;color:white"><td class="arrow">> </td><td  class="totalamount"> Total </td><td class="amount" id="amnt">'+"$ "+getMoney(total)+'</td></tr></tbody>');
		
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

	if (IsGadget())
	{

		System.Gadget.Flyout.file = "flyout.html";
		System.Gadget.Flyout.onShow = FlyoutLoaded;
		System.Gadget.Flyout.show = !System.Gadget.Flyout.show;

	}
	else
	{
		var myWin=window.open('flyout.html','1384802697002','width=400,height=140,toolbar=0,menubar=0,location=0,status=0,scrollbars=0,resizable=1,left=0,top=0');
		FlyoutLoaded(myWin);
	}

}

function FlyoutLoaded(myWin)
{

	var approvedDOM = $(ActiveFlyout).html();
	var flyoutDOM;
	var docDOM;
	if(IsGadget())	
	{
		flyoutDOM = System.Gadget.Flyout.document.getElementById('faccordion');
		docDOM=System.Gadget.Flyout.document;
	}
	else
	{
	flyoutDOM=myWin.document.getElementById('faccordion');
	docDOM=myWin.document;
	}
	
	$(flyoutDOM).empty();
	$(flyoutDOM).append(approvedDOM);

	var heading = docDOM.getElementById('heading');
	var size = $(flyoutDOM).find('tr').size();
	$(heading).html(size + ' ideas in ' + '"' + ActiveCategory.valueOf() + '"');

	var legend = docDOM.getElementById('legend');

	var body = docDOM.body;
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


function setBodyHeight(body, height)
{

	$(body).animate(
	{
		height : height
	}, 0, function ()
	{
		// Animation complete.

	}
	);

	$(body).css("overflow", "auto");

}

function getYearFilter()
{
	if (IsGadget())
	{
		var selVal = System.Gadget.Settings.readString("viewoption");

		if (selVal == "")
			selVal == "nofilter"

			return selVal;
	}

	return "";

}

function getMyIdeaFilter()
{

	if (IsGadget())
	{
		var selVal = System.Gadget.Settings.readString("onlymyideas");
		if (selVal == "")
			selVal = "false";
		return selVal;
	}
	
	return "false";

}

function IsGadget()
{
	var IsGadgetrun = (window.System != undefined);
	return IsGadgetrun;
}

function getYearValue(savingsHeader)
{
	var yearValue="";
	if(savingsHeader!="" && savingsHeader!=null)
		yearValue = savingsHeader.substring(3,8);
	return yearValue;
}

function getIdeaAmount(excel)
{
	var filterSetting = getYearFilter();
	var today = new Date();
	var currYear = today.getFullYear();
	var nextYear = today.getFullYear()+1;
	var currYearSavings = 0;
	var nextYearSavings = 0;
	
	
	if (filterSetting == "nofilter" || filterSetting == "")
	{
		if(typeof excel.Total_x0020_Savings != 'undefined')		
			return excel.Total_x0020_Savings;
		else 
			return 0;
	}
	else if (filterSetting == "currentyear")
	{
		if(getYearValue(excel.SavingsHeader1)==currYear && !isNaN(excel.Savings1))
			currYearSavings = currYearSavings+parseFloat(excel.Savings1);
		if(getYearValue(excel.SavingsHeader2)==currYear && !isNaN(excel.Savings2))
			currYearSavings = currYearSavings+parseFloat(excel.Savings2);
		if(getYearValue(excel.SavingsHeader3)==currYear && !isNaN(excel.Savings3))
			currYearSavings = currYearSavings+parseFloat(excel.Savings3);
		if(getYearValue(excel.SavingsHeader4)==currYear && !isNaN(excel.Savings4))
			currYearSavings = currYearSavings+parseFloat(excel.Savings4);
		if(getYearValue(excel.SavingsHeader5)==currYear && !isNaN(excel.Savings5))
			currYearSavings = currYearSavings+parseFloat(excel.Savings5);

		//window.prompt("Current savings "+currYearSavings);		
		return currYearSavings;

		//return excel.EstimatedSavings2013;
	}
	else if (filterSetting == "nextyear")
	{
		if(getYearValue(excel.SavingsHeader1)==nextYear && !isNaN(excel.Savings1))
			nextYearSavings = nextYearSavings+parseFloat(excel.Savings1);
		if(getYearValue(excel.SavingsHeader2)==nextYear && !isNaN(excel.Savings2))
			nextYearSavings = nextYearSavings+parseFloat(excel.Savings2);
		if(getYearValue(excel.SavingsHeader3)==nextYear && !isNaN(excel.Savings3))
			nextYearSavings = nextYearSavings+parseFloat(excel.Savings);
		if(getYearValue(excel.SavingsHeader4)==nextYear && !isNaN(excel.Savings4))
			nextYearSavings = nextYearSavings+parseFloat(excel.Savings4);
		if(getYearValue(excel.SavingsHeader5)==nextYear && !isNaN(excel.Savings5))
			nextYearSavings = nextYearSavings+parseFloat(excel.Savings5);
		
		//window.prompt("Next savings "+nextYearSavings);			
		return nextYearSavings;
		//return excel.EstimatedSavings2014;
	}
	// else if (filterSetting == "previousyear")
	// {

		// return excel.EstimatedSavings2012;
	// }
}

function getTheme()
{
if (IsGadget())
	{
		var selVal = System.Gadget.Settings.readString("theme");
		if (selVal == "" || selVal=="modern")
			selVal="css/theme-modern.css";
		else if (selVal=="classic")
			selVal = "css/theme.css";
		
		return selVal;
	}

	return "css/theme-modern.css";

}

function getQuery()
{
	var myQuery;

//	var filterSetting = getYearFilter();
	var myideafilterSetting = getMyIdeaFilter();

if (myideafilterSetting == "false")
	{
		// if (filterSetting == "nofilter" || filterSetting == "")
			// myQuery = "<Query><Where><And><Or><Or><Eq><FieldRef Name='Executor' /><Value Type='Integer'><UserID/></Value></Eq><Eq><FieldRef Name='Director' /><Value Type='Integer'><UserID/></Value></Eq></Or><Or><Eq><FieldRef Name='VP' /><Value Type='Integer'><UserID/></Value></Eq><Eq><FieldRef Name='FTE_x0020_Contributors' /><Value Type='Integer'><UserID/></Value></Eq></Or></Or><Neq><FieldRef Name='Idea_x0020_Status' /><Value Type='Choice'>Canceled</Value></Neq></And></Where></Query>";
			
		/*********************/
		
		myQuery = "<Query><Where><And><Or><Or><Eq><FieldRef Name='Executor' /><Value Type='Integer'><UserID/></Value></Eq><Eq><FieldRef Name='Director'/><Value Type='Integer'><UserID/></Value></Eq></Or><Or><Eq><FieldRef Name='VP' /><Value Type='Integer'><UserID/></Value></Eq><Eq><FieldRef Name='FTE_x0020_Contributors' /><Value Type='Integer'><UserID/></Value></Eq></Or></Or><Neq><FieldRef Name='Idea_x0020_Status' /><Value Type='Choice'>Canceled</Value></Neq></And></Where></Query>";
		
		
		
		/*******************************/
		
		
		
		
		// else if (filterSetting == "currentyear")
		// {
		// myQuery = "<Query><Where><And><Or><Or><Eq><FieldRef Name='Executor' /><Value Type='Text'>Crystal Scarborough</Value></Eq><Eq><FieldRef Name='Director' /><Value Type='Integer'><UserID/></Value></Eq></Or><Or><Eq><FieldRef Name='VP' /><Value Type='Integer'><UserID/></Value></Eq><Eq><FieldRef Name='FTE_x0020_Contributors' /><Value Type='Integer'><UserID/></Value></Eq></Or></Or><Neq><FieldRef Name='Idea_x0020_Status' /><Value Type='Choice'>Canceled</Value></Neq></And></Where></Query>";

		// }
		// else if (filterSetting == "nextyear")
		// {

			// myQuery = "<Query><Where><And><Or><Or><Eq><FieldRef Name='Executor' /><Value Type='Text'>Crystal Scarborough</Value></Eq><Eq><FieldRef Name='Director' /><Value Type='Integer'><UserID/></Value></Eq></Or><Or><Eq><FieldRef Name='VP' /><Value Type='Integer'><UserID/></Value></Eq><Eq><FieldRef Name='FTE_x0020_Contributors' /><Value Type='Integer'><UserID/></Value></Eq></Or></Or><Neq><FieldRef Name='Idea_x0020_Status' /><Value Type='Choice'>Canceled</Value></Neq></And></Where></Query>";

		// }
		// else if (filterSetting == "previousyear")
		// {

			// myQuery = "<Query><Where><And><And><Or><Or><Eq><FieldRef Name='Project_x0020_Contact' /><Value Type='Integer'><UserID/></Value></Eq><Eq><FieldRef Name='Project_x0020_Director' /><Value Type='Integer'><UserID/></Value></Eq></Or><Or><Eq><FieldRef Name='Project_x0020_VP' /><Value Type='Integer'><UserID/></Value></Eq><Eq><FieldRef Name='FTE_x0020_Contributors' /><Value Type='Integer'><UserID/></Value></Eq></Or></Or><Neq><FieldRef Name='Project_x0020_Status' /><Value Type='Text'>Canceled</Value></Neq></And><Neq><FieldRef Name='EstimatedSavings2012' /><Value Type='Integer'>0</Value></Neq></And></Where></Query>";

		// }
	}
	else if (myideafilterSetting == "true")
	{

	//	if (filterSetting == "nofilter" || filterSetting == "")
		myQuery = "<Query><Where><And><Eq><FieldRef Name='Executor' /><Value Type='Integer'><UserID/></Value></Eq><Neq><FieldRef Name='Idea_x0020_Status' /><Value Type='Choice'>Canceled</Value></Neq></And></Where></Query>"; 
		// else if (filterSetting == "currentyear")
		// {

			// myQuery = "<Query><Where><And><Or><Eq><FieldRef Name='Project_x0020_Contact' /><Value Type='Integer'><UserID/></Value></Eq><Eq><FieldRef Name='FTE_x0020_Contributors' /><Value Type='Integer'><UserID/></Value></Eq></Or><Neq><FieldRef Name='Project_x0020_Status' /><Value Type='Text'>Canceled</Value></Neq></And></Where></Query>";
		// }
		// else if (filterSetting == "nextyear")
		// {

			// myQuery = "<Query><Where><And><Or><Eq><FieldRef Name='Project_x0020_Contact' /><Value Type='Integer'><UserID/></Value></Eq><Eq><FieldRef Name='FTE_x0020_Contributors' /><Value Type='Integer'><UserID/></Value></Eq></Or><Neq><FieldRef Name='Project_x0020_Status' /><Value Type='Text'>Canceled</Value></Neq></And></Where></Query>";
		// }
		// // else if (filterSetting == "previousyear")
		// {

			// myQuery = "<Query><Where><And><And><Or><Eq><FieldRef Name='Project_x0020_Contact' /><Value Type='Integer'><UserID/></Value></Eq><Eq><FieldRef Name='FTE_x0020_Contributors' /><Value Type='Integer'><UserID/></Value></Eq></Or><Neq><FieldRef Name='Project_x0020_Status' /><Value Type='Text'>Canceled</Value></Neq></And><Neq><FieldRef Name='EstimatedSavings2012' /><Value Type='Integer'>0</Value></Neq> </And></Where></Query>";

		// }

	}
	
	return myQuery;
}

function getVersionQuery()
{  
	// var versionQuery =  "<Query>" +
						// "<Where>" +
							// "<Gt>" +
								// "<FieldRef Name='Value'/>" +
								// "<Value Type='Integer'>" + parseInt(installedVersion.split(".")[0]) + "</Value>" +
							// "</Gt>" +
						// "</Where>" +
						// "</Query>";
	var versionQuery = "<Query>" +
								"<FieldRef Name='Value'/>" +
						"</Query>";
	return versionQuery;
}

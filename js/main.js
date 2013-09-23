var excelList="EXCEL Ideas";

var getListItems="GetListItems";

var ActiveFlyout;
var ActiveCategory;

$().SPServices.defaults.webURL = "https://teams.aexp.com/sites/teamsitewendy/WASTE";  // URL of the target Web
$().SPServices.defaults.listName = excelList;  // Name of the list for list 

// Enable support of cross domain origin request
jQuery.support.cors = true;
var truncatelength=30;

// Disable caching of AJAX responses - Stop IE reusing cache data for the same requests
$.ajaxSetup({
cache: false
});


$(document).ready(function () 
{

	
	refresh();
	

	$('#refreshimg').click(function()
	{
		refresh();
		return false;
	});
	
	
	
	$('#star').raty();


});


function refresh()
{


	$("#refreshimg").attr('src',"images/loading.gif");
	
	$('#accordion').empty();
	
	var status=getEXCELData();

	if(status=="success")
	{
		var currentdate = new Date();
		var datetime = "";
		datetime += dateToString(currentdate );
		datetime += " "+currentdate.getHours() + ":"
		+ currentdate.getMinutes() + ":"
		+ currentdate.getSeconds();
		$('#lastrefresh').html(datetime);
		
	}
	else
	{
		$('#lastrefresh').html("Error");
		
	}
	
	
	$("#refreshimg").attr('src',"images/refresh.png");

	
}


// --------------------------------------------------------------------
// Initialize the gadget.
// --------------------------------------------------------------------
function init() 
{
	// Enable Settings dialog for the gadget. 
	// System.Gadget.settingsUI = "cpsettings.html";

	// Specify the Flyout root.
	
	var IsGadget = (window.System != undefined);
	if(IsGadget)
	{
		System.Gadget.Flyout.file = "flyout.html";
		System.Gadget.Flyout.show = false;
	}
}


function  getEXCELData()	
{
	var myQuery = "<Query><Where><And><Or><Or><Eq><FieldRef Name='Project_x0020_Contact' /><Value Type='Integer'><UserID/></Value></Eq><Eq><FieldRef Name='Project_x0020_Director' /><Value Type='Integer'><UserID/></Value></Eq></Or><Eq><FieldRef Name='Project_x0020_VP' /><Value Type='Integer'><UserID/></Value></Eq></Or><Neq><FieldRef Name='Project_x0020_Status' /><Value Type='Text'>Canceled</Value></Neq></And></Where></Query>";
	// var myQuery = "<Query><Where><And><Or><Or><Eq><FieldRef Name='Project_x0020_Contact' /><Value Type='Integer'><UserID/></Value></Eq><Eq><FieldRef Name='Project_x0020_Director' /><Value Type='Integer'><UserID/></Value></Eq></Or><Eq><FieldRef Name='Project_x0020_VP' /><Value Type='Integer'><UserID/></Value></Eq></Or><Neq><FieldRef Name='Project_x0020_Status' /><Value Type='Text'>Canceled</Value></Neq></And></Where></Query>";
	

	
	$().SPServices(
	{
operation: "GetListItems",
async: false,
listName: excelList,
CAMLViewFields: "<ViewFields Properties='True'><FieldRef Name='Title' /><FieldRef Name='Project_x0020_Status' /><FieldRef Name='Project_x0020_Director' /><FieldRef Name='Project_x0020_Contact' /><FieldRef Name='Project_x0020_VP' /><FieldRef Name='Estimated_x0020_Savings' /><FieldRef Name='Planned_x0020_Implementation_x00' /><FieldRef Name='Revised_x0020_Implementation_x00' /></ViewFields>",
CAMLQuery: myQuery,
completefunc: function (xData, Status) 
		{
			if (Status == "Error")
			{
				
				return "error";
			}
			// alert(Status);
			var resJson=$(xData.responseXML).SPFilterNode("z:row").SPXmlToJson(
			{ 
				
mapping: 
				{
					ows_ID: {mappedName: "ID", objectType: "Counter"},
					ows_Title: {mappedName: "Title", objectType: "Text"},
					ows_Created: {mappedName: "Created", objectType: "DateTime"}
				},   
includeAllAttrs: true
			});
			
			
			var statuslist=new Array();
			var sum=0;
			$.each(resJson, function(i,excel) 
			{
				//insert the departments
				if (excel.Project_x0020_Status != null && $('#' + excel.Project_x0020_Status.replace(/ /g,"_")).length == 0) 
				{
					// console.log(excel.Project_x0020_Status);
					
					$('#accordion').append('<tbody id='+ excel.Project_x0020_Status.replace(/ /g,"_")+' class="category"><tr bgcolor=rgb(251,245,147) class="contentrow"><td class="arrow">> </td><td onclick="javascript:showFlyout('+excel.Project_x0020_Status.replace(/ /g,"_")+'sub)" class="content">'+excel.Project_x0020_Status+'</td><td class="amount" id="amnt"></td></tr></tbody><tbody class="subcategory" id='+excel.Project_x0020_Status.replace(/ /g,"_")+'sub></tbody>');
					
					statuslist.push(excel.Project_x0020_Status.replace(/ /g,"_"));
					
					
				}
				//insert contacts in the accordion
				// $('#' + excel.Project_x0020_Status.replace(/ /g,"_")).after('<table style="width:100%"><tr><td class="title"><a href="https://teams.aexp.com/sites/teamsitewendy/WASTE/Lists/WASTE%20Ideas/dispform.aspx?ID=' + excel.ID + '">' + excel.Title + '</a></td><td class="amount">$ '+ getMoney(excel.Estimated_x0020_Savings)   +'</td></tr></table>');
				$('#' + excel.Project_x0020_Status.replace(/ /g,"_") +'sub').append('<tr bgcolor="rgb(251,245,147)" class="idearow"><td class="idea" colspan="2"><a href="https://teams.aexp.com/sites/teamsitewendy/WASTE/Lists/WASTE%20Ideas/dispform.aspx?ID='+ excel.ID+'">'+excel.Title.truncateOnWord(truncatelength)+'</a></td><td class="ideaamount">$ '+getMoney(excel.Estimated_x0020_Savings)+'</td></tr>');
				
				var previousSum=$('#' + excel.Project_x0020_Status.replace(/ /g,"_")).attr("sum");
				if (typeof(previousSum) == "undefined")
				previousSum=0;
				
				previousSum=Number(previousSum)+Number(excel.Estimated_x0020_Savings);
				$('#' + excel.Project_x0020_Status.replace(/ /g,"_")).attr("sum",previousSum);
				
				//Calculate heat map based on date
				var impDate
				if(excel.Project_x0020_Status=="In Progress")
				{
						if(excel.Revised_x0020_Implementation_x0020_Date !="undefined")
						{
							impDate=excel.Revised_x0020_Implementation_x0020_Date;
						}
						else
						{
							if(excel.Implementation_x0020_Date !="undefined")
							{
								impDate=excel.Implementation_x0020_Date;
							}
							else
							{
								//error condition, no date defined
								
							}
						
						}
				}
				
				
			});
			
			$.each(statuslist, function(i,list) 
			{
				
				var sum=$("#" + list).attr("sum");
				
				sum= "$ "+ getMoney(sum);
				// $("#" + list).after("<span style='float:right'>"+sum+"</span>");
				
				$("#" + list).find('#amnt').html(sum);									
				
				
				
			});
			
		}});
	
	$(document).ready(function () 
	{
		var body=document.body;
		var height=100+ $('tbody.category').size()*40;
		
		
		// document.body.style.height=100 + $('tbody.category').size()*40;
		
		setBodyHeight(body,height);
	});
	
	return "success"
}

// --------------------------------------------------------------------
// Display the Flyout 
// --------------------------------------------------------------------
function showFlyout(status) 
{
	ActiveFlyout=status;
	var index=status.id.indexOf("sub");
	if(index!=-1)
	ActiveCategory=status.id.substring(0,index).replace(/_/g," ");
	
	var IsGadget = (window.System != undefined);
	if(IsGadget)
	{

		System.Gadget.Flyout.file = "flyout.html";
		System.Gadget.Flyout.onShow = FlyoutLoaded;
		System.Gadget.Flyout.show =!System.Gadget.Flyout.show;
	}

}


function FlyoutLoaded()
{

	var approvedDOM=$(ActiveFlyout).html();
	var flyoutDOM=System.Gadget.Flyout.document.getElementById('faccordion');
	$(flyoutDOM).empty();
	$(flyoutDOM).append(approvedDOM);


	
		
		//$(flyoutDOM).append($('#'+ ActiveFlyout).children().size());
		
		var heading=System.Gadget.Flyout.document.getElementById('heading');
		//$(heading).html('<h1>5</h1>');
		 var size=$(flyoutDOM).find('tr').size()
		$(heading).html(size +' ideas in '+ActiveCategory.valueOf() );
		
		
		var body=System.Gadget.Flyout.document.body;
		var height=40+size*25;
		
		setBodyHeight(body, height);
		//System.Gadget.Flyout.document.body.style.height=600;

}

function getMoney(number){
	var n = number, 
	c = isNaN(c = Math.abs(c)) ? 2 : c, 
	d = d == undefined ? "." : d, 
	t = t == undefined ? "," : t, 
	s = n < 0 ? "-" : "", 
	i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "", 
	j = (j = i.length) > 3 ? j % 3 : 0;
	return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
};


function dateToString(date) {
	var month = date.getMonth() + 1;
	var day = date.getDate();
	var dateOfString = (("" + day).length < 2 ? "0" : "") + day + "/";
	dateOfString += (("" + month).length < 2 ? "0" : "") + month + "/";
	dateOfString += date.getFullYear();
	return dateOfString;
}

function ResizeWindowTo(sElemId) {
	document.body.leftMargin = 0;
	document.body.topMargin = 0;
	var oElem = document.getElementById(sElemId);
	var nHigh = oElem.offsetHeight;
	var nWide = oElem.offsetWidth;
	document.body.style.height = nHigh;
	document.body.style.width = nWide;
}


function resize(height, width)
{

	//document.body.style.height=400;


}


function rateit()
{
	//var body=document.body;
	//setBodyHeight(body,260);

  
}

function setBodyHeight(body, height)
{
	

  $(body).animate( {height:height},1000, function() {
    // Animation complete.
	
  });
  

}




var listId="{68BAA1F6-7B43-4AAF-B821-B9575C263044}";

var viewByContact="{caf32849-a1fd-4c1e-bfa1-8cda07b9596a}";

var viewByDirector="{6f80fcc3-19c9-4fe8-a1a7-bf019074f419}";

var viewByVP="{d4a22faa-8635-4f79-a54f-102a2ee68635}";

var excelList="EXCEL Ideas";

var getListItems="GetListItems";

var url='https://teams.aexp.com/sites/teamsitewendy/WASTE/_vti_bin/owssvr.dll?cmd=DISPLAY&List={68BAA1F6-7B43-4AAF-B821-B9575C263044}&view={6f80fcc3-19c9-4fe8-a1a7-bf019074f419}&XMLDATA=TRUE';


$().SPServices.defaults.webURL = "https://teams.aexp.com/sites/teamsitewendy/WASTE";  // URL of the target Web
$().SPServices.defaults.listName = excelList;  // Name of the list for list 

// Enable support of cross domain origin request
jQuery.support.cors = true;

// Disable caching of AJAX responses - Stop IE reusing cache data for the same requests
$.ajaxSetup({
    cache: false
});


$(document).ready(function () 
{
     $('#refreshimg').click(function()
	 {
		$("#refreshimg").attr('src',"images/loading.gif");
		
		setTimeout(function(){
        $("#refreshimg").attr('src',"images/refresh.png");
    }, 3000);
			
		return false;
  });
  
  
});


// --------------------------------------------------------------------
// Initialize the gadget.
// --------------------------------------------------------------------
function init() 
{
    // Enable Settings dialog for the gadget. 
    // System.Gadget.settingsUI = "cpsettings.html";

    // Specify the Flyout root.
     System.Gadget.Flyout.file = "excel.html";
     System.Gadget.Flyout.show = false;
  
}

function Excelinit() 
{
   
    $("#playImage").hide();
	
	

    reload_Page();

    //kickoff the auto update timer
    // setTimeout(function () { updateTick(); }, 1000);
}

// -------------------------------------------------
// Reload the page
// -------------------------------------------------
function reload_Page() 
{
    //Show the loading images
   
	 $("#loadingimage").show();
        
    getEXCELData();
	
	 $("#loadingimage").hide();
        
}	

function  getEXCELData()	
{
			var myQuery = "<Query><Where><And><Or><Or><Eq><FieldRef Name='Project_x0020_Contact' /><Value Type='Integer'><UserID/></Value></Eq><Eq><FieldRef Name='Project_x0020_Director' /><Value Type='Integer'><UserID/></Value></Eq></Or><Eq><FieldRef Name='Project_x0020_VP' /><Value Type='Integer'><UserID/></Value></Eq></Or><Neq><FieldRef Name='Project_x0020_Status' /><Value Type='Text'>Canceled</Value></Neq></And></Where></Query>";
			// var myQuery = "<Query><Where><Eq><FieldRef Name='Project_x0020_Contact' /><Value Type='Integer'><UserID/></Value></Eq></Where></Query>";

			
			$().SPServices(
					{
						operation: "GetListItems",
						async: false,
						listName: excelList,
						CAMLViewFields: "<ViewFields Properties='True'><FieldRef Name='Title' /><FieldRef Name='Project_x0020_Status' /><FieldRef Name='Project_x0020_Director' /><FieldRef Name='Project_x0020_Contact' /><FieldRef Name='Project_x0020_VP' /><FieldRef Name='Estimated_x0020_Savings' /></ViewFields>",
						CAMLQuery: myQuery,
						completefunc: function (xData, Status) 
						{
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
							
							
							//console.log(resJson);
							var wrapper={objects:resJson};
							//console.log(wrapper);
							// var myJSONText = JSON.stringify(resJson);
							//console.log(myJSONText);

							// setEXCELData(resJson);
							var template =  "{{objects}}<tr><td class='title'>{{Title}}</td><td class='amount'>$ {{Estimated_x0020_Savings | number | formatMoney  }}</td></tr>{{/objects}}";
							
							
							// var result=Mark.up(template, wrapper);
							
							// $("#excelTable").html(result);
							
							var statuslist=new Array();
							var sum=0;
							$.each(resJson, function(i,excel) 
							{
								//insert the departments
								if (excel.Project_x0020_Status != null && $('#' + excel.Project_x0020_Status.replace(/ /g,"_")).length == 0) 
								{
									// console.log(excel.Project_x0020_Status);
								   //  $('#accordion').append('<h3 id='+ excel.Project_x0020_Status.replace(/ /g,"_") +'><a href="#">' + excel.Project_x0020_Status + '</a></h3>')
									$('#accordion').append('<tbody id='+ excel.Project_x0020_Status.replace(/ /g,"_")+' class="category"><tr bgcolor=rgb(251,245,147) class="contentrow"><td class="arrow">> </td><td class="content"><a href="javascript:expand();">'+excel.Project_x0020_Status+'</a></td><td class="amount">$ 4,000</td></tr></tbody>');
									//$('#accordion').append('<div>'+excel.Project_x0020_Status+'</div>');
									statuslist.push(excel.Project_x0020_Status.replace(/ /g,"_"));
									
									
								}
								//insert contacts in the accordion
								$('#' + excel.Project_x0020_Status.replace(/ /g,"_")).after('<table style="width:100%"><tr><td class="title"><a href="https://teams.aexp.com/sites/teamsitewendy/WASTE/Lists/WASTE%20Ideas/dispform.aspx?ID=' + excel.ID + '">' + excel.Title + '</a></td><td class="amount">$ '+ getMoney(excel.Estimated_x0020_Savings)   +'</td></tr></table>');
								
								var previousSum=$('#' + excel.Project_x0020_Status.replace(/ /g,"_")).attr("sum");
								if (typeof(previousSum) == "undefined")
									previousSum=0;
									
								previousSum=Number(previousSum)+Number(excel.Estimated_x0020_Savings);
								$('#' + excel.Project_x0020_Status.replace(/ /g,"_")).attr("sum",previousSum);
								
							});
							
								/*$.each(statuslist, function(i,list) 
								{
								
									var sum=$("#" + list).attr("sum");
									
									sum= "$ "+ getMoney(sum);
									// $("#" + list).after("<span style='float:right'>"+sum+"</span>");
									
									$("#" + list).nextUntil("h3").wrapAll("<div></div>");
										
									$("#" + list).next().append('<table style="width:100%"><tr><td class="title"><b>Total</b></td><td class="amount">' + sum   +'</td></tr></table>');
									
									
									
									
								});*/
								
							}});
							
							var icons = 
							{
							  header: "ui-icon-circle-arrow-e",
							  activeHeader: "ui-icon-circle-arrow-s"
							};
							
							/*$(function() 
							{
								$("#accordion").accordion({collapsible: true, icons:icons, heightStyle: "content"});
								
								
							});*/

							
							
							
						
					   
							
					
					
}

// --------------------------------------------------------------------
// Display the Flyout 
// --------------------------------------------------------------------
function showFlyout(source) 
{
 // Specify the Flyout root.
			if(source=='finance')
			{
			
				System.Gadget.Flyout.file = "excel.html";
			}
			else if(source =='investment')
			{
			
				System.Gadget.Flyout.file = "investment.html";
			
			}
			System.Gadget.Flyout.show =!System.Gadget.Flyout.show;


}


function setEXCELData(resJson)
{

	







}

function navCodeProject() {
    window.open("https://teams.aexp.com/sites/teamsitewendy/WASTE/SitePages/My%20WASTE%20Home.aspx");
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



$(document).ready(function () 
{


		var body=document.body;
		setBodyHeight(body, 100);
		
		//$(flyoutDOM).append($('#'+ ActiveFlyout).children().size());
		
		var heading=document.getElementById('heading');
		$(heading).html('<h1>'+$('#'+ ActiveFlyout).children().size()+'</h1>');
		
});
		
		
		
		
		
function setBodyHeight(body, height)
{
	

  $(body).animate( {height:height},1000, function() {
    // Animation complete.
	
  });
  

}
		
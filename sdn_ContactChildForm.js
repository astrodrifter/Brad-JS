if (sdn === undefined) 
{
    var sdn = {};
}

sdn.contactChildOnload = function()
{
	sdn.loadCSS("WebResources/sdn_CSS_ColourOrange");	
	sdn.addEventHandler(); 
	Xrm.Page.getAttribute("sdn_office").addOnChange(function () { sdn.retrieveOfficeAddress(); });
	sdn.retrieveAddress();
	sdn.loadGoogleMap();
}
	
sdn.addEventHandler = function()  // add the event handler for PreSearch Event
{
    Xrm.Page.getControl("sdn_office").addPreSearch(sdn.addFilter);
}

sdn.addFilter = function()
{
	var accountType = 749150003 //Account Type = Office Location
	//create a filter xml
	var filter ="<filter type='and'>" +
				"<condition attribute='sdn_accounttype' operator='eq' value='" + accountType + "'/>" +
				"</filter>";
	//add filter
	Xrm.Page.getControl("sdn_office").addCustomFilter(filter);  
}

sdn.retrieveAddress = function()
{
	var contactId  = Xrm.Page.getAttribute("sdn_contact").getValue()[0].id;
	SDK.REST.retrieveRecord(
		contactId, "Contact", null, null,
		function (contact){
			Xrm.Page.getAttribute("sdn_address1_name").setValue(contact.Address1_Name);
			Xrm.Page.getAttribute("sdn_address1_name").setSubmitMode("always"); 																				
		},
		function (error){
			alert(error.message);
		}
	);
}

sdn.retrieveOfficeAddress = function()
{
	var officeId  = Xrm.Page.getAttribute("sdn_office").getValue()[0].id;
	SDK.REST.retrieveRecord(
		officeId, "Account", null, null,
		function (office){
			Xrm.Page.getAttribute("sdn_officeaddress_name").setValue(office.Address1_Name);
			Xrm.Page.getAttribute("sdn_officeaddress_name").setSubmitMode("always"); 
			sdn.loadGoogleMap();
		},
		function (error){
			alert(error.message);
		}
	);
}
	
sdn.loadGoogleMap = function()
{
	var webr = Xrm.Page.getControl("WebResource_Map_Single"); //Geocode Address
	
	var websrc = webr.getSrc();
	webr.setSrc(websrc);	
}   
 
 
 sdn.loadCSS = function(path) 
{
	var head = document.getElementsByTagName('head')[0];
	var link = document.createElement('link');
	link.rel = 'stylesheet';
	link.type = 'text/css';
	link.href = path;
	link.media = 'all';
	head.appendChild(link);
}


			

 
 
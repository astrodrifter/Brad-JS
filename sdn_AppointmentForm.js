if (sdn === undefined) 
{
    var sdn = {};
}
 
sdn.onLoad = function () 
{
	Xrm.Page.getAttribute("sdn_location_suburbid").addOnChange(function () { sdn.addressOnchange("sdn_location_suburbid", "sdn_location_state", "sdn_location_postcode", "sdn_location_street1", "location"); });
	Xrm.Page.getAttribute("sdn_location_street1").addOnChange(function () { sdn.addressOnchange("sdn_location_suburbid", "sdn_location_state", "sdn_location_postcode", "sdn_location_street1", "location"); });
	Xrm.Page.getAttribute("scheduledstart").addOnChange(function () { sdn.onChangeStartTime(); });
	
	if(Xrm.Page.ui.getFormType() == 1) 
	{
		var now = new Date();
		Xrm.Page.getAttribute("scheduledstart").setValue(now);
		Xrm.Page.getAttribute("scheduleddurationminutes").setValue(null);
		sdn.setCurrentUser("sdn_recordowner")
	}
}

sdn.onSave = function () 
{
	if(Xrm.Page.ui.getFormType() == 1) 
	{
		if(Xrm.Page.getAttribute("scheduledend").getValue() == null)
		{
			var now = new Date();
			Xrm.Page.getAttribute("scheduledend").setValue(now);
		}
	}
}

 sdn.onChangeStartTime = function()
 {
	 Xrm.Page.getAttribute("sdn_appointmentdate").setValue(Xrm.Page.getAttribute("scheduledstart").getValue());
 }
sdn.setCurrentUser = function(field)
{
	var lookupData = new Array();
	var lookupItem = new Object();
	
	lookupItem.id = Xrm.Page.context.getUserId();
	lookupItem.typename = 'systemuser';
	lookupItem.name = Xrm.Page.context.getUserName();
	lookupData[0] = lookupItem;
	Xrm.Page.getAttribute(field).setValue(lookupData);
}

sdn.addressOnchange = function(suburb, state, postcode, line1, addressName)
{
	if (Xrm.Page.getAttribute(suburb).getValue() != null) 
	{
		var suburbId  = Xrm.Page.getAttribute(suburb).getValue()[0].id;
		var suburbName = Xrm.Page.getAttribute(suburb).getValue()[0].name;
		//var suburbRecord = retrieveRecord(suburbId, "sdn_suburbSet"); //Retrieve Suburb Record
		
		SDK.REST.retrieveRecord(
				suburbId, "sdn_suburb", null, null,
					function (suburb){
						var stateValue = suburb.sdn_State.Value;
						if(stateValue == 749150000){var stateName = 'ACT'}
						if(stateValue == 749150001){var stateName = 'NSW'}
						if(stateValue == 749150002){var stateName = 'VIC'}
						if(stateValue == 749150003){var stateName = 'QLD'}
						if(stateValue == 749150004){var stateName = 'SA'}
						if(stateValue == 749150005){var stateName = 'WA'}
						if(stateValue == 749150006){var stateName = 'TAS'}
						if(stateValue == 749150007){var stateName = 'NT'}
						var pcode = suburb.sdn_Postcode;
						Xrm.Page.getAttribute(state).setValue(stateValue);
						Xrm.Page.getAttribute(state).setSubmitMode("always"); 	
						Xrm.Page.getAttribute(postcode).setValue(pcode)		
						Xrm.Page.getAttribute(postcode).setSubmitMode("always"); 
					
						var address = "";
						var street1 = Xrm.Page.getAttribute(line1).getValue();
						
						address = address + ((street1 != null) ? street1 + " " : "");
						address = address + ((suburbName != null) ? suburbName + " " : "");
						address = address + ((stateName != null) ? stateName + " " : "");
						address = address + ((pcode != null) ? pcode + " " : "");
		
						Xrm.Page.getAttribute(addressName).setValue(address);
						Xrm.Page.getAttribute(addressName).setSubmitMode("always"); 
						sdn.loadGoogleMap();
					},
					function (error){
						alert(error.message);
					}
		);
	}	
}

sdn.loadGoogleMap = function()
{
	var webr = Xrm.Page.getControl("WebResource_Map_Single"); //Geocode Address
	
	var websrc = webr.getSrc();
	webr.setSrc(websrc);	
}

sdn.addNote = function()
{
		var entityId = Xrm.Page.data.entity.getId();
		var appointmentName =  Xrm.Page.getAttribute("subject").getValue();
		
		var extraqs = "sdn_appointmentid=" + entityId + "";
		extraqs += "&sdn_appointmentidname=" + appointmentName + "";
		
		//Set features for how the window will appear.
		var features = "height=800,width=700,location=no,menubar=no,status=no,toolbar=no";
		// Open the window.
		window.open("/main.aspx?etn=sdn_notes&pagetype=entityrecord&extraqs=" +
			encodeURIComponent(extraqs), "_blank", features, false);
		
}

sdn.showNoteButton = function()
{
	if(Xrm.Page.getAttribute("sdn_noteid").getValue() != null)// A Note already exists
		return false; // Hide button
	else
		return true; //Show button
}
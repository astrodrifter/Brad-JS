if (sdn === undefined) 
{
    var sdn = {};
}
 
sdn.onLoad = function () 
{
	if(Xrm.Page.ui.getFormType() == 1)
	{
		var tomorrow = new Date();
		Xrm.Page.getAttribute("sdn_traveldate").setValue(tomorrow.setDate(tomorrow.getDate() + 1));
		sdn.setCurrentUser("sdn_traveller");
	}
	
	Xrm.Page.getAttribute("sdn_startlocation_suburbid").addOnChange(function () { sdn.addressOnchange("sdn_startlocation_suburbid", "sdn_startlocation_state", "sdn_startlocation_postcode", "sdn_startlocation_street1", "sdn_startlocation"); });
	Xrm.Page.getAttribute("sdn_startlocation_street1").addOnChange(function () { sdn.addressOnchange("sdn_startlocation_suburbid", "sdn_startlocation_state", "sdn_startlocation_postcode", "sdn_startlocation_street1", "sdn_startlocation"); });
	Xrm.Page.getAttribute("sdn_endlocation_suburbid").addOnChange(function () { sdn.addressOnchange("sdn_endlocation_suburbid", "sdn_endlocation_state", "sdn_endlocation_postcode", "sdn_endlocation_street1", "sdn_endlocation"); });
	Xrm.Page.getAttribute("sdn_endlocation_street1").addOnChange(function () { sdn.addressOnchange("sdn_endlocation_suburbid", "sdn_endlocation_state", "sdn_endlocation_postcode", "sdn_endlocation_street1", "sdn_endlocation"); });
}

sdn.onSave = function()
{
	if(Xrm.Page.ui.getFormType() == 1)
	{
		var travellerName = Xrm.Page.getAttribute("sdn_traveller").getValue()[0].name;
		var travelDate = Xrm.Page.getAttribute("sdn_traveldate").getValue();
		var day = travelDate.getDate()+"";
		var month = (travelDate.getMonth()+1)+"";
		var year = travelDate.getFullYear()+"";
	
		var dateFormat = day + "/" + month + "/" + year;
			
		Xrm.Page.getAttribute("sdn_name").setValue(travellerName + " - " + dateFormat);
	}		
	
}

sdn.getAppointments = function()
{
	sdn.getTravellerAppointments();
}

sdn.getTravellerAppointments = function()
{
	var travelBookId = Xrm.Page.data.entity.getId();
	var startLocation = Xrm.Page.getAttribute('sdn_startlocation').getValue();
	Xrm.Page.getAttribute('sdn_destinationtemp').setValue(null);
	Xrm.Page.getAttribute('sdn_distancetemp').setValue(null);
	Xrm.Page.getAttribute('sdn_durationtemp').setValue(null);
	Xrm.Page.getAttribute('sdn_origintemp').setValue(startLocation);
	var travelDate = 	Xrm.Page.getAttribute('sdn_traveldate').getValue();
	var day = travelDate.getDate()+"";
	var month = (travelDate.getMonth()+1)+"";
	var year = travelDate.getFullYear()+"";
	var dateFormat = day + "/" + month + "/" + year;

	var lookupItem = Xrm.Page.getAttribute('sdn_traveller');//Traveller
    if (lookupItem != null) {
		if (lookupItem.getValue() != null) {
			var travellerId = lookupItem.getValue()[0].id;
			var travellerName = lookupItem.getValue()[0].name;
			
			alert("You are about to import appointments for " + travellerName + " for the date " + dateFormat)
			
			sdn_deleteFromGrid(travelBookId);//Delete any records that curently exist in the grid
			
			SDK.REST.retrieveMultipleRecords(
				"Appointment",
				"?$select=ActivityId,Location,RegardingObjectId,sdn_AppointmentDate,sdn_Location_Lat,sdn_Location_Long,sdn_RecordOwner,Subject,ScheduledStart,ScheduledEnd&$filter=sdn_RecordOwner/Id eq (guid'" + travellerId + "') and sdn_AppointmentDateString eq '" + dateFormat + "' and StateCode/Value eq 3",
				function (results) {
					if(results.length != null)
					{
						//alert("Appointments" + results.length)
						if(results.length >0)
						{
							for (var i = 0; i < results.length; i++) {
								var location = results[i].Location;
								Xrm.Page.getAttribute('sdn_destinationtemp').setValue(location);
								
								var regardingId = results[i].RegardingObjectId.Id;
								var regardingName = results[i].RegardingObjectId.Name;
								var regardingLogicalName = results[i].RegardingObjectId.LogicalName;
								var activityId = results[i].ActivityId
								//Calculate Distance from previous appointment
								sdn.loadGoogleMap();
								var distance = Xrm.Page.getAttribute('sdn_distancetemp').getValue();
								alert("Distance " + distance)
								//CREATE NEW TRAVEL LOG RECORD
								var entity = {};
										entity.RegardingObjectId = {
											Id: regardingId,
											LogicalName: regardingLogicalName
										};
										entity.sdn_AppointmentId = {
											Id: activityId,
											LogicalName: "appointment"
										};
										entity.sdn_DistanceTravelled = distance;
										entity.sdn_TravelDate = results[i].sdn_AppointmentDate;
										entity.ScheduledStart = results[i].ScheduledStart;
										entity.ScheduledEnd = results[i].ScheduledEnd;
										entity.sdn_Traveller = {
											Id: travellerId,
											LogicalName: "systemuser"
										};
										entity.sdn_TravelBookId = {
											Id: travelBookId,
											LogicalName: "sdn_travelbook"
										};
										entity.sdn_TravellingTo = location;
										entity.Subject = "Travel Only";

								SDK.REST.createRecord(
									entity,
									"sdn_travellog",
									function (result) {
										var newEntityId = result.sdn_travellogId;
									},
									function (error) {
										alert(error.message);
									}
								);
								//Xrm.Page.getAttribute('sdn_origintemp').setValue(location);
							}
							//alert("Appointments Successfully Imported!")
							Xrm.Page.data.refresh(true).then(sdn.successCallback, sdn.errorCallback);
							//Xrm.Page.getControl("TravelLogs").refresh();
						}
						else
						{ 
							alert("There aren't any appointments for this Traveller / Date combination!");
							Xrm.Page.data.refresh(true).then(sdn.successCallback, sdn.errorCallback);
						}
					}
					else{ alert("out of luck") }
				},
				function (error) {
					alert(error.message);
				},
				function () {
					//On Complete - Do Something
				}
			);	
		}
	}	
}
		
sdn.loadGoogleMap = function()
{
	var webr = Xrm.Page.getControl("WebResource_Directions_Map"); //Geocode Address
	
	var websrc = webr.getSrc();
	webr.setSrc(websrc);	
}
		
sdn_deleteFromGrid = function(travelBookId)
{
	SDK.REST.retrieveMultipleRecords(
		"sdn_travellog",
		"?$filter=sdn_TravelBookId/Id eq (guid'" + travelBookId + "') ",
		function (gridRecords) {
			if(gridRecords.length != null)
			{
				if(gridRecords.length >0)
				{
					for (var j = 0; j < gridRecords.length; j++) {
						var activityId = gridRecords[j].ActivityId;
						SDK.REST.deleteRecord(activityId, "sdn_travellog", function () {}, function (error) { alert(error.message);});//Delete Travel Log records
					}
				}
			}		
		},
		function (error) {
			alert(error.message);
		},
		function () {
         //On Complete - Do Something
		}
	);
}

//curently not used
sdn.successCallback = function()
{
	//alert("page refreshed")
}
	
sdn.errorCallback = function()
{
	Xrm.Utility.alertDialog(error.message);
}
//______________________________________	

sdn.showButton = function()
{
	if(Xrm.Page.ui.getFormType() == 1)
		return false; // Hide button
	else
		return true; //Show button
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

sdn.sameAddressOnchange = function()
{
	if(Xrm.Page.getAttribute("sdn_sameasstartlocation").getValue() == true)
	{
		if (Xrm.Page.getAttribute("sdn_startlocation_suburbid").getValue() != null) 
		{
			var suburbId  = Xrm.Page.getAttribute("sdn_startlocation_suburbid").getValue()[0].id;
			var suburbName = Xrm.Page.getAttribute("sdn_startlocation_suburbid").getValue()[0].name;
			
			var lookupData = new Array();
			var lookupItem = new Object();
			lookupItem.id = suburbId;
			lookupItem.typename = 'sdn_suburb';
			lookupItem.name = suburbName;
			lookupData[0] = lookupItem;
			Xrm.Page.getAttribute("sdn_endlocation_suburbid").setValue(lookupData); //Billling Suburb Lookup
			Xrm.Page.getAttribute("sdn_endlocation_state").setValue(Xrm.Page.getAttribute("sdn_startlocation_state").getValue());
			Xrm.Page.getAttribute('sdn_endlocation_state').setSubmitMode("always"); 
			Xrm.Page.getAttribute("sdn_endlocation_postcode").setValue(Xrm.Page.getAttribute("sdn_startlocation_postcode").getValue());
			Xrm.Page.getAttribute('sdn_endlocation_postcode').setSubmitMode("always"); 	
			Xrm.Page.getAttribute("sdn_endlocation_street1").setValue(Xrm.Page.getAttribute("sdn_startlocation_street1").getValue());
			Xrm.Page.getAttribute("sdn_endlocation").setValue(Xrm.Page.getAttribute("sdn_startlocation").getValue());
			Xrm.Page.getAttribute('sdn_endlocation').setSubmitMode("always"); 
		}	
	}
	else //Set all fields empty
	{
		Xrm.Page.getAttribute("sdn_endlocation_suburbid").setValue(null); 
		Xrm.Page.getAttribute("sdn_endlocation_state").setValue(null);
		Xrm.Page.getAttribute('sdn_endlocation_state').setSubmitMode("always"); 
		Xrm.Page.getAttribute("sdn_endlocation_postcode").setValue(null);
		Xrm.Page.getAttribute('sdn_endlocation_postcode').setSubmitMode("always"); 	
		Xrm.Page.getAttribute("sdn_endlocation_street1").setValue(null);
		Xrm.Page.getAttribute("sdn_endlocation").setValue(null);
		Xrm.Page.getAttribute('sdn_endlocation').setSubmitMode("always"); 
	}
}


if (sdn === undefined) 
{
    var sdn = {};
}
 
sdn.intakeFormOnLoad = function () 
{
	if(Xrm.Page.ui.getFormType() == 1)
	{
		Xrm.Page.ui.process.setVisible(false);
		var now = new Date();
		Xrm.Page.getAttribute("sdn_dateofenquiry").setValue(now);
		Xrm.Page.getAttribute("sdn_isintakeform").setValue(true); //TEMP MEASURE ONLY
		Xrm.Page.getAttribute("sdn_confirmation").setValue(1); //TEMP MEASURE ONLY
		Xrm.Page.getAttribute("subject").setValue("Intake"); //TEMP MEASURE ONLY		
	}
	if(Xrm.Page.ui.getFormType() == 2)
	{
		//Xrm.Page.ui.process.setVisible(true);
		sdn.switchProcess()
	}
	
	if(Xrm.Page.getAttribute("sdn_iswaitlist").getValue() == true){redirectToForm("Waitlist Lead")}//Waitlist 
	if(Xrm.Page.getAttribute("sdn_isintakeform").getValue() == true){redirectToForm("Intake Form")}//Intake Form

	Xrm.Page.getAttribute("sdn_address1_suburbid").addOnChange(function () { sdn.addressOnchange("sdn_address1_suburbid", "address1_stateorprovince", "address1_postalcode", "address1_line1", "address1_line2", "address1_name", "address1_city"); });
	Xrm.Page.getAttribute("sdn_whereareyoufrom").addOnChange(function () { sdn.onChangeWhereFrom(); });	
	Xrm.Page.getAttribute("sdn_healthcarecard").addOnChange(function () { sdn.onChangeHealthCareCard(); });
	Xrm.Page.getAttribute("sdn_soleparent").addOnChange(function () { sdn.onChangeSoleParent(); });
	Xrm.Page.getAttribute("sdn_csorbf").addOnChange(function () { sdn.onChangePriorityOne(); });
	Xrm.Page.getAttribute("sdn_safeandstablehousing").addOnChange(function () { sdn.onChangePriorityOne(); });
	Xrm.Page.getAttribute("sdn_intaketype").addOnChange(function () { sdn.onChangeIntakeType(); });//Switches BPF
}

sdn.onSave = function()
{
	var saveEvent = context.getEventArgs();
    if (saveEvent.getSaveMode() == 70) { //Form AutoSave Event
        saveEvent.preventDefault(); //Stops the Save Event
		return;
    }
	Xrm.Page.getAttribute("sdn_isintakeform").setValue(true);
}

sdn.onChangeIntakeType = function()
{
	Xrm.Page.data.entity.save();
}

sdn.onChangeWhereFrom = function()
{
	var whereFrom= Xrm.Page.getAttribute("sdn_whereareyoufrom").getValue();
	if(whereFrom == 749150001) //Agency
	{
		Xrm.Page.ui.tabs.get("StartTab").sections.get("AgencyDetailsSection").setVisible(true);  
	}
	else //Family
	{
		Xrm.Page.ui.tabs.get("StartTab").sections.get("AgencyDetailsSection").setVisible(false);  
	}
}

sdn.onChangeHealthCareCard = function()
{
	Xrm.Page.getAttribute("sdn_healthcarecardtext").setValue(Xrm.Page.getAttribute("sdn_healthcarecard").getText());
}

sdn.onChangeSoleParent = function()
{
	Xrm.Page.getAttribute("sdn_soleparenttext").setValue(Xrm.Page.getAttribute("sdn_healthcarecard").getText());
}

sdn.qualifyIntake = function()
{
	if(Xrm.Page.getAttribute("sdn_childdetailsverified").getValue() == true)
	{
		if(Xrm.Page.getAttribute("sdn_carerdetailsverified").getValue() == true)
		{
			if(Xrm.Page.getAttribute("sdn_qualifyintake").getValue() == true)
			{
				var r = confirm("The system will now generate a child record, a carer record and a family record. \n\nAre you sure you wish to continue?");
				if(r == true)
				{
					sdn.runWorkflow()	
				}
				else
				{
					alert("OK, records will not be generated right now.");//Exit from popup
					return;
				}	
			}
			else
			{
				alert("Please click Accept Intake on stage 3 to continue!");
				return;
			}
		}
		else
		{
			alert("Please verfiy carer details to continue!");
			return;
		}
	}
	else
	{
		alert("Please verfiy child details to continue!");
		return;
	}
}

sdn.runWorkflow = function()
{
	var url = Xrm.Page.context.getClientUrl();
	var entityId = Xrm.Page.data.entity.getId();
	var workflowId = '818E3F52-3F6B-4B01-9DE2-8D59D15420AA';
	var OrgServicePath = "/XRMServices/2011/Organization.svc/web";
	url = url + OrgServicePath;
	var request;
	request = "<s:Envelope xmlns:s=\"http://schemas.xmlsoap.org/soap/envelope/\">" +
				"<s:Body>" +
					"<Execute xmlns=\"http://schemas.microsoft.com/xrm/2011/Contracts/Services\" xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\">" +
					"<request i:type=\"b:ExecuteWorkflowRequest\" xmlns:a=\"http://schemas.microsoft.com/xrm/2011/Contracts\" xmlns:b=\"http://schemas.microsoft.com/crm/2011/Contracts\">" +
						"<a:Parameters xmlns:c=\"http://schemas.datacontract.org/2004/07/System.Collections.Generic\">" +
						"<a:KeyValuePairOfstringanyType>" +
							"<c:key>EntityId</c:key>" +
							"<c:value i:type=\"d:guid\" xmlns:d=\"http://schemas.microsoft.com/2003/10/Serialization/\">" + entityId + "</c:value>" +
						"</a:KeyValuePairOfstringanyType>" +
						"<a:KeyValuePairOfstringanyType>" +
							"<c:key>WorkflowId</c:key>" +
							"<c:value i:type=\"d:guid\" xmlns:d=\"http://schemas.microsoft.com/2003/10/Serialization/\">" + workflowId + "</c:value>" +
						"</a:KeyValuePairOfstringanyType>" +
						"</a:Parameters>" +
						"<a:RequestId i:nil=\"true\" />" +
						"<a:RequestName>ExecuteWorkflow</a:RequestName>" +
					"</request>" +
					"</Execute>" +
				"</s:Body>" +
				"</s:Envelope>";

	var req = new XMLHttpRequest();
	req.open("POST", url, true)
	// Responses will return XML. It isn't possible to return JSON.
	req.setRequestHeader("Accept", "application/xml, text/xml, */*");
	req.setRequestHeader("Content-Type", "text/xml; charset=utf-8");
	req.setRequestHeader("SOAPAction", "http://schemas.microsoft.com/xrm/2011/Contracts/Services/IOrganizationService/Execute");
	req.onreadystatechange = function () { sdn.assignResponse(req); };
	req.send(request);
}


sdn.assignResponse = function (req)
{
	if (req.readyState == 4) {
		if (req.status == 200) {
			//Xrm.Page.getAttribute("statuscode").setValue(100000000);
			//Xrm.Page.getAttribute('statuscode').setSubmitMode("always"); 	
			alert("success!!!!")
			
			//Xrm.Page.ui.close();

			sdn.openFamily();
		}	
	}
}

sdn.openFamily = function()
{
	var OriginatingLead =  Xrm.Page.data.entity.getId();
	
	SDK.REST.retrieveMultipleRecords(
		"Account",
		"?$select=AccountId,OriginatingLeadId&$filter=OriginatingLeadId/Id eq (guid'" + OriginatingLead +"')",
		function (results) {
			alert(results.length)
			for (var i = 0; i < results.length; i++) {
				var AccountId = results[i].AccountId;
				var OriginatingLeadId = results[i].OriginatingLeadId;
			}
			Xrm.Utility.openEntityForm("account", AccountId);
		},
		function (error) {
			alert(error.message);
		},
		function () {
			//On Complete - Do Something
		}
	);	
}

sdn.onChangePriorityOne = function()
{
	if(Xrm.Page.getAttribute("sdn_csorbf").getValue() == 749150001 || Xrm.Page.getAttribute("sdn_safeandstablehousing").getValue() == 749150000)
	{
		var alertMsg = "PLEASE CONTACT YOUR MANAGER IMMMEDIATELY!"
		Xrm.Page.ui.setFormNotification(alertMsg, "ERROR", "noteId1");
	}
	else
	{
		Xrm.Page.ui.clearFormNotification("noteId1");
	}
}

redirectToForm = function(formName)
{
    var currentForm = Xrm.Page.ui.formSelector.getCurrentItem();
    if (currentForm != null) { 
        if (currentForm.getLabel().toLowerCase() != formName.toLowerCase()) { //make sure it's not already this form
            var availableForms = Xrm.Page.ui.formSelector.items.get();
            for (var i in availableForms) {
                var form = availableForms[i];
                if (form.getLabel().toLowerCase() == formName.toLowerCase()) {
                    form.navigate();
                }
            }
        }
    }
}

sdn.addressOnchange = function(suburb, state, postcode, line1, line2, addressName, cityName)
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
						Xrm.Page.getAttribute(state).setValue(stateName);
						Xrm.Page.getAttribute(state).setSubmitMode("always"); 	
						Xrm.Page.getAttribute(postcode).setValue(pcode)		
						Xrm.Page.getAttribute(postcode).setSubmitMode("always"); 
						Xrm.Page.getAttribute(cityName).setValue(suburbName)		
						Xrm.Page.getAttribute(cityName).setSubmitMode("always"); 
						
						var address = "";
						var street1 = Xrm.Page.getAttribute(line1).getValue();
						var street2 = Xrm.Page.getAttribute(line2).getValue();
		
						address = address + ((street1 != null) ? street1 + " " : "");
						address = address + ((street2 != null) ? street2 + " " : "");
						address = address + ((suburbName != null) ? suburbName + " " : "");
						address = address + ((stateName != null) ? stateName + " " : "");
						address = address + ((pcode != null) ? pcode + " " : "");
		
						Xrm.Page.getAttribute(addressName).setValue(address);
						Xrm.Page.getAttribute(addressName).setSubmitMode("always"); 
					},
					function (error){
						alert(error.message);
					}
		);
	}	
}


sdn.switchProcess = function()
{
	var intakeType = Xrm.Page.getAttribute("sdn_isintakeform").getValue();
	if(intakeType == true)
	{
		Xrm.Page.data.process.setActiveProcess('A021F651-DF70-46C0-82EF-D09ED19B4C4A', sdn.switchProcessEnd);
	}
	else 
	{
		Xrm.Page.data.process.setActiveProcess('51E938A4-1538-487E-B825-874492D77379', sdn.switchProcessEnd);
	}

}

sdn.switchProcessEnd = function()
{
	//Do something
}

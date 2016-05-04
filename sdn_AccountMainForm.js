if (sdn === undefined) 
{
    var sdn = {};
}
 
sdn.accountOnLoad = function () 
{
	if(Xrm.Page.getAttribute("sdn_accounttype").getValue() == 749150003) //office
	{
		redirectToForm("Account - Office")
	}
	else if(Xrm.Page.getAttribute("sdn_accounttype").getValue() == 749150000) //Family)
	{
		redirectToForm("Account - Family")
	}
	
	sdn.loadGoogleMap();
	
	Xrm.Page.getAttribute("sdn_address1_suburbid").addOnChange(function () { sdn.addressOnchange("sdn_address1_suburbid", "address1_stateorprovince", "address1_postalcode", "address1_line1", "address1_line2", "address1_name", "address1_city"); });
	Xrm.Page.getAttribute("address1_line1").addOnChange(function () { sdn.addressOnchange("sdn_address1_suburbid", "address1_stateorprovince", "address1_postalcode", "address1_line1", "address1_line2", "address1_name", "address1_city"); });
	Xrm.Page.getAttribute("address1_line2").addOnChange(function () { sdn.addressOnchange("sdn_address1_suburbid", "address1_stateorprovince", "address1_postalcode", "address1_line1", "address1_line2", "address1_name", "address1_city"); });
	Xrm.Page.getAttribute("sdn_address2_suburbid").addOnChange(function () { sdn.addressOnchange("sdn_address2_suburbid", "address2_stateorprovince", "address2_postalcode", "address2_line1", "address2_line2", "address2_name", "address2_city"); });
	Xrm.Page.getAttribute("address2_line1").addOnChange(function () { sdn.addressOnchange("sdn_address2_suburbid", "address2_stateorprovince", "address2_postalcode", "address2_line1", "address2_line2", "address2_name", "address2_city"); });
	Xrm.Page.getAttribute("address2_line2").addOnChange(function () { sdn.addressOnchange("sdn_address2_suburbid", "address2_stateorprovince", "address2_postalcode", "address2_line1", "address2_line2", "address2_name", "address2_city"); });
	
	//Xrm.Page.getAttribute("sdn_address2_issameasprimaryaddress").addOnChange(function () { sdn.sameAddressOnchange(); });	
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

sdn.loadGoogleMap = function()
{
	var webr = Xrm.Page.getControl("WebResource_Map_Single"); //Geocode Address
	
	var websrc = webr.getSrc();
	webr.setSrc(websrc);	
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
	if(Xrm.Page.getAttribute("sdn_address2_issameasprimaryaddress").getValue() == true)
	{
		if (Xrm.Page.getAttribute("sdn_address1_suburbid").getValue() != null) 
		{
			var suburbId  = Xrm.Page.getAttribute("sdn_address1_suburbid").getValue()[0].id;
			var suburbName = Xrm.Page.getAttribute("sdn_address1_suburbid").getValue()[0].name;
			
			var lookupData = new Array();
			var lookupItem = new Object();
			lookupItem.id = suburbId;
			lookupItem.typename = 'sdn_suburb';
			lookupItem.name = suburbName;
			lookupData[0] = lookupItem;
			Xrm.Page.getAttribute("sdn_address2_suburbid").setValue(lookupData); //Billling Suburb Lookup
			
			Xrm.Page.getAttribute("address2_stateorprovince").setValue(Xrm.Page.getAttribute("address1_stateorprovince").getValue());
			Xrm.Page.getAttribute('address2_stateorprovince').setSubmitMode("always"); 
			Xrm.Page.getAttribute("address2_postalcode").setValue(Xrm.Page.getAttribute("address1_postalcode").getValue());
			Xrm.Page.getAttribute('address2_postalcode').setSubmitMode("always"); 	
			Xrm.Page.getAttribute("address2_city").setValue(Xrm.Page.getAttribute("address1_city").getValue());
			Xrm.Page.getAttribute('address2_city').setSubmitMode("always"); 	
			Xrm.Page.getAttribute("address2_line1").setValue(Xrm.Page.getAttribute("address1_line1").getValue());
			Xrm.Page.getAttribute("address2_line2").setValue(Xrm.Page.getAttribute("address1_line2").getValue());
			Xrm.Page.getAttribute("address2_name").setValue(Xrm.Page.getAttribute("address1_name").getValue());
			Xrm.Page.getAttribute('address2_name').setSubmitMode("always"); 
		}	
	}
	else //Set all fields empty
	{
		//sectionClearFields("Address_Tab", "BillingAddressSection")	
		Xrm.Page.getAttribute("sdn_address2_suburbid").setValue(null); 
		Xrm.Page.getAttribute("address2_stateorprovince").setValue(null);
		Xrm.Page.getAttribute('address2_stateorprovince').setSubmitMode("always"); 
		Xrm.Page.getAttribute("address2_postalcode").setValue(null);
		Xrm.Page.getAttribute('address2_postalcode').setSubmitMode("always"); 	
		Xrm.Page.getAttribute("address2_city").setValue(null);
		Xrm.Page.getAttribute('address2_city').setSubmitMode("always"); 	
		Xrm.Page.getAttribute("address2_line1").setValue(null);
		Xrm.Page.getAttribute("address2_line2").setValue(null);
		Xrm.Page.getAttribute("address2_name").setValue(null);
		Xrm.Page.getAttribute('address2_name').setSubmitMode("always"); 
	}
}


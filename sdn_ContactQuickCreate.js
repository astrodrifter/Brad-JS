if (sdn === undefined) 
{
    var sdn = {};
}
 
sdn.contactOnLoad = function () 
{
	
	Xrm.Page.getAttribute("sdn_ischild").addOnChange(function () { sdn.contactTypeOnchange("Child",Xrm.Page.getAttribute("sdn_ischild").getValue()); });
	Xrm.Page.getAttribute("sdn_iscarer").addOnChange(function () { sdn.contactTypeOnchange("Carer",Xrm.Page.getAttribute("sdn_iscarer").getValue()); });
	Xrm.Page.getAttribute("sdn_isstaff").addOnChange(function () { sdn.contactTypeOnchange("Staff",Xrm.Page.getAttribute("sdn_isstaff").getValue()); });
	Xrm.Page.getAttribute("sdn_isexternal").addOnChange(function () { sdn.contactTypeOnchange("External",Xrm.Page.getAttribute("sdn_isexternal").getValue()); });
	Xrm.Page.getAttribute("sdn_isboardmember").addOnChange(function () { sdn.contactTypeOnchange("Board Member",Xrm.Page.getAttribute("sdn_isboardmember").getValue()); });
	Xrm.Page.getAttribute("sdn_isdonor").addOnChange(function () { sdn.contactTypeOnchange("Donor",Xrm.Page.getAttribute("sdn_isdonor").getValue()); });
	
	Xrm.Page.getAttribute("sdn_address1_suburbid").addOnChange(function () { sdn.addressOnchange("sdn_address1_suburbid", "address1_stateorprovince", "address1_postalcode", "address1_line1", "address1_line2", "address1_name", "address1_city"); });
	Xrm.Page.getAttribute("address1_line1").addOnChange(function () { sdn.addressOnchange("sdn_address1_suburbid", "address1_stateorprovince", "address1_postalcode", "address1_line1", "address1_line2", "address1_name", "address1_city"); });
	Xrm.Page.getAttribute("address1_line2").addOnChange(function () { sdn.addressOnchange("sdn_address1_suburbid", "address1_stateorprovince", "address1_postalcode", "address1_line1", "address1_line2", "address1_name", "address1_city"); });
}

sdn.contactTypeOnchange = function(label, flag)
{
	var contactTypeDescription = Xrm.Page.getAttribute("sdn_contacttypedescription").getValue() || "";
		
	if (!flag)
	{
		if (~contactTypeDescription.indexOf(label))
		{
			contactTypeDescription = contactTypeDescription.replace(label,"");
		}
	}
	else
	{
		if (contactTypeDescription.length > 0)
		{
			contactTypeDescription = contactTypeDescription.concat(" ").concat(label);
		}
		else
		{
			contactTypeDescription = label;	
		}	
	}
	Xrm.Page.getAttribute("sdn_contacttypedescription").setValue(contactTypeDescription);	
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



if (sdn === undefined) 
{
    var sdn = {};
}
 
sdn.contactOnLoad = function () 
{
	debugger;
	loadCSS("WebResources/sdn_CSS_ColourOrange");	
	sdn.contactSetTabVisibility();
	Xrm.Page.getAttribute("sdn_ischild").addOnChange(function () { sdn.contactTypeOnchange("Child",Xrm.Page.getAttribute("sdn_ischild").getValue()); });
	Xrm.Page.getAttribute("sdn_iscarer").addOnChange(function () { sdn.contactTypeOnchange("Carer",Xrm.Page.getAttribute("sdn_iscarer").getValue()); });
	Xrm.Page.getAttribute("sdn_isstaff").addOnChange(function () { sdn.contactTypeOnchange("Staff",Xrm.Page.getAttribute("sdn_isstaff").getValue()); });
	Xrm.Page.getAttribute("sdn_isexternal").addOnChange(function () { sdn.contactTypeOnchange("External",Xrm.Page.getAttribute("sdn_isexternal").getValue()); });
	Xrm.Page.getAttribute("sdn_isboardmember").addOnChange(function () { sdn.contactTypeOnchange("Board Member",Xrm.Page.getAttribute("sdn_isboardmember").getValue()); });
	Xrm.Page.getAttribute("sdn_isdonor").addOnChange(function () { sdn.contactTypeOnchange("Donor",Xrm.Page.getAttribute("sdn_isdonor").getValue()); });
	
	Xrm.Page.getAttribute("sdn_address1_suburbid").addOnChange(function () { sdn.addressOnchange("sdn_address1_suburbid", "address1_stateorprovince", "address1_postalcode", "address1_line1", "address1_line2", "address1_name", "address1_city"); });
	Xrm.Page.getAttribute("address1_line1").addOnChange(function () { sdn.addressOnchange("sdn_address1_suburbid", "address1_stateorprovince", "address1_postalcode", "address1_line1", "address1_line2", "address1_name", "address1_city"); });
	Xrm.Page.getAttribute("address1_line2").addOnChange(function () { sdn.addressOnchange("sdn_address1_suburbid", "address1_stateorprovince", "address1_postalcode", "address1_line1", "address1_line2", "address1_name", "address1_city"); });
	Xrm.Page.getAttribute("sdn_address2_suburbid").addOnChange(function () { sdn.addressOnchange("sdn_address2_suburbid", "address2_stateorprovince", "address2_postalcode", "address2_line1", "address2_line2", "address2_name", "address2_city"); });
	Xrm.Page.getAttribute("address2_line1").addOnChange(function () { sdn.addressOnchange("sdn_address2_suburbid", "address2_stateorprovince", "address2_postalcode", "address2_line1", "address2_line2", "address2_name", "address2_city"); });
	Xrm.Page.getAttribute("address2_line2").addOnChange(function () { sdn.addressOnchange("sdn_address2_suburbid", "address2_stateorprovince", "address2_postalcode", "address2_line1", "address2_line2", "address2_name", "address2_city"); });
	
	Xrm.Page.getAttribute("sdn_address2_issameasprimaryaddress").addOnChange(function () { sdn.sameAddressOnchange(); });
	Xrm.Page.getAttribute("birthdate").addOnChange(function () { sdn.dobOnchange(); });
	
	 if (Xrm.Page.getAttribute("birthdate").getValue() != null) {
        sdn.calcAge();
    }
    else {
        Xrm.Page.getAttribute("sdn_currentage").setValue(null);
        Xrm.Page.getAttribute("sdn_upcomingbirthday").setValue(null);
    }
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
	sdn.contactSetTabVisibility();
	
}

sdn.contactSetTabVisibility = function () 
{
	toggleSection("GeneralTab", "ChildSection", Xrm.Page.getAttribute("sdn_ischild").getValue());
	toggleSection("GeneralTab", "CarerSection", Xrm.Page.getAttribute("sdn_iscarer").getValue());
	toggleSection("GeneralTab", "ContactChildSection", Xrm.Page.getAttribute("sdn_ischild").getValue());
	toggleSection("GeneralTab", "ContactCarerSection", Xrm.Page.getAttribute("sdn_iscarer").getValue());
	toggleSection("GeneralTab", "CustomerDetailsTab", Xrm.Page.getAttribute("sdn_isstaff").getValue() || Xrm.Page.getAttribute("sdn_isexternal").getValue() || Xrm.Page.getAttribute("sdn_isboardmember").getValue());

	
	// if Child or Carer
	if (Xrm.Page.getAttribute("sdn_ischild").getValue() || Xrm.Page.getAttribute("sdn_iscarer").getValue())
	{
		toggleSection("GeneralTab", "CulturalDetailsSection", true);
		toggleSection("GeneralTab", "SafetyAlertMessageSection", true);
	}
	else
	{
		toggleSection("GeneralTab", "CulturalDetailsSection", false);
		toggleSection("GeneralTab", "SafetyAlertMessageSection", false);		
	}
	// if staff, board member, donor, external
	if (Xrm.Page.getAttribute("sdn_isstaff").getValue() || Xrm.Page.getAttribute("sdn_isexternal").getValue()
			|| Xrm.Page.getAttribute("sdn_isboardmember").getValue() || Xrm.Page.getAttribute("sdn_isdonor").getValue())
	{
		toggleSection("GeneralTab", "OtherSection", true);
	}
	else
	{
		toggleSection("GeneralTab", "OtherSection", false);
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

sdn.dobOnchange = function()
{
    if (Xrm.Page.getAttribute("birthdate").getValue() != null) {
        var now = new Date();
        now.setHours(0);
        now.setMinutes(0);
        now.setSeconds(0);
        now.setMilliseconds(0);

        var birthday = Xrm.Page.getAttribute("birthdate").getValue();
        var daydif = now.getDate() - birthday.getDate();
        var monthdif = (now.getMonth() + 1) - (birthday.getMonth() + 1);
        var Pre99Year = 0;
        var years = 0;

        var upcomingBirthday = Xrm.Page.getAttribute("birthdate").getValue();
        upcomingBirthday.setFullYear(now.getFullYear());

        upcomingBirthday.setHours(0);
        upcomingBirthday.setMinutes(0);
        upcomingBirthday.setSeconds(0);
        upcomingBirthday.setMilliseconds(0);

        if (upcomingBirthday < now) {
            upcomingBirthday.setFullYear(now.getFullYear() + 1);
        }

        Xrm.Page.getAttribute("sdn_upcomingbirthday").setValue(upcomingBirthday);

        //Exit the program when it's in the furture.
        if (birthday >= now) {
            Xrm.Page.getAttribute("sdn_currentage").setValue(null);
            return;
        }

        var years2 = upcomingBirthday.getFullYear() - birthday.getFullYear();
        Xrm.Page.getAttribute("sdn_upcomingage").setValue(years2);

        if (daydif < 0) {
            monthdif--;
        }

        years = now.getFullYear() - birthday.getFullYear();

        if (monthdif < 0) {
            years--;
            monthdif += 12;
        }

        if (years < 2 || (years == 2 && monthdif == 0)) {
            var temp_month = years * 12 + monthdif;
            Xrm.Page.getAttribute("sdn_currentage").setValue(temp_month + " months");
        }
        else {
            Xrm.Page.getAttribute("sdn_currentage").setValue(years + " years " + monthdif + " months");
        }
    }
    else {
        Xrm.Page.getAttribute("sdn_currentage").setValue(null);
        Xrm.Page.getAttribute("sdn_upcomingbirthday").setValue(null);
    }
}

sdn.calcAge = function() 
{
        var now = new Date();
        now.setHours(0);
        now.setMinutes(0);
        now.setSeconds(0);
        now.setMilliseconds(0);

        var birthday = Xrm.Page.getAttribute("birthdate").getValue();
        var daydif = now.getDate() - birthday.getDate();
        var monthdif = (now.getMonth() + 1) - (birthday.getMonth() + 1);
        var Pre99Year = 0;
        var years = 0;

        // if (birthday.getYear() < 100) {
            // Pre99Year = birthday.getYear() + 1900;
        // }
        // else {
            // Pre99Year = birthday.getYear();
        // }

        //Exit the program when it's in the furture.
        if (birthday >= now) {
            Xrm.Page.getAttribute("sdn_currentage").setValue(null);
            return;
        }

        if (daydif < 0) {
            monthdif--;
        }

        years = now.getFullYear() - birthday.getFullYear();

        if (monthdif < 0) {
            years--;
            monthdif += 12;
        }

        if (years < 2 || (years == 2 && monthdif == 0)) {
            var temp_month = years * 12 + monthdif;
            Xrm.Page.getAttribute("sdn_currentage").setValue(temp_month + " months");
        }
        else {
            Xrm.Page.getAttribute("sdn_currentage").setValue(years + " years " + monthdif + " months");
        }
		Xrm.Page.getAttribute('sdn_currentage').setSubmitMode("always"); 
}


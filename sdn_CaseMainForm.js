if (sdn === undefined) 
{
    var sdn = {};
}
 
sdn.onLoad = function () 
{
	if(Xrm.Page.getAttribute("sdn_issubsubcase").getValue() ==true)// Is Sub Sub = TRUE (so it is a 3rd level case)
	{
		toggleSection("generalTab", "ChildCasesSection", false); //Hide Child Cases Section
	}
	
	if(Xrm.Page.getAttribute("parentcaseid").getValue() != null)// Is Child Case = TRUE
	{
		var parentCaseId  = Xrm.Page.getAttribute("parentcaseid").getValue()[0].id;
		
		//toggleSection("generalTab", "ChildCasesSection", false); //Hide Child Cases Section
		
		SDK.REST.retrieveRecord(
			parentCaseId, "Incident", null, null,
				function (parentCase){
					var childId = parentCase.PrimaryContactId.Id;
					var childName = parentCase.PrimaryContactId.Name;
					var serviceTypeId = parentCase.sdn_ServiceType.Id;
					var serviceTypeName = parentCase.sdn_ServiceType.Name;
					var masterCaseId = parentCase.ParentCaseId.Id; //Need to get next level up
					var masterCaseName = parentCase.ParentCaseId.Name;
					//alert(masterCaseId)
					//alert(masterCaseName)
						
					if(masterCaseId != null) //so a master case exists
					{
						Xrm.Page.getAttribute("sdn_issubsubcase").setValue(true);
						toggleSection("generalTab", "ChildCasesSection", false); //Hide Child Cases Section
					}
					else // so it is a 2nd level case
					{
						toggleSection("generalTab", "ActivitiesSection", false); //Hide Activities Section
					}
						
					if(Xrm.Page.ui.getFormType() == 1)
					{
						Xrm.Page.getAttribute("title").setValue(null);
						sdn.setServiceType(serviceTypeId, serviceTypeName)
						sdn.setChild(childId, childName)
					}	
				},
				function (error){
					alert(error.message);
				}
		);		
	}
	else //Is MASTER CASE = TRUE
	{
		Xrm.Page.getControl("sdn_purpose").setVisible(false)
		toggleSection("generalTab", "ActivitiesSection", false); //Hide Activities Section
	}
	
}

sdn.setServiceType = function(serviceTypeId, serviceTypeName)
{
	var lookupData = new Array();
	var lookupItem = new Object();
	lookupItem.id = serviceTypeId;
	lookupItem.typename = 'sdn_ServiceType';
	lookupItem.name = serviceTypeName;
	lookupData[0] = lookupItem;
	Xrm.Page.getAttribute("sdn_servicetype").setValue(lookupData);
}

sdn.setChild = function(childId, childName)
{
	var lookupData = new Array();
	var lookupItem = new Object();
	lookupItem.id = childId;
	lookupItem.typename = 'contact';
	lookupItem.name = childName;
	lookupData[0] = lookupItem;
	Xrm.Page.getAttribute("primarycontactid").setValue(lookupData);
}


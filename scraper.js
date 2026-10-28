var topNavTimeout = null;
var townMapTimeout = null;
var mainContentTimeout = null;
var nextEventsTimeout = null;
var inventoryLinksTimeout = null;
var otherDomTimeout = null;
var mapDataTimeout = null;
var sovDataTimeout = null;

document.addEventListener("DOMSubtreeModified", function(mutationEvent) 
{
  if ( debugAJAX ) 
    console.debug("DOMMod: "+mutationEvent.target.id);
  if ( userVerified != 1 )
    return;
  if ( !document.getElementById('dsSidekick') )
    return;

  if ( !ctCityData &&
       document.getElementById("optTown") && 
       document.getElementById("optTown").length > 0)
  {
    initCityData();
  }
  /*
  if ( document.getElementById("summaryDiv") &&
       !document.getElementById("summaryTable") )
  {
    //initSummaryTab();
    //initProductionTab();
    //initToolsTab();
    //initMappingTab();
  }
  */

  else if ( mutationEvent.target.id == "TopNav" ) 
  {
    if(topNavTimeout)
      clearTimeout(topNavTimeout);
    topNavTimeout = setTimeout(TopNavListener, 200);
  } 
  else if ( mutationEvent.target.id == "NextEvents" ) 
  {
    if(nextEventsTimeout)
      clearTimeout(nextEventsTimeout);
    nextEventsTimeout = setTimeout(NextEventsListener, 200);
  } 
  else if ( mutationEvent.target.id == "townMap" )
  {
    if(townMapTimeout)
      clearTimeout(townMapTimeout);
    townMapTimeout = setTimeout(TownMapListener, 200);
  }
  else if ( mutationEvent.target.id == "MainContentDiv" ) 
  {
    if(mainContentTimeout)
      clearTimeout(mainContentTimeout);
    mainContentTimeout = setTimeout(MainContentListener, 200);
  }
  else if ( mutationEvent.target.id == "MapDataTransfer" )
  {
    if ( mapDataTimeout )
      clearTimeout(mapDataTimeout);
    mapDataTimeout = setTimeout(processNodeData, 200);
  }
  else if ( mutationEvent.target.id == "inventoryLinks" )
  {
    if(inventoryLinksTimeout)
      clearTimeout(inventoryLinksTimeout);
    inventoryLinksTimeout = setTimeout(InventoryLinksListener, 200);
  }
  else if ( mutationEvent.target.id == "sovAccordion" )
  {
    if(sovDataTimeout)
      clearTimeout(sovDataTimeout);
    sovDataTimeout = setTimeout(SovDataListener, 200);
  }
  else if ( mutationEvent.target.id == "ChatDataTransfer" )
  {
    ChatListener();
  }
}, false);


function TopNavListener()
{
  var selectElem = document.getElementById("optTown");
  var cityData = ctCityData.cities[selectElem.selectedIndex];
  if ( !cityData ) return;
  cityData.resourceRefreshTime = new Date().getTime();

  var basicTable = document.getElementById("tbRes");
  ctCityData.basicResourceNameMap = new Object();
  for ( var i=0; i<8; ++i )
  {
    var iconSpan = basicTable.rows[0].cells[2*i+1].firstChild;
    cityData.basicResourceStores[i] = 
      Number(basicTable.rows[0].cells[2*i].getAttribute("data"));
    cityData.basicResourceRates[i] = 
      Number(basicTable.rows[1].cells[i].getAttribute("data"));
    ctCityData.basicResourceNameMap[iconSpan.getAttribute("title")] = i;
  }
  var advTable = document.getElementById("advRes").getElementsByTagName('table')[0];
  ctCityData.advResourceNameMap = new Object();
  for ( var i=0; i<12; ++i )
  {
    var iconSpan = advTable.rows[0].cells[2*i+1].firstChild;
    cityData.advResourceStores[i] = 
      Number(advTable.rows[0].cells[2*i].getAttribute("data"));
    cityData.advResourceBuild[i] = 
      Number(advTable.rows[1].cells[i].getAttribute("data"));
    ctCityData.advResourceNameMap[iconSpan.getAttribute("title")] = i;
  }
  // Check for prestige info
  var childDivs = document.getElementById('MainContentDiv').getElementsByTagName("div");
  for ( var i=0; i<childDivs.length; ++i )
  {
    if ( childDivs[i].className == "heraldBonus" )
    {
      var bonusStr = childDivs[i].innerHTML.substr(40);
      var currentStr = document.getElementById('serverDate').innerHTML;
      ctCityData.prestigeTime = new Date().getTime() + 
        Date.parse(bonusStr)-Date.parse(currentStr);
    }
  }
  saveCityData();
  drawSummaryTable();
  drawProdTable();
}

function MainContentListener()
{
  // MainContentDiv can be updated for both the town map and the unit
  // production
  if ( document.getElementById("townMapOutline") ) 
    return TownMapListener();
  else if ( document.getElementById("markets") )
  {
    var dataField = document.getElementById("ctDataField");
    if ( dataField.innerHTML ) 
    {
      var tree = document.getElementById("tree");
      var liNodes = tree.getElementsByTagName("li");
      for ( var i=0; i<liNodes.length; ++i )
      {
        var insNodes = liNodes[i].getElementsByTagName("ins");
        if ( insNodes[1].className.indexOf(dataField.innerHTML) != -1 )
        {
          dataField.innerHTML = "";
          var link = liNodes[i].getElementsByTagName("a")[0];
          link.click();
          break;
        }
      }
    }
  }
  else
  {
    var mainDiv = document.getElementById("MainContentDiv");
    var h1 = mainDiv.getElementsByTagName("h1");
    var selectElem = document.getElementById("optTown");
    var cityData = ctCityData.cities[selectElem.selectedIndex];
    if ( h1[0] && h1[0].textContent == "Barracks Production" )
    {
      var h3s = mainDiv.getElementsByTagName("h3");
      cityData.unitProductionEndTime = 0;
      for ( var i=0; i<h3s.length; ++i )
      {
        if ( h3s[i].innerHTML == "Production Schedule" )
        {
          var span = h3s[i].nextSibling.nextSibling.children[0].rows[1].cells[7].children[0];
          var endTime = span.getAttribute("data").split("|")[1];
          cityData.unitProductionEndTime = endTime;
        }
      }
    }
    else if ( h1[0] && h1[0].textContent == "Consulate Production" )
    {
      var h3s = mainDiv.getElementsByTagName("h3");
      cityData.diploProductionEndTime = 0;
      for ( var i=0; i<h3s.length; ++i )
      {
        if ( h3s[i].innerHTML == "Production Schedule" )
        {
          var span = h3s[i].nextSibling.nextSibling.children[0].rows[1].cells[7].children[0];
          var endTime = span.getAttribute("data").split("|")[1];
          cityData.diploProductionEndTime = endTime;
        }
      }
    }
    else if ( h1[0] && h1[0].textContent == "Military Armies" )
    {
      var inArmies = {};
      var reserve = {};
      var armyUnits = document.querySelectorAll("#ArmiesAccordian fieldset tr:nth-child(n+2)");
      for ( var rIndex = 0; rIndex < armyUnits.length; ++rIndex )
      {
        var cells = armyUnits[rIndex].cells;
        var count = parseInt(cells[0].textContent.replace(",",""));
        var troopId = parseInt(cells[1].firstElementChild.getAttribute("data").split("|")[1]);
        if ( cells.length > 6 ) // In an army
          inArmies[troopId]?inArmies[troopId]+=count:inArmies[troopId]=count;
        else
          reserve[troopId] = count;
      }
      for ( var id in inArmies )
        reserve[id]?reserve[id]+=inArmies[id]:reserve[id]=inArmies[id];
      cityData.armyData = reserve;
      refreshArmyTab();
      saveCityData();
      // Build the report button
      addTroopCountButton(reserve);
    }
    else if ( h1[0] && h1[0].textContent == "Read Mail" )
    {
      parseEmail();
    }
    else if ( h1[0] && h1[0].textContent == "Mail" )
    {
      var checkNewDiv = document.createElement("div");
      var checkNew = document.createElement("input");
      checkNew.onclick = function() {
        var newImgs = document.querySelectorAll("#messages table img[src='//assets.illyriad.net/img/icons/unreadmail.png'");
        for (var imgIdx = 0; imgIdx < newImgs.length; ++imgIdx) {
          newImgs[imgIdx].parentElement.parentElement.querySelector("input").checked = this.checked;
        }
      }
      var checkNewImg = document.createElement("img");
      checkNewImg.src = "//assets.illyriad.net/img/icons/unreadmail.png";
      checkNew.type = "checkbox";
      checkNew.id = "checkNew";
      //checkNewDiv.style['position']="fixed";
      checkNewDiv.style['padding-top']="10px";
      checkNewDiv.appendChild(checkNew);
      checkNewDiv.appendChild(checkNewImg);
      var tr = mainDiv.querySelector("div.info div table tr");
      tr.insertBefore(checkNewDiv, tr.firstChild);
    }
    else if ( h1[0] && h1[0].textContent == "Trade Hub Orders" )
    {
      InventoryLinksListener(true);
    }
    else if ( h1[0] && h1[0].textContent == "Military Movements" )
    {
      var legends = mainDiv.querySelectorAll("legend");
      var oldData = cityData.militaryMovement;
      cityData.militaryMovement = new Array();
      for ( var i=0; i<legends.length; ++i )
      {
        if ( legends[i].innerHTML.indexOf("outbound military") != -1 )
          parseMovementTable(legends[i].nextElementSibling, "out");
        else if ( legends[i].innerHTML.indexOf("inbound military") != -1 )
          parseMovementTable(legends[i].nextElementSibling, "in");
        else if ( legends[i].innerHTML.indexOf("Hostile army encampments") != -1 )
          parseMovementTable(legends[i].nextElementSibling, "enemyCamp");
        else if ( legends[i].innerHTML.indexOf("encampments") != -1 )
          parseMovementTable(legends[i].nextElementSibling, "camp");
      }
      sendMovementData(cityData.militaryMovement, oldData);
      refreshArmyMovements();
      saveCityData();
    }
    /*
    else if ( h1[0] && h1[0].innerText == "Faction List" )
    {
      var spans = mainDiv.querySelectorAll("span.name");
      for ( var i=0; i<spans.length; ++i )
      {
        var data = spans[i].getAttribute("data");
        if ( data && data.charAt(0)=="r" )
        {
          console.log(data+', "'+spans[i].innerHTML+'"');
        }
      }
    }
    */
    
    drawSummaryTable();
    drawProdTable();
  }
}

function TownMapListener()
{
  if ( !document.getElementById("townMapOutline") ) return;
  var areas = document.getElementById("townMapOutline").getElementsByTagName('area');
  var selectElem = document.getElementById("optTown");
  var cityData = ctCityData.cities[selectElem.selectedIndex];
  cityData.buildings = new Array();
  cityData.advResourceRates = new Object();
  cityData.advResourceBuildingSlot = new Object();
  cityData.maxStorage = 0;
  cityData.barracks = 0;
  cityData.cottages = 0;
  cityData.skinners = 0;
  cityData.herbalists = 0;
  cityData.miners = 0;
  cityData.chancery = new Array();
  for ( var index = 0; index<areas.length; ++index )
  {
    if ( areas[index].title )
    {
      var parts = areas[index].title.split("[");
      var building; var level;
      if ( parts[0] == "Castle " )
      {
        building = "Castle Wall";
        level = parseInt(parts[1].substring(5, parts[1].length-1));
      }
      else
      {
        building = parts[0].trim();
        level = parseInt(parts[1].substring(0, parts[1].length-1));
      }
      if ( building=="Empty" ) continue;
      else if ( !ctBuildingData[building] )
        console.debug("Couldn't find data for building: "+building);
      else
      {
        cityData.buildings.push(
            {building:building, level:Number(level), href:areas[index].href});
        if ( typeof ctAdvProductionBuildingMap[building] != 'undefined' )
        {
          // For production buildings, record the production rates
          var resIndex = ctAdvProductionBuildingMap[building];
          if ( resIndex == 5 ) // Special code for the blacksmith
          {
            cityData.advResourceRates[resIndex] =
              3600/ctBuildingData[building].levels[level].ability_a;
            cityData.advResourceRates[9] =
              3600/ctBuildingData[building].levels[level].ability_b;
          }
          else
            cityData.advResourceRates[resIndex] =
              3600/ctBuildingData[building].levels[level].ability_a;
        }
        else if ( typeof ctStorageBuildingMap[building] != 'undefined' )
        {
          // For storage buildings, add to the town's storage
          cityData.maxStorage += ctBuildingData[building].levels[level].ability_a;
        }
        else if ( building == "Barracks" )
        {
          hrefArray = areas[index].href.split("/");
          cityData.barracks = hrefArray[hrefArray.length-1];
        }
        else if ( building == "Chancery of Estates" )
        {
          cityData.chancery.push(
              ctBuildingData[building].levels[level].ability_a);
        }
        else if ( building == "Cottage" )
          cityData.cottages++;
        else if ( building == "Skinner's Guild" )
          cityData.skinners += level;
        else if ( building == "Herbalist's Guild" )
          cityData.herbalists += level;
        else if ( building == "Miner's Guild" )
          cityData.miners += level;
      }
    }
  }
  saveCityData();
}

function NextEventsListener()
{
  var selectElem = document.getElementById("optTown");
  var cityData = ctCityData.cities[selectElem.selectedIndex];

  var eventsElem = document.getElementById("NextEvents");
  var table = eventsElem.getElementsByTagName('table')[0];
  // Incoming army
  var attackSpan = table.rows[0].cells[3].firstElementChild.firstElementChild;
  if ( attackSpan )
  {
    var attackTitle = table.rows[0].cells[2].firstElementChild.title;
    cityData.incomingArmy = {title: attackTitle, 
      end: attackSpan.getAttribute("data").split("|")[1]};
  }
  else
    cityData.incomingArmy = null;

  for ( var i=0; i<4; ++i )
  {
    var spans = table.rows[i+2].cells[1].getElementsByTagName('div')[0].getElementsByTagName('span');
    if ( spans[1] )
    {
      var endTime = spans[1].getAttribute("data").split("|")[1];
      cityData.eventTimes[i] = endTime;
    }
    else delete cityData.eventTimes[i];
  }
  drawProdTable();
}

function InventoryLinksListener(ordersPage)
{
  var hubSelect = document.getElementById("HubId");
  if ( !ctCityData.hubs )
  {
    ctCityData.hubs = new Object();
  }
  var selectedHub = null;
  for ( var i=1; i<hubSelect.length; ++i )
  {
    var option = hubSelect.options[i];
    var name = option.textContent.substring(0, option.textContent.indexOf("[")-1);
    if ( !ctCityData.hubs[option.value] )
    {
      ctCityData.hubs[option.value] = new Object();
      ctCityData.hubs[option.value].id = option.value;
      ctCityData.hubs[option.value].basicResourceStores = [0,0,0,0,0,0]
      ctCityData.hubs[option.value].advResourceStores = 
        [0,0,0,0,0,0,0,0,0,0,0,0];
      ctCityData.hubs[option.value].name = name;
    }

    if ( option.selected )
      selectedHub = ctCityData.hubs[option.value];
  }
  
  if ( selectedHub )
  {
    if ( ordersPage )
    {
      var h3s = document.querySelectorAll("#MainContentDiv div.info h3");
      for ( var i=0; i<h3s.length; ++i )
      {
        if ( h3s[i].innerHTML == "Send Traders" )
        {
          selectedHub.traderCities = new Array();
          var traderTable = h3s[i].nextElementSibling;
          for ( var j=1; j<traderTable.rows.length; ++j )
          {
            var cityName = traderTable.rows[j].cells[1].firstChild.innerHTML;
            selectedHub.traderCities.push(getCityByName(cityName));
          }
          break;
        }
      }
    }
    else
    {
      var inventoryLinks = document.getElementById("inventoryLinks");
      var inventoryType = "";
      for ( var i=0; !inventoryType && i<inventoryLinks.childNodes.length; ++i )
      {
        if ( inventoryLinks.childNodes[i].className == "selected" )
          inventoryType = inventoryLinks.childNodes[i].innerHTML;
      }

      if ( inventoryType == "Resources" )
      {
        var dataTable = inventoryLinks.nextElementSibling;
        for ( var rowIdx = 1; rowIdx<dataTable.rows.length; ++rowIdx )
        {
          if ( !dataTable.rows[rowIdx].cells[0].firstChild ) continue;
          var type = dataTable.rows[rowIdx].cells[0].firstChild.title;
          if ( typeof ctCityData.basicResourceNameMap[type] != 'undefined' )
            selectedHub.basicResourceStores[ctCityData.basicResourceNameMap[type]] = Number(dataTable.rows[rowIdx].cells[2].innerHTML.replace(/[^\d\.\-]/g,""));
          else if ( typeof ctCityData.advResourceNameMap[type] != 'undefined' )
            selectedHub.advResourceStores[ctCityData.advResourceNameMap[type]] = Number(dataTable.rows[rowIdx].cells[2].innerHTML.replace(/[^\d\.\-]/g,""));
        }
      }
    }
    initTradeTab();
    initHubTable();
  }
  saveCityData();
}

function SovDataListener()
{
  // Parse the page looking for sov level not matching building level and
  // mark the building
  var selectElem = document.getElementById("optTown");
  var cityData = ctCityData.cities[selectElem.selectedIndex];
  if ( !cityData.sovData ) cityData.sovData = new Object();
  var rows = document.querySelectorAll('#sovAccordion h3 a');
  for ( var i=0; i<rows.length; ++i )
  {
    var spans = rows[i].querySelectorAll('span');
    if ( spans.length != 2 ) continue;
    var sovLevel = spans[0].innerHTML.split(/[ \t\n]+/)[1];
    var locStr = spans[0].innerHTML.split(/at /)[1];
    var x = Number(locStr.split("|")[0]);
    var y = Number(locStr.split("|")[1]);
    if ( !cityData.sovData[x] ) cityData.sovData[x] = new Object();
    if ( !cityData.sovData[x][y] ) cityData.sovData[x][y] = new Object();
    switch ( sovLevel )
    {
      case "0": cityData.sovData[x][y].level = 0; break;
      case "I": cityData.sovData[x][y].level = 1; break;
      case "II": cityData.sovData[x][y].level = 2; break;
      case "III": cityData.sovData[x][y].level = 3; break;
      case "IV": cityData.sovData[x][y].level = 4; break;
      case "V": cityData.sovData[x][y].level = 5; break;
    }
    
    cityData.sovData[x][y].rising = 
      ( spans[0].innerHTML.indexOf("Rising") != -1 );
    cityData.sovData[x][y].building = 
      ( spans[1].innerHTML.indexOf("In Progress") != -1 );
    if ( cityData.sovData[x][y].rising || cityData.sovData[x][y].building )
      rows[i].parentElement.style.borderColor = "darkorange";
    else if ( !spans[1].innerHTML.match("\\b"+sovLevel+"\\b") )
      rows[i].parentElement.style.borderColor = "red";

    var div = rows[i].parentElement.nextSibling.nextSibling;
    var forms = div.querySelectorAll('form[name="buildStructure"]');
    var buttons = document.createElement("span");
    buttons.className = "quickSov";
    rows[i].parentElement.appendChild(buttons);
    for ( var fIndex = 0; fIndex<forms.length; ++fIndex ) {
      var form = forms[fIndex];
      // Check to see if this is an empty spot where we could build a new sov
      var newForm = form.cloneNode(false);
      newForm.name = "quickBuildStructure";
      var oldInputs = form.querySelectorAll('input');
      for ( var iIndex=0; iIndex<oldInputs.length; ++iIndex ) {
        if ( oldInputs[iIndex].type == "submit" ) {
          var newInput = oldInputs[iIndex].cloneNode(true);
          newForm.appendChild(newInput);
          newInput.oldSubmit = oldInputs[iIndex];
          newInput.form = newForm;
          newInput.row = i;
          newInput.onclick = function(e) { 
            if ( this.form.oldRadio ) this.form.oldRadio.checked = "checked";
            document.getElementById('dsSidekick').setAttribute(
                'quickSovRowToClose', this.row);
            this.oldSubmit.click();
            this.parentElement.parentElement.parentElement.click();
            e.stopPropagation(); 
          };
          if ( newInput.value == "Build Structure" )
            newInput.className = "ico-custom";
          else if ( newInput.value == "Demolish" ) {
            newInput.className = "ui-icon ui-icon-circle-arrow-s";
            newForm.title = "Demolish";
          }
          else if ( newInput.value == "Level Up" ) {
            newInput.className = "ui-icon ui-icon-circle-arrow-n";
            newForm.title = "Build";
          }
        } else if ( oldInputs[iIndex].type == "radio" ) {
          var buildingName = oldInputs[iIndex].parentElement.parentElement
            .cells[0].innerHTML;
          buildingName=buildingName.substring(0, buildingName.lastIndexOf(" "));
          if ( cityData.sovGoal && SovBonusTypes[cityData.sovGoal] &&
               SovBonusTypes[cityData.sovGoal].buildings
                 .indexOf(buildingName) != -1 ) {
            newForm.oldRadio = oldInputs[iIndex];
            newForm.title = buildingName;
          }
        }
      }
      buttons.appendChild(newForm);
    }
  }
  clearTimeout(sovDataTimeout);
}

function ChatListener()
{
  // Check to see if we are logging
  if ( localStorage.getItem("ctCaptureChat_"+userName) &&
       JSON.parse(localStorage.getItem("ctCaptureChat_"+userName)) )
  {
    // Load up the comment and un-JSON it
    var div = document.getElementById('ChatDataTransfer');
    if ( div.childNodes.length == 0 ) return;
    for ( var i=0; i<div.childNodes.length; ++i )
    {
      // If we find the comment node then the inject.js has added map data.
      // Process it into nodeData.
      if ( div.childNodes[i].nodeName == '#comment' )
      {
        var data = JSON.parse(div.childNodes[i].data);
        if ( data.GlobalChats )
          for ( var c=0; c<data.GlobalChats.length; ++c )
            AddChatToLog(data.GlobalChats[c], true, true);
        if ( data.AllianceChats )
          for ( var c=0; c<data.AllianceChats.length; ++c )
            AddChatToLog(data.AllianceChats[c], false, true);
      }
    }
    
    // Clear the saved data
    div.innerHTML="";
  }
}

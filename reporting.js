function parseEmail()
{
  // Check to see if the inner-most email is the correct type
  var mails = document.querySelectorAll("#MainContentDiv div.mailbox");
  var innerMail = mails[mails.length-1];
  var tr;
  if ( !innerMail ) 
  {
    mails = document.querySelectorAll("#MainContentDiv div.info");
    if ( mails && mails.length>0 )
    {
      innerMail = mails[0];
      tr = innerMail.firstElementChild.rows[5];
    }
    else
      return;
  }
  else
    tr = mails[0].parentNode.parentNode;

  // Combat
  var links = innerMail.querySelectorAll("a");
  for ( var i=0; i<links.length; ++i )
  {
    var address = links[i].href;
    if ( address.indexOf("External/CombatReport")!=-1 )
    {
      // We have found a combat report. Add a button to the GUI to allow
      // sending that report
      var newRow = tr.parentNode.insertRow(tr.rowIndex);
      var cell = newRow.insertCell(-1);
      cell.style.textAlign = "center";
      var button = document.createElement("input");
      button.type = "submit";
      button.value = "Submit battle report";
      button.className = "large";
      button.onclick = function() {
        button.value = "Loading data...";
        loadBattleData(address, function(dataObj) {
          sendReport(button, "battle", JSON.stringify(dataObj));
        });
      };
      cell.appendChild(button);

      // Add another button to get a quick summary for this report
      var cell = newRow.insertCell(-1);
      cell.style.textAlign = "center";
      var button = document.createElement("input");
      button.type = "submit";
      button.value = "Summarize battle report";
      button.className = "large";
      button.onclick = function() {
        var summaryTable = document.createElement("table");
        summaryTable.className = "oddeven";
        cell.innerHTML = "";
        cell.style.paddingLeft = "150px";
        cell.appendChild(summaryTable);
        loadBattleData(address, function(dataObj) {
          var attackerTroops = {};
          var attackerTotal = {quantity: 0, casualties:0};
          for ( var i=0; i<dataObj.attacker.units.length; ++i )
          {
            var unit = dataObj.attacker.units[i];
            if ( !attackerTroops[unit.name] ) 
              attackerTroops[unit.name] = {quantity:0, casualties:0};
            attackerTroops[unit.name].quantity += Number(unit.quantity);
            attackerTroops[unit.name].casualties += Number(unit.casualties);
            attackerTotal.quantity += Number(unit.quantity);
            attackerTotal.casualties += Number(unit.casualties);
          }
          var defenderTroops = {};
          var defenderTotal = {quantity: 0, casualties:0};
          for ( var i=0; i<dataObj.defenders.length; ++i )
          {
            var defender = dataObj.defenders[i];
            for ( var j=0; j<defender.units.length; ++j )
            {
              var unit = defender.units[j];
              if ( !defenderTroops[unit.name] ) 
                defenderTroops[unit.name] = {quantity:0, casualties:0};
              defenderTroops[unit.name].quantity += Number(unit.quantity);
              defenderTroops[unit.name].casualties += Number(unit.casualties);
              defenderTotal.quantity += Number(unit.quantity);
              defenderTotal.casualties += Number(unit.casualties);
            }
          }

          var tr = summaryTable.insertRow(-1);
          tr.insertCell(-1).innerHTML = "Type";
          tr.insertCell(-1).innerHTML = "Quantity";
          tr.insertCell(-1).innerHTML = "Casualties";
          tr = summaryTable.insertRow(-1);
          // Attacker
          var header = tr.insertCell(-1);
          header.colSpan = 3;
          header.innerHTML = "Attacker";
          for ( var type in attackerTroops )
          {
            if ( attackerTroops[type].quantity < 5 )
              continue;
            tr = summaryTable.insertRow(-1);
            tr.insertCell(-1).innerHTML = type;
            tr.insertCell(-1).innerHTML = attackerTroops[type].quantity;
            tr.insertCell(-1).innerHTML = attackerTroops[type].casualties;
          }
          tr = summaryTable.insertRow(-1);
          tr.insertCell(-1).innerHTML = "Total";
          tr.insertCell(-1).innerHTML = attackerTotal.quantity;
          tr.insertCell(-1).innerHTML = attackerTotal.casualties;
          // Defenders
          tr = summaryTable.insertRow(-1);
          header = tr.insertCell(-1);
          header.colSpan = 3;
          header.innerHTML = "Defenders";
          for ( var type in defenderTroops )
          {
            if ( defenderTroops[type].quantity < 5 )
              continue;
            tr = summaryTable.insertRow(-1);
            tr.insertCell(-1).innerHTML = type;
            tr.insertCell(-1).innerHTML = defenderTroops[type].quantity;
            tr.insertCell(-1).innerHTML = defenderTroops[type].casualties;
          }
          tr = summaryTable.insertRow(-1);
          tr.insertCell(-1).innerHTML = "Total";
          tr.insertCell(-1).innerHTML = defenderTotal.quantity;
          tr.insertCell(-1).innerHTML = defenderTotal.casualties;
        });
      };
      cell.appendChild(button);
      return;
    }
  }

  // Theft emails are from System and have the text "Resources Missing"
  if ( innerMail.innerHTML.indexOf('System') != -1 &&
       innerMail.innerHTML.indexOf('Resources Missing') != -1 )
  {
    // This might be a theft report. Scan through the tables looking for the
    // th that has "Resources Missing"
    var headers = innerMail.querySelectorAll("th");
    var resourceTable = null;
    for ( var i=0; resourceTable==null && i<headers.length; ++i )
    {
      if ( headers[i].innerHTML.indexOf('Resources Missing') != 1 )
        resourceTable = headers[i].parentElement.parentElement;
    }
    if ( resourceTable != null )
    {
      // Add up all the resources that were stolen
      var resourcesLost=0;
      for ( var i=1; i<resourceTable.rows.length; ++i )
        resourcesLost += Number(resourceTable.rows[i].cells[1].innerHTML);

      // Build a footer for the table that reports the suspect
      var totalRow = resourceTable.insertRow(-1);
      totalRow.insertCell(-1).innerHTML = "Total";
      totalRow.insertCell(-1).innerHTML = resourcesLost;
      var reportRow = resourceTable.insertRow(-1);
      reportRow.insertCell(-1).innerHTML = "DS Sidekick suspects:";
      // Compare this value to the race data to determine who stole the goods
      if ( resourcesLost%59==0 )
        reportRow.insertCell(-1).innerHTML += "Human Burglar";
      if ( resourcesLost%64==0 )
        reportRow.insertCell(-1).innerHTML += "Human Master Theif";
      if ( resourcesLost%50==0 )
        reportRow.insertCell(-1).innerHTML += "Elven Rogue";
      if ( resourcesLost%54==0 )
        reportRow.insertCell(-1).innerHTML += "Elven Dark Elf";
      if ( resourcesLost%57==0 )
        reportRow.insertCell(-1).innerHTML += "Dwarf Footpad";
      if ( resourcesLost%60==0 )
        reportRow.insertCell(-1).innerHTML += "Dwarf Halfling";
      if ( resourcesLost%71==0 )
        reportRow.insertCell(-1).innerHTML += "Orc Cutpurse";
      if ( resourcesLost%76==0 )
        reportRow.insertCell(-1).innerHTML += "Orc Plunderer";
    }
  }
    
  // Scout emails are from "System" and the subject has "Scout Mission"
  // There is also a table with "Troop levels present"
  if ( innerMail.innerHTML.indexOf('System') != -1 &&
       innerMail.innerHTML.indexOf('Scout Mission') != -1 &&
       innerMail.innerHTML.indexOf('Troop levels') != -1 )
  {
    // We have found a scout report. Add a button to the GUI to allow sending
    // that report
    var newRow = tr.parentNode.insertRow(tr.rowIndex);
    var cell = newRow.insertCell(-1);
    cell.style.textAlign = "center";
    var button = document.createElement("input");
    button.type = "submit";
    button.value = "Submit scout report";
    button.className = "large";
    button.onclick = function() {
      var dataObj = buildScoutData(innerMail);
      sendReport(button, "scout", JSON.stringify(dataObj));
    };
    cell.appendChild(button);
    // Add another button to get a quick summary for this report
    var cell = newRow.insertCell(-1);
    cell.style.textAlign = "center";
    var button = document.createElement("input");
    button.type = "submit";
    button.value = "Summarize scout report";
    button.className = "large";
    button.onclick = function() {
      var summaryTable = document.createElement("table");
      summaryTable.className = "oddeven";
      cell.innerHTML = "";
      cell.style.paddingLeft = "150px";
      cell.appendChild(summaryTable);
      var scoutData = buildScoutData(innerMail);
      var troopTypeCount = {};
      var localTotal = 0;
      for ( var i=0; i<scoutData.localArmies.length; ++i )
      {
        var army = scoutData.localArmies[i];
        for ( var type in army.troops )
        {
          if ( !troopTypeCount[type] ) 
            troopTypeCount[type] = {local:0, reinforce:0, abroad:0};
          troopTypeCount[type].local += army.troops[type];
          localTotal += army.troops[type];
        }
      }
      var reinvorcementTotal = 0;
      for ( var i=0; i<scoutData.reinforcements.length; ++i )
      {
        var army = scoutData.reinvorcements[i];
        for ( var type in army.troops )
        {
          if ( !troopTypeCount[type] ) 
            troopTypeCount[type] = {local:0, reinforce:0, abroad:0};
          troopTypeCount[type].reinforce += army.troops[type];
          reinvorcementTotal += army.troops[type];
        }
      }
      var abroadTotal = 0;
      for ( var i=0; i<scoutData.abroad.length; ++i )
      {
        var army = scoutData.abroad[i];
        for ( var type in army.troops )
        {
          if ( !troopTypeCount[type] ) 
            troopTypeCount[type] = {local:0, reinforce:0, abroad:0};
          troopTypeCount[type].abroad += army.troops[type];
          abroadTotal += army.troops[type];
        }
      }

      var tr = summaryTable.insertRow(-1);
      tr.insertCell(-1).innerHTML = "Type";
      tr.insertCell(-1).innerHTML = "Local";
      tr.insertCell(-1).innerHTML = "Reinforcements";
      tr.insertCell(-1).innerHTML = "Abroad";
      for ( var type in troopTypeCount )
      {
        if ( troopTypeCount[type].local < 5 &&
             troopTypeCount[type].reinforce < 5 && 
             troopTypeCount[type].abroad < 5 ) 
          continue;
        var tr = summaryTable.insertRow(-1);
        tr.insertCell(-1).innerHTML = type;
        tr.insertCell(-1).innerHTML = troopTypeCount[type].local;
        tr.insertCell(-1).innerHTML = troopTypeCount[type].reinforce;
        tr.insertCell(-1).innerHTML = troopTypeCount[type].abroad;
      }
      var tr = summaryTable.insertRow(-1);
      tr.insertCell(-1).innerHTML = "Total";
      tr.insertCell(-1).innerHTML = localTotal;
      tr.insertCell(-1).innerHTML = reinvorcementTotal;
      tr.insertCell(-1).innerHTML = abroadTotal;
    };
    cell.appendChild(button);

    return;
  }
}

function buildScoutData(innerMailDiv)
{
  // Collect the data from the mail
  var dataObj = {};
  var tables;
  if ( innerMailDiv.className=="info" ) // Not forwarded
  {
    dataObj.date = innerMailDiv.firstElementChild.rows[4].cells[1].innerHTML;
    tables = innerMailDiv.firstElementChild.querySelectorAll("table.generic");
  }
  else // Forwarded
  {
    dataObj.date = innerMailDiv.innerHTML.substring(
        innerMailDiv.innerHTML.indexOf("Received:")+15,
        innerMailDiv.innerHTML.indexOf("<br>", 
          innerMailDiv.innerHTML.indexOf("Received:")));
    tables = innerMailDiv.getElementsByTagName("table");
  }
  var targetCell = tables[0].rows[1].cells[1].firstElementChild;
  dataObj.target = {};
  if ( targetCell.getAttribute("data").charAt(0) == "l" )
  {
    var parts = targetCell.getAttribute("data").split("|");
    dataObj.target.location = {
      x: parts[0].substr(parts[0].indexOf("=")+1),
      y: parts[1] };
  }
  else
  {
    dataObj.target.player = targetCell.getAttribute("data").split("|")[10];
    dataObj.target.alliance = targetCell.getAttribute("data").split("|")[11];
    dataObj.target.city = targetCell.innerHTML;
  }

  dataObj.localArmies = [];
  extractArmyData(tables[1], dataObj.localArmies);
  dataObj.reinforcements = [];
  extractArmyData(tables[2], dataObj.reinforcements);
  dataObj.abroad = [];
  extractArmyData(tables[3], dataObj.abroad);
  return dataObj;
}
function extractArmyData(table, armyArray)
{
  if ( !table || !table.rows ) return;
  var armyData;
  for ( var i=0; i<table.rows.length; ++i )
  {
    var row = table.rows[i];
    if ( row.cells[0].innerHTML.indexOf("<b>Army: ") != -1 )
    {
      if ( armyData ) armyArray.push(armyData);
      armyData = { troops: {}, info: extractText(row.cells[0]) };
    }
    else if ( row.cells[0].innerHTML.indexOf("Commander") != -1 ||
              row.cells[0].innerHTML.indexOf("Troops") != -1 )
    {
      var unitType = row.cells[1].firstChild.firstChild.title;
      if ( !armyData )
        armyData = { info: "", troops: {} };
      if ( armyData.troops[unitType] )
        armyData.troops[unitType] += Number(row.cells[2].innerHTML);
      else
        armyData.troops[unitType] = Number(row.cells[2].innerHTML);
    }
  }
  if ( armyData ) armyArray.push(armyData);
}

function loadBattleData(url, callback)
{
  var request = new XMLHttpRequest();
  request.onreadystatechange = function() {
    if ( this.readyState==4 && this.status==200 )
    {
      var xml = this.responseXML;
      var dataObj = {};
      dataObj.id = xml.getElementsByTagName("personalcombatkey")[0].id;
      dataObj.location = {};
      dataObj.location.x = nodeValue(xml, "X");
      dataObj.location.y = nodeValue(xml, "Y");
      dataObj.location.terrain = nodeValue(xml, "terraincombattype");
      dataObj.date = nodeValue(xml, "combatoccurrencedate");
      dataObj.strategem = {};
      dataObj.strategem.action = nodeValue(xml, "armyaction");
      dataObj.strategem.feint = (nodeValue(xml, "feint") != "No");
      dataObj.defenders = [];
      var participants = xml.getElementsByTagName("participant");
      for ( var i=0; i<participants.length; ++i )
      {
        var p = participants[i];
        var pData = {};
        var nameNode = p.getElementsByTagName("playername")[0];
        if ( nameNode.firstChild ) 
          pData.name = nameNode.firstChild.nodeValue;
        pData.id = nameNode.id;
        pData.allianceTicker = nodeValue(p, "allianceticker");
        pData.units = [];
        var units = p.getElementsByTagName("unit");
        for ( var j=0; j<units.length; ++j )
        {
          var unitData = {};
          unitData.name = nodeValue(units[j], "unitname");
          unitData.quantity = nodeValue(units[j], "unitquantity");
          unitData.casualties = nodeValue(units[j], "unitcasualties");
          pData.units.push(unitData);
        }
        if ( nodeValue(p, "role") == "Attacker" )
          dataObj.attacker = pData;
        else
          dataObj.defenders.push(pData);
      }
      callback.call(null, dataObj);
    }
  };
  request.open("GET", url, true);
  request.send("");
}
function nodeValue(baseElement, tagName)
{
  var nodes = baseElement.getElementsByTagName(tagName);
  if ( nodes.length == 0 )
  {
    console.error("Couldn't find node named: "+tagName);
    return "";
  }
  if ( !nodes[0].firstChild || !nodes[0].firstChild.nodeValue )
  {
    console.error("node named: "+tagName+" doesn't have a value.");
    return "";
  }
  return nodes[0].firstChild.nodeValue;
}
function extractText(node)
{
  var txt = '';
  // recursive exploration and option to uncomment the check for a <script>
  // <script>s will have children as the the actual portion being executed
  // is considered a text node (nodeType===3)
  if (node.hasChildNodes() && node.nodeName !== 'SCRIPT'){
    for (var c = 0; c < node.childNodes.length; c++){
      txt += extractText(node.childNodes[c]);
    }
  }else if(node.nodeType===3){
    txt += node.textContent;
  }
  return txt;
}
function sendReport(button, type, data)
{
  button.value = "Sending report...";
  fetchJSONData(extensionBaseURL+"submitReport.php",
      {"username": userName, "type": type, "data": data},
      function(response) {
        if ( response==null )
        {
          console.error("Error from server: "+response.error);
          button.value = "Error. See console.";
        }
        else
        button.value = "Sent.";
      }
  );
}

function addTroopCountButton(data)
{
  if ( !localStorage.getItem("ctTroopCountBtn_"+userName) )
    return;

  var cityId = document.getElementById("optTown").value;
  var accordian = document.getElementById("ArmiesAccordian");
  var button = document.createElement("input");
  var today = new Date();
  var address = extensionBaseURL+"troopCount/submitCount.php";
  button.type = "submit";
  button.value = "Submit Troop Count";
  button.className = "large";
  button.onclick = function() {
    button.value = "Sending data...";
    var params = {"playerId": userId, "cityId": cityId, "date":
          today.getFullYear()+"-"+(today.getMonth()+1)+"-"+today.getDate()};
    for ( var troopId in data )
    {
      var type = unitType[troopId];
      if ( type )
        params[type]=data[troopId];
    }
    fetchJSONData(address, params, function(response) {
      if ( response==null )
      {
        console.error("Error from server: "+response.error);
        button.value = "Error. See console.";
      }
      else
        button.value = "Sent.";
    });
  };
  accordian.parentElement.insertBefore(button, accordian.nextSibling);
}
function sendMovementData(newDataArray, oldDataArray)
{ 
  if ( newDataArray.length==0 || allianceTicker != "TCol" )
    return;

  var sendArray = new Array();
  for ( var i=0; i<newDataArray.length; ++i )
  {
    var alreadySent = false;
    for ( var j=0; j<oldDataArray.length && !alreadySent; ++j )
    {
      if ( oldDataArray[j].startTime == newDataArray[i].startTime &&
           oldDataArray[j].sendingCityId == newDataArray[i].sendingCityId &&
           oldDataArray[j].targetCityId == newDataArray[i].targetCityId )
        alreadySent = true;
    }
    if ( !alreadySent )
    {
      sendArray.push({sendingCityId: newDataArray[i].sendingCityId,
                      targetCityId: newDataArray[i].targetCityId,
                      X: newDataArray[i].X,
                      Y: newDataArray[i].Y,
                      startTime: newDataArray[i].startTime,
                      endTime: newDataArray[i].endTime,
                      size: newDataArray[i].size,
                      activity: newDataArray[i].activity,
                      direction: newDataArray[i].direction});
      // If this is an attack, also send it to the slack channel
      if ( !newDataArray[i].isFriendly )
      {
        var targetCityData = newDataArray[i].targetCityData.split("|");
        var sendingCityData = newDataArray[i].sendingCityData.split("|");
        var data = {payload:
          '{"text": "<https://elgea.illyriad.co.uk/#/Player/Profile/'+targetCityData[5]+'|'+targetCityData[10]+'\'s ['+targetCityData[11]+']>'+
          ' city of <https://elgea.illyriad.co.uk/#/World/Map/'+targetCityData[2]+'/'+targetCityData[3]+'|'+targetCityData[0].substring(2)+'>'+
          ' is being attacked by <https://elgea.illyriad.co.uk/#/Player/Profile/'+sendingCityData[5]+'|'+sendingCityData[10]+'\'s ['+sendingCityData[11]+']>'+
          ' city of <https://elgea.illyriad.co.uk/#/World/Map/'+sendingCityData[2]+'/'+sendingCityData[3]+'|'+sendingCityData[0].substring(2)+'>.'+
          ' The army is moving at speed='+newDataArray[i].speed+' and arriving at: '+(new Date(parseInt(newDataArray[i].endTime))).toUTCString()+'"}'};
        fetchJSONData(
            "", data,
            function(response){ 
             console.log(response);
            });
      }
    }
  }

  if ( sendArray.length != 0 )
  {
    var dataStr = JSON.stringify(sendArray);
    var address = extensionBaseURL+"/armyMovements/submitMovements.php";
    var params = {"playerId": userId, "data": dataStr};
    fetchJSONData(address, params, function(response) { });
  }
}

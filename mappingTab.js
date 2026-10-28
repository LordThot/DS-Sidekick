var harvestFinderOn = false;
var sovTableOn = false;
var sovMappingOn = false;
var npcBattleOn = false;
var ctSavedLocations = new Array();

function initMappingTab() {
  document.getElementById("LocationSaverCurrent").onclick = function() {
    if ( window.location.href.search("#/World/Map") != -1 )
    {
      var parts = window.location.href.split('/');
      document.getElementById("LocationSaverX").value = parts[6];
      document.getElementById("LocationSaverY").value = parts[7];
    }
    return false;
  };
  document.getElementById("LocationSaverAdd").onclick = function() {
    var x = Number(document.getElementById("LocationSaverX").value);
    var y = Number(document.getElementById("LocationSaverY").value);
    if ( x != Number.NaN && y != Number.NaN )
    {
      ctSavedLocations.push({x:x, y:y, note: 
        document.getElementById("LocationSaverNote").value});
      drawSavedLocations();
    }
  };
  if ( localStorage.getItem("ctSavedLocations_"+userName) )
  {
    ctSavedLocations = JSON.parse(localStorage.getItem("ctSavedLocations_"+userName));
    drawSavedLocations();
  }
  var sovTypeSelect = document.getElementById("SovTypeSelect");
  for ( sovType in SovBonusTypes )
  {
    var option = document.createElement('option');
    option.value = sovType;
    option.innerHTML = option.value;
    sovTypeSelect.appendChild(option);
  }
  document.getElementById("MapSovBtn").onclick = function() {
    sovMappingOn = !sovMappingOn;
    if ( sovMappingOn )
    {
      this.value = "Hide map";
      window.location = '#/World/Map';
      setTimeout(processNodeData, 500);
      document.getElementById("ComputeSovTxt").style.display = "block";
    }
    else
    {
      var sovDisplay = document.getElementById("SovDisplay");
      if ( sovDisplay )
        sovDisplay.parentNode.removeChild(sovDisplay);
      this.value = "Map Sov";
      document.getElementById("ComputeSovTxt").style.display = "none";
    }
    
    return false;
  };
  document.getElementById("SovSelectCurCity").onclick = function() {
    var selectElem = document.getElementById("optTown");
    var cityData = ctCityData.cities[selectElem.selectedIndex];
    document.getElementById("SovCenterX").value = cityData.x;
    document.getElementById("SovCenterY").value = cityData.y;
    return false;
  };
  document.getElementById("CaptureSovBtn").onclick = function() {
    if ( sovTableOn )
    {
      sovTableOn = false;
      document.getElementById("ComputeSovTxt").style.display = "none";
    }
    else
    {
      document.getElementById("ComputeSovTxt").style.display = "block";
      sovTableOn = true;
      window.location = '#/World/Map/'+
        document.getElementById("SovCenterX").value+'/'+
        document.getElementById("SovCenterY").value;
    }
    return false;
  };
  document.getElementById("InactiveSelectCurCity").onclick = function() {
    var selectElem = document.getElementById("optTown");
    var cityData = ctCityData.cities[selectElem.selectedIndex];
    document.getElementById("InactiveCenterX").value = cityData.x;
    document.getElementById("InactiveCenterY").value = cityData.y;
    return false;
  };
  document.getElementById("FindInactiveBtn").onclick = function() {
    // Replace the existing report table or build a new one
    var table = document.getElementById("inactiveCities");
    table.style.display = "table";
    var oldBody = table.tBodies[0];
    var newBody = document.createElement('tbody');

    fetchJSONData(extensionBaseURL+"getInactiveCities.php", 
        {"x": document.getElementById("InactiveCenterX").value,
         "y": document.getElementById("InactiveCenterY").value,
         "distance": document.getElementById("InactiveDistanceSelect").value},
        function(cityData) {
          if ( cityData == null ) return;
          for ( var i=0; i<cityData.length; ++i )
          {
            var row = newBody.insertRow(-1);
            row.insertCell(-1).innerHTML = 
             '<a target="new" href="'+extensionBaseURL+
               "population.html?playerId="+cityData[i].playerId+'">'+
             cityData[i].playerName+'</a>';
            row.insertCell(-1).innerHTML = 
             '<a href="#/Diplomatic/Orders/'+
               cityData[i].x+'/'+cityData[i].y+'">'+
               cityData[i].cityName+'</a>';
            row.insertCell(-1).innerHTML = cityData[i].distance;
            row.insertCell(-1).innerHTML = cityData[i].population;
          }
        });

    table.replaceChild(newBody, oldBody);
    return false;
  };

  document.getElementById("ToggleHarvestCaptureBtn").onclick = function() {
    harvestFinderOn = !harvestFinderOn;
    this.value = (harvestFinderOn?"Disengage":"Engage");
    
    if ( harvestFinderOn )
    {
      document.getElementById('HarvestNodeTable').style.display = 'table';
      var selectElem = document.getElementById("optTown");
      var cityData = ctCityData.cities[selectElem.selectedIndex];
      window.location = '#/World/Map/'+cityData.x+'/'+cityData.y;
    }
    else
    {
      document.getElementById('HarvestNodeTable').style.display = 'none';
      nodeData = new Array();
    }
    return false;
  };
  document.getElementById("HideSovCheck").onclick = function() {
    updateMapDisplays();
    return true;
  };
  document.getElementById("ShowResourcesCheck").onclick = function() {
    updateMapDisplays();
    return true;
  };
  document.getElementById("ShowMaterialsCheck").onclick = function() {
    updateMapDisplays();
    return true;
  };
  document.getElementById("ShowNPCCheck").onclick = function() {
    updateMapDisplays();
    return true;
  };
  document.getElementById("NearestTownCheck").onclick = function() {
    updateMapDisplays();
    return true;
  };

  // NPC Battle calculator
  // Fill the unit type select
  var raceSelect = document.getElementById("RaceSelect");
  raceSelect.onchange = fillUnitTypeSelect;
  fillUnitTypeSelect();
  document.getElementById('NPCBattleBtn').onclick = function() {
    npcBattleOn = !npcBattleOn;
    this.value = (npcBattleOn?"Disengage":"Engage");
    if ( npcBattleOn )
    {
      nodeData = new Array();
      document.getElementById('NPCBattleTable').style.display = 'table';
      var selectElem = document.getElementById("optTown");
      var cityData = ctCityData.cities[selectElem.selectedIndex];
      window.location = '#/World/Map/'+cityData.x+'/'+cityData.y+'/10';
    }
    return false;
  };
}  
function drawSavedLocations() {
  localStorage.setItem("ctSavedLocations_"+userName,
                       JSON.stringify(ctSavedLocations));
  var table = document.getElementById("SavedLocations");
  table.innerHTML = "";
  for ( var i=0; i<ctSavedLocations.length; ++i )
  {
    var row = table.insertRow(-1);
    row.insertCell(-1).innerHTML = 
            '<a href="#/World/Map/'+ ctSavedLocations[i].x +'/'+
             ctSavedLocations[i].y + '">'+
             ctSavedLocations[i].x + "|" + ctSavedLocations[i].y +
             "</a></br>";
    row.insertCell(-1).innerHTML = ctSavedLocations[i].note;
    var removeBtn = document.createElement("input");
    removeBtn.type = "submit"; removeBtn.className = "short";
    removeBtn.value = "Remove";
    (function (index) {
      removeBtn.onclick = function() {
        ctSavedLocations.splice(index,1);
        drawSavedLocations();
      };
    })(i);
    row.insertCell(-1).appendChild(removeBtn);
  }
}
function fillUnitTypeSelect() {
  var raceSelect = document.getElementById("RaceSelect");
  var race = raceSelect.options[raceSelect.selectedIndex].text;
  var unitTypeSelect = document.getElementById('UnitTypeSelect');
  unitTypeSelect.innerHTML = '';
  for ( var i=0; i<units[race].length; ++i )
  {
    var option = document.createElement('option');
    option.value = units[race][i].name;
    option.innerHTML = option.value;
    unitTypeSelect.appendChild(option);
  }
}

var nodeData = new Array();
function addDataToNode(coordStr, member, value)
{
  var coords = coordStr.split("|");
  addDataToCoords(coords[1], coords[0], member, value);
}
function addDataToCoords(x, y, member, value)
{
  if ( !nodeData[x] ) nodeData[x] = new Array();
  if ( !nodeData[x][y] ) nodeData[x][y] = new Object();
  nodeData[x][y][member] = value;
}
function processNodeData()
{
  // Load up the comment and un-JSON it
  var div = document.getElementById('MapDataTransfer');
  if ( div.childNodes.length == 0 ) return;
  for ( var i=div.childNodes.length-1; i<div.childNodes.length; ++i )
  {
    // If we find the comment node then the inject.js has added map data.
    // Process it into nodeData.
    if ( div.childNodes[i].nodeName == '#comment' )
    {
      var data = JSON.parse(div.childNodes[i].data);
      if ( sovTableOn )
      {
        var centerX = Number(document.getElementById("SovCenterX").value);
        var centerY = Number(document.getElementById("SovCenterY").value);
        for ( var coord in data.data )
        {
          x = coord.split("|")[1]; y = coord.split("|")[0];
          if ( Math.abs(centerX-x)<=4 && Math.abs(centerY-y)<=4 )
          {
            addDataToCoords(x, y, "resourceSov", data.data[coord].rs.split("|"));
            addDataToCoords(x, y, "terrain", data.data[coord].t);
            addDataToCoords(x, y, "validSov", data.data[coord].sov);
          }
        }
      }
      if ( harvestFinderOn || sovTableOn )
      {
        if ( data.n )
          for ( var member in data.n )
            addDataToNode(member, "resource", data.n[member].i);
        if ( data.d )
          for ( var member in data.d )
            addDataToNode(member, "materials", data.d[member]);
        if ( data.s )
          for ( var coordStr in data.s )
          {
            var coords = coordStr.split("|");
            var x = coords[1], y = coords[0];
            if ( data.s[coordStr].rd=="Yours" )
              addDataToCoords(x, y, "yourSov", 
                  {town: data.s[coordStr].t, 
                   level: data.s[coordStr].s.substr(0,1), 
                   building: data.s[coordStr].b});
            else if ( nodeData[x] && nodeData[x][y] && (sovTableOn || 
                      nodeData[x][y].resource || nodeData[x][y].materials) )
              addDataToCoords(x, y, "otherSov", true);
          }
        if ( data.c )
        {
          for ( var coordStr in data.c )
          {
            var coords = coordStr.split("|");
            var x = coords[1], y = coords[0];
            if ( nodeData[x] && nodeData[x][y] &&
                (nodeData[x][y].resource || nodeData[x][y].materials) )
              addDataToCoords(x, y, "army", true);
            if ( data.c[coordStr].i != "encampment2" )
              addDataToCoords(x, y, "npc", data.c[coordStr].d+
                                          " ("+data.c[coordStr].n+")");
          }
        }
        // We have new map data. Update the various tables/canvas/etc
        updateMapDisplays();
      }
      else
        nodeData = new Array();
      if ( sovMappingOn )
      {
        var data = JSON.parse(div.childNodes[i].data);
        var mapZoom = Number(data.zoom);
        var mapLeftX = Number(data.x)-mapZoom;
        var mapTopY = Number(data.y)+mapZoom;
        var typeSelect = document.getElementById('SovTypeSelect');
        var type = typeSelect.options[typeSelect.selectedIndex].text;
        if ( !document.getElementById('SovDisplay') )
        {
          var sovDisplay = document.createElement('canvas');
          sovDisplay.id = 'SovDisplay';
          sovDisplay.width = 500; sovDisplay.height = 500;
          sovDisplay.style.position = "absolute";
          sovDisplay.style.top = "11px"; sovDisplay.style.left = "15px";
          document.getElementById("mapDiv").appendChild(sovDisplay);
        }
        var ctx = document.getElementById('SovDisplay').getContext('2d');
        ctx.clearRect(0,0,500,500);
        ctx.fillStyle = "red";
        for ( var coord in data.data )
        {
          var dx = Number(coord.split("|")[1]) - mapLeftX;
          var dy = mapTopY - Number(coord.split("|")[0]);
          dx = (dx+0.3)*(500/(2*mapZoom+1)); dy = (dy+0.5)*(500/(2*mapZoom+1));
          var value;
          if ( type == "Food" )
          {
            value = data.data[coord].rs.split("|")[4];
            if ( value == "5" ) value = "";
          }
          else if ( SovBonusData[data.data[coord].t] &&
                    SovBonusData[data.data[coord].t].type==type )
            value = SovBonusData[data.data[coord].t].amount;
          else
            value = "";
          ctx.fillText(value, dx, dy);
        }
      }
      if ( npcBattleOn )
      {
        var data = JSON.parse(div.childNodes[i].data);
        if ( data.c )
        {
          for ( var coordStr in data.c )
          {
            var coords = coordStr.split("|");
            if ( data.c[coordStr].i != "encampment2" && 
                 data.c[coordStr].n != "Unknown" )
              addDataToCoords(coords[1], coords[0], 
                              "npc", data.c[coordStr]);
          }
        }
        for ( var coord in data.data )
        {
          x = coord.split("|")[1]; y = coord.split("|")[0];
          if ( nodeData[x] && nodeData[x][y] )
            addDataToCoords(x, y, "terrain", data.data[coord].t);
        }
        updateMapDisplays();
      }
    }
  }
  div.innerHTML = "";
}
function updateMapDisplays()
{
  if ( sovTableOn )
  {
    var centerX = Number(document.getElementById("SovCenterX").value);
    var centerY = Number(document.getElementById("SovCenterY").value);
    // Check to see if we are looking at one of our cities
    var curCity;
    for ( var cityIdx in ctCityData.cities )
      if ( ctCityData.cities[cityIdx].x == centerX &&
           ctCityData.cities[cityIdx].y == centerY )
        curCity = ctCityData.cities[cityIdx];

    var chanceryBonus = 0;
    if ( curCity && curCity.chancery )
    {
      curCity.chancery.sort(function(a,b){return b-a;});
      for ( var i=0; i<curCity.chancery.length; ++i )
        chanceryBonus += curCity.chancery[i]/Math.pow(2,i);
    }
    
    var sovTable = document.getElementById('SovTable');
    sovTable.innerHTML = '';
    // Legend
    var hue_blank = 220; // Blue
    var hue_otherPlayer = 1; // Red
    var hue_otherCity = 300; // Purple
    var hue_otherBuilding = 180; // Cyan
    var hue_correctBuilding = 120; // Green
    var footer = sovTable.createTFoot(-1);
    var fRow = footer.insertRow(-1);
    var cell = fRow.insertCell(-1);
    cell.colSpan = 9;
    cell.innerHTML = "Legend";
    fRow = footer.insertRow(-1);
    cell = fRow.insertCell(-1);
    cell.colSpan = 2;
    cell.innerHTML = "City";
    cell.style.backgroundColor = "white";
    cell = fRow.insertCell(-1);
    cell.colSpan = 2;
    cell.innerHTML = "No Sov";
    cell.style.backgroundColor = "hsl("+hue_blank+",70%,70%)";
    cell = fRow.insertCell(-1);
    cell.colSpan = 2;
    cell.innerHTML = "Impassable";
    cell.style.backgroundColor = "gray";
    cell = fRow.insertCell(-1);
    cell.colSpan = 2;
    cell.innerHTML = "Other City";
    cell.style.backgroundColor = "hsl("+hue_otherCity+",70%,70%)";

    fRow = footer.insertRow(-1);
    cell = fRow.insertCell(-1);
    cell.colSpan = 3;
    cell.innerHTML = "Wrong building";
    cell.style.backgroundColor = "hsl("+hue_otherBuilding+",70%,70%)";
    cell = fRow.insertCell(-1);
    cell.colSpan = 3;
    cell.innerHTML = "Correct building";
    cell.style.backgroundColor = "hsl("+hue_correctBuilding+",70%,70%)";
    cell = fRow.insertCell(-1);
    cell.colSpan = 3;
    cell.innerHTML = "Other Player";
    cell.style.backgroundColor = "hsl("+hue_otherPlayer+",70%,70%)";
    var typeSelect = document.getElementById('SovTypeSelect');
    var desiredBonus = SovBonusTypes[typeSelect.options[typeSelect.selectedIndex].text];
    var bestSpots = new Array();
    var bestSpotsNoSov = new Array();
    var totalBonus = 0;
    var maxBonus = 0;
    var body = sovTable.createTBody(-1);
    for ( var y=centerY+4; y>=centerY-4; --y )
    {
      var row = body.insertRow(-1);
      for ( var x=centerX-4; x<=centerX+4; ++x )
      {
        if ( curCity && curCity.sovData && curCity.sovData[x] &&
             curCity.sovData[x][y] )
          var sovData = curCity.sovData[x][y];

        var cell = row.insertCell(-1);
        cell.width = 35; cell.height = 35;
        cell.style.textAlign = "center";
        cell.style.verticalAlign = "middle";
        if ( x==centerX && y==centerY )
          cell.style.backgroundColor = "white";
        else if ( nodeData[x] && nodeData[x][y] )
        {
          if ( !nodeData[x][y].validSov )
          {
            cell.style.backgroundColor = "gray";
            continue;
          }
          if ( nodeData[x][y].yourSov && nodeData[x][y].yourSov.level==5 )
          {
            cell.style.backgroundColor = "grey";
          }
          else
          {
            var value = 0; var maxValue = 5;
            var saturation = 70;
            var brightness = 50;
            var cost = Math.sqrt(Math.pow(centerX-x, 2)+Math.pow(centerY-y, 2));
            // Chancery bonus for first level
            if ( !nodeData[x][y].yourSov && chanceryBonus )
              cost *= (1-chanceryBonus/100);
            if ( desiredBonus.type == "resource" ) 
            {
              value = Number(nodeData[x][y].resourceSov[desiredBonus.index]);
              maxValue = 17;
            }
            else // production bonus
            {
              if ( nodeData[x][y].yourSov )
              {
                switch ( nodeData[x][y].yourSov.level )
                {
                  case "0":
                  case "1": cost += 6; break;
                  case "2": cost += 12; break;
                  case "3": cost += 24; break;
                  case "4": cost += 48; break;
                }
              }
              else
                cost += 6;

              cost/=10;
              maxValue = 14;
              if ( SovBonusData[nodeData[x][y].terrain] &&
                  SovBonusData[nodeData[x][y].terrain].type==desiredBonus.id )
                value = Number(SovBonusData[nodeData[x][y].terrain].amount+5);
              else if ( nodeData[x][y].terrain.indexOf("river")==-1 )
                value = 5;
            }
            var valuePerCost = value/cost;
            var brightness = 95-60*valuePerCost/maxValue;
            var html = '<a href="#/Military/Orders/'+x+"/"+y+'">';
            if ( value > 5 )
              html += "<b>"+Number(valuePerCost).toFixed(2)+"</b>";
            else
              html += Number(valuePerCost).toFixed(2);
            html += "</a>";
            cell.innerHTML = html;
          }
          var hue = hue_blank;
          if ( nodeData[x][y].otherSov )
          {
            hue = hue_otherPlayer;
            bestSpotsNoSov.push(valuePerCost);
          }
          else
          {
            bestSpotsNoSov.push(valuePerCost);
            bestSpots.push(valuePerCost);
            if ( nodeData[x][y].yourSov )
            {
              cell.innerHTML += " lvl: "+nodeData[x][y].yourSov.level;
              if ( sovData && sovData.rising )
                cell.innerHTML += "+";
              if ( !curCity || nodeData[x][y].yourSov.town != curCity.name )
                hue = hue_otherCity;
              else
              {
                maxBonus += value*nodeData[x][y].yourSov.level;
                var valid = false;
                for ( var i=0; !valid && i<desiredBonus.buildings.length; ++i )
                  if ( desiredBonus.buildings[i] == 
                      nodeData[x][y].yourSov.building )
                    valid = true;
                if ( valid )
                {
                  hue = hue_correctBuilding;
                  totalBonus += value*nodeData[x][y].yourSov.level;
                }
                else
                  hue = hue_otherBuilding;
              }
            }
          }
          cell.style.backgroundColor = 
            "hsl("+hue+","+saturation+"%,"+brightness+"%)";
        }
      }
    }

    var summaryRow = footer.insertRow(-1);
    var summaryCell = summaryRow.insertCell(-1);
    summaryCell.colSpan = 9;
    summaryCell.innerHTML = "Total current bonus: "+totalBonus+"%";
    summaryRow = sovTable.insertRow(-1);
    summaryCell = summaryRow.insertCell(-1);
    summaryCell.colSpan = 9;
    summaryCell.innerHTML = "Max bonus with current sov: "+maxBonus+"%";
    bestSpots.sort(function(a,b){return b-a;});
    bestSpotsNoSov.sort(function(a,b){return b-a;});
    var sum = 0;
    for ( var i=0; i<20; ++i ) sum+=bestSpots[i];
    var sumNoSov = 0;
    for ( var i=0; i<20; ++i ) sumNoSov+=bestSpotsNoSov[i];
    summaryRow = sovTable.insertRow(-1);
    summaryCell = summaryRow.insertCell(-1);
    summaryCell.colSpan = 9;
    summaryCell.innerHTML = "Sum(bonus/cost) for best 20 squares: "+sum.toFixed(2)+" ("+sumNoSov.toFixed(2)+")";
    sovTableOn = false;
    document.getElementById("ComputeSovTxt").style.display = "none";
  }

  if ( harvestFinderOn )
  {
    var table = document.getElementById('HarvestNodeTable');
    var qNearestTown = document.getElementById('NearestTownCheck').checked;
    var hideIfSov = document.getElementById('HideSovCheck').checked;
    var showResources = document.getElementById('ShowResourcesCheck').checked;
    for ( var i=1;i<=6;++i ) 
    {
      table.rows[i].cells[1].innerHTML = "";
      table.rows[i].style.display = (showResources?"table-row":"none");
    }
    var showMaterials = document.getElementById('ShowMaterialsCheck').checked;
    for ( var i=8;i<=16;++i )
    {
      table.rows[i].cells[1].innerHTML = "";
      table.rows[i].style.display = (showMaterials?"table-row":"none");
    }
    var showNPCs =  document.getElementById('ShowNPCCheck').checked;
    table.rows[7].cells[1].innerHTML = "";
    table.rows[7].style.display = (showNPCs?"table-row":"none");

    // Now display the collected data
    for ( var x in nodeData )
    {
      for ( var y in nodeData[x] )
      {
        var data = nodeData[x][y];
        if ( hideIfSov && data.otherSov ) 
          continue;
        if ( showResources && data.resource )
        {
          table.rows[data.resource].cells[1].innerHTML += 
            buildCellHTML(x,y, qNearestTown, data);
        }
        else if ( showMaterials && data.materials )
        {
          var materials = data.materials.split("|");
          for ( var i=0; i<materials.length; ++i )
          {
            if ( materials[i]=="1" )
              table.rows[8+i].cells[1].innerHTML +=
                buildCellHTML(x,y, qNearestTown, data);
          }
        }
        else if ( showNPCs && data.npc )
        {
          table.rows[7].cells[1].innerHTML +=
            '<a href="#/Military/Orders/'+x+'/'+y+'">'+
                    x+'|'+y+" "+ data.npc + "</a></br>";
        }
      }
    }
  }
  if ( npcBattleOn )
  {
    var tBody = document.getElementById('NPCBattleTable').tBodies[0];
    tBody.innerHTML = '';
    var unitTypeSelect = document.getElementById('UnitTypeSelect');
    var attacker = units["Humans"][unitTypeSelect.selectedIndex];
    for ( var x in nodeData )
      for ( var y in nodeData[x] )
      {
        var data = nodeData[x][y];
        if ( !data.npc ) continue;
        var row = tBody.insertRow(-1);
        row.insertCell(-1).innerHTML = 
          '<a href="#/Military/Orders/'+x+'/'+y+'">'+x+'|'+y+'</a></br>';
        row.insertCell(-1).innerHTML = '<img src="//assets.illyriad.net/img/map/flags/'+data.npc.i+'.png" width="24px" height="24px"/>';
        row.insertCell(-1).innerHTML = MinorTerrain[data.terrain];
        var minCount = Number(armySizes[data.npc.n].min);
        var maxCount = Number(armySizes[data.npc.n].max);
        row.insertCell(-1).innerHTML = '('+minCount+' - '+maxCount+')';
        var unitType = units[data.npc.d];
        var terrain = MajorTerrain[MinorTerrain[data.terrain]];
        var minDef=0, maxDef=0;
        if ( unitType.length == 1 )
        {
          minDef = minCount*unitType[0].defense[attacker.type]*
                        (1+terrain.defense[unitType[0].type]/100);
          maxDef = maxCount*unitType[0].defense[attacker.type]*
                        (1+terrain.defense[unitType[0].type]/100);
        }
        else
        {
          minDef = 0.55*minCount*unitType[0].defense[attacker.type]*
                        (1+terrain.defense[unitType[0].type]/100) +
                   0.26*minCount*unitType[1].defense[attacker.type]*
                        (1+terrain.defense[unitType[1].type]/100) +
                   0.12*minCount*unitType[2].defense[attacker.type]*
                        (1+terrain.defense[unitType[2].type]/100) +
                   0.07*minCount*unitType[3].defense[attacker.type]*
                        (1+terrain.defense[unitType[3].type]/100);
          maxDef = 0.25*maxCount*unitType[0].defense[attacker.type]*
                        (1+terrain.defense[unitType[0].type]/100) +
                   0.50*maxCount*unitType[1].defense[attacker.type]*
                        (1+terrain.defense[unitType[1].type]/100) +
                   0.16*maxCount*unitType[2].defense[attacker.type]*
                        (1+terrain.defense[unitType[2].type]/100) +
                   0.09*maxCount*unitType[3].defense[attacker.type]*
                        (1+terrain.defense[unitType[3].type]/100);
        }
        var minCount = minDef/(attacker.attack*
            (1+terrain.attack[attacker.type]/100));
        var maxCount = maxDef/(attacker.attack*
            (1+terrain.attack[attacker.type]/100));
        row.insertCell(-1).innerHTML = Number(minCount).toFixed(0) + ' - ' +
          Number(maxCount).toFixed(0);
      }
  }
}
function buildCellHTML(x,y, qNearestTown, data)
{
  var html = '<a href="#/Trade/Orders/'+x+'/'+y+'?ActionTypeID=2"';
  if ( qNearestTown )
  {
    var nearestTown = nearestCity(x,y);
    html += ' onclick="ChangeTownFocus('+nearestTown.id+'); return true;"';
  }
  html += '>'+x+'|'+y+ 
          (data.sov?" sov":"") + (data.army?" army":"") + 
          (data.npc?" npc":"") + "</a></br>";
  return html;
}

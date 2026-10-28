function initProductionTab()
{
  var options = JSON.parse(
      localStorage.getItem("ctProductionSettings_"+userName));

  var productionTable = document.getElementById("productionTable");
  productionTable.innerHTML = "";
  
  // Build the table
  var header = productionTable.createTHead();
  var row = header.insertRow(0);
  var actionRow = header.insertRow(-1);
  row.insertCell(-1).style.width="22px"; // First column
  actionRow.insertCell(-1); // First column
  var selectElem = document.getElementById("optTown");
  for ( var i=0; i<selectElem.length; ++i )
  {
    if ( !ctCityData.cities[i] ) continue;
    var city = ctCityData.cities[i];
    var pos = city.x+'/'+city.y;
    var cell = row.insertCell(-1);
    cell.style.width = "60px";
    cell.innerHTML = '<a href="#" onclick="ChangeTownFocus('+ctCityData.cities[i].id+'); return false;">'+city.name+'</a>';
    actionRow.insertCell(-1).innerHTML = 
      '<a href="#/Trade/Orders/'+pos+'"><img src="//assets.illyriad.net/img/buttons/secondary/orders_32x32_off.png" width="16" height="16"></a>'+
      '<a href="#/Town/Sovereignty" onclick="ChangeTownFocus('+city.id+'); return true;"><img src="//assets.illyriad.net/img/buttons/secondary/sovereignty_32x32_off.png" width="16" height="16"></a>'+
      '<a href="#/World/Map/'+pos+'"><img src="//assets.illyriad.net/img/buttons/primary/world_64x64_off.png" width="16" height="16"></a>';
  }
  var cell = row.insertCell(-1);
  cell.innerHTML = "Total";
  cell.style.width = "60px";

  var body = productionTable.createTBody();
  // Build the rows
  // Incoming attack
  if ( options[0] )
  {
    var row = body.insertRow(-1);
    row.insertCell(-1).innerHTML = 
      '<img src="//assets.illyriad.net/img/icons/movements/troop_hi.png">';
    for ( var j=0; j<selectElem.length+1; ++j )
      row.insertCell(-1);
    row.insertCell(-1).innerHTML = 
      '<img src="//assets.illyriad.net/img/icons/movements/troop_hi.png">';
  }
  // Building and research queue
  productionTable.basicResourceRow = 0;
  for ( var i=0; i<4; ++i )
  {
    if ( options[i+1] )
    {
      ++productionTable.basicResourceRow;
      var row = body.insertRow(-1);
      if ( i<2 )
        row.insertCell(-1).innerHTML = 
          '<img src="//assets.illyriad.net/img/icons/notifications/1.png">';
      else
        row.insertCell(-1).innerHTML = 
          '<img src="//assets.illyriad.net/img/icons/notifications/2.png">';
      for ( var j=0; j<selectElem.length+1; ++j )
        row.insertCell(-1);
      if ( i<2 )
        row.insertCell(-1).innerHTML = 
          '<img src="//assets.illyriad.net/img/icons/notifications/1.png">';
      else
        row.insertCell(-1).innerHTML = 
          '<img src="//assets.illyriad.net/img/icons/notifications/2.png">';
    }
  }
  // Army production
  if ( options[5] )
  {
    ++productionTable.basicResourceRow;
    var row = body.insertRow(-1);
    row.insertCell(-1).innerHTML = 
          '<img src="//assets.illyriad.net/img/buttons/primary/military_64x64_off.png" width="20" height="20">';
    for ( var j=0; j<selectElem.length+1; ++j )
      row.insertCell(-1);
    row.insertCell(-1).innerHTML = 
          '<img src="//assets.illyriad.net/img/buttons/primary/military_64x64_off.png" width="20" height="20">';
  }
  // Diplo production
  if ( options[6] )
  {
    ++productionTable.basicResourceRow;
    var row = body.insertRow(-1);
    row.insertCell(-1).innerHTML = 
          '<img src="//assets.illyriad.net/img/buttons/primary/diplomacy_64x64_off.png" width="20" height="20">';
    for ( var j=0; j<selectElem.length+1; ++j )
      row.insertCell(-1);
    row.insertCell(-1).innerHTML = 
          '<img src="//assets.illyriad.net/img/buttons/primary/diplomacy_64x64_off.png" width="20" height="20">';
  }
  // Basic Resources
  var illyBasicTable = document.getElementById("tbRes");
  productionTable.advResourceRow = productionTable.basicResourceRow;
  for ( var i=0; i<8; ++i )
  {
    if ( options[i+7] )
    {
      ++productionTable.advResourceRow;
      var row = body.insertRow(-1);
      row.type = illyBasicTable.rows[0].cells[i*2+1].firstChild.getAttribute("title").toLowerCase();
      row.insertCell(-1).appendChild(illyBasicTable.rows[0].cells[2*i+1].firstChild.cloneNode(true));
      for ( var j=0; j<selectElem.length+1; ++j )
        row.insertCell(-1);
      row.insertCell(-1).appendChild(illyBasicTable.rows[0].cells[2*i+1].firstChild.cloneNode(true));
    }
  }
  // Advanced Resources
  var illyAdvTable = document.getElementById("advRes").getElementsByTagName("table")[0];
  for ( var i=0; i<12; ++i )
  {
    if ( options[i+15] )
    {
      var row = body.insertRow(-1);
      row.type = illyAdvTable.rows[0].cells[i*2+1].firstChild.getAttribute("title").toLowerCase();
      row.insertCell(-1).appendChild(illyAdvTable.rows[0].cells[2*i+1].firstChild.cloneNode(true));
      for ( var j=0; j<selectElem.length+1; ++j )
        row.insertCell(-1);
      row.insertCell(-1).appendChild(illyAdvTable.rows[0].cells[2*i+1].firstChild.cloneNode(true));
    }
  }
  initHubTable();
}

function initHubTable()
{
  // Hubs
  var table = document.getElementById("hubLinkTable");
  table.innerHTML = "";
  var row = table.insertRow(-1);
  row.innerHTML = '<td><img src="//assets.illyriad.net/img/buttons/secondary/factionmarket_32x32_off.png" width="20px" height="20px"></td>';
  for ( var hubId in ctCityData.hubs )
  {
    var hub = ctCityData.hubs[hubId];
    var name = hub.name;
    var cell = row.insertCell(-1);
    cell.innerHTML = 
        '<a href="#/Trade/HubInventory?HubId='+hubId+'">'+name+'</a>';
    if ( tradeHubs[name] ) 
    {
      cell.innerHTML +=
        '<a href="#/Trade/Orders/'+tradeHubs[name].x+'/'+tradeHubs[name].y+'">'+
          '<img src="//assets.illyriad.net/img/buttons/secondary/trade_32x32_off.png" width="20px" height="20px"></a>';
    }
    else
      console.error("Unknown trade hub: "+name);
    if ( hub.traderCities && hub.traderCities.length )
      cell.innerHTML += '<a href="#/Trade/HubOrders?HubId='+hubId+'" onclick="ChangeTownFocus('+hub.traderCities[0].id+'); return true;">'+
        '<img src="//assets.illyriad.net/img/buttons/secondary/orders_32x32_off.png" width="20px" height="20px"></a>';
    else
      cell.innerHTML += '<a href="#/Trade/HubOrders?HubId='+hubId+'">'+
        '<img src="//assets.illyriad.net/img/buttons/secondary/orders_32x32_off.png" width="20px" height="20px"></a>';
  }
}
var drawProdTableTimeout;
function drawProdTable()
{
  if(drawProdTableTimeout)
    clearTimeout(drawProdTableTimeout);

  drawProdTableTimeout = setTimeout(drawProdTable, 2000);

  var options = JSON.parse(
      localStorage.getItem("ctProductionSettings_"+userName));
  var productionTable = document.getElementById("productionTable");
  if ( !productionTable )
    return;

  var selectElem = document.getElementById("optTown");
  var selectedCity = ctCityData.cities[selectElem.selectedIndex];
  var rowOffset = 0;
  var totalT1Costs = [0,0,0,0,0,0,0,0];
  for ( var cityIndex = 0; cityIndex < ctCityData.numCities; ++cityIndex )
  {
    var cityData = ctCityData.cities[cityIndex];
    if ( !cityData ) continue;
    
    // Incoming army
    rowOffset = 2;
    if ( options[0] )
    {
      if ( cityData.incomingArmy )
        productionTable.rows[rowOffset].cells[cityIndex+1].innerHTML = 
          '<a onclick="ChangeTownFocus('+cityData.id+'); return true;" href="#/Military/Movements" title="'+cityData.incomingArmy.title+'">'+convertTime(cityData.incomingArmy.end)+'</a>';
      ++rowOffset;
    }
    // Production Table
    for ( var i=0; i<4; ++i )
    {
      if ( options[i+1] )
      {
        if ( cityData.eventTimes[i] )
        {
          productionTable.rows[rowOffset].cells[cityIndex+1].innerHTML=
            '<a onclick="ChangeTownFocus('+cityData.id+'); return true;" href="'+
            (i<2?'#/Town/Map':'#/Research/Tree')+'">'+
            convertTime(cityData.eventTimes[i])+'</a>';
        }
        else
          productionTable.rows[rowOffset].cells[cityIndex+1].innerHTML= '';
        ++rowOffset;
      }
    }
    // Military
    if ( options[5] )
    {
      var endTime = convertTime(cityData.unitProductionEndTime);
      productionTable.rows[rowOffset].cells[cityIndex+1].innerHTML = 
        '<a onclick="ChangeTownFocus('+cityData.id+'); return true;" href="#/Town/UnitProduction/8">'+
        '<span style="color: '+(endTime.endsWith("d")?"#000000":"#a0a000")+';">'+
        convertTime(cityData.unitProductionEndTime)+'</span></a>';
      ++rowOffset;
    }
    // Diplo
    if ( options[6] )
    {
      productionTable.rows[rowOffset].cells[cityIndex+1].innerHTML = 
        '<a onclick="ChangeTownFocus('+cityData.id+'); return true;" href="#/Town/UnitProduction/12">'+
        convertTime(cityData.diploProductionEndTime)+'</a>';
      ++rowOffset;
    }
    var t1Costs = [0,0,0,0,0,0,0,0];
    if ( document.getElementById('t1RateIncludeT2').checked )
      for ( var i=0; i<12; ++i )
        if ( cityData.advResourceBuild[i] > 0 ) 
        {
          addCost(t1Costs, i, cityData.advResourceRates[i]);
          addCost(totalT1Costs, i, cityData.advResourceRates[i]);
        }

    // Basic resources
    for ( var i=0; i<8; ++i )
    {
      if ( options[7+i] )
      {
        var color1 = "#000000", color2="#000000";
        // Max check
        if ( i>=1 && i<6 && 
            currentBasicResourceAmount(cityIndex,i) + 
            0.5*cityData.basicResourceRates[i] > cityData.maxStorage )
          color1 = "#860008";
        else if ( i>=1 && i<6 && 
            currentBasicResourceAmount(cityIndex,i) + 
            24*cityData.basicResourceRates[i] > cityData.maxStorage )
          color1 = "#a0a000";
        // Min Check
        if ( currentBasicResourceAmount(cityIndex, i) == 0 )
          color1 = "red";
        else if ( currentBasicResourceAmount(cityIndex,i) + 
            24*cityData.basicResourceRates[i] < 0 )
          color1 = "#a0a000";
        if ( cityData.basicResourceRates[i] < 0 )
          color2 = "red";
        var row = productionTable.rows[rowOffset];
        if ( i==0 )
        {
          row.cells[cityIndex+1].innerHTML= 
            '<a onclick="ChangeTownFocus('+cityData.id+'); return true;" '+
            'href="#/Town/Taxation">'+
            '<span style="color: '+color1+';">'+
            convertNumber(currentBasicResourceAmount(cityIndex, i))+"</span>/"+
            '<span style="color: '+color2+';">'+
            convertNumber(cityData.basicResourceRates[i]-t1Costs[i])+'</span></a>';
        }
        else if ( color2 == "red" )
        {
          row.cells[cityIndex+1].innerHTML= 
            '<a href="#/Trade/Markets" style="color: inherit;" onclick="ChangeTownFocus('+cityData.id+'); document.getElementById(\'ctDataField\').innerHTML = \''+row.type+'\'; return true;">'+
            '<span style="color: '+color1+';">'+
            convertNumber(currentBasicResourceAmount(cityIndex, i))+"</span>/"+
            '<span style="color: '+color2+';">'+
            convertNumber(cityData.basicResourceRates[i]-t1Costs[i])+'</span></a>';
        }
        else
        {
          row.cells[cityIndex+1].innerHTML= 
            '<a href="#/Trade/Markets" style="color: inherit;" onclick="ChangeTownFocus('+cityData.id+'); document.getElementById(\'ctDataField\').innerHTML = \''+row.type+'\'; return true;">'+
            '<span style="color: '+color1+';">'+
            convertNumber(currentBasicResourceAmount(cityIndex, i))+"</span>/"+
            '<span style="color: '+color2+';">'+
            convertNumber(cityData.basicResourceRates[i]-t1Costs[i])+'</span></a>';
        }
        if ( cityData.basicResourceRates[i] < 0 )
        {
          row.cells[cityIndex+1].title = "Empty in: " + convertDeltaTime(
              -3600*currentBasicResourceAmount(cityIndex,i)/
              cityData.basicResourceRates[i]);
        }
        else if ( i>0 )
        {
          row.cells[cityIndex+1].title = "Overflow in: " + convertDeltaTime(
                   3600*(cityData.maxStorage - 
                    currentBasicResourceAmount(cityIndex,i))/
                   cityData.basicResourceRates[i]);
        }
        ++rowOffset;
      }
    }
    // Advanced resources
    for ( var i=0; i<12; ++i )
    {
      if ( options[15+i] )
      {
        var row = productionTable.rows[rowOffset++];
        if ( typeof cityData.advResourceRates[i] == 'undefined' ) 
        {
          row.cells[cityIndex+1].innerHTML = 
            convertNumber(currentAdvResourceAmount(cityIndex, i))+"/--";
          row.cells[cityIndex+1].style.color = "#000000";
          continue;
        }
        addCost(t1Costs, i, cityData.advResourceRates[i]);
        row.cells[cityIndex+1].innerHTML=
          '<a onclick="ChangeTownFocus('+cityData.id+'); return true;"'+
          ' href="#/Town/BuildingProduction/'+ctAdvProductionBuildingSlot[i]+'"'+
          ' style="color: inherit;">'+
          convertNumber(currentAdvResourceAmount(cityIndex, i))+"/"+
          convertNumber(cityData.advResourceRates[i])+'</a>';
        var deltaT = (new Date().getTime() - cityData.resourceRefreshTime)/3600000;
        var buildTimeLeft;
        if ( i==5 || i==9 ) // Special code for blacksmith
          buildTimeLeft = Math.max((cityData.advResourceBuild[5]-
                                    deltaT*cityData.advResourceRates[5])/
                                  cityData.advResourceRates[5],
                                  (cityData.advResourceBuild[9]-
                                    deltaT*cityData.advResourceRates[9])/
                                  cityData.advResourceRates[9]) ;
        else
          buildTimeLeft = (cityData.advResourceBuild[i]-
                            deltaT*cityData.advResourceRates[i])/
                            cityData.advResourceRates[i];

        if ( buildTimeLeft <= 0 )
          row.cells[cityIndex+1].style.color = "#ff0000";
        else if ( buildTimeLeft <= 8 )
        {
          row.cells[cityIndex+1].title = "Complete in: "+
            convertDeltaTime(3600*buildTimeLeft);
          row.cells[cityIndex+1].style.color = "#a0a000";
        }
        else
        {
          row.cells[cityIndex+1].title = "Complete in: "+
            convertDeltaTime(3600*buildTimeLeft);
          row.cells[cityIndex+1].style.color = "#000000";
        }
      }
    }
  }
  // Totals
  var rowOffset = 2;
  for ( var i=0; i<7; ++i )
    if ( options[i] ) ++rowOffset;

  // Basic resources
  for ( var i=0; i<8; ++i )
  {
    if ( options[i+7] )
    {
      var row = productionTable.rows[rowOffset];
      var amountSum=0, rateSum=0;
      for ( var cityIndex = 0; cityIndex < ctCityData.numCities; ++cityIndex )
      {
        var cityData = ctCityData.cities[cityIndex];
        amountSum += currentBasicResourceAmount(cityIndex, i);
        rateSum += cityData.basicResourceRates[i];
      }
      rateSum -= totalT1Costs[i];
      row.cells[cityIndex+1].innerHTML= 
        convertNumber(amountSum)+"/"+ convertNumber(rateSum);
      ++rowOffset;
    }
  }
  // Advanced resources
  for ( var i=0; i<12; ++i )
  {
    if ( options[i+15] )
    {
      var row = productionTable.rows[rowOffset];
      var amountSum=0, rateSum=0;
      for ( var cityIndex = 0; cityIndex < ctCityData.numCities; ++cityIndex )
      {
        var cityData = ctCityData.cities[cityIndex];
        amountSum += cityData.advResourceStores[i];
        if ( typeof cityData.advResourceRates[i] != 'undefined' )
          rateSum += cityData.advResourceRates[i];
      }
      row.cells[cityIndex+1].innerHTML=
        convertNumber(amountSum)+"/"+ convertNumber(rateSum);
      ++rowOffset;
    }
  }
}

function addCost(t1CostArray, index, rate)
{
  for ( var i=0; i<7; ++i )
    t1CostArray[i] += rate*ctT2Costs[index].cost[i];
}

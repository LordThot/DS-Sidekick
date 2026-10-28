function initTradeTab()
{
  var tradeTable = document.getElementById("tradeTable");
  tradeTable.innerHTML = "";
  var body = tradeTable.createTBody();
  var head = tradeTable.createTHead();

  var row = head.insertRow(-1);
  var actionRow = head.insertRow(-1);
  row.insertCell(-1); actionRow.insertCell(-1);
  for ( var hub in ctCityData.hubs )
  {
    row.insertCell(-1).innerHTML = 
      '<a href="#/Trade/HubInventory?HubId='+hub+'">'+
      ctCityData.hubs[hub].name+'</a>';
    var actionCell = actionRow.insertCell(-1);
    if ( ctCityData.hubs[hub].traderCities && 
         ctCityData.hubs[hub].traderCities.length > 0 )
      actionCell.innerHTML = 
        '<a href="#/Trade/HubOrders?HubId='+hub+'" onclick="ChangeTownFocus('+ctCityData.hubs[hub].traderCities[0].id+'); return true;">'+
        '<img src="//assets.illyriad.net/img/buttons/secondary/orders_32x32_off.png" alt="Hub Orders" width="20px" height="20px"></a>';
    else
      actionCell.innerHTML = 
        '<a href="#/Trade/HubOrders?HubId='+hub+'"><img src="//assets.illyriad.net/img/buttons/secondary/orders_32x32_off.png" width="16" height="16"></a>';
    actionCell.innerHTML +=
        '<a href="#/Trade/HubMovements?HubId='+hub+'""><img src="//assets.illyriad.net/img/buttons/secondary/movements_32x32_off.png" width="20" height="20"></a>';
  }
  row.insertCell(-1).innerHTML = "Grand Total";

  var options = JSON.parse(
      localStorage.getItem("ctProductionSettings_"+userName));
  // Basic Resources
  var illyBasicTable = document.getElementById("tbRes");
  tradeTable.advResourceRow = tradeTable.basicResourceRow;
  for ( var i=0; i<8; ++i )
  {
    if ( options[i+7] )
    {
      ++tradeTable.advResourceRow;
      var row = body.insertRow(-1);
      row.type = illyBasicTable.rows[0].cells[i*2+1].firstChild.getAttribute("title").toLowerCase();
      row.insertCell(-1).appendChild(illyBasicTable.rows[0].cells[2*i+1].firstChild.cloneNode(true));
      for ( var hub in ctCityData.hubs )
        row.insertCell(-1).innerHTML = convertNumber(
            ctCityData.hubs[hub].basicResourceStores[i]);
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
      for ( var hub in ctCityData.hubs )
        row.insertCell(-1).innerHTML = convertNumber(
            ctCityData.hubs[hub].advResourceStores[i]);
    }
  }

  // Totals
  // Basic resources
  var rowOffset = 0;
  for ( var i=0; i<8; ++i )
  {
    if ( options[i+7] )
    {
      var amountSum=0, rateSum=0;
      for ( var cityIndex = 0; cityIndex < ctCityData.numCities; ++cityIndex )
      {
        var cityData = ctCityData.cities[cityIndex];
        amountSum += currentBasicResourceAmount(cityIndex, i);
        rateSum += cityData.basicResourceRates[i];
      }
      for ( var hub in ctCityData.hubs )
        amountSum += Number(ctCityData.hubs[hub].basicResourceStores[i]);
      body.rows[rowOffset].insertCell(-1).innerHTML= 
        convertNumber(amountSum)+"/"+ convertNumber(rateSum);
      ++rowOffset;
    }
  }
  // Advanced resources
  for ( var i=0; i<12; ++i )
  {
    if ( options[i+15] )
    {
      var amountSum=0, rateSum=0;
      for ( var cityIndex = 0; cityIndex < ctCityData.numCities; ++cityIndex )
      {
        var cityData = ctCityData.cities[cityIndex];
        amountSum += cityData.advResourceStores[i];
        if ( typeof cityData.advResourceRates[i] != 'undefined' )
          rateSum += cityData.advResourceRates[i];
      }
      for ( var hub in ctCityData.hubs )
        amountSum += Number(ctCityData.hubs[hub].advResourceStores[i]);
      body.rows[rowOffset].insertCell(-1).innerHTML=
        convertNumber(amountSum)+"/"+ convertNumber(rateSum);
      ++rowOffset;
    }
  }
}


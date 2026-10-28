var debugAJAX = false;
function initToolsTab()
{
  document.getElementById("CaptureResourcesBtn").onclick = function()
  {
    document.getElementById("ShortageTable").style.display = "table";
    var body = document.getElementById("ShortageTable").tBodies[0];
    body.innerHTML = "";
    var resRow = body.insertRow(-1);
    var timeRow = body.insertRow(-1);
    var maxRow = body.insertRow(-1);

    var panel = document.getElementById('MainContentDiv');
    var fieldSets = panel.getElementsByTagName('fieldset');
    var table;
    for ( var i=0; i<fieldSets.length; ++i )
      if ( fieldSets[i].getElementsByTagName('legend')[0].innerHTML == "Upgrade Further" )
        table = fieldSets[i].getElementsByTagName('table')[0];
    var h1 = panel.querySelectorAll("h1")[0];
    var buildingName = h1.textContent;
    if ( buildingName == "Town Defenses" )
      buildingName = "Castle Wall";
    if ( !table )
    {
      var cell = resRow.insertCell();
      cell.colSpan = 5;
      cell.innerHTML = "Select the building you want to upgrade first";
    }
    else
    {
      var selectElem = document.getElementById("optTown");
      var cityData = ctCityData.cities[selectElem.selectedIndex];
      resRow.insertCell(-1).innerHTML = "Resources";
      timeRow.insertCell(-1).innerHTML = "Time";
      maxRow.insertCell(-1).innerHTML = "Resources to max";
      var dataRow = table.rows[1];
      var curLevel = table.rows[0].cells[0].innerHTML.split(" ")[1]-1;
      if ( buildingName == "Castle Wall" )
        curLevel++;
      for ( var i=0; i<4; ++i )
      {
        var needed = Number(dataRow.cells[i].innerHTML.replace(/[^\d\.\-]/g,""));
        var amount = Math.max(0, needed -
            currentBasicResourceAmount(selectElem.selectedIndex, i+1));
        resRow.insertCell(-1).innerHTML = convertNumber(amount);
        timeRow.insertCell(-1).innerHTML = convertDeltaTime(3600*amount/
            cityData.basicResourceRates[i+1]);
        if ( needed > cityData.maxStorage )
          resRow.cells[i+1].style.color = "#ff0000";

        if ( ctBuildingData[buildingName] )
        {
          needed = 0;
          for ( var level=curLevel+1; level<=20; ++level )
            needed += ctBuildingData[buildingName].levels[level].costs[i];

          var amount = Math.max(0, needed -
              currentBasicResourceAmount(selectElem.selectedIndex, i+1));
          maxRow.insertCell(-1).innerHTML = convertNumber(amount);
        }
      }
      if ( ctBuildingData[buildingName] )
      {
        resRow.insertCell(-1);
        resRow.insertCell(-1).innerHTML = convertNumber(
          ctBuildingData[buildingName].levels[curLevel+1].upkeep.food-
          ctBuildingData[buildingName].levels[curLevel].upkeep.food);
        maxRow.insertCell(-1);
        maxRow.insertCell(-1).innerHTML = convertNumber(
          ctBuildingData[buildingName].levels[20].upkeep.food-
          ctBuildingData[buildingName].levels[curLevel].upkeep.food);
      }
    }
  }
  document.getElementById('ComputeUpgradeBtn').onclick = function() 
  {
    var selectElem = document.getElementById("optTown");
    var cityData = ctCityData.cities[selectElem.selectedIndex];
    var lowestBase=[20,20,20,20,20], totalProd=[0,0,0,0,0];
    var bonusLevel = [0,0,0,0,0]; 
    var baseHref= new Array(); var bonusHref = new Array();
    var baseNames = ["Farmyard","Lumberjack","Clay Pit","Iron Mine","Quarry"];
    var bonusNames = ["Flourmill","Carpentry","Kiln","Foundry","Stonemason"];
    for ( var i=0; i<cityData.buildings.length; ++i )
    {
      var building = cityData.buildings[i].building;
      var level = cityData.buildings[i].level;
      for ( var type=0; type<5; ++type )
      {
        if ( building == baseNames[type] )
        {
          totalProd[type]+= ctBuildingData[building].levels[level].ability_a;
          if ( level < lowestBase[type] )
          {
            lowestBase[type] = level;
            baseHref[type] = cityData.buildings[i].href;
          }
        }
        else if ( building == bonusNames[type] )
        {
          bonusLevel[type] = level;
          bonusHref[type] = cityData.buildings[i].href;
        }
      }
    }
    var table = document.getElementById('UpgradeTable');
    table.style.display = "table";
    for ( var type=0; type<5; ++type )
    {
      table.rows[2*type+1].cells[0].innerHTML = '<a href="'+baseHref[type]+
        '" onclick="ChangeTownFocus('+cityData.id+'); return true;">'+
        baseNames[type]+'</a>';
      table.rows[2*type+2].cells[0].innerHTML = '<a href="'+bonusHref[type]+
        '" onclick="ChangeTownFocus('+cityData.id+'); return true;">'+
        bonusNames[type]+'</a>';

      if ( lowestBase[type] == 20 )
      {
        for ( var c=1; c<=4; ++c )
          table.rows[2*type+1].cells[c].innerHTML = '--';
      }
      else
      {
        var curBase = ctBuildingData[baseNames[type]].levels[lowestBase[type]];
        var nextBase = ctBuildingData[baseNames[type]].levels[lowestBase[type]+1];
        var deltaBase = nextBase.ability_a - curBase.ability_a;
        table.rows[2*type+1].cells[1].innerHTML = Number(deltaBase).toFixed(1);
        table.rows[2*type+1].cells[2].innerHTML = Number(1000*deltaBase/
            nextBase.cost.total).toFixed(2);
        table.rows[2*type+1].cells[3].innerHTML = Number(3600*deltaBase/
            nextBase.time).toFixed(2);
        table.rows[2*type+1].cells[4].innerHTML = Number(deltaBase/
            (nextBase.upkeep.food-curBase.upkeep.food)).toFixed(2);
      }
      if ( bonusLevel[type] == 20 )
      {
        for ( var c=1; c<=4; ++c )
          table.rows[2*type+2].cells[c].innerHTML = '--';
      }
      else
      {
        var curBonus = ctBuildingData[bonusNames[type]].levels[bonusLevel[type]];
        var nextBonus = ctBuildingData[bonusNames[type]].levels[bonusLevel[type]+1];
        var deltaBonus = totalProd[type] * 
          (nextBonus.ability_a-curBonus.ability_a)/100;
        table.rows[2*type+2].cells[1].innerHTML = Number(deltaBonus).toFixed(1);
        table.rows[2*type+2].cells[2].innerHTML = Number(1000*deltaBonus/
            nextBonus.cost.total).toFixed(2);
        table.rows[2*type+2].cells[3].innerHTML = Number(3600*deltaBonus/
            nextBonus.time).toFixed(2);
        table.rows[2*type+2].cells[4].innerHTML = Number(deltaBonus/
            (nextBonus.upkeep.food-curBonus.upkeep.food)).toFixed(2);
      }
    }
  }
  document.getElementById("ComputeDistBtn").onclick = function() 
  {
    var x = Number(document.getElementById("DistCenterX").value);
    var y = Number(document.getElementById("DistCenterY").value);
    var table = document.getElementById("DistanceTable");
    var body = table.tBodies[0];
    body.innerHTML='';
    var selectElem = document.getElementById("optTown");
    for ( var i=0; i<selectElem.length; ++i )
    {
      if ( ctCityData.cities[i] )
      {
        var city = ctCityData.cities[i];
        var row = body.insertRow(-1);
        row.insertCell(-1).innerHTML = city.name;
        row.insertCell(-1).innerHTML = 
          Math.sqrt(Math.pow(city.x-x,2)+Math.pow(city.y-y,2)).toFixed(1);
      }
    }

    table.style.display = "table";
    window.location = '#/World/Map/'+x+'/'+y+'/10';
    return false;
  }

  if ( userName == "cweissha" )
    document.getElementById("DebugAJAXBtn").onclick = function() { 
      debugAJAX = !debugAJAX; }
  else
    document.getElementById("DebugAJAXBtn").style.display="none";

  document.getElementById("ClearCookiesBtn").onclick = function() { 
    localStorage.removeItem('ctCityData_'+userName); 
    initCityData();
  }

  // Options for production page
  var options = [1,1,1,1,0,1,1,
                 1,1,1,1,1,1,0,0,
                 1,1,1,1,1,1,1,1,1,1,1,0];
  if ( localStorage.getItem("ctProductionSettings_"+userName) )
  {
    var savedOptions=JSON.parse(localStorage.getItem("ctProductionSettings_"+userName));
    if ( savedOptions.length == options.length ) 
      options = savedOptions;
  }
  else
    localStorage.setItem("ctProductionSettings_"+userName, 
                         JSON.stringify(options));

  var table = document.getElementById("ProductionQueue");
  var header = table.createTHead();
  var row = header.insertRow(-1);
  row.insertCell(-1).innerHTML = "Info Row";
  // incoming
  row.insertCell(-1).innerHTML = 
        '<img src="//assets.illyriad.net/img/icons/movements/troop_hi.png">';
  // building, research
  row.insertCell(-1).innerHTML = 
        '<img src="//assets.illyriad.net/img/icons/notifications/1.png">';
  row.insertCell(-1).innerHTML = 
        '<img src="//assets.illyriad.net/img/icons/notifications/1.png">';
  row.insertCell(-1).innerHTML = 
        '<img src="//assets.illyriad.net/img/icons/notifications/2.png">';
  row.insertCell(-1).innerHTML = 
        '<img src="//assets.illyriad.net/img/icons/notifications/2.png">';
  // military
  row.insertCell(-1).innerHTML = 
    '<img src="//assets.illyriad.net/img/buttons/primary/military_64x64_off.png" width="20" height="20">';
  // diplo
  row.insertCell(-1).innerHTML = 
    '<img src="//assets.illyriad.net/img/buttons/primary/diplomacy_64x64_off.png" width="20" height="20">'
  var body = table.createTBody();
  var prodRow = body.insertRow(-1);
  prodRow.insertCell(-1).innerHTML = "Visible";
  // basic
  table = document.getElementById("ProductionBasic");
  header = table.createTHead();
  row = header.insertRow(-1);
  row.insertCell(-1).innerHTML = "Info Row";
  var illyBasicTable = document.getElementById("tbRes");
  for ( var i=0; i<8; ++i )
    row.insertCell(-1).appendChild(illyBasicTable.rows[0].cells[2*i+1].firstChild.cloneNode(true));
  body = table.createTBody();
  var basicRow = body.insertRow(-1);
  basicRow.insertCell(-1).innerHTML = "Visible";
  // advanced
  table = document.getElementById("ProductionAdv");
  header = table.createTHead();
  row = header.insertRow(-1);
  row.insertCell(-1).innerHTML = "Info Row";
  var illyAdvTable = document.getElementById("advRes").getElementsByTagName("table")[0];
  for ( var i=0; i<12; ++i )
    row.insertCell(-1).appendChild(illyAdvTable.rows[0].cells[2*i+1].firstChild.cloneNode(true));
  body = table.createTBody();
  var advRow = body.insertRow(-1);
  advRow.insertCell(-1).innerHTML = "Visible";

  // checkboxes
  for ( var i=0; i<options.length; ++i )
  {
    var box = document.createElement("input");
    box.type = "checkbox";
    box.item = i;
    if ( options[i] )
      box.checked = "checked";
    box.onclick = function() {
      options[this.item] = this.checked;
      localStorage.setItem("ctProductionSettings_"+userName, 
                           JSON.stringify(options));
      initProductionTab();
      setDefaultSize();
      return true;
    }
    if ( i<7 )
      prodRow.insertCell(-1).appendChild(box);
    else if ( i<15 )
      basicRow.insertCell(-1).appendChild(box);
    else
      advRow.insertCell(-1).appendChild(box);
  }

  var t1RateRaw = true;
  if ( localStorage.getItem("ctT1RateDisplay_"+userName) )
    t1RateRaw=JSON.parse(localStorage.getItem("ctT1RateDisplay_"+userName));
  document.getElementById('t1RateRaw').checked = t1RateRaw;
  document.getElementById('t1RateIncludeT2').checked = !t1RateRaw;
  document.getElementById('t1RateRaw').onclick = function()
  {
    localStorage.setItem("ctT1RateDisplay_"+userName, 
                         JSON.stringify(true));
  }
  document.getElementById('t1RateIncludeT2').onclick = function()
  {
    localStorage.setItem("ctT1RateDisplay_"+userName, 
                         JSON.stringify(false));
  }

  var captureChat = false;
  if ( localStorage.getItem("ctCaptureChat_"+userName) )
    captureChat = JSON.parse(localStorage.getItem("ctCaptureChat_"+userName));
  document.getElementById('captureChat').checked = captureChat;
  document.getElementById('captureChat').onclick = function()
  {
    localStorage.setItem("ctCaptureChat_"+userName, 
                         JSON.stringify(this.checked));
  }
}

function initArmyTab()
{
  var selectElem = document.getElementById("optTown");
  // Build the city rows on the troop table
  var troopTable = document.getElementById("troopTable");
  for ( var i=0; i<selectElem.length; ++i )
  {
    var t1Row = troopTable.insertRow(-1);
    t1Row.innerHTML = '<td rowspan="2">' + ctCityData.cities[i].name +
      '<a onclick="ChangeTownFocus(' + ctCityData.cities[i].id + ');" href="#/Military/Armies"><img src="//assets.illyriad.net/img/buttons/secondary/armies_32x32_off.png" width="16px" height="16px"></a>' + 
      '<a onclick="ChangeTownFocus(' + ctCityData.cities[i].id + ');" href="#/Military/Movements"><img src="//assets.illyriad.net/img/buttons/secondary/movements_32x32_off.png" width="16px" height="16px"></a>' + 
      "</td><td>T1</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>";
    var t2Row = troopTable.insertRow(-1);
    t2Row.innerHTML = "<td>T2</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>";
  }
   refreshArmyTab(ctCityData.cities[i]);
}

var refreshArmyTabTimeout;
function refreshArmyTab()
{
  if ( refreshArmyTabTimeout )
    clearTimeout(refreshArmyTabTimeout);

  refreshArmyTabTimeout = setTimeout(refreshArmyTab, 2000);

  var selectElem = document.getElementById("optTown");
  for ( var i=0; i<selectElem.length; ++i )
  {
    if ( !ctCityData.cities[i] ) continue;
    refreshArmyData(ctCityData.cities[i]);
  }
  refreshArmyMovements();
}

function refreshArmyData(cityData)
{
  var selectElem = document.getElementById("optTown");
  var troopTable = document.getElementById("troopTable");
  for ( var i=0; i<selectElem.length; ++i )
  {
    if ( !ctCityData.cities[i] || ctCityData.cities[i] != cityData ) continue;
    
    // Clear out the table
    for ( var j=1; j<=7; ++j )
    {
      troopTable.rows[2*i+1].cells[j+1].innerHTML = "";
      troopTable.rows[2*i+2].cells[j].innerHTML = "";
    }
    // Check for army data:
    if ( cityData.armyData )
    {
      for ( var troopId in cityData.armyData )
      {
        var type = unitType[troopId];
        if ( type )
        {
          var rowNum = 2*i + Number(type.substr(1,1));
          var cellNum;
          switch(type.substr(2)) {
            case _spear: cellNum = 4; break;
            case _ranged: cellNum = 3; break;
            case _infantry: cellNum = 2; break;
            case _cavalry: cellNum = 1; break;
            case _siege: cellNum = 5; break;
            case _scout: cellNum = 6; break;
            case _thief: cellNum = 7; break;
            default: continue;
          }
          cellNum += (2-Number(type.substr(1,1)));
          var row = troopTable.rows[rowNum];
          if ( row && row.cells )
            row.cells[cellNum].innerHTML = cityData.armyData[troopId];
        }
      }
    }
  }
}
function refreshArmyMovements()
{
  var selectElem = document.getElementById("optTown");
  var movementTable = document.getElementById("troopMovementTable");
  var movementTableBody = movementTable.tBodies[0];
  movementTableBody.innerHTML = "";
  var hasRow = false;
  for ( var i=0; i<selectElem.length; ++i )
  {
    var cityData = ctCityData.cities[i];
    // Check for movement data
    if ( cityData.militaryMovement && cityData.militaryMovement.length )
    {
      hasRow = true;
      for ( var j=0; j<cityData.militaryMovement.length; ++j )
      {
        var data = cityData.militaryMovement[j];
        var row = movementTableBody.insertRow(-1);
        var html = "<td>"+data.image+"</td><td>"+data.size+
          "</td><td>"+data.activity+"</td><td>"+
          makeCitySpan(data.sendingCityData) + "</td><td>";
        if ( data.targetCityId > 0 )
          html += makeCitySpan(data.targetCityData);
        else
          html += makeLocationSpan(data.X, data.Y);
        html += "</td><td>"+convertTime(data.endTime)+
          "</td><td>"+data.distance+"</td><td>"+data.speed+"</td>";
        row.innerHTML = html;
      }
    }
  }
  if ( hasRow )
    movementTable.style.visibility = "visible";
  else
    movementTable.style.visibility = "hidden";
}

function makeCitySpan(cityData)
{
  var array = cityData.split("|");
  var name = array[0].substr(array[0].indexOf("=")+1);
  return '<span class="name" data="'+cityData+'">'+name+'</span>';
}
function makeLocationSpan(x, y)
{
  return '<span class="name" data="l='+x+'|'+y+'|16">['+x+'|'+y+']</span>';
}
// type is in/out/camp
function parseMovementTable(sourceTable, type)
{
  if ( !sourceTable || !sourceTable.rows || sourceTable.rows.length==0 )
    return;

  if ( type != "camp" && type != "enemyCamp" )
  {
    sourceTable.rows[0].insertCell(-1).innerHTML = "Distance";
    sourceTable.rows[0].insertCell(-1).innerHTML = "Speed";
  }
  var selectElem = document.getElementById("optTown");
  var cityData = ctCityData.cities[selectElem.selectedIndex];
  
  for ( var rowIdx = 1; rowIdx < sourceTable.rows.length; ++rowIdx )
  {
    // Collect the data
    var row = sourceTable.rows[rowIdx];

    var movementData = {};
    movementData.image = row.cells[0].innerHTML;
    movementData.size = row.cells[1].innerHTML;
    movementData.army = row.cells[2].innerHTML;
    movementData.activity = row.cells[3].innerHTML;
    movementData.direction = type;
    var targetData = row.cells[4].lastChild.getAttribute("data");
    var targetDataArray = targetData.split("|");
    // Just using the icon. This is prone to error, but everything else is the same
    movementData.isFriendly = !((type == 'in' && movementData.image != "<img src=\"//assets.illyriad.net/img/icons/movements/troop_mi.png\">") || type == 'enemyCamp');
    /*
    movementData.isFriendly = ( type=="out" || type == "camp" ||
                                targetDataArray[0].charAt(0) == "l" ||
                                movementData.activity == "Reinforcing" ||
                                movementData.activity == "Defending" );
    */
    var thisCityDataStr = 
        "t="+cityData.name+"|"+cityData.id+"|"+cityData.x+"|"+cityData.y+"|"+
        cityData.population+"|"+userId+"|1|1|16|1|"+userName+"|"+
        allianceTicker+"|0";
    if ( targetDataArray[0].charAt(0) == "l" )
    {
      movementData.X = targetDataArray[0].substring(2);
      movementData.Y = targetDataArray[1];
    }
    else
    {
      movementData.X = targetDataArray[2];
      movementData.Y = targetDataArray[3];
    }
    // figure out the sending city
    if ( type == "out" || type == "camp" )
    {
      movementData.sendingCityData = thisCityDataStr;
      movementData.sendingCityId = cityData.id;

      if ( targetDataArray[0].charAt(0) == "t" ) // A city
      {
        movementData.targetCityData = targetData;
        movementData.targetCityId = targetDataArray[1];
      }
      else // a tile
      {
        movementData.targetCityId = -1;
        movementData.X =
          targetDataArray[0].substr(targetDataArray[0].indexOf("=")+1);
        movementData.Y = targetDataArray[1];
      }
    }
    else // Incoming
    {
      if ( targetDataArray[0].charAt(0) == "t" ) // A city
      {
        movementData.sendingCityId = targetDataArray[1];
        movementData.sendingCityData = targetData;
        movementData.targetCityData = thisCityDataStr;
        movementData.targetCityId = cityData.id;
      }
      else // a tile : army is returning to town
      {
        movementData.sendingCityData = thisCityDataStr;
        movementData.sendingCityId = cityData.id;
        movementData.targetCityId = -1;
        movementData.X =
          targetDataArray[0].substr(targetDataArray[0].indexOf("=")+1);
        movementData.Y = targetDataArray[1];
      }
      if ( movementData.isFriendly && movementData.activity != "Reinforcing" )
        movementData.activity = "Returning";
    }
    var timeData = row.cells[5].getElementsByTagName("div")[0].getAttribute("data").split("|");
    movementData.startTime = timeData[0];
    movementData.endTime = timeData[1];

    // Build the row
    movementData.distance = Number(Math.sqrt(
        Math.pow(movementData.X-cityData.x,2)+
        Math.pow(movementData.Y-cityData.y,2))).toFixed(1);
    if ( type != "camp" )
    {
      movementData.speed = Number(movementData.distance/
        (movementData.endTime-movementData.startTime)*3600000).toFixed(2);
      row.insertCell(-1).innerHTML = movementData.distance;
      row.insertCell(-1).innerHTML = movementData.speed;
    }
    else 
      movementData.speed = "n/a";
    cityData.militaryMovement.push(movementData);
  }
  refreshArmyTab(cityData);
}

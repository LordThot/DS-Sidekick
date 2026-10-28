function initSummaryTab()
{
  var summaryTable = document.getElementById("summaryTable");
  var selectElem = document.getElementById("optTown");
  var selectedCity = ctCityData.cities[selectElem.selectedIndex];
  var body = summaryTable.createTBody();
  for ( var i=0; i<selectElem.length; ++i )
  {
    if ( ctCityData.cities[i] )
    {
      var city = ctCityData.cities[i];
      var pos = city.x+'/'+city.y;
      var row = body.insertRow(-1);
      if ( i==selectElem.selectedIndex )
        row.insertCell(-1).innerHTML = '<span class="ui-icon ui-icon-circle-arrow-e"></span>';
      else
        row.insertCell(-1);
      row.insertCell(-1).innerHTML = '<a href="#" onclick="ChangeTownFocus('+city.id+'); return false;">'+city.name+'</a>';
      var actionCell = row.insertCell(-1);
      actionCell.innerHTML = 
        '<a href="#/Trade/Orders/'+pos+'"><img src="//assets.illyriad.net/img/buttons/secondary/orders_32x32_off.png" width="16" height="16"></a>'+
        '<a href="#/Town/Sovereignty" onclick="ChangeTownFocus('+city.id+'); return true;"><img src="//assets.illyriad.net/img/buttons/secondary/sovereignty_32x32_off.png" width="16" height="16"></a>'+
        '<a href="#/Magic/Cast/'+city.id+'"><img src="//assets.illyriad.net/img/buttons/secondary/cast_spell_32x32_off.png" width="16" height="16"></a>'+
        '<a href="#/World/Map/'+pos+'"><img src="//assets.illyriad.net/img/buttons/primary/world_64x64_off.png" width="16" height="16"></a>';
      if ( !city.sovGoal ) city.sovGoal = "Food";
      var sovGoalCell = row.insertCell(-1);
      var sovTypeSelect = document.createElement('select');
      sovTypeSelect.cityData = city;
      for ( sovType in SovBonusTypes )
      {
        var option = document.createElement('option');
        option.value = sovType;
        option.innerHTML = option.value;
        sovTypeSelect.appendChild(option);
        if ( city.sovGoal && city.sovGoal == sovType )
          sovTypeSelect.value = sovType;
      }
      sovGoalCell.appendChild(sovTypeSelect);
      sovTypeSelect.onchange = function() {
        this.cityData.sovGoal = this.value;
      }
      
      for ( var j=0; j<3; ++j ) row.insertCell(-1);
      if ( city && city.x && selectedCity && selectedCity.x )
        row.insertCell(-1).innerHTML = Math.sqrt(Math.pow(city.x-selectedCity.x,2)+Math.pow(city.y-selectedCity.y,2)).toFixed(1);
    }
    else
    {
      var row = body.insertRow(-1);
      row.insertCell(-1);
      row.insertCell(-1).innerHTML = 'Clear cookies to load new city';
    }
  }
  // Notes
  var notesArea = document.getElementById('notesArea');
  if ( localStorage.getItem("ctNotes_"+userName) )
    notesArea.value = localStorage.getItem("ctNotes_"+userName);
  notesArea.onchange = function() { 
    localStorage.setItem("ctNotes_"+userName, notesArea.value);
  };
  // Chat log
  var allianceChatLog = document.getElementById("AllianceChatTab");
  allianceChatLog.onclick = selectTab;
  allianceChatLog.div = document.getElementById("allianceChatLog");
  var globalChatLog = document.getElementById("GlobalChatTab");
  globalChatLog.onclick = selectTab;
  globalChatLog.div = document.getElementById("globalChatLog");
  document.querySelectorAll("#ctChatLog a.closeBtn")[0].onclick = function() {
    document.getElementById("ctChatLog").style.display = "none";
    return false;
  }
  var dragBar = document.querySelectorAll("#ctChatLog div.dragBar")[0];
  dragBar.style.cursor = "move";
  dragBar.addEventListener("mousedown", dragBarMouseDown, true);
  
  document.getElementById('showChatLog').onclick = function() {
    document.getElementsByTagName('BODY')[0].appendChild(document.getElementById('ctChatLog'));
    document.getElementById('ctChatLog').style.display = "block";
    return false;
  };
  var chatLog = {AllianceChats:[], GlobalChats:[]};
  if ( localStorage.getItem("ctChatLog") )
    chatLog = JSON.parse(localStorage.getItem("ctChatLog"));
  for ( var i=0; i<chatLog.AllianceChats.length; ++i )
    AddChatToLog(chatLog.AllianceChats[i], false, false);
  for ( var i=0; i<chatLog.GlobalChats.length; ++i )
    AddChatToLog(chatLog.GlobalChats[i], true, false);

  // I Know
  document.querySelectorAll("#ctIKnow a.closeBtn")[0].onclick = function() {
    document.getElementById("ctIKnow").style.display = "none";
    return false;
  }
  var dragBar = document.querySelectorAll("#ctIKnow div.dragBar")[0];
  dragBar.style.cursor = "move";
  dragBar.addEventListener("mousedown", dragBarMouseDown, true);
  
  document.getElementById('showIKnow').onclick = function() {
    document.getElementById('ctIKnow').style.display = "block";
    document.getElementsByTagName('BODY')[0].appendChild(document.getElementById('ctIKnow'));
    return false;
  };
  
  document.getElementById('sidekickHelp').onclick = function() {
    window.open("http://www.chadweisshaar.com/blog/illyriad-chrome-extension/");
    return false;
  };
}

var drawSummaryTableTimeout;
function drawSummaryTable()
{
  if(drawSummaryTableTimeout)
    clearTimeout(drawSummaryTableTimeout);

  drawSummaryTableTimeout = setTimeout(drawSummaryTable, 2000);

  var summaryTable = document.getElementById("summaryTable");
  var dailyBonusDiv = document.getElementById("dailyBonusDiv");
  if ( !summaryTable || !dailyBonusDiv )
    return;
  if ( convertTime(ctCityData.prestigeTime) == "done" )
    dailyBonusDiv.innerHTML = '<a href="#/World/DailyReward">Collect Bonus</a>';
  else
    dailyBonusDiv.innerHTML = "Bonus in "+convertTime(ctCityData.prestigeTime);

  var selectElem = document.getElementById("optTown");
  var selectedCity = ctCityData.cities[selectElem.selectedIndex];
  var totalPop = 0;
  var rowOffset = 0;
  for ( var cityIndex = 0; cityIndex < ctCityData.numCities; ++cityIndex )
  {
    var cityData = ctCityData.cities[cityIndex];
    if ( !cityData ) continue;
    // Summary Table
    var summaryRow = summaryTable.rows[cityIndex+1];
    if ( cityIndex==selectElem.selectedIndex )
      summaryRow.cells[0].innerHTML = '<span class="ui-icon ui-icon-circle-arrow-e"></span>';
    else
      summaryRow.cells[0].innerHTML = "";
    summaryRow.cells[4].innerHTML = 
      '<a onclick="ChangeTownFocus('+cityData.id+'); return true;"'+
      ' href="#/Research/Tree">'+
      (convertTime(cityData.eventTimes[3])=="done"?
       convertTime(cityData.eventTimes[2]):
       convertTime(cityData.eventTimes[3]))+'</a>';
    summaryRow.cells[5].innerHTML = 
      '<a onclick="ChangeTownFocus('+cityData.id+'); return true;" href="#/Town/UnitProduction/8">'+
      convertTime(cityData.unitProductionEndTime)+'</a>';
    summaryRow.cells[6].innerHTML = "";
    if(cityData.cottages) 
      summaryRow.cells[6].innerHTML += '<img src="//assets.illyriad.net/img/icons/trade/peasant_human_24.png">('+cityData.cottages +")";
    if(cityData.herbalists)
      summaryRow.cells[6].innerHTML += '<img src="//assets.illyriad.net/img/icons/trade/herbgatherer_human_24.png">('+cityData.herbalists +")";
    if(cityData.skinners)
      summaryRow.cells[6].innerHTML += '<img src="//assets.illyriad.net/img/icons/trade/hunter_human_24.png">('+cityData.skinners +")";
    if(cityData.miners)
      summaryRow.cells[6].innerHTML += '<img src="//assets.illyriad.net/img/icons/trade/miner_human_24.png">('+cityData.miners +")";

    totalPop += cityData.population;
    summaryRow.cells[7].innerHTML = Math.sqrt(Math.pow(cityData.x-selectedCity.x,2)+Math.pow(cityData.y-selectedCity.y,2)).toFixed(1);
  }
  summaryTable.rows[ctCityData.numCities+1].cells[6].innerHTML = totalPop;
  
}

function AddChatToLog(chatData, isGlobal, shouldSave)
{
  if ( localStorage.getItem("ctCaptureChat_"+userName) &&
       JSON.parse(localStorage.getItem("ctCaptureChat_"+userName)) )
  {
    //<!--{"GlobalChats":[{"PlayerId":245034,"toPlayerId":0,"chatid":8467763,"added":"\/Date(1386117174547)\/","addedText":"00:32","PlayerLink":"p=Silverbladee|245034|IND|286|1|0||||0-387-284-60","text":"i want it!!!!!!!"}],"AllianceChats":null,"Notifications":null,"PlayersInChat":506,"ReceiveTime":1386117165234,"SendTime":1386117174687}-->
    var logDiv = isGlobal ? document.getElementById('globalChatLog') :
                            document.getElementById('allianceChatLog');
    var chatDiv = document.createElement("div");
    var timeSpan = document.createElement("span");
    timeSpan.className = "time";
    timeSpan.innerHTML = chatData.addedText;
    chatDiv.appendChild(timeSpan);
    chatDiv.appendChild(document.createTextNode("<"));
    var playerSpan = document.createElement("span");
    playerSpan.className = "name";
    playerSpan.setAttribute("data", chatData.PlayerLink);
    var dataStr = chatData.PlayerLink.split("|")[0];
    playerSpan.innerHTML = dataStr.substr(dataStr.indexOf("=")+1);
    chatDiv.appendChild(playerSpan);
    chatDiv.appendChild(
        document.createTextNode("> "+
          chatData.text.replace(/&#39;/g,"'").
          replace(/&quote;/g,'"').
          replace(/&gt;/g,">").
          replace(/&lt;/g,"<")));
    logDiv.appendChild(chatDiv);
    logDiv.scrollTop = logDiv.scrollHeight;
  }

  if ( shouldSave )
  {
    var chatLog = {AllianceChats:[], GlobalChats:[]};
    if ( localStorage.getItem("ctChatLog") )
      chatLog = JSON.parse(localStorage.getItem("ctChatLog"));
    var newChat = {addedText: chatData.addedText, 
                  PlayerLink: chatData.PlayerLink,
                  text: chatData.text};
    while ( chatLog.GlobalChats.length > 500 )
      chatLog.GlobalChats.shift();
    while ( chatLog.AllianceChats.length > 500 )
      chatLog.AllianceChats.shift();
    if ( isGlobal )
      chatLog.GlobalChats.push(newChat);
    else
      chatLog.AllianceChats.push(newChat);
    localStorage.setItem("ctChatLog", JSON.stringify(chatLog));
  }
}

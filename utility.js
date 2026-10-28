function changeTown(id)
{
  //console.log("contentScriptFunction");
  window.postMessage({type: 'ContentScriptChangeTown', town: id}, '*');
}
function fetchJSONData(url, data, callback) {
  try 
  { 
    if ( typeof GM_xmlhttpRequest != "undefined" )
    {
      var requestStr = new String();
      for ( var key in data )
      {
        if ( data.hasOwnProperty(key) )
        {
          if ( requestStr.length != 0 )
            requestStr += "&"+key+"="+data[key];
          else
            requestStr += key+"="+data[key];
        }
      }
      GM_xmlhttpRequest( {
        method: "POST",
        data: requestStr,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        url: url,
        onload: function(response) {
          var txt = JSON.parse(response.responseText);
          if ( txt.error )
          {
            console.error("Error calling URL="+url+data+" ERROR="+txt.error);
            callback(null);
          }
          else
            callback(txt);
        },
        onerror: function(response) {
          console.error("Error calling URL="+url+data+" ERROR="+txt.error);
          callback( null);
        }
      });
    }
    else
    {
      var params = new FormData();
      for ( var key in data )
        if ( data.hasOwnProperty(key) )
          params.append(key, data[key]);

      request = new XMLHttpRequest();
      request.onreadystatechange = function() {
        if ( this.readyState == 4 )
        {
          if ( this.status==200 )
          {
            try {
              var response = JSON.parse(this.responseText);
              if (response.error )
              {
                console.error("Error calling URL="+url+data+" ERROR="+response.error);
                callback( null );
              }
              else
                callback( response) ;
            } catch ( e) { callback(this.responseText); }
          }
          else 
          {
            if ( response && response.error )
              console.error("Error calling URL="+url+data+" ERROR="+response.error);
            else
              console.error("Error calling URL="+url+data+" ERROR=undefined");
            callback( null );
          }
        }
      };
      request.open("POST", url, true);
      request.setRequestHeader("X-Requested-With", "XMLHttpRequest");
      request.send(params); 
    }
  }
  catch ( error )
  {
    console.error("Network error opening: "+url+" ERROR: "+error.toString());
    callback( null );
  }
}

function validateUser(callback) {
  var spans = document.querySelectorAll("#Notifications span.nameYou");
  if ( spans.length==0 )
  {
    console.error("Couldn't find username from notifications.");
    userName = "Unknown";
    allianceTicker = "Unknown";
  }
  else
  {
    var dataStrs = spans[0].getAttribute("data").split("|");
    userName = dataStrs[0].substr(dataStrs[0].indexOf("=")+1);
    userId = parseInt(dataStrs[1]);
    allianceTicker = dataStrs[2];
    raceId = parseInt(dataStrs[4]);
  }

  fetchJSONData(extensionBaseURL+"login.php",
      {"username": userName, 
       "version": extensionVersion, 
       "ticker": allianceTicker},
      function(response) {
        if ( response==null )
        {
           if ( localStorage.getItem("ctValidationData_"+userName) )
             userVerified = localStorage.getItem("ctValidationData_"+userName);
        }
        else
        {
           userVerified = Number(response.authorized);
           localStorage.setItem("ctValidationData_"+userName, userVerified);
           troopCountBtn = Number(response.troopCount);
           localStorage.setItem("ctTroopCountBtn_"+userName, troopCountBtn);
           latestExtensionVersion = response.version;
        }
        callback.call();
      }
  );
}
  
function currentBasicResourceAmount(cityIndex, resourceIndex)
{
  var cityData = ctCityData.cities[cityIndex];
  if ( typeof cityData.resourceRefreshTime == 'undefined' ) return "??";
  var deltaT = new Date().getTime() - cityData.resourceRefreshTime;
  var amount = cityData.basicResourceStores[resourceIndex] +
    cityData.basicResourceRates[resourceIndex]*deltaT/3600000;
  return amount;
}
function currentAdvResourceAmount(cityIndex, resourceIndex)
{
  var cityData = ctCityData.cities[cityIndex];
  if ( typeof cityData.resourceRefreshTime == 'undefined' ) return "??";
  var deltaT = new Date().getTime() - cityData.resourceRefreshTime;
  var amount = cityData.advResourceStores[resourceIndex];
  if ( cityData.advResourceBuild[resourceIndex] &&
        cityData.advResourceRates[resourceIndex] )
    amount += cityData.advResourceRates[resourceIndex]*deltaT/3600000;
  return amount;
}
function convertNumber(value)
{
  if ( typeof value == 'undefined' ) return "??";
  else if ( value == '??' || value == '--' ) return value;
  if ( value > 99950000000)
    return (value/1000000000).toFixed(1)+"B"; // xxxB
  else if ( value > 9995000000)
    return (value/1000000000).toFixed(1)+"B"; // xx.xB
  else if ( value > 999500000)
    return (value/1000000000).toFixed(1)+"B"; // x.xB
  else if ( value > 99950000)
    return (value/1000000).toFixed(0)+"M"; // xxxM
  else if ( value > 9995000)
    return (value/1000000).toFixed(1)+"M"; // xx.xM
  else if ( value > 999500)
    return (value/1000000).toFixed(1)+"M"; // x.xM
  else if ( value > 99950)
    return (value/1000).toFixed(0)+"K"; // xxxK
  else if ( value > 9995)
    return (value/1000).toFixed(1)+"K"; // xx.xK
  else if ( value > 999)
    return (value/1000).toFixed(1)+"K"; // x.xK
  else if ( value > 99.5 )
    return Number(value).toFixed(0); // xxx
  else if ( value > 9.5 )
    return Number(value).toFixed(1); // xx.x
  else if ( value > 0 )
    return Number(value).toFixed(1); // xx.x
  else
    return Number(value).toFixed(0);
}
function convertTime(value) // milliseconds
{
  if ( typeof value == 'undefined' ) return "done";
  var delta = (value - new Date().getTime())/1000;
  return convertDeltaTime(delta);
}
function convertDeltaTime(delta) // in seconds
{
  if ( delta <= 0 ) return "done";
  else if ( delta > 86400 ) return (delta/86400).toFixed(2)+"d";
  else if ( delta > 3600 ) return (delta/3600).toFixed(2)+"h";
  else if ( delta > 60 ) return (delta/60).toFixed(2)+"m";
  else return (delta).toFixed(0)+"s";
}

function nearestCity(x, y)
{
  var minDist = -1;
  var city = null;
  for ( var i=0; i<ctCityData.cities.length; ++i )
  {
    var dist=Math.pow(x-ctCityData.cities[i].x,2)+Math.pow(y-ctCityData.cities[i].y,2);
    if ( dist<minDist || city==null )
    {
      minDist = dist;
      city = ctCityData.cities[i];
    }
  }
  return city;
}

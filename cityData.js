var ctCityData;

function initCityData()
{
  // Init the city data
  if ( localStorage.getItem("ctCityData_"+userName) )
  {
    console.debug("DS Sidekick - Loading saved city data");
    ctCityData = JSON.parse(localStorage.getItem("ctCityData_"+userName));
  }
  else
  {
    console.debug("DS Sidekick - creating new city data");
    ctCityData = new Object();
    ctCityData.prestigeTime = 0;
    ctCityData.cityNameMap = new Object();
    ctCityData.cities = new Array();
  }
  var cityDivs = document.querySelectorAll('#citiesMenu div.cityMenu');
  for ( var i=0; i<cityDivs.length; ++i )
  {
    var subDivs = cityDivs[i].querySelectorAll('div.cityMenu > div');
    var cityName = subDivs[0].firstChild.innerHTML.trim();
    ctCityData.cityNameMap[cityName] = i;
    if ( !ctCityData.cities[i] ) 
    {
      ctCityData.cities[i] = new Object();
      ctCityData.cities[i].incomingArmy = null;
      ctCityData.cities[i].eventTimes = new Array();
      ctCityData.cities[i].basicResourceStores = new Object();
      ctCityData.cities[i].basicResourceRates = new Object();
      ctCityData.cities[i].advResourceStores = new Object();
      ctCityData.cities[i].advResourceRates = new Object();
      ctCityData.cities[i].advResourceBuild = new Object();
      ctCityData.cities[i].sovData = new Object();
      ctCityData.cities[i].maxStorage = 0;
      ctCityData.cities[i].unitProductionEndTime = 0;
      ctCityData.cities[i].diploProductionEndTime = 0;
      ctCityData.cities[i].barracks = 0;
    }
    ctCityData.cities[i].id = cityDivs[i].getAttribute("data-townid");
    ctCityData.cities[i].name = cityName;
    ctCityData.cities[i].x = subDivs[1].firstChild.innerHTML.split("|")[0].trim();
    ctCityData.cities[i].y = subDivs[1].firstChild.innerHTML.split("|")[1].trim();
  }
  ctCityData.cities.splice(cityDivs.length, 
      ctCityData.cities.length-cityDivs.length)
  ctCityData.numCities = cityDivs.length;
  updatePopulation();
}
function getCityByName(name)
{
  for ( var i=0; i<ctCityData.cities.length; ++i )
    if ( ctCityData.cities[i].name == name ) 
      return ctCityData.cities[i];
}
function updatePopulation()
{
  var cityDivs = document.querySelectorAll('#citiesMenu div.cityMenu');
  for ( var i=0; i<cityDivs.length; ++i )
  {
    var subDivs = cityDivs[i].querySelectorAll('div.cityMenu > div');
    ctCityData.cities[i].population = 
      Number(subDivs[2].childNodes[2].innerHTML.replace(',',''));
  }
}

function saveCityData()
{
  localStorage.setItem('ctCityData_'+userName,JSON.stringify(ctCityData));
}  

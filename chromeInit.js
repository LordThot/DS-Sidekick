var userName = "";
var userId = "";
var raceId = "";
var allianceTicker = "";
var userVerified = -1;
var latestExtensionVersion = -1;
var extensionVersion = chrome.runtime.getManifest().version;
var extensionBaseURL = "https://weissoft.com/illyriad/";

/*
console.logCopy = console.log.bind(console);
console.log = function(data) {
  var timestamp = '['+Date.now()+'] ';
  this.logCopy(timestamp, data);
}
*/

console.log("DS Sidekick v"+extensionVersion+" - Init");


// Main Div
var ctDiv = document.createElement('div');
ctDiv.className = 'smallBorder';
ctDiv.style.position = "fixed";
ctDiv.style.bottom = "3px";
ctDiv.style.right = "5px";
validateUser(function () {
  if ( userVerified )
  {
    //ctDiv.style.overflow = "auto";
    ctDiv.id = "dsSidekick";
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if ( this.readyState==4 && this.status==200 )
      {
        ctDiv.innerHTML = this.responseText;
        //console.log("initTabs");
        initTabs();
        //console.log("initSummaryTab");
        initSummaryTab();
        //console.log("initToolsTab");
        initToolsTab(); // Tools has to happen before production for the options
        //console.log("initProductionTab");
        initProductionTab();
        //console.log("initMappingTab");
        initMappingTab();
        //console.log("initTradeTab");
        initTradeTab();
        //console.log("initArmyTab");
        initArmyTab();
        //console.log("TopNavListener");
        TopNavListener();
        //console.log("setDefaultSize");
        setDefaultSize();
      }
    };
    request.open("GET", chrome.extension.getURL("dom.html"), true);
    request.send("");

    document.body.appendChild(ctDiv);

    var injectScript = document.createElement('script');
    injectScript.src = chrome.extension.getURL("inject.js");
    injectScript.onload = function () { this.parentNode.removeChild(this); };
    (document.head||document.documentElement).appendChild(injectScript);
  }
  else
  {
    ctDiv.innerHTML = "Only works if you are in the Dominion.";
    document.body.appendChild(ctDiv);
  }
});

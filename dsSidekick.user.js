// ==UserScript==
// @name        DS Sidekick
// @namespace   http://chadweisshar.com/weisoft/illyriad
// @include     https://elgea.illyriad.co.uk/*
// @exclude     https://elgea.illyriad.co.uk/Account/*
// @version     1.0.3
// @grant       GM_getResourceText
// @grant       GM_xmlhttpRequest
// @grant       GM_addStyle
// @run-at      document-end
// @require     http://chadweisshaar.com/weissoft/illyriad/dsSidekick/v103/dom.js
// @require     http://chadweisshaar.com/weissoft/illyriad/dsSidekick/v103/utility.js
// @require     http://chadweisshaar.com/weissoft/illyriad/dsSidekick/v103/scraper.js
// @require     http://chadweisshaar.com/weissoft/illyriad/dsSidekick/v103/reporting.js
// @require     http://chadweisshaar.com/weissoft/illyriad/dsSidekick/v103/cityData.js
// @require     http://chadweisshaar.com/weissoft/illyriad/dsSidekick/v103/buildingData.js
// @require     http://chadweisshaar.com/weissoft/illyriad/dsSidekick/v103/armyData.js
// @require     http://chadweisshaar.com/weissoft/illyriad/dsSidekick/v103/sovData.js
// @require     http://chadweisshaar.com/weissoft/illyriad/dsSidekick/v103/tradeHubData.js
// @require     http://chadweisshaar.com/weissoft/illyriad/dsSidekick/v103/summaryTab.js
// @require     http://chadweisshaar.com/weissoft/illyriad/dsSidekick/v103/productionTab.js
// @require     http://chadweisshaar.com/weissoft/illyriad/dsSidekick/v103/toolsTab.js
// @require     http://chadweisshaar.com/weissoft/illyriad/dsSidekick/v103/armyTab.js
// @require     http://chadweisshaar.com/weissoft/illyriad/dsSidekick/v103/mappingTab.js
// @require     http://chadweisshaar.com/weissoft/illyriad/dsSidekick/v103/tradeTab.js
// @resource    dom_html http://chadweisshaar.com/weissoft/illyriad/dsSidekick/v103/dom.html
// @resource    inject_js http://chadweisshaar.com/weissoft/illyriad/dsSidekick/v103/inject.js
// @resource    style_css http://chadweisshaar.com/weissoft/illyriad/dsSidekick/v103/style.css
// ==/UserScript==

// Get username
var userName = "";
var userId = "";
var raceId = "";
var allianceTicker = "";
var userVerified = -1;
var extensionVersion = GM_info.script.version;
var latestExtensionVersion = -1;
var extensionBaseURL = "http://weissoft.com/illyriad/";

if ( window.top === window.self ) {

  console.log("DS Sidekick v"+extensionVersion+" - Init");

  validateUser(function() {
    // Main Div
    var ctDiv = document.createElement('div');
    ctDiv.className = 'smallBorder';
    ctDiv.style.position = "fixed";
    ctDiv.style.bottom = "3px";
    ctDiv.style.right = "5px";
    if ( userVerified )
    {
      ctDiv.style.overflow = "auto";
      ctDiv.id = "dsSidekick";
      ctDiv.innerHTML = GM_getResourceText("dom_html");
      document.body.appendChild(ctDiv);

      GM_addStyle(GM_getResourceText("style_css"));

      initTabs();
      initSummaryTab();
      initToolsTab(); // Tools has to happen before production for the options
      initProductionTab();
      initMappingTab();
      initTradeTab();
      initArmyTab();
      TopNavListener();
      setDefaultSize();

      var injectScript = document.createElement('script');
      injectScript.setAttribute("type", "application/javascript");
      injectScript.textContent = GM_getResourceText("inject_js");
      injectScript.onload = function () { this.parentNode.removeChild(this); };
      (document.head||document.documentElement).appendChild(injectScript);
    }
    else
    {
      ctDiv.innerHTML = "Only works if you are in the Dominion.";
      document.body.appendChild(ctDiv);
    }
  });
}
else {
  console.log("iframe detected: not loading.");
}

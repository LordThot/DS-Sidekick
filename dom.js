var ctCurMoveTarget;
function ctDivMove(e) {
  var ctDiv = document.getElementById(ctCurMoveTarget.getAttribute("target"));
  ctDiv.style.top = (e.clientY-ctCurMoveTarget.offsetY)+"px";
  ctDiv.style.left = (e.clientX-ctCurMoveTarget.offsetX)+"px";
}
function ctDivResize(e) {
  var ctDiv = document.getElementById("dsSidekick");
  switch ( ctDiv.side )
  {
  case "left":
    ctDiv.style.left = (e.clientX-ctDiv.offsetX)+"px";
    ctDiv.style.width = (ctDiv.startWidth-e.clientX+ctDiv.startX)+"px";
    break;
  case "right":
    ctDiv.style.width = (ctDiv.startWidth+e.clientX-ctDiv.startX)+"px";
    break;
  case "top":
    ctDiv.style.top = (e.clientY-ctDiv.offsetY)+"px";
    ctDiv.style.height = (ctDiv.startHeight-e.clientY+ctDiv.startY)+"px";
    break;
  case "bottom":
    ctDiv.style.height = (ctDiv.startHeight+e.clientY-ctDiv.startY)+"px";
    break;
  }
}
function dragBarMouseDown(e) {
  ctCurMoveTarget = this;
  this.offsetX = e.offsetX + this.offsetLeft;
  this.offsetY = e.offsetY + this.offsetTop + 8;
  document.addEventListener("mousemove", ctDivMove, true);
  document.addEventListener("mouseup", function(e) {
    document.removeEventListener('mousemove', ctDivMove, true);
  }, true);
  e.preventDefault();
}
function resizeMouseDown(e) {
  var ctDiv = document.getElementById("dsSidekick");
  ctDiv.side = this.getAttribute("side");
  ctDiv.offsetY = e.offsetY + this.offsetTop + 8;
  ctDiv.offsetX = e.offsetX + this.offsetLeft;
  ctDiv.startX = e.clientX;
  ctDiv.startY = e.clientY;
  ctDiv.startWidth = Number( ctDiv.style.width.substring(
      0, ctDiv.style.width.indexOf("px")));
  ctDiv.startHeight = Number( ctDiv.style.height.substring(
      0, ctDiv.style.height.indexOf("px")));
  document.addEventListener("mousemove", ctDivResize, true);
  document.addEventListener("mouseup", function(e) {
    document.removeEventListener('mousemove', ctDivResize, true);
  }, true);
  e.preventDefault();
}
function initTabs()
{
  var ctDiv = document.getElementById("dsSidekick");
  var dragBar = document.querySelectorAll("#mainDisplay div.dragBar")[0];//document.getElementById("dragBar");
  var leftResize = document.getElementById("leftResizeBar");
  var rightResize = document.getElementById("rightResizeBar");
  var topResize = document.getElementById("topResizeBar");
  var bottomResize = document.getElementById("bottomResizeBar");
  leftResize.addEventListener("mousedown", resizeMouseDown, true);
  rightResize.addEventListener("mousedown", resizeMouseDown, true);
  topResize.addEventListener("mousedown", resizeMouseDown, true);
  bottomResize.addEventListener("mousedown", resizeMouseDown, true);
  document.getElementById("resizeBtn").onclick = function() {
    if ( ctDiv.dockMode == "docked" )
    {
      dragBar.addEventListener("mousedown", dragBarMouseDown, true);
      dragBar.style.cursor = "move";
      leftResize.style.cursor = "w-resize";
      rightResize.style.cursor = "e-resize";
      topResize.style.cursor = "n-resize";
      bottomResize.style.cursor = "s-resize";
      ctDiv.dockMode = "free";
    }
    else
    {
      dragBar.removeEventListener("mousedown", dragBarMouseDown, true);
      dragBar.style.cursor = "default";
      leftResize.style.cursor = "default";
      rightResize.style.cursor = "default";
      topResize.style.cursor = "n-resize";
      bottomResize.style.cursor = "default";
      ctDiv.dockMode = "docked";
    }
    setDefaultSize();
    return false;
  };
  document.getElementById("openBtn").onclick = function() {
    document.getElementById("titleDisplay").style.display = "none";
    document.getElementById("mainDisplay").style.display = "inline-block";
    ctDiv.dockMode = "docked";
    setDefaultSize();
    return false;
  }
  document.querySelectorAll("#mainDisplay a.closeBtn")[0].onclick = function() {
    document.getElementById("titleDisplay").style.display = "block";
    document.getElementById("mainDisplay").style.display = "none";
    ctDiv.dockMode = "closed";
    setDefaultSize();
    return false;
  }
  if ( localStorage.getItem("ctdockModeSetting_"+userName) == "docked" )
    document.getElementById("openBtn").click();
  else if ( localStorage.getItem("ctdockModeSetting_"+userName) == "free" )
  {
    document.getElementById("openBtn").click();
    document.getElementById("resizeBtn").click();
  }

  if ( latestExtensionVersion > extensionVersion )
  {
    var button = document.getElementById("upgradeBtn");
    button.title = 
      "Upgrade from "+extensionVersion + " to " + latestExtensionVersion;
    button.style.display = "block";
    button.href = extensionBaseURL + "changelog.php";
  }
  if ( !ctDiv.dockMode )
    ctDiv.dockMode = "closed";
  setDefaultSize();

  var summaryTab = document.getElementById("summaryTab");
  summaryTab.onclick = selectTab;
  summaryTab.div = document.getElementById("summaryDiv");
  var prodTab = document.getElementById("productionTab");
  prodTab.onclick = selectTab;
  prodTab.div = document.getElementById("productionDiv");
  var toolsTab = document.getElementById("toolsTab");
  toolsTab.onclick = selectTab;
  toolsTab.div = document.getElementById("toolsDiv");
  var mappingTab = document.getElementById("mappingTab");
  mappingTab.onclick = selectTab;
  mappingTab.div = document.getElementById("MappingDiv");
  var tradeTab = document.getElementById("tradeTab");
  tradeTab.onclick = selectTab;
  tradeTab.div = document.getElementById("TradeDiv");
  var armyTab = document.getElementById("armyTab");
  armyTab.onclick = selectTab;
  armyTab.div = document.getElementById("ArmyDiv");
}
function setDefaultSize()
{
  var ctDiv = document.getElementById("dsSidekick");
  if ( ctDiv.dockMode == "docked" )
  {
    options=JSON.parse(localStorage.getItem("ctProductionSettings_"+userName));
    var numOptions = 0;
    for ( var i=0; i<options.length; ++i ) 
      if ( options[i] ) ++numOptions;
    var height = 20 + //Tab bar
      19 + //City names
      21 + // action buttons
      25*numOptions + // resources
      21 + // hubs
      25; // Scroll bar

    ctDiv.style.height = height+"px";
    ctDiv.style.width = "";
    ctDiv.style.top = "";
    ctDiv.style.left = "1020px";
    ctDiv.style.bottom = "3px";
    ctDiv.style.right = "5px";
  }
  else if ( ctDiv.dockMode == "free" )
  {
    ctDiv.style.left = "";
    ctDiv.style.width = "550px";
  }
  else if ( ctDiv.dockMode == "closed" )
  {
    ctDiv.style.top = "";
    ctDiv.style.height = "";
    ctDiv.style.left = "";
    ctDiv.style.width = "100px";
  }
  localStorage.setItem("ctdockModeSetting_"+userName, ctDiv.dockMode);
}
// onclick callback
function selectTab()
{
  var tabs = this.parentNode.getElementsByTagName('div');
  for ( var i=0; i<tabs.length; ++i )
  {
    if ( tabs[i].div )
    {
      tabs[i].className = 'sideTab';
      tabs[i].div.style.display = 'none';
    }
  }
  this.className = 'sideTab selected';
  this.div.style.display = 'block';
  updatePopulation();
}

/*
var ctDataComment;
for ( var i=0; i<dGVycmFpbg.length; ++i )
  ctDataComment += i+": "+trans(dGVycmFpbg[i].sb)+", ";
document.getElementById('dsSidekick').appendChild(
    document.createComment(ctDataComment));
*/

$(document).ajaxSuccess(function( evt, xhr, settings ) {
  if ( settings.url == "/World/MapData" )
  {
    document.getElementById('MapDataTransfer').appendChild(
      document.createComment(xhr.responseText));
  }
  else if ( settings.url.search("/World/MapCanvas/") != -1 )
  {
    var lineIndex = xhr.responseText.indexOf("var mapData = {");
    var lineEndIndex = xhr.responseText.indexOf("\n", lineIndex);
    document.getElementById('MapDataTransfer').appendChild(
      document.createComment(
        xhr.responseText.substring(lineIndex+14, lineEndIndex-2)));
  }
  else if ( settings.url.search("/Chat/Update") != -1 )
  {
    document.getElementById("ChatDataTransfer").appendChild(
      document.createComment(xhr.responseText));
  }
  else if ( settings.url.search("/Town/BuildSovereignStructure") != -1 )
  {
    var dsSidekick = document.getElementById('dsSidekick');
    var row = Number(dsSidekick.getAttribute('quickSovRowToClose'));
    if ( row >= 0 ) {
      var h3s = document.querySelectorAll("#sovAccordion h3");
      h3s[row].click();
      dsSidekick.setAttribute('quickSovRowToClose',-1)
    }
  }
});

window.addEventListener('message', function(evt) {
  if(evt && evt.data && evt.data.type == "ContentScriptChangeTown")
    ChangeTownFocus(evt.data.town);
})
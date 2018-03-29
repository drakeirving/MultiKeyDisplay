$(function() {
  let body = document.getElementsByTagName("body")[0];
  let imgKeyboard = document.getElementById("imgKeyboard");
  let oKeyboard = null;
  let fUserHasTyped = false;

  function GetKeyboard(file) {
    fetch(file)
      .then(data => data.json())
      .then(json => { oKeyboard = json; });
  }

  function GetKey(keyCode) {
    let oLayout = oKeyboard.Layout;
    let top = oLayout.length;
    let bottom = -1;
    let middle;
    while (top - bottom > 1) {
      middle = parseInt((top + bottom) / 2);
      if (oLayout[middle][0] < keyCode)
        bottom = middle;
      else
        top = middle;
    }
    return (oLayout[top][0] == keyCode) ? oLayout[top] : null;
  }

  function ShowKey(keyCode) {
    let fResult = false;
    HideHintUserToType();
    if (GetKeyOverlay(keyCode) === null) {
      let rgKey = GetKey(keyCode);
      let pxDefaultKeyWidth = Number(imgKeyboard.naturalWidth) / oKeyboard.Width;
      let pxDefaultKeyHeight = Number(imgKeyboard.naturalHeight) / oKeyboard.Height;
      if(rgKey != null) {
        if(rgKey[1].length != null) {
          for(let iKeyLocation = 0; iKeyLocation < rgKey[1].length; ++iKeyLocation){
            AppendOverlayAtLocation(keyCode, pxDefaultKeyWidth, pxDefaultKeyHeight, rgKey[1][iKeyLocation][0], rgKey[1][iKeyLocation][1], rgKey[1][iKeyLocation][2], rgKey[1][iKeyLocation][3]);
          }
        }else{
          AppendOverlayAtLocation(keyCode, pxDefaultKeyWidth, pxDefaultKeyHeight, rgKey[1], rgKey[2], rgKey[3], rgKey[4]);
        }
        fResult = true;
      }
    }
    return fResult;
  }

  function AppendOverlayAtLocation(keyCode, unitX, unitY, top, left, width, height) {
    $(`<img id='overlay${keyCode}'
        class='KeyDownOverlay'
        src='assets/KeyOverlay.gif'
        style='
          position: absolute;
          left: ${(1.0 + Math.round(unitX * top))}px;
          top: ${(1.0 + unitY * left)}px;
          width: ${(-1.0 + unitX * width)}px;
          height: ${(-1.0 + unitY * height)}px;
          opacity: 0.5;
        ' />`)
    .appendTo($("#divKeyboard"));
  }

  function HideKey(keyCode) {
    let fResult = false;
    let rgKey = GetKey(keyCode);
    if (rgKey != null) {
      GetKeyOverlay(keyCode).remove();
      if (rgKey[1].length != null) {
        for (let iKeyLocations = 1; iKeyLocations < rgKey[1].length; ++iKeyLocations){
          GetKeyOverlay(keyCode).remove();
        }
      }
      fResult = true;
    }
    return fResult;
  }

  function GetKeyOverlay(keyCode) {
    return document.getElementById(`overlay${keyCode}`);
  }

  function HandleKeyDown(event) {
    if (!fUserHasTyped) {
      HideHintUserToType();
      fUserHasTyped = true;
    }
    if (ShowKey(event.keyCode)){
      event.preventDefault();
    }
  }

  function HandleKeyUp(event) {
    if (HideKey(event.keyCode)){
      event.preventDefault();
    }
  }

  body.onkeydown = (event) => HandleKeyDown(event);
  body.onkeyup = (event) => HandleKeyUp(event);
  window.onfocus = () => HandleFocus();
  window.onblur = () => HandleBlur();

  function HandleFocus() {
    HideHintUserToType();
  }

  function HandleBlur() {
    document.querySelectorAll("#divKeyboard img[id^=overlay]").forEach(e => e.remove());
    ShowHintUserToType();
  }

  function ShowHintUserToType() {
    if (!fUserHasTyped) {
      ShowMessage("divTypeToUse", "Type To Use");
    }
  }

  function HideHintUserToType() {
    HideMessage("divTypeToUse");
  }

  function ShowMessage(idMessage, strMessage) {
    if ($("#" + idMessage).length == 0) {
      let messageWidth = 200;
      let messageHeight = 40;
      $(".MultiKeyDisplayMessage").each(function(i) {
        HideMessage(this.id)
      });
      $("<span id='" + idMessage + "' " + "class='MultiKeyDisplayMessage' " + "style='position:absolute; left:0px; top:0px; " + "width:" + imgKeyboard.naturalWidth + "px; " + "height:" + imgKeyboard.naturalHeight + "px; " + "background: grey; " + "filter:alpha(opacity=80); opacity:0.8;' >" + "<span " + "style='position:absolute; left:" + ((imgKeyboard.naturalWidth - messageWidth) / 2) + "px; " + "top:" + ((imgKeyboard.naturalHeight - messageHeight) / 2) + "px; " + "width:" + messageWidth + "px; " + "height:" + messageHeight + "px; " + "text-align:center; " + "font-size:24pt; " + "background: lightgrey;' >" + strMessage + "</span></span>").click(function() {
        window.focus();
      }).appendTo($("#divKeyboard"));
    }
  }

  function HideMessage(idMessage) {
    window.focus();
    $("#" + idMessage).fadeOut("normal", function() {
      $(this).remove();
    });
  }

  if (imgKeyboard.getAttribute("keyboardname") == "FullSizeDefault") {
    imgKeyboard.src = "assets/KeyboardFullSizeDefault.gif";
    GetKeyboard("assets/defaultFullSizeKeyMap.js");
  } else {
    imgKeyboard.src = "assets/KeyboardDefault.gif";
    GetKeyboard("assets/defaultKeyMap.js");
  }

  imgKeyboard.onload = () => { ShowHintUserToType(); };

});

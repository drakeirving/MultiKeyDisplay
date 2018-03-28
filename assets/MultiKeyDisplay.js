$(function() {
  let oKeyboard = null;

  function GetKeyboard(strFile) {
    $.getJSON({
      url: strFile,
      mimeType: "application/json",
      success: json => {
        oKeyboard = json;
        RefreshKeyboardView();
      }
    });
  }

  function RefreshKeyboardView() {}

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
    if (GetKeyOverlay(keyCode).length == 0) {
      let rgKey = GetKey(keyCode);
      let jqueryImage = $("#imgKeyboard");
      let pxDefaultKeyWidth = Number(jqueryImage.innerWidth()) / oKeyboard.Width;
      let pxDefaultKeyHeight = Number(jqueryImage.innerHeight()) / oKeyboard.Height;
      if (rgKey != null) {
        if (rgKey[1].length != null) {
          for (let iKeyLocation = 0; iKeyLocation < rgKey[1].length; ++iKeyLocation)
            AppendOverlayAtLocation(keyCode, pxDefaultKeyWidth, pxDefaultKeyHeight, rgKey[1][iKeyLocation][0], rgKey[1][iKeyLocation][1], rgKey[1][iKeyLocation][2], rgKey[1][iKeyLocation][3]);
        } else
          AppendOverlayAtLocation(keyCode, pxDefaultKeyWidth, pxDefaultKeyHeight, rgKey[1], rgKey[2], rgKey[3], rgKey[4]);
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
        for (let iKeyLocations = 1; iKeyLocations < rgKey[1].length; ++iKeyLocations)
          GetKeyOverlay(keyCode).remove();
      }
      fResult = true;
    }
    return fResult;
  }

  function GetKeyOverlay(keyCode) {
    return $("#overlay" + keyCode);
  }

  $("body").keydown(function(event) {
    HandleKeyDown(event)
  });

  function HandleKeyDown(event) {
    if (!fUserHasTyped) {
      HideHintUserToType();
      fUserHasTyped = true;
    }
    if (ShowKey(event.keyCode)){
      event.preventDefault();
    }
  }

  $(window).keyup(function(event) {
    HandleKeyUp(event)
  });

  $("body").keyup(function(event) {
    HandleKeyUp(event)
  });

  function HandleKeyUp(event) {
    if (HideKey(event.keyCode)){
      event.preventDefault();
    }
  }

  $(window).blur(HandleBlur);

  function HandleBlur() {
    $("#divKeyboard img[id^=overlay]").remove();
    ShowHintUserToType();
  }
  window.onfocus = function() {
    HandleFocus();
  };

  function HandleFocus(event) {
    HideHintUserToType();
  }
  let fUserHasTyped = false;

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
      let jqueryImage = $("#imgKeyboard");
      let messageWidth = 200;
      let messageHeight = 40;
      $(".MultiKeyDisplayMessage").each(function(i) {
        HideMessage(this.id)
      });
      $("<span id='" + idMessage + "' " + "class='MultiKeyDisplayMessage' " + "style='position:absolute; left:0px; top:0px; " + "width:" + jqueryImage.innerWidth() + "px; " + "height:" + jqueryImage.innerHeight() + "px; " + "background: grey; " + "filter:alpha(opacity=80); opacity:0.8;' >" + "<span " + "style='position:absolute; left:" + ((jqueryImage.innerWidth() - messageWidth) / 2) + "px; " + "top:" + ((jqueryImage.innerHeight() - messageHeight) / 2) + "px; " + "width:" + messageWidth + "px; " + "height:" + messageHeight + "px; " + "text-align:center; " + "font-size:24pt; " + "background: lightgrey;' >" + strMessage + "</span></span>").click(function() {
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

  $(".hoverButton").hover(function() {
    $(this).css("background-position", "0 -24px");
    $(window).unbind('blur');
  }, function() {
    $(this).css("background-position", "0 0");
    $(window).blur(HandleBlur);
  });

  $("#imgKeyboard").load(function() {
    $("#embedRegion").css("left", $("#imgKeyboard").width() - $("#embedRegion").width() + 1);
    ShowHintUserToType();
  });

  if ($("#imgKeyboard").attr("keyboardname") == "FullSizeDefault") {
    $("#imgKeyboard").attr("src", "assets/KeyboardFullSizeDefault.gif");
    GetKeyboard("assets/defaultFullSizeKeyMap.js");
  } else {
    $("#imgKeyboard").attr("src", "assets/KeyboardDefault.gif");
    GetKeyboard("assets/defaultKeyMap.js");
  }
});

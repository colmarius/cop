var AlbumDeleteDialogController = (function() {
  
  function handleDialogViewHide()
  {
    $("#dialogCloseButton").die( "click", handleClose );
    $("#dialogCancelButton").die( "click", handleClose );
    $("#dialogConfirmButton").die( "click", handleDelete );
    
    var docId = $("#dialogContent").data("identity");
    // var dialogCache = $(document.getElementById("_show/album-delete/" + docId));
    var dialogCache = $(document.getElementById("albumdelete"));
    dialogCache.unbind( "pagehide", handleDialogViewHide );
    dialogCache.empty();
    dialogCache.remove();
  }
  
  function handleDialogView()
  {
     // Watch for bound hide of page to clear from cache.
     var docId = $("#dialogContent").data("identity");
     // var dialogPage = $(document.getElementById("_show/album-delete/" + docId));
     var dialogPage = $(document.getElementById("albumdelete"));
     dialogPage.bind( "pagehide", handleDialogViewHide );
  }
  
  function handleClose( event )
  {
    event.preventDefault();
    var docId = $("#dialogContent").data("identity");
    $("#deleteButton").removeClass( "ui-btn-active" );
    $.mobile.changePage( $.mobile.path.origin + "_show/album/" + docId, "slide", true, true );
    return false;
  }
  
  function handleDelete( event ) 
  {
    event.preventDefault();
    var docId = $("#dialogContent").data("identity");
    // First open doc based on ID in order to get full document.
    $db.openDoc( docId, {
        success: function( document ) {
          // Then use the opened doc as reference to remove.
          $db.removeDoc( document, {
              success: function() {
                $.mobile.changePage( "#home", "slide", true, true );
              }
              ,error: function() {
                alert( "Could not remove document with id: " + docId ); 
              }
          });
        }
        ,error: function() {
          alert( "Could not find document with id:" + docId ); 
        }
    });
    return false;
  }
  
  return {
    initialize: function() {
      $("#dialogCloseButton").live( "click", handleClose );
      $("#dialogCancelButton").live( "click", handleClose );
      $("#dialogConfirmButton").live( "click", handleDelete );
      
      // Do pagebefore so when it is shown, it is filled correctly.
      $("div[data-role='page']").live( "pagebeforeshow", function() {
        $("div[data-role='page']").die( "pagebeforeshow" );  
        var docId = $("#dialogContent").data("identity");
        // var dialogPage = $(document.getElementById("_show/album-delete/" + docId));
        var dialogPage = $(document.getElementById("albumdelete"));
        var dialog = $("#albumdelete");
        var h = parseFloat(dialogPage.innerHeight());
        h -= ( parseFloat(dialog.css("border-top-width")) + parseFloat(dialog.css("border-bottom-width")) );
        // define the height based on innerHeight of wrapping parent page and the border styles applied to a dialog.
        dialog.css( "height", h + "px" );
      });
      
      $("div[data-role='page']").live( "pageshow", function() {
        $("div[data-role='page']").die( "pageshow" );
        handleDialogView();
      });
    }
  }
}());

function handleDialogReady() 
{
  AlbumDeleteDialogController.initialize();
}
$().ready( handleDialogReady );
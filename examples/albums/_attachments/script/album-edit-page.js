var AlbumEditPageController = (function() {
  
  var editableAlbum;
  
  function handleEditPageViewHide()
  {
    $("#cancelButton").die( "click", handleCancelEdit );
    $("#cancelBackButton").die( "click" );
    $("#submitButton").die( "click" );
    editableAlbum = null;
    
    var docId = $("#albumform").data("identity");
    // var pageCache = $(document.getElementById("_show/album-edit/" + docId));
    var pageCache = $(document.getElementById("albumedit"));
    pageCache.unbind( "pagehide", handleEditPageViewHide );
    pageCache.empty();
    pageCache.remove();
  }
  
  function handleEditView()
  {
    // Watch for bound hide of page to clear from cache.
    var docId = $("#albumform").data("identity");
    // var albumPage = $(document.getElementById("_show/album-edit/" + docId));
    var albumPage = $(document.getElementById("albumedit"));
    albumPage.bind( "pagehide", handleEditPageViewHide );
    
    storeUneditedDocument();
  }
  
  function navigateToAlbumPage( docId )
  {
    $("#editButton").removeClass( "ui-btn-active" );
    $.mobile.changePage( $.mobile.path.origin + "_show/album/" + docId, "slide", true, true );
  }
  
  function storeUneditedDocument()
  {
    var artist = $("input#artistField").val();
    var title = $("input#titleField").val();
    var description = $("textarea#descriptionField").val();
    editableAlbum = {artist:artist, title:title, description:description };
  }
  
  function saveDocument( document )
  {
    // Update a document.
    $db.saveDoc( document, {
      success: function( response ) {
        updateEditableAlbum( document );
        navigateToAlbumPage( document._id );
      }
      ,error: function() {
        alert( "Cannot save document: " + document._id );
      }
    });
  }
  
  function updateEditableAlbum( document )
  {
    editableAlbum.artist = document.artist;
    editableAlbum.title = document.title;
    editableAlbum.description = document.description;
  }
  
  function revertEdits()
  {
    $("input#artistField").val( editableAlbum.artist );
    $("input#titleField").val( editableAlbum.title );
    $("textarea#descriptionField").val( editableAlbum.description );
  }
  
  function handleCancelEdit()
  {
    revertEdits();
    var docId = $("#albumform").data("identity");
    navigateToAlbumPage( docId );
  }
  
  return {
    initialize: function() {
      $("#cancelButton").live( "click", handleCancelEdit );
      $("#cancelBackButton").live( "click", function( event ) {
        event.preventDefault();
        handleCancelEdit();
        return false;
      });
      $("#submitButton").live( "click", function( event ) {
        var docId = $("#albumform").data("identity");
        $db.openDoc( docId, {
          success: function( document ) {
            document.artist = $("input#artistField").val();
            document.title = $("input#titleField").val();
            document.description = $("textarea#descriptionField").val();
            saveDocument( document );
          }
          ,error: function() {
            alert( "Cannot open document: " + docId );
          }
        });
      });
      $("div[data-role='page']").live( "pageshow", function() {
        $("div[data-role='page']").die( "pageshow" );
        handleEditView();
      });
    }
  }
}());

function handleEditPageReady()
{
  AlbumEditPageController.initialize(); 
}

$().ready( handleEditPageReady );
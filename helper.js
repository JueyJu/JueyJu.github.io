jQuery.extend({

  getInfo: function(sUrl) {

    var result = null;

    $.ajax({
      type: "GET",
      url: sUrl,
      crossDomain: true,
      dataType: "json",
      async: false,
      success: function(oData) {
        result = oData
        
      },
      
      error: function() {
        console.log("error loading data");
      }
    });

    return result;
  }

});

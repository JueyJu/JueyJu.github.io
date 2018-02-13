// Load nem-browser library
var nem = require("nem-sdk").default;

// Create an NIS endpoint object
var endpoint = nem.model.objects.create("endpoint")(nem.model.nodes.defaultMainnet, nem.model.nodes.websocketPort);
var endpointT =  nem.model.objects.create("endpoint")(nem.model.nodes.defaultMainnet, nem.model.nodes.defaultPort);

console.log(endpointT);

// Address to subscribe
var address = "NDWVLV33AS67WIGXSYLIKYT33EYYQPYM2K3D5R2M";

// Create a connector object
var connector = nem.com.websockets.connector.create(endpoint, address);

// Try to establish a connection
connect(connector);

// Connect using connector
function connect(connector){
    return connector.connect().then(function() {
      // Set time
      date = new Date();
      console.log("launch");

        // Subscribe to errors channel
        nem.com.websockets.subscribe.errors(connector, function(res){
            // Set time
            date = new Date();
            // Show event
            
           console.log(JSON.stringify(res));
        });

        nem.com.websockets.subscribe.account.data(connector, function(res) {
          console.log(res);
        });

        // Subscribe to unconfirmed transactions channel
        nem.com.websockets.subscribe.account.transactions.unconfirmed(connector, function(res) {
            // Set time
            date = new Date();
            // Show event
            var amount = Number(document.getElementById("digitalAmount").innerHTML.split(" ")[0].replace(/\./g, ''));

            if(amount >= res.transaction.amount){

              $("#newPaymentModal").modal("hide");
              $("#confirmationModal").modal();
            }


            
        });

        // Subscribe to confirmed transactions channel
        nem.com.websockets.subscribe.account.transactions.confirmed(connector, function(res) {
            // Set time
            date = new Date();
            // Show event
            console.log("confirmed");
            console.log(res.transaction);
           
        });
          
    }, function(err) {
        // Set time
        date = new Date();
        console.log(JSON.stringify(err));
        // Try to reconnect
        reconnect();
    });
}

function reconnect() {
    // Replace endpoint object
    endpoint = nem.model.objects.create("endpoint")(nem.model.nodes.mainnet[1].uri, nem.model.nodes.websocketPort);
    // Replace connector
    connector = nem.com.websockets.connector.create(endpoint, address);
    // Set time
    date = new Date();
    // Show event
    console.log('Trying to connect to: '+ endpoint.host +'</p>');
    // Try to establish a connection
    connect(connector);
}

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

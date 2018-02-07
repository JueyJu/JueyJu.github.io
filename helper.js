// Load nem-browser library
var nem = require("nem-sdk").default;

// Create an NIS endpoint object
var endpoint = nem.model.objects.create("endpoint")(nem.model.nodes.defaultMainnet, nem.model.nodes.defaultPort);

// Address to subscribe
var address = "NDWVLV33AS67WIGXSYLIKYT33EYYQPYM2K3D5R2M";

nem.com.requests.account.data(endpoint, address).then(function(res) {
  console.log(res)
}, function(err) {
  console.error(err)
});
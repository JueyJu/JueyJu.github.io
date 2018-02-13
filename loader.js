// Load nem-browser library
var nem = require("nem-sdk").default;

// Create an NIS basic endpoint object
var endpoint = nem.model.objects.create("endpoint")(nem.model.nodes.defaultMainnet, nem.model.nodes.defaultPort);

// Address to subscribe
var address = "NDWVLV33AS67WIGXSYLIKYT33EYYQPYM2K3D5R2M";

var index = 1;

nem.com.requests.account.transactions.unconfirmed(endpoint, address).then(function(res){

	console.log(res.data.length);
	for(i=0; i<res.data.length; i++){
		processTransaction(res.data[i], "unconfirmed");	

	}

});

poll();

function poll(hash){
	nem.com.requests.account.transactions.incoming(endpoint, address, hash).then(function(res){

		for(i = 0; i<res.data.length; i++){
			processTransaction(res.data[i], "confirmed");
		}

		if(res.data.length-1 > 0) poll(res.data[res.data.length-1].meta.hash.data);
	});
}

function processTransaction(res, status){

	var timestamp = res.transaction.timeStamp;
	var nemEpoch = Date.UTC(2015, 2, 29, 0, 6, 25, 0);
	var datetime = new Date(nemEpoch + (timestamp * 1000));

	var cryptoamount = res.transaction.amount/10**6;

	var publicKey = res.transaction.signer;
	var address = nem.model.address.toAddress(publicKey, nem.model.network.data.mainnet.id);

	var virtualRates = $.getInfo("https://min-api.cryptocompare.com/data/pricemulti?fsyms=ETH,DASH,BTC,LTC,BCH,XEM&tsyms=USD,EUR");
    var physicalRates = $.getInfo("https://api.fixer.io/latest");
    var dollar = cryptoamount*virtualRates.XEM.EUR*physicalRates.rates.AUD;

	// Find a <table> element with id="myTable":
	var table = document.getElementById("myTable");

	// Create an empty <tr> element and add it to the 1st position of the table:
	var row = table.insertRow(index++);

	// Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
	var date = row.insertCell(0);
	var addr = row.insertCell(1);
	var cryptoAmt = row.insertCell(2);
	var aud = row.insertCell(3);
	var confirmed = row.insertCell(4);

	// Add some text to the new cells:
	date.innerHTML = datetime;
	addr.innerHTML = address;
	cryptoAmt.innerHTML = cryptoamount;
	aud.innerHTML = dollar.toFixed(2);
	confirmed.innerHTML = status;
	
}

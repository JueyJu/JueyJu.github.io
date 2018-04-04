
// Initialize Firebase
var config = {
    apiKey: "AIzaSyC5rQHrknPJAoa0Vh4-Ud2u7GSnboLFylE",
    authDomain: "merchantsigning-701b2.firebaseapp.com",
    databaseURL: "https://merchantsigning-701b2.firebaseio.com",
    projectId: "merchantsigning-701b2",
    storageBucket: "merchantsigning-701b2.appspot.com",
    messagingSenderId: "1086605522432"
};
firebase.initializeApp(config);

var database = firebase.database();

var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

var validMerchants = ["NomNom", "Royal Black"];
var validCurrencies = ["Bitcoin", "Ether", "Litecoin", "Dash"];

var chartData = [{"label":"Bitcoin", "value":0},{"label":"Litecoin","value":0},{"label":"Dash","value":0},{"label":"Ether","value":0}];
index = 0;

var pendingDict = {};
var count = 0;

var pass = "tbb<3";

var savedTransactions = {};
var currentId = "";

var dataTable = $('#transactionList').DataTable({
    "order": [[0, "desc"]],
    "aoColumnDefs": [{"sType": "date","aTargets": [0]}]
});


function writeUserData(transactionId, date, merchant, amount, coin, signer) {
  firebase.database().ref('transactionId/' + transactionId).set({
    date: date,
    merchant: merchant,
    amount: amount,
    coin: coin,
    signer: signer
  });
}

function readUserData(){
    return firebase.database().ref('transactionId').once('value').then(function(snapshot) {
        return snapshot.val();
    });
}

function updateSignee(txid){
    currentId = txid;
    $("#signeeModal").modal();
}

function genRandomName(){
    var index1 = Math.floor(Math.random()*12);
    var index2 = Math.floor(Math.random()*12);
    return adjectives[index1] + " " + animal[index2];
}

function getCurrentDate(){
    var timeStamp = new Date(); 
    var date = timeStamp.getDate().toString() + " ";
    date += months[timeStamp.getMonth()] + " ";
    date += (timeStamp.getFullYear() - 2000).toString() + " ";
    date += timeStamp.getHours().toString() + ":" + timeStamp.getMinutes().toString();

    return date
}

function compareDate(date){
    timeStamp = getCurrentDate();

    var cur = timeStamp.split(" ");
    var comp = date.split(" ");

    //compare year
    if(parseInt(comp[2]) < parseInt(cur[2])){
        return false;
    }

    //compare month
    else if(months.indexOf(comp[1]) < months.indexOf(cur[1])){
        return false;
    }

    else if((parseInt(cur[0]) - parseInt(comp[0])) > 2){
        return false;
    }

    //signed before the end of the day
    else{
        return true;
    }
}

function submit(){
   var validate = document.getElementById("sign").value;
   
    if(validate){
        $('#pushButton').attr('disabled',false);
    }else{
        document.getElementById("pushButton").setAttribute('disabled', 'disbaled');
    }
}

function genChartData(bill){
 
    for(var i=0; i<chartData.length; i++){
        if(chartData[i].label == bill.actualAsset){
            chartData[i].value += bill.amount; 

        }
    }
}

function validate(){
    
    var validate = document.getElementById("5DigitCode").value;

    if(validate == pass){
        document.getElementById("sign").removeAttribute('disabled');
    }else{
        document.getElementById("sign").setAttribute('disabled', 'disbaled');
    }
}

function push(){
    var txid = currentId.getAttribute('id');
    var signee = document.getElementById('sign').value;

    writeUserData("STx" + Object.keys(savedTransactions).length, pendingDict[txid].date, pendingDict[txid].merchant, 
        pendingDict[txid].amount, pendingDict[txid].coin, signee);

    currentId.replaceWith(signee);

    $("#signeeModal").modal("hide");
}

function openWebsocket() {

    dataTable.clear().draw();
    var ws = new WebSocket("wss://www.livingroomofsatoshi.com/merchanttxs");
    var ping = function () {};

    ws.onopen = function () {

        // Web Socket is connected, send data using send()
        ws.send("ping");

        ping = setInterval(function () {
            ws.send("ping");
        }, 25000) //Ping to overcome Heroku's 30 second request timeout.
    };

    ws.onmessage = function (evt) {

        var bill = JSON.parse(evt.data);

        if(bill.merchant.split('-')[0] == "Cater Care " || validMerchants.indexOf(bill.merchant) > -1){

            genChartData(bill);

            for(var j=0; j<Object.keys(savedTransactions).length; j++){

                var key = "STx" + j;

                if(savedTransactions[key].date == bill.date
                    && savedTransactions[key].merchant == bill.merchant
                    && savedTransactions[key].amount == bill.amount
                    && savedTransactions[key].coin == bill.actualAsset){

                    var rowNode = dataTable
                        .row.add([bill.date, bill.amount, bill.actualAsset, savedTransactions[key].signer])
                        .draw()
                        .node();
                    
                }else if(j == Object.keys(savedTransactions).length - 1){
                    if(!compareDate(bill.date)){
                        var rowNode = dataTable
                            .row.add([bill.date, bill.amount, bill.actualAsset, "Anonymous"])
                            .draw()
                            .node();
                    }else{
                        var vaildationButton  = '<button type="button" class="btn btn-primary"' 
                            + 'id="tx'+index+'" onclick="updateSignee(tx'+index+')">Sign</button>';

                        var tag = "tx" + index;

                        pendingDict[tag] = {"date": bill.date,
                                "merchant": bill.merchant,
                                "amount": bill.amount,
                                "coin": bill.actualAsset};

                        index++;

                        var rowNode = dataTable
                            .row.add([bill.date, bill.amount, bill.actualAsset, vaildationButton])
                            .draw()
                            .node();
                    }
                }
            }

            change(chartData);
        }          
    };

    ws.onclose = function () {
        // websocket is closed.
        clearInterval(ping);
        openWebsocket();
    };

    window.onbeforeunload = function (event) {
        socket.close();
    };
}

if ("WebSocket" in window) {
    document.getElementById("sign").setAttribute('disabled', 'disbaled');
    document.getElementById("pushButton").setAttribute('disabled', 'disbaled');

    readUserData().then(function(val){
        savedTransactions = val;
    });

    openWebsocket();



} else {
    // The browser doesn't support WebSocket
    alert("WebSocket NOT supported by your Browser!");
}
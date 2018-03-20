
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

var adjectives = ["Spicy", "Sleepy", "Saucy", "Tame", "Eager", "Awkward", "Keen", "Ambitious", "Loyal", "Decent", "Good", "Livid"];
var animal = ["Doggo", "Cat", "Moose", "Tiger", "Turtle", "Lion", "Ant Eater", "Swallow", "Dragon", "Rooster", "Deer", "Sheep"];

var pass = "tbb<3";

var transactions = []; 
var index = 0;
var currentId = "";

var dataTable = $('#transactionList').DataTable({
    "order": [[0, "desc"]]
});

function writeUserData(transactionId, signer) {
  firebase.database().ref('transactionId/' + transactionId).set({
    signer: signer
  });
}

function readUserData(transactionId){
    return firebase.database().ref('transactionId/' + transactionId + '/signer').once('value').then(function(snapshot) {
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

    else if((parseInt(cur[0]) - parseInt(comp[0])) > 0){
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
    writeUserData(txid, signee);
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
        
        transactions.push(bill);

        for(var i=index; i<transactions.length; i++){
            readUserData("tx"+i.toString()).then(function(val){

                if(val == null){
                    if(!compareDate(bill.date)){
                        var rowNode = dataTable
                            .row.add([bill.date, bill.merchant, bill.amount, bill.actualAsset, bill.status, genRandomName()])
                            .draw()
                            .node();
                    }else{
                        var vaildationButton  = '<button type="button" class="btn btn-primary"' 
                            + 'id="tx'+i+'" onclick="updateSignee(tx'+i.toString()+')">Sign</button>';

                        var rowNode = dataTable
                            .row.add([bill.date, bill.merchant, bill.amount, bill.actualAsset, bill.status, vaildationButton])
                            .draw()
                            .node();
                    }
                    
                }else{
                    var rowNode = dataTable
                        .row.add([bill.date, bill.merchant, bill.amount, bill.actualAsset, bill.status, val])
                        .draw()
                        .node();
                }
                                
            });
            index = i+1;
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

    openWebsocket();

} else {
    // The browser doesn't support WebSocket
    alert("WebSocket NOT supported by your Browser!");
}
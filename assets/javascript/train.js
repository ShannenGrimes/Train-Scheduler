$(document).ready(function() {
    
  // Your web app's Firebase configuration
  
  var firebaseConfig = {
    apiKey: "AIzaSyC-vsHCO84y7LfP9cR9WSuz1K0ugYZNz7U",
    authDomain: "train-scheduler-42b13.firebaseapp.com",
    databaseURL: "https://train-scheduler-42b13.firebaseio.com",
    projectId: "train-scheduler-42b13",
    storageBucket: "train-scheduler-42b13.appspot.com",
    messagingSenderId: "138381681204",
    appId: "1:138381681204:web:7e49cb9cd47a55220b2061"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  
  // Variables
  var database = firebase.database();
  var ref = "https://train-scheduler-42b13.firebaseio.com";
  // -------------------------------------------------------------- (CRITICAL - BLOCK) --------------------------- //
  // connectionsRef references a specific location in our database.
  // All of our connections will be stored in this directory.
  var connectionsRef = database.ref("/connections");
  var connectedRef = database.ref(".info/connected");
    console.log(fireDatabase)
  // When the client's connection state changes...
  connectedRef.on("value", function(snap) {
    // If they are connected..
    if (snap.val()) {
      // Add user to the connections list.
      var con = connectionsRef.push(true);
    // Remove user from the connection list when they disconnect.
      con.onDisconnect().remove();
    }
  });
  // When first loaded or when the connections list changes...
  connectionsRef.on("value", function(snapshot) {
    // Display the viewer count in the html.
    // The number of online users is the number of children in the connections list.
    $("#watchers").text(snapshot.numChildren());
  });
  $.ajax({
    url: "https://train-scheduler-42b13.firebaseio.com",
    timeout: 4000
  });

  var inputTrain;
  var inputDestination;
  var inputFirstTrain;
  var inputFreq;
  var inputNow;
  var nextArrival;
  var minsAway;

  //   Functions to calculate the time
  function calcMinutesElapsed() {
    var convertedFirstTrainTime = moment(inputFirstTrain, "HH:mm").subtract(
      1,
      "years"
    );
    return moment().diff(moment(convertedFirstTrainTime), "minutes");
  }
  function calcminsAway(minutesElapsed, inputFreq) {
    return (
      parseInt(inputFreq) - (parseInt(minutesElapsed) % parseInt(inputFreq))
    );
  }

  function calcNextArrival(minsAway) {
    return moment()
      .add(minsAway, "m")
      .format("hh:mm A");
  }

  // Create event listener for button and also update html
  $("#submitBtn").on("click", function(event) {
    event.preventDefault();

    // Update html with user input
    inputTrain = $("#trainName")
      .val()
      .trim();
    inputDestination = $("#destination")
      .val()
      .trim();
    inputFirstTrain = $("#firstTrainTime")
      .val()
      .trim();
    inputFreq = $("#frequency")
      .val()
      .trim();
    inputNow = new Date();

    //Calculate the amount of time since the first train's arrival
    var minsFromFirstTrain = calcMinutesElapsed();
    console.log(
      "Total minutes elapsed since the first train arrived: " +
        minsFromFirstTrain
    );

    //Calculate how many minutes away is the next train
    minsAway = calcminsAway(minsFromFirstTrain, inputFreq);
    console.log("The next train will be here in: " + minsAway + " minutes.");

    //Whenever current time matches next arrival time
    if (minsAway === parseInt(inputFreq)) {
      minsAway = 0;
    }

    //Calculate the next arrival's time
    nextArrival = calcNextArrival(minsAway);
    console.log("The next train will be here at: " + nextArrival);

    //Create a new local "temporary" object for holding train data
    var newTrain = {
      dataTrainName: inputTrain,
      dataDestination: inputDestination,
      dataFirstTrainTime: inputFirstTrain,
      dataFrequency: inputFreq,
      dataTimeAdded: inputNow,
      dataNextArrival: nextArrival,
      dataminsAway: minsAway
    };

    //Adding information to the Firebase database
    firebase
      .database()
      .ref()
      .push(newTrain);

    //Log everything from the database
    console.log("Your train's name is: " + newTrain.dataTrainName);
    console.log("Your train's destination is: " + newTrain.dataDestination);
    console.log("Your train first arrived at: " + newTrain.dataFirstTrainTime);
    console.log("Your train's frequency is every " + newTrain.dataFrequency + " minutes.");
    console.log("Your train's was added at: " + newTrain.dataTimeAdded);

    //Alert
    alert("Your train was successfully added to the Schedule");
  });
  //Capturing new data that has been added to the database
  firebase.database().ref().on("child_added", function(childSnapshot) {

    //Store everything inoto a variable
    var name = childSnapshot.val().dataTrainName;
    var dest = childSnapshot.val().dataDestination;
    var freq = childSnapshot.val().dataFrequency;
    var first = childSnapshot.val().dataFirstTrainTime;
    var now = childSnapshot.val().dataTimeAdded;
    var next = childSnapshot.val().dataNextArrival;
    var away = childSnapshot.val().dataminsAway;

    //Create a variable that HOLDS the new row
    var newRowItem = $("<tr><td>" + name + "</td><td>" + dest + "</td><td>" + freq + "</td><td>" + next + "</td><td>" + away + "</td></tr>");

    //Get the table and add new row to table at the end
    $("table tbody").append(newRowItem);

}); 

});

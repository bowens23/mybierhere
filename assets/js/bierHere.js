// Initialize Firebase
var config = {
  apiKey: "AIzaSyDvb4GGuWEBtXj2HkuNi2rwPtsw-rR6NO8",
  authDomain: "practiceuserauthentication.firebaseapp.com",
  databaseURL: "https://practiceuserauthentication.firebaseio.com",
  projectId: "practiceuserauthentication",
  storageBucket: "practiceuserauthentication.appspot.com",
  messagingSenderId: "333032893466"
};

firebase.initializeApp(config);

var database = firebase.database();
var email ="";
var password = "";
var auth= firebase.auth();
var user = firebase.auth().currentUser;

//on click event for submitting login credentials
$("#submit-button").on("click", function(event) {
  event.preventDefault();

  // capturing the form values for login email and password
  //will need to add form validation later
  email = $("#inputEmail").val().trim();
  password = $("#inputPassword").val().trim();

  //checking if values are being logged; will delete later
  console.log(email);
  console.log(password);

  auth.signInWithEmailAndPassword(email,password);
  //  function(errorObject) {
  //  console.log("Errors handled: " + errorObject.code);
  // };
  // $("#inputEmail").empty();
  // $("#inputPassword").empty();

});

$(".sign-up-link").on("click", function(event) {
  console.log("sign up form clicked");
  // $("#sign-up-form").show();

});

//need to change this click event for a different form that will sign the user up
$("#signup-button").on("click", function(event) {
  event.preventDefault();

  // capturing the form values for login email and password
  //To Do: add form validation later
  email = $("#signupEmail").val().trim();
  password = $("#signupPassword").val().trim();
  confirmPassword = $("#signupConfirmPassword").val().trim();
  var atpos = email.indexOf("@");
  var dotpos = email.lastIndexOf(".");

  if (atpos<1 || dotpos<atpos+2 || dotpos+2>=email.length) {
    $("#email-validate-status").html("Not A Valid Email Address")
    return false;
  }

  if (password.length < 6) {
    $("#validate-status").empty().html("Password Must Be At Least 6 Characters In Length");
    return false;
  }

  if ( password == confirmPassword) {


    $("#validate-status").empty().html("Passwords Match, Your Account Has Been Created");
    auth.createUserWithEmailAndPassword(email, password).then(function(){
      window.location.href = "./index.html";
    });
    // window.location.href = "./index.html";

    // function(errorObject) {
    //  console.log("Errors handled: " + errorObject.code);

    // };
  } else {
    console.log("passwords don't match");
    //var passwordError = $("<p>").html("Passwords Don't Match")
    $("#validate-status").empty().html("Passwords Don't Match");
  }

});

//add a realtime listener
firebase.auth().onAuthStateChanged(function(user) {

  if (user) {
    console.log(user);
    $(".log-out").show();
    $(".dropdown-toggle").hide();
    $(".navbar-text").html("Welcome " + user.email);

  } else {
    console.log("not logged in");
    //To Do: hide logout button
    $(".log-out").hide();
    $(".navbar-text").html("Already have an account?");

  }

});

//need to have logout button click event
$(".log-out").on("click", function(event) {
  event.preventDefault();
  firebase.auth().signOut();
  $(".log-out-button").hide();
  $(".dropdown-toggle").show();
});

 // dynamically changing the inner html of the main panel to create a sign up form
$(".sign-up-form").on("click", function(event) {
      event.preventDefault();
 //  $("#main-title").html("Sign Up Form");
 // $("#main-panel").html("dynamically created sign up form will go here");
});

$("#add-search").on("click", function(e) {
  // Don't refresh the page!
  e.preventDefault();
  var zip = $("#zip-input").val().trim();
  var city = $("#city-input").val().trim();
  var state = $("#state-input").val().trim();

  console.log(zip, city, state)

  if (zip) queryAPIBy({zip: zip} , initMap);

  if (city && state) queryAPIBy({city: city, state: state} , initMap)
});

// Get beers from a brewery: queryAPIBy({brewery: 'Unibroue'}, callbackFunc)
// Query by city: queryAPIBy({city: 'akron', state: 'ohio'}, callbackFunc)
// query by zipcode: queryAPIBy({zip: '44113'}, callbackFunc)
function queryAPIBy(options, callback) {

  // this does nothing currently, but i may need to set
  // defaults for the options object later
  var defaults = {
    zip: null,
    city: null,
    state: null,
    brewery: null
  }

  var options = Object.assign(defaults, options)

  var key = 'ef6233841a88d451b69d43089bd4b81a'

  if (options.zip) {
    var url = '/locations/?key=' + key
    var params = {
      postalCode: options.zip
    }
    var collectingFunc = collectLocations
  }

  if (options.brewery) {
    var url = '/search/?key=' + key
    var params = {
      q: options.brewery,
      type: 'beer'
    }
    var collectingFunc = collectBeers
  }

  if (options.city && options.state) {
    var url = '/locations/?key=' + key
    var params = {
      locality: options.city,
      region: options.state
    }
    var collectingFunc = collectLocations
  }

  var returnData = []

  axios.get(url, {
    // we use cors-anywhere here to get around same origin restriction that
    // breweryDB has on their API
    baseURL: 'https://cors-anywhere.herokuapp.com/https://api.brewerydb.com/v2',
    params : params
  })
    .then(function (res) {
      var data = res.data.data
      data.forEach(collectingFunc)
      callback(returnData)
    })

  function collectLocations (brewery) {
    returnData.push({
      name: brewery.brewery.name,
      description : brewery.brewery.description || "No description available",
      lat: brewery.latitude,
      lon: brewery.longitude,
    })
  }

  function collectBeers(beer) {
    returnData.push({
      name: beer.name,
      description: beer.description
    })
  }

}


// Should be used like this: queryAPIBy({zip: 44113} , plotlocations)
function initMap(locations) {
  // do map plotting here
  // will run after the api call finishes
  var map;
  var bounds = new google.maps.LatLngBounds();
  var mapOptions = {
    mapTypeId: 'roadmap'
  };

  // Display a map on the page
  map = new google.maps.Map(document.getElementById("map"), mapOptions);
  map.setTilt(45);

  // Display multiple markers on a map
  var infoWindow = new google.maps.InfoWindow(), marker, i;
  var infoWindowContent = [];

  // Loop through our array of markers & place each one on the map
  for( i = 0; i < locations.length; i++ ) {
    var queryURL = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + locations[i].lat + ","
      + locations[i].lon + "&sensor=true" ;
    var locationName = locations[i].name;
    var locationDescription = locations[i].description;
    (function(thisName, thisDescription){
      $.ajax({
        url: queryURL,
        method: "GET"
      }).done(function(response) {
        address = response.results[0].formatted_address || "Cannot find address."
        infoWindowContent.push(
          '<div class="info_content">' +
            '<h3>' + thisName + " " + "%RATING%/5" + '</h3>' +
            '<h5>' + address + '</h5>' +
            '<p>' + thisDescription + '</p>' + '</div>');
      });
    }(locationName, locationDescription))

    var position = new google.maps.LatLng(locations[i].lat, locations[i].lon);
    bounds.extend(position);
    marker = new google.maps.Marker({
      position: position,
      map: map,
      title: locations[i].name
    });

    // Allow each marker to have an info window
    google.maps.event.addListener(marker, 'click', (function(marker, i) {
      return function() {
        // infoWindow.setContent(infoWindowContent[i][0]);
        infoWindow.setContent(infoWindowContent[i]);
        infoWindow.open(map, marker);
        infoWindow.close

        // on click we get the beers from the brewery
        var brewery = locations[i].name
        queryAPIBy({brewery: brewery}, function (beers) {
          ratingHolder.name = brewery
          // clear it out
          beerlist.beers = []
          beers.forEach(function (beer) {
            if(!beer.description){
              beer.description = "We don't have a descriptions for this beer"
            }
            beerlist.beers.push({name: beer.name, description: beer.description})
          })
        });

        getRating(brewery, function (rating) {
          if (isNaN(rating)) {
            var rating = '?'
          }
          infoWindow.setContent(infoWindowContent[i].replace(/%RATING%/, rating));
        })
      }
    })(marker, i));

    google.maps.event.addListener(infoWindow, 'closeclick', function () {
      // this fires the same amount of times as there are markers on the map...
      beerlist.beers = []
      ratingHolder.name = false
    })

    // Automatically center the map fitting all markers on the screen
    map.fitBounds(bounds);
  }

  // Override our map zoom level once our fitBounds function runs (Make sure it only runs once)
  var boundsListener = google.maps.event.addListener((map), 'bounds_changed', function(event) {
    this.setZoom(14);
    google.maps.event.removeListener(boundsListener);
  });
}

function getRating(name, callback) {
  // firebase cannot have # $ [ or ] in it
  // this regex looks for a period, hash, dollar, left of right bracket
  // and "replaces" them with nothing, so it deletes them
  var name = name.replace(/\.|#|$|\[|\]/g, "")
  var ratings = []
  firebase.database().ref(name).once('value')
    .then(function(snapshot) {
      for (var value in snapshot.val()) {
        ratings.push(snapshot.val()[value].rating)
      }
      callback(average(ratings))
    })

  function average(array) {
    return ((array.reduce(function(acc, val) {
      return acc + val;
    }, 0)) / array.length).toFixed(1);
  }

}

function addRating(name, rating) {
  firebase.database().ref(name).push({rating: rating})
}

// VUE
var beerlist = new Vue({
  el: '#beerlist',
  data: {
    beers: [

    ]
  }
})

Vue.component('beer-item', {
  props: ['beer'],
  methods: {
    toggle: function () {
      this.show = !this.show
    }
  },
  data: function () {
    return { show: false }
  },
  template: '<div>' +
    '<li v-on:click="toggle" class="beertitle"> {{ beer.name }}</li>' +
    '<p v-show="show" class="beer"> {{ beer.description }} </p>' +
    '</div>'
})


Vue.component('rating-box', {
  props: ['name', 'number'],
  methods: {
    sendRating: function () {
      addRating(this.name, this.number)
    }
  },
  template: '<button class="btn btn-default" v-on:click="sendRating()" v-show="name"> {{ this.number }} </button>'
})

var ratingHolder = new Vue({
  el: '#rating',
  data: {
    name: false,
  }
})

//* ==========Model=============*//

// Initial Markerations
var resorts = [
        {
          name: 'Sugar Mountain',
          gpsloc:
          {lat: 36.129954,
           lng: -81.856974},
          locInfo: 'http://www.skisugar.com',
          apiLoc:'lat=36.129954&lon=-81.856974',
          icon: 'images/sugar-sm.png'
        },
        {
          name: 'Beech Mountain Ski Resort',
          gpsloc:
          {lat: 36.194678,
           lng: -81.877995},
          locInfo: 'https://www.beechmountainresort.com',
          apiLoc:'lat=36.194678&lon=-81.877995',
          icon: 'images/beech-sm.png'
        },
        {
          name: 'Appalachin Mountain Ski Resort',
          gpsloc:
          {lat: 36.17441,
           lng: -81.662557},
          locInfo: 'https://www.appskimtn.com',
          apiLoc:'lat=36.17441&lon=-81.8662557',
          icon: 'images/app-sm.png'
        },
        {
          name: 'Wolf Ridge Ski Resort',
          gpsloc:
          {lat: 35.955098,
           lng: -82.509046},
          locInfo: 'http://www.skiwolfridgenc.com',
          apiLoc:'lat=35.955098&lon=-82.509046',
          icon: 'images/wolf-sm.png'
        },
        {
          name: 'Cataloochee Ski Resort',
          gpsloc:
          {lat: 35.562438,
           lng: -83.089964},
          locInfo: 'http://cataloochee.com',
          apiLoc:'lat=35.562438&lon=-83.089964',
          icon: 'images/cat-sm.png'
        },
        {
          name: 'Sapphire Valley',
          gpsloc:
          {lat: 35.125059,
           lng: -83.057587},
          locInfo: 'http://www.skisapphirevalley.com',
          apiLoc:'lat=35.125059&lon=-83.057587',
          icon: 'images/sapphire-sm.png'
        },
];

// Set Map Varibles:
var map;
var mapCenter = {lat: 35.900000, lng: -82.509046};
var marker;
var infoWindow;
var content;
var weather;
var main;
var filter;

//Create Map canvas and other map features
function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: mapCenter,
        zoom: 8,
        mapTypeId: google.maps.MapTypeId.TERRAIN,
        mapTypeControl: true,
        mapTypeControlOptions: {
          style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
          position: google.maps.ControlPosition.TOP_RIGHT,
        }
});


// Set InfoWindow Varible:
  infoWindow = new google.maps.InfoWindow();

// Set observable data for Viewmodel:
function Resort(data) {
  var self = this;
  self.name = ko.observable(data.name);
  self.locInfo = ko.observable(data.locInfo);
  self.gpsloc = ko.observable(data.gpsloc);
  self.icon = ko.observable(data.icon);
  self.apiLoc = ko.observable(data.apiLoc);
}


//* ==========ViewModel=============*//
function ViewModel() {

    var self = this;

    // Empty list to store markers:
    self.markers = [];

    //Put Satic data into a observableArray:
    self.resortList = ko.observableArray(resorts);

    // AJAX request to OPENWEATHERMAP to retieve current waether conditions:
function openweatermapPulls(resortItem) {
    $.ajax({
    method: "GET",
    dataType: "jsonp",
    url: "http://api.openweathermap.org/data/2.5/weather?" + resortItem.apiLoc + "&units=imperial&APPID=2ef066aedbd9cd92b994cc095a7dbddc",
    })
    .done(function(data) {
    weather = data.weather;
    main = data.main;
    console.log(weather);
    console.log(main);
        // Set infoWindo content for successful AJAX request:
        infoWindow.setContent('<div class="infowindow">' +
          '<div class="info_wrapper">' +
              '<h3>' + resortItem.name + '</h3>' +
              '<p><b>Current Conditions: '+ data.weather[0].main + '</b> <br>' + '<b> Description: ' + data.weather[0].description + '</b></p>' +
              '<p><b>Current Temp: '+ data.main.temp + 'C</b></p>' +
              '<b>Website:<a href=' + resortItem.locInfo + '>' + resortItem.locInfo + '</a></b><br>' +
              '<b>Data provided by openweathermap:<a href="https://openweathermap.org"</a>www.openweathermap.org</b>' +
          '</div>' +  // end info_wrapper
          '</div>'); // end infowindow div class
        infoWindow.open(map, resortItem.marker);
        // map.setZoom(12);
        map.panTo(resortItem.marker.position);
        google.maps.event.addListener(infoWindow,'closeclick',function(){
        map.panTo(mapCenter);
        });
    })
    // If AJAX request fails:
    .fail(function() {
    alert("Open Weather Map failed to Load :( Check your internet Connection");
    });
    }

    // Detetect when screen size change
    google.maps.event.addDomListener(window, "resize", function() {
    var center = map.getCenter();
    google.maps.event.trigger(map, "resize");
    map.setCenter(center);
});

    // Create Markers:
    self.resortList().forEach(function(resortItem) {
        marker = new google.maps.Marker({
            position: resortItem.gpsloc,
            map: map,
            title: resortItem.name,
            siteInfo: resortItem.locInfo,
            icon: resortItem.icon,
            animation: google.maps.Animation.DROP
        });
        resortItem.marker = marker;

    // Tie Listeners to Markers:
    marker.addListener('click', function() {
        openweatermapPulls(resortItem); //AJAX pull to openweathermap
        resortItem.marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            resortItem.marker.setAnimation(null);//Stop marker bounce:
        }, 2250); // Bounce marker 3 times:
        });
    });

    //Add click listenner to display home view:
    map.addListener('click', function() {
        infoWindow.close(); //close any open infoWindows
        map.panTo(mapCenter); //pan back to mapCenter
        map.setZoom(8);
    });
    //Tie list with Marker on click:
    self.filteredList = function(skiRes) {
        google.maps.event.trigger(skiRes.marker, 'click');
        };

    // Handle users input to filter resorts:
    // Create a ko.observable of the inputs:
    self.lookup = ko.observable('');

    //Fitler down lookup array and match user input to clickable list:
    self.resList = ko.computed(function() {
        return ko.utils.arrayFilter(self.resortList(), function(filterList) {
            filter = filterList.name.toLowerCase().indexOf(self.lookup().toLowerCase()) >= 0;
            if (!filter) {
                filterList.marker.setVisible(false);
            } else {
                filterList.marker.setVisible(true);
            } return filter;
        });
    });
}

//Apply viewmodel with knockout.js
ko.applyBindings(ViewModel());
}
 // Alert that App has failed to load
function mapError() {
  alert("Google Maps failed to Load :( Check your internet Connection.");
}

function initApp(){
  initMap();
}




















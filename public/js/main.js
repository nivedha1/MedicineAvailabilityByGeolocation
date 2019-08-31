/**
 * @author Nivedha
 *
 */

var latitude;
var longitude;
var map;
var geoJSON;
var request;
var gettingData = false;
var lat;
var long;
var openWeatherMapKey = "7a5c8ed1fa6deb0129d0457dca1772a5";
$(document).ready(function() {
  $("#success").hide();
  $("#warning").hide();
  function initialize() {
    var mapOptions = {
      zoom: 8,
      center: new google.maps.LatLng(latitude, longitude)
    };
    map = new google.maps.Map(
      document.getElementById("map-canvas"),
      mapOptions
    );
    // Add interaction listeners to make weather requests
    google.maps.event.addListener(map, "idle", checkIfDataRequested);
    // Sets up and populates the info window with details
    map.data.addListener("click", function(event) {
      infowindow.setContent(
        "<img src=" +
          event.feature.getProperty("icon") +
          ">" +
          "<br /><strong>" +
          event.feature.getProperty("city") +
          "</strong>" +
          "<br />" +
          event.feature.getProperty("temperature") +
          "&deg;C" +
          "<br />" +
          event.feature.getProperty("weather")
      );
      infowindow.setOptions({
        position: {
          lat: event.latLng.lat(),
          lng: event.latLng.lng()
        },
        pixelOffset: {
          width: 0,
          height: -15
        }
      });
      infowindow.open(map);
    });
  }
  var checkIfDataRequested = function() {
    // Stop extra requests being sent
    while (gettingData === true) {
      request.abort();
      gettingData = false;
    }
    getCoords();
  };
  // Get the coordinates from the Map bounds
  var getCoords = function() {
    var bounds = map.getBounds();
    var NE = bounds.getNorthEast();
    var SW = bounds.getSouthWest();
    getWeather(NE.lat(), NE.lng(), SW.lat(), SW.lng());
  };
  // Make the weather request
  var getWeather = function(northLat, eastLng, southLat, westLng) {
    gettingData = true;
    var requestString =
      "http://api.openweathermap.org/data/2.5/box/city?bbox=" +
      westLng +
      "," +
      northLat +
      "," + //left top
      eastLng +
      "," +
      southLat +
      "," + //right bottom
      map.getZoom() +
      "&cluster=yes&format=json" +
      "&APPID=" +
      openWeatherMapKey;
    request = new XMLHttpRequest();
    request.onload = proccessResults;
    request.open("get", requestString, true);
    request.send();
  };
  // Take the JSON results and proccess them
  var proccessResults = function() {
    //  console.log(this);
    var results = JSON.parse(this.responseText);
    if (results.list.length > 0) {
      resetData();
      for (var i = 0; i < results.list.length; i++) {
        geoJSON.features.push(jsonToGeoJson(results.list[i]));
      }
      drawIcons(geoJSON);
    }
  };
  var infowindow = new google.maps.InfoWindow();
  // For each result that comes back, convert the data to geoJSON
  var jsonToGeoJson = function(weatherItem) {
    var feature = {
      type: "Feature",
      properties: {
        city: weatherItem.name,
        weather: weatherItem.weather[0].main,
        temperature: weatherItem.main.temp,
        min: weatherItem.main.temp_min,
        max: weatherItem.main.temp_max,
        humidity: weatherItem.main.humidity,
        pressure: weatherItem.main.pressure,
        windSpeed: weatherItem.wind.speed,
        windDegrees: weatherItem.wind.deg,
        windGust: weatherItem.wind.gust,
        icon:
          "http://openweathermap.org/img/w/" +
          weatherItem.weather[0].icon +
          ".png",
        coordinates: [weatherItem.coord.lon, weatherItem.coord.lat]
      },
      geometry: {
        type: "Point",
        coordinates: [weatherItem.coord.lon, weatherItem.coord.lat]
      }
    };
    // Set the custom marker icon
    map.data.setStyle(function(feature) {
      return {
        icon: {
          url: feature.getProperty("icon"),
          anchor: new google.maps.Point(25, 25)
        }
      };
    });
    // returns object
    return feature;
  };
  // Add the markers to the map
  var drawIcons = function(weather) {
    map.data.addGeoJson(geoJSON);
    // Set the flag to finished
    gettingData = false;
  };
  // Clear data layer and geoJSON
  var resetData = function() {
    geoJSON = {
      type: "FeatureCollection",
      features: []
    };
    map.data.forEach(function(feature) {
      map.data.remove(feature);
    });
  };
  var url = "http://gomashup.com/json.php?fds=geo/usa/zipcode/state/";
  $("#states").on("change", function() {
    $("#cities").empty();
    $.ajax({
      url: url + this.value,
      type: "GET",
      crossDomain: true,
      dataType: "jsonp",
      success: function(data) {
        var result = [];
        var cities = [];
        var i = 0;
        for (var val in data.result) {
          if (jQuery.inArray(data.result[val].City, cities) == -1) {
            result[i] = {};
            result[i].Longitude = data.result[val].Longitude;
            result[i].Latitude = data.result[val].Latitude;
            result[i].City = data.result[val].City;
            cities[i] = data.result[val].City;
            i++;
          }
        }
        for (var val in result) {
          $("#cities").append(
            $("<option >", {
              value: result[val].Longitude + "," + result[val].Latitude,
              text: result[val].City.toLowerCase()
            })
          );
        }
      },
      error: function() {
        alert("Failed!");
      }
    });
  });

  $("#next-button").on("click", function() {
    latitude = $("#cities option:selected")
      .val()
      .split(",")[1];
    longitude = $("#cities option:selected")
      .val()
      .split(",")[0];

    $("#map-canvas").empty();
    $("#map-canvas").css("width", window.innerWidth);
    $("#map-canvas").css("height", window.innerHeight);
    $("#collapse2").addClass("in");
    initialize();
  });

  $("#medicine").change(function() {
    $.ajax({
      url: "/medicineSuggestion?q=" + this.value,
      type: "GET",
      success: function(data) {
        var medicinesSuggestions = JSON.parse(data).products;
        for (var val in medicinesSuggestions) {
          $("#medicines").append(
            $("<option >", {
              value: medicinesSuggestions[val].name,
              text: medicinesSuggestions[val].name
            })
          );
        }
      },
      error: function() {
        console.log("failed");
      }
    });
  });
  $("#availability-button").on("click", function() {
    $("#success").hide();
    $("#warning").hide();

    var medName = "";
    if ($("#medicines option:selected").val() != 0)
      medName = $("#medicines option:selected")
        .val()
        .split(" ")[0];
    else {
      medName = $("#medicine").val();
    }
    $.ajax({
      url: "/medicineAvailability?q=" + medName,
      type: "GET",
      success: function(data) {
        if (JSON.parse(data).products.length == 0) $("#warning").show();
        else {
          $("#success").show();
        }
      },
      error: function() {
        console.log("failed");
      }
    });
  });
});

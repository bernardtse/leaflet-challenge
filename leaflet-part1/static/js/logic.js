// Store API endpoint as queryUrl
const queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl).then(function(data) {
  // Once we get a response, send the data.features object to the createFeatures function.
console.log(data);
createFeatures(data.features);
});

// Define a function to creat map features based on GeoJSON data
function createFeatures(earthquakeData) {

  // Define a function that we want to run once for each feature in the features array.
  // Give each feature a popup that describes the place and time of the earthquake.
  function onEachFeature(feature, layer) {
    layer.bindPopup(`<h3>${feature.properties.place}</h3><hr>Magnitude: ${feature.properties.mag}<br />Depth: ${feature.geometry.coordinates[2]}<br />`);
  }

  // Define a function to determine marker size based on earthquake magnitude.
  function markerSize(magnitude) {
    return magnitude * 5; // Adjust the multiplier as needed for better visualization
  }

  // Define a function to determine marker color based on earthquake depth.
  function getColor(depth) {
    if (depth >= -10 && depth <= 10) {
        return "#FFFFCC"; // Light yellow for -10 to 10
    } else if (depth > 10 && depth <= 30) {
        return "#FFCC99"; // Pale orange for 10 to 30
    } else if (depth > 30 && depth <= 50) {
        return "#FF9966"; // Light orange for 30 to 50
    } else if (depth > 50 && depth <= 70) {
        return "#FF6666"; // Light red for 50 to 70
    } else if (depth > 70 && depth <= 90) {
        return "#FF3333"; // Medium red for 70 to 90
    } else {
        return "#CC0000"; // Dark Red for depths greater than 90
    }
  }

  // Create a GeoJSON layer that contains the features array on the earthquakeData object.
  // Run the onEachFeature function once for each piece of data in the array.
  let earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, {
        radius: markerSize(feature.properties.mag), // Set marker size based on earthquake magnitude
        fillColor: getColor(feature.geometry.coordinates[2]), // Set marker color based on earthquake depth
        color: "black", // Border color
        weight: 1, // Border weight
        opacity: 1, // Border opacity
        fillOpacity: 0.8 // Fill opacity
      });
    }
  });

  // Send earthquakes layer to the createMap function.
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Create the base layers.
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })

  // Create map, giving it the streetmap and earthquakes layers to display on load.
  let myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [street, earthquakes]
  });

  // Create a legend to display information about the map.
  let legend = L.control({ position: "bottomright" });

  legend.onAdd = function () {
    let div = L.DomUtil.create("div", "info legend");
    div.style.backgroundColor = "#DDEEFF"; // Set background color
    div.style.padding = "5px";
    div.innerHTML = "<strong>Depth</strong><br />";
    
    let depthRanges = ["-10 - 10", "10 - 30", "30 - 50", "50 - 70", "70 - 90", "90+"];
    let colors = ["#FFFFCC", "#FFCC99", "#FF9966", "#FF6666", "#FF3333", "#CC0000"];

    // Loop through depthRanges to generate a label with a colored square for each depth range.
    for (let i = 0; i < depthRanges.length; i++) {
      div.innerHTML +=
        '<i style="background:' + colors[i] + '">&emsp;&ensp;</i>' + "&emsp;" + depthRanges[i] + "<br />";
    }
  
    return div;
  };

  // Add legend to the map.
  legend.addTo(myMap);
}

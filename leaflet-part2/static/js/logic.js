// Define URLs for JSON files
const queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
const platesUrl = "data/PB2002_plates.json";

// Use Promise.all to load data from multiple JSON files asynchronously
Promise.all([
  d3.json(queryUrl),
  d3.json(platesUrl)
]).then(function(data) {
  // Data loaded successfully for both files
  const earthquakeData = data[0]; // Data from queryUrl
  const platesData = data[1]; // Data from platesUrl
  console.log(earthquakeData);
  console.log(platesData);
 
  // Once we get a response, send earthquakeData.features object and the platesData object to the createFeatures function.
 createFeatures(earthquakeData.features, platesData);

}).catch(function(error) {
  // Handle any errors that occurred during data loading
  console.error("Error loading JSON data:", error);
});




// Define a function to creat map features based on GeoJSON data
function createFeatures(earthquakeData, platesData) {


  // Create a GeoJSON layer for tectonic plates
  let tectonicPlates = L.geoJSON(platesData, {
    style: function (feature) {
      return {
        color: "#FF0000", // Red color for plate boundaries
        weight: 2, // Border weight
        fillOpacity: 0 // Fill opacity
      };
    }
  });


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
  createMap(earthquakes, tectonicPlates);
}

function createMap(earthquakes, tectonicPlates) {

  // Create the base layers.
let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
})

let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

// Create a baseMaps object.
let baseMaps = {
  "Street Map": street,
  "Topographic Map": topo
};


// Create an overlay object.
let overlayMaps = {
  "Tectonic Plates": tectonicPlates,
  "Earthquakes": earthquakes
};


  // Create map, giving it the streetmap and earthquakes layers to display on load.
  let myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [topo, tectonicPlates, earthquakes]
  });

// Pass our map layers to our layer control.
// Add the layer control to the map.
L.control.layers(baseMaps, overlayMaps, {
  collapsed: false
}).addTo(myMap);


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

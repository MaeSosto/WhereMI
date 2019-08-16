var lon, lat;
map = new OpenLayers.Map("mapdiv");

if (navigator.geolocation) {
  navigator.geolocation.watchPosition(showPosition);
} else { 
  x.innerHTML = "Geolocation is not supported by this browser.";
}

  
function showPosition(position) {
  lat= position.coords.latitude;
  lon= position.coords.longitude;
  map.addLayer(new OpenLayers.Layer.OSM());

  var lonLat = new OpenLayers.LonLat( lon ,lat )
        .transform(
          new OpenLayers.Projection("EPSG:4326"), // transform from WGS 1984
          map.getProjectionObject() // to Spherical Mercator Projection
        );
        
  var zoom=18;

  var markers = new OpenLayers.Layer.Markers( "Markers" );
  map.addLayer(markers);

  markers.addMarker(new OpenLayers.Marker(lonLat));

  map.setCenter (lonLat, zoom);
}

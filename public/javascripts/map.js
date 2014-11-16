var map;
function initialize() {
  var mapOptions = {
    zoom: 8,
    center: new google.maps.LatLng(45.506640, -73.603076)
  };
  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

  var marker, i;
  for (i = 0; i < locs.length; i++) {
    marker = new google.maps.Marker({
      position: new google.maps.LatLng(locs[i][0], locs[i][1]),
      map: map
    });
  }
}

google.maps.event.addDomListener(window, 'load', initialize);

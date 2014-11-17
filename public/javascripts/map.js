var map;
function initialize() {
  var mapOptions = {
    zoom: 12,
    center: new google.maps.LatLng(45.506640, -73.603076)
  };
  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

  var marker, i;
  for (i = 0; i < locs.length; i++) {
    marker = new google.maps.Marker({
      position: new google.maps.LatLng(locs[i].lat, locs[i].lon),
      map: map
    });
    var contentString = '<div id="info">'+
        '<b>BSSID</b>&nbsp;' + locs[i].bssid +
        '</div>';
    var infowindow = new google.maps.InfoWindow({
        content: contentString
    });
    google.maps.event.addListener(marker, 'click', function() {
      infowindow.open(map, marker);
    });
  }
}
google.maps.event.addDomListener(window, 'load', initialize);

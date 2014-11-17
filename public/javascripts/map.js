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
        '<div><b>BSSID:</b>&nbsp;<a href="/bssid/' + locs[i].bssid + '">' + locs[i].bssid + '</a></div>'+
        '<div><b>Accuracy:</b>&nbsp;' + locs[i].accuracy + '</div>'+
        '<div><b>Observation Date:</b>&nbsp;' + new Date(locs[i].time*1000) + '</div>'+
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

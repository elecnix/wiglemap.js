var map;
function initialize() {
  var mapOptions = {
    zoom: 12,
    center: new google.maps.LatLng(45.506640, -73.603076)
  };
  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
  var infowindow = new google.maps.InfoWindow();
  for (var i = 0; i < locs.length; i++) {
    var point = locs[i];
    var marker = new google.maps.Marker({
      position: new google.maps.LatLng(locs[i].lat, locs[i].lon),
      map: map
    });
    marker.content= '<div class="infowindow">'+
        '<div><b>BSSID:</b>&nbsp;<a href="/bssid/' + point.bssid + '">' + point.bssid + '</a></div>'+
        '<div><b>SSID:</b>&nbsp;' + point.ssid + '</div>'+
        (point.accuracy ? '<div><b>Accuracy:</b>&nbsp;' + point.accuracy + '</div>' : '')+
        (point.time ? '<div><b>Observation Date:</b>&nbsp;' + new Date(point.time) + '</div>' : '')+
        '</div>';
    google.maps.event.addListener(marker, 'click', function() {
      infowindow.setContent(this.content);
      infowindow.open(this.getMap(), this);
    });
  }
}
google.maps.event.addDomListener(window, 'load', initialize);

var http = require('http');
var url = require('url');
var port = 2412;
var sqlite3 = require('sqlite3').verbose();
var _ = require('lodash');
var db = new sqlite3.Database('wiglewifi.sqlite', sqlite3.OPEN_READONLY);
db.serialize(function() {
  http.createServer(function (request, response) {
    var bssids = url.parse(request.url, true)['query']['bssids'];
    console.log('url: ', request.url);
    console.log('bssids: ' + bssids);
    if (!bssids) {
      response.writeHead(204, {'Content-Type': 'text/plain'});
      response.end('Missing bssids!\n');
      return;
    }
    bssids = bssids.split(',');
    var quote = function(str) {return "'" + str.replace("'", "''") + "'"};
    var sql = "select bssid, lat, lon from location where bssid in (" + bssids.map(quote).join(",") + ")";
    console.log(sql);
    db.all(sql, function(err, rows) {
      if (err) {
        response.writeHead(500, {'Content-Type': 'text/plain'});
        response.end(JSON.stringify(err));
      } else {
        response.writeHead(200, {'Content-Type': 'text/json'});
        response.write('BSSID\tLatitude\tLongitude\tNode\tMarker\n');
        var index = _.indexBy(rows, 'bssid');
        var mapped = _.reduce(index, function(result, value, bssid) {
          if (result[bssid]) {
            value['lat'] = (value['lat'] + result[bssid]['lat']) / 2;
            value['lon'] = (value['lon'] + result[bssid]['lon']) / 2;
          }
          result[bssid] = value;
          return result;
        }, {});
        _.forEach(mapped, function(observation) {
          response.write(observation.bssid + '\t' + observation.lat + '\t' + observation.lon + '\t' + 'amman\tlarge_blue' + '\n');
        });
        response.end();
      }
    });
  }).listen(port);
  console.log('Server running at http://127.0.0.1:' + port + '/');
});

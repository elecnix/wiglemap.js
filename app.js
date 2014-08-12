var http = require('http');
var url = require('url');
var port = 2412;
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('wiglewifi.sqlite', sqlite3.OPEN_READONLY);
db.serialize(function() {
  http.createServer(function (request, response) {
    var bssids = url.parse(request.url, true)['query']['bssids'];
    console.log('url: ', request.url);
    console.log('bssids: ' + bssids);
    if (!bssids) {
      response.writeHead(404, {'Content-Type': 'text/plain'});
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
        response.end(JSON.stringify(rows));
      }
    });
  }).listen(port);
  console.log('Server running at http://127.0.0.1:' + port + '/');
});


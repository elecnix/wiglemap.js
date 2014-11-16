var express = require('express');
var http = require('http');
var url = require('url');
var sqlite3 = require('sqlite3').verbose();
var _ = require('lodash');
var path = require('path');
var db = new sqlite3.Database('wiglewifi.sqlite', sqlite3.OPEN_READONLY);
var app = express();
app.set('port', process.env.PORT || 2412);
app.set('view engine', 'jade');
app.use(express.urlencoded());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', function(req, res) {
  res.render('form');
});
app.post('/networks', function(request, response, next) {
  var bssids = url.parse(request.url, true)['query']['bssids'];
  if (bssids) {
    bssids = bssids.split(',');
  } else {
    bssids = request.body.bssids.replace(/ /g, '').split('\r\n');
  }
  console.log('url: ', request.url);
  console.log('bssids: ' + bssids);
  if (!bssids) {
    response.writeHead(204, {'Content-Type': 'text/plain'});
    response.end('Missing bssids!\n');
    return;
  }
  var quote = function(str) {return "'" + str.replace("'", "''") + "'"};
  var sql = "select bssid, lat, lon from location where bssid in (" + bssids.map(quote).join(",") + ")";
  console.log(sql);
  db.all(sql, function(err, rows) {
    if (err) {
      response.writeHead(500, {'Content-Type': 'text/plain'});
      response.end(JSON.stringify(err));
    } else {
      var index = _.indexBy(rows, 'bssid');
      var mapped = _.reduce(index, function(result, value, bssid) {
        if (result[bssid]) {
          value['lat'] = (value['lat'] + result[bssid]['lat']) / 2;
          value['lon'] = (value['lon'] + result[bssid]['lon']) / 2;
        }
        result[bssid] = value;
        return result;
      }, {});
      response.render('map', {result: mapped, _: _});
    }
  });
});
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

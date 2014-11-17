var express = require('express');
var http = require('http');
var url = require('url');
var sqlite3 = require('sqlite3').verbose();
var _ = require('lodash');
var path = require('path');
var randomstring = require('randomstring');
var db = new sqlite3.Database('wiglewifi.sqlite', sqlite3.OPEN_READWRITE);
var app = express();
app.set('port', process.env.PORT || 2412);
app.set('view engine', 'jade');
app.use(express.urlencoded());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', function(req, res) {
  res.render('form');
});
var quote = function(str) {return "'" + str.replace("'", "''") + "'"};
app.post('/networks', function(request, response, next) {
  var id = randomstring.generate(7);
  var bssids = url.parse(request.url, true)['query']['bssids'];
  if (bssids) {
    bssids = bssids.split(',');
  } else {
    bssids = request.body.bssids.replace(/ /g, '').split('\r\n');
  }
  console.log('id: ' + id + ', bssids: ' + bssids);
  if (!bssids) {
    response.writeHead(204, {'Content-Type': 'text/plain'});
    response.end('Missing bssids!\n');
    return;
  }
  var sql = "select network.bssid, network.ssid, lat, lon from location JOIN network on network.bssid = location.bssid where location.bssid in (" + bssids.map(quote).join(",") + ") order by time desc";
  console.log(sql);
  db.all(sql, function(err, rows) {
    if (err) {
      response.writeHead(500, {'Content-Type': 'text/plain'});
      response.end(JSON.stringify(err));
    } else {
      var reduced = _.reduce(rows, function(result, row) {
        if (result[row.bssid]) {
          row['lat'] = (row.lat + result[row.bssid].lat) / 2;
          row['lon'] = (row.lon + result[row.bssid].lon) / 2;
        }
        result[row.bssid] = row;
        return result;
      }, {});
      var stmt = db.prepare("INSERT INTO map(id, bssid, ssid, lat, lon) VALUES (?, ?, ?, ?, ?)");
      _.forEach(reduced, function(point) {
        stmt.run(id, point.bssid, point.ssid, point.lat, point.lon);
      });
      stmt.finalize(function() {
        response.redirect('/scan/' + id);
      });
    }
  });
});
app.get('/scan/:id', function(request, response) {
  var sql = "select * from map where id in (" + request.params.id.split(',').map(quote).join(",") + ")";
  db.all(sql, function(err, rows) {
    if (err) {
      response.writeHead(500, {'Content-Type': 'text/plain'});
      response.end(JSON.stringify(err));
    } else {
      response.render('map', {result: rows, _: _});
    }
  });
});
app.get('/bssid/:bssid', function(request, response) {
  var sql = "select * from location JOIN network on network.bssid = location.bssid where location.bssid = ?";
  db.all(sql, request.params.bssid, function(err, rows) {
    if (err) {
      response.writeHead(500, {'Content-Type': 'text/plain'});
      response.end(JSON.stringify(err));
    } else {
      response.render('map', {result: rows, _: _});
    }
  });
});
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

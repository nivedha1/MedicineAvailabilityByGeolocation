var express = require('express');
var http = require('http');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));


app.use(function (req, res, next){
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  req.headers.authorization = 'fc8c108f9833af20c8468722d4577692';
  if (req.headers['x-forwarded-proto'] === 'https') {
    res.redirect('http://' + req.hostname + req.url);
  } else {
    next();
  }
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
var urlAutoMed = "https://api.drugbankplus.com/v1/drug_names/simple?q=tylenol";
app.get('/medicine',function(){
  var options = {
    host: urlAutoMed
  }
  var request = http.get(options, function(response) {
  console.log('STATUS: ' + response.statusCode);
  console.log('HEADERS: ' + JSON.stringify(response.headers));

  // Buffer the body entirely for processing as a whole.
  var bodyChunks = [];
  response.on('data', function(chunk) {
    // You can process streamed parts here...
    bodyChunks.push(chunk);
  }).on('end', function() {
    var body = Buffer.concat(bodyChunks);
    console.log('BODY: ' + body);
    // ...and/or process the entire body here.
  })
});

request.on('error', function(e) {
  console.log('ERROR: ' + e.message);
});
})

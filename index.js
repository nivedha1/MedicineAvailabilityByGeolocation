var express = require('express');
var app = express();
var request = require('request');
app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));


app.use(function (req, res, next){
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  req.headers.Authorization = 'fc8c108f9833af20c8468722d4577692';
  if (req.headers['x-forwarded-proto'] === 'https') {
    res.redirect('http://' + req.hostname + req.url);
  } else {
    next();
  }
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
var urlAutoMed = "https://api.drugbankplus.com/v1/drug_names/simple";
var urlAvailMed = "https://api.drugbankplus.com/v1/ca/drug_names";
app.get('/medicineSuggestion',function(req,res){
  var options = {
      url: urlAutoMed,
      method: 'GET',
      headers: {
          'Authorization': 'fc8c108f9833af20c8468722d4577692',
      },
      qs :{'q':req.query.q}
  };
  request(options, function(err,response,body) {
    res.send(body);
  });
});
  app.get('/medicineAvailability',function(req,res){
    var options = {
        url: urlAvailMed,
        method: 'GET',
        headers: {
            'Authorization': 'fc8c108f9833af20c8468722d4577692',
        },
        qs :{'q':req.query.q}
    };
    request(options, function(err,response,body) {
      res.send(body);
    });

})

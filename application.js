var mbaasApi = require('fh-mbaas-api');
var express = require('express');
var account = require('./lib/account');
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json({type:'*/*'})
var mbaasExpress = mbaasApi.mbaasExpress();
var cors = require('cors');

// list the endpoints which you want to make securable here
var securableEndpoints = [];


var app = express();
app.post('/karma', jsonParser, function (req, res) {
  var nick = req.body.nick;
  var channel = req.body.channel;
  var score = req.body.score;
  var userName = req.body.userName;
  var direction = req.body.direction;
  console.log(nick + ' grew to ' + score + ' by ' + direction);
  
  var messageText = '';
  
  if (direction > 0) {
    messageText = req.body.from + ' gave you karma (Score is ' + score + ')!';
  } else {
    messageText = req.body.from + ' dropped your karma (Score is ' + score + ')!';
  }
  
  var message = {
      alert: JSON.stringify({action:"karma", message:messageText, date:new Date().getTime(), from:req.body.from})
  }, options = {
      broadcast: true,
      criteria: {
        alias: [req.body.remoteUserName]
      }
  };
  
    console.log("Sending karma push to " + JSON.stringify(req.body));

  
  mbaasApi.push(message, options,
    function (err, res) {
      if (err) {
        console.log(err.toString());
      } else {
        console.log("status : " + res.status);
      }
    });
    
    res.end();
});

// Enable CORS for all requests
app.use(cors());

// Note: the order which we add middleware to Express here is important!
app.use('/sys', mbaasExpress.sys(securableEndpoints));
app.use('/mbaas', mbaasExpress.mbaas);
//{"nick":"summersp","remoteUserName":"113641058622281728775","apiKey":"test","secret":"240736058","action":"link"}

app.post('/tell', jsonParser, function(req,res) {
  
  var messageText = req.body.sender + ' says ' + req.body.message;
  
  var message = {
      alert: JSON.stringify({action:"tell", message:messageText, date:new Date().getTime(), from:req.body.sender});
  }, options = {
      broadcast: true,
      criteria: {
        alias: [req.body.userName]
      }
  };
  
  console.log("Sending tell push to " + JSON.stringify(req.body));

  mbaasApi.push(message, options,
    function (err, res) {
      if (err) {
        console.log(err.toString());
      } else {
        console.log("status : " + res.status);
      }
    });
    
    res.end();
});

app.post('/link', jsonParser, function(req,res) {
  
  
    var message = {
      alert: JSON.stringify({action:"link"})
  }, options = {
      broadcast: true,
      criteria: {
        alias: [req.body.remoteUserName]
      }
  };
  
  console.log("Sending link push to " + (req.body.remoteUserName));
  
  mbaasApi.push(message, options,
    function (err, res) {
      if (err) {
        console.log("link Push error" + JSON.stringify(err));
      } else {
        console.log("status : " + res.status);
      }
    });
  res.end('{}');
});
// allow serving of static files from the public directory
app.use(express.static(__dirname + '/public'));

// Note: important that this is added just before your own Routes
app.use(mbaasExpress.fhmiddleware());

app.use('/category', require('./lib/server.js')());
app.get('/account/me', account.getMe);

app.post('/account/link', jsonParser, account.link);


// Important that this is last!
app.use(mbaasExpress.errorHandler());

var port = process.env.FH_PORT || process.env.OPENSHIFT_NODEJS_PORT || 8001;
var host = process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';
app.listen(port, host, function() {
  console.log("App started at: " + new Date() + " on port: " + port);
});

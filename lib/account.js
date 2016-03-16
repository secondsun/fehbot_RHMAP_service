var mbaasApi = require('fh-mbaas-api');
var q = require('q');
var request = require('request');

var Account = function () {
    this.getMe = getMe;
    this.link = linkAccount;

  /**
     * This function returns the user for the currently signed in user
     * 
     * @param {HttpRequest} req http request
     * @param {HttpResponse} res http repsonse
     *
     * @returns nothing
     */
    function getMe(req, res) {
        

        var sessionToken = req.get('X-FH-sessionToken');
        
        console.log('getting' + sessionToken);
        
        var callback = function(error, data) {
            if (error){
                res.statusCode = 500;
                console.log ('account.js - getMe ', sessionToken, ' with error ', error);
                return res.end(error);
            } else {
                if (!data) {
                    //no account, not logged in?
                    res.statusCode = 500;
                    console.log ('account.js - getMe ', sessionToken, ' with error no session ', error);
                    return res.end(error);
                } else {
                    console.log ('account.js - getMe ', sessionToken, ' - ', data)
                    return res.json(data);
                }
                
            }
            
        };

        mbaasApi.service({
          "guid" : "bvqrdixlqyl2eb53ofwgl63k", // The 24 character unique id of the service
          "path": "/list/" + sessionToken, //the path part of the url excluding the hostname - this will be added automatically
          "method": "GET",   //all other HTTP methods are supported as well. e.g. HEAD, DELETE, OPTIONS
          "timeout": 25000 // timeout value specified in milliseconds. Default: 60000 (60s)
        }, callback );
        
    }


    function linkAccount(req, res) {
      var sessionToken = req.get('X-FH-sessionToken');
        
        console.log('linking ' + req.body);
        
        var callback = function(error, data) {
            if (error){
                res.statusCode = 500;
                console.log ('account.js - getMe ', sessionToken, ' with error ', error);
                return res.end(error);
            } else {
                if (!data) {
                    //no account, not logged in?
                    res.statusCode = 500;
                    console.log ('account.js - getMe ', sessionToken, ' with error no session ', error);
                    return res.end(error);
                } else {
                    var accountId = data.sub;
                    console.log('requesting linking ' + accountId);
                    var options = {
                        url: process.env.FEHBOT_LINK_ENDPOINT,
                        method: 'POST',
                        json: true,
                        body: {nick:req.body.ircNick[0], remoteUserName:accountId},
                    };
                    request(options, function(err, response, body){
                      if (err) {
                        res.statusCode = 500;
                        console.log ('error linking ', err);
                        return res.end(error);
                      } else {
                        res.statusCode = 200;
                        console.log ('linking complete', JSON.stringify(body));
                        return res.end(JSON.stringify(body));
                      }
                    }).end();
                }
                
            }
            
        };

        mbaasApi.service({
          "guid" : "bvqrdixlqyl2eb53ofwgl63k", // The 24 character unique id of the service
          "path": "/list/" + sessionToken, //the path part of the url excluding the hostname - this will be added automatically
          "method": "GET",   //all other HTTP methods are supported as well. e.g. HEAD, DELETE, OPTIONS
          "timeout": 25000 // timeout value specified in milliseconds. Default: 60000 (60s)
        }, callback );
  }


};

module.exports = new Account();

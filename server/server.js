var http = require('http');
var url = require('url');
var request = require('request');
var fs = require('fs');

var outputFilename = "session.json";
var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
var myhost = "localhost";
var myport = "3030";
var baseURL = "http://" + myhost + ":" + myport;
var sparqlEndpoint = "dcat-ap_validator";
var defaultEndpoint = baseURL + "/" + sparqlEndpoint;

http.createServer(onRequest).listen(3000);

function postCode(query, endpoint) {
  // Build the post string from an object
  var post_data = 'update=' + encodeURIComponent(query);

  // An object of options to indicate where to post to
  var post_options = {
      host: myhost,
      port: myport,
      path: endpoint + '/update',
      method: 'POST',
      headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': post_data.length
      }
  };

  // Set up the request
  var post_req = http.request(post_options, function(res) {
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
          console.log('Response: ' + chunk);
      });
  });

  // post the data
  post_req.write(post_data);
  post_req.end();

}
function removeOldGraphs(jsonContent){
    for(var graph in jsonContent) {
        var value = jsonContent[graph];
        console.log("key:" + graph + ", value:" + value);
        var now = new Date().getTime();
        var diffDays = (Math.abs((now - value)/(oneDay)));
        console.log("diff:" + diffDays);
        if (diffDays > 0.004) {
            delete jsonContent[graph];
            postCode('DROP GRAPH <' + graph + '>', defaultEndpoint); //wipes the named graph in the triple store
        }
    }
}
function onRequest(req, res) {

    var url_parts = url.parse(req.url);
    if (url_parts.pathname == "/getfile") {
        var queryData = url.parse(req.url, true).query;
        if (queryData.url) {
            console.log("received: " + queryData.url);
            request({
                url: queryData.url
            }).on('error', function(e) {
                res.end(e);
            }).pipe(res);
            res.setHeader('Access-Control-Allow-Origin', baseURL);
        }
        else {
            res.end("no url found");
        }
    } else if (url_parts.pathname == "/registergraph") {
        var queryData = url.parse(req.url, true).query;
        var graphid = queryData.graphid;
        var creationdate = graphid.substring(graphid.lastIndexOf("/")+1);
       // var creationdate = queryData.creationdate;
        var jsonContent = JSON.parse(fs.readFileSync(outputFilename));
        jsonContent[graphid] = creationdate;
        removeOldGraphs(jsonContent);
        fs.writeFile(outputFilename, JSON.stringify(jsonContent, null, 4), function(err) {
            if(err) {
              console.log(err);
            } else {
              console.log("JSON saved to " + outputFilename);
            }
        });
        res.setHeader('Access-Control-Allow-Origin', baseURL);
        res.end("session logged");
    } else {
        console.log("not a good request");
        res.end("request not accepted");
    }
}
var http = require('http');
var url = require('url');
var request = require('request');
var fs = require('fs');

var serverport = process.argv[2];      //3000
var outputFilename = process.argv[3];  // json file containing the graphs created
var daystodiscard = process.argv[4];   // 1 (1 day) or 0.00348 (5 min)
var fusekihost = process.argv[5];      // localhost
var fusekiport = process.argv[6];      // 3030
var sparqlEndpoint = process.argv[7];  // dcat-ap_validator

var baseURL = "http://" + fusekihost + ":" + fusekiport;
var defaultEndpoint = baseURL + "/" + sparqlEndpoint;
var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds

http.createServer(onRequest).listen(serverport);

console.log("[LOG] Ready to accept requests...");

function postCode(query, endpoint) {
  // Build the post string from an object
  var post_data = 'update=' + encodeURIComponent(query);

  // An object of options to indicate where to post to
  var post_options = {
      host: fusekihost,
      port: fusekiport,
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
          console.log("[LOG] Data sent");
      });
  });

  // post the data
  post_req.write(post_data);
  post_req.end();

}
function removeOldGraphs(jsonContent){
    for(var graph in jsonContent) {
        var value = jsonContent[graph];
        var now = new Date().getTime();
        var diffDays = (Math.abs((now - value)/(oneDay)));
        if (diffDays > daystodiscard) {
            delete jsonContent[graph];
            postCode('DROP GRAPH <' + graph + '>', defaultEndpoint); //wipes the named graph in the triple store
            console.log("[LOG] Dropping graph: " + graph);
        }
    }
}
function onRequest(req, res) {

    var url_parts = url.parse(req.url);
    if (url_parts.pathname == "/getfile") {
        var queryData = url.parse(req.url, true).query;
        if (queryData.url) {
            console.log("[LOG] Serving: " + queryData.url);
            request({
                url: queryData.url
            }).on('error', function(err) {
                res.end(err);
                console.log("[LOG] There was a problem with the request " + queryData.url + "see: " + err);
            }).pipe(res);
            res.setHeader('Access-Control-Allow-Origin', baseURL);
        }
        else {
            res.end("No url found");
        }
    } else if (url_parts.pathname == "/registergraph") {
        var queryData = url.parse(req.url, true).query;
        var graphid = queryData.graphid;
        var creationdate = graphid.substring(graphid.lastIndexOf("/")+1);
       // var creationdate = queryData.creationdate;
        var data;
        try {
            data = fs.readFileSync(outputFilename);
        } catch(err) {
            if (err.code === 'ENOENT') {
                console.log("[LOG] File " + outputFilename + " not found!");
                fs.writeFileSync(outputFilename,"{}");
                console.log("[LOG] File " + outputFilename + " created");
                data = fs.readFileSync(outputFilename);
            } else {
                console.log("[LOG] There was a problem in reading the file " + outputFilename + "see: " + err);
                throw err;
            }
        }
        var jsonContent = JSON.parse(data);
        jsonContent[graphid] = creationdate;
        console.log("[LOG] Adding graph: " + graphid);
        removeOldGraphs(jsonContent);
        fs.writeFile(outputFilename, JSON.stringify(jsonContent, null, 4), function(err) {
            if(err) {
              console.log("[LOG] There was a problem in writing the file " + outputFilename + "see: " + err);
            } else {
              console.log("[LOG] JSON saved to " + outputFilename);
            }
        });
        res.setHeader('Access-Control-Allow-Origin', baseURL);
        res.end("Session logged");
    } else {
        console.log("[LOG] Not a good request:" + req.url);
        res.end("Request not accepted");
    }
}
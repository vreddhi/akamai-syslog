const express = require('express');
const https = require('https');
const http = require('http');
const fs = require('fs');
const bodyParser = require('body-parser')
var serveIndex = require('serve-index');
var SplunkLogger = require("splunk-logging").Logger;

const config = require('./config.json')
var file = require('./file.js')


// READ configuration variables
// These variables are used by application and are defined in config.json file
// which is imported in beginning of the code
var token = config['splunk']['token']
var splunk_url = config['splunk']['url']
const https_port = config['application']['https_port']
const http_port = config['application']['http_port']
var key_file = config['certificate']['path_to_key']
var cert_file = config['certificate']['path_to_certificate']
var inbound_path = config['endpoints']['inbound_path']
var read_path = config['endpoints']['read_path']

// Define the splunk configuration
// You can obtain your token and instance URL
// from your installation or cloud
var splunk_config = {
    token: token,
    url: splunk_url
};

//Create a splunk logger object
var Logger = new SplunkLogger(splunk_config);

//Read Key and certificate to support HTTPS
var key = fs.readFileSync(key_file);
var cert = fs.readFileSync(cert_file);

var options = {
  key: key,
  cert: cert
};

//Initialize an express server object
app = express()
app.get('/', (req, res) => {
   res.send('Now using https..');
});


//Listen on endpoints
app.use(read_path, serveIndex('output')); // shows you the file list
app.use(read_path, express.static('output')); // serve the actual files 
app.use(bodyParser.urlencoded({ extended: true }));

//Process logs
app.post(inbound_path, (req,res) => {

    //Write the content to a local file 
    fileObj = new file()
    fileObj._createFile(req.body)

    //Message to be sent to Splunk
    message  = req.body;
    var payload = {
      message
    }

    Logger.send(payload, function(err, resp, body) {
      // If successful, body will be { text: 'Success', code: 0 }
      console.log("Response from Splunk", body);
    });

    res.send('Streamed to splunk')
})


//Start HTTPS server
var https_server = https.createServer(options, app);
https_server.listen(https_port, () => {
  console.log("server starting on port : " + https_port)
});


//Start HTTP server
var http_server = http.createServer(app);
http_server.listen(http_port, () => {
  console.log("server starting on port : " + http_port)
});

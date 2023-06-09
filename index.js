require('dotenv').config();
const util = require('util');
const FeedParser = require('feedparser');
const fetch = require('node-fetch');
const functions = require('./lib/functions.js');
const tls = require('tls');
const fs = require('fs');

const url = process.env.REMOTE_SERVER_URL;
const sslCert = process.env.REMOTE_SSL_USER_CERTIFICATE;
const sslKey = process.env.REMOTE_SSL_USER_KEY;

if (!functions.checkFile(sslCert)) process.exit();
if (!functions.checkFile(sslKey)) process.exit();

let intervalSecs = (typeof process.env.PULL_INTERVAL !== 'undefined') ? process.env.PULL_INTERVAL : 300;
if (intervalSecs < 300) intervalSecs = 300;
const logCot = (typeof process.env.LOGCOT !== 'undefined') ? (process.env.LOGCOT == "true") : false;

var interval = intervalSecs * 1000;

process.env.TZ = 'UTC';

const run = () => {

  const urlMatch = url.match(/^ssl:\/\/(.+):([0-9]+)/)
  if (!urlMatch) return

  const options = {
    host: urlMatch[1],
    port: urlMatch[2],
    cert: fs.readFileSync(sslCert),
    key: fs.readFileSync(sslKey),
    rejectUnauthorized: false
  }

  const client = tls.connect(options, () => {
    if (client.authorized) {
      console.log("Connection authorized by a Certificate Authority.")
    } else {
      console.log("Connection not authorized: " + client.authorizationError + " - ignoring")
    }
    heartbeat();
    pullandfeed();
  })

  client.on('data', (data) => {
    if (logCot === true) {
      //console.log(data.toString());
    }
  })

  client.on('error', (err) => {
    console.error(`Could not connect to SSL host ${url}`);
    console.error(err);
    process.exit();
  })

  client.on('close', () => {
    console.info(`Connection to SSL host ${url} closed`)
    process.exit();
  })

  function heartbeat() {
    client.write(functions.heartbeatcot(intervalSecs));
    if (logCot === true) {
      console.log(functions.heartbeatcot(intervalSecs));
      console.log('-----')
    }
  }

  function pullandfeed() {
    heartbeat();
    var feedparser = new FeedParser();
    var req = fetch('https://deepstatemap.live/api/history/last',
      {
        headers: {
          "Accept":"application/json, text/javascript, */*; q=0.01",
          "Alt-Used":"deepstatemap.live",
          "User-Agent": "DeepState TAK feeder",
          "Connection": "close",
          "Host": "deepstatemap.live",
          "Referer": "https://deepstatemap.live/",
          "X-Requested-With": "XMLHttpRequest"
        }
      })

      .then((response) => response.json())
      .then((data) => {
        //console.log(util.inspect(data, false, null, true));
        let ptime = data.id;
        for (var no in data["map"]["features"]) {
          let item = data["map"]["features"][no];
          if (item["geometry"]["type"] == "Point") {
            let cot = functions.deepstate2cot(item, intervalSecs, ptime);
            if (cot != null) {
              if (logCot === true) console.log(cot);
              client.write(cot);
            }
          }
        }
      });

    setTimeout(pullandfeed, interval);
  };
};

if (url && sslCert && sslKey) {
  run();
}

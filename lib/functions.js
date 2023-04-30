const { cot, proto } = require('@vidterra/tak.js')
const uuid = require('uuid');
const fs = require('fs');

var myCallsign = "DEEPSTATE";
var myType = "a-f-G-U";
const myUID = (typeof process.env.UUID !== 'undefined') ? process.env.UUID : uuid.v4();

module.exports.checkFile = (path) => {
    let result = false;
    try {
        if (fs.existsSync(path)) {
            console.log("Found " + path);
            result = true;
        } else {
            console.log("Can't find " + path);
            result = false;
        }
    } catch (err) {
        console.error(err)
    }
    return result;
}

module.exports.heartbeatcot = (stale) => {
    const dt = Date.now();
    const dtD = new Date(dt).toISOString();
    const dtDs = new Date(dt + (3 * stale * 1000)).toISOString();

    let packet = {
        "event": {
            "_attributes": {
                "version": "2.0",
                "uid": myUID,
                "type": myType,
                "how": "h-g-i-g-o",
                "time": dtD,
                "start": dtD,
                "stale": dtDs,
            },
            "point": {
                "_attributes": {
                    "lat": 50.44160,
                    "lon": 30.52691,
                    "hae": "9999999.0",
                    "ce": "9999999.0",
                    "le": "9999999.0"
                }
            },
            "detail": {
                "takv": {
                    "_attributes": {
                        "os": "Docker",
                        "device": "Server",
                        "version": "1",
                        "platform": "deepstatemap.live feeder"
                    }
                },
                "contact": {
                    "_attributes": {
                        "callsign": myCallsign,
                    }
                },
                "uid": { "_attributes": { "Droid": myCallsign } },
                "precisionlocation": { "_attributes": { "altsrc": "GPS", "geopointsrc": "GPS" } },
                "track": { "_attributes": { "course": "0", "speed": "0" } },
                "__group": { "_attributes": { "role": "Server", "name": "Blue" } },
                "remarks": "https://www.deepstatemap.live"
            }
        }
    }
    return cot.js2xml(packet);
}

module.exports.deepstate2cot = (item, stale, ptime) => {
    const dt = Date.now();
    const dtD = new Date(dt).toISOString();
    const dtDs = new Date(dt + (3 * stale * 1000)).toISOString();
    const prodTime = new Date(ptime*1000).toISOString();

    let nameFull = item.properties.name.split("///");
    let nameEn = nameFull[1].replace(/(\r\n|\n|\r)/gm, "");
    if (/\s/g.test(nameEn[0])) nameEn = nameEn.substring(1);
    let unit = nameEn.replace(/\s/gm, "-");

    if (unit != "Direction-of-attack") {

        let type = "a-h-G-U"

        let uid = "UA-" + unit;
        let latitude = item.geometry.coordinates[1];
        let longitude = item.geometry.coordinates[0];
        let remarks = "#UACONFLICT";

        let nameID = nameEn.toLowerCase();
        if (nameID.includes("kyiv")) {
            nameEn = "Kyiv";
            type = "a-n-G-I-G";
        }
        else if ((nameID.includes("moscow")) || (nameID.includes("minsk"))) type = "a-h-G-I-G";
        else if (nameID.includes("motorized rifle")) type = "a-h-G-U-C-I-M";
        else if (nameID.includes("somalia")) {
            type = "a-h-G-U-C-A";
            nameEn = "1st Separate Tank Battalion Somalia (DPR)";
        }
        else if (nameID.includes("piatnashka")) {
            type = "a-h-G-U-C-I";
            nameEn = "International Brigade Pyatnashka (DPR)";
        }
        else if (nameID.includes("rifle")) type = "a-h-G-U-C-I";
        else if (nameID.includes("pmc")) type = "a-h-G-U-C-I";
        else if (nameID.includes("dpr")) type = "a-h-G-U-C-I";
        else if (nameID.includes("lpr")) type = "a-h-G-U-C-I";
        else if (nameID.includes("bars")) type = "a-h-G-U-C-I";
        else if (nameID.includes("rosguard")) type = "a-h-G-U-C-I";
        else if (nameID.includes("artillery")) type = "a-h-G-U-C-F";
        else if (nameID.includes("tank")) type = "a-h-G-U-C-A";
        else if (nameID.includes("airborne")) type = "a-h-G-U-C-I-A";
        else if (nameID.includes("paratrooper")) type = "a-h-G-U-C-I-A";
        else if (nameID.includes("air assault")) type = "a-h-G-U-C-I-S";
        else if (nameID.includes("coastal defense")) type = "a-h-G-U-C-I-N";
        else if (nameID.includes("marine")) type = "a-h-G-U-C-I-N";
        else if (nameID.includes("naval infantry")) type = "a-h-G-U-C-I-N";
        else if (nameID.includes("airport")) type = "a-h-G-I-B-A";
        else if (nameID.includes("airfield")) type = "a-h-G-I-B-A";
        else if (nameID.includes("aerodrom")) type = "a-h-G-I-B-A";
        else if (nameID.includes("air base")) type = "a-h-G-I-B-A";
        else if (nameID.includes("helicopter base")) type = "a-h-G-I-B-A";
        else if (nameID.includes("special purpose")) type = "a-h-F";
        else if (nameID.includes("cruise")) type = "a-h-S-C-L-C-C";
        if (item.properties.description == "{icon=headquarter}") type = "a-h-G-U-H"

        let packet = {
            "event": {
                "_attributes": {
                    "version": "2.0",
                    "uid": uid,
                    "type": type,
                    "how": "m-r",
                    "time": dtD,
                    "start": dtD,
                    "stale": dtDs,
                    "qos": "5-r-d"
                },
                "point": {
                    "_attributes": {
                        "lat": latitude,
                        "lon": longitude,
                        "hae": 0.0,
                        "ce": 15,
                        "le": 15
                    }
                },
                "detail": {
                    "archive": {},
                    "contact": {
                        "_attributes": {
                            "callsign": nameEn
                        }
                    },
                    "precisionlocation": { "_attributes": { "altsrc": "DTED0" } },
                    "link": { "_attributes": { "uid": myUID, "production_time": prodTime, "type": myType, "parent_callsign": myCallsign, "relation": "p-p" } },
                    "remarks": remarks,
                }
            }
        }
        return cot.js2xml(packet);
    } else return null;
}
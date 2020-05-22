import app from "./app";
import fs from "fs";
import https from "https";
import http from "http";

const port = 80; // 8088; // 80
const sport = 443; // 8089; // 443

https.createServer({
    key:  fs.readFileSync('/srv/certs/star_edm_uhasselt_be_allinone.key'),
    cert: fs.readFileSync('/srv/certs/star_edm_uhasselt_be_allinone.crt')
}, app)
    .listen(sport, function () {
        console.log('QVIS Server listening on port ' + sport);
    });

http.createServer(app).listen(port, function(){ console.log("QVIS Server listening on port " + port) }); 

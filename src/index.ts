import app from "./app";
import fs from "fs";
import https from "https";
import http from "http";

https.createServer({
    key:  fs.readFileSync('/srv/certs/star_edm_uhasselt_be_allinone.key'),
    cert: fs.readFileSync('/srv/certs/star_edm_uhasselt_be_allinone.crt')
}, app)
    .listen(443, function () {
        console.log('QVIS Server listening on port ' + 443);
    });

http.createServer(app).listen(80, function(){ console.log("QVIS Server listening on port 80") }); 

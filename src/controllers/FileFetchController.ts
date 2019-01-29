import { Request, Response } from "express";

import * as fs from "fs";
import * as path from "path";
import {promisify} from "util";
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const removeFileAsync = promisify(fs.unlink);

import { mkDirByPathSync } from "../util/FileUtil";
import { Pcap2Qlog } from "../util/Pcap2Qlog";

export class FileFetchController {

    /*
    public root(req: Request, res: Response) {
        res.status(200).send({
            message: "GET request successful!! " + req.originalUrl
        });
    }
    */

    public async load(req: Request, res: Response) {
        console.log("/loadfiles ", req.query);

         // to easily test locally and allow external users to address the API
        res.header("Access-Control-Allow-Origin", "*");

        // the pcap2qlog programme expects something in this format:
        // (the "description" fields are optional, are filled in with the URLs if not present)
        // (the "capture" files can also be .qlog files themselves if you have them. Then they will just be bundled with the output.)
        // (NOTE: code looks at file extensions naively, that's the reason for the ?.pcap)
        /*
        {
            "description": "Top-level description for the full file. e.g., quic-tracker ngtcp2 28/01/2019",
            "paths": [
                { "capture": "https://quic-tracker.info.ucl.ac.be/traces/20190123/65/pcap?.pcap",
                "secrets": "https://quic-tracker.info.ucl.ac.be/traces/20190123/65/secrets?.keys",
                "description" : "per-file description, e.g., handshake ipv6" },
                { "capture": "https://quic-tracker.info.ucl.ac.be/traces/20190123/61/pcap?.pcap",
                "secrets": "https://quic-tracker.info.ucl.ac.be/traces/20190123/61/secrets?.keys",
                "description" : "per-file description, e.g., HTTP/3 GET" },
                ...
            ]
        }
        */
        // OR we can just pass a single .pcap and .keys file if we only have one
        // So, this server-based API supports 3 options:
        // 1. loadfiles?list=url_to_list.json : a fully formed list in the above format, directly usable
        // 2. loadfiles?file=url_to_file.pcap(ng)&secrets=url_to_keys.keys : single file with (optional) keys
        // 3. loadfiles?file1=url_to_file1.pcap&secrets1=url_to_secrets1.keys&file2=url_to_file2.pcap&secrets2=url_to_secrets2.keys ... : transforms this list into the equivalent of the above
        // options 2. and 3. can also have optional "desc" and "desc1", "desc2", "desc3" etc. parameters to add descriptions

        // TODO: FIXME: pcap2qlog expects urls to have proper extensions (e.g., .pcap, .keys, .json and .qlog)
        // validate for this here and quit early if this is violated 

        let cachePath:string = "/srv/qvis-cache";
        let DEBUG_listContents:string = ""; // FIXME: REMOVE

        let options = [];
        let tempListFilePath:string|undefined = undefined; // only used if we construct a list ourselves (2. and 3.)

        if( req.query.list ){
            // 1.
            // pcap2qlog has support built-in for downloading remote list files, so just keep it as-is
            options.push("--list=" + req.query.list);
            DEBUG_listContents = req.query.list;
        }
        else if( req.query.file || req.query.file1 ){
            // 2. and 3.
            // we just view 2. as a simpler version of 3.
            // we create our own list file in the proper format
            interface ICapture{
                capture:string;
                secrets:string;
                description?:string;
            };

            let captures:Array<ICapture> = [];
            if ( req.query.file ){ // 2.
                captures.push({ capture: req.query.file, secrets: req.query.secrets, description: req.query.desc });
            }
            else{ // req.query.file1 is set => 3.
                let fileFound:boolean = true;
                let currentFileIndex:number = 1;

                do{
                    captures.push({ capture: req.query["file" + currentFileIndex], secrets: req.query["secrets" + currentFileIndex], description: req.query["desc" + currentFileIndex] });
                    currentFileIndex += 1;

                    if( !req.query["file" + currentFileIndex] )
                        fileFound = false;

                } while(fileFound);
            }

            const captureList = {
                desc: req.query.desc || "Generated " + (new Date().toLocaleString()),
                paths: captures
            }

            const captureString:string = JSON.stringify(captureList, null, 4);
            DEBUG_listContents = captureString;

            // create a temporary file, can be removed later 
            let tempDirectory = path.resolve( cachePath + path.sep + "inputs" );
            mkDirByPathSync( tempDirectory );

            const tempFilename = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + ".json";

            try{
                tempListFilePath = tempDirectory + path.sep + tempFilename;
                await writeFileAsync( tempListFilePath, captureString );
                options.push("--list=" + tempListFilePath );
            }
            catch(e){
                res.status(500).send( { "error": "Something went wrong writing the list.json file : " + e } );
                return;
            }
        }
        else{
            res.status(400).send( { "error": "no valid query parameters set. Please use list, file or filex. See github.com/quiclog/qvis-server for more information."} );
            return;
        }

        options.push("--output=" + cachePath);

        try{
            let fileName:string = await Pcap2Qlog.Transform(options);
            console.log("Sending back ", fileName);
            let fileContents:Buffer = await readFileAsync( fileName );

            if( tempListFilePath ){
                try{
                    await removeFileAsync( tempListFilePath );
                }
                catch(e){
                    // now this is interesting... it's an error but the user won't really care
                    // this only has an impact on our hard disk space
                    // so... for now just ignore and continue
                    console.error("FileFetchController:loadFiles : could not remove temporary list file ", tempListFilePath, e);
                }
            }
            
            res.status(200).send( { qlog: fileContents.toString(), debug_list: DEBUG_listContents } );
        }
        catch(e){
            res.status(500).send( { "error": "Something went wrong converting the files to qlog : " + e } );
            return;
        }


        //let fileContents:Buffer = await readFileAsync("/srv/qvis-cache/cache/9ad6e575fae6fe2295ea249a52379cfa8c2552fd_real.qlog");
    }
}

export const fileFetchController = new FileFetchController();

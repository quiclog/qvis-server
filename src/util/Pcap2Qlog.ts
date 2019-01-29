import {exec} from "child_process";

export class Pcap2Qlog {

    public static async Transform(options:Array<string>) : Promise<string> {

        let output:Promise<string> = new Promise<string>( (resolver, rejecter) => {

            // if not done after the expected timeout, we will assume the tshark call to hang and proceed
            const timeoutMin:number = 1;
            let timeoutHappened:boolean = false;
            let timer = setTimeout( function(){ 
                timeoutHappened = true;

                rejecter("Timeout, pcap2qlog didn't complete within " + timeoutMin + " minutes");

            }, timeoutMin * 60 * 1000 ); // 1 minute

            let pcap2qlogLocation = "node /srv/pcap2qlog/out/main.js";

            //exec( `echo ${options[0].replace("--list=", "").trim()}`, function(error, stdout, stderr){
            exec( pcap2qlogLocation + " " + options.join(" "), function(error, stdout, stderr){
                if( timeoutHappened ) 
                    return;

                clearTimeout(timer);

                //console.log("Execed tshark");

                if( error ){ 
                    //console.log("-----------------------------------------");    
                    //console.log("TransformToJSON : ERROR : ", error, stderr, pcapPath, outputPath);
                    //console.log("-----------------------------------------"); 

                    rejecter( "Pcap2Qlog : error : " + error );
                }
                else{
                    resolver( stdout.toString().trim() );
                }
            });
        });

        return output;
    }
}
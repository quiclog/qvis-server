#!/bin/sh

cd /srv/pcap2qlog/
git pull origin master
npm install
./node_modules/typescript/bin/tsc -p ./

cd /srv/qvis/visualizations
git pull origin master
npm install
npm run build
cp -r /srv/qvis/visualizations/dist/* /srv/server/public/

cd /srv/server 
# this one is already pulled by the global startup.sh
npm install
node ./bin/index.js "$@"

tail -f /dev/null # keep container around even after possible crash, so we can look at logs later 

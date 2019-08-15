#!/bin/sh

# typical way to call this: ./run_server.sh

sudo docker stop qvisserver && sudo docker rm qvisserver  
sudo docker run --privileged --name qvisserver -p 8443:443 --restart unless-stopped --volume=/srv/qvis-cache:/srv/qvis-cache -d qvis/server:latest "$@"

# -p 8089:80

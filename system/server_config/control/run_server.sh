#!/bin/sh

sudo docker stop qvisserver && sudo docker rm qvisserver  
sudo docker run --privileged --name qvisserver -p 80:80 -p 443:443 --restart unless-stopped --volume=/srv/qvis-cache:/srv/qvis-cache -d qvis/server:latest "$@"

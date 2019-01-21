#!/bin/bash

if [ "$#" -ne 1 ]; then
    echo -e "Usage: build_images.sh TAG Ex. build_images.sh feb19"
    echo -e "That will lead to building  qvis/wireshark:feb19 and qvis/server:feb19"
    exit 1
fi

TAG=$1

# wireshark base-image
cd /srv/qvisserver/system/docker_setup/
sudo docker build --no-cache -t qvis/wireshark:$TAG wireshark/
sudo docker tag -f qvis/wireshark:$TAG qvis/wireshark:latest

# qvisserver module
cd /srv/qvisserver/system/docker_setup/
sudo docker build --no-cache -t qvis/server:$TAG qvis/
sudo docker tag -f qvis/server:$TAG qvis/server:latest


#!/bin/sh

echo "Pulling from qvis-server repo"
cd /srv/qvisserver
git pull origin master

# chmod sometimes takes too long, causing the .sh script to not be executed ("Text file is busy" bug)
# sync helps by waiting for chmod to fully complete
chmod 777 /srv/qvisserver/system/docker_setup/startup/startup.sh
sync
/srv/qvisserver/system/docker_setup/startup/startup.sh "$@"

#!/bin/bash

# Get the absolute path of the script's directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Include configuration file
source "$SCRIPT_DIR/../.env"

# BUILD command
BUILD_COMMAND="npm run build"

# Build folder
BUILD_FOLDER="$SCRIPT_DIR/../dist"

set -e

cd $SCRIPT_DIR/..

# Execute build
$BUILD_COMMAND

# Copy to tmp folder
scp -i $AUTHENTICATION_FILE_PATH -r $BUILD_FOLDER $SSH_USER@$TARGET_HOST:~/_tmp_dist

# SSH options to automatically accept the first-time connection
ssh_options="-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null"


deploy_command=$(cat <<EOF

sudo rm -rf $PROJECT_LOCATION*
sudo cp -r ~/_tmp_dist/* $PROJECT_LOCATION

rm -rf ~/_tmp_dist

EOF
)

ssh $ssh_options -i $AUTHENTICATION_FILE_PATH $SSH_USER@$TARGET_HOST "$deploy_command"

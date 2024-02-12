#!/bin/bash

set -eux -o pipefail
shopt -s failglob

# this is one of the whitelisted directories
WEBROOT=~/zuul-output/docs
mkdir -p ${WEBROOT}
npm ci
BUILD_DIR=${WEBROOT} npm run build 

#!/bin/bash

set -eux -o pipefail
shopt -s failglob

ZUUL_JOB_NAME=$(jq < ~/zuul-env.json -r '.job')

if [[ $ZUUL_JOB_NAME =~ .*-gammarus-sdn-roadm-line$ ]]; then
  DEVICE=sdn-roadm-line
else
  echo "Cannot determine device name from job name"
  exit 1
fi

ls -al ~/zuul-output/
# this is one of the whitelisted directories
WEBROOT=~/zuul-output/docs
mkdir -p ${WEBROOT}

cat > $WEBROOT/index.html <<EOF
<html>
<head><title>dummy CI test for ${DEVICE}</title></head>
<body><h1>It works: ${DEVICE}</h1></body>
</html>
EOF

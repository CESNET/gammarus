#!/bin/bash

set -eux -o pipefail
shopt -s failglob

ZUUL_JOB_NAME=$(jq < ~/zuul-env.json -r '.job')

# this is one of the whitelisted directories
WEBROOT=~/zuul-output/docs
mkdir -p ${WEBROOT}

make install DESTDIR=.OUT
tree .OUT
echo '<title>Dashboards demos for all devices</title><ul>' > ${WEBROOT}/index.html
for ITEM in .OUT/usr/share/gammarus/static/* ; do
  mv ${ITEM} ${WEBROOT}/
  DEVICE=$(basename ${ITEM})
  echo "<li><a href='${DEVICE}/index.html'>$DEVICE</a></li>" >> ${WEBROOT}/index.html
done
echo '</ul>' >> ${WEBROOT}/index.html

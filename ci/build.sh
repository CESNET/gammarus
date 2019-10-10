#!/bin/bash

set -eux -o pipefail
shopt -s failglob

ZUUL_JOB_NAME=$(jq < ~/zuul-env.json -r '.job')

# this is one of the whitelisted directories
WEBROOT=~/zuul-output/docs
HTML=${WEBROOT}/index.html
mkdir -p ${WEBROOT}

make install DESTDIR=.OUT
tree .OUT > tree-output
echo '<title>Dashboards demos for all devices</title><ul>' > ${HTML}
for ITEM in .OUT/usr/share/gammarus/static/* ; do
  mv ${ITEM} ${WEBROOT}/
  DEVICE=$(basename ${ITEM})
  echo "<li><a href='${DEVICE}/index.html'>$DEVICE</a></li>" >> ${HTML}
done
echo '</ul><hr/><pre>' >> ${HTML}
cat tree-output >> ${HTML}
echo '</html>' >> ${HTML}

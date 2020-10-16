#!/bin/bash
read HTTP_REQUEST
MODULE=$(echo "${HTTP_REQUEST}" | cut -d / -f 4 | cut -d : -f 1)

if [[ "${MODULE}" =~ ^[a-zA-Z0-9]([a-zA-Z0-9_-])+$ ]]; then
  echo -en "HTTP/1.1 200 OK\r\nContent-Type: application/yang-data+json\r\nServer: hackish sysrepocfg\r\n\r\n"
  sysrepocfg -f json -d operational -m "${MODULE}" -X
else
  echo -en "HTTP/1.1 418 I'm a teapot\r\nContent-Type: text/plain\r\n\r\nmalformed module"
fi

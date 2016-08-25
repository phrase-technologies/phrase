#!/usr/bin/env bash
if [ -z ${API_URL+x} ]; then
  FINAL_API_URL='"http://localhost:5000"'
else
  FINAL_API_URL=$API_URL
fi
echo "Launching with API_URL = $FINAL_API_URL"
API_URL=$FINAL_API_URL NODE_ENV=production webpack -p --config webpack.production.config.js && NODE_ENV=production PORT=3333 forever start -c node server.prod.js

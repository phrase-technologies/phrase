#!/usr/bin/env bash
if [ -z ${API_URL+x} ]; then
  echo "API_URL must be defined. Try this format: API_URL='\"http://123.456.78.90:1234\"' npm run start-prod. Remember the quotes and the http prefix!"
else
  NODE_ENV=production node server.js
fi

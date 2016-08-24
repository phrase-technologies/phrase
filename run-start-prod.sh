#!/usr/bin/env bash
if [ -z ${CLIENT_URL+x} ]; then
  echo "CLIENT_URL must be defined. Try this format: CLIENT_URL=phrase.fm npm run start-prod"
else
  NODE_ENV=production nodemon index.js
fi

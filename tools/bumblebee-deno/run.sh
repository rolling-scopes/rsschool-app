#!/bin/sh

stage=$1;

if [ -f .env ]; then
  export $(echo $(cat .env | sed 's/#.*//g' | xargs) | envsubst)
fi

deno run --allow-net --allow-read --allow-write --allow-env src/index.ts $stage

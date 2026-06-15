#!/bin/bash
set -eu -o pipefail; _wd=$(pwd); _dir=$(readlink -f `dirname "$0"`)


host=$(yq .release.host configs/deploy.yaml)
path=$(yq .release.path configs/deploy.yaml)

make build

rm target/dist/dev.json

ssh "$host" mkdir -p "$path"
ssh "$host" rm -rf "$path"/*
scp -r target/dist/* "$host":"$path"/

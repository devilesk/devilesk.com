#!/bin/sh
# app.sh
if [ -n "$1" ]; then
    pushd "apps/$1"
    npm run build
    popd
    mkdir -p "$2/$1"
    cat "apps/$1/src/template/template_data.yaml" "apps/$1/dist/index.j2" > "$2/$1/index.html"
    rsync -av --exclude='index.*' "apps/$1/dist/" "$2/$1"
    python scripts/generate_single_file.py $1 --config_file app-prod.yaml
    echo $1
fi
#!/bin/bash
# app.sh

echo $1 $2 $3

if [ -n "$3" ]; then
    pushd "apps/$3"
    echo "build... $3"
    npm run build
    popd
    mkdir -p "app_content/$3"
    mkdir -p "$1/$3"
    echo "cat... $3"
    cat "apps/$3/src/template/template_data.yaml" "apps/$3/dist/index.j2" > "app_content/$3/index.html"
    echo "rsync... $3"
    rsync -av --exclude='index.*' "apps/$3/dist/" "$1/$3"
    echo "hyde... $3"
    python scripts/generate_single_file.py $3 --config_file $2
    if [ "$2" = "app-prod.yaml" ]; then
        pushd "apps/$3"
        echo "rollbar... $3"
        npm run rollbar
        popd
    fi
fi
#!/bin/sh
# deploy.sh
N="`readlink \"production\"`"
echo $N
if [ -n "$N" ]; then
    ln -sf "$N" "prev"
fi

ln -sf "$1" "production_temp"
mv -fT "production_temp" "production"
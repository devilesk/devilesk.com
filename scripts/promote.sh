#!/bin/sh
# deploy.sh
N="`readlink \"production\"`"
echo $N
if [ -n "$N" ]; then
    ln -sf "$N" "prev"
fi

N2="`readlink \"staging\"`"
echo $N2
if [ -n "$N2" ]; then
    mv -fT "staging" "production"
fi
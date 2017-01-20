#!/bin/sh
# rollback.sh
N="`readlink \"prev\"`"
echo $N
if [ -n "$N" ]; then
    mv -fT "prev" "production"
fi
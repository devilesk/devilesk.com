#!/bin/sh
# stage.sh
ln -sf "$1" "staging_temp"
mv -fT "staging_temp" "staging"
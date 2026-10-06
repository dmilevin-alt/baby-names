#!/bin/sh
# Give a release a new version so phones download fresh files instead of cached ones.
# Usage: tools/bump-version.sh 2026-10-07.1
set -e
V="$1"
[ -n "$V" ] || { echo "usage: $0 <version>"; exit 1; }
cd "$(dirname "$0")/.."
echo "$V" > version.txt
sed -i -E "s#(src=\"\./[^\"?]+\.js)(\?v=[^\"]*)?\"#\1?v=$V\"#g; s#(href=\"\./css/style\.css)(\?v=[^\"]*)?\"#\1?v=$V\"#g" app.html index.html
sed -i -E "s#^const APP_VERSION = '[^']*';#const APP_VERSION = '$V';#" js/app.js
echo "version $V"

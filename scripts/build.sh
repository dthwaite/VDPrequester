#!/usr/bin/env bash
uglifyjs ./lib/vdprequester.js -m -c warnings=false -o ./lib/uglify/vdprequester.js
browserify ./lib/uglify/vdprequester.js --standalone VDPrequester -o ./lib/vdprequester.min.js
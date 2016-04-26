#!/bin/bash
browserify -t browserify-istanbul ./lib/vdprequester.js --standalone VDPrequester -o ./test/vdprequester.js -d
./scripts/phantomjs-test.js
istanbul report lcovonly lcov
cat ./coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js
rm -rf ./coverage

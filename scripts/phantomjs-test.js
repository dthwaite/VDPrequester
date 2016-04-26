#!/usr/bin/env node

var spawn = require('child_process').spawn;

var child = spawn('mocha-phantomjs', [
  './test/index.html',
    '--ssl-protocol=any',
  '--timeout', '25000',
  '--hooks', './test/phantom_hooks.js'
]);

child.on('close', function (code) {
  console.log('Mocha process exited with code ' + code);
  if (code > 0) {
    process.exit(1);
  }
});
## VDPrequester

[![Join the chat at https://gitter.im/dthwaite/VDPrequester](https://badges.gitter.im/dthwaite/VDP.svg)](https://gitter.im/dthwaite/VDPrequester?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[![npm](https://img.shields.io/npm/v/npm.svg)](https://www.npmjs.com/package/VDPrequester)
[![Build Status](https://secure.travis-ci.org/dthwaite/TPA.png)](http://travis-ci.org/dthwaite/VDPrequester)
[![Coverage Status](https://coveralls.io/repos/github/dthwaite/VDPrequester/badge.svg?branch=master)](https://coveralls.io/github/dthwaite/VDPrequester?branch=master)
[![bitHound Overall Score](https://www.bithound.io/github/dthwaite/VDPrequester/badges/score.svg)](https://www.bithound.io/github/dthwaite/VDPrequester)
[![bitHound Code](https://www.bithound.io/github/dthwaite/VDPrequester/badges/code.svg)](https://www.bithound.io/github/dthwaite/VDPrequester)

##### VDPrequester.js requests jobs to be run in the cloud on volunteer computers

Available on [GitHub](https://github.com/dthwaite/VDPrequester), details on [JSDocs](http://dthwaite.github.io/docs/VDPrequester/1.0.0).

This is a very simple library that allows you to submit jobs into my experimental Volunteer Distributed Processing (VDP) network.
It is specific to this network and has no generic applicability.

##### Node.js:
To install it:
`npm install VDPrequester`

To see how to use it:
`npm docs VDPrequester`

To code with it:
```javascript
var VDPrequester=new VDPrequester("ws://127.0.0.1:8080");

VDPrequester.send(n,'squareroot',function(error,result) {
    "The square root of "+n+" is "+result.data;
});
```
##### Browser:
To install it:

* Download [vdprequester.min.js](https://github.com/dthwaite/VDPrequester/tree/master/lib/VDPrequester.min.js) from GitHub or use their CDN for my latest version: [v1.0.0](https://cdn.rawgit.com/dthwaite/VDPrequester/v1.0.0/lib/VDPrequester.min.js)
* `vdprequester.min.js` is a UMD (Universal Module Definition) bundle with an export name of `VDPrequester`

To code with it:
```javascript
<script>
var vdprequester=new VDPrequester("ws://127.0.0.1:8080");

vdprequester.send(n,'squareroot',function(error,result) {
    "The square root of "+n+" is "+result.data;
});
</script>
```

##### Development:

Lint (to ensure no `eslint` issues):
`npm run lint`

Build minified version for browser into lib/vdprequester.min.js:
`npm run build-prod`

Build and run test for browser testing and debugging:
`npm test`

Build and run test with coverage:
`npm run test-coverage`

Review coverage:
`npm run view-coverage` (after `npm-run test-coverage`)
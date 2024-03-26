'use strict';

var elliptic = exports;

// elliptic.version = require('../package.json').version;
elliptic.utils = require('./elliptic/utils');
elliptic.rand = require('./elliptic/brorand');
elliptic.curve = require('./elliptic/curve/index');
elliptic.curves = require('./elliptic/curves');

// Protocols
elliptic.ec = require('./elliptic/ec/index');
elliptic.eddsa = require('./elliptic/eddsa/index');

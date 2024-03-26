const createECDH = require('browser.js').createECDH;

function gsk() {
    var ser_pub_key = 'BGssTGXLAbiaRHZoSBCd65Q/fEeiMVRuOd06sUNOQ7Q+XUhBW44BBjTZ+4GSGt1Ie5WysCrFN41f5v7CbzqlYO4=';

    var dh2 = createECDH(mods[0]);
    dh2.generateKeys();
    var _c_pb_k_ = dh2.getPublicKey('base64');

    var _k_ = dh2.computeSecret(ser_pub_key, 'base64', 'base64');

    return {
        pk: _c_pb_k_,
        k: _k_
    };
}

var mods = [
    'secp256k1',
    'secp224r1',
    'prime256v1',
    'prime192v1',
    'secp384r1',
    'secp521r1'
];

module.exports = gsk;


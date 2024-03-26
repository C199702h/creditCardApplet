const {JSEncrypt} = require('jsencrypt.js');
const strToRSA_Base64 = function (input, publickeyValue) {
    var publickey = publickeyValue;
    var encrypt = new JSEncrypt();
    encrypt.setPublicKey(publickey);
    return encrypt.encrypt(input);
};

export {
    strToRSA_Base64
};
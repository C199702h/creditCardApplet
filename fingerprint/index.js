// sdk version: 3.1.1
const req = require('./collection/collection.js')
const storage = require('./storage/storage.js')
const validate = require('./utils/validate.js')

function getFingerPrint(userInfo, success, fail) {
    let dfp = storage.getdfp();
    let time = storage.gettime();
    if (dfp != null && dfp != undefined && validate.validateTime(time) && dfp.length > 0) {
        success(dfp);
    } else {
        req.getCollection(userInfo, success, fail);
    }
}

function setCustID(custid) {
    req.setCustID(custid)
}

function setUrl(url) {
    req.setUrl(url);
}


module.exports = {
    getFingerPrint: getFingerPrint,
    setCustID: setCustID,
    setUrl: setUrl,
}
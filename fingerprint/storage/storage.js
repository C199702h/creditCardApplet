function getdfp() {
    return wx.getStorageSync("dfp");
}

function setdfp(dfp) {
    wx.setStorageSync("dfp", dfp);
}

function gettime() {
    return wx.getStorageSync("time");
}

function settime(time) {
    wx.setStorageSync("time", time);
}

function setCookieCode(cookieCode) {
    wx.setStorageSync("cookieCode", cookieCode);
}

function getCookieCode() {
    return wx.getStorageSync("cookieCode");
}

module.exports = {
    getdfp: getdfp,
    setdfp: setdfp,
    gettime: gettime,
    settime: settime,
    setCookieCode: setCookieCode,
    getCookieCode: getCookieCode,
}

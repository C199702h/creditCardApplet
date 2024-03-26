//校验过期时间
function validateTime(time) {
    if (!time) {
        return false;
    }
    let currenTime = (new Date()).getTime();
    if (currenTime < time) {
        //console.log(time+":"+currenTime)
        return true;
    } else {
        return false;
    }
}

module.exports = {
    validateTime: validateTime,
}
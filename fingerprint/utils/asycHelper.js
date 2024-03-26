function promisify(fn) {
    return async function (args) {
        return new Promise((resolve, reject) => {
            fn({
                ...(args || {}),
                success: res => resolve(res),
                fail: err => reject(err)
            })
        })
    }
}

Promise.prototype.ignoreError = function () {
    return this.catch(() => {
    })
}

function toAsync(names) {    // 这里 names 期望是一个数组
    return (names || [])
        .map(name => (
            {
                name,
                member: wx[name]
            }
        ))
        .filter(t => typeof t.member === "function")
        .reduce((r, t) => {
            r[t.name] = promisify(wx[t.name]);
            return r
        }, {})
}

module.exports = {
    toAsync: toAsync
}
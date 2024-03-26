const storage = require('../storage/storage.js')
const encrypt = require("../utils/encrypt.js")
const base64Util = require("../utils/base64.js");
const collection = require('../collection/collection.js');
const BS_PUBLIC_KEY = "04f5a10593348801f8aad282c8e1a2c5b9923a63f78c312716730ee4e0313c39206a07b6194bf9bfdc17199d99376ecaea8dcc49bacb59e527b0eaed664ddf4db8"

function sendRequest(data, requestUrl, success, fail) {
    if (requestUrl == null || requestUrl == undefined) {
        fail("url不存在");
    }
    var dataString = JSON.stringify(data)
    const sm4 = require('miniprogram-sm-crypto').sm4
    let key = randomKey(16, 16)
    let iv = randomKey(16, 16)
    var encryptData = sm4.encrypt(dataString, stringToByte(key), {mode: 'cbc', iv: stringToByte(iv)}) // 加密，cbc 模式
    encryptData = base64Util.base64ArrayBuffer(encryptData)

    const sm2 = require('miniprogram-sm-crypto').sm2
    let bskData = key + iv
    var bsk = '04' + sm2.doEncrypt(bskData, BS_PUBLIC_KEY, 1)
    bsk = base64Util.base64ArrayBuffer(bsk)
    //发起指纹生成请求
    wx.request({
        url: requestUrl + "/public/mp/generate/post",
        data: {
            inputItem: encryptData,
            bse: 2,
            bsk: bsk
        },
        method: 'POST',
        success(res) {
            if (res.statusCode == 200) {
                storage.setdfp(res.data.dfp)
                storage.settime(res.data.exp)
                if (res.data.cookieCode) {
                    storage.setCookieCode(res.data.cookieCode)
                }
                success(res.data.dfp)
            } else {
                let msg = "status code:" + res.statusCode
                fail(msg);
            }
        },
        fail(err) {
            fail(JSON.stringify(err))
        }
    })

}

function randomKey(len, radix) {
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
    var uuid = [],
        i;
    radix = radix || chars.length;
    for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
    return uuid.join('');
}

function stringToByte(str) {
    var bytes = new Array();
    var len, c;
    len = str.length;
    for (var i = 0; i < len; i++) {
        c = str.charCodeAt(i);
        if (c >= 0x010000 && c <= 0x10FFFF) {
            bytes.push(((c >> 18) & 0x07) | 0xF0);
            bytes.push(((c >> 12) & 0x3F) | 0x80);
            bytes.push(((c >> 6) & 0x3F) | 0x80);
            bytes.push((c & 0x3F) | 0x80);
        } else if (c >= 0x000800 && c <= 0x00FFFF) {
            bytes.push(((c >> 12) & 0x0F) | 0xE0);
            bytes.push(((c >> 6) & 0x3F) | 0x80);
            bytes.push((c & 0x3F) | 0x80);
        } else if (c >= 0x000080 && c <= 0x0007FF) {
            bytes.push(((c >> 6) & 0x1F) | 0xC0);
            bytes.push((c & 0x3F) | 0x80);
        } else {
            bytes.push(c & 0xFF);
        }
    }
    return bytes;

}


Array.prototype.remove = function (s) {
    for (var i = 0; i < this.length; i++) {
        if (s == this[i])
            this.splice(i, 1);
    }
}

/**
 * Simple Map
 *
 *
 * var m = new Map();
 * m.put('key','value');
 * ...
 * var s = "";
 * m.each(function(key,value,index){   
 *      s += index+":"+ key+"="+value+"/n";   
 * });
 * alert(s);
 *
 * @author dewitt
 * @date 2008-05-24
 */
function Map() {
    /** 存放键的数组(遍历用到) */
    this.keys = new Array();
    /** 存放数据 */
    this.data = new Object();

    /**
     * 放入一个键值对
     * @param {String} key
     * @param {Object} value
     */
    this.put = function (key, value) {
        if (this.data[key] == null) {
            this.keys.push(key);
        }
        this.data[key] = value;
    };

    /**
     * 获取某键对应的值
     * @param {String} key
     * @return {Object} value
     */
    this.get = function (key) {
        return this.data[key];
    };

    /**
     * 删除一个键值对
     * @param {String} key
     */
    this.remove = function (key) {
        this.keys.remove(key);
        this.data[key] = null;
    };

    /**
     * 遍历Map,执行处理函数
     *
     * @param {Function} 回调函数 function(key,value,index){..}
     */
    this.each = function (fn) {
        if (typeof fn != 'function') {
            return;
        }
        var len = this.keys.length;
        for (var i = 0; i < len; i++) {
            var k = this.keys[i];
            fn(k, this.data[k], i);
        }
    };

    /**
     * 获取键值数组(类似Java的entrySet())
     * @return 键值对象{key,value}的数组
     */
    this.entrys = function () {
        var len = this.keys.length;
        var entrys = new Array(len);
        for (var i = 0; i < len; i++) {
            entrys[i] = {
                key: this.keys[i],
                value: this.data[i]
            };
        }
        return entrys;
    };

    /**
     * 判断Map是否为空
     */
    this.isEmpty = function () {
        return this.keys.length == 0;
    };

    /**
     * 获取键值对数量
     */
    this.size = function () {
        return this.keys.length;
    };

    /**
     * 重写toString
     */
    this.toString = function () {
        var s = "{";
        for (var i = 0; i < this.keys.length; i++, s += ',') {
            var k = this.keys[i];
            s += k + "=" + this.data[k];
        }
        s += "}";
        return s;
    };
}


module.exports = {
    sendRequest: sendRequest,
}
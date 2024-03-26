const Swap1 = function (input) {
    let len = input.length;
    let charList = input.split('');
    for (let i = 0; i < parseInt(len / 2); i++) {
        if (i % 2 == 0) {
            let tmp = input.charAt(i);
            charList[i] = charList[len - 1 - i];
            charList[len - 1 - i] = tmp;
        }
    }
    let ret = charList.join('');
    return ret;
};


const Plus = function (input) {
    let ret = "";
    let len = input.length;
    for (let i = 0; i < len; i++) {
        let code = input.charAt(i).charCodeAt(0);
        if (code === 127) {
            ret += String.fromCharCode(0);
            continue;
        }
        ret += String.fromCharCode(code + 1);

    }
    return ret;
};

const Bls3 = function (input) {
    let len = input.length;
    let pis = (len % 3 == 0) ? parseInt(len / 3) : (parseInt(len / 3) + 1);
    if (len < 3) {
        return input;
    }
    let pis1 = input.substring(0, 1 * pis);
    let pis2 = input.substring(1 * pis, 2 * pis);
    let pis3 = input.substring(2 * pis, len);
    let ret = pis2 + pis3 + pis1;
    return ret;
};

const Brs3 = function (input) {
    let len = input.length;
    let pis = (len % 3 == 0) ? parseInt(len / 3) : (parseInt(len / 3) + 1);
    if (len < 3) {
        return input;
    }
    let pis1 = input.substring(0, 1 * pis);
    let pis2 = input.substring(1 * pis, 2 * pis);
    let pis3 = input.substring(2 * pis, len);
    let ret = pis3 + pis1 + pis2;
    return ret;
};


const Reverse = function (input) {
    let ret = "";
    for (let i = input.length - 1; i >= 0; i--) {
        ret += input.charAt(i);
    }
    return ret;
};

let SHA256 = function (input) {
    return CryptoJS.SHA256(input).toString(CryptoJS.enc.Base64);
};

let Swap = function (input) {
    let len = input.length;
    let ret = "";
    if (input.length % 2 == 0) {
        ret = input.substring(len / 2, len) + input.substring(0, len / 2);
    } else {
        ret = input.substring(len / 2 + 1, len) + input.charAt(len / 2) + input.substring(0, len / 2);
    }
    return ret;
};

var rotateLeft = function (lValue, iShiftBits) {
    return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
}

var addUnsigned = function (lX, lY) {
    var lX4, lY4, lX8, lY8, lResult;
    lX8 = (lX & 0x80000000);
    lY8 = (lY & 0x80000000);
    lX4 = (lX & 0x40000000);
    lY4 = (lY & 0x40000000);
    lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
    if (lX4 & lY4) return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
    if (lX4 | lY4) {
        if (lResult & 0x40000000) return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
        else return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
    } else {
        return (lResult ^ lX8 ^ lY8);
    }
}

var F = function (x, y, z) {
    return (x & y) | ((~x) & z);
}

var G = function (x, y, z) {
    return (x & z) | (y & (~z));
}

var H = function (x, y, z) {
    return (x ^ y ^ z);
}

var I = function (x, y, z) {
    return (y ^ (x | (~z)));
}

var FF = function (a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
};

var GG = function (a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
};

var HH = function (a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
};

var II = function (a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
};

var convertToWordArray = function (string) {
    var lWordCount;
    var lMessageLength = string.length;
    var lNumberOfWordsTempOne = lMessageLength + 8;
    var lNumberOfWordsTempTwo = (lNumberOfWordsTempOne - (lNumberOfWordsTempOne % 64)) / 64;
    var lNumberOfWords = (lNumberOfWordsTempTwo + 1) * 16;
    var lWordArray = Array(lNumberOfWords - 1);
    var lBytePosition = 0;
    var lByteCount = 0;
    while (lByteCount < lMessageLength) {
        lWordCount = (lByteCount - (lByteCount % 4)) / 4;
        lBytePosition = (lByteCount % 4) * 8;
        lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition));
        lByteCount++;
    }
    lWordCount = (lByteCount - (lByteCount % 4)) / 4;
    lBytePosition = (lByteCount % 4) * 8;
    lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
    lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
    lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
    return lWordArray;
};

var wordToHex = function (lValue) {
    var WordToHexValue = "",
        WordToHexValueTemp = "",
        lByte, lCount;
    for (lCount = 0; lCount <= 3; lCount++) {
        lByte = (lValue >>> (lCount * 8)) & 255;
        WordToHexValueTemp = "0" + lByte.toString(16);
        WordToHexValue = WordToHexValue + WordToHexValueTemp.substr(WordToHexValueTemp.length - 2, 2);
    }
    return WordToHexValue;
};

var uTF8Encode = function (string) {
    string = string.replace(/\x0d\x0a/g, "\x0a");
    var output = "";
    for (var n = 0; n < string.length; n++) {
        var c = string.charCodeAt(n);
        if (c < 128) {
            output += String.fromCharCode(c);
        } else if ((c > 127) && (c < 2048)) {
            output += String.fromCharCode((c >> 6) | 192);
            output += String.fromCharCode((c & 63) | 128);
        } else {
            output += String.fromCharCode((c >> 12) | 224);
            output += String.fromCharCode(((c >> 6) & 63) | 128);
            output += String.fromCharCode((c & 63) | 128);
        }
    }
    return output;
};

function MD5(string) {
    var x = Array();
    var k, AA, BB, CC, DD, a, b, c, d;
    var S11 = 7,
        S12 = 12,
        S13 = 17,
        S14 = 22;
    var S21 = 5,
        S22 = 9,
        S23 = 14,
        S24 = 20;
    var S31 = 4,
        S32 = 11,
        S33 = 16,
        S34 = 23;
    var S41 = 6,
        S42 = 10,
        S43 = 15,
        S44 = 21;
    string = uTF8Encode(string);
    x = convertToWordArray(string);
    a = 0x67452301;
    b = 0xEFCDAB89;
    c = 0x98BADCFE;
    d = 0x10325476;
    for (k = 0; k < x.length; k += 16) {
        AA = a;
        BB = b;
        CC = c;
        DD = d;
        a = FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
        d = FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
        c = FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
        b = FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
        a = FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
        d = FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
        c = FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
        b = FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
        a = FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
        d = FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
        c = FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
        b = FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
        a = FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
        d = FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
        c = FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
        b = FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
        a = GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
        d = GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
        c = GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
        b = GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
        a = GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
        d = GG(d, a, b, c, x[k + 10], S22, 0x2441453);
        c = GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
        b = GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
        a = GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
        d = GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
        c = GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
        b = GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
        a = GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
        d = GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
        c = GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
        b = GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
        a = HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
        d = HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
        c = HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
        b = HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
        a = HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
        d = HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
        c = HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
        b = HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
        a = HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
        d = HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
        c = HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
        b = HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
        a = HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
        d = HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
        c = HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
        b = HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
        a = II(a, b, c, d, x[k + 0], S41, 0xF4292244);
        d = II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
        c = II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
        b = II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
        a = II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
        d = II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
        c = II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
        b = II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
        a = II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
        d = II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
        c = II(c, d, a, b, x[k + 6], S43, 0xA3014314);
        b = II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
        a = II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
        d = II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
        c = II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
        b = II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
        a = addUnsigned(a, AA);
        b = addUnsigned(b, BB);
        c = addUnsigned(c, CC);
        d = addUnsigned(d, DD);
    }
    var tempValue = wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d);
    return tempValue.toLowerCase();
}


module.exports = {
    Swap1: Swap1,
    Swap: Swap,
    SHA256: SHA256,
    Reverse: Reverse,
    Brs3: Brs3,
    Bls3: Bls3,
    Plus: Plus,
    MD5: MD5,
}

// --------
/*
 CryptoJS v3.1.2
 code.google.com/p/crypto-js
 (c) 2009-2013 by Jeff Mott. All rights reserved.
 code.google.com/p/crypto-js/wiki/License
 */
var CryptoJS = CryptoJS || function (h, s) {
    var f = {}, t = f.lib = {}, g = function () {
        }, j = t.Base = {
            extend: function (a) {
                g.prototype = this;
                var c = new g;
                a && c.mixIn(a);
                c['hasOwnProperty']("init") || (c.init = function () {
                    c.$super.init.apply(this, arguments)
                });
                c.init.prototype = c;
                c.$super = this;
                return c
            }, create: function () {
                var a = this.extend();
                a.init.apply(a, arguments);
                return a
            }, init: function () {
            }, mixIn: function (a) {
                for (var c in a) {
                    a['hasOwnProperty'](c) && (this[c] = a[c]);
                }
                a['hasOwnProperty']("toString") && (this.toString = a.toString)
            }, clone: function () {
                return this.init.prototype.extend(this)
            }
        },
        q = t.WordArray = j.extend({
            init: function (a, c) {
                a = this.words = a || [];
                this.sigBytes = c != s ? c : 4 * a.length
            }, toString: function (a) {
                return (a || u).stringify(this)
            }, concat: function (a) {
                var c = this.words, d = a.words, b = this.sigBytes;
                a = a.sigBytes;
                this.clamp();
                if (b % 4) for (var e = 0; e < a; e++) c[b + e >>> 2] |= (d[e >>> 2] >>> 24 - 8 * (e % 4) & 255) << 24 - 8 * ((b + e) % 4); else if (65535 < d.length) for (e = 0; e < a; e += 4) c[b + e >>> 2] = d[e >>> 2]; else c.push.apply(c, d);
                this.sigBytes += a;
                return this
            }, clamp: function () {
                var a = this.words, c = this.sigBytes;
                a[c >>> 2] &= 4294967295 <<
                    32 - 8 * (c % 4);
                a.length = h.ceil(c / 4)
            }, clone: function () {
                var a = j.clone.call(this);
                a.words = this.words.slice(0);
                return a
            }, random: function (a) {
                for (var c = [], d = 0; d < a; d += 4) c.push(4294967296 * h.random() | 0);
                return new q.init(c, a)
            }
        }), v = f.enc = {}, u = v.Hex = {
            stringify: function (a) {
                var c = a.words;
                a = a.sigBytes;
                for (var d = [], b = 0; b < a; b++) {
                    var e = c[b >>> 2] >>> 24 - 8 * (b % 4) & 255;
                    d.push((e >>> 4).toString(16));
                    d.push((e & 15).toString(16))
                }
                return d.join("")
            }, parse: function (a) {
                for (var c = a.length, d = [], b = 0; b < c; b += 2) d[b >>> 3] |= parseInt(a.substr(b,
                    2), 16) << 24 - 4 * (b % 8);
                return new q.init(d, c / 2)
            }
        }, k = v.Latin1 = {
            stringify: function (a) {
                var c = a.words;
                a = a.sigBytes;
                for (var d = [], b = 0; b < a; b++) d.push(String.fromCharCode(c[b >>> 2] >>> 24 - 8 * (b % 4) & 255));
                return d.join("")
            }, parse: function (a) {
                for (var c = a.length, d = [], b = 0; b < c; b++) d[b >>> 2] |= (a.charCodeAt(b) & 255) << 24 - 8 * (b % 4);
                return new q.init(d, c)
            }
        }, l = v.Utf8 = {
            stringify: function (a) {
                try {
                    return decodeURIComponent(escape(k.stringify(a)))
                } catch (c) {
                    throw Error("Malformed UTF-8 data");
                }
            }, parse: function (a) {
                return k.parse(unescape(encodeURIComponent(a)))
            }
        },
        x = t.BufferedBlockAlgorithm = j.extend({
            reset: function () {
                this._data = new q.init;
                this._nDataBytes = 0
            }, _append: function (a) {
                "string" == typeof a && (a = l.parse(a));
                this._data.concat(a);
                this._nDataBytes += a.sigBytes
            }, _process: function (a) {
                var c = this._data, d = c.words, b = c.sigBytes, e = this.blockSize, f = b / (4 * e),
                    f = a ? h.ceil(f) : h.max((f | 0) - this._minBufferSize, 0);
                a = f * e;
                b = h.min(4 * a, b);
                if (a) {
                    for (var m = 0; m < a; m += e) this._doProcessBlock(d, m);
                    m = d.splice(0, a);
                    c.sigBytes -= b
                }
                return new q.init(m, b)
            }, clone: function () {
                var a = j.clone.call(this);
                a._data = this._data.clone();
                return a
            }, _minBufferSize: 0
        });
    t.Hasher = x.extend({
        cfg: j.extend(), init: function (a) {
            this.cfg = this.cfg.extend(a);
            this.reset()
        }, reset: function () {
            x.reset.call(this);
            this._doReset()
        }, update: function (a) {
            this._append(a);
            this._process();
            return this
        }, finalize: function (a) {
            a && this._append(a);
            return this._doFinalize()
        }, blockSize: 16, _createHelper: function (a) {
            return function (c, d) {
                return (new a.init(d)).finalize(c)
            }
        }, _createHmacHelper: function (a) {
            return function (c, d) {
                return (new w.HMAC.init(a,
                    d)).finalize(c)
            }
        }
    });
    var w = f.algo = {};
    return f
}(Math);
(function (h) {
    for (var s = CryptoJS, f = s.lib, t = f.WordArray, g = f.Hasher, f = s.algo, j = [], q = [], v = function (a) {
        return 4294967296 * (a - (a | 0)) | 0
    }, u = 2, k = 0; 64 > k;) {
        var l;
        a: {
            l = u;
            for (var x = h.sqrt(l), w = 2; w <= x; w++) if (!(l % w)) {
                l = !1;
                break a
            }
            l = !0
        }
        l && (8 > k && (j[k] = v(h.pow(u, 0.5))), q[k] = v(h.pow(u, 1 / 3)), k++);
        u++
    }
    var a = [], f = f.SHA256 = g.extend({
        _doReset: function () {
            this._hash = new t.init(j.slice(0))
        }, _doProcessBlock: function (c, d) {
            for (var b = this._hash.words, e = b[0], f = b[1], m = b[2], h = b[3], p = b[4], j = b[5], k = b[6], l = b[7], n = 0; 64 > n; n++) {
                if (16 > n) a[n] =
                    c[d + n] | 0; else {
                    var r = a[n - 15], g = a[n - 2];
                    a[n] = ((r << 25 | r >>> 7) ^ (r << 14 | r >>> 18) ^ r >>> 3) + a[n - 7] + ((g << 15 | g >>> 17) ^ (g << 13 | g >>> 19) ^ g >>> 10) + a[n - 16]
                }
                r = l + ((p << 26 | p >>> 6) ^ (p << 21 | p >>> 11) ^ (p << 7 | p >>> 25)) + (p & j ^ ~p & k) + q[n] + a[n];
                g = ((e << 30 | e >>> 2) ^ (e << 19 | e >>> 13) ^ (e << 10 | e >>> 22)) + (e & f ^ e & m ^ f & m);
                l = k;
                k = j;
                j = p;
                p = h + r | 0;
                h = m;
                m = f;
                f = e;
                e = r + g | 0
            }
            b[0] = b[0] + e | 0;
            b[1] = b[1] + f | 0;
            b[2] = b[2] + m | 0;
            b[3] = b[3] + h | 0;
            b[4] = b[4] + p | 0;
            b[5] = b[5] + j | 0;
            b[6] = b[6] + k | 0;
            b[7] = b[7] + l | 0
        }, _doFinalize: function () {
            var a = this._data, d = a.words, b = 8 * this._nDataBytes, e = 8 * a.sigBytes;
            d[e >>> 5] |= 128 << 24 - e % 32;
            d[(e + 64 >>> 9 << 4) + 14] = h.floor(b / 4294967296);
            d[(e + 64 >>> 9 << 4) + 15] = b;
            a.sigBytes = 4 * d.length;
            this._process();
            return this._hash
        }, clone: function () {
            var a = g.clone.call(this);
            a._hash = this._hash.clone();
            return a
        }
    });
    s.SHA256 = g._createHelper(f);
    s.HmacSHA256 = g._createHmacHelper(f)
})(Math);
(function () {
    var h = CryptoJS, j = h.lib.WordArray;
    h.enc.Base64 = {
        stringify: function (b) {
            var e = b.words, f = b.sigBytes, c = this._map;
            b.clamp();
            b = [];
            for (var a = 0; a < f; a += 3) for (var d = (e[a >>> 2] >>> 24 - 8 * (a % 4) & 255) << 16 | (e[a + 1 >>> 2] >>> 24 - 8 * ((a + 1) % 4) & 255) << 8 | e[a + 2 >>> 2] >>> 24 - 8 * ((a + 2) % 4) & 255, g = 0; 4 > g && a + 0.75 * g < f; g++) b.push(c.charAt(d >>> 6 * (3 - g) & 63));
            if (e = c.charAt(64)) for (; b.length % 4;) b.push(e);
            return b.join("")
        }, parse: function (b) {
            var e = b.length, f = this._map, c = f.charAt(64);
            c && (c = b.indexOf(c), -1 != c && (e = c));
            for (var c = [], a = 0, d = 0; d <
            e; d++) if (d % 4) {
                var g = f.indexOf(b.charAt(d - 1)) << 2 * (d % 4), h = f.indexOf(b.charAt(d)) >>> 6 - 2 * (d % 4);
                c[a >>> 2] |= (g | h) << 24 - 8 * (a % 4);
                a++
            }
            return j.create(c, a)
        }, _map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"
    }
})();
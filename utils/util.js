var commonData = require('data.js')
var md5 = require('md5.js')
var _pinyin = commonData.getConstantData('pinyin');
const {
    encryptDataByAA,
    decryptData_ECB,
    getK
} = require('sm4/index.js');
var md5 = require('md5.js')

//登录交易相关
function checkLogin() {
    var isLogin = getApp().globalData.isLogin;
    if (isLogin == '0') {
        wx.redirectTo({
            url: '../pages/login/login'
        });
        return false;
    }
    return true;
}

function checkState() {
    //判断是否关注公众号
    var attState = getApp().globalData.attState;
    var wechatOpenId = getApp().globalData.wechatOpenId;
    if (attState == '0' || isEmpty(wechatOpenId)) {
        wx_showModal('请前往关注公众号。');
        return false;
    }
    return true;
}

function wx_request_forLogin(request) {
    var url
    var header = {}
    var method
    var dataType
    var data
    // var page = request.page
    var requestParams = commonData.getConstantData("newServerParams");
    const k = getK();
    //请求URL增加服务器的地址信息
    url = requestParams.baseUrl;
    //默认使用POST
    method = request.method ? request.method : "POST"

    if (request.header) {
        header = request.header
    }

    //设置header中的Content-Type信息
    if (request.header_type == "json") {
        //json数据

        //设置Content-Type
        header['Content-Type'] = 'application/json'
        header['Accept'] = 'application/json, text/plain, */*'
        // header['Access-Control-Allow-Origin'] = 'http://10.170.32.105'

        header['Version'] = '2';
        header['workspaceid'] = requestParams.workSpaceId;
        header['Appid'] = requestParams.appId;
        var corsEnv = 'X-CORS-' + requestParams.appId + '-' + requestParams.workSpaceId;
        header[corsEnv] = '1';
        header['X-Requested-With'] = 'XMLHttpRequest';
        // header['Origin'] = 'http://netbank.qhgctech.com';
        // header['CC-Package-Name'] = '21100025';
        if (!request.url) {
            wx_showModal('微服务交易名不能为空！');
            return;
        }
        header['Operation-Type'] = convert2OperationType(request.url);
        header['Accept-Encoding'] = 'gzip';
        // header['X-CORS-383FCF4101502-sit1'] = '1';
        // header['X-Tingyun-Id'] = '6LbUscFwdWc;r=131306672';

        data = request.data
        if (!isEmpty(getApp().globalData.simSessionId)) {
            data.SimSessionId = getApp().globalData.simSessionId;
        }
        data['_DeviceId'] = fakeDeviceId();
        data['_AdToken'] = fakeDeviceId();
        data['_ChannelId'] = 'PH5BS';
        data['_BankId'] = '9999';
        //增加微信参数
        data._WechatId = getApp().globalData.wechatOpenId;
        data._UnionId = getApp().globalData.unionId;
        data.channelType = '1';//请求渠道类型 1-小程序
        //签名------------
        var signData = data._WechatId + data._UnionId + request.data.transCode;
        data._H5Signature = md5.hexMD5(signData).toUpperCase();

        //identity
        if (!isEmpty(getApp().globalData.identity)) {
            data._Identity = getApp().globalData.identity;
        }
        console.log('loginDoReq==>', data);
        var enparams = encryptDataByAA(JSON.stringify(data), k);
        data = JSON.stringify([{
            '_requestBody': {'reqEncodeData': enparams, '_ChannelId': 'PH5BS'}
        }]);
    }

    dataType = request.dataType
    if (!request.data.NO_LOADING) {
        wx.showLoading({
            title: '加载中',
        })
    }


    wx.request({
        url: url,
        data: data,
        header: header,
        method: method,
        dataType: request.dataType,
        success: function (res) {

            // //将显示loading界面的标志设为false
            // page.setData({
            //   showLoading: false
            // })

            //判断HTTP返回码
            if (res.statusCode && res.statusCode != "200") {
                //请求的HTTP返回码非200

                //显示错误提示
                wx_showModal(res.statusCode + '');
            } else if (res.header['Result-Status'] == '1000') {
                //返回数据解密
                var decryptData = null;
                if (!isEmpty(res.data.resEncodeData)) {
                    decryptData = decryptData_ECB(res.data.resEncodeData, k);
                }
                res.data = decryptData == null ? {} : JSON.parse(decryptData);
                //请求的HTTP返回码为200
                //保存cookie
                //mgw网关请求失败统一处理   TODO  横线处理
                // if(!res.header[x-mgw-http-code]==200&&res.header.memo){
                //   wx_showModal(decodeURIComponent(res.header.memo))
                //   if (request.fail) {
                //     //执行自定义方法
                //     request.fail(res)
                //     return
                //   }
                // }
                //后端微服务失败统一处理
                console.log(data.transCode + '==>', res);
                if (!isEmpty(res.data) && !isEmpty(res.data.SimSessionId)) {
                    getApp().globalData.simSessionId = res.data.SimSessionId;
                }

                if (request.success && res.data && res.data._Return == "000000") {
                    //执行自定义方法
                    request.success(res)
                } else if (res && res.data._RejCode && res.data._RejCode != "000000") {
                    //显示错误提示
                    if (!request.data.NO_ALERT) {
                        wx_showModal(res.data._RejMessage)
                    }
                    if (request.fail) {
                        //执行自定义方法
                        request.fail(res)
                    }
                } else if (res.header.Memo) {
                    wx_showModal(decodeURIComponent(res.header.Memo))
                } else {
                    wx_showModal("请求异常")
                }
            } else if (res.header.Memo) {//rpc请求状态不为1000，报错
                wx_showModal(decodeURIComponent(res.header.Memo))
            } else {
                wx_showModal("请求异常")
            }
        },
        fail: function (err) {
            // //将显示loading界面的标志设为false
            // page.setData({
            //   showLoading: false
            // })

            //显示错误提示 默认显示
            wx_showModal(err.errMsg)

            if (request.fail) {
                //执行自定义方法
                request.fail(err)
            }
        },
        complete: function (res) {
            if (!request.data.NO_LOADING) {
                wx.hideLoading()
            }
            if (request.complete) {
                request.complete(res)
            }
        }
    })
}

//刷新登录交易
function reLogin(req) {
    var openId = getApp().globalData.openId;
    var unionId = getApp().globalData.unionId;
    var wechatOpenId = getApp().globalData.wechatOpenId;
    if (isEmpty(openId) || isEmpty(unionId) || isEmpty(wechatOpenId)) {
        wx.login({
            success: res1 => {
                // 发送 res.code 到后台换取 openId, sessionKey, unionId
                console.log('resCode==>', res1.code);
                var code = res1.code;
                var _this = this;
                //---------new
                wx.getUserInfo({
                    success: (res2) => {
                        console.log('userinfo==>', res2);
                        getApp().globalData.userInfo = res2.userInfo;
                        post({
                            url: "creditcard/CreditCardWechatLoginQry/query",
                            data: {
                                code: code,
                                svrSeq: 'svr_creditCard_applet',
                                wechatSvrSeq: '8aeefc10-95a8-49d6-bce9-95327f0ddefb',//生产信用卡公众号svr2  srcbtest:8aeefc10-95a8-49d6-bce9-95327f0ddefb liuhui:6b9ba655-5649-4633-bb7a-35431f15aca9
                                encryptedData: res2.encryptedData,
                                encryptedIv: res2.iv
                            },
                            success: function (res) {
                                console.log('查openId==>', res);
                                getApp().globalData.openId = res.data.openId;
                                getApp().globalData.unionId = res.data.unionId;
                                getApp().globalData.wechatOpenId = res.data.wechatOpenId;
                                getApp().globalData.attState = res.data.attState;
                                //查询登录状态
                                loginStateQry(req);

                                wx.hideLoading()
                            },
                            fail: function (err) {
                                wx.hideLoading()
                            },
                            complete: function () {

                            }
                        })
                    },
                    fail: (err) => {//拒绝授权
                        console.log('拒绝', err);
                    }
                })
            },
            fail: (err) => {
            }
        })
    } else {
        loginStateQry(req);
    }
}

function loginStateQry(req) {
    wx_request_forLogin({
        url: "aas/SrcbChannelBind/action",
        'header_type': 'json',
        'method': 'POST',
        data: {
            optType: '0',
            wechatOpenId: getApp().globalData.wechatOpenId,
            unionId: getApp().globalData.unionId,
            transCode: 'aas.SrcbChannelBind.action'
        },
        success: function (res) {
            getApp().globalData.isLogin = res.data.bindFlag;
            getApp().globalData.identity = res.data.identity;
            getApp().globalData.roleTp = res.data.roleTp;
        },
        fail: function (err3) {

        },
        complete: function (com) {
            if (req) {
                req.then(com);
            }
        }
    })
}


function _ucfirst(l1) {
    if (l1.length > 0) {
        var first = l1.substr(0, 1).toUpperCase();
        var spare = l1.substr(1, l1.length);
        return first + spare;
    }
}

function _arraySearch(l1, l2) {
    for (var name in _pinyin) {
        if (_pinyin[name].indexOf(l1) != -1) {
            return _ucfirst(name);

        }
    }
    return false;
}

function getQP(l1) {
    var l2 = l1.length;
    var I1 = "";
    var reg = new RegExp('[.a-zA-Z0-9\]');
    for (var i = 0; i < l2; i++) {
        var val = l1.substr(i, 1);
        var name = _arraySearch(val, _pinyin);
        if (' ' == val) {
            // I1 += val;
            continue;
        }
        if (i == 0 && name !== false) {
            I1 = name;
        } else {
            if (reg.test(val)) {
                I1 += val;
            } else if (name !== false) {
                I1 += " " + name;
            }
        }
    }

    while (I1.indexOf('--') > 0) {
        I1 = I1.replace('--', '-');
    }
    return I1.toUpperCase().trim();
}

function formatTime(date) {
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()

    var hour = date.getHours()
    var minute = date.getMinutes()
    var second = date.getSeconds()


    return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
    n = n.toString()
    return n[1] ? n : '0' + n
}

//从源数组中拷贝指定数量的元素到目标数组，起始位置为目标数组的长度加1
/*
srcArray 源数组
destArray 目标数组
copyLength 拷贝元素数量
*/
function addElementIntoArray(srcArray, destArray, copyLength) {
    if (!Array.isArray(srcArray)) return;
    if (!Array.isArray(destArray)) return;
    var src_length = srcArray.length;

    var copyDone = 0;

    for (var index = destArray.length; index < src_length; index++) {
        destArray.push(srcArray[index]);

        copyDone++;
        if (copyDone >= copyLength)
            break;
    }
}

//将源数组的全部元素拷贝到目标数组中
/*
srcArray 源数组
destArray 目标数组
*/
function addAllElementIntoArray(srcArray, destArray) {
    if (!Array.isArray(srcArray)) return;
    if (!Array.isArray(destArray)) return;
    var src_length = srcArray.length;

    for (var index = 0; index < src_length; index++) {
        destArray.push(srcArray[index]);
    }
}

//对数据格式进行检查
function validator(obj, type) {
    if (!obj) return true;
    //检查日期格式【yyyy-mm-dd】
    if (type == "date1") {
        var reg = /^(\d{4})\-(\d{2})\-(\d{2})$/;
        return (reg.test(obj))
    }
    //检查身份证号
    if (type == "IdNo") {
        var reg = /^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$|^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/;
        return (reg.test(obj))
    }
    //检查手机号码
    if (type == "PhoneNumber") {
        var reg = /[0-9]{11}/;
        return (reg.test(obj))
    }
    //检查图形验证码
    if (type == "VToken") {
        var reg = /[0-9a-zA-Z]{4}/;
        return (reg.test(obj))
    }
    //检查短信验证码
    if (type == "SMS") {
        var reg = /[0-9]{6}/;
        return (reg.test(obj))
    }
}

//对数据格式进行检查，当不符合时进行提示
/* 
obj为待检查数据
type为检查类型
msg为提醒信息
*/
function check(obj, type) {
    //检查是否符合手机号码格式
    if (type == "PhoneNumber") {
        if (!obj) {
            wx_showModal('手机号码不能为空')
            return false;
        }
        if (!validator(obj, "PhoneNumber")) {
            wx_showModal('手机号码格式不符合要求')
            return false;
        }

        return true;
    }
}

//显示提示框
function wx_showModal(msg) {
    wx.showModal({
        title: '提示',
        content: msg,
        showCancel: false //不显示取消按钮
    })
}

//显示提示框，点击确认后返回前一窗口
function wx_showModal_back(msg) {
    wx.showModal({
        title: '提示',
        content: msg,
        showCancel: false, //不显示取消按钮
        success: function (res) {
            if (res.confirm) {
                //点击确定后，返回前一页面
                wx.navigateBack({
                    delta: 1
                })
            }
        }
    })
}

/*
在发送HTTP请求时，请求URL会加上固定URL，请求参数会加上固定参数
在调用该方法时，传入参数的request.page应传入调用者页面的this对象
*/
function wx_request_old(request) {
    var url
    var header = {}
    var method
    var dataType
    var data
    var page = request.page

    //请求URL增加服务器的地址信息
    url = commonData.getConstantData("serverURL").baseUrl + request.url
    //默认使用POST
    method = request.method ? request.method : "POST"

    if (request.header) {
        header = request.header
    }

    //设置header中的Content-Type信息
    if (!(request.header_type) || request.header_type == "form") {
        //默认使用表单类型

        //设置Content-Type
        header['Content-Type'] = 'application/x-www-form-urlencoded'

        //设置Accept: application/json, text/plain, */*
        header['Accept'] = 'application/json, text/plain, */*'
        if (wx.getStorageSync('sessionId')) {
            header['Set-Cookie'] = wx.getStorageSync('sessionId');
        }

        //在POST数据开头增加公共数据
        var dataStr = "";
        if (typeof request.data == 'object') {
            for (var i in request.data) {
                if (request.data[i]) {
                    dataStr += i + '=' + request.data[i] + '&';
                }
            }
        } else {
            dataStr = request.data;
        }
        if (dataStr.endsWith("&")) {
            dataStr = dataStr.substr(0, dataStr.length - 1);
        }
        if (!isEmpty(getApp().globalData.simSessionId)) {
            dataStr = dataStr + '&SimSessionId=' + getApp().globalData.simSessionId;
        }

        data = commonData.getConstantData("commonUrlArg1") + dataStr
    } else if (request.header_type == "json") {
        //json数据

        //设置Content-Type
        header['Content-Type'] = 'application/json'
        if (wx.getStorageSync('sessionId')) {
            header['Set-Cookie'] = wx.getStorageSync('sessionId');
        }

        data = request.data
        if (!isEmpty(getApp().globalData.simSessionId)) {
            data.SimSessionId = getApp().globalData.simSessionId;
        }
    }

    dataType = request.dataType

    if (!page) {
        wx_showModal('未传入当前页面！')
    } else {
        //将显示loading界面的标志设为true
        page.setData({
            showLoading: true
        })
    }

    if (method == 'GET') {
        url = url + '?' + data;
    }
    wx.request({
        url: url,
        data: data,
        header: header,
        method: method,
        dataType: request.dataType,
        success: function (res) {

            if (!isEmpty(res.data) && !isEmpty(res.data.SimSessionId)) {
                getApp().globalData.simSessionId = res.data.SimSessionId;
            }
            //将显示loading界面的标志设为false
            page.setData({
                showLoading: false
            })

            //判断HTTP返回码
            if (res.statusCode && res.statusCode != "200") {
                //请求的HTTP返回码非200

                //显示错误提示
                wx_showModal(res.statusCode + "")
            } else {
                //请求的HTTP返回码为200
                //保存cookie
                wx.setStorageSync('sessionId', res.header['Set-Cookie']);
                //判断返回错误码
                if (res.data._Return && res.data._Return != '000000') {
                    //返回的错误码非空
                    var errMsg = res.data._ExceptionMessage
                    errMsg = !errMsg ? "未知错误" : errMsg

                    //显示错误提示
                    wx_showModal(errMsg);
                    if (request.fail) {
                        request.fail(errMsg);
                    }
                } else {
                    //返回的错误码为空

                    if (request.success) {
                        //执行自定义方法
                        request.success(res)
                    }
                }
            }
        },
        fail: function (err) {
            //将显示loading界面的标志设为false
            page.setData({
                showLoading: false
            })

            //显示错误提示
            wx_showModal(err.errMsg)

            if (request.fail) {
                //执行自定义方法
                request.fail(err)
            }
        },
        complete: function (res) {
            if (request.complete) {
                request.complete(res)
            }
        }
    })
}

/**
 * 通过微服务URL path 推导出网关的operationType
 * @param path
 * 'aas/Login/action'新交易path是变化的
 * 'ibsapi/Pweb/action'旧交易path是固定的
 */
const convert2OperationType = (path) => {
    let operationtype = '';
    if (isOld(path)) { //旧交易
        operationtype = 'com.szrcb.ibs.ibsapi.Pweb';
    } else if (isPmportal(path)) {
        let transID = path.split(/\/|\./)[1]; //正则取交易码
        operationtype = `com.szrcb.pmportal.${transID}`;
    } else { //新交易
        const module = path.split('/')[0]; //微服务模块
        const func = path.split('/')[1]; //微服务功能
        const operate = path.split('/')[2]; //微服务操作
        operationtype = `com.szrcb.ibs.${module}.${func}`;
    }
    return operationtype;
};

/**
 * 通过请求path判断交易是不是旧的
 * @param path
 * @returns {boolean}
 */
const isOld = (path) => /ibsapi\/Pweb/.test(path);

/**
 * 通过请求path判断交易是不是pmportal的
 * @param path
 * @returns {boolean}
 */
const isPmportal = (path) => /^pmportal\/.+/.test(path);

/**
 * 生成假的设备ID，浏览器只生成一次
 * @returns {string}
 */
const fakeDeviceId = () => {
    var CCfakeDeviceId = wx.getStorageSync('CCfakeDeviceId');
    if (CCfakeDeviceId) return CCfakeDeviceId;
    CCfakeDeviceId = (new Date()).getTime().toString();
    wx.setStorageSync('CCfakeDeviceId', CCfakeDeviceId);
    return CCfakeDeviceId;
};

function wx_request_newMobile(request) {
    var url
    var header = {}
    var method
    var dataType
    var data
    // var page = request.page
    var requestParams = commonData.getConstantData("newServerParams");
    const k = getK();
    //请求URL增加服务器的地址信息
    url = requestParams.baseUrl;
    //默认使用POST
    method = request.method ? request.method : "POST"

    if (request.header) {
        header = request.header
    }

    //设置header中的Content-Type信息
    if (request.header_type == "json") {
        //json数据

        //设置Content-Type
        header['Content-Type'] = 'application/json'
        header['Accept'] = 'application/json, text/plain, */*'
        // header['Access-Control-Allow-Origin'] = 'http://10.170.32.105'

        header['Version'] = '2';
        header['workspaceid'] = requestParams.workSpaceId;
        header['Appid'] = requestParams.appId;
        var corsEnv = 'X-CORS-' + requestParams.appId + '-' + requestParams.workSpaceId;
        header[corsEnv] = '1';
        header['X-Requested-With'] = 'XMLHttpRequest';
        // header['Origin'] = 'http://netbank.qhgctech.com';
        // header['CC-Package-Name'] = '21100025';
        if (!request.url) {
            wx_showModal('微服务交易名不能为空！');
            return;
        }
        header['Operation-Type'] = convert2OperationType(request.url);
        header['Accept-Encoding'] = 'gzip';
        // header['X-CORS-383FCF4101502-sit1'] = '1';
        // header['X-Tingyun-Id'] = '6LbUscFwdWc;r=131306672';

        data = request.data
        if (!isEmpty(getApp().globalData.simSessionId)) {
            data.SimSessionId = getApp().globalData.simSessionId;
        }
        data._DeviceId = fakeDeviceId();
        data._AdToken = fakeDeviceId();
        data._ChannelId = 'PMBS';
        data._BankId = '9999';

        var enparams = encryptDataByAA(JSON.stringify(data), k);
        data = JSON.stringify([{
            '_requestBody': {reqEncodeData: enparams}
        }]);
    }

    dataType = request.dataType
    if (!request.data.NO_LOADING) {
        wx.showLoading({
            title: '加载中',
        })
    }


    wx.request({
        url: url,
        data: data,
        header: header,
        method: method,
        dataType: request.dataType,
        success: function (res) {

            // //将显示loading界面的标志设为false
            // page.setData({
            //   showLoading: false
            // })

            //判断HTTP返回码
            if (res.statusCode && res.statusCode != "200") {
                //请求的HTTP返回码非200
                //显示错误提示
                wx_showModal('系统异常，请稍后重试');
                if (request.httpFail) {
                    //执行自定义方法
                    request.httpFail(res)
                }
            } else if (res.header['Result-Status'] == '1000') {
                //返回数据解密
                var decryptData = decryptData_ECB(res.data.resEncodeData, k);
                res.data = decryptData == null ? {} : JSON.parse(decryptData);
                //请求的HTTP返回码为200
                //保存cookie
                //mgw网关请求失败统一处理   TODO  横线处理
                // if(!res.header[x-mgw-http-code]==200&&res.header.memo){
                //   wx_showModal(decodeURIComponent(res.header.memo))
                //   if (request.fail) {
                //     //执行自定义方法
                //     request.fail(res)
                //     return
                //   }
                // }
                //后端微服务失败统一处理

                if (!isEmpty(res.data) && !isEmpty(res.data.SimSessionId)) {
                    getApp().globalData.simSessionId = res.data.SimSessionId;
                }

                if (request.success && res.data && res.data._Return == "000000") {
                    //执行自定义方法
                    request.success(res)
                } else if (res && res.data._RejCode && res.data._RejCode != "000000") {
                    //显示错误提示
                    if (!request.data.NO_ALERT) {
                        wx_showModal(res.data._RejMessage)
                    }
                    if (request.fail) {
                        //执行自定义方法
                        request.fail(res)
                    }
                } else if (res.header.Memo) {
                    wx_showModal(decodeURIComponent(res.header.Memo))
                } else {
                    wx_showModal("请求异常")
                }
            } else if (res.header.Memo) {//rpc请求状态不为1000，报错
                wx_showModal(decodeURIComponent(res.header.Memo))
            } else {
                wx_showModal("请求异常")
            }
        },
        fail: function (err) {
            // //将显示loading界面的标志设为false
            // page.setData({
            //   showLoading: false
            // })

            //显示错误提示 默认显示
            wx_showModal(err.errMsg)

            if (request.fail) {
                //执行自定义方法
                request.fail(err)
            }
        },
        complete: function (res) {
            if (!request.data.NO_LOADING) {
                wx.hideLoading()
            }
            if (request.complete) {
                request.complete(res)
            }
        }
    })
}

/**
 * 请求失败
 */
const errorCallback = (error, tips, request) => {
    if (typeof tips !== 'string') return console.log(tips);
    //如果无报错信息,处理为网络异常报错
    if (!tips) tips = "网络异常，请稍后再试！"
    var errMsg = tips + '-' + error;
    //显示错误提示
    wx_showModal(errMsg);
    if (request.fail) {
        request.fail(errMsg);
    }
};

//设置缓存（time为有效时间，默认值24小时）
function setStorageSyncHour(key, value, time) {
    wx.setStorageSync(key, value)
    var t = time ? time : 24;
    var seconds = parseInt(t * 3600);
    if (seconds > 0) {
        var timestamp = Date.parse(new Date());
        timestamp = timestamp / 1000 + seconds;
        wx.setStorageSync(key + 'dtime', timestamp + "")
    } else {
        wx.removeStorageSync(key + 'dtime')
    }
}

//读取缓存，若缓存不存在，返回def，def为可选参数，表示无缓存数据时返回值（支持字符串、json、数组、boolean等等）
function getStorageSyncTime(key, def) {
    var deadtime = parseInt(wx.getStorageSync(key + 'dtime'))
    if (deadtime) {
        if (parseInt(deadtime) < Date.parse(new Date()) / 1000) {
            wx.removeStorageSync(key);
            wx.removeStorageSync(key + 'dtime');
            if (def) {
                return def;
            } else {
                return;
            }
        }
    }
    var res = wx.getStorageSync(key);
    if (res) {
        return res;
    } else if (def) {
        return def;
    } else {
        return;
    }
}

function post(obj) {
    wx_request_newMobile({
        'url': obj.url,
        'header_type': 'json',
        'method': 'POST',
        'data': {
            ...obj.data
        },
        success: obj.success,
        fail: obj.fail,
        complete: obj.complete
    })
};

var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

function base64_encode(str) { // 加密
    var output = "";
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    var i = 0;
    str = _utf16to8(str);
    while (i < str.length) {
        chr1 = str.charCodeAt(i++);
        chr2 = str.charCodeAt(i++);
        chr3 = str.charCodeAt(i++);
        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;
        if (isNaN(chr2)) {
            enc3 = enc4 = 64;
        } else if (isNaN(chr3)) {
            enc4 = 64;
        }
        output = output + _keyStr.charAt(enc1) + _keyStr.charAt(enc2) + _keyStr.charAt(enc3) + _keyStr.charAt(enc4);
    }
    return output;
};

function base64_decode(input) { // 解密
    var output = "";
    var chr1, chr2, chr3;
    var enc1, enc2, enc3, enc4;
    var i = 0;
    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
    while (i < input.length) {
        enc1 = _keyStr.indexOf(input.charAt(i++));
        enc2 = _keyStr.indexOf(input.charAt(i++));
        enc3 = _keyStr.indexOf(input.charAt(i++));
        enc4 = _keyStr.indexOf(input.charAt(i++));
        chr1 = (enc1 << 2) | (enc2 >> 4);
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        chr3 = ((enc3 & 3) << 6) | enc4;
        output = output + String.fromCharCode(chr1);
        if (enc3 != 64) {
            output = output + String.fromCharCode(chr2);
        }
        if (enc4 != 64) {
            output = output + String.fromCharCode(chr3);
        }
    }
    return _utf8to16(output);
};

function _utf16to8(str) {
    var out, i, len, c;
    out = "";
    len = str.length;
    for (i = 0; i < len; i++) {
        c = str.charCodeAt(i);
        if ((c >= 0x0001) && (c <= 0x007F)) {
            out += str.charAt(i);
        } else if (c > 0x07FF) {
            out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));
            out += String.fromCharCode(0x80 | ((c >> 6) & 0x3F));
            out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
        } else {
            out += String.fromCharCode(0xC0 | ((c >> 6) & 0x1F));
            out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
        }
    }
    return out;
};

function _utf8to16(str) {
    var out, i, len, c;
    var char2, char3;
    out = "";
    len = str.length;
    i = 0;
    while (i < len) {
        c = str.charCodeAt(i++);
        switch (c >> 4) {
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
                case7:
                    out += str.charAt(i - 1);
                break;
            case 12:
            case 13:
                char2 = str.charCodeAt(i++);
                out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
                break;
            case 14:
                char2 = str.charCodeAt(i++);
                char3 = str.charCodeAt(i++);
                out += String.fromCharCode(((c & 0x0F) << 12) |
                    ((char2 & 0x3F) << 6) |
                    ((char3 & 0x3F) << 0));
                break;
        }
    }
    return out;
};

function sensorsData(event, obj) {
    //神策自定义埋点
    getApp().sensors.track(event, {
        is_recommended: !getApp().globalData.CifNo ? false : true,
        recommended_client_no: base64_decode(getApp().globalData.CifNo.replaceAll('%3D', '=')),
        recommended_is_bankflag: getApp().globalData.BankFlag == '8' ? true : false,
        credit_card_channel_id: getApp().globalData.ChannelId,
        ...obj
    })
}

function isEmpty(val) {
    if (val == undefined || val == null || (val + '').trim() == '' || val == {}) {
        return true;
    } else {
        return false;
    }
}

function getToday() {
    var today = new Date();
    var year = today.getFullYear();
    var month = today.getMonth() + 1;
    var day = today.getDate();
    var date = year + '-' + (month < 10 ? ('0' + month) : month) + '-' + (day < 10 ? ('0' + day) : day);
    return date;
}

/**
 *  格式化成金额字段
 * @param number  金额
 * @param decimals  保留几位小数(默认保留2位，使用截取的方式)
 * @param dec_point 小数点符号
 * @param thousands_sep  千分位符号
 * @returns {string}
 */
function money(number, decimals, dec_point, thousands_sep) {

    if (!number) return number;
    let str = ('' + number).replace(/,/g, '');

    number = Number(str);
    number = (number + '').replace(/[^0-9+-Ee.]/g, '');
    let n = !isFinite(+number) ? 0 : number,
        prec = !isFinite(+decimals) ? 2 : Math.abs(decimals),
        sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
        dec = (typeof dec_point === 'undefined') ? '.' : dec_point;

    let s = ('' + n).split('.');
    let re = /(-?\d+)(\d{3})/;
    while (re.test(s[0])) {
        s[0] = s[0].replace(re, "$1" + sep + "$2");
    }

    if ((s[1] || '').length < prec) {
        s[1] = s[1] || '';
        s[1] += new Array(prec - s[1].length + 1).join('0');
    } else {
        s[1] = s[1].substring(0, prec);
    }
    return s.join(dec);
}

function petRightsRequest(request) {
    var url
    var header = {}
    var method
    var dataType
    var data
    var requestParams = commonData.getConstantData("petRightsUrl");
    //请求URL增加服务器的地址信息
    url = requestParams.baseUrl + request.url;
    //默认使用POST
    method = request.method ? request.method : "POST"

    if (request.header) {
        header = request.header
    }
    if (!request.url) {
        wx_showModal('微服务交易名不能为空！');
        return;
    }
    var timeStamp = new Date().getTime()
    //现在测试和预发环境用 focus-auth-appid:insure_nsh  secret:ec99a7747acd495
    var signStr = 'AppId=insure_nsh&Secret=ec99a7747acd495&Url=' + request.url + '&Timestamp=' + timeStamp + '&Version=1'
    var sign = md5.hexMD5(signStr)
    //设置Content-Type
    header['Content-Type'] = 'application/json'
    header['Accept'] = 'application/json, text/plain, */*'
    header['focus-auth-appid'] = 'insure_nsh'
    header['focus-auth-timestamp'] = timeStamp
    header['focus-auth-version'] = '1'
    header['focus-auth-url'] = request.url
    header['focus-auth-userid'] = '4001961200'
    header['focus-auth-username'] = 'SRZCB'
    header['focus-auth-sign'] = sign.toUpperCase()

    header['Accept-Encoding'] = 'gzip';

    dataType = request.dataType
    if (!request.data.NO_LOADING) {
        wx.showLoading({
            title: '加载中',
        })
    }

    wx.request({
        url: url,
        data: request.data,
        header: header,
        method: method,
        dataType: request.dataType,
        success: function (res) {
            console.log('petRightsRes===>', res)
            //判断HTTP返回码
            if (res.statusCode && res.statusCode != "200") {
                //显示错误提示
                // wx_showModal(res.statusCode + '');
                wx_showModal('系统异常，领取失败，请稍后重试');
            } else if (res.data.statusCode && res.data.statusCode != "200") {
                if (res.data.statusCode == '401') {
                    request.fail(res);
                } else {
                    //显示错误提示
                    // wx_showModal('[' + res.data.statusCode + ']' + res.data.message)
                    wx_showModal('系统异常，领取失败，请稍后重试');
                }
            } else if (res.data.statusCode && res.data.statusCode == "200") {
                if (isEmpty(res.data.message)) {
                    request.success(res);
                } else {
                    //显示错误提示
                    // wx_showModal(res.data.message)
                    wx_showModal('系统异常，领取失败，请稍后重试');
                }
            } else if (res.data.status && res.data.status == 200) {
                if (!isEmpty(res.data.code) && res.data.code == 0) {
                    request.success(res);
                } else {
                    //显示错误提示
                    // wx_showModal('[' + res.data.code + ']' + res.data.msg)
                    wx_showModal('系统异常，领取失败，请稍后重试');
                }
            } else {
                // wx_showModal("请求异常")
                wx_showModal('系统异常，领取失败，请稍后重试');
            }
        },
        fail: function (err) {

            //显示错误提示 默认显示
            // wx_showModal(err.errMsg)

            if (request.fail) {
                //执行自定义方法
                request.fail(err)
            }
        },
        complete: function (res) {
            if (!request.data.NO_LOADING) {
                wx.hideLoading()
            }
            if (request.complete) {
                request.complete(res)
            }
        }
    })
}

function checkDate(dt) {
    if (!dt) return false;
    var r = new String(dt).match(/^(\d{1,4})(-)(\d{1,2})\2(\d{1,2})$/);
    if (!r) return false;
    var d = new Date(r[1], r[3] - 1, r[4]);
    return (d.getFullYear() == r[1] && (d.getMonth() + 1) == r[3] && d.getDate() == r[4]);
}

function compareDate(v1, v2) {
    if (!v1 || !v2) {
        return null;
    }
    if (!checkDate(v1) || !checkDate(v2)) {
        return null;
    }
    var v1Ary = v1.split('-');
    var v2Ary = v2.split('-');

    var year1 = new Number(v1Ary[0]);
    var month1 = new Number(v1Ary[1]);
    var day1 = new Number(v1Ary[2]);
    var year2 = new Number(v2Ary[0]);
    var month2 = new Number(v2Ary[1]);
    var day2 = new Number(v2Ary[2]);

    if (year1 > year2) return 1;
    if (year1 < year2) return 0;
    if (month1 > month2) return 1;
    if (month1 < month2) return 0;
    if (day1 > day2) return 1;
    if (day1 < day2) return 0;
    return 0;
}

function bdToTxMap(lng, lat) {
    var pi = 3.14159265358979324 * 3000.0 / 180.0;
    var x = lng - 0.0065;
    var y = lat - 0.006;
    var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * pi);
    var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * pi);
    lng = z * Math.cos(theta);
    lat = z * Math.sin(theta);
    return {
        'lng': lng,
        'lat': lat
    };
}

function txToBdMap(lng, lat) {
    var pi = 3.14159265358979324 * 3000.0 / 180.0;
    var x = lng;
    var y = lat;
    var z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * pi);
    var theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * pi);
    lng = z * Math.cos(theta) + 0.0065;
    lat = z * Math.sin(theta) + 0.006;
    return {'lng': lng, 'lat': lat};
}

//小程序基础库版本号比较
function compareVersion(v1, v2) {
    v1 = v1.split('.')
    v2 = v2.split('.')
    const len = Math.max(v1.length, v2.length)

    while (v1.length < len) {
        v1.push('0')
    }
    while (v2.length < len) {
        v2.push('0')
    }

    for (let i = 0; i < len; i++) {
        const num1 = parseInt(v1[i])
        const num2 = parseInt(v2[i])

        if (num1 > num2) {
            return 1
        } else if (num1 < num2) {
            return -1
        }
    }

    return 0
}

//处理json串转换中换行符问题
function jsonStrReplace(str) {
    if (isEmpty(str)) return null;
    return str.replace(/\n/g, "\\n").replace(/\r/g, "\\r");
}

module.exports = {
    getQP: getQP,
    formatTime: formatTime,
    addElementIntoArray: addElementIntoArray,
    addAllElementIntoArray: addAllElementIntoArray,
    validator: validator,
    check: check,
    post: post,
    wx_request_old: wx_request_old,
    wx_request_newMobile: wx_request_newMobile,
    wx_showModal: wx_showModal,
    wx_showModal_back: wx_showModal_back,
    setStorageSyncHour: setStorageSyncHour,
    getStorageSyncTime: getStorageSyncTime,
    base64_encode: base64_encode,
    base64_decode: base64_decode,
    sensorsData: sensorsData,
    isEmpty: isEmpty,
    getToday: getToday,
    checkLogin: checkLogin,
    checkState: checkState,
    wx_request_forLogin: wx_request_forLogin,
    reLogin: reLogin,
    money: money,
    loginStateQry: loginStateQry,
    petRightsRequest: petRightsRequest,
    compareDate: compareDate,
    bdToTxMap: bdToTxMap,
    txToBdMap: txToBdMap,
    compareVersion: compareVersion,
    jsonStrReplace: jsonStrReplace
}
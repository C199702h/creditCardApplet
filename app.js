//app.js
var sensors = require('./utils/sensorsdata.min.js');
var commonUtil = require('./utils/util');
//登录
var Rsa = require("./lib/rsa.js");
var tiny = require('./pages/tiny/tiny.js');
//神策埋点初始化
var url = 'http://113.106.72.170:8106/sa?project=production';//测试环境sit
// var url = 'http://113.106.72.162:8106/sa?project=production';//测试环境uat
// var url = 'https://stat.4001961200.com:8106//sa?project=production';//生产环境
sensors.setPara({
    name: 'sensors',
    server_url: url,
    // 全埋点控制开关
    autoTrack: {
        appLaunch: true, // 默认为 true，false 则关闭 $MPLaunch 事件采集
        appShow: true, // 默认为 true，false 则关闭 $MPShow 事件采集
        appHide: true, // 默认为 true，false 则关闭 $MPHide 事件采集
        pageShow: true, // 默认为 true，false 则关闭 $MPViewScreen 事件采集
        pageShare: true, // 默认为 true，false 则关闭 $MPShare 事件采集
        mpClick: true, // 默认为 false，true 则开启 $MPClick 事件采集 
        mpFavorite: true // 默认为 true，false 则关闭 $MPAddFavorites 事件采集
    },
    // 自定义渠道追踪参数，如source_channel: ["custom_param"]
    source_channel: [],
    // 是否允许控制台打印查看埋点数据(建议开启查看)
    show_log: true,
    // 是否允许修改 onShareAppMessage 里 return 的 path，用来增加(登录 ID，分享层级，当前的 path)，在 app onShow 中自动获取这些参数来查看具体分享来源、层级等
    allow_amend_share_path: true
});
sensors.registerApp({
    platform_type: '信用卡小程序',
});
//获取openId
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
                getApp().globalData.showLoading = true;
                commonUtil.post({
                    url: "creditcard/CreditCardWechatLoginQry/query",
                    data: {
                        code: code,
                        svrSeq: 'svr_creditCard_applet',
                        wechatSvrSeq: 'svr2',//生产信用卡公众号svr2  srcbtest:8aeefc10-95a8-49d6-bce9-95327f0ddefb liuhui:6b9ba655-5649-4633-bb7a-35431f15aca9
                        encryptedData: res2.encryptedData,
                        encryptedIv: res2.iv,
                        NO_LOADING: true
                    },
                    success: function (res) {
                        console.log('查openId==>', res);
                        getApp().globalData.openId = res.data.openId;
                        getApp().globalData.unionId = res.data.unionId;
                        getApp().globalData.wechatOpenId = res.data.wechatOpenId;
                        getApp().globalData.attState = res.data.attState;
                        //查询登录状态
                        commonUtil.wx_request_forLogin({
                            url: "aas/SrcbChannelBind/action",
                            'header_type': 'json',
                            'method': 'POST',
                            data: {
                                optType: '0',
                                wechatOpenId: res.data.wechatOpenId,
                                unionId: res.data.unionId,
                                transCode: 'aas.SrcbChannelBind.action',
                                NO_LOADING: true
                            },
                            success: function (res3) {
                                console.log('loginRes==>', res3);
                                getApp().globalData.isLogin = res3.data.bindFlag;
                                getApp().globalData.identity = res3.data.identity;
                                getApp().globalData.roleTp = res3.data.roleTp;
                                getApp().globalData.showLoading = false;
                            },
                            fail: function (err3) {
                                getApp().globalData.showLoading = false;
                            },
                            complete: function (params) {
                                getApp().globalData.showLoading = false;
                            }
                        })

                        sensors.setOpenid(res.data.unionId);
                        sensors.setProfile({
                            credit_card_XGX_open_id: res.data.openId,
                            union_id: res.data.unionId
                        })
                    },
                    fail: function (err) {
                        getApp().globalData.showLoading = false;
                    },
                    complete: function () {
                        sensors.init();
                    }
                })
            },
            fail: (err) => {//拒绝授权
                console.log('拒绝', err);
            }
        })
        //---------new
        //----------old
        // commonUtil.post({
        //   url: "creditcard/RecommendCardAuth/action",
        //   data: {
        //     code: res.code
        //   },
        //   success: function (res) {
        //     console.log('查openId==>',res.data.openId);
        //     getApp().globalData.openId = res.data.openId;
        //     getApp().globalData.unionId = res.data.unionId;
        //     sensors.setOpenid(res.data.unionId);
        //     sensors.setProfile({
        //       credit_card_XGX_open_id: res.data.openId,
        //       union_id: res.data.unionId
        //     })
        //     wx.hideLoading()
        //   },
        //   fail: function (err) {
        //     wx.hideLoading()
        //   },
        //   complete: function() {
        //     sensors.init();
        //   }
        // })
        //----------old
    },
    fail: (err) => {
    }
})
App({
    onLaunch: function () {
        // 展示本地存储能力
        var logs = wx.getStorageSync('logs') || []
        logs.unshift(Date.now())
        wx.setStorageSync('logs', logs)
        this.initRsa();
        wx.getSystemInfo({
            success: (result) => {
                console.log("getSystemInfo===>", result)
                this.globalData.ButtomSafeArea = (result.screenHeight - result.safeArea.bottom) || 0;
                this.globalData.screenWidth = result.screenWidth;
                this.globalData.SDKVersion = result.SDKVersion;
                this.globalData.platform = result.platform;
            },
        })
        // 初始化慧眼实名核身组件
        const Verify = require('/verify_mpsdk/main');
        Verify.init();
    },
    //初始化rsa加密对象
    initRsa: function () {
        var rsa = new Rsa();
        rsa.setPublic(this.globalData.publicRsa, this.globalData.hexPublic);
        this.globalData.rsa = rsa;
    },
    getLocation: function () {
        //获取地理位置信息
        var that = this;
        wx.getLocation({
            success(res) {
                that.globalData.latitude = res.latitude;
                that.globalData.longitude = res.longitude;
            },
            fail(err) {

            }
        })
    },
    // 监听页面数据变化
    initWatch(_page) {
        if (!_page) {
            console.error('未检测到Page对象,请将当前page传入该函数');
            return false;
        }
        if (!_page.watch) { //判断是否有需要监听的字段
            console.error('未检测到Page.watch字段(如果不需要监听，请移除initWatch的调用片段)');
            return false;
        }
        let _dataKey = Object.keys(_page.data);
        Object.keys(_page.watch).map((_key) => { //遍历需要监听的字段
            _page.data['__' + _key] = _page.data[_key]; //存储监听的数据
            if (_dataKey.includes(_key)) { //如果该字段存在于Page.data中，说明合法
                Object.defineProperties(_page.data, {
                    [_key]: { //被监听的字段
                        enumerable: true,
                        configurable: true,
                        set: function (value) {
                            let oldVal = this['__' + _key];
                            if (value !== oldVal) { //如果新设置的值与原值不等，则触发监听函数
                                setTimeout(function () { //为了同步,否则如果回调函数中有获取该字段值数据时将不同步,获取到的是旧值
                                    _page.watch[_key].call(_page, oldVal, value); //设置监听函数的上下文对象为当前的Page对象并执行
                                }.bind(this), 0)
                            }
                            this['__' + _key] = value;
                        },
                        get: function () {
                            return this['__' + _key]
                        }
                    }
                })
            } else {
                console.error('监听的属性[' + _key + ']在Page.data中未找到，请检查~')
            }
        })
    },
    tiny: tiny,
    globalData: {
        //登录控件
        scene: '',
        rsa: {},
        userInfo: {},
        isLogin: false,
        userAcctList: [],
        publicRsa: '99c5c2a2f3efcf9cb65603e6df45adeb2ff770046d5d830564096f97561bf5a4500ee3c6bb475c6d2fccf9fe318637107afc830e5bc5c6bb6a735a3a970b2b0b2e175944dfab8e2be4a53d8b63052fd4cd0e9f15372d91acf41e4c0cf4db4e3cfb073c64014655ccfb59ef343887f22b8156e718f0230c1296c7caba90c3bdcb',
        hexPublic: '10001',
        //服务端session存储数据key,取token身份段值
        sessionKey: '',

        userInfo: null,
        CifNo: '',
        BankFlag: '',
        salePersonNo: '',
        ChannelId: '',
        RecommendBankNo: '',
        latitude: '',
        longitude: '',
        authorizeFlag: true,
        ButtomSafeArea: 0,
        clientName: '',
        idNo: '',
        mobileNo: '',
        occupation: '',
        idValid: '',
        education: '',
        houseHold: '',
        maritalStatus: '',
        dfp: '',//设备指纹外码
        workSpace: 'prdgray',//切换环境时，注意修改神策服务地址，避免上送数据到生产，产生脏数据
        //登录交易
        isLogin: '0',//0-未登录 1-已登录
        identity: '',
        roleTp: '',
        showLoading: true //app.js中初始化方法加载展示showLoading效果
    }
})
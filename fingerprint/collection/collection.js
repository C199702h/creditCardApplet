const comp = require("../utils/compareVersion.js");
const encrypt = require('../utils/encrypt.js');
const network = require('../network/network.js');
const storage = require('../storage/storage.js')
import {toAsync} from "../utils/asycHelper";

const version = wx.getSystemInfoSync().SDKVersion || "0.0.0";
let custid = "";
let url = "";

function setCustID(cust) {
    custid = cust;
}

function setUrl(ur) {
    url = ur;
}

//采集要素的类
async function getCollection(userInfo, success, fail) {
    if (url == "") {
        fail("fail:url 不能为空")
        return
    }
    if (custid == "") {
        fail("fail:custid 不能为空")
        return
    }
    let data = ""
    var hash = ""
    let collectionInfo = {}

    let timestamp = new Date().getTime()
    collectionInfo["timestamp"] = timestamp.toString()

    let systemInfo = wx.getSystemInfoSync();
    collectionInfo["brand"] = systemInfo["brand"]
    collectionInfo["model"] = systemInfo["model"]
    collectionInfo["devicePixelRatio"] = (systemInfo["pixelRatio"]).toString()
    collectionInfo["screenWidth"] = (systemInfo["screenWidth"]).toString()
    collectionInfo["screenHeight"] = (systemInfo["screenHeight"]).toString()
    collectionInfo["windowWidth"] = (systemInfo["windowWidth"]).toString()
    collectionInfo["windowHeight"] = (systemInfo["windowHeight"]).toString()
    collectionInfo["statusBarHeight"] = (systemInfo["statusBarHeight"]).toString()
    collectionInfo["language"] = systemInfo["language"]
    collectionInfo["version"] = systemInfo["version"]
    collectionInfo["osVersion"] = systemInfo["system"]
    collectionInfo["systemPlatform"] = systemInfo["platform"]
    collectionInfo["platform"] = "WMP"
    collectionInfo["sdkVersion"] = "3.1.1"
    collectionInfo["wifiEnable"] = systemInfo["wifiEnabled"] ? "1" : "0";
    collectionInfo["locationEnabled"] = systemInfo["locationEnabled"] ? "1" : "0";
    collectionInfo["bluetoothEnabled"] = systemInfo["bluetoothEnabled"] ? "1" : "0";
    let smartID = generateSmartID(collectionInfo["model"], collectionInfo["pixelRatio"], collectionInfo["screenWidth"], collectionInfo["screenHeight"], collectionInfo["brand"]);
    collectionInfo["wxSmartID"] = smartID;
    const awx = toAsync(["getSetting", "getLocation", "getNetworkType", "getConnectedWifi", "getScreenBrightness", "getBatteryInfo"])

    let setting = await awx.getSetting().ignoreError()
    if (setting != undefined && setting.authSetting != undefined) {
        if (setting.authSetting["scope.userLocation"] === true) {
            let location = await awx.getLocation().ignoreError()
            if (location != undefined) {
                collectionInfo["coordinates"] = "[" + location.longitude + "," + location.latitude + "]";
            }
        }
    }

    let networkTypeInfo = await awx.getNetworkType().ignoreError()
    if (networkTypeInfo != undefined) {
        collectionInfo["networkType"] = networkTypeInfo.networkType;
    }

    let brightness = await awx.getScreenBrightness().ignoreError()
    if (brightness != undefined) {
        collectionInfo["brightness"] = (brightness.value).toString()
    }

    let wifiInfo = await awx.getConnectedWifi().ignoreError()
    if (wifiInfo != undefined && wifiInfo.wifi != undefined) {
        let bssid = wifiInfo.wifi.BSSID;
        let ssid = encrypt.MD5(wifiInfo.wifi.SSID);
        if (bssid != null && bssid != "" && ssid != null && ssid != "") {
            collectionInfo["currentWifi"] = "[" + ssid + "-" + bssid + "]";
        }
    }

    let battery = await awx.getBatteryInfo().ignoreError()
    if (battery != undefined) {
        collectionInfo["batteryStatus"] = battery.isCharging ? "1" : "0";
        collectionInfo["batteryLevel"] = (battery.level).toString()
    }

    if (userInfo != null && userInfo != undefined && userInfo["nickName"] != undefined) {
        collectionInfo["userInfo"] = encrypt.MD5("[" + userInfo["nickName"] + "," + userInfo["country"] + "," + userInfo["province"] + "," + userInfo["city"] + "," + userInfo["gender"] + "," + userInfo["language"] + "]");
    }
    collectionInfo["custID"] = custid;
    if (storage.getCookieCode()) {
        collectionInfo["cookieCode"] = storage.getCookieCode();
    }
    network.sendRequest(collectionInfo, url, success, fail);
}

function generateSmartID(model, pixelRatio, screenWidth, screenHeight, brand) {
    let original = model + '' + pixelRatio + '' + screenWidth + '' + screenHeight + '' + brand;
    return encrypt.MD5(original);
}

module.exports = {
    getCollection: getCollection,
    setCustID: setCustID,
    setUrl: setUrl,
}
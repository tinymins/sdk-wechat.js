!(function (NS, onJWeixinLoad) {
  "function" == typeof define && (define.amd || define.cmd)
    ? define(function () {
        return onJWeixinLoad(NS);
      })
    : onJWeixinLoad(NS, true);
})(window, function (NS, writeNamespaceEntry) {
  if (!NS.jWeixin) {
    var ms;
    var API_NAME_TO_INVOKE_KEY = {
      config: "preVerifyJSAPI",
      onMenuShareTimeline: "menu:share:timeline",
      onMenuShareAppMessage: "menu:share:appmessage",
      onMenuShareQQ: "menu:share:qq",
      onMenuShareWeibo: "menu:share:weiboApp",
      onMenuShareQZone: "menu:share:QZone",
      previewImage: "imagePreview",
      getLocation: "geoLocation",
      openProductSpecificView: "openProductViewWithPid",
      addCard: "batchAddCard",
      openCard: "batchViewCard",
      chooseWXPay: "getBrandWCPayRequest",
      openEnterpriseRedPacket: "getRecevieBizHongBaoRequest",
      startSearchBeacons: "startMonitoringBeacons",
      stopSearchBeacons: "stopMonitoringBeacons",
      onSearchBeacons: "onBeaconsInRange",
      consumeAndShareCard: "consumedShareCard",
      openAddress: "editAddress",
    };
    var INVOKE_KEY_TO_API_NAME = (function () {
      var t = {};
      for (var name in API_NAME_TO_INVOKE_KEY) {
        t[API_NAME_TO_INVOKE_KEY[name]] = name;
      }
      return t;
    })();
    var nsDocument = NS.document;
    var nsDocumentTitle = nsDocument.title;
    var userAgentL = navigator.userAgent.toLowerCase();
    var platformL = navigator.platform.toLowerCase();
    var isInDesktop = platformL.match("mac") || platformL.match("win");
    var isInWxDebugger = -1 != userAgentL.indexOf("wxdebugger");
    var isInWeixin = -1 != userAgentL.indexOf("micromessenger");
    var isInAndroid = -1 != userAgentL.indexOf("android");
    var isIniOS =
      -1 != userAgentL.indexOf("iphone") || -1 != userAgentL.indexOf("ipad");
    var weixinVersion = (ms =
      userAgentL.match(/micromessenger\/(\d+\.\d+\.\d+)/) ||
      userAgentL.match(/micromessenger\/(\d+\.\d+)/))
      ? ms[1]
      : "";
    var privateState = {
      initStartTime: getTimestamp(),
      initEndTime: 0,
      preVerifyStartTime: 0,
      preVerifyEndTime: 0,
    };
    var sysBaseInfo = {
      version: 1,
      appId: "",
      initTime: 0,
      preVerifyTime: 0,
      networkType: "",
      isPreVerifyOk: 1,
      systemType: isIniOS ? 1 : isInAndroid ? 2 : -1,
      clientVersion: weixinVersion,
      url: encodeURIComponent(location.href),
    };
    var configData = {};
    var configOptions = { _completes: [] };
    var configResponse = { state: 0, data: {} };
    onWeixinJSBridgeReady(function () {
      privateState.initEndTime = getTimestamp();
    });
    var pendingGetLocalImgData = false;
    var pendingGetLocalImgDataList = [];
    var jWeixin = {
      config: function (data) {
        configData = data;
        debugPrintOptions("config", data);
        var requireCheck = false !== configData.check;
        onWeixinJSBridgeReady(function () {
          if (requireCheck) {
            bridgeInvoke(
              API_NAME_TO_INVOKE_KEY.config,
              {
                verifyJsApiList: jsApiList2InvokeKeyList(configData.jsApiList),
                verifyOpenTagList: jsApiList2InvokeKeyList(
                  configData.openTagList
                ),
              },
              (function () {
                configOptions._complete = function (res) {
                  privateState.preVerifyEndTime = getTimestamp();
                  configResponse.state = 1;
                  configResponse.data = res;
                };
                configOptions.success = function (res) {
                  sysBaseInfo.isPreVerifyOk = 0;
                };
                configOptions.fail = function (res) {
                  if (configOptions._fail) {
                    configOptions._fail(res);
                  } else {
                    configResponse.state = -1;
                  }
                };
                var completes = configOptions._completes;
                completes.push(function () {
                  !(function () {
                    if (
                      !(
                        isInDesktop ||
                        isInWxDebugger ||
                        configData.debug ||
                        weixinVersion < "6.0.2" ||
                        sysBaseInfo.systemType < 0
                      )
                    ) {
                      var img = new Image();
                      (sysBaseInfo.appId = configData.appId),
                        (sysBaseInfo.initTime =
                          privateState.initEndTime -
                          privateState.initStartTime),
                        (sysBaseInfo.preVerifyTime =
                          privateState.preVerifyEndTime -
                          privateState.preVerifyStartTime),
                        jWeixin.getNetworkType({
                          isInnerInvoke: true,
                          success: function (res) {
                            sysBaseInfo.networkType = res.networkType;
                            var url =
                              "https://open.weixin.qq.com/sdk/report?v=" +
                              sysBaseInfo.version +
                              "&o=" +
                              sysBaseInfo.isPreVerifyOk +
                              "&s=" +
                              sysBaseInfo.systemType +
                              "&c=" +
                              sysBaseInfo.clientVersion +
                              "&a=" +
                              sysBaseInfo.appId +
                              "&n=" +
                              sysBaseInfo.networkType +
                              "&i=" +
                              sysBaseInfo.initTime +
                              "&p=" +
                              sysBaseInfo.preVerifyTime +
                              "&u=" +
                              sysBaseInfo.url;
                            img.src = url;
                          },
                        });
                    }
                  })();
                });
                configOptions.complete = function (res) {
                  for (var i = 0, len = completes.length; i < len; ++i) {
                    completes[i]();
                  }
                  configOptions._completes = [];
                };
                return configOptions;
              })()
            );
            privateState.preVerifyStartTime = getTimestamp();
          } else {
            configResponse.state = 1;
            var completes = configOptions._completes;
            for (var i = 0, len = completes.length; i < len; ++i) {
              completes[i]();
            }
            configOptions._completes = [];
          }
        });
        if (!jWeixin.invoke) {
          jWeixin.invoke = function (name, data, options) {
            if (NS.WeixinJSBridge) {
              WeixinJSBridge.invoke(
                name,
                assignCommonConfigData(data),
                options
              );
            }
          };
          jWeixin.on = function (name, cb) {
            if (NS.WeixinJSBridge) {
              WeixinJSBridge.on(name, cb);
            }
          };
        }
      },
      ready: function (cb) {
        if (0 != configResponse.state) {
          cb();
        } else {
          configOptions._completes.push(cb);
          if (!isInWeixin && configData.debug) {
            cb();
          }
        }
      },
      error: function (cb) {
        if (weixinVersion < "6.0.2") {
          return;
        }
        if (-1 == configResponse.state) {
          cb(configResponse.data);
        } else {
          configOptions._fail = cb;
        }
      },
      checkJsApi: function (data) {
        data._complete = function (res) {
          if (isInAndroid) {
            var checkResult = res.checkResult;
            if (checkResult) {
              res.checkResult = JSON.parse(checkResult);
            }
          }
          res = (function (res) {
            var checkResult = res.checkResult;
            for (var key in checkResult) {
              var name = INVOKE_KEY_TO_API_NAME[key];
              if (name) {
                checkResult[name] = checkResult[key];
                delete checkResult[key];
              }
            }
            return res;
          })(res);
        };
        bridgeInvoke(
          "checkJsApi",
          { jsApiList: jsApiList2InvokeKeyList(data.jsApiList) },
          data
        );
      },
      onMenuShareTimeline: function (data) {
        bridgeRegisterEvent(
          API_NAME_TO_INVOKE_KEY.onMenuShareTimeline,
          {
            complete: function () {
              bridgeInvoke(
                "shareTimeline",
                {
                  title: data.title || nsDocumentTitle,
                  desc: data.title || nsDocumentTitle,
                  img_url: data.imgUrl || "",
                  link: data.link || location.href,
                  type: data.type || "link",
                  data_url: data.dataUrl || "",
                },
                data
              );
            },
          },
          data
        );
      },
      onMenuShareAppMessage: function (data) {
        bridgeRegisterEvent(
          API_NAME_TO_INVOKE_KEY.onMenuShareAppMessage,
          {
            complete: function (res) {
              if ("favorite" === res.scene) {
                bridgeInvoke("sendAppMessage", {
                  title: data.title || nsDocumentTitle,
                  desc: data.desc || "",
                  link: data.link || location.href,
                  img_url: data.imgUrl || "",
                  type: data.type || "link",
                  data_url: data.dataUrl || "",
                });
              } else {
                bridgeInvoke(
                  "sendAppMessage",
                  {
                    title: data.title || nsDocumentTitle,
                    desc: data.desc || "",
                    link: data.link || location.href,
                    img_url: data.imgUrl || "",
                    type: data.type || "link",
                    data_url: data.dataUrl || "",
                  },
                  data
                );
              }
            },
          },
          data
        );
      },
      onMenuShareQQ: function (data) {
        bridgeRegisterEvent(
          API_NAME_TO_INVOKE_KEY.onMenuShareQQ,
          {
            complete: function () {
              bridgeInvoke(
                "shareQQ",
                {
                  title: data.title || nsDocumentTitle,
                  desc: data.desc || "",
                  img_url: data.imgUrl || "",
                  link: data.link || location.href,
                },
                data
              );
            },
          },
          data
        );
      },
      onMenuShareWeibo: function (data) {
        bridgeRegisterEvent(
          API_NAME_TO_INVOKE_KEY.onMenuShareWeibo,
          {
            complete: function () {
              bridgeInvoke(
                "shareWeiboApp",
                {
                  title: data.title || nsDocumentTitle,
                  desc: data.desc || "",
                  img_url: data.imgUrl || "",
                  link: data.link || location.href,
                },
                data
              );
            },
          },
          data
        );
      },
      onMenuShareQZone: function (data) {
        bridgeRegisterEvent(
          API_NAME_TO_INVOKE_KEY.onMenuShareQZone,
          {
            complete: function () {
              bridgeInvoke(
                "shareQZone",
                {
                  title: data.title || nsDocumentTitle,
                  desc: data.desc || "",
                  img_url: data.imgUrl || "",
                  link: data.link || location.href,
                },
                data
              );
            },
          },
          data
        );
      },
      updateTimelineShareData: function (data) {
        bridgeInvoke(
          "updateTimelineShareData",
          { title: data.title, link: data.link, imgUrl: data.imgUrl },
          data
        );
      },
      updateAppMessageShareData: function (data) {
        bridgeInvoke(
          "updateAppMessageShareData",
          {
            title: data.title,
            desc: data.desc,
            link: data.link,
            imgUrl: data.imgUrl,
          },
          data
        );
      },
      startRecord: function (data) {
        bridgeInvoke("startRecord", {}, data);
      },
      stopRecord: function (data) {
        bridgeInvoke("stopRecord", {}, data);
      },
      onVoiceRecordEnd: function (data) {
        bridgeRegisterEvent("onVoiceRecordEnd", data);
      },
      playVoice: function (data) {
        bridgeInvoke("playVoice", { localId: data.localId }, data);
      },
      pauseVoice: function (data) {
        bridgeInvoke("pauseVoice", { localId: data.localId }, data);
      },
      stopVoice: function (data) {
        bridgeInvoke("stopVoice", { localId: data.localId }, data);
      },
      onVoicePlayEnd: function (data) {
        bridgeRegisterEvent("onVoicePlayEnd", data);
      },
      uploadVoice: function (data) {
        bridgeInvoke(
          "uploadVoice",
          {
            localId: data.localId,
            isShowProgressTips: 0 == data.isShowProgressTips ? 0 : 1,
          },
          data
        );
      },
      downloadVoice: function (data) {
        bridgeInvoke(
          "downloadVoice",
          {
            serverId: data.serverId,
            isShowProgressTips: 0 == data.isShowProgressTips ? 0 : 1,
          },
          data
        );
      },
      translateVoice: function (data) {
        bridgeInvoke(
          "translateVoice",
          {
            localId: data.localId,
            isShowProgressTips: 0 == data.isShowProgressTips ? 0 : 1,
          },
          data
        );
      },
      chooseImage: function (data) {
        data._complete = function (res) {
          if (isInAndroid) {
            var localIds = res.localIds;
            try {
              if (localIds) {
                res.localIds = JSON.parse(localIds);
              }
            } catch (e) {}
          }
        };
        bridgeInvoke(
          "chooseImage",
          {
            scene: "1|2",
            count: data.count || 9,
            sizeType: data.sizeType || ["original", "compressed"],
            sourceType: data.sourceType || ["album", "camera"],
          },
          data
        );
      },
      getLocation: function (data) {},
      previewImage: function (data) {
        bridgeInvoke(
          API_NAME_TO_INVOKE_KEY.previewImage,
          { current: data.current, urls: data.urls },
          data
        );
      },
      uploadImage: function (data) {
        bridgeInvoke(
          "uploadImage",
          {
            localId: data.localId,
            isShowProgressTips: 0 == data.isShowProgressTips ? 0 : 1,
          },
          data
        );
      },
      downloadImage: function (data) {
        bridgeInvoke(
          "downloadImage",
          {
            serverId: data.serverId,
            isShowProgressTips: 0 == data.isShowProgressTips ? 0 : 1,
          },
          data
        );
      },
      getLocalImgData: function (data) {
        if (false === pendingGetLocalImgData) {
          pendingGetLocalImgData = true;
          data._complete = function (res) {
            pendingGetLocalImgData = false;
            if (0 < pendingGetLocalImgDataList.length) {
              var localId = pendingGetLocalImgDataList.shift();
              wx.getLocalImgData(localId);
            }
          };
          bridgeInvoke("getLocalImgData", { localId: data.localId }, data);
        } else {
          pendingGetLocalImgDataList.push(data);
        }
      },
      getNetworkType: function (data) {
        data._complete = function (res) {
          res = (function (res) {
            var errMsg = res.errMsg;
            res.errMsg = "getNetworkType:ok";
            var subtype = res.subtype;
            delete res.subtype;
            if (subtype) {
              res.networkType = subtype;
            } else {
              var index = errMsg.indexOf(":");
              var networkType = errMsg.substring(index + 1);
              switch (networkType) {
                case "wifi":
                case "edge":
                case "wwan":
                  res.networkType = networkType;
                  break;
                default:
                  res.errMsg = "getNetworkType:fail";
              }
            }
            return res;
          })(res);
        };
        bridgeInvoke("getNetworkType", {}, data);
      },
      openLocation: function (data) {
        bridgeInvoke(
          "openLocation",
          {
            latitude: data.latitude,
            longitude: data.longitude,
            name: data.name || "",
            address: data.address || "",
            scale: data.scale || 28,
            infoUrl: data.infoUrl || "",
          },
          data
        );
      },
      getLocation: function (data) {
        data = data || {};
        data._complete = function (res) {
          delete res.type;
        };
        bridgeInvoke(
          API_NAME_TO_INVOKE_KEY.getLocation,
          { type: data.type || "wgs84" },
          data
        );
      },
      hideOptionMenu: function (data) {
        bridgeInvoke("hideOptionMenu", {}, data);
      },
      showOptionMenu: function (data) {
        bridgeInvoke("showOptionMenu", {}, data);
      },
      closeWindow: function (data) {
        data = data || {};
        bridgeInvoke("closeWindow", {}, data);
      },
      hideMenuItems: function (data) {
        bridgeInvoke("hideMenuItems", { menuList: data.menuList }, data);
      },
      showMenuItems: function (data) {
        bridgeInvoke("showMenuItems", { menuList: data.menuList }, data);
      },
      hideAllNonBaseMenuItem: function (data) {
        bridgeInvoke("hideAllNonBaseMenuItem", {}, data);
      },
      showAllNonBaseMenuItem: function (data) {
        bridgeInvoke("showAllNonBaseMenuItem", {}, data);
      },
      scanQRCode: function (data) {
        data = data || {};
        data._complete = function (res) {
          if (isIniOS) {
            var resultStr = res.resultStr;
            if (resultStr) {
              var result = JSON.parse(resultStr);
              res.resultStr =
                result && result.scan_code && result.scan_code.scan_result;
            }
          }
        };
        bridgeInvoke(
          "scanQRCode",
          {
            needResult: data.needResult || 0,
            scanType: data.scanType || ["qrCode", "barCode"],
          },
          data
        );
      },
      openAddress: function (data) {
        data._complete = function (res) {
          res = (function (res) {
            res.postalCode = res.addressPostalCode;
            delete res.addressPostalCode;
            res.provinceName = res.proviceFirstStageName;
            delete res.proviceFirstStageName;
            res.cityName = res.addressCitySecondStageName;
            delete res.addressCitySecondStageName;
            res.countryName = res.addressCountiesThirdStageName;
            delete res.addressCountiesThirdStageName;
            res.detailInfo = res.addressDetailInfo;
            delete res.addressDetailInfo;
            return res;
          })(res);
        };
        bridgeInvoke(API_NAME_TO_INVOKE_KEY.openAddress, {}, data);
      },
      openProductSpecificView: function (data) {
        bridgeInvoke(
          API_NAME_TO_INVOKE_KEY.openProductSpecificView,
          {
            pid: data.productId,
            view_type: data.viewType || 0,
            ext_info: data.extInfo,
          },
          data
        );
      },
      addCard: function (data) {
        var cardList = data.cardList;
        var card_list = [];
        for (var i = 0, len = cardList.length; i < len; ++i) {
          var card = cardList[i];
          var item = { card_id: card.cardId, card_ext: card.cardExt };
          card_list.push(item);
        }
        data._complete = function (res) {
          var card_list = res.card_list;
          if (card_list) {
            card_list = JSON.parse(card_list);
            for (var i = 0, len = card_list.length; i < len; ++i) {
              var card = card_list[i];
              card.cardId = card.card_id;
              card.cardExt = card.card_ext;
              card.isSuccess = !!card.is_succ;
              delete card.card_id;
              delete card.card_ext;
              delete card.is_succ;
            }
            res.cardList = card_list;
            delete res.card_list;
          }
        };
        bridgeInvoke(
          API_NAME_TO_INVOKE_KEY.addCard,
          { card_list: card_list },
          data
        );
      },
      chooseCard: function (data) {
        data._complete = function (res) {
          res.cardList = res.choose_card_info;
          delete res.choose_card_info;
        };
        bridgeInvoke(
          "chooseCard",
          {
            app_id: configData.appId,
            location_id: data.shopId || "",
            sign_type: data.signType || "SHA1",
            card_id: data.cardId || "",
            card_type: data.cardType || "",
            card_sign: data.cardSign,
            time_stamp: data.timestamp + "",
            nonce_str: data.nonceStr,
          },
          data
        );
      },
      openCard: function (data) {
        var cardList = data.cardList;
        var card_list = [];
        for (var i = 0, len = cardList.length; i < len; ++i) {
          var card = cardList[i];
          var item = { card_id: card.cardId, code: card.code };
          card_list.push(item);
        }
        bridgeInvoke(
          API_NAME_TO_INVOKE_KEY.openCard,
          { card_list: card_list },
          data
        );
      },
      consumeAndShareCard: function (data) {
        bridgeInvoke(
          API_NAME_TO_INVOKE_KEY.consumeAndShareCard,
          { consumedCardId: data.cardId, consumedCode: data.code },
          data
        );
      },
      chooseWXPay: function (data) {
        bridgeInvoke(
          API_NAME_TO_INVOKE_KEY.chooseWXPay,
          formatPayData(data),
          data
        );
      },
      openEnterpriseRedPacket: function (data) {
        bridgeInvoke(
          API_NAME_TO_INVOKE_KEY.openEnterpriseRedPacket,
          formatPayData(data),
          data
        );
      },
      startSearchBeacons: function (data) {
        bridgeInvoke(
          API_NAME_TO_INVOKE_KEY.startSearchBeacons,
          { ticket: data.ticket },
          data
        );
      },
      stopSearchBeacons: function (data) {
        bridgeInvoke(API_NAME_TO_INVOKE_KEY.stopSearchBeacons, {}, data);
      },
      onSearchBeacons: function (data) {
        bridgeRegisterEvent(API_NAME_TO_INVOKE_KEY.onSearchBeacons, data);
      },
      openEnterpriseChat: function (data) {
        bridgeInvoke(
          "openEnterpriseChat",
          { useridlist: data.userIds, chatname: data.groupName },
          data
        );
      },
      launchMiniProgram: function (data) {
        bridgeInvoke(
          "launchMiniProgram",
          {
            targetAppId: data.targetAppId,
            path: (function (path) {
              if ("string" == typeof path && 0 < path.length) {
                var route = path.split("?")[0];
                var qs = path.split("?")[1];
                route += ".html";
                return void 0 !== qs ? route + "?" + qs : route;
              }
            })(data.path),
            envVersion: data.envVersion,
          },
          data
        );
      },
      openBusinessView: function (data) {
        data._complete = function (res) {
          if (isInAndroid) {
            var extraData = res.extraData;
            if (extraData)
              try {
                res.extraData = JSON.parse(extraData);
              } catch (e) {
                res.extraData = {};
              }
          }
        };
        bridgeInvoke(
          "openBusinessView",
          {
            businessType: data.businessType,
            queryString: data.queryString || "",
            envVersion: data.envVersion,
          },
          data
        );
      },
      miniProgram: {
        navigateBack: function (data) {
          data = data || {};
          onWeixinJSBridgeReady(function () {
            bridgeInvoke(
              "invokeMiniProgramAPI",
              { name: "navigateBack", arg: { delta: data.delta || 1 } },
              data
            );
          });
        },
        navigateTo: function (data) {
          onWeixinJSBridgeReady(function () {
            bridgeInvoke(
              "invokeMiniProgramAPI",
              { name: "navigateTo", arg: { url: data.url } },
              data
            );
          });
        },
        redirectTo: function (data) {
          onWeixinJSBridgeReady(function () {
            bridgeInvoke(
              "invokeMiniProgramAPI",
              { name: "redirectTo", arg: { url: data.url } },
              data
            );
          });
        },
        switchTab: function (data) {
          onWeixinJSBridgeReady(function () {
            bridgeInvoke(
              "invokeMiniProgramAPI",
              { name: "switchTab", arg: { url: data.url } },
              data
            );
          });
        },
        reLaunch: function (data) {
          onWeixinJSBridgeReady(function () {
            bridgeInvoke(
              "invokeMiniProgramAPI",
              { name: "reLaunch", arg: { url: data.url } },
              data
            );
          });
        },
        postMessage: function (data) {
          onWeixinJSBridgeReady(function () {
            bridgeInvoke(
              "invokeMiniProgramAPI",
              { name: "postMessage", arg: data.data || {} },
              data
            );
          });
        },
        getEnv: function (cb) {
          onWeixinJSBridgeReady(function () {
            cb({ miniprogram: "miniprogram" === NS.__wxjs_environment });
          });
        },
      },
    };
    var wxidAutoIncreasing = 1;
    var pendingWxidRequestLocalImgData = {};
    nsDocument.addEventListener(
      "error",
      function (err) {
        if (!isInAndroid) {
          var target = err.target;
          var tagName = target.tagName;
          var src = target.src;
          if (
            "IMG" == tagName ||
            "VIDEO" == tagName ||
            "AUDIO" == tagName ||
            "SOURCE" == tagName
          ) {
            if (-1 != src.indexOf("wxlocalresource://")) {
              err.preventDefault();
              err.stopPropagation();
              var wxid = target["wx-id"];
              if (!wxid) {
                wxid = wxidAutoIncreasing++;
                target["wx-id"] = wxid;
              }
              if (pendingWxidRequestLocalImgData[wxid]) {
                return;
              }
              pendingWxidRequestLocalImgData[wxid] = true;
              wx.ready(function () {
                wx.getLocalImgData({
                  localId: src,
                  success: function (res) {
                    target.src = res.localData;
                  },
                });
              });
            }
          }
        }
      },
      true
    );
    nsDocument.addEventListener(
      "load",
      function (event) {
        if (!isInAndroid) {
          var target = event.target;
          var tagName = target.tagName;
          target.src;
          if (
            "IMG" == tagName ||
            "VIDEO" == tagName ||
            "AUDIO" == tagName ||
            "SOURCE" == tagName
          ) {
            var wxid = target["wx-id"];
            if (wxid) {
              pendingWxidRequestLocalImgData[wxid] = false;
            }
          }
        }
      },
      true
    );
    if (writeNamespaceEntry) {
      NS.wx = NS.jWeixin = jWeixin;
    }
    return jWeixin;
  }
  function bridgeInvoke(name, data, options) {
    if (NS.WeixinJSBridge) {
      WeixinJSBridge.invoke(name, assignCommonConfigData(data), function (res) {
        onInvokeCB(name, res, options);
      });
    } else {
      debugPrintOptions(name, options);
    }
  }
  function bridgeRegisterEvent(name, data, options) {
    if (NS.WeixinJSBridge) {
      WeixinJSBridge.on(name, function (res) {
        if (options && options.trigger) {
          options.trigger(res);
        }
        onInvokeCB(name, res, data);
      });
    } else {
      debugPrintOptions(name, options || data);
    }
  }
  function assignCommonConfigData(config) {
    config = config || {};
    config.appId = configData.appId;
    config.verifyAppId = configData.appId;
    config.verifySignType = "sha1";
    config.verifyTimestamp = configData.timestamp + "";
    config.verifyNonceStr = configData.nonceStr;
    config.verifySignature = configData.signature;
    return config;
  }
  function formatPayData(data) {
    return {
      timeStamp: data.timestamp + "",
      nonceStr: data.nonceStr,
      package: data.package,
      paySign: data.paySign,
      signType: data.signType || "SHA1",
    };
  }
  function onInvokeCB(name, data, options) {
    if ("openEnterpriseChat" == name || "openBusinessView" === name) {
      data.errCode = data.err_code;
    }
    delete data.err_code;
    delete data.err_desc;
    delete data.err_detail;
    var errMsg = data.errMsg;
    if (!errMsg) {
      errMsg = data.err_msg;
      delete data.err_msg;
      errMsg = (function (keyOrName, originErrMsg) {
        var name = keyOrName;
        var nameFromKey = INVOKE_KEY_TO_API_NAME[name];
        if (nameFromKey) {
          name = nameFromKey;
        }
        var errMsg = "ok";
        if (originErrMsg) {
          var index = originErrMsg.indexOf(":");
          errMsg = originErrMsg.substring(index + 1);
          if ("confirm" == errMsg) {
            errMsg = "ok";
          }
          if ("failed" == errMsg) {
            errMsg = "fail";
          }
          if (-1 != errMsg.indexOf("failed_")) {
            errMsg = errMsg.substring(7);
          }
          if (-1 != errMsg.indexOf("fail_")) {
            errMsg = errMsg.substring(5);
          }
          errMsg = errMsg.replace(/_/g, " ");
          errMsg = errMsg.toLowerCase();
          if (
            "access denied" == errMsg ||
            "no permission to execute" == errMsg
          ) {
            errMsg = "permission denied";
          }
          if ("config" == name && "function not exist" == errMsg) {
            errMsg = "ok";
          }
          if ("" == errMsg) {
            errMsg = "fail";
          }
        }
        originErrMsg = name + ":" + errMsg;
        return originErrMsg;
      })(name, errMsg);
      data.errMsg = errMsg;
    }
    options = options || {};
    if (options._complete) {
      options._complete(data);
      delete options._complete;
    }
    errMsg = data.errMsg || "";
    if (configData.debug && !options.isInnerInvoke) {
      alert(JSON.stringify(data));
    }
    var index = errMsg.indexOf(":");
    switch (errMsg.substring(index + 1)) {
      case "ok":
        if (options.success) {
          options.success(data);
        }
        break;
      case "cancel":
        if (options.cancel) {
          options.cancel(data);
        }
        break;
      default:
        if (options.fail) {
          options.fail(data);
        }
    }
    if (options.complete) {
      options.complete(data);
    }
  }
  function jsApiList2InvokeKeyList(jsApiList) {
    if (jsApiList) {
      for (var i = 0, n = jsApiList.length; i < n; ++i) {
        var name = jsApiList[i];
        var key = API_NAME_TO_INVOKE_KEY[name];
        if (key) {
          jsApiList[i] = key;
        }
      }
      return jsApiList;
    }
  }
  function debugPrintOptions(key, options) {
    if (configData.debug && !(options && options.isInnerInvoke)) {
      var name = INVOKE_KEY_TO_API_NAME[key];
      if (name) {
        key = name;
      }
      if (options && options._complete) {
        delete options._complete;
      }
      console.log('"' + key + '",', options || "");
    }
  }
  function getTimestamp() {
    return new Date().getTime();
  }
  function onWeixinJSBridgeReady(cb) {
    isInWeixin &&
      (NS.WeixinJSBridge
        ? cb()
        : nsDocument.addEventListener &&
          nsDocument.addEventListener("WeixinJSBridgeReady", cb, false));
  }
});

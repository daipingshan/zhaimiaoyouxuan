// pages/search/search.js
const app = getApp();
const base = app.globalData.base;
var common = require("../../utils/common.js")
Page({
  data: {
    min_height: 0,
    time_status: 'before',
    day: 0,
    hour: 0,
    minute: 0,
    second: 0,
    item_cate: 'free',
    goods: [],
    page: 1,
    isLast: false,
    token: '',
    invite_code: 'zhaimiaoshenghuo',
    flag: true,
    curr_width: 0,
    curr_height: 0,
    modalMarginTop: "3%",
    canvasHeight: 0,
    qrcode: '',
    tempPath: '',
  },
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '京东免单'
    });
    //设置宽高 菜单滚动限制
    this.setData({
      curr_width: app.globalData.deviceInfo.windowWidth,
      curr_height: app.globalData.deviceInfo.windowHeight,
      min_height: app.globalData.deviceInfo.rpxHeight
    });
    console.log(app.globalData.deviceInfo);
    //判断
    if (options.scene) {
      options.invite_code = options.scene
    }
    console.log(options);
    console.log(options.invite_code);
    //设置用户公共数据
    var userCommon = new common.UserCommon(this, options);
    userCommon.setToken();
    userCommon.setUserInfo();
    userCommon.setUserLevel();
    userCommon.setInviteCode();
    if (userCommon.wxObj.token) {
      this.setData({
        token: userCommon.wxObj.token
      })
    }
    if (options.type) {
      this.setData({
        item_cate: options.type
      })
    }
    if (userCommon.wxObj.invite_code) {
      this.setData({
        invite_code: userCommon.wxObj.invite_code
      })
    }
    this.countDown()
  },
  setCate: function (e) {
    this.setData({
      goods: [],
      page: 1,
      isLast: false,
      item_cate: e.target.dataset.val,
    })
    this.getGoods();
  },
  gotoUrl: function (e) {
    wx.showLoading({
      title: '正在前往京东',
    })
    var num_iid = e.currentTarget.dataset.id;
    var click_url = e.currentTarget.dataset.url;
    var jid = e.currentTarget.dataset.jid;
    var data = {};
    data.num_iid = num_iid;
    data.click_url = click_url;
    if (this.data.token) {
      data.token = this.data.token;
    }
    wx.request({
      url: base + '/Jd/getItemCouponInfo',
      data: data,
      success(res) {
        wx.hideLoading();
        if (res.data.code == 'success') {
          var url = res.data.data.jd_mini_program_path;
          if (url && url != undefined) {
            wx.navigateToMiniProgram({
              appId: 'wx13e41a437b8a1d2e',
              path: url,
              extraData: {
                foo: 'bar'
              },
              envVersion: 'release',
            });
          }
        } else {
          wx.showToast({
            title: res.data.msg+',jid:'+jid,
            icon: 'none',
            duration: 2000
          })
        }
      },
      fail(err) {
        console.log(err)
      }
    })
  },

  backTop() {
    wx.pageScrollTo({
      scrollTop: 0,
    });
  },
  getGoods: function () {
    wx.showLoading({
      title: '正在加载',
    })
    var that = this;
    var data = {};
    data.type = this.data.item_cate;
    if (this.data.token) {
      data.token = this.data.token;
    }
    data.page = this.data.page;
    wx.request({
      url: base + '/Jd/freeItems',
      data: data,
      success(res) {
        var goods = that.data.goods;
        var goods_list = res.data.data;
        if (goods_list.length < 20) {
          that.setData({
            isLast: true
          })
        }
        if (goods_list.length > 0) {
          goods = goods.concat(goods_list);
        }
        that.setData({
          goods: goods
        });
        wx.hideLoading();
      },
      fail(err) {
        console.log(err)
      }
    })
  },

  //分享朋友圈
  getShare() {
    wx.showLoading({
      title: '生成分享图',
    })
    var that = this
    wx.request({
      url: base + '/Jd/getMiniProgramCodePic?invite_code=' + that.data.invite_code,
      success: function (res) {
        if (res.data.code == "success") {
          wx.getImageInfo({
            src: res.data.data.mini_program_code_pic,
            success: function (res) {
              that.setData({
                qrcode: res.path
              })
              that.createImage()
            }, fail(res) {
              console.log(res)
            }
          })
        }
      },
      fail: function (res) {
        console.log(res)
      }
    })
  },

  //创建图片
  createImage() {
    var that = this
    var modal_width = this.data.curr_width * 0.865;
    var modal_height = this.data.curr_height * 0.865;
    var ctx = wx.createCanvasContext('share-image')
    ctx.drawImage('/resource/page/jdAd/share-bg-818.png', 0, 0, modal_width, modal_height)
    ctx.setFontSize(14)
    ctx.fillText('长按识别小程序码查看', modal_width / 4 + 12, modal_height - 10);
    ctx.drawImage(that.data.qrcode, modal_width / 3, modal_height * 0.7, modal_width / 3, modal_width / 3)
    ctx.draw()
    that.setData({
      flag: false,
      canvasHeight: modal_height,
    })
    setTimeout(function () {
      wx.canvasToTempFilePath({
        canvasId: 'share-image',
        width: modal_width,
        height: modal_height,
        success: function (tempRes) {
          console.log(tempRes.tempFilePath)
          that.setData({
            tempPath: tempRes.tempFilePath,
          })
          wx.hideLoading()
        }, fail(res) {
          console.log(res)
        }
      })
    }, 1000);
    wx.hideLoading()
  },
  saveCanvas() {
    wx.showLoading({
      title: '保存中',
    })
    var that = this
    var tempPath = this.data.tempPath;
    if (!tempPath) {
      wx.showToast({
        title: '保存图片失败',
        icon: "success"
      })
      return false;
    }
    wx.getSetting({
      success: function (res) {
        if (!res.authSetting['scope.writePhotosAlbum']) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success() {
              wx.saveImageToPhotosAlbum({
                filePath: tempPath,
                success: function (res) {
                  wx.showToast({
                    title: '保存成功',
                    icon: "success"
                  })
                }, fail: function (res) {
                  console.log(res)
                }
              })
            },
            fail() {
              wx.showModal({
                title: "提示",
                content: "将图片保存至相册需要访问相册权限，请设置为允许访问相册",
                confirmText: "允许",
                complete: function (res) {
                  if (res.confirm) {
                    wx.openSetting({
                      success: (res) => {
                        if (res.authSetting["scope.writePhotosAlbum"]) {
                          wx.saveImageToPhotosAlbum({
                            filePath: tempPath,
                            success: function (res) {
                              wx.showToast({
                                title: '保存成功',
                                icon: "success"
                              })
                            }, fail: function (res) {
                              console.log(res)
                            }
                          })
                        }
                      },
                      fail: function (res) {
                        console.log(res)
                      }
                    })
                  }
                }
              }) // 向用户提示需要权限才能继续
            }
          })
        } else {
          wx.saveImageToPhotosAlbum({
            filePath: tempPath,
            success: function (res) {
              wx.showToast({
                title: '保存成功',
                icon: "success"
              })
            }, fail: function (res) {
              console.log(res)
              wx.showToast({
                title: '取消保存',
              })
            }
          })
        }
      }
    })
    wx.hideLoading()
  },
  copyString: function () {
    var copyString = '不要外传，一年仅一次的618免单机会，还不速来！'
    wx.setClipboardData({
      data: copyString,
      success: function (res) {
        wx.getClipboardData({
          success: function (res) {
            wx.showToast({
              title: '已复制',
              duration: 2000
            })
          }
        })
      }
    })
  },
  copyWeiXin: function () {
    var copyString = 'QTKF01'
    wx.setClipboardData({
      data: copyString,
      success: function (res) {
        wx.getClipboardData({
          success: function (res) {
            wx.showToast({
              title: '已复制',
              duration: 2000
            })
          }
        })
      }
    })
  },
  showCanvas: function () {
    var tempPath = this.data.tempPath;
    if (!tempPath) {
      wx.showToast({
        title: '保存图片失败',
        icon: "success"
      })
      return false;
    }
    wx.previewImage({
      urls: [tempPath]
    })
  },
  hide: function () {
    this.setData({ flag: true })
  },
  timeDown: function (times) {
    var day = 0,
      hour = 0,
      minute = 0,
      second = 0;
    if (times > 0) {
      day = parseInt(times / 60 / 60 / 24, 10); //计算剩余的天数 
      hour = parseInt(times / 60 / 60 % 24, 10); //计算剩余的小时 
      minute = parseInt(times / 60 % 60, 10);//计算剩余的分钟 
      second = parseInt(times % 60, 10);//计算剩余的秒数 
    }
    if (day <= 9) day = '0' + day;
    if (hour <= 9) hour = '0' + hour;
    if (minute <= 9) minute = '0' + minute;
    if (second <= 9) second = '0' + second;
    this.setData({
      day: day,
      hour: hour,
      minute: minute,
      second: second
    })
  },
  countDown: function () {
    var that = this
    var begin_time = (new Date("2018/08/16 00:00:00")).getTime() / 1000
    var end_time = (new Date("2018/08/21 00:00:00")).getTime() / 1000 - 1
    var current_time = Date.parse(new Date()) / 1000
    var time_index = null
    if (begin_time > current_time) {
      var times = begin_time - current_time
      this.timeDown(times)
      time_index = setInterval(function () {
        that.timeDown(times)
        if (times == 1) {
          that.setData({
            time_status: false,
          });
          that.getGoods();
          clearInterval(time_index);
        }
        times--;
      }, 1000);
    } else if(current_time > begin_time && current_time < end_time) {
      that.setData({
        time_status: 'ing',
      });
      that.getGoods();
    }else{
      that.setData({
        time_status: 'after',
      });
    }
  },
  onShareAppMessage: function (res) {
    return {
      title: '不要外传，一年仅一次的免单机会，还不速来！',
      path: '/pages/jdAd/index?invite_code=' + this.data.invite_code,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  onReachBottom() {
    if (this.data.time_status == 'ing') {
      var page = this.data.page;
      if (this.data.isLast) {
        wx.showToast({
          title: '暂无更多数据',
          icon: 'none',
          duration: 2000
        })
      } else {
        var page = this.data.page;
        page += 1;
        this.setData({
          page: page
        })
        this.getGoods();
      }
    }
  },
})
// pages/setaccount/setaccount.js
const app = getApp();
const base = app.globalData.base;
Page({
  data: {
    curBank: '',
    bank_account_real_name: '',
    bank_account: '',
    isHide: true,
    countdown: '',
    cding: false,
    isShowVoice: false
  },
  onLoad: function (options) {
    var token = wx.getStorageSync('token');
    if (token) {
      this.token = token;
    }
    wx.setNavigationBarColor({
      frontColor: '#000000',
      backgroundColor: '#ffffff'
    })
    wx.setNavigationBarTitle({
      title: '设置提现账户'
    });
    var userInfo = wx.getStorageSync('userInfo');
    if (userInfo.mobile) {
      this.mobile = userInfo.mobile
    }
    if (userInfo.bank_account) {
      this.setData({
        bank_account_real_name: userInfo.bank_account_real_name,
        bank_account: userInfo.bank_account
      })
    }
  },

  count() {
    var that = this, count = 60;
    this.setData({
      cding: true
    });
    this.timer = setInterval(function () {
      count--;
      that.setData({
        countdown: count + 's'
      });
      console.log(count);
      if (count == 40) {
        if (that.data.isShowVoice == false) {
          that.setData({
            isShowVoice: true
          })
        }
      }
      if (count <= 0) {
        clearInterval(that.timer);
        that.setData({
          cding: false,
          countdown: ''
        })
      }
    }, 1000);
  },
  send() {
    this.sms('sms');
  },
  sendVoice() {
    var that = this
    wx.showModal({
      title: '语音验证码',
      content: '我们将打电话给' + this.mobile + '，告知你验证码，您可能会接到029等开头的来电，请放心接听!',
      showCancel: true,
      cancelColor: '#808080',
      confirmText: '现在接听',
      confirmColor: '#ff1849',
      success: function (res) {
        if (res.confirm) {
          that.sms('voice');
        } else {
          return false;
        }
      }
    })
  },
  sms(receive_mode) {
    var mobile = this.mobile, that = this;
    if (this.data.isShowVoice == false && this.data.cding) return;
    wx.request({
      url: base + '/Public/sendCode',
      data: {
        mobile: mobile,
        type: 'set_bank_account',
        receive_mode: receive_mode
      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success(res) {
        var code = res.data.code;
        if (code == 'success') {
          wx.showToast({
            title: '验证码已发送'
          });
          if (that.data.cding == false) {
            that.count();
          }
        }
        if (code == 'fail') {
          wx.showToast({
            icon: "none",
            title: res.data.msg
          })
        }
      }
    })
  },
  showBank() {
    this.setData({
      isHide: false
    })
  },

  chooseBank(e) {
    console.log(e)
    var bank = e.target.dataset.bank
    this.setData({
      curBank: bank,
      isHide: true
    })
  },

  submit(e) {
    var value = e.detail.value, that = this;
    var bank_account = value.bank_account;
    var bank_account_real_name = value.bank_account_real_name;
    var sms_code = value.sms_code;

    if (!bank_account || !bank_account_real_name) {
      wx.showToast({
        icon: 'none',
        title: '提现账户信息不完整，请检查所有选项是否未填',
      })
      return false;
    }
    var param = {
      bank_account: bank_account,
      bank_account_real_name: bank_account_real_name,
      token: this.token
    };
    var reg = /^[0-9]{4}$/;
    if (!reg.test(sms_code)) {
      wx.showToast({
        icon: 'none',
        title: '验证码错误'
      });
      return false;
    }
    param.sms_code = sms_code

    wx.request({
      url: base + '/Withdraw/setBankAccount',
      data: param,
      method: 'GET',
      success(res) {
        if (res.data) {
          var code = res.data.code;
          if (code == 'not_login') {
            wx.showModal({
              title: '请登录',
              content: '您的登录状态已过期请重新登录',
              showCancel: true,
              confirmColor: '#808080',
              success(res) {
                if (res.confirm) {
                  that.userLogin();
                }
              }
            })
          }
          if (code == 'success') {
            that.getDetail();
            wx.showModal({
              title: '绑定成功',
              content: '您的提现帐号已经绑定成功！',
              showCancel: false,
              confirmColor: '#808080',
              success(res) {
                if (res.confirm) {
                  var userInfo = wx.getStorageSync('userInfo');
                  console.log(userInfo);
                  userInfo.bank_account = bank_account
                  userInfo.bank_account_real_name = bank_account_real_name
                  // wx.setStorageSync("userInfo", userInfo)
                  wx.navigateBack();
                }
              }
            });
          } else {
            wx.showToast({
              icon: 'none',
              title: res.data.info
            })
          }
        } else {
          wx.showToast({
            icon: 'none',
            title: '服务器无响应'
          })
        }
      }
    })
  },

  getDetail() {
    var that = this, data = {};
    if (this.token) {
      data.token = this.token;
    }
    wx.request({
      url: base + '/User/index',
      data: data,
      success(res) {
        var userInfo = res.data.data;
        that.setData({
          userInfo: userInfo
        });
        wx.setStorageSync('userInfo', userInfo)
      }
    })
  }
})
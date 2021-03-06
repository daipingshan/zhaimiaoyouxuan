const app = getApp();
const base = app.globalData.base;
const U = require('../../utils/util.js');
var publicData = require("../../utils/data.js")
var common = require("../../utils/common.js")

var time = 0;
var touchDot = 0;//触摸时的原点
var interval = "";
var flag_hd = true;

Page({
  data: {
    winHeight: "",//窗口高度
    winWidth: "",
    currentTab: 0, //预设当前项的值
    scrollLeft: 0, //tab标题的滚动条位置
    flag: true,
    tabArr: [],
    indicatorDots: true,
    autoplay: true,
    interval: 5000,
    duration: 500,
    level: -1,
    indicatorColor: '#e0e0e0',
    indicatorActiveColor: '#ff1849',
    page: 1,
    goods_list: false,
    bannerOne: false,
    bannerTwo: false,
    desc: 'all',
    sort_type: 0,
    sort_price: 'default',
    descType: 0,
    isLast: false,
    distanceTop: -1,
    catDistanceTop: 0,
    fixedBlock: 0,
    hideTab: true,
    flag: true,
    shopType: 'pinduoduo'
  },
  onLoad: function (options) {
    var that = this;
    this.fixedBlock = 190 / app.globalData.deviceInfo.rpxR;
    //设置宽高 菜单滚动限制
    this.setData({
      winWidth: app.globalData.deviceInfo.rpxWidth,
      winHeight: app.globalData.deviceInfo.rpxHeight,
      fixedBlock: this.fixedBlock
    });
    // 获取广告
    var catDistanceTop = 0;

    if (app.globalData.initData.advert_data && app.globalData.initData.advert_data.length) {
      this.setData({
        bannerOne: app.globalData.initData.advert_data,
        catDistanceTop: (app.globalData.deviceInfo.rpxWidth / 3 + 100) / app.globalData.deviceInfo.rpxR
      });
    } else {
      app.initCallback = initData => {
        if (initData.advert_data && initData.advert_data.length) {
          this.setData({
            bannerOne: initData.advert_data,
            catDistanceTop: (app.globalData.deviceInfo.rpxWidth / 3 + 100) / app.globalData.deviceInfo.rpxR
          });
        } else {
          catDistanceTop = 0;
          this.setData({
            catDistanceTop: catDistanceTop,
          });
        }
      }
      app.init();
    }

    //设置用户公共数据
    var userCommon = new common.UserCommon(this, options);
    userCommon.setToken();
    userCommon.setUserInfo();
    userCommon.setUserLevel();
    userCommon.setInviteCode();
    //设置默认菜单
    this.setMenu();
    //获取商品
    this.getGoods();
  },
  onShow: function () {
    var userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.userInfo = userInfo;
      this.setData({
        level: this.userInfo.level
      })
    }
  },
  setMenu() {
    var tabArr = publicData.tabBarOfPdd;
    this.shop_type = 'pinduoduo';
    if (!this.data.hideTab) {
      tabArr = publicData.tabBarOfJd;
      this.shop_type = 'jingdong';
    }
    this.setData({
      tabArr: tabArr,
      sort_price: 'default',
      shopType: this.shop_type
    })
  },
  clickTab(opt) {
    if (opt.target.dataset.current == 0 && this.data.hideTab == true) {
      return false;
    }
    if (opt.target.dataset.current == 1 && this.data.hideTab == false) {
      return false;
    }

    if (opt.target.dataset.current === '0') {
      this.setData({
        hideTab: true,
      })
    } else {
      this.setData({
        hideTab: false
      })
    }
    this.setData({
      currentTab: 0,
      desc: 'all',
      sort_price: 'default',
      flag: true,
      isLast: false,
      goods_list: [],
      page: 1
    })
    this.setMenu();
    this.getGoods();
  },
  switchCate: function (e) {
    var cur = e.currentTarget.dataset.current;
    if (this.data.currentTab == cur) {
      return false;
    } else {
      if (cur != 0) {
        this.setData({
          fixedBlock: this.fixedBlock + 35
        });
      } else {
        this.setData({
          fixedBlock: this.fixedBlock
        });
      }
      this.setData({
        currentTab: cur,
        flag: true,
        desc: 'all',
        sort_price: 'default',
        isLast: false,
        goods_list: [],
        page: 1
      });
      this.checkCor();
      this.getGoods()
    }
  },
  // 点击标题切换当前页时改变样式
  swichNav: function (e) {
    var cur = e.target.dataset.current;
    if (this.data.currentTab == cur) {
      return false;
    } else {
      if (cur != 0) {
        this.setData({
          fixedBlock: this.fixedBlock + 35
        });
      } else {
        this.setData({
          fixedBlock: this.fixedBlock
        });
      }
      this.setData({
        currentTab: cur,
        desc: 'all',
        sort_price: 'default',
        flag: true,
        isLast: false,
        goods_list: [],
        page: 1
      })
      this.getGoods()
    }
  },
  //判断当前滚动超过一屏时，设置tab标题滚动条。
  checkCor: function () {
    if (this.data.currentTab >= 16) {
      this.setData({
        scrollLeft: 600
      })
    } else {
      this.setData({
        scrollLeft: 0
      })
    }
  },
  gotoSearch() {
    wx.navigateTo({
      url: '../goSearch/search?shopType=' + this.data.shopType
    })
  },
  descGoods(e) {
    var descType = e.currentTarget.dataset.desctype
    this.setData({
      desc: descType,
      goods_list: [],
      page: 1,
      sort_price: 'default',
      isLast: false
    });
    switch (descType) {
      case 'all':
        this.setData({
          sort_type: 0
        });
        break;
      case 'count':
        this.setData({
          sort_type: 'sale'
        });
        break;
      case 'price':
        if (this.data.sort_type == 'coupon_price_asc') {
          this.setData({
            sort_type: 'coupon_price_desc',
            sort_price: 'down'
          });
        } else {
          this.setData({
            sort_type: 'coupon_price_asc',
            sort_price: 'up'
          });
        }
        break;
      case 'income':
        this.setData({
          sort_type: 'commission_rate_desc'
        });
        break;
    }
    this.getGoods();
  },
  getGoods() {
    wx.showLoading({
      title: '正在加载',
    })
    var time = new Date();
    var tnow = time.getTime();
    var that = this;
    var data = {};
    if (this.token) {
      data.token = that.token;
    }

    data.type = this.data.shopType;
    data.cate_id = that.data.currentTab;
    data.sort_field = that.data.sort_type;
    var page = that.data.page;
    data.page = page == 0 ? 1 : page;
    wx.request({
      url: base + '/Item/search',
      data: data,
      success(res) {
        var goods = res.data.data, eGoods = [];
        var curGoods = that.data.goods_list;

        if (goods.length < 20) {
          that.setData({
            isLast: true
          })
        }
        if (curGoods.length > 0) {
          eGoods = curGoods.concat(goods);
        } else {
          eGoods = goods;
        }
        for (var i = 0; i < eGoods.length; i++) {
          eGoods[i].title = U.subString(eGoods[i].title, 58)
        }
        that.setData({
          goods_list: eGoods
        });
        if (that.onpdrefresh) {
          that.onpdrefresh = false;
          wx.stopPullDownRefresh();
        }
        wx.hideLoading()
      },
      fail(err) {
        console.log(err)
      }
    })
  },
  onShareAppMessage: function (res) {
    console.log(this.invite_code)
    return {
      title: app.globalData.initData.mini_program_title,
      path: '/pages/index/index?invite_code=' + this.invite_code,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },

  onPullDownRefresh() {
    this.onpdrefresh = true
    this.setData({
      page: 1,
      isLast: false,
      goods_list: []
    })
    this.getGoods();
  },
  onPageScroll(e) {
    this.setData({
      distanceTop: e.scrollTop
    })
  },
  onReachBottom() {
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
  },
  toggleModal: function () {
    var flag = true;
    if (this.data.flag == true) {
      flag = false;
    }
    this.setData({ flag: flag })
  },
  gotoDetail: function (e) {
    var num_iid = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '../goodsDetail/goodsInfo?num_iid=' + num_iid + "&shop_type=" + this.data.shopType
    })
  },

  redirectLink: function (e) {
    var url = e.currentTarget.dataset.url
    if (url.indexOf('type=tabbar') != -1) {
      wx.switchTab({
        url: url,
      })
    }else{
      wx.redirectTo({
        url: url,
      })
    }
  }
})
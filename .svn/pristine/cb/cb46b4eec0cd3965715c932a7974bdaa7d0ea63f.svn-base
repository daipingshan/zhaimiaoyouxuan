// pages/search/search.js
const app = getApp();
const base = app.globalData.base;
const U = require('../../utils/util.js');
var common = require("../../utils/common.js")
Page({
	data: {
		goods: [],
		isEmpty:false,
		shopType: 'pinduoduo',
		level: -1,
	},
	onLoad: function (options) {
		wx.setNavigationBarTitle({
			title: '浏览记录'
		});
		wx.setNavigationBarColor({
			frontColor: '#000000',
			backgroundColor: '#ffffff'
		})
		//设置用户公共数据
		var userCommon = new common.UserCommon(this, options);
		userCommon.setToken();
		userCommon.setUserInfo();
		userCommon.setUserLevel();

		var historyData = wx.getStorageSync('historyData')
		var nowTime = Date.parse(new Date()) / 1000;
		for (var i = 0; i < historyData.length;i++){
			if (parseInt(historyData[i].coupon_end_time)<=nowTime){
				historyData.splice(i, 1);
			}
		}
		if(historyData){
			this.setData({
				goods: historyData,
			})
		}else{
			this.setData({
				isEmpty: true,
			})
		}
	},
	gotoDetail: function (e) {
		var num_iid = e.currentTarget.dataset.id
		wx.navigateTo({
			url: '../goodsDetail/goodsInfo?num_iid=' + num_iid + "&shop_type=" + this.data.shopType
		})
	},

	onPullDownRefresh() {
		this.onPullDown = false;
	}
})
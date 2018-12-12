// pages/search/search.js
const app = getApp();
const base = app.globalData.base;
const U = require('../../utils/util.js');
Page({
	data: {
		goods_list: [],
		page: 1,
		level:-1
	},
	onLoad: function (options) {
		var token = wx.getStorageSync('token');
		if (token) {
			this.token = token;
		}
		var userInfo = wx.getStorageSync('userInfo');
		if (userInfo) {
			this.userInfo = userInfo;
			var level = userInfo.level;
			if (level) {
				this.setData({
					level: userInfo.level
				})
			}
		}
		var title = ""
		this.type = options.type
		switch(options.type){
			case 'nine_nine':
				title="九块九专区"
				break
			case 'large_coupon':
				title = "大额优惠券专区"
				break
			case 'sale_list':
				title = "销售排行榜"
				break
			default:
				title="特殊专区"
		}
		wx.setNavigationBarTitle({
			title: title
		});
		var token = wx.getStorageSync('token');
		if (token) {
			this.token = token;
		}
		this.getGoodsSpecial()
	},
	getGoodsSpecial() {
		var that = this;
		var data = {};
		data.type = this.type
		if (this.token) {
			data.token = this.token;
		}
		var page = this.data.page;
		data.page = page;
		wx.request({
			url: base + '/Goods/special',
			data: data,
			success(res) {
				console.log(res)
				var goods = res.data.data, eGoods = [];
				var curGoods = that.data.goods_list;
				if (curGoods.length > 0) {
					eGoods = curGoods.concat(goods);
				} else {
					eGoods = goods;
				}
				for (var i = 0; i < eGoods.length; i++) {
					eGoods[i].goods_name = U.subString(eGoods[i].goods_name, 62)
				}
				that.setData({
					goods_list: eGoods
				});
				if (that.onpdrefresh) {
					that.onpdrefresh = false;
					wx.stopPullDownRefresh();
				}
			},
			fail(err) {
				console.log(err)
			}
		})
	},
	gotoDetail: function (e) {
		var goods_id = e.currentTarget.dataset.id
		console.log(goods_id)
		wx.navigateTo({
			url: '../goodsDetail/goodsInfo?goods_id=' + goods_id,
		})
	},
	onReachBottom() {
		var page = this.data.page, data = {}, that = this;
		page += 1;
		this.setData({
			page: page
		})
		this.getGoodsSpecial()
	}
})
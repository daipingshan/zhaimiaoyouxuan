// pages/orderdetails/orderdetails.js
const app = getApp();
const base = app.globalData.base;
const U = require('../../utils/util.js');
Page({
	data: {
		list: [],
		listLen: 0,
		page: 1,
		isLast: false
	},
	bindPickerChange: function (e) {
		this.setData({
			index: e.detail.value
		})
	},
	onLoad: function (options) {
		wx.setNavigationBarTitle({
			title: '提现记录'
		});
		var token = wx.getStorageSync('token');
		if (token) {
			this.token = token;
		}
		this.getOrder();
	},

	getOrder() {
		wx.showLoading({
			title: '加载中',
		})
		var that = this, data = {};
		if (this.token) {
			data.token = this.token;
		}

		data.page = that.data.page;
		wx.request({
			url: base + '/Withdraw/index',
			data: data,
			success(res) {
				var list = res.data.data;
				console.log(list);
				if (list.length < 20) {
					that.setData({
						isLast: true
					})
				}

				var eList = [];
				var curList = that.data.list;
				if (curList.length > 0) {
					eList = curList.concat(list);
				} else {
					eList = list;
				}

				eList.map((v, i) => {
					eList[i].add_time_trans = U.ftime(v.add_time);
					eList[i].settle_time_trans = U.ftime(v.settle_time);
				});
				that.setData({
					list: eList,
					listLen: eList.length
				});
				
				wx.hideLoading()
				if (that.onPullDown) {
					that.onPullDown = false;
					wx.stopPullDownRefresh()
				}
			}
		})
	},
	onReachBottom() {
		if (!this.data.isLast) {
			var page = this.data.page;
			page += 1;
			this.setData({
				page: page
			})
			this.getOrder();
		} else {
			wx.showToast({
				title: '暂无更多数据',
				icon: 'none',
				duration: 2000
			})
		}
	},
	onPullDownRefresh() {
		this.onPullDown = true;
		this.setData({
			page: 1,
			list:[],
			isLast:false
		})
		this.getOrder();
	}
})
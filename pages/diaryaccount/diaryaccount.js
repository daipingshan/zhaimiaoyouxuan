// pages/orderdetails/orderdetails.js
const app = getApp();
const base = app.globalData.base;
const U = require('../../utils/util.js');
Page({
	data: {
		start_day: '',
		end_day: '',
		detail: {},
		listLen: 0,
		hideShift: true,
		state: 'all',
		userLevel: '',
		page:1,
		isLast:false
	},
	onLoad: function (options) {
		wx.setNavigationBarTitle({
			title: '收入流水'
		});
		var curTime = new Date();
		var sevenTime = curTime.getTime() - 24 * 3600 * 7 * 1000;
		var seven = new Date(sevenTime);
		var userInfo = wx.getStorageSync('userInfo')
		this.setData({
			end_day: curTime.getFullYear() + "-" + (curTime.getMonth() * 1 + 1) + "-" + curTime.getDate(),
			start_day: seven.getFullYear() + "-" + (seven.getMonth() * 1 + 1) + "-" + seven.getDate(),
			userLevel: parseInt(userInfo.level)
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
		data.start_day = this.data.start_day;
		data.end_day = this.data.end_day;
		if (this.token) {
			data.token = this.token;
		}
		if (this.data.state) {
			data.source = this.data.state;
		}
		var page = that.data.page;
		data.page = page == 0 ? 1 : page;
		wx.request({
			url: base + '/CashFlow/index',
			data: data,
			success(res) {
				var detail = res.data.data;
				var list = detail.list;

				if (list.length < 20) {
					that.setData({
						isLast: true
					})
				}
				var eList = [];
				var curList = that.data.detail.list;
				if (curList && curList.length > 0) {
					eList = curList.concat(list);
				} else {
					eList = list;
				}

				eList.map((v, i) => {
					eList[i].add_time_trans = U.ftime(v.add_time);
				});
				detail.list = eList;
				that.setData({
					detail: detail,
					listLen: detail.list.length
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

	startChange(e) {
		var val = e.detail.value;
		this.setData({
			start_day: val,
			page: 1,
			detail: {},
			isLast: false
		})
		this.getOrder();
	},

	endChange(e) {
		var val = e.detail.value;
		this.setData({
			end_day: val,
			page: 1,
			detail: {},
			isLast: false
		})
		this.getOrder();
	},

	shiftAction() {
		var hideShift = this.data.hideShift;
		this.setData({
			hideShift: !hideShift
		})
	},

	changeState(e) {
		var ltype = e.target.dataset.type;
		switch (ltype) {
			case 'all':
				this.setData({
					state: ltype
				})
				break;
			case 'self':
				this.setData({
					state: ltype
				})
				break;
			case 'son':
				this.setData({
					state: ltype
				})
				break;
			case 'group_leader':
				this.setData({
					state: ltype
				})
				break;
			case 'award':
				this.setData({
					state: ltype
				})
				break;
			case 'red_packet':
				this.setData({
					state: ltype
				})
				break;
			case 'withdraw':
				this.setData({
					state: ltype
				})
				break;
			case 'partner':
				this.setData({
					state: ltype
				})
				break;
		}
	},

	ensure() {
		this.setData({
			hideShift: true,
			page: 1,
			detail: {},
			isLast: false
		});
		this.getOrder();
	},

	hideShiftAct() {
		this.setData({
			hideShift: true
		})
	},

	onPullDownRefresh() {
		this.onPullDown = true;
		this.setData({
			page: 1,
			isLast: false,
			detail: {}
		})
		this.getOrder();
	}
})
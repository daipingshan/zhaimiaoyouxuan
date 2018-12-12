// pages/team/team.js
const app = getApp();
const base = app.globalData.base;
const U = require('../../utils/util.js');
Page({
	data: {
		invite_level: 'son',
		list: [],
		listLen: 0,
		page:1,
		isLast:false
	},

	onLoad: function (options) {
		wx.setNavigationBarTitle({
			title: '我的团队'
		});
		wx.setNavigationBarColor({
			frontColor: '#000000',
			backgroundColor: '#ffffff'
		})
		var token = wx.getStorageSync('token');
		if (token) {
			this.token = token;
		}
		var userInfo = wx.getStorageSync('userInfo');
		this.invite_code = 'jintuitui';
		if (userInfo) {
			this.invite_code = userInfo.invite_code;
		}
		this.getTeam();
	},

	getTeam() {
		wx.showLoading({
			title: '加载中',
		})
		var that = this, data = {};
		data.invite_level = this.data.invite_level;
		if (this.token) {
			data.token = this.token;
		}

		data.page = that.data.page;
		wx.request({
			url: base + '/User/inviteList',
			data: data,
			success(res) {
				var list = res.data.data, eList = [];
				console.log(list);
				var curList = that.data.list;

				if(list.length<20){
					that.setData({
						isLast:true
					})
				}
				if (curList.length > 0 ) {
					eList = curList.concat(list);
				} else {
					eList = list;
				}
				that.setData({
					list: eList,
					listLen: eList.length
				})
				if (that.onPullDown) {
					that.onPullDown = false;
					wx.stopPullDownRefresh();
				}
				wx.hideLoading()
			},
			fail(err) {
				console.log(err)
			}
		})
	},
	onReachBottom() {
		if(!this.data.isLast){
			var page = this.data.page;
			page += 1;
			this.setData({
				page: page
			})
			this.getTeam();
		}else{
			wx.showToast({
				title: '暂无更多数据',
				icon : 'none',
				duration:2000
			})
		}
	},

	showSon() {
		this.setData({
			invite_level: 'son',
			page:1,
			isLast:false,
			list:[]
		})
		this.getTeam();
	},

	showOther() {
		this.setData({
			invite_level: 'other',
			page: 1,
			isLast: false,
			list: []
		});
		this.getTeam();
	},
	onShareAppMessage: function (res) {
		console.log(this.invite_code)
		return {
			title: app.globalData.initData.mini_program_title,
			imageUrl: app.globalData.initData.mini_program_pic,
			path: 'pages/index/index?invite_code=' + this.invite_code,
			success: function (res) {
				// 转发成功
			},
			fail: function (res) {
				// 转发失败
			}
		}
	},

	onPullDownRefresh() {
		this.onPullDown = true;
		this.setData({
			page: 1,
			isLast: false,
			list:[]
		})
		this.getTeam();
	}


})
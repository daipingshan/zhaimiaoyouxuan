// pages/my/my.js
const app = getApp();
const base = app.globalData.base;
var common = require("../../utils/common.js")
Page({
	data: {
		isLogin: false,
		userInfo: {},
		avatar: '',
		invite_tips: ''
	},
	onLoad: function (options) {
		var that = this;
		wx.setNavigationBarTitle({
			title: '我的',
		});
		wx.setNavigationBarColor({
			frontColor: '#ffffff',
			backgroundColor: '#fb004a'
		})
		//设置用户公共数据
		var userCommon = new common.UserCommon(this, options);
		userCommon.setToken();
		userCommon.setUserInfo();
		userCommon.setInviteCode();
		this.onPullDown = false;
		if(this.token){
			this.setData({
				isLogin: true
			})
		}
	},

	onShow() {
		var initData = app.globalData.initData;
		if (initData) {
			var invite_tips = initData.invite_tips;
			if (invite_tips) {
				this.setData({
					invite_tips: invite_tips
				})
			}
		}
		this.token = wx.getStorageSync('token');
		this.getDetail();
	},
	getDetail() {
		var that = this, data = {};
		if (this.token) {
			data.token = this.token;
		} else {
			if (that.onPullDown) {
				that.onPullDown = false;
				wx.stopPullDownRefresh();
			}
			return false;
		}
		var time = new Date();
		var tnow = time.getTime();
		var preTime = wx.getStorageSync('getDetail');
		if (this.onPullDown == false) {
			if (preTime > tnow && this.userInfo) {
				this.setData({
					userInfo: this.userInfo
				});
				return false;
			}
		}
		
		wx.request({
			url: base + '/User/index',
			data: data,
			success(res) {
				var userInfo = res.data.data;
				var code = res.data.code;
				if (code == 'not_login') {
					return;
				}
				that.setData({
					isLogin: true,
					userInfo: userInfo,
					invite_tips: userInfo.invite_tip
				});
				that.userInfo = userInfo;
				that.invite_code = userInfo.invite_code;
				wx.setStorageSync('userInfo', userInfo);
				wx.setStorageSync('invite_code', userInfo.invite_code);
				wx.hideLoading();
				wx.setStorage({
					key: 'getDetail',
					data: tnow + 600000
				})
				if (that.onPullDown){
					that.onPullDown = false;
					wx.stopPullDownRefresh();
				}
			}
		})
	},
	gotoIncome() {
		wx.navigateTo({
			url: '../income/income',
		})
	},
	orderDetail() {
		wx.navigateTo({
			url: '../orderdetails/orderdetails'
		})
	},
	gotoTeam() {
		wx.navigateTo({
			url: '../team/team',
		})
	},
	gotoAbout() {
		wx.navigateTo({
			url: '../about/about',
		})
	},
	goSetting(){
		wx.navigateTo({
			url: '../setting/setting',
		})
	},
	gotopromoters() {
		wx.navigateTo({
			url: '../promoters/promoters'
		})
	},
	gotoHistory() {
		wx.navigateTo({
			url: '../history/history'
		})
	},
	userLogin() {
		var that = this;
		wx.showLoading({
			title: '正在登录',
		})
		wx.login({
			success: res => {
				that.login(res.code);
			}
		});
	},
	login(code) {
		var that = this, data = {};
		data.mini_program_code = code;
		wx.request({
			url: base + '/Public/loginWithMiniProgramOpenid',
			method: 'POST',
			header: {
				'content-type': 'application/x-www-form-urlencoded'
			},
			data: data,
			success(res) {
				var code = res.data.code;
				if (code != 'success') {
					wx.hideLoading();
					wx.navigateTo({
						url: '../login/login',
					})
					return false;
				}
				that.token = res.data.data.token;
				wx.setStorageSync('token', res.data.data.token);
				that.getDetail();
			}
		})
	},
	onPullDownRefresh:function(){
		this.onPullDown = true;
		this.getDetail();
	},
	onShareAppMessage: function (res) {
		console.log('invite_code: ' + this.invite_code);
		return {
			title: app.globalData.initData.mini_program_title,
			imageUrl: app.globalData.initData.mini_program_pic,
			path: 'pages/index/index?invite_code=' + this.invite_code,
			success: function (res) {
				// 转发成功
				console.log(res)
			},
			fail: function (res) {
				// 转发失败
				console.log(res)
			}
		}
	}
})
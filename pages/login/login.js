// pages/login/login.js
const app = getApp();
const base = app.globalData.base;
const md5 = require('../../utils/md5.js');
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		username: '',
		password: '',
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		wx.setNavigationBarTitle({
			title: '绑定手机'
		});
	},
	loginUsername(e) {
		var username = e.detail.value;
		this.setData({
			username: username
		})
	},

	loginPassword(e) {
		var password = e.detail.value;
		this.setData({
			password: password
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
		var value = this.data, that = this;
		var username = value.username;
		var password = md5(value.password);

		var myreg = /^[1][3,4,5,7,8][0-9]{9}$/;
		if (myreg.test(username) && password) {
			var param = {
				mobile: username,
				password: password
			};
			wx.request({
				url: base + '/Public/login',
				data: param,
				method: 'POST',
				header: {
					'content-type': 'application/x-www-form-urlencoded'
				},
				success(res) {
					var data = res.data;
					if (data.code == "success") {
						wx.setStorageSync('token', data.data.token);
						var token = data.data.token;
						wx.request({
							url: base + '/User/bindMiniProgramOpenid',
							data: { mini_program_code: code, token: token },
							method: 'POST',
							header: {
								'content-type': 'application/x-www-form-urlencoded'
							},
							success(res) {
								console.log(res);
								var data = res.data;
								if (data.code == "success") {
									wx.reLaunch({
										url: '../user/user',
									})
								} else {
									wx.showToast({
										icon: "none",
										title: data.msg
									})
								}
							}
						})
					} else {
						wx.showToast({
							icon: "none",
							title: data.msg
						})
					}
				}
			})
		} else {
			wx.showToast({
				icon: "none",
				title: '账号或密码错误'
			})
		}
	},
	goToRegister() {
		wx.navigateTo({
			url: '../register/register'
		})
	}
})
// pages/setaccount/setaccount.js
const app = getApp();
const base = app.globalData.base;
const md5 = require('../../utils/md5.js');
Page({
	data: {
		curBank: '',
		isHide: true,
		countdown: '',
		mobile:'',
		code:'',
		password:'',
		confirm_password : '',
		invite_code:'',
		cding: false,
		hasInviteCode:false,
		isShowVoice: false
	},
	onLoad: function (options) {
		var storInviteCode = wx.getStorageSync('invite_code');
		if(storInviteCode && storInviteCode!==''){
			this.setData({
				hasInviteCode: true,
				invite_code: storInviteCode
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
	regMobile(e) {
		var mobile = e.detail.value;
		this.setData({
			mobile: mobile
		})
	},
	regCode(e) {
		var sms_code = e.detail.value;
		this.setData({
			sms_code: sms_code
		})
	},
	regPassword(e) {
		var password = e.detail.value;
		this.setData({
			password: password
		})
	},
	regCPassword(e) {
		var confirm_password = e.detail.value;
		this.setData({
			confirm_password: confirm_password
		})
	},
	regInviteCode(e) {
		var invite_code = e.detail.value;
		this.setData({
			invite_code: invite_code
		})
	},
	send() {
		this.sms('sms');
	},
	sendVoice() {
		var that = this;
		wx.showModal({
			title: '语音验证码',
			content: '我们将打电话给' + this.data.mobile + '，告知你验证码，您可能会接到029等开头的来电，请放心接听!',
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
		if (this.data.isShowVoice == false && this.data.cding) return;
		var myreg = /^[1][0-9]{10}$/;
		var mobile = this.data.mobile, that = this;
		if (myreg.test(mobile)) {
			wx.request({
				url: base + '/Public/sendCode',
				data: {
					mobile: mobile,
					type: 'register',
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
					}else{
						wx.showToast({
							icon: "none",
							title: res.data.msg
						})
					}
				}
			})
		} else {
			wx.showToast({
				icon: "none",
				title: '号码格式错误'
			})
		}
	},
	userRegister() {
		var that = this;
		wx.showLoading({
			title: '正在登录',
		})
		wx.login({
			success: res => {
				that.register(res.code);
			}
		});
	},
	register(code) {
		var value = this.data, that = this;
		var mobile = value.mobile;
		var password = value.password;
		var confirm_password = value.confirm_password;
		var sms_code = value.sms_code;
		var invite_code = value.invite_code;

		if (!mobile || !password || !confirm_password || !sms_code || !invite_code) {
			wx.showToast({
				icon: 'none',
				title: '所以选项必填',
			})
			return false;
		}
		if (password!=confirm_password){
			wx.showToast({
				icon: 'none',
				title: '两次输入密码不一致',
			})
			return false;
		}
		var reg = /^[0-9]{4}$/;
		if (!reg.test(sms_code)) {
			wx.showToast({
				icon: 'none',
				title: '验证码错误'
			});
			return false;
		}
		var param = {
			mobile: mobile,
			password: md5(password),
			code: sms_code,
			invite_code: invite_code,
			client_platform: 'mini_program'
		};
		wx.request({
			url: base + '/Public/register',
			data: param,
			method: 'POST',
			header: {
				'content-type': 'application/x-www-form-urlencoded'
			},
			success(res) {
				if (res.data) {
					if (res.data.code == 'success') {
						wx.setStorageSync('token', res.data.data.token);
						var token = res.data.data.token;
						wx.request({
							url: base + '/User/bindMiniProgramOpenid',
							data: { mini_program_code: code, token: token},
							method: 'POST',
							header: {
								'content-type': 'application/x-www-form-urlencoded'
							},
							success(res) {
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
									that.setData({
										hasInviteCode: false
									})
								}
							}
						})
					} else {
						wx.showToast({
							icon: 'none',
							title: res.data.msg
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
	}
})
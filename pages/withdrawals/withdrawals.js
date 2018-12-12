// pages/orderdetails/orderdetails.js
const app = getApp();
const base = app.globalData.base;
Page({
	data: {
		list: [],
		listLen: 0,
		bank_name:'',
		bank_account:'',
		account_balance: 0,
		min_withdraw_money: 20,
		settle_account_days: 10,
		code:'',
		isHide:true,
		countdown:'60s',
	},

	onLoad: function (options) {
		wx.setNavigationBarColor({
			frontColor: '#000000',
			backgroundColor: '#ffffff'
		})
		wx.setNavigationBarTitle({
			title: '提现记录'
		});
		
		var token = wx.getStorageSync('token');
		var userInfo = wx.getStorageSync('userInfo');
		var bank_account = wx.getStorageSync('bank_account');
		if (token) {
			this.token = token;
		}
		if (userInfo.account_balance) {
			this.setData({
				account_balance: userInfo.account_balance
			})
		}
		if (userInfo.bank_account) {
			this.setData({
				bank_account: userInfo.bank_account
			})
		}

		if (app.globalData.initData.min_withdraw_money) {
			this.setData({
				min_withdraw_money: app.globalData.initData.min_withdraw_money
			})
		}
		if (app.globalData.initData.settle_account_days) {
			this.setData({
				settle_account_days: app.globalData.initData.settle_account_days
			})
		}
		if (userInfo.bank_account) {
			this.bank_account = userInfo.bank_account;
		}
		
		if (userInfo.mobile) {
			this.mobile = userInfo.mobile;
		}
	},

	onShow:function(res){
		var userInfo = wx.getStorageSync('userInfo');
		this.token = wx.getStorageSync('token');
		if (userInfo.account_balance) {
			this.account_balance = userInfo.account_balance;
		}

		if (userInfo.bank_account) {
			this.bank_account = userInfo.bank_account;
		}
		if (userInfo.mobile) {
			this.mobile = userInfo.mobile;
		}
	},

	withdrawals() {
		var that = this, data = {};
		if (this.account_balance < this.data.min_withdraw_money) {
			wx.showModal({
				title: '提现失败',
				content: '暂未达到最低提现金额，满' + that.data.min_withdraw_money + '元起提',
				showCancel: false,
				confirmColor: '#808080',
			})
			return false;
		}
		if (!this.token) {
			wx.showToast({
				icon:'none',
				title: '参数错误',
			})
			return false;
		}
		data.token = this.token
		wx.request({
			url: base + '/Withdraw/add',
			data: data,
			success(res) {
				var code = res.data.code;
				if (code=="success"){
					this.setData({
						account_balance: 0
					})
					var userInfo = wx.getStorageSync('userInfo');
					userInfo.account_balance = 0;
					wx.setStorageSync('userInfo',userInfo);
					
					wx.showModal({
						title: '提现成功',
						content: res.data.msg,
						showCancel: false,
						confirmColor: '#808080',
					})
				}else{
					wx.showModal({
						title: '提现失败',
						content: res.data.msg,
						showCancel: false,
						confirmColor: '#808080',
					})
				}
			}
		})
	},

	showConfirm(){
		var that = this;
		
		this.send();
		this.count();
		this.setData({
			isHide: false
		})
	},
	count() {
		var that = this, count = 60;
		this.setData({
			cding: true
		});
		that.timer = setInterval(function () {
			count--;
			that.setData({
				countdown: count + ' s'
			});
			if(count<=0){
				clearInterval(that.timer);
				that.setData({
					countdown: '重新发送'
				})
			}
		}, 1000);
	},
	regCode(e) {
		var code = e.detail.value;
		this.setData({
			code: code
		})
	},
	send() {
		if (this.data.countdown != '60s' && this.data.countdown != '重新发送'){
			return false;
		}
		var myreg = /^[1][3,4,5,7,8][0-9]{9}$/;
		var mobile = this.mobile, that = this;
		if (myreg.test(mobile)) {
			wx.request({
				url: base + '/Public/sendCode',
				data: {
					mobile: mobile
				},
				success(res) {
					var code = res.data.code;
					if (code == 'success') {
						wx.showToast({
							title: '验证码已发送'
						});
						that.count();
					}
					if (code == 'fail') {
						wx.showToast({
							icon: "none",
							title: '请勿重复发送'
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
	goToPresentrecord(){
		wx.navigateTo({
			url: '../presentrecord/presentrecord',
		})
	}
})
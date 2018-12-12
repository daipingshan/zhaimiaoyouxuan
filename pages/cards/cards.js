// pages/orderdetails/orderdetails.js
const app = getApp();
const base = app.globalData.base;
Page({
	data: {
		bank_name:'',
		bank_account:'',
		bankIcon:''
	},

	onLoad: function (options) {
		wx.setNavigationBarColor({
			frontColor: '#000000',
			backgroundColor: '#ffffff'
		})
		wx.setNavigationBarTitle({
			title: '我的银行卡'
		});
	},
	onShow:function(){
		var userInfo = wx.getStorageSync('userInfo');
		var bank = ["建设银行", "交通银行", "招商银行", "农业银行", "工商银行", "邮政储蓄", "中国银行", "民生银行", "中信银行", "兴业银行"];
		for (var i = 0; i < bank.length; i++) {
			if (userInfo.bank_name == bank[i]) {
				this.setData({
					bankIcon: 'bank' + i
				})
				break;
			}
		}
		if (userInfo.bank_name) {
			this.setData({
				bank_name: userInfo.bank_name,
				bank_account: userInfo.bank_account
			})
		}
	},
	confirmChangeCard(){
		wx.showModal({
			title: '提示',
			content: '确定要更换您绑定的银行卡吗？',
			showCancel: true,
			cancelColor:'#ff2e00',
			confirmColor:'#808080',
			success(res) {
				if (res.confirm) {
					wx.navigateTo({
						url: '../setaccount/setaccount'
					})
				}
			}
		})
	}
})
// pages/setting/setting.js
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		userInfo:[]
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		wx.setNavigationBarColor({
			frontColor: '#000000',
			backgroundColor: '#ffffff'
		})
		wx.setNavigationBarTitle({
			title: '设置'
		});
	},
	onShow:function(){
		var userInfo = wx.getStorageSync('userInfo');
		this.setData({
			userInfo: userInfo
		})
	},
	goToCard(){
		if(!this.data.userInfo.mobile){
			wx.showModal({
				title: '提示',
				content: '您还未绑定手机号码，去绑定手机？',
				showCancel: true,
				cancelColor: '#ff2e00',
				confirmColor: '#808080',
				success(res) {
					if (res.confirm) {
						wx.navigateTo({
							url: '../setmobile/setmobile'
						})
					}
				}
			});
			
			return false;
		}
		if(this.data.userInfo.bank_name){
			wx.navigateTo({
				url: '../cards/cards'
			})
		}else{
			wx.navigateTo({
				url: '../setaccount/setaccount'
			})
		}
	},
	logout() {
		wx.clearStorage()
		wx.showToast({
			title: '退出成功',
			duration: 1000,
			success: function () {
				setTimeout(function(){
					wx.reLaunch({
						url: '../index/index',
					})
				}, 1500)
			}
		})
	}
})
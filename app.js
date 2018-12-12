//app.js

App({
	globalData: {
		userInfo: null,
		base: "https://api.zhaimiaosh.com",
		initData: {},
		deviceInfo : {}
	},
	onLaunch: function () {
		this.getDeviceInfo();
		this.init();
	},
	//获取设备初始化宽高
	getDeviceInfo() {
		var res = wx.getSystemInfoSync();
		res.rpxR = 750 / res.windowWidth;
		res.rpxWidth = res.rpxR * res.windowWidth;
		res.rpxHeight = res.rpxR * res.windowHeight;
		this.globalData.deviceInfo = res;
	},
	//初始化参数
	init() {
		var that = this;
		wx.request({
			url: this.globalData.base + '/Public/appLoadInit',
			data: { client_platform: "mini_program" },
			success(res) {
				var data = res.data.data;
				that.globalData.initData = data;
				if (that.initCallback) {
					that.initCallback(data)
				}
			}
		})
	}
})
const app = getApp();
const base = app.globalData.base;

Page({
	data: {
		income: {},
		hideRule: true,
		hideTab: true,
		account_balance: 0,
		userInfo: {},
		invite_a_num: 0,
		invite_b_num: 0
	},

	onLoad(options) {
		wx.setNavigationBarTitle({
			title: '推广收益'
		})
		wx.setNavigationBarColor({
			frontColor: '#000000',
			backgroundColor: '#ffffff'
		})
		var token = wx.getStorageSync('token');
		var userInfo = wx.getStorageSync('userInfo');
		if (token) {
			this.token = token;
		}
		if (userInfo) {
			this.setData({
				userInfo: userInfo,
				invite_a_num: userInfo.invite_a_num,
				invite_b_num: userInfo.invite_b_num
			});

		}
		this.getBalance();
	},

	onShow: function (res) {
		var userInfo = wx.getStorageSync('userInfo');
		this.token = wx.getStorageSync('token');

		if (app.globalData.initData.min_withdraw_money) {
			this.min_withdraw_money = app.globalData.initData.min_withdraw_money
		}
		if (userInfo.account_balance) {
			this.account_balance = userInfo.account_balance
		}
		if (userInfo.bank_account) {
			this.bank_account = userInfo.bank_account;
		}
		if (userInfo.mobile) {
			this.mobile = userInfo.mobile;
		}
	},

	getBalance() {
		var that = this,
			data = {};
		if (this.token) {
			data.token = this.token;
		}
		wx.request({
			url: base + '/Balance/index',
			data: data,
			success(res) {
				var income = res.data.data;
				that.setData({
					income: income
				})
			},
			fail(err) {
				console.log(err)
			}
		})
	},

	clickTab(opt) {
		if (opt.target.dataset.current === '0') {
			this.setData({
				hideTab: true
			})
		} else {
			this.setData({
				hideTab: false
			})
		}
	},

	goToOrderDetailToday() {
		var curTime = new Date();
		var start_day = curTime.getFullYear() + "-" + (curTime.getMonth() * 1 + 1) + "-" + curTime.getDate();
		var end_day = curTime.getFullYear() + "-" + (curTime.getMonth() * 1 + 1) + "-" + curTime.getDate();
		this.goToOrderDetail(start_day,end_day)
	},
	goToOrderDetailYesterday() {
		var curTime = new Date();
		var yesterdayTimestamp = curTime.getTime() - 24 * 3600 * 1 * 1000;
		var yesterday = new Date(yesterdayTimestamp);
		var start_day = yesterday.getFullYear() + "-" + (yesterday.getMonth() * 1 + 1) + "-" + yesterday.getDate();
		var end_day = yesterday.getFullYear() + "-" + (yesterday.getMonth() * 1 + 1) + "-" + yesterday.getDate();

		this.goToOrderDetail(start_day, end_day)
	},
	goToOrderDetailThisMonth() {
		var curTime = new Date();
		var end_day = curTime.getFullYear() + "-" + (curTime.getMonth() * 1 + 1) + "-" + curTime.getDate();

		var firstDayTimestamp = curTime.setDate(1);
		var firstDay = new Date(firstDayTimestamp);
		var start_day = firstDay.getFullYear() + "-" + (firstDay.getMonth() * 1 + 1) + "-" + firstDay.getDate();
		this.goToOrderDetail(start_day, end_day)
	},

	goToOrderDetailLastMonth() {
		var nowdays = new Date();
		var year = nowdays.getFullYear();
		var month = nowdays.getMonth();
		if (month == 0) {
			month = 12;
			year = year - 1;
		}
		if (month < 10) {
			month = "0" + month;
		}
		var start_day = year + "-" + month + "-" + "01";//上个月的第一天  

		var myDate = new Date(year, month, 0);
		var end_day = year + "-" + month + "-" + myDate.getDate();//上个月的最后一天 
		this.goToOrderDetail(start_day, end_day)
	},

	//跳转至订单详情
	goToOrderDetail(start_day,end_day) {
		wx.navigateTo({
			url: '../orderdetails/orderdetails?start_day='+start_day+'&end_day='+end_day
		})
	},

	diaryaccount() {
		wx.navigateTo({
			url: '../diaryaccount/diaryaccount'
		})
	},

	presentrecord() {
		wx.navigateTo({
			url: '../presentrecord/presentrecord'
		})
	},

	withdrawals() {
		var that = this
		if (!this.bank_account) {
			wx.showModal({
				title: '设置提现账号',
				content: '您还没有设置提现帐号，请先设置提现帐号!',
				showCancel: true,
				cancelColor: '#ff2e00',
				confirmColor: '#808080',
				success(res) {
					if (res.confirm) {
						// 跳转到设置提现帐号的页面
						wx.navigateTo({
							url: '../setaccount/setaccount'
						})
					}
				}
			})
			return false;
		}
		wx.navigateTo({
			url: '../withdrawals/withdrawals',
		})
	},

	showRule() {
		wx.navigateTo({
			url: '../explain/explain'
		})
	},
})
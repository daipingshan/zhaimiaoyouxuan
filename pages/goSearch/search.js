// pages/search/search.js
const app = getApp();
const base = app.globalData.base;
const U = require('../../utils/util.js');
var common = require("../../utils/common.js")
Page({
	data: {
		keywords: '',
		hideHistory: true,
		hideHot: false,
		search_tips: '',
		search_keyword: [],
		goods: [],
		history: [],
		desc: 'all',
		sort_type: 0,
		level: -1,
		page: 1,
		isLast:false,
		sort_price: 'default',
		shopType: 'pinduoduo'
	},
	onLoad: function (options) {
		wx.setNavigationBarTitle({
			title: '搜索'
		});
		var history = wx.getStorageSync('history')
		history = history ? this.data.history.concat(history) : this.data.history;
		if(history.length>0){
			this.setData({
				history: history,
				hideHistory: false,
			})
		}

		this.clearAll = false;
		this.shopType = options.shopType
		this.setData({
			shopType: this.shopType
		})
		
		//设置用户公共数据
		var userCommon = new common.UserCommon(this, options);
		userCommon.setToken();
		userCommon.setUserInfo();
		userCommon.setUserLevel();

		this.setData({
			search_tips: app.globalData.initData.search_tips,
			search_keyword: app.globalData.initData.search_keyword
		})
	},
	changeWords(e) {
		this.setData({
			keywords: e.detail.value
		});
	},
	gotoHot(e) {
		var index = e.currentTarget.dataset.index;
		var curWord = this.data.search_keyword[index];
		this.setData({
			keywords: curWord,
		});
		this.search();
	},
	gotoHis(e) {
		var index = e.currentTarget.dataset.index;
		var curWord = this.data.history[index];
		this.setData({
			keywords: curWord,
		})
		this.search();
	},
	gotoDetail: function (e) {
		var num_iid = e.currentTarget.dataset.id
		wx.navigateTo({
			url: '../goodsDetail/goodsInfo?num_iid=' + num_iid + "&shop_type=" + this.data.shopType,
		})
	},
	showHotSearch() {
		this.setData({
			hideHot: false
		})
	},
	clearHis() {
		wx.removeStorageSync('history')
		this.setData({
			history: [],
			hideHistory: true
		})
	},
	search(e) {
		var keywords = this.data.keywords,
			history = this.data.history,
			flag = true;
		history.map((v, i) => {
			if (v == keywords) {
				flag = false;
			}
		});
		if (history.length > 10) {
			history.shift()
		}
		if (flag) {
			history.push(keywords);
		}
		wx.setStorage({
			key: 'history',
			data: history,
		})

		this.setData({
			goods: [],
			hideHot: true,
			history: history,
			hideHistory: false,
			desc: 'all',
			isLast:false,
			page:1,
			sort_type: 0,
			sort_price: 'default'
		});

		this.getGoods();
	},
	descGoods(e) {
		var descType = e.currentTarget.dataset.desctype;
		this.setData({
			desc: descType,
			page:1,
			isLast:false,
			sort_price: 'default',
			goods:[]
		});
		switch (descType) {
			case 'all':
				this.setData({
					sort_type: 0
				});
				break;
			case 'count':
				this.setData({
					sort_type: 'sale'
				});
				break;
			case 'price':
				if (this.data.sort_type == 'coupon_price_asc') {
					this.setData({
						sort_type: 'coupon_price_desc',
						sort_price: 'down'
					});
				} else {
					this.setData({
						sort_type: 'coupon_price_asc',
						sort_price: 'up'
					});
				}
				break;
			case 'income':
				this.setData({
					sort_type: 'commission_rate_desc'
				});
				break;
		}
		this.getGoods();
	},
	
	getGoods(){
		wx.showLoading({
			title: '加载中',
		})
		var that = this,data={};
		if (this.token) {
			data.token = this.token;
		}
		data.keyword = this.data.keywords;
		data.page = this.data.page;
		data.type = this.shopType;
		data.sort_field = that.data.sort_type;
		wx.request({
			url: base + '/Item/search',
			data: data,
			success(res) {
				var data = res.data.data, curGoods = that.data.goods, eGoods = [];
				if(data.length<20){
					that.setData({
						isLast:true
					})
				}
				if (curGoods.length > 0) {
					eGoods = curGoods.concat(data)
				} else {
					eGoods = data;
				}
				for (var i = 0; i < eGoods.length; i++) {
					eGoods[i].title = U.subString(eGoods[i].title, 56)
				}
				that.setData({
					goods: eGoods
				});
				if (that.onPullDown) {
					that.onPullDown = false;
					wx.stopPullDownRefresh();
				}
				wx.hideLoading();
			},
			fail(err) {
				console.log(err)
			}
		})
	},

	onReachBottom() {
		console.log(this.data.isLast)
		if (!this.data.isLast) {
			var page = this.data.page;
			page += 1;
			console.log(page)
			this.setData({
				page: page
			})
			this.getGoods();
		} else {
			wx.showToast({
				title: '暂无更多数据',
				icon: 'none',
				duration: 2000
			})
		}
	},

	onPullDownRefresh() {
		this.onPullDown = true;
		this.setData({
			page: 1,
			isLast: false,
			goods: []
		})
		this.getGoods();
	}
})
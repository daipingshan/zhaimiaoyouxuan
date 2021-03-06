// pages/goodsDetail/goodsInfo.js
const app = getApp()
const base = app.globalData.base;
const U = require('../../utils/util.js');
var publicData = require("../../utils/data.js")
var common = require("../../utils/common.js")
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		goods: {},
		current: 1,
		swiper_all: 4,
		level: -1,
		flag: true,
		share_image: '',
		curr_width: 0,
		curr_height: 0,
		qrcode: '',
		tempPath: "",
		show_flag: true,
		canvasHeight: 0,
		modalMarginTop: "6%",
		modal_height: "",
		shopType: 'pinduoduo',
		couponEndTime: '',
		isShowCoupon: -1,
		imageSrc: '',
		radioText: '',
		totalFavored: 0,
		desc_images: [],
		showTips: false,
		hideLoadMore: false,
    is_redirect_coupon:'no'
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		wx.setNavigationBarTitle({
			title: "商品详情"
		});
		//判断
		if (options.scene) {
			var scene = decodeURIComponent(options.scene)
			var sceneArray = scene.split("/")

			if (sceneArray[0]) {
				options.num_iid = sceneArray[0]
			}
			if (sceneArray[1]) {
				options.invite_code = sceneArray[1]
			}
			if (sceneArray[2]) {
				options.shop_type = sceneArray[2]
			}
		}
    if (options.is_redirect_coupon == 'yes'){
        this.setData({
          is_redirect_coupon:'yes'
        })
    }
		//设置宽高 菜单滚动限制
		this.setData({
			curr_width: app.globalData.deviceInfo.windowWidth,
			curr_height: app.globalData.deviceInfo.windowHeight,
		});

		this.id = options.num_iid;
		this.shop_type = options.shop_type;
		this.setData({
			shopType: this.shop_type
		})

		//设置用户公共数据
		var userCommon = new common.UserCommon(this, options);
		userCommon.setToken();
		userCommon.setUserInfo();
		userCommon.setUserLevel();
		userCommon.setInviteCode();

		if (!this.userInfo) {
			this.userLogin();
		}
    this.getDetail();
	},
	radioTips: function () {
		var that = this;
		var length = this.lately_buy_users.length
		var userArray = this.lately_buy_users
		var val = 0;
		var tempVal = 0;
		setInterval(function () {

			var tempAvatar = userArray[val].avatar ? userArray[val].avatar : '../../resource/page/goodsDetail/miao.png';
			var tempRadioText = userArray[val].nickname + ' 刚刚领券购买了该商品'
			that.setData({
				imageSrc: tempAvatar,
				radioText: tempRadioText
			})

			if ((tempVal % 2) == 0) {
				that.setData({
					showTips: true
				})
				val++;
			} else {
				that.setData({
					showTips: false
				})
			}
			tempVal++;
			if (val == length) {
				val = 0;
			}
		}, 3000);
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
				if (code == 'success') {
					that.token = res.data.data.token;
					wx.setStorageSync('token', res.data.data.token);
					that.getUserInfo();
				} else {
					// wx.showToast({
					// 	icon: "none",
					// 	title: res.data.msg
					// })
				}
			}
		})
	},
	getUserInfo() {
		var that = this, data = {};
		if (this.token) {
			data.token = this.token;
		} else {
			return;
		}
		var time = new Date();
		var tnow = time.getTime();
		var preTime = wx.getStorageSync('getDetail');
		if (preTime > tnow && this.userInfo) {
			return false;
		}
		wx.request({
			url: base + '/User/index',
			data: data,
			success(res) {
				var userInfo = res.data.data;
				var code = res.data.code;

				if (code == 'success') {
					that.setData({
						isLogin: true,
						invite_tips: userInfo.invite_tip
					});
					console.log(userInfo)
					that.invite_code = userInfo.invite_code;
					wx.setStorageSync('userInfo', userInfo);
					wx.setStorageSync('invite_code', userInfo.invite_code);
					wx.hideLoading();
					wx.setStorage({
						key: 'getDetail',
						data: tnow + 600000
					})
				} else {
					// wx.showToast({
					// 	icon: "none",
					// 	title: res.data.msg
					// })
				}
			}
		})
	},
	backHome() {
		wx.switchTab({
			url: '../index/index'
		})
	},
	getDetail() {
		wx.showLoading({
			title: '加载中',
		})
		var that = this, data = {};
		data.num_iid = this.id;
		data.type = this.shop_type;
		if (this.token && this.token != "undefined") {
			data.token = this.token;
		}
		data.invite_code = this.invite_code
		wx.request({
			url: base + '/Item/detail',
			data: data,
			success(res) {
				var goods = res.data.data;
				console.log(goods);
				if (goods.length <= 0) {
					wx.hideLoading()
					wx.showToast({
						title: "当前商品已失效，即将跳转回首页",
						duration: 3000,
						complete: function () {
							wx.reLaunch({
								url: '../index/index',
							})
						}
					})
				} else {
					var nowTime = Date.parse(new Date()) / 100;
					var endTime = parseInt(goods.coupon_end_time) * 10;
					if (goods.commission > 0) {
						that.setData({
							isShowCoupon: true,
						});
						if ((endTime - nowTime) >= 864000) {
							var couponEndTime = '有效期至 ' + U.ftimeToDate(goods.coupon_end_time)
							that.setData({
								couponEndTime: couponEndTime
							});
						} else if ((endTime - nowTime) < 864000 && (endTime - nowTime) > 0) {
							that.countDown((endTime - nowTime));
						}
					} else {
						that.setData({
							isShowCoupon: true,
						});
					}

					if (goods.lately_buy_users.length > 0) {
						that.lately_buy_users = goods.lately_buy_users
						that.radioTips();
					} else {
						that.setData({
							showTips: false
						})
					}
					var totalFavored = 0;
					if (that.data.level < 5) {
						totalFavored = parseFloat(goods.coupon_money) + parseFloat(goods.commission)
					} else {
						totalFavored = parseFloat(goods.coupon_money) + parseFloat(goods.group_leader_commission)
					}
					that.setData({
						totalFavored: totalFavored.toFixed(2)
					})

					that.desc_images = goods.desc_images;

					that.setData({
						goods: goods
					});
					console.log(goods);
					//保存浏览记录
					var goodsData = {};
					goodsData.goods_id = goods.num_iid;
					goodsData.goods_name = U.subString(goods.title, 58);
					goodsData.goods_thumbnail_url = goods.small_images[0];
					goodsData.commission = goods.commission;
					goodsData.group_leader_commission = goods.group_leader_commission;
					goodsData.min_group_price = goods.price;
					goodsData.after_coupon_price = goods.coupon_price;
					goodsData.coupon_end_time = goods.coupon_end_time;
					goodsData.sold_quantity = goods.sale_num;
					goodsData.coupon_discount = goods.coupon_money;
					goodsData.shop_type = that.shop_type;

					var historyData = wx.getStorageSync('historyData');
					if (historyData) {
						for (var i = 0; i < historyData.length; i++) {
							if (historyData[i].goods_id == goodsData.goods_id) {
								historyData.splice(i, 1);
								break;
							}
						}
						if (historyData.length >= 50) {
							historyData.pop();
						}
						historyData.unshift(goodsData);
					} else {
						historyData = [goodsData]
					}
					wx.setStorageSync('historyData', historyData)

					var small_images = goods.small_images;
					if (small_images) {
						that.setData({
							swiper_all: small_images.length,
							share_image: small_images[0]
						})
					}
					wx.hideLoading();
          if (that.data.is_redirect_coupon == 'yes'){
              that.openTo();
          }
				}
			}
		})
	},
	swiper(e) {
		var current = e.detail.current;
		this.setData({
			current: current + 1
		})
	},

	openTo() {
		var isAllowToPin = false
		wx.getSystemInfo({
			success: function (res) {
				var version = res.SDKVersion;
				version = version.replace(/\./g, "")
				if (version.length == 3) {
					if (parseInt(version) > 130) {
						isAllowToPin = true
					}
				} else if (version.length == 4) {
					if (parseInt(version) > 1300) {
						isAllowToPin = true
					}
				}
			}
		})
		if (!isAllowToPin) {
			wx.showModal({
				title: "提示",
				content: "当前客户端版本过低，请升级客户端",
				confirmText: "确定",
			})
		}
		var goods = this.data.goods;
		if (this.shop_type == 'pinduoduo') {
			wx.navigateToMiniProgram({
				appId: 'wx32540bd863b27570',
				path: goods.pinduoduo_info.pdd_mini_program_path,
				extraData: {
					foo: 'bar'
				},
				envVersion: 'release',
				success(res) {
					// 打开成功
				}
			})
		} else if (this.shop_type == 'jingdong') {
			wx.navigateToMiniProgram({
				appId: 'wx13e41a437b8a1d2e',
				path: goods.jingdong_info.jd_mini_program_path,
				extraData: {
					foo: 'bar'
				},
				envVersion: 'release',
				success(res) {
					// 打开成功
					console.log(res);
				}
			})
		}
	},
	showTips: function () {
		var that = this, title, content;
		if (this.data.level < 1) {
			title = '如何成为推广员';
			content = '成功邀请一名新用户注册，即可成为平台推广员，分享可获得推广员奖励' + this.data.goods.commission + '元，邀请新用户越多，等级越高，赚得越多';
		} else if (this.data.level >= 1 && this.data.level < 5) {
			title = '推广员奖励';
			content = '此处展示的奖励收入为v1推广员奖励收入，v1级别以上的推广员可能会有额外收入';
		} else {
			title = '团长奖励';
			content = '此处展示的奖励收入为团长自购拿到的最高收益，具体收入以实际下单为准';
		}
		wx.showModal({
			title: title,
			content: content,
			showCancel: false,
			confirmText: '我知道了',
			confirmColor: '#ff1849',
		})
	},
	findBreakPoint: function (text, width, context) {
		var min = 0;
		var max = text.length - 1;
		while (min <= max) {
			var middle = Math.floor((min + max) / 2);
			var middleWidth = context.measureText(text.substr(0, middle)).width;
			var oneCharWiderThanMiddleWidth = context.measureText(text.substr(0, middle + 1)).width;
			if (middleWidth <= width && oneCharWiderThanMiddleWidth > width) {
				return middle;
			}
			if (middleWidth < width) {
				min = middle + 1;
			} else {
				max = middle - 1;
			}
		}

		return -1;
	},
	breakLinesForCanvas: function (text, width, ctx) {
		var result = [];
		var breakPoint = 0;

		while ((breakPoint = this.findBreakPoint(text, width, ctx)) !== -1) {
			result.push(text.substr(0, breakPoint));
			text = text.substr(breakPoint);
		}

		if (text) {
			result.push(text);
		}
		return result;
	},
	getQrcode() {
		wx.showLoading({
			title: '生成中',
		})
		var that = this
		wx.request({
			url: base + '/Item/getMiniProgramCodePic?num_iid=' + that.id + "&invite_code=" + that.invite_code + '&shop_type=' + this.shop_type,
			success: function (res) {
				if (res.data.code == "success") {
					wx.getImageInfo({
						src: res.data.data.mini_program_code_pic,
						success: function (res) {
							that.setData({
								qrcode: res.path
							})
							that.genImage()
						}, fail(res) {
							console.log(res)
						}
					})
				}
			},
			fail: function (res) {
				console.log(res)
			}
		})
	},
	genImage: function () {
		var title = this.data.goods.title;
		var ctx = wx.createCanvasContext('share-image')
		var that = this
		var qrcode = ""

		var modal_width = this.data.curr_width * 0.865

		//测算高度
		ctx.font = "normal normal 200 14px 微软雅黑";
		var result = that.breakLinesForCanvas(title, modal_width - 15, ctx)

		//根据设备可用宽高比判断上边距距离
		if ((this.data.curr_width / this.data.curr_height) < 0.59) {
			if (result.length > 2) {
				that.setData({
					modalMarginTop: "1%"
				})
			} else {
				that.setData({
					modalMarginTop: "3%"
				})
			}
		}
		var topHeight = 0
		for (var i = 0; i < result.length; i++) {
			var topHeight = modal_width + 17 + i * 20
		}
		var modal_height = topHeight + 120
		that.setData({
			modal_height: modal_height
		})
		//清空画布
		ctx.clearRect(0, 0, modal_width, modal_height)

		//绘制背景色
		ctx.setFillStyle('#fff')
		ctx.fillRect(0, 0, modal_width, modal_height);

		var imageUrl = that.data.goods.small_images[0]
		wx.getImageInfo({
			src: imageUrl,
			success: function (res) {
				ctx.drawImage(res.path, 0, 0, modal_width, modal_width)
				//写入标题文字
				ctx.font = "normal normal 200 14px 微软雅黑";
				ctx.setFillStyle('#5a5a5a')
				ctx.setTextAlign('left')
				var result = that.breakLinesForCanvas(title, modal_width - 15, ctx)
				var topHeight = 0
				for (var i = 0; i < result.length; i++) {
					ctx.fillText(result[i], 10, modal_width + 17 + i * 20)
					var topHeight = modal_width + 17 + i * 20
				}

				//写入price 券后价
				ctx.font = '14px 微软雅黑';
				ctx.setFillStyle('#ef230b')
				ctx.fillText("¥", 10, topHeight + 30);
				ctx.font = '26px 微软雅黑';
				ctx.setFillStyle('#ef230b')
				ctx.fillText(that.data.goods.coupon_price, 20, topHeight + 30);
				var tempMargin = ctx.measureText(that.data.goods.coupon_price)

				//原价
				ctx.font = '13px 微软雅黑';
				ctx.setFillStyle('#9e9e9e')
				ctx.fillText("¥", tempMargin.width + 25, topHeight + 30);
				ctx.font = '13px 微软雅黑';
				ctx.setFillStyle('#9e9e9e')
				ctx.fillText(that.data.goods.price, tempMargin.width + 35, topHeight + 30);
				//删除线
				ctx.beginPath()
				ctx.setStrokeStyle('#9e9e9e')
				ctx.moveTo(tempMargin.width + 25, topHeight + 25)
				ctx.lineTo(tempMargin.width + 65, topHeight + 25)
				ctx.stroke()

				topHeight = topHeight + 40

				//绘制优惠券
				if (parseInt(that.data.goods.coupon_money) > 0) {
					ctx.drawImage("../../resource/page/index/ticket.png", 10, topHeight + 5, 65, 20)
					ctx.font = '15px 微软雅黑';
					ctx.setFillStyle('#ff1849')
					ctx.fillText("¥" + that.data.goods.coupon_money, 40, topHeight + 20);
				}

				//购买人数
				if (parseInt(that.data.goods.sale_num) > 10) {
					ctx.font = '11px 微软雅黑';
					ctx.setFillStyle('#9e9e9e')
					var sold_num = parseInt(that.data.goods.sale_num)
					if (sold_num > 10000) {
						sold_num = (Math.floor(sold_num / 10000)).toString() + "万"
					}
					ctx.fillText("已抢" + sold_num + "件", 10, topHeight + 50);
				}

				ctx.drawImage(that.data.qrcode, modal_width / 3 * 2, topHeight - 35, modal_width / 3.6, modal_width / 3.6)
				ctx.font = '14px 微软雅黑';
				ctx.setFillStyle('#ef230b')
				ctx.setTextAlign('center')
				ctx.fillText("长按领券", modal_width / 2, topHeight + 70);

				that.setData({
					flag: false,
					canvasHeight: modal_height
				})
				ctx.draw()

				setTimeout(function () {
					wx.canvasToTempFilePath({
						canvasId: 'share-image',
						width: modal_width,
						height: modal_height,
						success: function (tempRes) {
							console.log(tempRes.tempFilePath)
							that.setData({
								tempPath: tempRes.tempFilePath,
							})
						}, fail(res) {
							console.log(res)
						}
					})
				}, 1500)

				setTimeout(function () {
					wx.hideLoading()
				}, 2000)
			}
		})
	},
	saveCanvas() {
		wx.showLoading({
			title: '保存中',
		})
		var that = this
		var tempPath = this.data.tempPath

		wx.getSetting({
			success: function (res) {
				if (!res.authSetting['scope.writePhotosAlbum']) {
					wx.authorize({
						scope: 'scope.writePhotosAlbum',
						success() {
							wx.saveImageToPhotosAlbum({
								filePath: tempPath,
								success: function (res) {
									wx.showToast({
										title: '保存成功',
										icon: "success"
									})
								}, fail: function (res) {
									console.log(res)
								}
							})
						},
						fail() {
							wx.showModal({
								title: "提示",
								content: "将图片保存至相册需要访问相册权限，请设置为允许访问相册",
								confirmText: "允许",
								complete: function (res) {
									if (res.confirm) {
										wx.openSetting({
											success: (res) => {
												if (res.authSetting["scope.writePhotosAlbum"]) {
													wx.saveImageToPhotosAlbum({
														filePath: tempPath,
														success: function (res) {
															wx.showToast({
																title: '保存成功',
																icon: "success"
															})
														}, fail: function (res) {
															console.log(res)
														}
													})
												}
											},
											fail: function (res) {
												console.log(res)
											}
										})
									}
								}
							}) // 向用户提示需要权限才能继续
						}
					})
				} else {
					wx.saveImageToPhotosAlbum({
						filePath: tempPath,
						success: function (res) {
							wx.showToast({
								title: '保存成功',
								icon: "success"
							})
						}, fail: function (res) {
							console.log(res)
							wx.showToast({
								title: '取消保存',
							})
						}
					})
				}
			}
		})
		// wx.hideLoading()
	},
	touchMove() {
		return false;
	},
	hide: function () {
		this.setData({ flag: true })
	},
	copyString: function () {
		var str;
		if(this.shop_type=='pinduoduo'){
			str = '拼团价';
		}else{
			str = '京东价';
		}
		var copyString = this.data.goods.title + "\n"
		copyString += "~~~~~~~~~~~~ \n"
		copyString += str+"：" + this.data.goods.price + "元 \n"
		copyString += "券后价：" + this.data.goods.coupon_price + "元 \n"
		copyString += "优惠券：" + this.data.goods.coupon_money + "元 \n"
		copyString += "领券链接：" + this.data.goods.buy_url + "\n";

		wx.setClipboardData({
			data: copyString,
			success: function (res) {
				wx.getClipboardData({
					success: function (res) {
						wx.showToast({
							title: '已复制',
							duration: 2000
						})
					}
				})
			}
		})
	},
	showCanvas: function () {
		wx.previewImage({
			urls: [this.data.tempPath]
		})
	},
	countDown: function (times) {
		var that = this;
		var timer = null;
		timer = setInterval(function () {
			var hour = 0,
				minute = 0,
				second = 0,
				minSecond = 0;//时间默认值
			if (times > 0) {
				hour = Math.floor(times / (60 * 60 * 10));
				minute = Math.floor((times - (hour * 60 * 60 * 10)) / 600);
				second = Math.floor((times - (hour * 60 * 60 * 10) - (minute * 60 * 10)) / 10);
				minSecond = Math.floor(times - (hour * 60 * 60 * 10) - (minute * 60 * 10) - (second * 10))
			}
			if (hour <= 9) hour = '0' + hour;
			if (minute <= 9) minute = '0' + minute;
			if (second <= 9) second = '0' + second;

			that.setData({
				couponEndTime: '距优惠结束还有 ' + hour + ":" + minute + ":" + second + "." + minSecond
			})
			if (times <= 10) {
				that.setData({
					isShowCoupon: false
				});
				clearInterval(timer);
			}
			times--;
		}, 100);
	},
	onPageScroll(e) {
		if (e.scrollTop > 0 && this.data.hideLoadMore==false) {
			wx.showLoading({
				title: '加载中',
			})
			this.setData({
				hideLoadMore: true,
				desc_images: this.desc_images
			})
			wx.hideLoading();
		}
	},
	onShareAppMessage: function (res) {
		var goods = this.data.goods;
		var share_title;
		if(this.shop_type=='pinduoduo'){
			share_title = '【抢' + goods.coupon_money + '元无门槛优惠券】我' + goods.coupon_price + '元拼了' + goods.title + '，推荐给你';
		}else{
			share_title = '【京东原价' + goods.price + '元，券后' + goods.coupon_price+'元】'+ goods.title;
		}
		console.log(share_title)
		return {
			title: share_title,
			path: '/pages/goodsDetail/goodsInfo?num_iid=' + goods.num_iid + '&invite_code=' + this.invite_code + '&token=' + this.token + '&shop_type='+this.shop_type,
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
function UserPublicData(wxObj,wxOptions){
	this.wxObj = wxObj;
	this.wxOptions = wxOptions;
	this.wxObj.invite_code = false;
}
UserPublicData.prototype = {
	constructor: UserPublicData,
	//设置用户公共数据
	setToken:function(){
		this.wxObj.token = this.wxOptions.token; //获取传入token
		var token = wx.getStorageSync('token');
		if (token) {
			this.wxObj.token = token;
		}
	},
	setUserInfo:function(){
		var userInfo = wx.getStorageSync('userInfo');
		if (userInfo) {
			this.wxObj.userInfo = userInfo;
		}
	},
	setUserLevel:function(){
		if (this.wxObj.userInfo) {
			if (this.wxObj.userInfo.level) {
				this.wxObj.setData({
					level: this.wxObj.userInfo.level
				})
			}
		}
	},
	setInviteCode:function(){
		if (this.wxObj.userInfo) {
			this.wxObj.invite_code = this.wxObj.userInfo.invite_code;
		} else {
			if (!this.wxOptions.invite_code) {
				var storInviteCode = wx.getStorageSync('invite_code');
				if (storInviteCode) {
					this.wxObj.invite_code = storInviteCode;
				} else {
					this.wxObj.invite_code = 'zhaimiaoshenghuo';
				}
			} else {
				this.wxObj.invite_code = this.wxOptions.invite_code;
			}
		}
		if (this.wxObj.invite_code) {
			wx.setStorageSync('invite_code', this.wxObj.invite_code)
		}
	}
}
module.exports.UserCommon = UserPublicData
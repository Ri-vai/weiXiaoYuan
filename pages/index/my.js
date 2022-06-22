// pages/index/my.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    buttonList:[
      {
        title:"联系客服",
        icon:"/img/assist.png",
        "type":"opentype",
        "opentype":"contact"
      },
      {
        title:"意见反馈",
        icon:"/img/advice.png",
        "type":"opentype",
        "opentype":"feedback"
      },
      /*{
        title:"免责声明",
        icon:"/img/announce.png",
        "type":"navigator",
        "path":"announce"
      }*/

    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("load");
    var self=this;
    var pages=getCurrentPages();
    self.setData({
      pagepath:pages[pages.length-1].route
    })
    if(app.globalData.neednav!=""){
      this.setData({
        neednav:app.globalData.neednav
      })
      app.globalData.neednav="";
    }
    this.options=options;
    if(app.globalData.needgetPhone==true){
      app.globalData.needgetPhone=false;
      self.bindgetphonenumber(JSON.parse(decodeURIComponent(app.globalData.mygetPhone)));
      self.forcenavigate();
    }
  },
  makephonecall:function(evt){
    console.log(evt);
    wx.request({
      url: app.baseUrl+'api/getkefu',
      success(res){
        wx.makePhoneCall({
          phoneNumber: res.data.data.phone
        })
      }
    })
  },
  bindgetphonenumber:function(evt){
    var self=this;
    console.log(evt);
    var iv=evt.detail.iv;
    var encryptedData=evt.detail.encryptedData;
    var userInfo=app.getuserInfo();
    if(typeof iv=='string' && typeof encryptedData=='string'){
      wx.request({
        url: app.baseUrl+'api/user/wechat/updatephonenumber',
        method:"POST",
        data:{
          encrypteddata:encryptedData,
          iv:iv,
          userid:userInfo.userid,
          sessionkey:userInfo.sessionkey,
        },
        dataType:"json",
        success(evt) {
          console.log(evt);
          var data=evt.data.data;
          var phonenumber=data.phonenumber;
          userInfo.phonenumber=phonenumber;
          app.globalData.userInfo=userInfo;
          app.saveuserInfo();
          var buttonList=self.data.buttonList;
          buttonList.shift();
          self.setData({
            userInfo:userInfo,
            buttonList:buttonList
          })
          wx.showToast({
            title: '手机号绑定成功',
            icon:'success'
          })
        }
      })
    }else{
      wx.showToast({
        title: '手机号获取失败',
        icon:'none'
      })
    }
  },
  checkuserinfo:function(){
    var self=this;
    var userInfo=self.data.userInfo;
    if(typeof userInfo == "object"){
      if(userInfo.userinfochecktimestamp>new Date().getTime()){
        return userInfo;
      }
    }else{
      userInfo=app.getuserInfo();
      if(typeof userInfo == "object"){
        if(userInfo.userinfochecktimestamp>new Date().getTime()){
          return userInfo;
        }
      }
    }
    return false;
  },
  insertphoneButton:function(){
    var self=this;
    var buttonList=self.data.buttonList;
    for(var i in buttonList){
      if(buttonList[i]["title"]=="绑定手机号"){
        return true;
      }
    }
    var phonebutton={
      title:"绑定手机号",
      icon:"/img/phone.png",
      "type":"opentype",
      "opentype":"getPhoneNumber",
      "bindgetphonenumber":"bindgetphonenumber"
    }
    buttonList.unshift(phonebutton);
    self.setData({
      buttonList:buttonList
    });
  },
  loginRequest:function(){
    var self = this;
    wx.login({
      success(res) {
        var code = res.code;
        wx.request({
          url: app.baseUrl+'api/user/wechat/getsession',
          method:"POST",
          data:{
            code:code
          },
          dataType:"json",
          success(evt) {
            var data=evt.data.data;
            var openid=data.openid;
            var sessionkey=data.session_key;
            wx.getUserInfo({
              success: function (ures) {
                var userInfo=ures.userInfo;
                userInfo.openid=openid;
                userInfo.sessionkey=sessionkey;
                userInfo.userinfochecktimestamp=new Date().getTime()+600*1000;
                wx.request({
                  url: app.baseUrl+'api/user/wechat/updateuserinfo',
                  method:"POST",
                  data:userInfo,
                  success(updateEvt){
                    var updateData=updateEvt.data.data;
                    userInfo.userid=updateData.userid;
                    userInfo.phonenumber=updateData.phonenumber;
                    userInfo.unionid=updateData.unionid;
                    userInfo.sessionkey=updateData.sessionkey;
                    if(userInfo.phonenumber==""){
                      self.insertphoneButton();
                    }
                    self.setData({
                      userInfo: userInfo
                    })
                    app.globalData.userInfo=userInfo;
                    app.saveuserInfo();
                    return self.forcenavigate();
                  },
                  fail:app.requestFail
                })
                wx.hideLoading();
              },
              fail:function(){
                wx.showToast({
                  title: '未获得您的授权，请手动点击登录按钮',
                  icon:'none'
                })
              }
            })
          },
          fail:app.requestFail
        })
      },
      fail(res) {
        wx.showModal({
          title: '登录信息获取失败',
          content: '需登录获取身份标识',
          confirmText: '重新登录',
          cancelText: '取消预约',
          success(res) {
            if (res.confirm) {
              self.login();
            } 
            else if (res.cancel) {
            }
          }
        })
      },
    })
  },
  forcenavigate:function(){
    var self=this;
    var neednav=self.data.neednav;
    if(typeof  neednav== "string"&&neednav!=""){
      wx.navigateTo({
        url: neednav,
        fail:function(){
          wx.switchTab({
            url: neednav,
          })
        }
      })
      return true;
    }
    return false;

  },
  login: function () {
    var self = this;
    wx.showLoading({
      title: "登录中"
    })
    var userInfo=self.checkuserinfo();
    if(typeof userInfo == "object"){
      if(userInfo.phonenumber==""){
        self.insertphoneButton();
      }
      self.setData({
        userInfo: userInfo
      });
      wx.hideLoading();
      if(typeof self.options.type=="string" && self.options.type=="getphone"){

      }else{
        self.forcenavigate();
      }
    }else{
      self.loginRequest();
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log("show");
    var self=this;
    if(typeof this.data.userInfo != "object"){
    wx.getSetting({
      success (res){
        if (res.authSetting['scope.userInfo']) {
          self.login();
        }
      }
    })
    }
    if (typeof this.getTabBar === 'function' &&
    this.getTabBar()) {
      var pages=getCurrentPages();
      console.log(pages);
    this.getTabBar().setData({
      pagepath:pages[pages.length-1].route
    })
  }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    var self=this;
    self.loginRequest();
    wx.stopPullDownRefresh();
    return true;
  }
})
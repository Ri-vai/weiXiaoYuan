//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    baseUrl:app.baseUrl,
    baseMediaUrl:app.baseMediaUrl,
    headeropacity:0.01,
    headerbutton:app.getMenuButton(),
    scrollTop:0
  },
  onLoad: function () {
    var self=this;
    var pages=getCurrentPages();
    self.setData({
      pagepath:pages[pages.length-1].route
    })
    wx.request({
      url: app.baseUrl+'api/getindexdata',
      success(res){
        console.log(res);
        self.setData(res.data.data);
      }
    })
    if(wx.getStorageSync('initindex')!="1"){
      var userInfo=app.getuserInfo();
      console.log(userInfo);
      if(userInfo.userid){
        wx.setStorageSync('initindex', "1");
      }else{
        self.setData({
          modalName:"loginmodal"
        })
      }

    }
  },
  onReady:function(){
    this.scrollcheck=false;
  },
  navigatemy:function(evt){
    console.log(evt)
    var pages=getCurrentPages();
    var path="/"+pages[pages.length-1].route+"?";
    var options=pages[pages.length-1].options;
    for(var i in options){
      path+=i+"="+options[i]+"&"
    }
    app.globalData.neednav=path;
    wx.switchTab({
      url: '/pages/index/my',
    })
    this.hideModal();
  },
  hideModal(e) {
    this.setData({
      modalName: null
    })
  },
  scroll:function(evt){
    var self=this;
    if(!self.scrollcheck||evt.type=='touchstart'||evt.type=='touchend'){
      self.scrollcheck=true;
      wx.createSelectorQuery().selectViewport().scrollOffset(function(res){
        var scrollTop=res.scrollTop;
        var tmp=scrollTop/50;
        var opacity=tmp>0.1?(tmp>1?1:tmp):0;
        self.setData({
          scrollTop:scrollTop,
          headeropacity:opacity
        })
        self.scrollcheck=false;
      }).exec();
    }
    if(evt.type=='touchend'){
      self.scrollTimeout=setTimeout(function(){self.scroll({type:'touchend'})},150);
    }
    return true;
  },
  pulldownrefresh:function(){
    if(this.data.scrollTop<10){
      wx.startPullDownRefresh();
    }
  },
  navigatePage:function(evt){
    var self=this;
    var path=evt.currentTarget.dataset.url;
    var dataset=evt.currentTarget.dataset;
    var datastr="";
    /*if(typeof dataset.id!="string"||dataset.id==""){
      return false;
    }*/
    /*if(path.indexOf("pages/news/news")>0){
      var userInfo=app.getuserInfo();
      console.log(userInfo);
      if(userInfo.userid){
      }else{
        self.setData({
          modalName:"loginmodal"
        })
        return false;
      }
      
    }*/
    for(var i in dataset){
      if(i!="url"){
        datastr+=i+"="+dataset[i]+"&"
      }
    }
    wx.navigateTo({
      url: path+"?"+datastr,
      success(res){
        if(typeof res.eventChannel == "object"){
          res.eventChannel.emit('pagedata', { data: self.data.project,dataset:dataset })

        }
      },
      fail:function(evt){
        console.log(evt);
      }
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    var self=this;
    wx.stopPullDownRefresh();
    wx.request({
      url: app.baseUrl+'api/getindexdata',
      success(res){
        console.log(res);
        self.setData(res.data.data);
      }
    })
    return true;
  },

  attention:function(){
    var self=this;
    self.setData({
      modalName:"attentionmodal"
    })

  },
  saveqrcode:function(evt){
    var self=this;
    var src=evt.currentTarget.dataset.src;
    wx.getImageInfo({
      src:src,
      success:function(evt1){
        wx.saveImageToPhotosAlbum({
          filePath:evt1.path,
          complete:function(res){
            console.log(res);
            self.hideModal();
          }
        })

      }
    });

  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  onShareTimeline: function () {

  },
  
  onShow:function(){
    
      if (typeof this.getTabBar === 'function' &&
      this.getTabBar()) {
        var pages=getCurrentPages();
        console.log(pages);
      this.getTabBar().setData({
        pagepath:pages[pages.length-1].route
      })
    }
  },
  onHide:function(){

    var self=this;
    clearTimeout(self.scrollTimeout);
  },
  onUnload:function(){
    
    var self=this;
    clearTimeout(self.scrollTimeout);
  }
})

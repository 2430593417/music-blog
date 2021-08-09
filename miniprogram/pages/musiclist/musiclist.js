// pages/musiclist/musiclist.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    musiclist: [],
    listInfo: {},

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {    //可以通过options接收路由穿过来的id
    wx.cloud.callFunction({
      name: 'music',
      data: {
        playlistId: options.playlistId,  //将data里面的数据传给云函数
        $url: 'musiclist'
      }
    }).then((res) => {
      const pl = res.result.playlistId
      this.setData({
        musiclist: pl.tracks,
        listInfo: {
          coverImgUrl: pl.coverImgUrl,
          name: pl.name,
        }
      })
      this._setMusiclist()
      wx.hideLoading()
    })
  },

  _setMusiclist() {
    wx.setStorageSync('musiclist', this.data.musiclist)    //setStorageSync是同步方法，而没有sync是异步，作用是把数据存在本地storage里面
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

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
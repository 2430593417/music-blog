//app.js
App({
  onLaunch: function () {
    this.checkUpdate()

    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        env: 'cloud1-6gr82kzi3bbc30e0',
        traceUser: true,
      })
    }

    //全局数据
    this.globalData = {
      playingMusicId: -1,  //自定义
      openid: -1,
    }  
    
    this.getOpenid()
  },

  //监听小程序启动和切前台
  onShow() {

  },

  //自定义全局方法
  setPlayMusicId(musicId) {
    this.globalData.playingMusicId = musicId
  },
  getPlayMusicId() {
    return this.globalData.playingMusicId
  },
  getOpenid() {   //将openid存入storage
    wx.cloud.callFunction({
      name: 'login'
    }).then((res) => {
      const openid = res.result.openid
      this.globalData.openid = openid
      if(wx.getStorageSync(openid) == '') {
        wx.setStorageSync(openid, [])
      }
    })
  },

  //检查小程序是否为最新版本
  checkUpdate() {
    const updateManager = wx.getUpdateManager()  //获取全局唯一的版本更新模拟器，用于管理小程序的更新
    //检测版本更新
    updateManager.onCheckForUpdate((res) => {
      if(res.hasUpdate) {    //如果有新版本
        updateManager.onUpdateReady(() => {
          wx.showModal({
            title: '更新提示',
            content: '新版本已经准备好了，是否重启应用？',
            success(res) {
              if(res.confirm) {
                updateManager.applyUpdate()  //更新并重启
              }
            }
          })
        })
      }
    }) 
  },
})

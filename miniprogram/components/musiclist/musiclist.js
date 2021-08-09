// components/musiclist/music.js
const app = getApp()

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    musiclist: Array
  },

  /**
   * 组件的初始数据
   */
  data: {
    playingId: -1,
  },

  pageLifetimes: {
    show() {
      this.setData({
        playingId: parseInt (app.getPlayMusicId()),  //因为从router和数据库读取的id一个是string一个是number，所以需要parseint
      })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onSelect(event){
      const ds = event.currentTarget.dataset  //event拿到事件源
      const musicid = ds.musicid
      this.setData({
        playingId: musicid
      })
      wx.navigateTo({
        url: `../../pages/player/player?musicId=${musicid}&index=${ds.index}`,
      })
    }
  }
})

// components/lyric/lyric.js
let lyricHeight = 0

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isLyricShow: {
      type: Boolean,
      value: false,  //默认值
    },
    lyric: String,
  },

  observers: {
    lyric(lrc) {
      if(lrc == '暂无歌词') {  //纯音乐，没有歌词的情况
        this.setData({
          lrcList: [
            {
              lrc,
              time: 0,
            }
          ],
          nowLyricIndex: -1,
        })
      }else{           //普遍情况有歌词
        this._parseLyric(lrc)
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    lrcList: [],
    nowLyricIndex: 0,
    scrollTop: 0,   //滚动条滚动的高度
  },

  lifetimes: {
    ready() {
      wx.getSystemInfo({   //获得设备信息
        success(res) {
          //求出1rpx在不同设备上的大小
          lyricHeight = res.screenWidth / 750 * 64
        },
      })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    update(currentTime){
      let lrcList = this.data.lrcList
      if(lrcList.length == 0) {  //歌词长度为0，说明没有歌词
        return
      }
      if(currentTime > lrcList[lrcList.length - 1].time) {   //解决无法跳到最后一句歌词之后的部分的问题
        if(this.data.nowLyricIndex != -1) {
          this.setData({
            nowLyricIndex: -1,
            scrollTop: lrcList.length * lyricHeight
          })
        }
      }
      for(let i=0, len = lrcList.length; i < len; i++) {
        if(currentTime <= lrcList[i].time) {
          this.setData({
            nowLyricIndex: i - 1,
            scrollTop: (i - 1) * lyricHeight,
          })
          break
        }
      }
    },
    _parseLyric(sLyric) {
      let line = sLyric.split('\n')
      let _lrcList = []
      line.forEach((elem) => {
        let time = elem.match(/\[(\d{2,}):(\d{2})(?:\.(\d{2,3}))?]/g)  //使用正则表达式匹配
        if(time != null) {
          let lrc = elem.split(time)[1]
          let timeReg = time[0].match(/(\d{2,}):(\d{2})(?:\.(\d{2,3}))?/)
          //将时间转化为秒
          let time2Seconds = parseInt(timeReg[1]) * 60 + parseInt(timeReg[2]) + parseInt(time[3]) / 1000
          _lrcList.push({
            lrc,
            time: time2Seconds,
          })
        }
      })
      this.setData({
        lrcList: _lrcList,
      })
    }
  }
})

// components/progress-bar/progress-bar.js
let movableAreaWidth = 0
let movableViewWidth = 0
const backgroundAudioManager = wx.getBackgroundAudioManager()
let currentSec = -1 //当前秒数
let duration = 0 //当前歌曲总时长,以秒为单位，不同于data里面地totaltime
let isMoving = false //当前进度条是否在拖拽，解决：当进度条拖动和updatetime事件有冲突的问题

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isSame: Boolean,
  },

  /**
   * 组件的初始数据
   */
  data: {
    showTime: {
      currentTime: '00:00',
      totalTime: '00:00',
    },
    movableDis: 0,
    progress: 0,
  },

  lifetimes: {   //组件的生命周期函数
    ready() {    //组件布局完成后执行
      if(this.properties.isSame && this.data.showTime.totalTime == '00:00') {
        this._setTime()
      }
      this._getMovableDis()
      this._bindBGMEvent()
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onChange(event) {
      //source为移动产生的原因，当source为touch才会触发
      if(event.detail.source == 'touch') {   //拖到仅仅只是保存值，不渲染
        this.data.progress =  event.detail.x / (movableAreaWidth - movableViewWidth) * 100 //不通过setdata赋值的话不会返回到界面上，而是存在这里
        this.data.movableDis = event.detail.x 
        isMoving = true
      }
    },
    onTouchEnd() {
      const currentTimeFmt = this._dataFormat(Math.floor(backgroundAudioManager.currentTime))
      this.setData({   //频繁地setdata对小程序地性能不好，所有setdata写在触摸完成之后
        progress: this.data.progress,
        movableDis: this.data.movableDis,
        ['showTime.currentTime']: currentTimeFmt.min + ':'+ currentTimeFmt.sec,
      })
      backgroundAudioManager.seek(duration * this.data.progress / 100)
      isMoving = false
    },

    _getMovableDis() {
      const query = this.createSelectorQuery()   //如果是写在组件上就用this，page页面上就是wx
      query.select('.movable-area').boundingClientRect()  //获得对应元素的css样式（不与自己写的css样式一样）
      query.select('.movable-view').boundingClientRect()
      query.exec((rect) => {   //执行上面的代码，得到一个数组，数组里面有2个分别关于area和view的各种css样式
        movableAreaWidth = rect[0].width //拿到宽度
        movableViewWidth = rect[1].width
      })
    },
    _bindBGMEvent() {   //绑定背景音乐播放的各种事件
      backgroundAudioManager.onPlay(() => {
        isMoving = false //因为偶尔触发ontouchend后还会触发一次onchange（小概率事件）
        this.triggerEvent('musicPlay')
      })
      backgroundAudioManager.onStop(() => {

      })
      backgroundAudioManager.onPause(() => {
        this.triggerEvent('musicPause')
      })
      backgroundAudioManager.onWaiting(() => {

      })
      backgroundAudioManager.onCanplay(() => {
        if(typeof backgroundAudioManager.duration !== 'undefined'){    //在一些真机上会出现undfined的情况也可以使用===这种方法
          this._setTime()
        }else{
          setTimeout(() => {
            this._setTime()
          },1000)
        }
      })
      backgroundAudioManager.onTimeUpdate(() => {
        if(!isMoving) {
          const currentTime = backgroundAudioManager.currentTime
          const duration = backgroundAudioManager.duration
          const sec = currentTime.toString().split('.')[0]
          if(sec != currentSec) {  //这个if语句用于做函数截流，让它秒数变了才执行操作，split将00.01按.分隔成00和01
            const currentTimeFmt = this._dataFormat(currentTime)
            this.setData({
              movableDis: (movableAreaWidth - movableViewWidth) * currentTime / duration,
              progress: currentTime / duration * 100,
              ['showTime.currentTime']: `${currentTimeFmt.min}:${currentTimeFmt.sec}`,
            })
            currentSec = sec
            //联动歌词
            this.triggerEvent('timeUpdata', {   //触发事件，将currenttime传递出去
              currentTime,
            })
          }
        }
      })
      backgroundAudioManager.onEnded(() => {
        this.triggerEvent('musicEnd')     //触发事件，用于调用父组件方法
      })
      backgroundAudioManager.onError((res) => {
        wx.showToast({
          title: '错误：' + res.errCode,
        })
      })
    }, 
    
    _setTime() {
      duration = backgroundAudioManager.duration
      const durationFmt = this._dataFormat(duration)
      this.setData({
        ['showTime.totalTime']: `${durationFmt.min}:${durationFmt.sec}` //给对象的属性赋值需要加[]
      })
    },
    _dataFormat(sec) {   //格式化时间
      const min = Math.floor(sec / 60)
      sec = Math.floor(sec % 60)
      return {
        'min': this._paser0(min),
        'sec': this._paser0(sec),
      }
    },
    _paser0(sec) {  //补0
      return sec< 10?'0'+sec:sec
    },
  }
})

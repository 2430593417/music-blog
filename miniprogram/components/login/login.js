Component({
  /**
   * 组件的属性列表
   */
  properties: {
    modalShow: Boolean
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    onGotUserInfo(event) {    //event里面有用户授权的各种信息
      const userInfo = event.detail.userInfo
      console.log(userInfo)
      //允许授权，否则就else
      if(userInfo) {
        this.setData({
          modalShow: false
        })
        this.triggerEvent('loginsuccess', userInfo)
      }else{
        this.triggerEvent('loginfail')
      }
    }
  }
})

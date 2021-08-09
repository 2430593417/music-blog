let userInfo = {}
const db = wx.cloud.database()

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    blogId: String,
    blog: Object,
  },

  externalClasses: ['iconfont', 'icon-pinglun', 'icon-fenxiang'],

  /**
   * 组件的初始数据
   */
  data: {
    loginShow: false,  //登录组件是否显示
    modalShow: false,  //底部弹出层是否显示
    content: '',
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onComment() {
      //判断用户是否授权
      wx.getUserProfile({
        desc: '为了用户发布博客评论',
        success: (res) => {
          userInfo = res.userInfo
          //显示评论弹出层
          this.setData({
            modalShow: true,
          })
        },
        fail: () => {
          wx.showModal({
            title: '授权用户才能评价',
            content: '',
          })
        }
      })
    },

    onSend(event) {   //因为使用了form，所以event里面有textarea输入的值
      //插入数据库
      let formId = event.detail.formId    //formId非常重要，用于模板消息推送，但更新过，无法像视频那样使用，所以没写，看word
      let content = event.detail.value.content   //event里面存有输入textarea的值，就不需要通过bindinput来实时获取内容了
      if(content.trim() == '') {
        wx.showModal({
          title: '评论内容不能为空',
          content: '',
        })
        return
      }
      wx.showLoading({
        title: '评价中',
        mask: true,
      })
      //通过小程序端插入云数据库，也可以通过云函数来插入
      db.collection('blog-comment').add({         //collection取到数据库的集合
        data: {
          content,
          createTime: db.serverDate(),
          blogId: this.properties.blogId,
          nickName: userInfo.nickName,
          avatarUrl: userInfo.avatarUrl,
        }
      }).then(() => {
        wx.hideLoading()
        wx.showToast({
          title: '评论成功!',
        })
        this.setData({
          modalShow: false,
          content: '',
        })

        //父元素刷新评论界面
        this.triggerEvent('refreshCommentList')
      }) 
    }
  }
})

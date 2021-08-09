let keyword = ''   //搜索的关键字

Page({

    /**
     * 页面的初始数据
     */
    data: {
        modalShow: false, //底部弹出层是否显示
        blogList: [],
    },

    onPublish() {
        //判断用户是否授权
        wx.getUserProfile({
          desc: '为了用户更好的体验',
          success: (res) => {
              this.onLoginSuccess({
                  detail: res.userInfo
              })
          },
          fail: () => {
              this.onLoginFail()
          }
        })
        /*已过期失效
        wx.getSetting({
            success: (res) => {
                if(res.authSetting['scope.userInfo']) {   //授权过为true
                    wx.getUserInfo({
                      success:(res) => {             //this指向问题，需写成箭头函数的形式
                        this.onLoginSuccess({
                            detail: res.userInfo
                        })
                      }
                    })
                }else{
                    this.setData({
                        modalShow: true,
                    })
                }
            }
        })
        */
    },

    onLoginSuccess(event) {
        const detail = event.detail
        wx.navigateTo({
          url: `../blog-edit/blog-edit?nickName=${detail.nickName}&avatarUrl=${detail.avatarUrl}`,
        })
    },
    onLoginFail() {
        wx.showModal({
          title: '授权用户才能发布',
          content: '',
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this._loadBlogList()

        //小程序端调用云数据库，不使用云函数，功能不齐全（只做演示举例）
        //小程序端查询云数据库一次只能查询20条，而云函数查询能够查询100条
        //小程序端使用云数据库需要进行权限管理
        /*const db = wx.cloud.database()
        db.collection('blog').orderBy('createTime', 'desc').get().then((res) => {
            const data = res.data
            for(let i = 0, len = data.length; i < len; i++) {   //因为这样获取createtime的格式不同
                data[i].createTime = data[i].createTime.toString() 
            }
            this.setData({
                blogList: data
            })
        })*/
    },

    onSearch(event) {
        this.setData({
            blogList: []
        })
        keyword = event.detail.keyword
        this._loadBlogList()
    },

    _loadBlogList(start = 0) {  //默认start为0
        wx.showLoading({
          title: '拼命加载中',
        })
        wx.cloud.callFunction({
            name: 'blog',
            data: {
                keyword,
                start,
                $url: 'list',
                count: 10,
            }
        }).then((res) => {
            this.setData({
                blogList: this.data.blogList.concat(res.result)
            })
            wx.hideLoading()
            wx.stopPullDownRefresh()
        })
    },

    goComment(event) {
        wx.navigateTo({
          url: '../../pages/blog-comment/blog-comment?blogid=' + event.target.dataset.blogid,
        })
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
        this.setData({
            blogList: []
        })
        this._loadBlogList(0)
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        this._loadBlogList(this.data.blogList.length)
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function (event) {
        let blogObj = event.target.dataset.blog
        return {
            title: blogObj.content,
            path: `/pages/blog-comment/blog-comment?blogId=${blogObj._id}`
        }
    }
})
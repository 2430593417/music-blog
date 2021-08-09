const MAX_WORDS_NUM = 140   //输入文字最大的个数
const MAX_IMG_NUM = 9   //最大图片的个数
const db = wx.cloud.database()  //云数据库初始化
let content = ''   //输入的文字内容
let userInfo = {}   //用户信息

Page({

  /**
   * 页面的初始数据
   */
  data: {
    wordsNum: 0,  //输入的文字个数
    footerBottom: 0,
    images: [],   //已选择图片个数
    selectPhoto: true,   //添加图片的元素是否显示
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    userInfo = options
  },

  onInput(event) {
    let wordsNum = event.detail.value.length
    if(wordsNum >= MAX_WORDS_NUM) {
      wordsNum = `最大字数为${MAX_WORDS_NUM}`
    }
    this.setData({
      wordsNum
    })
    content = event.detail.value
  },

  onFocus(event) {
    this.setData({
      footerBottom: event.detail.height,
    })
  },
  onBlur() {
    this.setData({
      footerBottom: 0,
    })
  },

  onChooseImage() {
    let max = MAX_IMG_NUM - this.data.images.length  //还能再选几张图片
    wx.chooseImage({
      count: max,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) =>{
        this.setData({
          images: this.data.images.concat(res.tempFilePaths)  //多次选择会叠加
        })
        max = MAX_IMG_NUM - this.data.images.length
        this.setData({
          selectPhoto: max <= 0 ? false : true,
        })
      }
    })
  },
  onDelImage(event) {
    this.data.images.splice(event.target.dataset.index, 1)
    this.setData({
      images: this.data.images
    })
    if(this.data.images.length == MAX_IMG_NUM - 1) {
      this.setData({
        selectPhoto: true,
      })
    }
  },
  onPreviewImage(event) {   //通过event拿到自定义属性
    wx.previewImage({
      urls: this.data.images,
      current: event.target.dataset.imgsrc,
    })
  },

  send() {  
    //第二部：数据 -> 云数据库
    //数据库包含内容、图片fileID、openid(用户唯一标识，会自带)、昵称、头像、时间
    //第一步：图片上传至云存储，会返回fileID，即云文件ID
    
    if(content.trim() === '') {     //判断是否为空，为空则直接return，trim能够去掉空格
      wx.showModal({
        title: '请输入内容',
        content: '',
      })
      return                    //return能够直接退出到上一级函数，不执行同一级下return下面的代码
    }

    wx.showLoading({
      title: '发布中',
      mask: true,
    })

    //第一步
    let promiseArr = []
    let fileIds = []  
    for(let i=0, len=this.data.images.length; i < len; i++) {
      let p = new Promise((resolve, reject) => {      //因为要等到所有图片都传完再做下一步，所以要用到promise.all，于是定义promise
        let item = this.data.images[i]
        let suffix = /\.\w+$/.exec(item)[0]     //获得文件的扩展名

        wx.cloud.uploadFile({    //图片上传，但每次只能传一张
          cloudPath: 'blog/' + Date.now() + '-' + Math.random() * 10000000 + suffix,   //blog是我在云函数里新建的一个文件夹，后面的参数用户避免重复而取的唯一标识，最后是扩展名，cloudpath是它的Fileid（云存储中查看）
          filePath: item,
          success: (res) => {
            fileIds = fileIds.concat(res.fileID)   //concat追加
            resolve()
          },
          fail:(err) => {
            reject()
          }
        })
      })
      promiseArr.push(p)
    }

    //第二步
    Promise.all(promiseArr).then((res) => {
      db.collection('blog').add({    //blog是我在云数据库中新建的一个集合
        data: {
          ...userInfo,  //扩展运算符取到每一个属性
          content,
          img: fileIds,
          createTime: db.serverDate(),  //取得服务端的时间
        }
      }).then(() => {
        wx.hideLoading()
        wx.showToast({
          title: '发布成功',
        })
        wx.navigateBack()
        const pages = getCurrentPages()
        const prevPage = pages[pages.length - 2]   //取到上一个页面
        prevPage.onPullDownRefresh()
      })
    }).catch(() => {  //失败进入catch方法
      wx.hideLoading()
      wx.showToast({
        title: '发布失败',
      })
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
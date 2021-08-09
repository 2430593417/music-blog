// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const result = await cloud.openapi.wxacode.getUnlimited({
    scene: wxContext.OPENID.toString(), //scene最长32位，不一定要openid（28位了），也可以写a=1，只要自己知道就行
    //如果想要拿到scene的值，则可以在blog.js的onload方法里面的options参数找到，通过options.scene找到
    //page: "pages/blog/blog"
    lineColor: {
      'r': 211,
      'g': 60,
      'b': 57,
    },
    isHyaline: true,
  })
  //通过云存储转化二进制文件buffer为图片
  const upload = await cloud.uploadFile({
    cloudPath: 'qrcode/' + Date.now() + '-' + Math.random() + '.png',
    fileContent: result.buffer
  })
  return upload.fileID
}
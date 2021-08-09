// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
 
const db = cloud.database
const playlistCollection = db.collection('playlist')
const MAX_LIMIT = 100

var rp = require('request-promise')

const URL = 'http://musicapi.xiecheng.live/personalized'

// 云函数入口函数
exports.main = async (event, context) => {
  //(原)const wxContext = cloud.getWXContext()
  //const list = await playlistCollection.get() //获取数据库所有数据，小程序有100条数据限制，所有这行代码要优化
  //优化如下
  const countResult = await playlistCollection.count()  //拿到集合的总条数，但它是一个对象
  const total = countResult.total   //总计多少条数据
  const batchTimes = Math.ceil(total / MAX_LIMIT) //向上取整，得到分多少次取
  const tasks = []
  for(let i = 0; i < batchTimes; i++){
    let promise = playlistCollection.skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()  //每次都只获取100条，skip为跳过指定个数的字符，limit为取指定个数的字符
    tasks.push(promise)
  }
  let list = {
    data: []
  }
  if(tasks.length > 0){
    list = (await Promise.all(tasks)).reduce((acc, cur) =>{   //reduce是对数组的遍历,返回一个单个返回值，acc(累计器)，cur(当前值)
      return {
        data: acc.data.concat(cur.data) //concat() 方法用于连接两个或多个数组，该方法不会改变现有的数组，而仅仅会返回被连接数组的一个副本。
      }
    })
  }

  const playlist = await rp(URL).then((res) => {
    return JSON.parse(res).result  //JSON.parse() 方法用于将一个 JSON 字符串转换为对象。
  })
  
  const newData = []  //去重，id存在就不插入了，会存在rp查询到的数据和get数据库里面数据相同的情况
  for(let i = 0, len1 = playlist.length; i < len1; i++){
    let flag = true //标志位，true表示不重复
    for(let j = 0, len2 = list.data.length;j < len2; j++){
      if(playlist[i].id === list.data[j].id){
        flag = false
        break   //退出上一个for循环
      }
    }
    if(flag){
      newData.push(playlist[i])
    }
  }

  //插入数据库
  for(let i = 0, len = newData.length; i < len; i++){
    await playlistCollection.add({
      data: {
        ...newData[i], //数据解构
        createTime: db.serverDate(),
      }
    }).then((res) => {
      console.log('成功')
    }).catch((err) => {
      console.error('失败')
    })
  }

  return newData.length
  /*(原)
  return {
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  }
  */
}
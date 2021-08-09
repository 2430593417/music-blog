// 云函数入口文件
const cloud = require('wx-server-sdk')

const TcbRouter = require('tcb-router')
const rp = require('request-promsie')

const BASE_URL = 'http://musicapi.xiecheng.live'

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({
    event
  })

  app.router('playlist', async(ctx, next) => {
    ctx.body = await cloud.database().collection('playlist').skip(event.start).limit(event.count).orderBy('createTime','desc').get().then((res) => { //orderby方法对createtime进行逆序排序
      return res
    })  //ctx.body可以将对应的值返回小程序端
  })

  app.router('musiclist', async(ctx, next) => {
    ctx.body = await rp(BASE_URL + '/playlist/detail?id=' + parseInt(event.playlistId)).then((res) => {   //通过event参数获取data传过来的playlistId
      return JSON.parse(res)   //将一个 JSON 字符串转换为对象
    })
  })

  app.router('musicUrl', async(ctx, next) => {
    ctx.body = await rp(BASE_URL + `/song/url?id=${event.musicId}`).then((res) => {
      return res
    })
  })

  app.router('lyric', async(ctx, next) => {
    ctx.body = await rp(BASE_URL + `/lyric?id=${event.musicId}`).then((res) => {
      return res
    })
  })

  return app.serve()
}
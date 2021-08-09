// 云函数入口文件
const cloud = require('wx-server-sdk')

const TcbRouter = require('tcb-router')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({event})
  app.use(async(ctx, next) => {  //公共路由，全局中间件，不需要可以不写
    ctx.data = {}
    ctx.data.openId = event.userInfo.openId
    await next()
  })

  app.router('music', async(ctx, next) => {    //配置音乐这个路由，音乐中间件
    ctx.data.musicName = '1' //音乐名称中间件
    await next()
  }),async(ctx, next) => {
    ctx.data.musicType = '2'  //音乐类型中间件
    ctx.body = {
      data: ctx.data
    }
  }

  app.router('movie', async(ctx, next) => {    //配置电影这个路由，电影中间件
    ctx.data.movieName = '1'
    await next()   //执行下一个中间件
  }),async(ctx, next) => {
    ctx.data.movieType = '2'
    ctx.body = {
      data: ctx.data
    }
  }

  return app.serve()
}
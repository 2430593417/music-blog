// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const TcbRouter = require('tcb-router')
const db = cloud.database()
const blogCollection = db.collection('blog')   //获取云数据库中blog这个集合
const MAX_LIMIT = 100

// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({
    event
  })

  app.router('list', async(ctx, next) => {
    const keyword = event.keyword  //从blog.js传进来了一个keyword值，通过event.keyword来获得
    let w = {}
    if(keyword.trim() != '') {   //不为空才执行云数据模糊查询
      w = {
        content: db.RegExp({      //因为正则表达式/??/，/里面不能写变量，所以不能用正则表达式
          regexp: keyword,
          options: 'i'   //i为忽略大小写，m为换行匹配，s匹配包括.换行符在内的字符
        })  //这种模糊查询是小程序自带的
      }
    }
    //.where(w)实现模糊查询
    let blogList = await blogCollection.where(w).skip(event.start).limit(event.count).orderBy('createTime', 'desc').get().then((res) => {
      return res.data
    })
    ctx.body = blogList
  })

  app.router('detail', async(ctx, next) => {
    let blogId = event.blogId
    //详情查询
    let detail = await blogCollection.where({
      _id: blogId
    }).get().then((res) => {
      return res.data
    })
    //评论查询
    const countResult = await blogCollection.count()
    const total = countResult.total
    let commentList = {
      data: []
    }
    if(total > 0) {
      const batchTimes = Math.ceil(total / MAX_LIMIT)  //通过几次查询到结果，一次只能查100条
      const tasks = []
      for(let i = 0; i < batchTimes; i++) {
        let promise = db.collection('blog-comment').skip(i * MAX_LIMIT).limit(MAX_LIMIT).where({     //skip每次从0，100，200条开始取，limit每次取100条,where查询blogid对应的
          blogId,
        }).orderBy('createTime', 'desc').get()  
        tasks.push(promise)
      }
      if(tasks.length > 0) {
        commentList = (await Promise.all(tasks)).reduce((acc, cur) => {  //reduce累加器
          return {
            data: acc.data.concat(cur.data)
          }
        })
      }
    }
    ctx.body = {
      commentList,
      detail
    }
  })

  const wxContext = cloud.getWXContext()
  app.router('getListByOpenid', async(ctx, next) => {
    ctx.body = await blogCollection.where({
      _openid: wxContext.OPENID
    }).skip(event.start).limit(event.count).orderBy('createTime', 'desc').get().then((res) => {
      return res.data
    })
  })

  return app.serve()
}
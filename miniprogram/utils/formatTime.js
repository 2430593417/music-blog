//格式化时间方法，可多次重用

module.exports = (date) => {   //因为传进来之前new Date了，所以它可以使用data自带的方法
  let fmt = 'yyyy-MM-dd hh:mm:ss'
  const o = {
    'M+': date.getMonth() + 1,   //月份，因为0-11，所以要加一
    'd+': date.getDate(),       //日
    'h+': date.getHours(),        //小时
    'm+': date.getMinutes(),     //分钟
    's+': date.getSeconds(),     //秒
  }

  if(/(y+)/.test(fmt)) {   //通过正则表达式拿到yyyy
    fmt = fmt.replace(RegExp.$1, date.getFullYear())     //将date获得真实的年份替换到regexp的第一个，即yyyy里面
  }
  for(let k in o) {
    if(new RegExp('(' + k +')').test(fmt)) {
      fmt = fmt.replace(RegExp.$1, o[k].toString().length == 1 ? '0' + o[k] : o[k])   //补0操作
    }
  }

  return fmt
}
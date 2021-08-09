// components/playlist/playlist.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        playlist: {
            type: Object
        }
    },

    /*
        数据监听器
        playlist对应着监听的数据名称
        在加了['']这个之后就可以监听对象的属性了
    */
    observers: {
        ['playlist.playCount'](count){
            this.setData({
                _count:this._tranNumber(count, 2)
            })
        }
    },


    /**
     * 组件的初始数据
     */
    data: {
        _count: 0 //因为不能直接改变playcount（会导致一直调用observers）
    },

    /**
     * 组件的方法列表
     */
    methods: {
        goToMusicList(){
            wx.navigateTo({   //页面跳转
              url: `../../pages/musiclist/musiclist?playlistId=${this.properties.playlist.id}`,   //模板字符串要用反引号
              //当playlist.id传过去后可以再onload方法里面的options参数里面获取到
            })
        },

        /* 数字转换方法，保留2位小数 */
        _tranNumber(num, point){
            let numStr = num.toString().split('.')[0] //split() 方法用于把一个字符串分割成字符串数组。
            if(numStr.length < 6){
                return numStr
            }else if(numStr.length >= 6 && numStr.length <= 8){
                let decimal = numStr.substring(numStr.length - 4, numStr.length - 4 + point) //substring() 方法用于提取字符串中介于两个指定下标之间的字符。
                return parseFloat(parseInt(num / 10000) + '.' + decimal) + '万'
            }else if(numStr.length > 8){
                let decimal = numStr.substring(numStr.length - 8, numStr.length - 8 + point)
                return parseFloat(parseInt(num / 100000000) + '.' + decimal) + '亿'
            }
        }
    }
})

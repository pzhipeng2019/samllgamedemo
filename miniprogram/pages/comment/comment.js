// pages/comment/comment.js
//云数据库初始化
const db=wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    detail:{},
    value: 3,
    fieldValue:"",
    imgList:[],
    fileIds:[],
    moveId:-1,
  },
 

  onChange(event) {
    this.setData({
      value: event.detail
    });
  },
  fieldonChange(event) {
    // event.detail 为当前输入的值
    console.log(event.detail);
    this.setData({
      fieldValue: event.detail
    });
  },
  submit:function(){
    wx.showLoading({
      title: '评论中',
    })
    console.log(this.data.fieldValue, this.data.value)
    //上传图片
    let promiseArr=[];
    for(let i=0;i<this.data.imgList.length;i++){
      promiseArr.push(new Promise((reslove,reject)=>{
        let item=this.data.imgList[i];
       
        let suffix = /\.\w+$/.exec(item)[0]; // 正则表达式，返回文件扩展名
        wx.cloud.uploadFile({
          cloudPath: new Date().getTime() + suffix, // 上传至云端的路径
          filePath: item, // 小程序临时文件路径
          success: res => {
            // 返回文件 ID
            console.log(res.fileID)
            this.setData({
              fileIds: this.data.fileIds.concat(res.fileID)
            });
            reslove();
          },
          fail: console.error
        })
      }));
    }
    console.log(promiseArr)
    Promise.all(promiseArr).then(res=>{
      //插入数据
      db.collection('comment').add({
        data:{
          content:this.data.fieldValue,
          score:this.data.value,
          moveid:this.data.moveId,
          fileIds:this.data.fileIds,
        }
      }).then(res=>{
        wx.hideLoading();
        wx.showToast({
          title: '评论成功！',
        })
      }).catch(err=>{
        wx.hideLoading();
        wx.showToast({
          title: '评论失败！',
        })
      })
    })
  },
  uploadImg:function(){
    wx.chooseImage({
      count: 9,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success:res=> {
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths;
          console.log(tempFilePaths)
          this.setData({
            imgList: this.data.imgList.concat(tempFilePaths),
          })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    this.setData({
      moveId:options.movieid,
    })
    wx.cloud.callFunction({
      name: "getDetail",
      data: {
        movieid:options.movieid
      }
    }).then(res => {
      this.setData({
        detail: JSON.parse(res.result)
      })
      console.log(res);
     
    }).catch(err => {
      console.error(err)
     
    });
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
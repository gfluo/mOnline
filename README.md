# mOnline
微信小店商品批量上传
# onlined.json
已经上传过的商品信息
# conf.js
控制每次从源获取的商品数量
# how to start 
    启动参数设置 1.node app.js 启动商品上传
                2.node app.js 4 number  获取微信小店已上传的商品 number是商品的状态 0，1，2
                3.node app.js 3 product_id  从微信小店删除已经上传的商品 product_id是更具命令2获取的商品id
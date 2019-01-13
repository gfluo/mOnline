const path = require(`path`);
const fs = require(`fs`);
const utilSelf = require(`./util`);
const conf = require(`./conf`);
const platformS = require(`./platform/source/index`);
const platformW = require(`./platform/wx/index`);

process.on(`exit`, (code) => {
    console.warn(`系统正在退出：${code}`);
})

process.on(`uncatchException`, (e) => {
    console.error(e);
    process.exit(1);
})

if (process.argv.length > 2) {
    if (process.argv[2] == 1) {     ///获取顶级分类
        (async() => {
            try {
            let topCidInfo = await platformW.getCategorySub('1');
            console.log(topCidInfo);
            } catch (e) {
                console.error(e);
            }
        })()
    } else if (process.argv[2] == 2) {
        (async() => {
            try {
                let skuInfo = await platformW.skuTable(process.argv[3]);
                console.log(JSON.stringify(skuInfo));
            } catch (e) {
                console.error(e);
            }
        })()
    } else if (process.argv[2] == 3) {
        (async() => {
            try {
                let dRes = await platformW.mDel(process.argv[3]);
                console.log(dRes);
            } catch (e) {
                console.error(e);
            }
        })()
    } else if (process.argv[2] == 4) {
        (async() => {
            try {
                let mList = await platformW.mList(process.argv[3]);
                console.log(JSON.stringify(mList.products_info[mList.products_info.length - 1]));
                console.log(`已在线商品数量${mList.products_info.length}`);
            } catch (e) {
                console.error(e);
            }
        })();
    }
} else {
    start();
}

async function start() {
    let jsonStr = ''; 
    let onlinedInfo = {}; 
    let needSkip = 0;
    try {
        jsonStr = await utilSelf.readJson(path.join(__dirname, `./onlined.json`));
        onlinedInfo = JSON.parse(jsonStr);
        let ms = await platformS.mList({limit: conf.sourceLimit, skip: onlinedInfo.skip});
        for (let i = 0; i < ms.length; ++i) {
            let wxMOpData = {
                product_base: {
                    ///"buy_limit": 10000
                }
            }
            let localFiledir = await platformS.imgDownload({
                url: ms[i].goods_img,
                filename: `${ms[i].goods_id}_goods_img.jpg`,
            }); 
            let main_img = await platformW.imgUpload({
                filename: `${ms[i].goods_id}_goods_img.jpg`,
                filedir: localFiledir
            });
            localFiledir = await platformS.imgDownload({
                url: ms[i].goods_thumb,
                filename: `${ms[i].goods_id}_goods_thumb.jpg`,
            })
            let img = await platformW.imgUpload({
                filename: `${ms[i].goods_id}_goods_thumb.jpg`,
                filedir: localFiledir,
            })
            localFiledir = await platformS.imgDownload({
                url: ms[i].original_img,
                filename: `${ms[i].goods_id}_goods_original_img.jpg`
            })
            let img1 = await platformW.imgUpload({
                filename: `${ms[i].goods_id}_goods_original_img.jpg`,
                filedir: localFiledir,
            })

            let cidInfo = await platformS.allCInfo(ms[i].cat_id);
            let relateStr = await utilSelf.readJson(path.join(__dirname, './platform/relate/relate.json'));
            let relate = JSON.parse(relateStr);
            let wxCidInfo = relate[cidInfo.top.cid];
            let wxSubInfo = await platformW.getCategorySub(wxCidInfo.wx_cid);
            ///console.log(wxSubInfo);
            wxMOpData.product_base.property = [{id: `关键词`, vid: `${ms[i].keywords}`}]
            wxMOpData.product_base.category_id = [];
            wxMOpData.product_base.category_id.push(wxSubInfo.id);
            wxMOpData.product_base.name = ms[i].goods_name;
            wxMOpData.product_base.main_img = main_img;
            wxMOpData.product_base.img = [];
            wxMOpData.product_base.img.push(img);
            wxMOpData.product_base.img.push(img1);
            wxMOpData.product_base.detail = [];
            wxMOpData.product_base.detail.push({
                "img": img1
            });
            wxMOpData.product_base.detail.push({
                "text": ms[i].keywords
            })
            wxMOpData.product_base.detail.push({
                "text": `最低分类信息：${cidInfo.bottom.cid} -- ${cidInfo.bottom.name}`
            })
            wxMOpData.product_base.detail.push({
                "text": `次级分类信息：${cidInfo.second.cid} -- ${cidInfo.second.name}`
            })
            wxMOpData.product_base.detail.push({
                "text": `顶级分类信息：${cidInfo.top.cid} -- ${cidInfo.top.name}`
            })
            wxMOpData.sku_list = [];
            wxMOpData.sku_list.push({
                sku_id: ``,
                price: ms[i].shop_price * 100 * 2.5,
                icon_url: `${img}`,
                product_code: `${ms[i].goods_number}`,
                ori_price: ms[i].market_price * 100 * 2.5,
                quantity: 10000
            })
            wxMOpData.delivery_info = {
                "delivery_type": 0,
                "template_id": 0,
                "express": [
                    {
                        "id": 10000027,
                        "price": 100
                    },
                    {
                        "id": 10000028,
                        "price": 100
                    },
                    {
                        "id": 10000029,
                        "price": 100
                    }
                ]
            }
            ///console.log(JSON.stringify(wxMOpData));
            let mOlineResult = await platformW.mOnline(wxMOpData);
            if (`ok` == mOlineResult.errmsg) {
                needSkip += 1;
                onlinedInfo.lastedOnline = ms[i].goods_id;
            }
            console.log(mOlineResult);
        }
        onlinedInfo.skip += needSkip;
        fs.writeFileSync(path.join(__dirname, './onlined.json'), JSON.stringify(onlinedInfo));
    } catch (e) {
        console.error(e);
        onlinedInfo.skip += needSkip;
        fs.writeFileSync(path.join(__dirname, './onlined.json'), JSON.stringify(onlinedInfo));
    }
}


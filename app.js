const path = require(`path`);
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
            let topCidInfo = await platformW.getCategorySub(1);
            } catch (e) {
                console.error(e);
            }
        })()
    }
} else {
    start();
}

async function start() {
    try {
        let jsonStr = await utilSelf.readJson(path.join(__dirname, `./onlined.json`));
        let onlinedInfo = JSON.parse(jsonStr);
        let ms = await platformS.mList({limit: conf.sourceLimit, skip: onlinedInfo.skip});
        for (let i = 0; i < ms.length; ++i) {
            let localFiledir = await platformS.imgDownload({
                url: ms[i].goods_img,
                filename: `${ms[i].goods_id}_goods_img.jpg`,
            }); 
            let cidInfo = await platformS.allCInfo(ms[i].cat_id);
            let relateStr = await utilSelf.readJson(path.join(__dirname, './platform/relate/relate.json'));
            let relate = JSON.parse(relateStr);
            let wxCidInfo = relate[cidInfo.top.cid];
            let wxSubInfo = await platformW.getCategorySub(wxCidInfo.wx_cid);
        }
    } catch (e) {
        console.error(e);
    }
}


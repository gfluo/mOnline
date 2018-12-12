const path = require(`path`);
const common = require('../common/index');
const { url } = require(`./remote`);
class Main {
    static async mList(params) {  ///获取商品列表
        let { limit, skip } = params;
        let requestUrl = `${url.merchandiseList}?limit=${limit}&type=click_count&order=desc&skip=${skip}`;
        try {
            let resStr = await common.get(requestUrl);
            let ms = JSON.parse(resStr);
            if ('数据查询成功' == ms.message) {
                return ms.data;
            }
            throw new Error(me.message);
        } catch (e) {
            throw e;
        }
    }

    static async upCid(corrCid) {
        let requestUrl = url.cidGetFromSub + `?id=${corrCid}`;
        try {
            let resStr = await common.get(requestUrl);
            let cidInfo = JSON.parse(resStr);
            if (`数据查询成功` == cidInfo.message) {
                return cidInfo.data[0];
            }
            throw new Error(cidInfo.message);
        } catch (e) {
            throw e;
        }
    }

    /**
     * 
     * @param bottomCid ///最底层cid 
     */
    static async allCInfo(bottomCid) {
        try {
            let secondCidInfo = await Main.upCid(bottomCid);
            let topCidInfo = await Main.upCid(secondCidInfo.parent_id);
            let sharpCidInfo = await Main.upCid(topCidInfo.parent_id);
            console.log(secondCidInfo);
            console.log(topCidInfo);
            console.log(sharpCidInfo);
            return {
                bottom: {
                    cid: bottomCid,
                    name: secondCidInfo.cat_name
                },
                second: {
                    cid: secondCidInfo.parent_id,
                    name: topCidInfo.cat_name,
                },
                top: {
                    cid: topCidInfo.parent_id,
                    name: sharpCidInfo.cat_name
                }
            }
        } catch (e) {
            throw (e);
        }
    }

    /**
     * 
     * @param {filename, imgUrl} params 
     */
    static async imgDownload(params) {
        try {
            let filedir = path.join(__dirname, `./files/${params.filename}`);
            await common.fileDownload({ url: `${url.imgHead}/${params.url}`, filedir });
            return filedir;
        } catch (e) {
            throw e;
        }
    }
}

module.exports = Main;
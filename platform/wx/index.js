const path = require('path');
const fs = require('fs');
const utilSelf = require('../../util');
const common = require('../common/index');
const { url } = require('./remote');

class Main {
    static async getAccessToken() { ///直接从wx获取
        let secretDir = path.join(__dirname, `../../private/wxSecret.json`);
        try {
            let jsonStr = await utilSelf.readJson(secretDir);
            let secretInfo = JSON.parse(jsonStr);
            let requestUrl = 
                `${url.accessToken}?grant_type=client_credential&appid=${secretInfo.appid}&secret=${secretInfo.secret}`;
            let reqStr = await common.get(requestUrl);
            let token = JSON.parse(reqStr);
            if (token.access_token != undefined) {
                let holdToken = {
                    access_token: token.access_token,
                    expire: new Date().getTime() + 7140 * 1000,
                }

                fs.writeFileSync(path.join(__dirname, `./token.json`), JSON.stringify(holdToken));
                return holdToken;
            }

            throw new Error(token.errmsg);
        } catch (e) {
            throw e;
        }
    }

    static async getToken() {   ///从本地获取
        try {
            let holdTokenStr = await utilSelf.readJson(path.join(__dirname, `./token.json`));
            let holdToken = JSON.parse(holdTokenStr);
            let now = new Date().getTime();
            if (now > holdToken.expire) {
                holdToken = await Main.getAccessToken();
            }
            return holdToken.access_token;
        } catch (e) {
            throw e;
        }
    }

    static async getCategorySub(cid) {     ///获取当前分类子类信息
        try {
            let token = await Main.getToken();
            let requestUrl = url.categorySub + `?access_token=${token}`;
            let subInfo = await common.post({
                url: requestUrl,
                postData: {
                    cate_id: cid
                }
            });
            if (`ok` == subInfo.errmsg && subInfo.cate_list.length) {
                return subInfo.cate_list[0];
            }
            throw new Error(`获取次级分类信息失败`);
        } catch (e) {
            throw e;
        }
    }

    /**
     * 
     * @param {filename, filedir} params 
     */
    static async imgUpload(params) {
        try {
            let token = await Main.getToken();
            let requestUrl =
                url.uploadImg + `?access_token=${token}`;
            let result = await common.fileUpload({
                url: requestUrl,
                filedir: params.filedir,
                filename: params.filename
            });
            let uploadSuccess = JSON.parse(result);
            return uploadSuccess.url;
        } catch (e) {
            throw e;
        }
    }

    static async skuTable(cid) {
        try {
            let token = await Main.getToken();
            let requestUrl = 
                url.skuTable + `?access_token=${token}`;
            let skuTableInfo = await common.post({
                url: requestUrl,
                postData: {
                    cate_id: cid,
                }
            })
            console.log(skuTableInfo);
        } catch (e) {
            throw e
        }
    }


    static async mOnline(postData) {
        try {
            let token = await Main.getToken();
            let requestUrl =
                url.merchandiseAdd + `?access_token=${token}`;
            let oRes = await common.post({
                url: requestUrl,
                postData
            });
            return oRes;
        } catch (e) {
            throw e
        }
    }

    static async mDel(dId) {
        try {
            let token = await Main.getToken();
            let requestUrl = url.mDel + `?access_token=${token}`;
            let dRes = await common.post({
                url, requestUrl,
                postData: {
                    product_id: dId
                }
            })
            return dRes;
        } catch (e) {
            throw e
        }
    }

    static async mList(status) {
        try {
            let token = await Main.getToken();
            let requestUrl = url.merchandise + `?access_token=${token}`;
            let ms = await common.post({
                url: requestUrl,
                postData: {
                    status: status,
                }
            })
            return ms;
        } catch (e) {
            throw e;
        }
    }
}

module.exports = Main;
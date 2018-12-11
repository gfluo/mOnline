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
            let reqStr = await common.post({
                url: requestUrl,
                postData: {
                    cate_id: cid
                }
            });
            console.log(reqStr);
            let subInfo = JSON.parse(reqStr);
            if (`ok` == subInfo.errmsg && subInfo.cate_list.length) {
                return subInfo.cate_list[0];
            }
            throw new Error(`获取次级分类信息失败`);
        } catch (e) {
            throw e;
        }
    }
}

module.exports = Main;
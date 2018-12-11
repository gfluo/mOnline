const request = require(`request`);

class Main {
    static get(url) {
        return new Promise((resolve, reject) => {
            request(url, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    resolve(body);
                }
                reject(error ? error : response.statusCode);
            })
        })
    }
    /**
     * 
     * @param {url, postData} params 
     */
    static post(params) {
        console.log(params);
        return new Promise((resolve, reject) => {
            request({
                url: params.url,
                method: "POST",
                json: true,
                headers: {
                    "content-type": "application/json",
                },
                body: params.postData
            }, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    resolve(body);
                }
                reject(error ? error : response.statusCode);
            });
        });
    }
}

module.exports = Main
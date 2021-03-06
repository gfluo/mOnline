const request = require(`request`);
const fs = require(`fs`);

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
        ///console.log(params);
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

    static fileDownload(params) {
        return new Promise((resolve, reject) => {
            let downloadStream = request(params.url).pipe(fs.createWriteStream(params.filedir));
            downloadStream.on('end', ()=>{
                console.log(`${params.url} 下载完成`);
                resolve();
            })
            downloadStream.on('error', function(err) {
                reject(err);        
            })
            downloadStream.on("finish", function() {
                console.log(`${params.filedir} 写入完成`);
                downloadStream.end();
                resolve();
            });
        })
    }

    /**
     * 
     * @param {url, filename, filedir} params 
     */
    static fileUpload(params) {
        return new Promise((resolve, reject) => {
            try {
                request.post({
                    url: params.url + `&type=image`,
                    formData: {
                        buffer: {
                            value: fs.readFileSync(params.filedir),
                            options: {
                                filename: params.filename,
                                contentType: 'image/jpg'
                            }
                        },
                    },
                }, function optionalCallback(err, httpResponse, body) {
                    if (err) {
                        reject(err)
                    }
                    if (httpResponse.statusCode == 200) {
                        resolve(body);
                    }
                    reject(httpResponse.statusCode);
                });
            } catch (e) {
                reject(e);
            }
        })
    }
}

module.exports = Main
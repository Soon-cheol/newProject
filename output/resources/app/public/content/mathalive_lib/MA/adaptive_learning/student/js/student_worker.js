// worker.js
// get sample message
// axios 를 직접 쓴건 아니고, 비슷하게...
const axios = (url, params) => {
    return new Promise((resolve, reject) => {
        var pr = '';
        function reqListener() {
            if (this.status !== 200 || this.responseText.success == false) {
                return reject({url: url});
            }
            const response = this.responseText;
            resolve({data: response, url: url});
        }
        const oReq = new XMLHttpRequest();
        oReq.addEventListener('load', reqListener);
        if(params) {
            pr += '?';
            var count = 0;
            for(var key in params) {
                if(count > 0) {
                    pr += '&';
                }
                pr+=(key + '=' + params[key]);
                count++;
            }
        }
        /*
            "https://addonsapi.fel40.com/ma/question/first?bkKey=0&clsIdx=1398&course1MtlSeq=18992&course2MtlSeq=20125&course3MtlSeq=20135&course4MtlSeq=20139&depthItemIdx=23832&dpProblemtype=PM&studyCd=AL2&userIdx=78987"
            /ma/question/first?bkKey=0&clsIdx=1398&depthItemIdx=23832&dpProblemtype=PM&studyCd=AL2&userIdx=78987
        */
        oReq.open('POST', url+pr);
        oReq.send();
    });
};
const sampleMessage = (type, url, params, callback) => {
    let pr = undefined;
    if(params != undefined){
        if(typeof params === 'string') {
            pr = JSON.parse(params);
        } else {
            pr = params;
        }
    }
    axios(url, pr).then((Response)=>{
        if(callback) {
            callback(Response);
        }else {
            postMessage({wkmessage: [type.replace('wk_', 'sq_'), Response.data, params, Response.url]});
        }
    }).catch((Error)=>{
        postMessage({wkmessage: [type.replace('wk_', 'sq_'), Error, params, url]});
    });
};
self.onmessage = function (event) {
    let msgdata;
    if(typeof event.data === 'string') {
        msgdata = JSON.parse(event.data);
    } else {
        msgdata = event.data;
    }
	if(msgdata.key === 'wk_concept') {
		sampleMessage(msgdata.key, msgdata.url, msgdata.params); // "http://localhost:8081/getConcept"
	}
	if(msgdata.key === 'wk_need_explain') {
		sampleMessage(msgdata.key, msgdata.url, msgdata.params); // "http://localhost:8081/getNeedExplain"
	}
	if(msgdata.key === 'wk_quiz') {
		sampleMessage(msgdata.key, msgdata.url, msgdata.params); // "http://localhost:8081/getPlayData"
	}
};
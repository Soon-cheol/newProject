window.addEventListener('message', handlePostMessage, false);
function handlePostMessage(evt) {
    console.log('content handlePostMessage', evt.data);
    const data = evt.data;
    
    if(data && data.type && data.type == 'changeBGStyle'){
        let body = document.querySelector("body");
        let right = document.querySelector(".right");
        if (body) {
            if (right)
                body.style.background =
                "linear-gradient(to right, " +
                data.msg.bgColor.main +
                " 50%, " +
                data.msg.bgColor.right +
                " 50%)";
            else body.style.backgroundColor = data.msg.bgColor.main;
        }

    } else if(data && data.type == 'getStgSolution'){
        var left = document.querySelector(".left");
            var right = document.querySelector(".right");
            var leftInnerHtml = undefined;
            var rightInnerHtml = undefined;
            var serverPath = data.msg.serverPath;
            console.log('getStgSolution server', serverPath);
            if(left) {
                leftInnerHtml = left.innerHTML;
                var fromIndex = 0;
                var srcs = [];
                for(var i = 0; leftInnerHtml.indexOf("src",fromIndex) !==-1 ; i++){
                     var nextIdx = leftInnerHtml.indexOf("src", fromIndex) + "src".length;                
                    var srcStartIdx = undefined;
                    var srcEndIdx = undefined;
                    if(leftInnerHtml.indexOf("\"", nextIdx) !== -1) {
                        srcStartIdx = leftInnerHtml.indexOf("\"", nextIdx) + 1;
                    }
                    if(leftInnerHtml.indexOf("\"", srcStartIdx) !== -1) {
                        srcEndIdx = leftInnerHtml.indexOf("\"", srcStartIdx);
                    }
                    var src = leftInnerHtml.substring(srcStartIdx, srcEndIdx);
                    console.log('getStgSolution src',src);

                    if(!src.startsWith("http")){
                        if(!src.startsWith("data:")) {
                            if(!srcs.includes(src))srcs.push(src);
                        }
                    } 
                    fromIndex = srcEndIdx + 1;                    
                }

                for(var i=0; i < srcs.length; i++){
                    leftInnerHtml = leftInnerHtml.replace(new RegExp(srcs[i], "g"), serverPath+srcs[i]);
                }

                console.log('getStgSolution -leftInnerHtml', leftInnerHtml);
            }
            if(right){
                rightInnerHtml = right.innerHTML;
                
                var fromIndex = 0;
                var srcs = [];
                for(var i = 0; rightInnerHtml.indexOf("src",fromIndex) !==-1 ; i++){
                     var nextIdx = rightInnerHtml.indexOf("src", fromIndex) + "src".length;                
                    var srcStartIdx = undefined;
                    var srcEndIdx = undefined;
                    if(rightInnerHtml.indexOf("\"", nextIdx) !== -1) {
                        srcStartIdx = rightInnerHtml.indexOf("\"", nextIdx) + 1;
                    }
                    if(rightInnerHtml.indexOf("\"", srcStartIdx) !== -1) {
                        srcEndIdx = rightInnerHtml.indexOf("\"", srcStartIdx);
                    }
                    var src = rightInnerHtml.substring(srcStartIdx, srcEndIdx);
                    console.log('getStgSolution src',src);

                    if(!src.startsWith("http")){
                        if(!src.startsWith("data:")) {
                            if(!srcs.includes(src))srcs.push(src);
                        }
                    } 
                    fromIndex = srcEndIdx + 1;                    
                }

                for(var i=0; i < srcs.length; i++){
                    rightInnerHtml = rightInnerHtml.replace(new RegExp(srcs[i], "g"), serverPath+srcs[i]);
                }

                console.log('getStgSolution -rightInnerHtml', rightInnerHtml);
                
            }


            
            var msg = {};
            msg.leftInnerHTML = leftInnerHtml ? leftInnerHtml : null;
            msg.rightInnerHTML = rightInnerHtml ? rightInnerHtml : null;
            msg.to = data.from;
            msg.step = data.msg.step;
            console.log("getStgSolution post msg",msg);
            this.sendPostMessage('notifyStgSolution',msg);
    }
} 
function sendPostMessage(type, msg) {
    console.log('content sendPostMessage', type, msg);
    var postMsgData = { from:'macontent', to: "matemplate", type: type, msg: msg};
    window.parent.postMessage(postMsgData, "*");
} 

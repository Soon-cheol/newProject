var util_o = {
    isNumeric: function(num, opt) {
        num = String(num).replace(/^\s+|\s+$/g, "");
        var regex;
        if(typeof opt == "undefined" || opt == "1") {
            regex = /^[+\-]?(([1-9][0-9]{0,2}(,[0-9]{3})*)|[0-9]+){1}(\.[0-9]+)?$/g;
        }else if(opt == "2"){
            regex = /^(([1-9][0-9]{0,2}(,[0-9]{3})*)|[0-9]+){1}(\.[0-9]+)?$/g;
        }else if(opt == "3") {
            regex = /^[0-9]+(\.[0-9]+)?$/g;
        }else {
            regex = /^[0-9]$/g;
        }
       
        if(regex.test(num)) {
            num = num.replace(/,/g, "");
            return isNaN(num) ? false : true;
        } else return false;
    }
};

var link_o = {
    links: [],
    add: function (id, link_seq) {
        var obj = document.getElementById(id);
        if(!obj) return;
        let link = {
            obj: obj,
            link_seq: link_seq  
        };
        link_o.links.push(link);
    },
    click: function (obj) {
        let link = link_o.links.find(item => item.obj.id == obj.id);
        if(!link) return;

        let postMsgData = { from:'macontent', to: "matemplate", type: "contentlink", msg: {
            link_seq: link.link_seq
        }};
        window.parent.postMessage(postMsgData);
    }
};

var btn_o = {
    btns: [],
    add: function (id, btn_seq) {
        var obj = document.getElementById(id);
        if(!obj) return;
        let btn = {
            obj: obj,
            btn_seq: btn_seq
        };
        btn_o.btns.push(btn);
    },
    click: function (obj) {
        let btn = btn_o.btns.find(item => item.obj.id == obj.id);
        if(!btn) return;

        let postMsgData = { from:'macontent', to: "matemplate", type: "contentlink", msg: {
            btn_seq: btn.btn_seq
        }};
        window.parent.postMessage(postMsgData);
    }
};

var choicebtn_o = {
    objs: [],
    init: function (ids) {
        if(!ids || ids.length == 0) return; 
        for(var i = 0; i < ids.length; i++) {
            var obj = document.getElementById(ids[i]);
            if(!obj) continue; 
            choicebtn_o.objs.push(obj);
        }
    },
    click: function (obj) {
        if(obj.classList.contains('on')) {
            obj.classList.remove('on');
            return;
        }
        for(var i = 0; i < choicebtn_o.objs.length; i++) {
            if(obj.id == choicebtn_o.objs[i].id) choicebtn_o.objs[i].classList.add('on');
            else choicebtn_o.objs[i].classList.remove('on');
        }
    }
};

var mchoicebtn_o = {
    objs: [],
    init: function (ids) {
        if(!ids || ids.length == 0) return; 
        for(var i = 0; i < ids.length; i++) {
            var obj = document.getElementById(ids[i]);
            if(!obj) continue; 
            mchoicebtn_o.objs.push(obj);
        }
    },
    click: function (obj) {
        if(obj.classList.contains('on')) {
            obj.classList.remove('on');
            return;
        }
        for(var i = 0; i < mchoicebtn_o.objs.length; i++) {
            if(obj.id == mchoicebtn_o.objs[i].id) mchoicebtn_o.objs[i].classList.add('on');
        }
    }
};

var numpad_o = {
    selector: null,
    value: '',
    target : null,
    max: 1, // max allowed characters
    pos: 'left',
    init: function () {
        numpad_o.selector = document.createElement("div");
        numpad_o.selector.id = "numpad-wrap";
        numpad_o.selector.classList.add("numpad");
        button = null,
        append = function (txt, fn, css) {
            button = document.createElement("button");
            button.innerHTML = txt;
            if (css) button.classList.add(css);
            button.addEventListener("click", fn);
            numpad_o.selector.appendChild(button);
        };
        var i;
        for (i = 7; i<=9; i++) append(i, numpad_o.digit);
        for (i = 4; i<=6; i++) append(i, numpad_o.digit);
        for (i = 1; i<=3; i++) append(i, numpad_o.digit);
        append('???', numpad_o.delete);
        append(0, numpad_o.digit);
        append('???', numpad_o.select);
        document.body.appendChild(numpad_o.selector);
    },
    delete: function () {
        var length = numpad_o.value.length;
        if (length > 0) {
            numpad_o.value = numpad_o.value.substring(0, length-1);
            numpad_o.target.value = numpad_o.value;
            // console.log('numpad_o.value', numpad_o.value);
        }
    },
    digit: function (evt) {
        value = evt.target.innerHTML;
        // console.log('value', value, numpad_o.value.length, numpad_o.max);
        var curvalue;
        if (numpad_o.value.length < numpad_o.max) {
            if (numpad_o.value == "") numpad_o.value = value;
            else numpad_o.value += value;

            curvalue = parseInt(numpad_o.value);
            numpad_o.target.value = curvalue;
        } else {
            var length = numpad_o.value.length;
            if (length > 0) {
                if(length == 0) numpad_o.value = value;
                else numpad_o.value = numpad_o.value.substring(0, length-1) + value;

                curvalue = parseInt(numpad_o.value);
                numpad_o.target.value = curvalue;
            }
        }
        // console.log('numpad_o.value', numpad_o.value);
    },
    select: function () {
        // var value = numpad_o.value;
        // value = parseInt(value);
        // numpad_o.target.value = value;
        numpad_o.hide();
    },
    show: function (evt) {
        numpad_o.target = evt.target;
        var rect = evt.target.getBoundingClientRect();
        if(rect) {
            numpad_o.pos = numpad_o.target.dataset.pos;
            if(numpad_o.pos == 'right') {
                numpad_o.selector.style.top = rect.top + 'px';
                if(rect.left - rect.width - 10 < 0) numpad_o.selector.style.left = '0px';
                else numpad_o.selector.style.left = (rect.left - 202 - 10) + 'px'; // 202 number box width
            } else {
                numpad_o.selector.style.top = rect.top + 'px';
                numpad_o.selector.style.left = (rect.left + rect.width + 10) + 'px';
            }
        }
        numpad_o.max = parseInt(numpad_o.target.dataset.max);
        var dv = evt.target.value;
        if (!isNaN(parseFloat(dv)) && isFinite(dv)) {
            numpad_o.value = dv;
        } else {
            numpad_o.value = "";
        }
        numpad_o.selector.classList.add("show");
    },
    hide: function () {
        numpad_o.selector.classList.remove("show");
    },
    attach: function (opt) {
        var target = document.getElementById(opt.id);
        if (opt.max==undefined || typeof opt.max!="number") { opt.max = 1; }
        if (opt.pos==undefined || typeof opt.pos!="string") { opt.pos = 'left'; }
        if (target!=null) {
            target.dataset.max = opt.max;
            target.dataset.pos = opt.pos;
            numpad_o.value = target.value;
            target.addEventListener("click", numpad_o.show);
        } else {
            console.log(opt.id + " NOT FOUND!");
        }
    } 
}; 

var dragdrop_o = {
    target: null,
    source: null,
    trashbin: null,
    isRemoveClass: true,
    init: function (tgtid, srcid, binid) {
        dragdrop_o.target = document.getElementById(tgtid);
        dragdrop_o.source = document.getElementById(srcid);
        dragdrop_o.trashbin = document.getElementById(binid);
        if(dragdrop_o.target){
            dragdrop_o.target.addEventListener('dragenter', function (e) {
                e.preventDefault();
                e.stopPropagation(); // stop it here to prevent it bubble up
            });
            dragdrop_o.target.addEventListener('dragover', function (e) {
                e.preventDefault(); // allows us to drop
                e.stopPropagation(); // stop it here to prevent it bubble up
            });
            dragdrop_o.target.addEventListener('dragexit', function (e) {
                e.stopPropagation(); // stop it here to prevent it bubble up
            });
            dragdrop_o.target.addEventListener('dragleave', function (e) {
                e.stopPropagation(); // stop it here to prevent it bubble up
            });
            dragdrop_o.target.addEventListener('drop', function (e) {
                e.stopPropagation(); // stop it here to prevent it bubble up

                if(e.dataTransfer.getData('class') !== dragdrop_o.source.classList.value) return;

                var newObj = dragdrop_o.source.cloneNode(true);
                dragdrop_o.target.appendChild(newObj);
                if(dragdrop_o.isRemoveClass) newObj.classList.remove(dragdrop_o.source.classList);
            });
        }
        if(dragdrop_o.source) {
            dragdrop_o.source.addEventListener('dragstart', function (e) {
                e.dataTransfer.setData('class', this.classList);
            });
            dragdrop_o.source.addEventListener('drag', function (e) {
                // console.log('drag');
            });
            dragdrop_o.source.addEventListener('dragend', function (e) {
                // console.log('dragend with effect: ' + e.dataTransfer.dropEffect);
            });
            dragdrop_o.source.addEventListener('click', function (e) {
                var newObj = dragdrop_o.source.cloneNode(true);
                dragdrop_o.target.appendChild(newObj);
                if(dragdrop_o.isRemoveClass) newObj.classList.remove(dragdrop_o.source.classList);
            });
        }
        if(dragdrop_o.trashbin){
            dragdrop_o.trashbin.addEventListener('dragenter', function (e) {
                // console.log('trashbin dragenter');
                e.preventDefault();
                e.stopPropagation(); // stop it here to prevent it bubble up
            });
            dragdrop_o.trashbin.addEventListener('dragover', function (e) {
                // console.log('trashbin dragover');
                e.preventDefault(); // allows us to drop
                e.stopPropagation(); // stop it here to prevent it bubble up
            });
            dragdrop_o.trashbin.addEventListener('dragexit', function (e) {
                // console.log('trashbin dragexit');
                e.stopPropagation(); // stop it here to prevent it bubble up
            });
            dragdrop_o.trashbin.addEventListener('dragleave', function (e) {
                // console.log('trashbin dragleave');
                e.stopPropagation(); // stop it here to prevent it bubble up
            });
            dragdrop_o.trashbin.addEventListener('drop', function (e) {
                // console.log('trashbin drop');
                e.stopPropagation(); // stop it here to prevent it bubble up

                if(dragdrop_o.target.hasChildNodes()) {
                    if(dragdrop_o.target.childElementCount == 1) {
                        while(dragdrop_o.target.firstChild) dragdrop_o.target.removeChild(dragdrop_o.target.lastChild); // due to removeChild bug when child is one.
                    } else dragdrop_o.target.removeChild(dragdrop_o.target.lastChild);
                }
            });
            dragdrop_o.trashbin.addEventListener('click', function (e) {
                // console.log('clicked on trash bin');
                if(dragdrop_o.target.hasChildNodes()) {
                    if(dragdrop_o.target.childElementCount == 1) {
                        while(dragdrop_o.target.firstChild) dragdrop_o.target.removeChild(dragdrop_o.target.lastChild); // due to removeChild bug when child is one.
                    } else dragdrop_o.target.removeChild(dragdrop_o.target.lastChild);
                }
            });
        }
    }, 
    setIsRemoveClass: function (isRemoveClass) {
        dragdrop_o.isRemoveClass = isRemoveClass;
    },
};

var mdragdrop_o = {
    target: [],
    source: [],
    sourcebox: null,
    multianswer: false,
    isscrcard: false,
    setMultiAnswer: function (multianswer) {
        mdragdrop_o.multianswer = multianswer;
    },
    setTarget: function(tgtid) {
        var tgt = document.getElementById(tgtid);
        if(tgt){
            tgt.addEventListener('dragenter', function (e) {
                e.preventDefault();
                e.stopPropagation(); // stop it here to prevent it bubble up
            });
            tgt.addEventListener('dragover', function (e) {
                e.preventDefault(); // allows us to drop
                e.stopPropagation(); // stop it here to prevent it bubble up
            });
            tgt.addEventListener('dragexit', function (e) {
                e.stopPropagation(); // stop it here to prevent it bubble up
            });
            tgt.addEventListener('dragleave', function (e) {
                e.stopPropagation(); // stop it here to prevent it bubble up
            });
            tgt.addEventListener('drop', function (e) {
                e.stopPropagation(); // stop it here to prevent it bubble up

                if(!mdragdrop_o.isscrcard && !mdragdrop_o.multianswer && tgt.childElementCount > 0) return;

                var curSrc = null;
                for(i = 0; i < mdragdrop_o.source.length; i++) {
                    if(mdragdrop_o.isscrcard) {
                        if(mdragdrop_o.source[i].src.id == e.dataTransfer.getData('id')) {
                            curSrc = mdragdrop_o.source[i].src;
                            break;
                        }
                    } else {
                        if(mdragdrop_o.source[i].id == e.dataTransfer.getData('id')) {
                            curSrc = mdragdrop_o.source[i];
                            break;
                        }
                    }
                }
                if(curSrc) {
                    curSrc.parentNode.removeChild(curSrc);
                    this.appendChild(curSrc);
                }
            });
            tgt.addEventListener('click', function (e) {
                if(this.childElementCount == 0) return;
                else if (mdragdrop_o.sourcebox == null) return;
                else if (mdragdrop_o.multianswer) return;
                
                var imgObj = this.firstChild;
                if(imgObj) {
                    this.removeChild(imgObj);
                    mdragdrop_o.sourcebox.appendChild(imgObj);
                }
            });
            mdragdrop_o.target.push(tgt);
        }
    }, 
    setSource: function(srcid) {
        var src = document.getElementById(srcid);
        if(src) {
            src.addEventListener('dragstart', function (e) {
                e.dataTransfer.setData('id', this.id);
            });
            src.addEventListener('drag', function (e) {
                // console.log('src drag');
            });
            src.addEventListener('dragend', function (e) {
                // console.log('src dragend with effect: ' + e.dataTransfer.dropEffect);
            });
            src.addEventListener('click', function (e) {
                var parObj = this.parentNode;
                if(parObj === mdragdrop_o.sourcebox) {
                    var curTgt = null;
                    for(i = 0; i < mdragdrop_o.target.length; i++) {
                        if(mdragdrop_o.target[i].childElementCount == 0) {
                            curTgt = mdragdrop_o.target[i];
                            break;
                        }
                    }
                    if(curTgt == null) return;
    
                    this.parentNode.removeChild(this);
                    curTgt.appendChild(this);
                }
            });
            mdragdrop_o.source.push(src);
        }
    }, 
    setSourceWithCard: function(srcid, srccardid) {
        mdragdrop_o.isscrcard = true;

        var src = document.getElementById(srcid);
        var srccard = document.getElementById(srccardid);
        if(src) {
            src.addEventListener('dragstart', function (e) {
                e.dataTransfer.setData('id', this.id);
            });
            src.addEventListener('drag', function (e) {
                // console.log('src drag');
            });
            src.addEventListener('dragend', function (e) {
                // console.log('src dragend with effect: ' + e.dataTransfer.dropEffect);
            });
            src.addEventListener('click', function (e) {
                var parObj = this.parentNode;
                if(parObj !== mdragdrop_o.sourcebox) return;

                var curTgt = null;
                for(i = 0; i < mdragdrop_o.target.length; i++) {
                    if(mdragdrop_o.target[i].childElementCount == 0) {
                        curTgt = mdragdrop_o.target[i];
                        break;
                    }
                }
                if(curTgt == null) return;

                this.parentNode.removeChild(this);
                curTgt.appendChild(this);
            });
            mdragdrop_o.source.push({src: src, srccard: srccard});
        }
    }, 
    setSourceBox: function(srcboxid) {
        var srcbox = document.getElementById(srcboxid);
        if(srcbox) {
            srcbox.addEventListener('dragenter', function (e) {
                e.preventDefault();
                e.stopPropagation(); // stop it here to prevent it bubble up
            });
            srcbox.addEventListener('dragover', function (e) {
                e.preventDefault(); // allows us to drop
                e.stopPropagation(); // stop it here to prevent it bubble up
            });
            srcbox.addEventListener('dragexit', function (e) {
                e.stopPropagation(); // stop it here to prevent it bubble up
            });
            srcbox.addEventListener('dragleave', function (e) {
                e.stopPropagation(); // stop it here to prevent it bubble up
            });
            srcbox.addEventListener('drop', function (e) {
                e.stopPropagation(); // stop it here to prevent it bubble up

                var srcid = e.dataTransfer.getData('id');
                if(srcid == undefined || srcid == null) return;

                var curTgt = null;
                if(mdragdrop_o.isscrcard || mdragdrop_o.multianswer) {
                    var curSrc = null;
                    var curSrcCard = null;
                    for(i = 0; i < mdragdrop_o.source.length; i++) {
                        if(mdragdrop_o.multianswer) {
                            if(mdragdrop_o.source[i].id == srcid) {
                                curSrc = mdragdrop_o.source[i];
                                break;
                            }
                        } else if(mdragdrop_o.isscrcard) {
                            if(mdragdrop_o.source[i].src.id == srcid) {
                                curSrc = mdragdrop_o.source[i].src;
                                curSrcCard = mdragdrop_o.source[i].srccard;
                                break;
                            }
                        }
                    }
                    if(curSrc != null) {
                        for(i = 0; i < mdragdrop_o.target.length; i++) {
                            for(j = 0; j < mdragdrop_o.target[i].childElementCount; j++) {
                                var obj = mdragdrop_o.target[i].children[j];
                                if(obj && obj.id == srcid) {
                                    curTgt = mdragdrop_o.target[i];
                                    break;
                                }
                            }
                            if(!mdragdrop_o.isscrcard && mdragdrop_o.multianswer && curTgt != null) {
                                curTgt.removeChild(curSrc);
                                this.appendChild(curSrc);
                                break;
                            } else if(mdragdrop_o.isscrcard && curTgt != null && curSrcCard != null) {
                                curTgt.removeChild(curSrc);
                                curSrcCard.appendChild(curSrc);
                                break;
                            }
                        }
                    } 
                } else {
                    for(i = 0; i < mdragdrop_o.target.length; i++) {
                        if(mdragdrop_o.target[i].firstChild && mdragdrop_o.target[i].firstChild.id == srcid) {
                            curTgt = mdragdrop_o.target[i];
                            break;
                        }
                    }
                    if(curTgt != null) {
                        var imgObj = curTgt.firstChild;
                        if(imgObj) {
                            curTgt.removeChild(imgObj);
                            this.appendChild(imgObj);
                        }
                    } 
                }
            });
            mdragdrop_o.sourcebox = srcbox;
        }
    }, 
};

var draghere_o = {
    target: null,
    source: [],
    sourcebox: null,
    setTarget: function(tgtid) {
        var tgt = document.getElementById(tgtid);
        if(tgt){
            tgt.addEventListener('dragenter', function (e) {
                e.preventDefault();
                e.stopPropagation(); // stop it here to prevent it bubble up
            });
            tgt.addEventListener('dragover', function (e) {
                e.preventDefault(); // allows us to drop
                e.stopPropagation(); // stop it here to prevent it bubble up
            });
            tgt.addEventListener('dragexit', function (e) {
                e.stopPropagation(); // stop it here to prevent it bubble up
            });
            tgt.addEventListener('dragleave', function (e) {
                e.stopPropagation(); // stop it here to prevent it bubble up
            });
            tgt.addEventListener('drop', function (e) {
                e.stopPropagation(); // stop it here to prevent it bubble up

                var curSrc = null;
                for(i = 0; i < draghere_o.source.length; i++) {
                    if(draghere_o.source[i].src.id == e.dataTransfer.getData('id')) {
                        curSrc = draghere_o.source[i].src;
                        break;
                    }
                }
                if(curSrc) {
                    curSrc.parentNode.removeChild(curSrc);
                    this.appendChild(curSrc);
                }
            });
            draghere_o.target = tgt;
        }
    }, 
    setSource: function(srcid, srccardid) {
        var src = document.getElementById(srcid);
        var srccard = document.getElementById(srccardid);
        if(src) {
            src.addEventListener('dragstart', function (e) {
                e.dataTransfer.setData('id', this.id);
            });
            src.addEventListener('drag', function (e) {
                // console.log('src drag');
            });
            src.addEventListener('dragend', function (e) {
                // console.log('src dragend with effect: ' + e.dataTransfer.dropEffect);
            });
            src.addEventListener('click', function (e) {
                var parObj = this.parentNode;
                if(parObj === srccard && draghere_o.target != null) {
                    srccard.removeChild(this);
                    draghere_o.target.appendChild(this);
                } else if (parObj == draghere_o.target) {
                    draghere_o.target.removeChild(src);
                    srccard.appendChild(src);
                }
            });
            draghere_o.source.push({src: src, srccard: srccard});
        }
    }, 
    setSourceBox: function(srcboxid) {
        var srcbox = document.getElementById(srcboxid);
        if(srcbox) {
            srcbox.addEventListener('dragenter', function (e) {
                e.preventDefault();
                e.stopPropagation(); // stop it here to prevent it bubble up
            });
            srcbox.addEventListener('dragover', function (e) {
                e.preventDefault(); // allows us to drop
                e.stopPropagation(); // stop it here to prevent it bubble up
            });
            srcbox.addEventListener('dragexit', function (e) {
                e.stopPropagation(); // stop it here to prevent it bubble up
            });
            srcbox.addEventListener('dragleave', function (e) {
                e.stopPropagation(); // stop it here to prevent it bubble up
            });
            srcbox.addEventListener('drop', function (e) {
                e.stopPropagation(); // stop it here to prevent it bubble up

                var srcid = e.dataTransfer.getData('id');
                if(srcid == undefined || srcid == null) return;

                var curSrc = null;
                var curSrcCard = null;
                for(i = 0; i < draghere_o.source.length; i++) {
                    if(draghere_o.source[i].src.id == srcid) {
                        curSrc = draghere_o.source[i].src;
                        curSrcCard = draghere_o.source[i].srccard;
                        break;
                    }
                }
                if(curSrc != null && curSrcCard != null && draghere_o.target) {
                    draghere_o.target.removeChild(curSrc);
                    curSrcCard.appendChild(curSrc);
                }
            });
            draghere_o.sourcebox = srcbox;
        }
    }, 
};

var dragadd_o = {
    target: [],
    source: [],
    trashbin: null,
    sourcebox: null,
    isnexton: false,
    setTarget: function(tgtid) {
        var tgt = document.getElementById(tgtid);
        if(tgt){
            tgt.addEventListener('dragstart', function (e) {
                e.dataTransfer.setData('id', this.id);
            });
            tgt.addEventListener('dragstart', function (e) {
                e.dataTransfer.setData('id', this.id);
            });
            tgt.addEventListener('dragenter', function (e) {
                e.preventDefault();
                e.stopPropagation(); // stop it here to prevent it bubble up
            });
            tgt.addEventListener('dragover', function (e) {
                e.preventDefault(); // allows us to drop
                e.stopPropagation(); // stop it here to prevent it bubble up
            });
            tgt.addEventListener('dragexit', function (e) {
                e.stopPropagation(); // stop it here to prevent it bubble up
            });
            tgt.addEventListener('dragleave', function (e) {
                e.stopPropagation(); // stop it here to prevent it bubble up
            });
            tgt.addEventListener('drop', function (e) {
                e.stopPropagation(); // stop it here to prevent it bubble up

                if(tgt.childElementCount > 0) return;

                var curSrc = null;
                for(i = 0; i < dragadd_o.source.length; i++) {
                    if(dragadd_o.source[i].id == e.dataTransfer.getData('id')) {
                        curSrc = dragadd_o.source[i];
                        break;
                    }
                }
                if(curSrc) {
                    var newObj = curSrc.cloneNode(true);
                    this.appendChild(newObj);
                    if(dragadd_o.isnexton) {
                        if(this.classList.contains('on')) this.classList.remove('on');
                        dragadd_o.procNextOn();
                    }
                }
            });
            tgt.addEventListener('click', function (e) {
                if(this.childElementCount == 0) return;
                else if(dragadd_o.trashbin != null) return;
                
                var imgObj = this.firstChild;
                if(imgObj) {
                    this.removeChild(imgObj);
                    if(dragadd_o.isnexton){
                        dragadd_o.removeAllOn();
                        dragadd_o.procNextOn();
                    }
                }
            });
            dragadd_o.target.push(tgt);
        }
    }, 
    setSource: function(srcid) {
        var src = document.getElementById(srcid);
        if(src) {
            src.addEventListener('dragstart', function (e) {
                e.dataTransfer.setData('id', this.id);
            });
            src.addEventListener('drag', function (e) {
                // console.log('src drag');
            });
            src.addEventListener('dragend', function (e) {
                // console.log('src dragend with effect: ' + e.dataTransfer.dropEffect);
            });
            src.addEventListener('click', function (e) {
                var parObj = this.parentNode;
                if(parObj === dragadd_o.sourcebox) {
                    var curTgt = null;
                    for(i = 0; i < dragadd_o.target.length; i++) {
                        if(dragadd_o.target[i].childElementCount == 0) {
                            curTgt = dragadd_o.target[i];
                            break;
                        }
                    }
                    if(curTgt == null) return;
                    var newObj = this.cloneNode(true);
                    curTgt.appendChild(newObj);
                }
            });
            dragadd_o.source.push(src);
        }
    },
    setSourceWitButton: function(srcid, buttonid) {
        var src = document.getElementById(srcid);
        var button = document.getElementById(buttonid);
        if(src) {
            src.addEventListener('dragstart', function (e) {
                e.dataTransfer.setData('id', this.id);
            });
            src.addEventListener('drag', function (e) {
                // console.log('src drag');
            });
            src.addEventListener('dragend', function (e) {
                // console.log('src dragend with effect: ' + e.dataTransfer.dropEffect);
            });
            src.addEventListener('click', function (e) {
                var parObj = this.parentNode;
                if(parObj === dragadd_o.sourcebox) {
                    var curTgt = null;
                    for(i = 0; i < dragadd_o.target.length; i++) {
                        if(dragadd_o.target[i].childElementCount == 0) {
                            curTgt = dragadd_o.target[i];
                            break;
                        }
                    }
                    if(curTgt == null) return;
                    var newObj = this.cloneNode(true);
                    curTgt.appendChild(newObj);
                }
            });
            dragadd_o.source.push(src);
        }
        if(button) {
            button.addEventListener('click', function (e) {
                var curTgt = null;
                for(i = 0; i < dragadd_o.target.length; i++) {
                    if(dragadd_o.target[i].childElementCount == 0) {
                        curTgt = dragadd_o.target[i];
                        break;
                    }
                }
                if(curTgt == null) return;
                var newObj = src.cloneNode(true);
                curTgt.appendChild(newObj);
                if(dragadd_o.isnexton) {
                    if(curTgt.classList.contains('on')) curTgt.classList.remove('on');
                    dragadd_o.procNextOn();
                }
            });
        }
    },
    setSourceBox: function(srcboxid) {
        dragadd_o.sourcebox = document.getElementById(srcboxid);
    },
    setTrashBin: function(binid) {
        var trashbin = document.getElementById(binid);
        if(trashbin){
            trashbin.addEventListener('dragenter', function (e) {
                e.preventDefault();
                e.stopPropagation(); // stop it here to prevent it bubble up
            });
            trashbin.addEventListener('dragover', function (e) {
                e.preventDefault(); // allows us to drop
                e.stopPropagation(); // stop it here to prevent it bubble up
            });
            trashbin.addEventListener('dragexit', function (e) {
                e.stopPropagation(); // stop it here to prevent it bubble up
            });
            trashbin.addEventListener('dragleave', function (e) {
                e.stopPropagation(); // stop it here to prevent it bubble up
            });
            trashbin.addEventListener('drop', function (e) {
                e.stopPropagation(); // stop it here to prevent it bubble up

                var curTgt = null;
                for(i = 0; i < dragadd_o.target.length; i++) {
                    if(dragadd_o.target[i].id == e.dataTransfer.getData('id')) {
                        curTgt = dragadd_o.target[i];
                        break;
                    }
                }
                if(curTgt == null) return;

                var imgObj = curTgt.firstChild;
                if(imgObj) {
                    curTgt.removeChild(imgObj);
                }
            });
            trashbin.addEventListener('click', function (e) {
                var curTgt = null;
                for(i = dragadd_o.target.length - 1; i >= 0; i--) {
                    if(dragadd_o.target[i].childElementCount > 0) {
                        curTgt = dragadd_o.target[i];
                        break;
                    }
                }
                if(curTgt == null) return;

                var imgObj = curTgt.firstChild;
                if(imgObj) {
                    curTgt.removeChild(imgObj);
                }
            });
            dragadd_o.trashbin = trashbin;
        }
    },
    setNextOn: function(isnexton) {
        dragadd_o.isnexton = isnexton;
    },
    removeAllOn: function() {
        for(i = 0; i < dragadd_o.target.length; i++) {
            curTgt = dragadd_o.target[i];
            if(curTgt.classList.contains('on')) curTgt.classList.remove('on');
        }
    },    
    procNextOn: function() {
        var curTgt = null;
        for(i = 0; i < dragadd_o.target.length; i++) {
            if(dragadd_o.target[i].childElementCount == 0) {
                curTgt = dragadd_o.target[i];
                break;
            }
        }
        if(curTgt == null) return;

        if(!curTgt.classList.contains('on')) curTgt.classList.add('on');
    },
};

var drawing_o = {
    leftObj: [],
    rightObj: [],
    canvas: null,
    ctx: null,
    _lines: [], // {sx: 0, sy: 0, ex: 0, ey: 0, drawed: false, lpos: -1, rpos: -1}
    _leftPos: [], // {x: 0, y: 0, w: 0, h: 0}
    _rightPos: [], // {x: 0, y: 0, w: 0, h: 0}
    rect: null,
    dot_w: 10,
    dot_h: 10,
    _pid: -1,
    cur: null,
    idx: -1,
    direction: 0,   
    setObject: function (objid, position) {
        var obj = document.getElementById(objid);
        if(obj) {
            if(position == 'l' || position == 't') drawing_o.leftObj.push(obj);
            else if(position == 'r' || position == 'b') drawing_o.rightObj.push(obj);
        }
    },
    init: function(canvasid, boxid) {
        drawing_o.canvas = document.getElementById(canvasid);
        if(drawing_o.canvas.getContext) {
            drawing_o.ctx = drawing_o.canvas.getContext('2d');
            var hidpi = drawing_o.canvas.getAttribute('hidpi');
            var ratio = 1;
            if (hidpi && !/^off|false$/.test(hidpi)) {
                var deviceRatio = window.devicePixelRatio || 1;
                var backingStoreRatio = drawing_o.ctx['webkitBackingStorePixelRatio'] || drawing_o.ctx['backingStorePixelRatio'] || 1; // tslint:disable-line
                ratio = devicePixelRatio / backingStoreRatio;
                drawing_o.ctx.scale(ratio, ratio);
            }
        }
        
        var box = document.getElementById(boxid);
        if(box && box.getBoundingClientRect) drawing_o.rect = box.getBoundingClientRect();

        drawing_o.canvas.width = drawing_o.rect.right - drawing_o.rect.left;
        drawing_o.canvas.height = drawing_o.rect.bottom - drawing_o.rect.top;

        var i = 0;
        for(i = 0; i < drawing_o.leftObj.length; i++) drawing_o.setPosObjs(drawing_o.leftObj[i], 'l');
        for(i = 0; i < drawing_o.rightObj.length; i++) drawing_o.setPosObjs(drawing_o.rightObj[i], 'r');
        if(drawing_o._leftPos.length > 0) {
            for(i = 0; i < drawing_o._leftPos.length; i++) drawing_o._lines.push({sx: 0, sy: 0, ex: 0, ey: 0, drawed: false, lpos: -1, rpos: -1});
        }

        console.log('drawing_o.canvas', drawing_o.canvas, drawing_o.ctx);
        if(drawing_o.canvas && drawing_o.ctx) {
            drawing_o.canvas.addEventListener('pointerdown', function (e) {
                if(drawing_o._pid >= 0) return;
                else if(drawing_o.idx >= drawing_o._lines.length) return;

                drawing_o._pid = e.pointerId;
                try {drawing_o.canvas.setPointerCapture(drawing_o._pid);} catch(e) {}

                var idxLeftPos = -1;
                var idxRightPos = -1;
                drawing_o.direction = 0;
                
                var i = 0;
                for(i = 0; i < drawing_o._leftPos.length; i++) {
                    if((drawing_o._leftPos[i].x - (drawing_o._leftPos[i].w / 2)) <= e.offsetX && (drawing_o._leftPos[i].x + (drawing_o._leftPos[i].w / 2)) > e.offsetX && (drawing_o._leftPos[i].y - (drawing_o._leftPos[i].h / 2)) <= e.offsetY && (drawing_o._leftPos[i].y + (drawing_o._leftPos[i].h / 2)) > e.offsetY) {
                        idxLeftPos = i;
                        break;
                    }
                }
                if(idxLeftPos < 0) {
                    for(i = 0; i < drawing_o._leftPos.length; i++) {
                        if((drawing_o._rightPos[i].x - (drawing_o._rightPos[i].w / 2)) <= e.offsetX && (drawing_o._rightPos[i].x + (drawing_o._rightPos[i].w / 2)) > e.offsetX && (drawing_o._rightPos[i].y - (drawing_o._rightPos[i].h / 2)) <= e.offsetY && (drawing_o._rightPos[i].y + (drawing_o._rightPos[i].h / 2)) > e.offsetY) {
                            idxRightPos = i;
                            break;
                        }
                    }
    
                    if(idxRightPos < 0 ) return;
                    drawing_o.direction = 2;
    
                    // ?????? ????????? ?????? ?????? ??? ?????? ?????????
                    for(i = 0; i < drawing_o._lines.length; i++) {
                        if(idxRightPos === drawing_o._lines[i].rpos && drawing_o._lines[i].drawed) {
                            drawing_o._lines[i].drawed = false;
                            drawing_o._lines[i].rpos = -1;
                            drawing_o._lines[i].lpos = -1;
                            break;
                        }
                    }
                    // ?????? line??? drawing_o.idx ??? ??????
                    drawing_o.idx = -1;
                    for(i = 0; i < drawing_o._lines.length; i++) {
                        if(drawing_o._lines[i].lpos === -1) {
                            drawing_o.idx = i;
                            break;
                        }
                    }
                    if(drawing_o.idx === -1) return;
                    
                    drawing_o.cur = drawing_o._lines[drawing_o.idx];
                    drawing_o.cur.rpos = idxRightPos;
                    drawing_o.cur.lpos = -1;
                    // onDown(e, drawing_o.idx, drawing_o._lines, false);
                    drawing_o.cur.sx = drawing_o._rightPos[idxRightPos].x; 
                    drawing_o.cur.sy = drawing_o._rightPos[idxRightPos].y; 
                    drawing_o.cur.drawed = true;
                } else {
                    drawing_o.direction = 1;
    
                    // ?????? ????????? ?????? ?????? ??? ?????? ?????????
                    for(i = 0; i < drawing_o._lines.length; i++) {
                        if(idxLeftPos === drawing_o._lines[i].lpos) {
                            drawing_o._lines[i].drawed = false;
                            drawing_o._lines[i].rpos = -1;
                            drawing_o._lines[i].lpos = -1;
                            break;
                        }
                    }
                    // ?????? line??? drawing_o.idx ??? ??????
                    drawing_o.idx = -1;
                    for(i = 0; i < drawing_o._lines.length; i++) {
                        if(drawing_o._lines[i].lpos === -1) {
                            drawing_o.idx = i;
                            break;
                        }
                    }
                    if(drawing_o.idx === -1) return;
                    
                    drawing_o.cur = drawing_o._lines[drawing_o.idx];
                    drawing_o.cur.lpos = idxLeftPos;
                    drawing_o.cur.rpos = -1;
                    // onDown(e, drawing_o.idx, drawing_o._lines, true);
        
                    drawing_o.cur.sx = drawing_o._leftPos[idxLeftPos].x;
                    drawing_o.cur.sy = drawing_o._leftPos[idxLeftPos].y;
                    drawing_o.cur.drawed = true;
                }
            });
            drawing_o.canvas.addEventListener('pointermove', function (e) {
                if(drawing_o._pid !== e.pointerId || !drawing_o.cur) return;

                drawing_o.cur.ex = e.offsetX;
                drawing_o.cur.ey = e.offsetY;
                
                drawing_o.f_draw();
            });
            drawing_o.canvas.addEventListener('pointerup',  function (e) {
                if(drawing_o._pid < 0 || drawing_o._pid !== e.pointerId) return;
    
                try {drawing_o.canvas.releasePointerCapture(drawing_o._pid);} catch(e) {}
                drawing_o._pid = -1;
                if(!drawing_o.cur) return;
                if(drawing_o.direction === 0) return;
                if(drawing_o.idx === -1) return;

                var i = 0;
                if(drawing_o.direction === 2) {
                    var idxLeftPos = -1;
                    for(i = 0; i < drawing_o._leftPos.length; i++) {
                        if((drawing_o._leftPos[i].x - (drawing_o._leftPos[i].w / 2)) <= e.offsetX && (drawing_o._leftPos[i].x + (drawing_o._leftPos[i].w / 2)) > e.offsetX && (drawing_o._leftPos[i].y - (drawing_o._leftPos[i].h / 2)) <= e.offsetY && (drawing_o._leftPos[i].y + (drawing_o._leftPos[i].h / 2)) > e.offsetY) {
                            idxLeftPos = i;
                            break;
                        }
                    }
    
                    if(idxLeftPos < 0) {
                        // onCancel(e, drawing_o.idx, drawing_o._lines, false);
                        drawing_o.cur.drawed = false;
                        drawing_o.cur.lpos = -1;
                        drawing_o.cur.rpos = -1;
                        drawing_o.cur.ex = drawing_o.cur.sx;
                        drawing_o.cur.ey = drawing_o.cur.sx;
                        drawing_o.cur = null;
                        drawing_o.f_draw();
                        return;
                    }
    
                    for(i = 0; i < drawing_o._lines.length; i++) {
                        if(i !== drawing_o.idx && idxLeftPos === drawing_o._lines[i].lpos) {
                            drawing_o._lines[i].drawed = false;
                            drawing_o._lines[i].rpos = -1;
                            drawing_o._lines[i].lpos = -1;
                            break;
                        }
                    }
                    drawing_o.cur.lpos = idxLeftPos;
                    drawing_o.cur.ex = drawing_o._leftPos[idxLeftPos].x;
                    drawing_o.cur.ey = drawing_o._leftPos[idxLeftPos].y;
                    drawing_o.cur = null;
                    drawing_o.f_draw();
                    // onUp(e, drawing_o.idx, drawing_o._lines, false);
                } else {
                    var idxRightPos = -1;
                    for(i = 0; i < drawing_o._leftPos.length; i++) {
                        if((drawing_o._rightPos[i].x - (drawing_o._rightPos[i].w / 2)) <= e.offsetX && (_rightPos[i].x + (drawing_o._rightPos[i].w / 2)) > e.offsetX && (drawing_o._rightPos[i].y - (drawing_o._rightPos[i].h / 2)) <= e.offsetY && (_rightPos[i].y + (drawing_o._rightPos[i].h / 2)) > e.offsetY) {
                            idxRightPos = i;
                            break;
                        }
                    }
                    if(idxRightPos < 0) {
                        // onCancel(e, drawing_o.idx, drawing_o._lines, false);
                        drawing_o.cur.drawed = false;
                        drawing_o.cur.lpos = -1;
                        drawing_o.cur.rpos = -1;
                        drawing_o.cur.ex = drawing_o.cur.sx;
                        drawing_o.cur.ey = drawing_o.cur.sx;
                        drawing_o.cur = null;
                        drawing_o.f_draw();
                        return;
                    }
    
                    for(i = 0; i < drawing_o._lines.length; i++) {
                        if(i !== drawing_o.idx && idxRightPos === drawing_o._lines[i].rpos) {
                            drawing_o._lines[i].drawed = false;
                            drawing_o._lines[i].rpos = -1;
                            drawing_o._lines[i].lpos = -1;
                            break;
                        }
                    }
                    drawing_o.cur.rpos = idxRightPos;
                    drawing_o.cur.ex = drawing_o._rightPos[idxRightPos].x;
                    drawing_o.cur.ey = drawing_o._rightPos[idxRightPos].y;
                    drawing_o.cur = null;
                    drawing_o.f_draw();
                    // onUp(e, drawing_o.idx, drawing_o._lines, true);
                }
                drawing_o.direction = 0;
            });
            drawing_o.canvas.addEventListener('pointercancel',  function (e) {
                if(drawing_o._pid < 0 || drawing_o._pid !== e.pointerId) return;

                try {drawing_o.canvas.releasePointerCapture(drawing_o._pid);} catch(e) {}
                drawing_o._pid = -1;
                if(!drawing_o.cur) return;
                if(drawing_o.direction === 0) return;
                if(drawing_o.idx === -1) return;

                if(drawing_o.direction === 2) {
                    // onCancel(e, drawing_o.idx, this.drawing_o._lines, false);
                    drawing_o.cur.drawed = false;
                    drawing_o.cur.lpos = -1;
                    drawing_o.cur.rpos = -1;
                    drawing_o.cur.ex = drawing_o.cur.sx;
                    drawing_o.cur.ey = drawing_o.cur.sx;
                    drawing_o.cur = null;
                    drawing_o.f_draw();
                    return;
                } else {
                    // onCancel(e, drawing_o.idx, this.drawing_o._lines, true);
                    drawing_o.cur.drawed = false;
                    drawing_o.cur.lpos = -1;
                    drawing_o.cur.rpos = -1;
                    drawing_o.cur.ex = drawing_o.cur.sx;
                    drawing_o.cur.ey = drawing_o.cur.sx;
                    drawing_o.cur = null;
                    drawing_o.f_draw();
                    return;
                }
                drawing_o.direction = 0;
            });		
        }
    },
    setPosObjs: function(posobj, position) {
        if(drawing_o.rect == null) return;
        else if(!posobj) return;
        else if(!posobj.getBoundingClientRect) return;

        var pos_rect = posobj.getBoundingClientRect();
        var x = pos_rect.left - drawing_o.rect.left + 3;
        var y = pos_rect.top - drawing_o.rect.top + 3;
        var w = drawing_o.dot_w;
        var h = drawing_o.dot_h;

        if(position == 'l' || position == 't') drawing_o._leftPos.push({x: x, y:y, w:w, h:h});
        else if(position == 'r' || position == 'b') drawing_o._rightPos.push({x:x, y:y, w:w, h:h});
    },
    f_draw: function() {
        if(!drawing_o.ctx) return;

        drawing_o.ctx.clearRect(0, 0, drawing_o.ctx.canvas.width, drawing_o.ctx.canvas.height);
        
        drawing_o.ctx.strokeStyle = '#00b0f0';
        drawing_o.ctx.lineWidth = 2;
        drawing_o.ctx.lineCap = 'round';
        drawing_o._lines.forEach((c, cidx) => {
            if(c.drawed) {
                drawing_o.ctx.beginPath();
                drawing_o.ctx.moveTo(c.sx, c.sy);
                drawing_o.ctx.lineTo(c.ex, c.ey);
                drawing_o.ctx.stroke();
                drawing_o.ctx.closePath();
            }
        });
    }
};

var submit_o = {
    seq: 0,
    types: [],
    objs: [],
    subobjs: [],
    init: function (seq) {
        if(util_o.isNumeric(seq) && seq > 0) submit_o.seq = seq;
        submit_o.types = [];
        submit_o.objs = [];
    },
    setNumberTarget: function (id) {
        if(!id || id == '') return; 
        var obj = document.getElementById(id);
        if(!obj) return; 
        submit_o.types.push('number');
        submit_o.objs.push(obj);
    },
    setTextTarget: function (id) {
        if(!id || id == '') return; 
        var obj = document.getElementById(id);
        if(!obj) return; 
        submit_o.types.push('text');
        submit_o.objs.push(obj);
    },
    setDragDropTarget: function (id) {
        if(!id || id == '') return; 
        var obj = document.getElementById(id);
        if(!obj) return; 
        submit_o.types.push('dragdrop');
        submit_o.objs.push(obj);
    },
    setMDragDropTarget: function (id) {
        if(!id || id == '') return; 
        var obj = document.getElementById(id);
        if(!obj) return; 
        submit_o.types.push('mdragdrop');
        submit_o.objs.push(obj);
    },
    setDragHereTarget: function (id) {
        if(!id || id == '') return; 
        var obj = document.getElementById(id);
        if(!obj) return; 
        submit_o.types.push('draghere');
        submit_o.objs.push(obj);
    },
    setButtonTarget: function (group, ids) {
        if(!ids || ids.length == 0) return; 
        for(var i = 0; i < ids.length; i++) {
            var obj = document.getElementById(ids[i]);
            if(!obj) continue; 
            submit_o.types.push('button ' + group);
            submit_o.objs.push(obj);
        }
    },
    setButtonTargetCount: function (group, ids) {
        if(!ids || ids.length == 0) return; 
        for(var i = 0; i < ids.length; i++) {
            var obj = document.getElementById(ids[i]);
            if(!obj) continue; 
            submit_o.types.push('buttoncount ' + group);
            submit_o.objs.push(obj);
        }
    },
    setDragAddTargetsAndSources: function (tgts,srcs) {
        if(!tgts || tgts.length == 0) return; 
        else if(!srcs || srcs.length == 0) return; 
        for(var i = 0; i < tgts.length; i++) {
            submit_o.types.push('dragadd');
            submit_o.objs.push(tgts[i]);
        }
        for(i = 0; i < srcs.length; i++) {
            submit_o.subobjs.push(srcs[i]);
        }
    },
    submit: function () {
        var data = {};
        data.seq = submit_o.seq;
        data.values = []; 
        var j = 0;
        var obj = null;
        var cnt = 0;
        var valueobj = null;
        for(var i = 0; i < submit_o.types.length; i++) {
            if(submit_o.types[i] == 'number' || submit_o.types[i] == 'text'){
                data.values.push({'name': submit_o.objs[i].id, 'value': submit_o.objs[i].value});
            } else if(submit_o.types[i] == 'dragdrop') {
                if(submit_o.objs[i]) cnt = submit_o.objs[i].childElementCount;
                data.values.push({"name": "count", "value": cnt});
            } else if(submit_o.types[i] == 'mdragdrop' || submit_o.types[i] == 'draghere') {
                if(submit_o.objs[i]) {
                    for(j = 0; j < submit_o.objs[i].childElementCount; j++) {
                        obj = submit_o.objs[i].children[j];
                        data.values.push({"group": submit_o.objs[i].id, "name": obj.id, "value": obj.alt});
                    }
                }
            } else if(submit_o.types[i].indexOf('buttoncount') > -1) {
                isbuttoncont = true;
                obj = submit_o.types[i].split(' ');
                if(obj && obj.length > 1) {
                    if(submit_o.objs[i].classList.contains('on')) {
                        valueobj = data.values.find(tmpobj => tmpobj.name === obj[1]);
                        if(valueobj) {
                            valueobj.value += 1; 
                        } else {
                            data.values.push({"name": obj[1], "value": 1});
                        }
                    } else {
                        valueobj = data.values.find(tmpobj => tmpobj.name === obj[1]);
                        if(!valueobj) {
                            data.values.push({"name": obj[1], "value": 0});
                        }
                    }
                } else {
                    if(submit_o.objs[i].classList.contains('on')) {
                        valueobj = data.values.find(tmpobj => tmpobj.name === "");
                        if(valueobj) {
                            valueobj.value += 1; 
                        } else {
                            data.values.push({"name": "", "value": 1});
                        }
                    } else {
                        valueobj = data.values.find(tmpobj => tmpobj.name === "");
                        if(!valueobj) {
                            data.values.push({"name": "", "value": 0});
                        }
                    }
                }
            } else if(submit_o.types[i].indexOf('button') > -1) {
                obj = submit_o.types[i].split(' ');
                if(obj && obj.length > 1) {
                    if(submit_o.objs[i].classList.contains('on')) {
                        data.values.push({"name": obj[1], "value": submit_o.objs[i].value});
                    }
                } else {
                    if(submit_o.objs[i].classList.contains('on')) {
                        data.values.push({"name": "", "value": submit_o.objs[i].value});
                    }
                }
            } else if(submit_o.types[i] == 'dragadd') {
                if(submit_o.objs[i] && submit_o.objs[i].childElementCount > 0) {
                    for(j = 0; j < submit_o.subobjs.length; j++) {
                        if(submit_o.objs[i].firstChild.id === submit_o.subobjs[j].id) {
                            valueobj = data.values.find(tmpobj => tmpobj.name === submit_o.subobjs[j].id);
                            if(valueobj) {
                                valueobj.value += 1; 
                            } else {
                                data.values.push({"name": submit_o.subobjs[j].id, "value": 1});
                            }
                        }
                    }
                } else {
                    for(j = 0; j < submit_o.subobjs.length; j++) {
                        valueobj = data.values.find(tmpobj => tmpobj.name === submit_o.subobjs[j].id);
                        if(!valueobj) {
                            data.values.push({"name": submit_o.subobjs[j].id, "value": 0});
                        }
                    }
                }
            }
        }        

        console.log('submit data', data);
        window.parent.postMessage(data);
    },
};


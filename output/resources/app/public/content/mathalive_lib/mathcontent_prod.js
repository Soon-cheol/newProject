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
    },
    getQuery: function(key){
		var href = window.location.href;
		var arr = href.split("?");
		if(arr.length!=2) return null;
		
		var query = arr[1];
		arr = query.split("&");
		for(var i=0; i<arr.length; i++){
			var arr2 = arr[i].split("=");
			if(arr2.length==2 && arr2[0]==key) return arr2[1];
		}
		return null;
	}
};

var link_o = {
    idx: -1,
    links: [],
    init: function (idx) {
        link_o.idx = idx;
    },
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

var concepttool_o = {
    idx: -1,
    tabs: [],
    btns: [],
    cnts: [],
    seqs: [],
    init: function (idx, btnids, tabids, cntids, seqs) {
        concepttool_o.idx = idx;
        if(!seqs || seqs.length == 0) return;
        for(var i = 0; i < seqs.length; i++) {
            concepttool_o.seqs.push(seqs[i]);
        }
        if(!btnids || btnids.length == 0) return;
        for(i = 0; i < btnids.length; i++) {
            var obj = document.getElementById(btnids[i]);
            if(!obj) continue; 
            concepttool_o.btns.push(obj);
        }
        if(!tabids || tabids.length == 0) return; 
        for(i = 0; i < tabids.length; i++) {
            var tabobj = document.getElementById(tabids[i]);
            if(!tabobj) continue; 
            concepttool_o.tabs.push(tabobj);
        }
        if(!cntids || cntids.length == 0) return; 
        for(i = 0; i < cntids.length; i++) {
            var cntobj = document.getElementById(cntids[i]);
            if(!cntobj) continue; 
            concepttool_o.cnts.push(cntobj);
        }
        console.log(concepttool_o.btns, concepttool_o.tabs, concepttool_o.cnts)
    },
    clickBtn: function (obj) {
        let btnidx = concepttool_o.btns.findIndex(item => item.id == obj.id);
        if(btnidx < 0) return;

        let msg = { seq: concepttool_o.seqs[btnidx] };
        sendPostMessage("btnclick", msg);
    },
    clickTab: function (obj) {
        if(obj.classList.contains('on')) {
            return;
        }
        let tabidx = -1;
        for(var i = 0; i < concepttool_o.tabs.length; i++) {
            if(obj.id == concepttool_o.tabs[i].id) {
                concepttool_o.tabs[i].classList.add('on');
                if(concepttool_o.cnts[i]) concepttool_o.cnts[i].style.display = "block";
                tabidx = i;
            } else {
                concepttool_o.tabs[i].classList.remove('on');
                if(concepttool_o.cnts[i]) concepttool_o.cnts[i].style.display = "none";
            }    
        }
        if(tabidx > -1) {
            let msg = { seq: concepttool_o.seqs[tabidx] };
            sendPostMessage("tabclick", msg);
        }
    }
};

var choicebtn_o = {
    idx: -1,
    objs: [],
    userobjs: [],
    completed: false,
    init: function (idx, ids, userids) {
        choicebtn_o.idx = idx;
        if(!ids || ids.length == 0) return; 
        for(var i = 0; i < ids.length; i++) {
            var obj = document.getElementById(ids[i]);
            if(!obj) continue; 
            choicebtn_o.objs.push(obj);
        }
        if(!userids || userids.length == 0) return; 
        for(i = 0; i < userids.length; i++) {
            var userobj = document.getElementById(userids[i]);
            if(!userobj) continue; 
            choicebtn_o.userobjs.push(userobj);
        }
    },
    click: function (obj) {
        if(choicebtn_o.completed) return;
        if(obj.classList.contains('on')) {
            obj.classList.remove('on');
            return;
        }
        for(var i = 0; i < choicebtn_o.objs.length; i++) {
            if(obj.id == choicebtn_o.objs[i].id) choicebtn_o.objs[i].classList.add('on');
            else choicebtn_o.objs[i].classList.remove('on');
        }
    }, 
    submit: function (obj) {
        if(choicebtn_o.completed) return;
        if(obj.classList.contains('on')) {
            // obj.classList.remove('on');
            return;
        }
        var choicedValue = null;
        var choicedIdx = -1;
        for(var i = 0; i < choicebtn_o.objs.length; i++) {
            if(obj.id == choicebtn_o.objs[i].id) {
                choicebtn_o.objs[i].classList.add('on');
                choicedValue = choicebtn_o.objs[i].value;
                choicedIdx = i;
            } else choicebtn_o.objs[i].classList.remove('on');
        }
        if(choicedValue != null) {
            msg = {};
            msg.contentType = "choice";
            msg.choicedIdx = choicedIdx;
            msg.choicedValue = choicedValue;
            sendPostMessage("submit", msg);
        }
    },
    setConmpeted: function (completed) {
        console.log('====> setConmpeted completed', completed);
        choicebtn_o.completed = completed;
    },
    reset: function () {
        for(var i = 0; i < choicebtn_o.objs.length; i++) {
            if(choicebtn_o.objs[i].classList.contains('on')) choicebtn_o.objs[i].classList.remove('on');
        }
    },
    showUsers: function(choicedusers) {
        console.log('====> showUsers', choicedusers);
        if(!choicedusers || choicedusers.length == 0) {
            for(var i = 0; i < choicebtn_o.userobjs.length; i++) {
                choicebtn_o.userobjs[i].innerHTML = '0';
                choicebtn_o.userobjs[i].classList.add('show');
            }
            return;
        }
        for(var i = 0; i < choicebtn_o.userobjs.length; i++) {
            var choiceduser = choicedusers.find(item => item.choicedIdx == i);
            if(choiceduser) choicebtn_o.userobjs[i].innerHTML = '' + choiceduser.users;
            else choicebtn_o.userobjs[i].innerHTML = '0';
            choicebtn_o.userobjs[i].classList.add('show');
        }
    },
    showAnswer: function(answer) {
        console.log('====> showAnswer', answer);
        for(var i = 0; i < choicebtn_o.objs.length; i++) {
            if(parseInt(choicebtn_o.objs[i].value) !== answer) choicebtn_o.objs[i].disabled = 'true';
        }
    }
};

var mchoicebtn_o = {
    idx: -1,
    objs: [],
    userobjs: [],
    completed: false,
    init: function (idx, ids, userids) {
        mchoicebtn_o.idx = idx;
        if(!ids || ids.length == 0) return; 
        for(var i = 0; i < ids.length; i++) {
            var obj = document.getElementById(ids[i]);
            if(!obj) continue; 
            mchoicebtn_o.objs.push(obj);
        }
        if(!userids || userids.length == 0) return; 
        for(i = 0; i < userids.length; i++) {
            var userobj = document.getElementById(userids[i]);
            if(!userobj) continue; 
            mchoicebtn_o.userobjs.push(userobj);
        }
    },
    click: function (obj) {
        if(mchoicebtn_o.completed) return;
        if(obj.classList.contains('on')) {
            obj.classList.remove('on');
            mchoicebtn_o.send();
            return;
        }
        for(var i = 0; i < mchoicebtn_o.objs.length; i++) {
            if(obj.id == mchoicebtn_o.objs[i].id) mchoicebtn_o.objs[i].classList.add('on');
        }
        mchoicebtn_o.send();
    }, 
    submit: function (obj) {
        if(mchoicebtn_o.completed) return;
        if(obj.classList.contains('on')) {
            obj.classList.remove('on');
            mchoicebtn_o.send();
            return;
        }
        for(var i = 0; i < mchoicebtn_o.objs.length; i++) {
            if(obj.id == mchoicebtn_o.objs[i].id) mchoicebtn_o.objs[i].classList.add('on');
        }
        mchoicebtn_o.send();
    },
    setConmpeted: function (completed) {
        console.log('====> setConmpeted completed', completed);
        mchoicebtn_o.completed = completed;
    },
    send: function () {
        var idxs = [];
        var values = [];
        for(var i = 0; i < mchoicebtn_o.objs.length; i++) {
            if(mchoicebtn_o.objs[i].classList.contains('on')) {
                idxs.push(i);
                values.push(mchoicebtn_o.objs[i].value);
            }
        }
        if(idxs.length > 0 && values.length > 0) {
            msg = {};
            msg.contentType = "mchoice";
            msg.choicedIdx = idxs;
            msg.choicedValue = values;
            console.log('===> mchoicebtn msg', msg);
            sendPostMessage("submit", msg);
        }
    },
    reset: function () {
        for(var i = 0; i < mchoicebtn_o.objs.length; i++) {
            if(mchoicebtn_o.objs[i].classList.contains('on')) mchoicebtn_o.objs[i].classList.remove('on');
        }
    },
    showUsers: function(choicedusers) {
        if(!choicedusers || choicedusers.length == 0) {
            for(var i = 0; i < mchoicebtn_o.userobjs.length; i++) {
                mchoicebtn_o.userobjs[i].innerHTML = '0';
                mchoicebtn_o.userobjs[i].classList.add('show');
            }
            return;
        }
        for(var i = 0; i < mchoicebtn_o.userobjs.length; i++) {
            var choiceduser = choicedusers.find(item => item.choicedIdx == i);
            if(choiceduser) mchoicebtn_o.userobjs[i].innerHTML = '' + choiceduser.users;
            else mchoicebtn_o.userobjs[i].innerHTML = '0';
            mchoicebtn_o.userobjs[i].classList.add('show');
        }
    }
};

var mchoicecntbtn_o = {
    idx: -1,
    objs: [],
    userobjs: [],
    completed: false,
    init: function (idx, ids, userids) {
        mchoicecntbtn_o.idx = idx;
        if(!ids || ids.length == 0) return; 
        for(var i = 0; i < ids.length; i++) {
            var obj = document.getElementById(ids[i]);
            if(!obj) continue; 
            mchoicecntbtn_o.objs.push(obj);
        }
        if(!userids || userids.length == 0) return; 
        for(i = 0; i < userids.length; i++) {
            var userobj = document.getElementById(userids[i]);
            if(!userobj) continue; 
            mchoicecntbtn_o.userobjs.push(userobj);
        }
    },
    click: function (obj) {
        if(mchoicecntbtn_o.completed) return;
        if(obj.classList.contains('on')) {
            obj.classList.remove('on');
            mchoicecntbtn_o.send();
            return;
        }
        for(var i = 0; i < mchoicecntbtn_o.objs.length; i++) {
            if(obj.id == mchoicecntbtn_o.objs[i].id) mchoicecntbtn_o.objs[i].classList.add('on');
        }
        mchoicecntbtn_o.send();
    }, 
    submit: function (obj) {
        if(mchoicecntbtn_o.completed) return;
        if(obj.classList.contains('on')) {
            obj.classList.remove('on');
            mchoicecntbtn_o.send();
            return;
        }
        for(var i = 0; i < mchoicecntbtn_o.objs.length; i++) {
            if(obj.id == mchoicecntbtn_o.objs[i].id) mchoicecntbtn_o.objs[i].classList.add('on');
        }
        mchoicecntbtn_o.send();
    },
    setConmpeted: function (completed) {
        console.log('====> setConmpeted completed', completed);
        mchoicecntbtn_o.completed = completed;
    },
    send: function () {
        var cnt = 0;
        for(var i = 0; i < mchoicecntbtn_o.objs.length; i++) {
            if(mchoicecntbtn_o.objs[i].classList.contains('on')) cnt++;
        }
        msg = {};
        msg.contentType = "mchoicecnt";
        msg.choicedIdx = 0;
        msg.choicedValue = cnt + "";
        console.log('===> mchoicecntbtn msg', msg);
        sendPostMessage("submit", msg);
    },
    reset: function () {
        for(var i = 0; i < mchoicecntbtn_o.objs.length; i++) {
            if(mchoicecntbtn_o.objs[i].classList.contains('on')) mchoicecntbtn_o.objs[i].classList.remove('on');
        }
    },
    showUsers: function(choicedusers) {
        console.log('====> showUsers', choicedusers);
        if(!choicedusers || choicedusers.length == 0) {
            for(var i = 0; i < mchoicecntbtn_o.userobjs.length; i++) {
                mchoicecntbtn_o.userobjs[i].innerHTML = '0';
                mchoicecntbtn_o.userobjs[i].classList.add('show');
            }
            return;
        }
        for(var i = 0; i < mchoicecntbtn_o.userobjs.length; i++) {
            var choiceduser = choicedusers.find(item => item.choicedIdx == i);
            if(choiceduser) mchoicecntbtn_o.userobjs[i].innerHTML = '' + choiceduser.users;
            else mchoicecntbtn_o.userobjs[i].innerHTML = '0';
            mchoicecntbtn_o.userobjs[i].classList.add('show');
        }
    }
};

var numpad_o = {
    idx: -1,
    selector: null,
    value: '',
    target : null,
    max: 1, // max allowed characters
    pos: 'left',
    completed: false,
    targets: [],
    init: function (idx) {
        numpad_o.idx = idx;
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
        append('←', numpad_o.delete);
        append(0, numpad_o.digit);
        append('✓', numpad_o.select);
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
        numpad_o.send();  
        numpad_o.hide();
    },
    show: function (evt) {
        if(numpad_o.completed) return;
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
            target.dataset.seq = opt.seq;
            numpad_o.value = target.value;
            target.addEventListener("click", numpad_o.show);

            numpad_o.targets.push(target);
        } else {
            console.log(opt.id + " NOT FOUND!");
        }

    },
    setConmpeted: function (completed) {
        console.log('====> setConmpeted completed', completed);
        numpad_o.completed = completed;
        numpad_o.hide();
    },
    send: function () {
        var idxs = [];
        var values = [];
        for(var i = 0; i < numpad_o.targets.length; i++) {
            if(numpad_o.targets[i].value != '') {
                idxs.push(i);
                values.push(numpad_o.targets[i].value);
            }
        }
        if(idxs.length > 0 && values.length > 0) {
            msg = {};
            msg.contentType = "numpad";
            msg.choicedIdx = idxs;
            msg.choicedValue = values;
            console.log('===> numpad msg', msg);
            sendPostMessage("submit", msg);
        }
    },
    reset: function () {
        numpad_o.hide();
        for(var i = 0; i < numpad_o.targets.length; i++) {
            if(numpad_o.targets[i].value != '') numpad_o.targets[i].value = '';
        }
    },
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

var mdragdropcard_o = {
    idx: -1,
    target: [],
    source: [],
    sourcebox: null,
    completed: false,
    setIndex: function(idx) {
        mdragdropcard_o.idx = idx;
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
                console.log('target drop')
                if(mdragdropcard_o.completed) return;
                else if(this.childElementCount > 0) return;

                var curSrc = null;
                for(i = 0; i < mdragdropcard_o.source.length; i++) {
                    if(mdragdropcard_o.source[i].src.id == e.dataTransfer.getData('id')) {
                        curSrc = mdragdropcard_o.source[i].src;
                        break;
                    }
                }
                if(curSrc) {
                    curSrc.parentNode.removeChild(curSrc);
                    this.appendChild(curSrc);
                    mdragdropcard_o.send();
                }
            });
            tgt.addEventListener('click', function (e) {
                if(mdragdropcard_o.completed) return;
                else if(this.childElementCount == 0) return;
                else if (mdragdropcard_o.sourcebox == null) return;
                
                var imgObj = this.firstChild;
                if(imgObj) {
                    var srccard = null;
                    for(i = 0; i < mdragdropcard_o.source.length; i++) {
                        if(mdragdropcard_o.source[i].src.id == imgObj.id) {
                            srccard = mdragdropcard_o.source[i].srccard;
                            break;
                        }
                    }
                    if(srccard) {
                        this.removeChild(imgObj);
                        srccard.appendChild(imgObj);
                        mdragdropcard_o.send();
                    }
                }
            });
            mdragdropcard_o.target.push(tgt);
        }
    }, 
    setSource: function(srcid, srccardid) {
        var src = document.getElementById(srcid);
        var srccard = document.getElementById(srccardid);
        if(src) {
            src.addEventListener('dragstart', function (e) {
                if(mdragdropcard_o.completed) return;
                e.dataTransfer.setData('id', this.id);
            });
            src.addEventListener('drag', function (e) {
                // console.log('src drag');
            });
            src.addEventListener('dragend', function (e) {
                // console.log('src dragend with effect: ' + e.dataTransfer.dropEffect);
            });
            src.addEventListener('click', function (e) {
                if(mdragdropcard_o.completed) return;
                var parObj = this.parentNode.parentNode;
                if(parObj !== mdragdropcard_o.sourcebox) return;

                var curTgt = null;
                for(var i = 0; i < mdragdropcard_o.target.length; i++) {
                    if(mdragdropcard_o.target[i].childElementCount == 0) {
                        curTgt = mdragdropcard_o.target[i];
                        break;
                    }
                }
                if(curTgt == null) return;

                this.parentNode.removeChild(this);
                curTgt.appendChild(this);
                mdragdropcard_o.send();
            });
            mdragdropcard_o.source.push({src: src, srccard: srccard});
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
                console.log('source drop')
                if(mdragdropcard_o.completed) return;
                var srcid = e.dataTransfer.getData('id');
                if(srcid == undefined || srcid == null) return;

                var curTgt = null;
                var curSrc = null;
                var curSrcCard = null;
                for(var i = 0; i < mdragdropcard_o.source.length; i++) {
                    if(mdragdropcard_o.source[i].src.id == srcid) {
                        curSrc = mdragdropcard_o.source[i].src;
                        curSrcCard = mdragdropcard_o.source[i].srccard;
                        break;
                    }
                }
                if(curSrc != null && curSrcCard != null) {
                    for(i = 0; i < mdragdropcard_o.target.length; i++) {
                       if(mdragdropcard_o.target[i].childElementCount > 0) {
                            var obj = mdragdropcard_o.target[i].firstChild;
                            if(obj && obj.id == srcid) {
                                curTgt = mdragdropcard_o.target[i];
                                break;
                            }
                        }
                        if(curTgt) break;
                    }
                    if(curTgt != null) {
                        curTgt.removeChild(curSrc);
                        curSrcCard.appendChild(curSrc);
                        mdragdropcard_o.send();
                    }
                } 
            });
            mdragdropcard_o.sourcebox = srcbox;
        }
    },
    setConmpeted: function (completed) {
        console.log('====> setConmpeted completed', completed);
        mdragdropcard_o.completed = completed;
    },
    send: function () {
        var idxs = [];
        var values = [];
        for(i = 0; i < mdragdropcard_o.target.length; i++) {
            if(mdragdropcard_o.target[i].childElementCount == 0) continue;
            var obj = mdragdropcard_o.target[i].firstChild;
            var idx = null;
            if(obj) {
                for(var j = 0; j < mdragdropcard_o.source.length; j++) {
                    if(mdragdropcard_o.source[j].src.id == obj.id) {
                        idx = j;
                        break;
                    }
                }
                if(idx != null && obj.alt != null) {
                    idxs.push(idx);
                    values.push(obj.alt);
                }
            }
        }
        if(idxs.length > 0 && values.length > 0) {
            msg = {};
            msg.contentType = "mdragdropcard";
            msg.choicedIdx = idxs;
            msg.choicedValue = values;
            console.log('===> mdragdropcard msg', msg);
            sendPostMessage("submit", msg);
        }
    },
    reset: function () {
        for(i = 0; i < mdragdropcard_o.target.length; i++) {
            if(mdragdropcard_o.target[i].childElementCount > 0) {
                var imgObj = mdragdropcard_o.target[i].firstChild;
                for(j = 0; j < mdragdropcard_o.source.length; j++) {
                    var srccard = null;
                    if(mdragdropcard_o.source[j].src.id == imgObj.id) {
                        srccard = mdragdropcard_o.source[j].srccard;
                        mdragdropcard_o.target[i].removeChild(imgObj);
                        srccard.appendChild(imgObj);
                        console.log('srccard', i, j, srccard)
                    }
                }
            }
        }        
    }, 
};

var mdragdrop_o = {
    target: [],
    source: [],
    sourcebox: null,
    multianswer: false,
    isscrcard: false,
    completed: false,
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
                // else if (mdragdrop_o.multianswer) return;
                
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
    setConmpeted: function (completed) {
        console.log('====> setConmpeted completed', completed);
        mdragdrop_o.completed = completed;
    },
    reset: function () {
        // for(var i = 0; i < mdragdrop_o.objs.length; i++) {
        //     if(mdragdrop_o.objs[i].classList.contains('on')) choicebtn_o.objs[i].classList.remove('on');
        // }
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
    idx: -1,
    leftPointObj: [],
    rightPointObj: [],
    leftBoxObj: [],
    rightBoxObj: [],
    box: null,
    canvas: null,
    ctx: null,
    _lines: [], // {sx: 0, sy: 0, ex: 0, ey: 0, drawed: false, lpos: -1, rpos: -1}
    _leftPos: [], // {x: 0, y: 0, w: 0, h: 0}
    _rightPos: [], // {x: 0, y: 0, w: 0, h: 0}
    _leftBox: [], // {x: 0, y: 0, w: 0, h: 0}
    _rightBox: [], // {x: 0, y: 0, w: 0, h: 0}
    rect: null,
    _pid: -1,
    cur: null,
    choicedIdx: -1,
    direction: 0,
    completed: false,
    setIndex: function(idx) {
        drawing_o.idx = idx;
    },
    setObject: function (pointid, boxid, position) {
        var pointobj = document.getElementById(pointid);
        if(pointobj) {
            if(position == 'l' || position == 't') drawing_o.leftPointObj.push(pointobj);
            else if(position == 'r' || position == 'b') drawing_o.rightPointObj.push(pointobj);
        }
        var boxobj = document.getElementById(boxid);
        if(boxobj) {
            if(position == 'l' || position == 't') drawing_o.leftBoxObj.push(boxobj);
            else if(position == 'r' || position == 'b') drawing_o.rightBoxObj.push(boxobj);
        }
    },
    setCanvas: function (canvasid) {
        drawing_o.canvas = document.getElementById(canvasid);
    },
    setDrawingBox: function (boxid) {
        drawing_o.box = document.getElementById(boxid);
    },
    send: function () {
        var idxs = [];
        var values = [];
        var lines = drawing_o._lines.sort((a, b) => {
            if (a.lpos < b.lpos) return -1;
            else if (a.lpos > b.lpos) return 1;
            return 0;
        }); 
        for(i = 0; i < lines.length; i++) {
            var line = lines[i];
            if(line.drawed && line.lpos > -1 && line.rpos > -1) {
                idxs.push(line.lpos);
                values.push((line.rpos + 1) + ''); // 1 부터 시작
            }
        }
        if(idxs.length > 0 && values.length > 0) {
            msg = {};
            msg.contentType = "drawing";
            msg.choicedIdx = idxs;
            msg.choicedValue = values;
            console.log('===> drawing msg', msg);
            sendPostMessage("submit", msg);
        }
    },
    init: function() {
        if(!drawing_o.canvas || !drawing_o.box) return;

        if(drawing_o.canvas.getContext) {
            drawing_o.ctx = drawing_o.canvas.getContext('2d');
            var hidpi = drawing_o.canvas.getAttribute('hidpi');
            var ratio = 1;
            var deviceRatio = window.devicePixelRatio || 1;
            var backingStoreRatio;
            if (drawing_o.ctx && deviceRatio > 0) {
                backingStoreRatio = drawing_o.ctx['webkitBackingStorePixelRatio'] || drawing_o.ctx['backingStorePixelRatio'] || 1; // tslint:disable-line
                ratio = deviceRatio / backingStoreRatio;
                drawing_o.ctx.scale(ratio, ratio);
            } else if (hidpi && !/^off|false$/.test(hidpi)) {                
                backingStoreRatio = drawing_o.ctx['webkitBackingStorePixelRatio'] || drawing_o.ctx['backingStorePixelRatio'] || 1; // tslint:disable-line
                ratio = devicePixelRatio / backingStoreRatio;
                drawing_o.ctx.scale(ratio, ratio);
            }
       }

        if(drawing_o.box.getBoundingClientRect) drawing_o.rect = drawing_o.box.getBoundingClientRect();
        drawing_o.canvas.width = drawing_o.rect.right - drawing_o.rect.left;
        drawing_o.canvas.height = drawing_o.rect.bottom - drawing_o.rect.top;

        var i = 0;
        drawing_o._leftBox = [];
        drawing_o._rightBox = [];
        drawing_o._leftPos = [];
        drawing_o._rightPos = [];
        drawing_o._lines = [];
        for(i = 0; i < drawing_o.leftPointObj.length; i++) drawing_o.setPosObjs(drawing_o.leftPointObj[i], 'l');
        for(i = 0; i < drawing_o.rightPointObj.length; i++) drawing_o.setPosObjs(drawing_o.rightPointObj[i], 'r');
        for(i = 0; i < drawing_o.leftBoxObj.length; i++) drawing_o.setBoxObjs(drawing_o.leftBoxObj[i], 'l');
        for(i = 0; i < drawing_o.rightBoxObj.length; i++) drawing_o.setBoxObjs(drawing_o.rightBoxObj[i], 'r');
        if(drawing_o._leftPos.length > 0) {
            for(i = 0; i < drawing_o._leftPos.length; i++) drawing_o._lines.push({sx: 0, sy: 0, ex: 0, ey: 0, drawed: false, lpos: -1, rpos: -1});
        }

        if(drawing_o.canvas && drawing_o.ctx) {
            drawing_o.canvas.addEventListener('pointerdown', function (e) {
                if(drawing_o._pid >= 0) return;
                if(drawing_o.choicedIdx >= drawing_o._lines.length) return;

                drawing_o._pid = e.pointerId;
                try {drawing_o.canvas.setPointerCapture(drawing_o._pid);} catch(e) {}

                var idxLeftPos = -1;
                var idxRightPos = -1;
                drawing_o.direction = 0;
                
                var i = 0;
                for(i = 0; i < drawing_o._leftPos.length; i++) {
                    if((drawing_o._leftPos[i].x - (drawing_o._leftPos[i].w / 2)) <= e.offsetX 
                    && (drawing_o._leftPos[i].x + (drawing_o._leftPos[i].w / 2)) > e.offsetX 
                    && (drawing_o._leftPos[i].y - (drawing_o._leftPos[i].h / 2)) <= e.offsetY 
                    && (drawing_o._leftPos[i].y + (drawing_o._leftPos[i].h / 2)) > e.offsetY) {
                        idxLeftPos = i;
                        break;
                    } else if((drawing_o._leftBox[i].x - (drawing_o._leftBox[i].w / 2)) <= e.offsetX 
                    && (drawing_o._leftBox[i].x + (drawing_o._leftBox[i].w / 2)) > e.offsetX 
                    && (drawing_o._leftBox[i].y - (drawing_o._leftBox[i].h / 2)) <= e.offsetY 
                    && (drawing_o._leftBox[i].y + (drawing_o._leftBox[i].h / 2)) > e.offsetY) {
                        idxLeftPos = i;
                        break;
                    }
                }
                if(idxLeftPos < 0) {
                    for(i = 0; i < drawing_o._leftPos.length; i++) {
                        if((drawing_o._rightPos[i].x - (drawing_o._rightPos[i].w / 2)) <= e.offsetX 
                        && (drawing_o._rightPos[i].x + (drawing_o._rightPos[i].w / 2)) > e.offsetX 
                        && (drawing_o._rightPos[i].y - (drawing_o._rightPos[i].h / 2)) <= e.offsetY 
                        && (drawing_o._rightPos[i].y + (drawing_o._rightPos[i].h / 2)) > e.offsetY) {
                            idxRightPos = i;
                            break;
                        } else if((drawing_o._rightBox[i].x - (drawing_o._rightBox[i].w / 2)) <= e.offsetX 
                        && (drawing_o._rightBox[i].x + (drawing_o._rightBox[i].w / 2)) > e.offsetX 
                        && (drawing_o._rightBox[i].y - (drawing_o._rightBox[i].h / 2)) <= e.offsetY 
                        && (drawing_o._rightBox[i].y + (drawing_o._rightBox[i].h / 2)) > e.offsetY) {
                            idxRightPos = i;
                            break;
                        }
                    }
                    if(idxRightPos < 0 ) return;
                    drawing_o.direction = 2;
    
                    // 같은 위치에 있던 이전 선 정보 지우기
                    for(i = 0; i < drawing_o._lines.length; i++) {
                        if(idxRightPos === drawing_o._lines[i].rpos && drawing_o._lines[i].drawed) {
                            drawing_o._lines[i].drawed = false;
                            drawing_o._lines[i].rpos = -1;
                            drawing_o._lines[i].lpos = -1;
                            break;
                        }
                    }
                    // 다시 line의 drawing_o.choicedIdx 를 선정
                    drawing_o.choicedIdx = -1;
                    for(i = 0; i < drawing_o._lines.length; i++) {
                        if(drawing_o._lines[i].lpos === -1) {
                            drawing_o.choicedIdx = i;
                            break;
                        }
                    }
                    if(drawing_o.choicedIdx === -1) return;
                    
                    drawing_o.cur = drawing_o._lines[drawing_o.choicedIdx];
                    drawing_o.cur.rpos = idxRightPos;
                    drawing_o.cur.lpos = -1;
                    // onDown(e, drawing_o.choicedIdx, drawing_o._lines, false);
                    drawing_o.cur.sx = drawing_o._rightPos[idxRightPos].x; 
                    drawing_o.cur.sy = drawing_o._rightPos[idxRightPos].y; 
                    drawing_o.cur.drawed = true;
                } else {
                    drawing_o.direction = 1;
    
                    // 같은 위치에 있던 이전 선 정보 지우기
                    for(i = 0; i < drawing_o._lines.length; i++) {
                        if(idxLeftPos === drawing_o._lines[i].lpos) {
                            drawing_o._lines[i].drawed = false;
                            drawing_o._lines[i].rpos = -1;
                            drawing_o._lines[i].lpos = -1;
                            break;
                        }
                    }
                    // 다시 line의 drawing_o.choicedIdx 를 선정
                    drawing_o.choicedIdx = -1;
                    for(i = 0; i < drawing_o._lines.length; i++) {
                        if(drawing_o._lines[i].lpos === -1) {
                            drawing_o.choicedIdx = i;
                            break;
                        }
                    }
                    if(drawing_o.choicedIdx === -1) return;
                    
                    drawing_o.cur = drawing_o._lines[drawing_o.choicedIdx];
                    drawing_o.cur.lpos = idxLeftPos;
                    drawing_o.cur.rpos = -1;
                    // onDown(e, drawing_o.choicedIdx, drawing_o._lines, true);
                    drawing_o.cur.sx = drawing_o._leftPos[idxLeftPos].x;
                    drawing_o.cur.sy = drawing_o._leftPos[idxLeftPos].y;
                    drawing_o.cur.drawed = true;
                }
            });
            drawing_o.canvas.addEventListener('pointermove', function (e) {
                if(drawing_o._pid !== e.pointerId) return;
                if(!drawing_o.cur) return;

                drawing_o.cur.ex = e.offsetX;
                drawing_o.cur.ey = e.offsetY;
                
                drawing_o.f_draw();
            });
            drawing_o.canvas.addEventListener('pointerup',  function (e) {
                if(drawing_o._pid < 0 || drawing_o._pid !== e.pointerId) return;
    
                try {drawing_o.canvas.releasePointerCapture(drawing_o._pid);} catch(e) {}
                drawing_o._pid = -1;

                if(!drawing_o.cur) return;
                //if(drawing_o.direction === 0) return;
                if(drawing_o.choicedIdx === -1) return;

                var i = 0;
                if(drawing_o.direction === 2) {
                    var idxLeftPos = -1;
                    for(i = 0; i < drawing_o._leftPos.length; i++) {
                        if((drawing_o._leftPos[i].x - (drawing_o._leftPos[i].w / 2)) <= e.offsetX 
                        && (drawing_o._leftPos[i].x + (drawing_o._leftPos[i].w / 2)) > e.offsetX 
                        && (drawing_o._leftPos[i].y - (drawing_o._leftPos[i].h / 2)) <= e.offsetY 
                        && (drawing_o._leftPos[i].y + (drawing_o._leftPos[i].h / 2)) > e.offsetY) {
                            idxLeftPos = i;
                            break;
                        } else if((drawing_o._leftBox[i].x - (drawing_o._leftBox[i].w / 2)) <= e.offsetX 
                        && (drawing_o._leftBox[i].x + (drawing_o._leftBox[i].w / 2)) > e.offsetX 
                        && (drawing_o._leftBox[i].y - (drawing_o._leftBox[i].h / 2)) <= e.offsetY 
                        && (drawing_o._leftBox[i].y + (drawing_o._leftBox[i].h / 2)) > e.offsetY) {
                            idxLeftPos = i;
                            break;
                        }
                    }
    
                    if(idxLeftPos < 0) {
                        drawing_o.send();
                        // onCancel(e, drawing_o.choicedIdx, drawing_o._lines, false);
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
                        if(i !== drawing_o.choicedIdx && idxLeftPos === drawing_o._lines[i].lpos) {
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
                    // onUp(e, drawing_o.choicedIdx, drawing_o._lines, false);
                    drawing_o.send();
                    
                } else {
                    var idxRightPos = -1;
                    for(i = 0; i < drawing_o._leftPos.length; i++) {
                        if((drawing_o._rightPos[i].x - (drawing_o._rightPos[i].w / 2)) <= e.offsetX 
                        && (drawing_o._rightPos[i].x + (drawing_o._rightPos[i].w / 2)) > e.offsetX 
                        && (drawing_o._rightPos[i].y - (drawing_o._rightPos[i].h / 2)) <= e.offsetY 
                        && (drawing_o._rightPos[i].y + (drawing_o._rightPos[i].h / 2)) > e.offsetY) {
                            idxRightPos = i;
                            break;
                        } else if((drawing_o._rightBox[i].x - (drawing_o._rightBox[i].w / 2)) <= e.offsetX 
                        && (drawing_o._rightBox[i].x + (drawing_o._rightBox[i].w / 2)) > e.offsetX 
                        && (drawing_o._rightBox[i].y - (drawing_o._rightBox[i].h / 2)) <= e.offsetY 
                        && (drawing_o._rightBox[i].y + (drawing_o._rightBox[i].h / 2)) > e.offsetY) {
                            idxRightPos = i;
                            break;
                        }
                    }
                    if(idxRightPos < 0) {
                        drawing_o.send();
                        // onCancel(e, drawing_o.choicedIdx, drawing_o._lines, false);
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
                        if(i !== drawing_o.choicedIdx && idxRightPos === drawing_o._lines[i].rpos) {
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
                    
                    console.log('up2', idxRightPos, drawing_o._lines, true);
                    drawing_o.send();
                    // onUp(e, drawing_o.choicedIdx, drawing_o._lines, true);
                }
                drawing_o.direction = 0;
            });
            drawing_o.canvas.addEventListener('pointercancel',  function (e) {
                if(drawing_o._pid < 0 || drawing_o._pid !== e.pointerId) return;

                try {drawing_o.canvas.releasePointerCapture(drawing_o._pid);} catch(e) {}
                drawing_o._pid = -1;
                if(!drawing_o.cur) return;
                if(drawing_o.direction === 0) return;
                if(drawing_o.choicedIdx === -1) return;

                if(drawing_o.direction === 2) {
                    drawing_o.send();
                    // onCancel(e, drawing_o.choicedIdx, this.drawing_o._lines, false);
                    drawing_o.cur.drawed = false;
                    drawing_o.cur.lpos = -1;
                    drawing_o.cur.rpos = -1;
                    drawing_o.cur.ex = drawing_o.cur.sx;
                    drawing_o.cur.ey = drawing_o.cur.sx;
                    drawing_o.cur = null;
                    drawing_o.f_draw();
                    return;
                } else {
                    drawing_o.send();
                    // onCancel(e, drawing_o.choicedIdx, this.drawing_o._lines, true);
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
        var x = pos_rect.left - drawing_o.rect.left + (pos_rect.width/2);
        var y = pos_rect.top - drawing_o.rect.top + (pos_rect.height/2);
        var w = pos_rect.width * 5;
        var h = pos_rect.height * 5;

        if(position == 'l' || position == 't') drawing_o._leftPos.push({x: x, y:y, w:w, h:h});
        else if(position == 'r' || position == 'b') drawing_o._rightPos.push({x:x, y:y, w:w, h:h});
    },
    setBoxObjs: function(boxobj, position) {
        if(drawing_o.rect == null) return;
        else if(!boxobj) return;
        else if(!boxobj.getBoundingClientRect) return;

        var box_rect = boxobj.getBoundingClientRect();
        var x = box_rect.left - drawing_o.rect.left + (box_rect.width/2);
        var y = box_rect.top - drawing_o.rect.top + (box_rect.height/2);
        var w = box_rect.width;
        var h = box_rect.height;

        if(position == 'l' || position == 't') drawing_o._leftBox.push({x: x, y:y, w:w, h:h});
        else if(position == 'r' || position == 'b') drawing_o._rightBox.push({x:x, y:y, w:w, h:h});
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
    },
    setConmpeted: function (completed) {
        console.log('====> setConmpeted completed', completed);
        drawing_o.completed = completed;
    },
    reset: function () {
        drawing_o.ctx.clearRect(0, 0, drawing_o.ctx.canvas.width, drawing_o.ctx.canvas.height);

        while(drawing_o._lines.length > 0) drawing_o._lines.pop();
        drawing_o._lines = [
            {sx: 0, sy: 0, ex: 0, ey: 0, drawed: false, lpos: -1, rpos: -1},
            {sx: 0, sy: 0, ex: 0, ey: 0, drawed: false, lpos: -1, rpos: -1},
            {sx: 0, sy: 0, ex: 0, ey: 0, drawed: false, lpos: -1, rpos: -1},
            {sx: 0, sy: 0, ex: 0, ey: 0, drawed: false, lpos: -1, rpos: -1},
        ]; 
    }
};

var domtoimage_o = {
    isTeacher: false,
    capture: function() {
        const element = document.getElementsByClassName('content_page')[0];
        console.log("element",element)
        domtoimage.toPng(element,{bgcolor: '#ffffff'})
        .then(function(dataUrl) {
            msg = {};
            msg.base64Img = dataUrl;
            console.log("dataurl",dataUrl);
            this.sendPostMessage('domtoimage',msg);
        });
    }
};// 2020_09_09 성준 추가 domtoimage 를 위한 object

var current_o = {
    idx: -1,
    quizmode: '',  // warmup-quiz: quiz, check,
    content: null,
    isTeacher: false,
    completed: false,
    init: function (idx) {
        current_o.idx = idx;
    }
};

window.addEventListener('message', handlePostMessage, false);
function handlePostMessage(evt) {
    console.log('content handlePostMessage', evt.data);
    const data = evt.data;
    if(data.from == 'matemplate') {
        if(data.type == 'init') {
            if(!current_o) return;
            if(current_o.idx != data.msg.idx) return;
            console.log('content init', current_o.idx, data.msg.idx, data.msg);
            current_o.quizmode = data.msg.quizmode;             
            current_o.content = data.msg.content;
            current_o.isTeacher = data.msg.isTeacher;
            if(!current_o.content || !current_o.content.type) return;
            
            let isReset = current_o.quizmode == 'check' || current_o.quizmode == 'extended' 
                        || current_o.quizmode == 'strategy' || current_o.quizmode == 'portfolio'
                        || current_o.quizmode == 'reasoning1' || current_o.quizmode == 'reasoning2';
            console.log('isReset', isReset);
            if(current_o.content.type == 'choice') {
                choicebtn_o.setConmpeted(false);
                if(isReset) choicebtn_o.reset();
            } else if(current_o.content.type == 'mchoice') {
                mchoicebtn_o.setConmpeted(false);
                if(isReset) mchoicebtn_o.reset();
            } else if(current_o.content.type == 'mchoicecnt') {
                mchoicecntbtn_o.setConmpeted(false);
                if(isReset) mchoicecntbtn_o.reset();
            } else if(current_o.content.type == 'mdragdropcard') {
                mdragdropcard_o.setConmpeted(false);
                if(isReset) mdragdropcard_o.reset();
            } else if(current_o.content.type == 'numpad') {
                numpad_o.setConmpeted(false);
                if(isReset) numpad_o.reset();
            } else if(current_o.content.type == 'drawing') {
                drawing_o.setConmpeted(false);
                drawing_o.init();
                if(isReset) drawing_o.reset();
            }
        } else if(data.type == 'completed') {
            console.log('content completed', current_o.idx, data.msg.idx, current_o.content);
            if(current_o.idx != data.msg.idx) return;
            if(!current_o.content || !current_o.content.type) return;
            if(current_o.content.type == 'choice') {
                choicebtn_o.setConmpeted(true);
                if(current_o.quizmode == 'quiz' && current_o.isTeacher) choicebtn_o.showUsers(data.msg.choicedusers);
                else if(current_o.quizmode == 'quiz' && !current_o.isTeacher) choicebtn_o.showAnswer(data.msg.content.answer);
            } else if(current_o.content.type == 'mchoice') {
                mchoicebtn_o.setConmpeted(true);
            } else if(current_o.content.type == 'mchoicecnt') {
                mchoicecntbtn_o.setConmpeted(true);
            } else if(current_o.content.type == 'mdragdropcard') {
                mdragdropcard_o.setConmpeted(true);
            } else if(current_o.content.type == 'numpad') {
                numpad_o.setConmpeted(true);
            } else if(current_o.content.type == 'drawing') {
                drawing_o.setConmpeted(true);
            }
        } else if(data.type == 'domtoimage') { // 2020_09_09 성준 추가 domtoimage 로 이미지 캡처링
            domtoimage_o.capture();
        }
    }
} 
function sendPostMessage(type, msg) {
    console.log('content sendPostMessage', type, msg);
    let postMsgData = { from:'macontent', to: "matemplate", type: type, msg: msg};
    window.parent.postMessage(postMsgData, '*');
} 
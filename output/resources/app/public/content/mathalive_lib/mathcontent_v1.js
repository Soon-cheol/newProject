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
        var link = {
            obj: obj,
            link_seq: link_seq  
        };
        link_o.links.push(link);
    },
    click: function (obj) {
        var link = link_o.links.find(item => item.obj.id == obj.id);
        if(!link) return;

        var postMsgData = { from:'macontent', to: "matemplate", type: "contentlink", msg: {
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
        // console.log(concepttool_o.btns, concepttool_o.tabs, concepttool_o.cnts)
    },
    clickBtn: function (obj) {
        var btnidx = concepttool_o.btns.findIndex(item => item.id == obj.id);
        if(btnidx < 0) return;

        var msg = { seq: concepttool_o.seqs[btnidx] };
        sendPostMessage("btnclick", msg);
    },
    clickTab: function (obj) {
        if(obj.classList.contains('on')) {
            return;
        }
        var tabidx = -1;
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
            var msg = { seq: concepttool_o.seqs[tabidx] };
            sendPostMessage("tabclick", msg);
        }
    }
};

var choicebtn_o = {
    idx: -1,
    objs: [],
    userobjs: [],
    completed: false,
    subtype: -1,
    init: function(idx, subtype) {
        if(choicebtn_o.idx === idx) return;
        choicebtn_o.reset();        
        choicebtn_o.idx = idx;
        choicebtn_o.subtype = subtype;
        choicebtn_o.objs = [];
        var objs = document.querySelectorAll("[data-type='choice']");
        if(objs.length < 1) return;
        for(var i = 0; i < objs.length; i++) {
            var findIdx = choicebtn_o.objs.findIndex((item) => item.id === objs[i].id);
            if(findIdx < 0) {
                choicebtn_o.objs.push(objs[i]);
                choicebtn_o.setObj(objs[i]);
            }
        }
    },
    setObj: function(obj) {
        if(!obj) return;
        obj.addEventListener('pointerdown', function (e) {
            // console.log('pointerdown click', obj.classList);
            e.stopPropagation();
            e.preventDefault();
            if(choicebtn_o.completed) return;
            if(obj.classList.contains('already')) obj.classList.remove('already');
            if(obj.classList.contains('on')) {
                obj.classList.add('already');
                return;
            }
            if(obj.classList.contains('down')) return;
            else obj.classList.add('down');
        });
        obj.addEventListener('pointerup', function (e) {
            // console.log('pointerup click', obj.classList);
            e.stopPropagation();
            e.preventDefault();
            if(choicebtn_o.completed) return;
            if(obj.classList.contains('already')) {
                obj.classList.remove('on');
                choicebtn_o.send(obj);
                return;
            }
            if(obj.classList.contains('down')) obj.classList.remove('down');
            obj.classList.add('on');
            choicebtn_o.send(obj);
        });
    },
    send: function (obj) {
        var idxs = [];
        var values = [];    
        if(choicebtn_o.subtype === 1) {
            var idx = 0;
            for(var i = 0; i < choicebtn_o.objs.length; i++) {
                if(choicebtn_o.objs[i].classList.contains('on')) {
                    idxs.push(idx++);
                    values.push(choicebtn_o.objs[i].value);
                }
            }
            if(idxs.length > 0 && values.length > 0) {
                msg = {};
                msg.basetype = 1; 
                msg.basetypename = "Choice"; 
                msg.subtype = choicebtn_o.subtype;
                msg.subtypename = "multi choice";
                msg.choicedIdx = idxs;
                msg.choicedValue = values;
                sendPostMessage("submit", msg);
            }
        } else {
            for(var i = 0; i < choicebtn_o.objs.length; i++) {
                if(obj.id == choicebtn_o.objs[i].id) {
                    choicebtn_o.objs[i].classList.add('on');
                    idxs[0] = i;
                    values[0] = choicebtn_o.objs[i].value;
                } else choicebtn_o.objs[i].classList.remove('on');
            }
            if(idxs.length > 0 && values.length > 0) {
                msg = {};
                msg.basetype = 1; 
                msg.basetypename = "Choice"; 
                msg.subtype = 0;
                msg.subtypename = "choice";
                msg.choicedIdx = idxs;
                msg.choicedValue = values;
                sendPostMessage("submit", msg);
            }
        } 
    },
    setCompleted: function (completed) {
        // console.log('====> setCompleted completed', completed);
        choicebtn_o.completed = completed;
    },
    reset: function () {
        for(var i = 0; i < choicebtn_o.objs.length; i++) {
            if(choicebtn_o.objs[i].classList.contains('on')) choicebtn_o.objs[i].classList.remove('on');
            if(choicebtn_o.objs[i].classList.contains('wrong')) choicebtn_o.objs[i].classList.remove('wrong');
            if(choicebtn_o.objs[i].classList.contains('right')) choicebtn_o.objs[i].classList.remove('right');
        }
    },
    showUsers: function(choicedusers) {
        // console.log('====> showUsers', choicedusers);
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
    showAnswer: function(item) {
        // console.log('choice showanswer item', item);
        const answers = item.answers;
        const matchType = item.matchType;
        for(var i = 0; i < choicebtn_o.objs.length; i++) {
            const boxValue = choicebtn_o.objs[i].value;
            const isMatch = answers.includes(boxValue);
            let isWarmupQuiz = false;
            if(!choicebtn_o.objs[i].classList.contains('btn')){ //해당 버튼에 btn class가 없으면 웜업퀴즈로 취급. 
                isWarmupQuiz = true;
            }
            // console.log('isWarmupQuiz', isWarmupQuiz);
            if(isMatch) {
                if(choicebtn_o.objs[i].classList.contains('on')){
                    if(!isWarmupQuiz){
                        choicebtn_o.objs[i].classList.remove('on');
                    }
                    
                    choicebtn_o.objs[i].classList.add('correct');
                }else{
                    choicebtn_o.objs[i].classList.add('correct');
                }
                
            }else{
                if(choicebtn_o.objs[i].classList.contains('on')){
                    if(!isWarmupQuiz){
                        choicebtn_o.objs[i].classList.remove('on');
                    }
                    choicebtn_o.objs[i].classList.add('wrong');
                }else{
                    if(!isWarmupQuiz){
                        choicebtn_o.objs[i].classList.remove('on');
                    }
                }    
            }            
        }
        
    }
};

var choicebtn_group_o = {
    idx: -1,
    objs: [],
    userobjs: [],
    completed: false,
    groupNames:[],
    idxs:[],
    values:[], 
    subtype: -1,
    init: function(idx, subtype) {
        if(choicebtn_group_o.idx === idx) return;
        choicebtn_group_o.reset();        
        choicebtn_group_o.idx = idx;
        choicebtn_group_o.subtype = subtype;
        choicebtn_group_o.objs = [];
        choicebtn_group_o.idxs = [];
        choicebtn_group_o.values = [];
        var objs = document.querySelectorAll("[data-type='choice']");
        if(objs.length < 1) return;
        for(var i = 0; i < objs.length; i++) {
            var findIdx = choicebtn_group_o.objs.findIndex((item) => item.id === objs[i].id);
            if(findIdx < 0) {
                choicebtn_group_o.groupNames.push(objs[i].dataset.group);
                choicebtn_group_o.objs.push(objs[i]);                
                choicebtn_group_o.setObj(objs[i]);
            }
        }
        //중복 제거
        choicebtn_group_o.groupNames = Array.from(new Set(choicebtn_group_o.groupNames));
        // console.log('groupName', choicebtn_group_o.groupNames);
    },
    setObj: function(obj) {
        if(!obj) return;
        obj.addEventListener('pointerdown', function (e) {
            // console.log('pointerdown click', obj.classList);
            e.stopPropagation();
            e.preventDefault();
            if(choicebtn_group_o.completed) return;
            if(obj.classList.contains('already')) obj.classList.remove('already');
            if(obj.classList.contains('on')) {
                obj.classList.add('already');
                return;
            }
            if(obj.classList.contains('down')) return;
            else obj.classList.add('down');
        });
        obj.addEventListener('pointerup', function (e) {
            // console.log('pointerup click', obj.classList);
            e.stopPropagation();
            e.preventDefault();
            if(choicebtn_group_o.completed) return;
            if(obj.classList.contains('already')) {
                obj.classList.remove('on');
                choicebtn_group_o.send(obj);
                return;
            }
            if(obj.classList.contains('down')) obj.classList.remove('down');
            obj.classList.add('on');
            choicebtn_group_o.send(obj);
        });
    },
    send: function (obj) {
        // console.log('send obj', obj);
          
        // console.log('choicebtn_group_o.subtype', choicebtn_group_o.subtype);
        if(choicebtn_group_o.subtype === 3) {
            var idx = 0;
            for(var i = 0; i < choicebtn_group_o.objs.length; i++) {
                // console.log('choicebtn_group.objs datagroup',choicebtn_group_o.objs[i].dataset.group);
                if(choicebtn_group_o.objs[i].classList.contains('on')) {
                    choicebtn_group_o.idxs.push(idx++);
                    choicebtn_group_o.values.push(choicebtn_group_o.objs[i].value);
                }
            }
            if(choicebtn_group_o.idxs.length > 0 && choicebtn_group_o.values.length > 0) {
                msg = {};
                msg.basetype = 1; 
                msg.basetypename = "Choice"; 
                msg.subtype = choicebtn_group_o.subtype;
                msg.subtypename = "multi choice  group";
                msg.choicedIdx = choicebtn_group_o.idxs;
                msg.choicedValue = choicebtn_group_o.values;
                sendPostMessage("submit", msg);
            }
        } else {
            // console.log('choicebtn_group_o.objs', obj);
            var clickedObjGroupName = obj.dataset.group;
            // console.log('clickedObjGroupName',clickedObjGroupName);
            for(var i = 0; i < choicebtn_group_o.objs.length; i++) {
                // console.log('choicebtn_group_o.objs[i]', choicebtn_group_o.objs[i]);
                var groupName = choicebtn_group_o.objs[i].dataset.group;
                // console.log('groupName', groupName);
                if(!groupName) continue;
                if(clickedObjGroupName == groupName) {
                if(obj.id == choicebtn_group_o.objs[i].id) {
                    choicebtn_group_o.objs[i].classList.add('on');
                    choicebtn_group_o.idxs[Number.parseInt(groupName)-1] = i;
                    choicebtn_group_o.values[Number.parseInt(groupName)-1] = choicebtn_group_o.objs[i].value;
                } else choicebtn_group_o.objs[i].classList.remove('on');
            }
            }
            if(choicebtn_group_o.idxs.length > 0 && choicebtn_group_o.values.length > 0) {
                msg = {};
                msg.basetype = 1; 
                msg.basetypename = "Choice"; 
                msg.subtype = 2;
                msg.subtypename = "choice group";
                msg.choicedIdx = choicebtn_group_o.idxs;
                msg.choicedValue = choicebtn_group_o.values;
                // console.log("submit msg", msg);
                sendPostMessage("submit", msg);
            }
        } 
    },
    setCompleted: function (completed) {
        // console.log('====> setCompleted completed', completed);
        choicebtn_group_o.completed = completed;
    },
    reset: function () {
        for(var i = 0; i < choicebtn_group_o.objs.length; i++) {
            if(choicebtn_group_o.objs[i].classList.contains('on')) choicebtn_group_o.objs[i].classList.remove('on');
            if(choicebtn_group_o.objs[i].classList.contains('wrong')) choicebtn_group_o.objs[i].classList.remove('wrong');
            if(choicebtn_group_o.objs[i].classList.contains('right')) choicebtn_group_o.objs[i].classList.remove('right');
        }
    },
    showUsers: function(choicedusers) {
        // console.log('====> showUsers', choicedusers);
        if(!choicedusers || choicedusers.length == 0) {
            for(var i = 0; i < choicebtn_group_o.userobjs.length; i++) {
                choicebtn_group_o.userobjs[i].innerHTML = '0';
                choicebtn_group_o.userobjs[i].classList.add('show');
            }
            return;
        }
        for(var i = 0; i < choicebtn_group_o.userobjs.length; i++) {
            var choiceduser = choicedusers.find(item => item.choicedIdx == i);
            if(choiceduser) choicebtn_group_o.userobjs[i].innerHTML = '' + choiceduser.users;
            else choicebtn_group_o.userobjs[i].innerHTML = '0';
            choicebtn_group_o.userobjs[i].classList.add('show');
        }
    },
    showAnswer: function(item) {
        // console.log('choice showanswer item', item);
        if(item.answers[0].indexOf(",") == -1) return;
        const answers = item.answers[0].split(',');
        // console.log('answers', answers);
        const matchType = item.matchType;
        for(var i = 0; i < choicebtn_group_o.objs.length; i++) {
            const boxValue = choicebtn_group_o.objs[i].value;
            // console.log('boxValue',boxValue);
            const isMatch = answers.includes(boxValue);
            // console.log('boxValue',boxValue, isMatch);
            let isWarmupQuiz = false;
            if(!choicebtn_group_o.objs[i].classList.contains('btn')){ //해당 버튼에 btn class가 없으면 웜업퀴즈로 취급. 
                isWarmupQuiz = true;
            }
            // console.log('isWarmupQuiz', isWarmupQuiz);
            if(isMatch) {
                if(choicebtn_group_o.objs[i].classList.contains('on')){
                    if(!isWarmupQuiz){
                        choicebtn_group_o.objs[i].classList.remove('on');
                    }
                    
                    choicebtn_group_o.objs[i].classList.add('correct');
                }else{
                    choicebtn_group_o.objs[i].classList.add('correct');
                }
                
            }else{
                if(choicebtn_group_o.objs[i].classList.contains('on')){
                    if(!isWarmupQuiz){
                        choicebtn_group_o.objs[i].classList.remove('on');
                    }
                    choicebtn_group_o.objs[i].classList.add('wrong');
                }else{
                    if(!isWarmupQuiz){
                        choicebtn_group_o.objs[i].classList.remove('on');
                    }
                }    
            }            
        }
        
    }
};


var numpad_o = {
    idx: -1,
    selector: null,
    value: '',
    target : null,
    maxlength: 1, // max allowed characters
    pos: 'left',
    completed: false,
    targets: [],
    groupcnt: 0,
    subtype: -1,
    mode: "number",
    answerIdx:1,
    init: function (idx, subtype) {
        if(numpad_o.idx === idx) return;
        // console.log('gapInitkkk',"init");
        numpad_o.answerIdx = 1;
        numpad_o.idx = idx;
        numpad_o.subtype = subtype;
        numpad_o.reset();
        numpad_o.selector = document.createElement("div");
        numpad_o.selector.id = "numpad-wrap";
        numpad_o.selector.classList.add("numpad");
        numpad_o.selector.classList.add(numpad_o.mode);
        button = null,
        append = function (txt, fn, css) {
            button = document.createElement("button");
            button.innerHTML = txt;
            if (css) button.classList.add(css);
            button.addEventListener("click", fn);
            numpad_o.selector.appendChild(button);
        };

        append('123', numpad_o.numberMode);
        append('s', numpad_o.simbolMode);
        append('←', numpad_o.delete);
        var i;
        for (i = 7; i<=9; i++) append(i, numpad_o.input);
        for (i = 4; i<=6; i++) append(i, numpad_o.input);
        for (i = 1; i<=3; i++) append(i, numpad_o.input);
        append('.', numpad_o.input);
        append(0, numpad_o.input);
        append('✓', numpad_o.select);
        
        document.body.appendChild(numpad_o.selector);

        numpad_o.targets = [];
        var objs = document.querySelectorAll("[data-type='numpad']");
        // console.log('numpad_o init objs.length', objs.length);
        if(objs.length < 1) return;
        if(numpad_o.subtype == 1 || numpad_o.subtype == 2) {
            for(i = 0; i < objs.length; i++) {
                if(objs[i].dataset.group) {
                    if(parseInt(objs[i].dataset.group) > numpad_o.groupcnt) numpad_o.groupcnt = parseInt(objs[i].dataset.group); 
                }
            }
        }
        for(i = 0; i < objs.length; i++) {
            if (objs[i]) {
                if (objs[i].dataset.maxlength==undefined) { objs[i].dataset.maxlength = 1; }
                if (objs[i].dataset.pos==undefined) { objs[i].dataset.pos = 'left'; }
                numpad_o.value = objs[i].value;
                objs[i].addEventListener("click", numpad_o.show);
                numpad_o.targets.push(objs[i]);
            }
        }
        // if(numpad_o.subtype == 3) {
            numpad_o.targets = numpad_o.targets.sort((a, b) => a.id.localeCompare( b.id, 'en', { numeric: true }));
        // }
    },
    numberMode: function () {
        if(numpad_o.mode === "number") return;
        numpad_o.mode = "number";
        numpad_o.selector.classList.add("number");
        numpad_o.selector.classList.remove("simbol");
        while(numpad_o.selector.hasChildNodes()) {
            numpad_o.selector.removeChild(numpad_o.selector.firstChild)
        }
        button = null,
        append = function (txt, fn, css) {
            button = document.createElement("button");
            button.innerHTML = txt;
            if (css) button.classList.add(css);
            button.addEventListener("click", fn);
            numpad_o.selector.appendChild(button);
        };
        append('123', numpad_o.numberMode);
        append('s', numpad_o.simbolMode);
        append('←', numpad_o.delete);
        var i;
        for (i = 7; i<=9; i++) append(i, numpad_o.input);
        for (i = 4; i<=6; i++) append(i, numpad_o.input);
        for (i = 1; i<=3; i++) append(i, numpad_o.input);
        append('.', numpad_o.input);
        append(0, numpad_o.input);
        append('✓', numpad_o.select);
    },
    simbolMode: function () {
        if(numpad_o.mode === "simbol") return;
        numpad_o.mode = "simbol";
        numpad_o.selector.classList.add("simbol");
        numpad_o.selector.classList.remove("number");
        while(numpad_o.selector.hasChildNodes()) {
            numpad_o.selector.removeChild(numpad_o.selector.firstChild)
        }
        button = null,
        append = function (txt, fn, css) {
            button = document.createElement("button");
            button.zIndex = 53;
            button.innerHTML = txt;
            if (css) button.classList.add(css);
            if(fn) button.addEventListener("click", fn);
            numpad_o.selector.appendChild(button);
        };

        append('123', numpad_o.numberMode);
        append('s', numpad_o.simbolMode);
        append('←', numpad_o.delete);
        append('', null);        
        append('＋', numpad_o.input);
        append('＜', numpad_o.input);
        append('', null);        
        append('－', numpad_o.input);
        append('＝', numpad_o.input);
        append('', null);        
        append('×', numpad_o.input);
        append('＞', numpad_o.input);
        append('', null);        
        append('÷', numpad_o.input);        
        append('✓', numpad_o.select);
    },
    delete: function () {
        // console.log('delete');
        var length = numpad_o.target.value;
        var start = numpad_o.target.selectionStart;
        var end = numpad_o.target.selectionEnd;
        // console.log('start', start);
        // console.log('end', end);
        var value, newValue, range;
        if(start === end) {
            value = numpad_o.target.value;
            newValue = value.substr(0, start-1) + value.substr(start, value.length);
            
            numpad_o.target.value = newValue;
            range = start-1 < 0 ? 0 : start-1;
            numpad_o.target.setSelectionRange(range,range);
        }else{
            value = numpad_o.target.value;
            newValue = value.substr(0, start) + value.substr(end, value.length);
            
            numpad_o.target.value = newValue;
            range = start;
            numpad_o.target.setSelectionRange(range,range);
        }
        numpad_o.send();
        numpad_o.target.focus();
    },
    input: function (evt) {        
        value = evt.target.innerHTML;
        var start = numpad_o.target.selectionStart;
        var end = numpad_o.target.selectionEnd;
        var value, newValue, range; 
        if(start !== end) {
            value = numpad_o.target.value;
            newValue = value.substr(0, start) + value.substr(end, value.length);
            numpad_o.target.value = newValue;
            range = start;
            numpad_o.target.setSelectionRange(range,range);
            numpad_o.target.focus();
        }
        var targetValue = numpad_o.target.value;
        newValue = targetValue.substr(0, start) + value+ targetValue.substr(start, targetValue.length);        
        if(numpad_o.maxlength != NaN && newValue.length > numpad_o.maxlength) {                
            if(start === targetValue.length){
                newValue = newValue.substr(0,newValue.length-2) + newValue.substr(newValue.length-1,newValue.length);
                numpad_o.target.setSelectionRange(newValue.length,newValue.length);
            }else{
                newValue = newValue.substr(0,newValue.length-1);
                numpad_o.target.setSelectionRange(start+1,start+1);
            }
            numpad_o.target.value = newValue;         
        }else{
            numpad_o.target.value = newValue;
            numpad_o.target.setSelectionRange(start+1,start+1);
        }
        numpad_o.send();
        numpad_o.target.focus();
    },
    select: function () {
        numpad_o.send();  
        numpad_o.hide();
    },
    show: function (evt) {
        if(numpad_o.completed) return;
        numpad_o.target = evt.target;
        // console.log('===================>  evt.target', evt.target);
        evt.target.onkeyup = (e)=>{
            // console.log(e.target.value);
            var value = evt.target.innerHTML;
            var start = numpad_o.target.selectionStart;
            var end = numpad_o.target.selectionEnd;
            var value, newValue, range; 
            if(start !== end) {
                value = numpad_o.target.value;
                newValue = value.substr(0, start) + value.substr(end, value.length);
                numpad_o.target.value = newValue;
                range = start;
                numpad_o.target.setSelectionRange(range,range);
                numpad_o.target.focus();
            }
            var targetValue = numpad_o.target.value;
            newValue = targetValue.substr(0, start) + value+ targetValue.substr(start, targetValue.length);        
            if(numpad_o.maxlength != NaN && newValue.length > numpad_o.maxlength) {                
                if(start === targetValue.length){
                    newValue = newValue.substr(0,newValue.length-2) + newValue.substr(newValue.length-1,newValue.length);
                    numpad_o.target.setSelectionRange(newValue.length,newValue.length);
                }else{
                    newValue = newValue.substr(0,newValue.length-1);
                    numpad_o.target.setSelectionRange(start+1,start+1);
                }
                numpad_o.target.value = newValue;         
            }else{
                numpad_o.target.value = newValue;
                numpad_o.target.setSelectionRange(start+1,start+1);
            }

            numpad_o.send();
        };
        var rect = evt.target.getBoundingClientRect();
        
        var tgtrect;
        var tgt_h = 0;
        if(rect) {
            numpad_o.pos = numpad_o.target.dataset.pos;
            if(numpad_o.pos == 'right-center') {
                tgtrect = numpad_o.target.getBoundingClientRect();
                tgt_h = 0;
                if(tgtrect) tgt_h = Math.round(tgtrect.height / 2);
                numpad_o.selector.style.top = (rect.bottom - 170 - tgt_h) + 'px'; // 340 / 2 number box height
                numpad_o.selector.style.left = (rect.left + rect.width + 10) + 'px';
            } else if(numpad_o.pos == 'left-center') {
                tgtrect = numpad_o.target.getBoundingClientRect();
                tgt_h = 0;
                if(tgtrect) tgt_h = Math.round(tgtrect.height / 2);
                numpad_o.selector.style.top = (rect.bottom - 170 - tgt_h) + 'px'; // 340 / 2 number box height
                if(rect.left - rect.width - 10 < 0) numpad_o.selector.style.left = '0px';
                else numpad_o.selector.style.left = (rect.left - 202 - 10) + 'px'; // 202 number box width                
            } else if(numpad_o.pos == 'right-bottom') {
                numpad_o.selector.style.top = rect.top + 'px';
                numpad_o.selector.style.left = (rect.left + rect.width + 10) + 'px';
            } else if(numpad_o.pos == 'left-bottom') {
                numpad_o.selector.style.top = rect.top + 'px';
                if(rect.left - rect.width - 10 < 0) numpad_o.selector.style.left = '0px';
                else numpad_o.selector.style.left = (rect.left - 202 - 10) + 'px'; // 202 number box width
            } else if(numpad_o.pos == 'right-top') {
                numpad_o.selector.style.top = (rect.bottom - 340) + 'px'; // 340 number box height
                numpad_o.selector.style.left = (rect.left + rect.width + 10) + 'px';
            } else if (numpad_o.pos == 'left-top') {
                numpad_o.selector.style.top = (rect.bottom - 340) + 'px'; // 340 number box height
                if(rect.left - rect.width - 10 < 0) numpad_o.selector.style.left = '0px';
                else numpad_o.selector.style.left = (rect.left - 202 - 10) + 'px'; // 202 number box width
            } else if(numpad_o.pos == 'right') {
                numpad_o.selector.style.top = (rect.bottom - 340) + 'px'; // 340 number box height
                numpad_o.selector.style.left = (rect.left + rect.width + 10) + 'px';                
            } else {
                numpad_o.selector.style.top = (rect.bottom - 340) + 'px'; // 340 number box height
                if(rect.left - rect.width - 10 < 0) numpad_o.selector.style.left = '0px';
                else numpad_o.selector.style.left = (rect.left - 202 - 10) + 'px'; // 202 number box width
            } 
        }
        // console.log('maxlength', numpad_o.target.dataset.maxlength);
        numpad_o.maxlength = parseInt(numpad_o.target.dataset.maxlength);
        var dv = evt.target.value;
        if (!isNaN(parseFloat(dv)) && isFinite(dv)) {
            numpad_o.value = dv;
        } else {
            numpad_o.value = "";
        }
        numpad_o.selector.classList.add("show");

        var fixedLeft = 0;
        var fixedTop = 0;
        var isMoving = false;

        numpad_o.selector.onpointerdown = function (e) {
            numpad_o.selector.style.position = 'absolute';
            numpad_o.selector.zIndex = 50;

            var left = parseFloat(
                getComputedStyle(numpad_o.selector, null)
                  .getPropertyValue("left")
                  .replace("px", "")
              );
            var top = parseFloat(
                getComputedStyle(numpad_o.selector, null)
                    .getPropertyValue("top")
                    .replace("px", "")
                );
            fixedLeft = e.clientX - left;
            fixedTop = e.clientY - top;
            isMoving = true;
        };

        numpad_o.selector.onpointermove = function (e) {
            if(!isMoving) return;
            numpad_o.selector.style.left = (e.clientX - fixedLeft) + 'px';
            numpad_o.selector.style.top = (e.clientY - fixedTop) + 'px';      
        }

        numpad_o.selector.onpointerup = function (e) { 
            if(!isMoving) return;
            fixedLeft = 0;
            fixedTop = 0;
            isMoving = false;
        }
    },
    hide: function () {
        if(numpad_o.selector) numpad_o.selector.classList.remove("show");
    },
    setCompleted: function (completed) {
        // console.log('====> setCompleted completed', completed);
        numpad_o.completed = completed;
        numpad_o.hide();
    },
    send: function () {
        var idxs = [];
        var values = [];
        var i = 0;
        var valuepergroup;
        var group;
        if(numpad_o.subtype === 1) {
            valuepergroup = [];
            for(i = 0; i < numpad_o.targets.length; i++) {
                if(numpad_o.targets[i].dataset.group) {
                    group = parseInt(numpad_o.targets[i].dataset.group);
                    if(!valuepergroup[group - 1]) valuepergroup[group - 1] = [];
                    valuepergroup[group - 1].push(numpad_o.targets[i].value);
                }
            }
            // console.log('valuepergroup', valuepergroup, numpad_o.groupcnt);
            for(i = 0; i < numpad_o.groupcnt; i++) {
                idxs.push(i);
                // console.log('valuepergroup[i]',valuepergroup[i]);
                if(valuepergroup[i]) values.push(valuepergroup[i].join(','));
            }
            if(idxs.length > 0 && values.length > 0) {
                msg = {};
                msg.basetype = 0; 
                msg.basetypename = "Gap"; 
                msg.subtype = numpad_o.subtype;
                msg.subtypename = "multi group";
                msg.choicedIdx = idxs;
                msg.choicedValue = values;
                // console.log('===> numpad msg', msg);
                sendPostMessage("submit", msg);
            }
        } else if(numpad_o.subtype === 2) {
            valuepergroup = [];
            for(i = 0; i < numpad_o.targets.length; i++) {
                if(numpad_o.targets[i].dataset.group) {
                    group = parseInt(numpad_o.targets[i].dataset.group);
                    if(!valuepergroup[group - 1]) valuepergroup[group - 1] = [];
                    valuepergroup[group - 1].push(numpad_o.targets[i].value);
                }
            }
            // console.log('valuepergroup', valuepergroup, numpad_o.groupcnt);
            for(i = 0; i < numpad_o.groupcnt; i++) {
                idxs.push(i);
                values.push(valuepergroup[i]);
            }
            if(idxs.length > 0 && values.length > 0) {
                msg = {};
                msg.basetype = 0; 
                msg.basetypename = "Gap"; 
                msg.subtype = numpad_o.subtype;
                msg.subtypename = "vertical count";
                msg.choicedIdx = idxs;
                msg.choicedValue = values;
                // console.log('===> numpad msg', msg);
                sendPostMessage("submit", msg);
            }
        } else {
            for(i = 0; i < numpad_o.targets.length; i++) {
                if(numpad_o.targets[i].value != '') {
                    idxs.push(i);
                    values.push(numpad_o.targets[i].value);
                }
            }
            if(idxs.length > 0 && values.length > 0) {
                msg = {};
                msg.basetype = 0; 
                msg.basetypename = "Gap"; 
                msg.subtype = numpad_o.subtype;
                if(numpad_o.subtype === 3) msg.subtypename = "gap plus";
                else msg.subtypename = "gap";
                msg.choicedIdx = idxs;
                msg.choicedValue = values;
                // console.log('===> numpad msg', msg);
                sendPostMessage("submit", msg);
            }
        }
    },
    reset: function () {
        numpad_o.hide();
        var objs = document.querySelectorAll("[data-type='numpad']");
        for(var i = 0; i < objs.length; i++) {
            if(objs[i].value != '') objs[i].value = '';
        }
    },
    showAnswer: function(item) {
        //gap은 정오답표시 한계로 표시하지 않기로 협의됨.주석처리.
        // const answers = item.answers;

        // // console.log('gap showAnswer - answerIdx', numpad_o.answerIdx);
        // // console.log('gap showAnswer - answers', answers);
        // // console.log('gap showAnswer - answers', numpad_o);
        // var matchType = item.matchType;
        // var groupedTargets = [];
        // var isGroup = false;
        // for(var i = 0; i < numpad_o.targets.length; i++) {                        
        //     const group = numpad_o.targets[i].dataset.group;
        //     if(group){      
        //         isGroup = true;                         
        //         if(numpad_o.answerIdx == group) {
        //             groupedTargets.push(this.targets[i]);
        //         }                
        //     }            
        // }
        // // console.log('groupedTargets',groupedTargets);
        // if(isGroup) {
        //     for(var i = 0; i < groupedTargets.length; i++) {
        //         const boxValue = groupedTargets[i].value;
        //         if(answers[0].indexOf(",") !== -1) {
        //             if((answers[0]).split(',')[i] == boxValue) {
        //                 groupedTargets[i].classList.add('correct');                
        //             }else{
        //                 groupedTargets[i].classList.add('wrong');
        //                 // numpad_o.targets[i].value = answers[i]; 
        //             } 
        //         }else{
        //             if(answers[0] == boxValue) {
        //                 groupedTargets[i].classList.add('correct');                
        //             }else{
        //                 groupedTargets[i].classList.add('wrong');
        //                 // numpad_o.targets[i].value = answers[i]; 
        //             } 
        //         }  
        //     }
        // }else{
        //     for(var i = 0; i < numpad_o.targets.length; i++) {
        //         // console.log('gap showAnswer', answers,numpad_o.targets[i].value);
        //         const boxValue = numpad_o.targets[i].value;
        //         if(answers[i] == boxValue) {
        //             numpad_o.targets[i].classList.add('correct');                
        //         }else{
        //             numpad_o.targets[i].classList.add('wrong');
        //             // numpad_o.targets[i].value = answers[i]; 
        //         }   
        //     }
        // }
        // numpad_o.answerIdx = numpad_o.answerIdx+1;
    }
}; 

var dragdrop_o = {
    idx: -1,
    target: [],
    source: [],
    sourcebox: null,
    completed: false,
    subtype: -1,
    zindex: 0,
    init: function (idx, subtype) {
        if(dragdrop_o.idx === idx) return;
        dragdrop_o.idx = idx;
        dragdrop_o.subtype = subtype;
        dragdrop_o.reset();
        dragdrop_o.groupcnt = 0;
        dragdrop_o.source = [];
        dragdrop_o.target = [];
        var tgts = document.querySelectorAll("[data-type='dragdrop_tgt']");
        if(tgts.length < 1) return;
        for(var i = 0; i < tgts.length; i++) {
            var findIdx = dragdrop_o.target.findIndex((item) => item.id === tgts[i].id);
            if(findIdx < 0) dragdrop_o.target.push(tgts[i]);
            dragdrop_o.setTarget(tgts[i]);
        }
        var srcs = document.querySelectorAll("[data-type='dragdrop_src']");
        if(!srcs || srcs.length < 1) return;
        for(var i = 0; i < srcs.length; i++) {
            var findIdx = dragdrop_o.source.findIndex((item) => item.id === srcs[i].id);
            if(findIdx < 0) dragdrop_o.source.push(srcs[i]);
            dragdrop_o.setSource(srcs[i]);
        }
        var srcbox = document.querySelector("[data-type='dragdrop_srcbox']");
        if(!srcbox) return;
        dragdrop_o.sourcebox = srcbox;
        dragdrop_o.setSourceBox(srcbox);
        // console.log('dragdrop_o init', dragdrop_o.source, dragdrop_o.target, dragdrop_o.sourcebox);
    },
    setTarget: function(tgt) {
        if(!tgt) return;
      
    },
    setAddedItem: function(src) {
        //타겟 박스에 들어간 아이템의 처리, 박스끼리의 이동, 지우기처리
        if(!src) return;       
        src.draggable = false;
        var cloneSrc = src.cloneNode();
        var content = document.querySelector('.content_page');     
        
        var fixedXY = {};
        src.onpointerdown = function (e) {      
            content.style.touchAction = 'none';// 중요. 안해주면 드래그 안됨.
            cloneSrc.style.position = 'absolute';
            cloneSrc.style.zIndex = 99999999999999;
            cloneSrc.style.opacity = '0.6';    
            cloneSrc.style.left = src.getBoundingClientRect().left + 'px';
            cloneSrc.style.top = src.getBoundingClientRect().top + 'px';      
            fixedXY.x = e.clientX - src.getBoundingClientRect().left;
            fixedXY.y = e.clientY - src.getBoundingClientRect().top;
            content.appendChild(cloneSrc);
            src.style.display = "none";
            cloneSrc.style.visibility = "visible";
            cloneSrc.setPointerCapture(e.pointerId);
            // src.style.backgroundColor = 'red';           
        };
        cloneSrc.onpointermove = function (e) {
            cloneSrc.setPointerCapture(e.pointerId);
            // console.log('pointermove', e);
            cloneSrc.style.left = (e.clientX-fixedXY.x) + 'px';
            cloneSrc.style.top = (e.clientY-fixedXY.y) + 'px'
        };
        cloneSrc.onpointerup = function (e) {
            
            cloneSrc.releasePointerCapture(e.pointerId);    
            content.style.touchAction = 'auto';
            //드래그 되는 이미지는 제거하고,
            cloneSrc.remove();
            var isParentSame = false;
            var isInside = false;
            var isOverLength = false;
            var dragedParent;
            //마우스 포인터가 tgt에 들어가 있는지 판별 시작
            for(var i = 0; i < dragdrop_o.target.length; i ++) {
                var target = dragdrop_o.target[i];
                
                if(src.parentNode !== target) {
                    if((e.clientX >= target.getBoundingClientRect().left && e.clientX <= target.getBoundingClientRect().right) && (e.clientY >= target.getBoundingClientRect().top && e.clientY <= target.getBoundingClientRect().bottom)){                    
                        isInside = true;
                        dragedParent = target;
                        if(target.dataset.maxlength) {
                            var srcs = target.querySelectorAll('[data-type="dragdrop_src"]');
                            
                            if(srcs.length >= target.dataset.maxlength) {
                                isOverLength = true;
                            }
                        }                                                                        
                    }                    
                }else{                    
                    if((e.clientX >= target.getBoundingClientRect().left && e.clientX <= target.getBoundingClientRect().right) && (e.clientY >= target.getBoundingClientRect().top && e.clientY <= target.getBoundingClientRect().bottom)){                    
                        isInside = true;
                        isParentSame = true;
                        dragedParent = target;
                    }                  
                }                           
            }
            if(isInside && isParentSame) {
                //그냥 박스안에서의 드래그, 다시 보여주기
                if(dragedParent.dataset.instyle) src.setAttribute("style", dragedParent.dataset.instyle);
                if(dragedParent.dataset.instyle && dragedParent.dataset.instyle.indexOf('absolute') != -1) {
                    src.style.position = "absolute";
                    src.style.left = (e.clientX-fixedXY.x) - dragedParent.getBoundingClientRect().left + "px";
                    src.style.top = (e.clientY-fixedXY.y) - dragedParent.getBoundingClientRect().top + "px";                    
                }
                src.style.display = "block";
            }else if(isInside) {
                if(isOverLength) {
                    //옮긱자 하는 타겟 아이템이 꽉참. 다시 원위치
                    src.style.display = "block";
                }else{
                    // 아이템이 꽉 안찼을 때는 그쪽으로 옮기기
                    src.style.display = "block";
                    if(dragedParent.dataset.instyle) src.setAttribute("style", dragedParent.dataset.instyle);
                    if(dragedParent.dataset.instyle && dragedParent.dataset.instyle.indexOf('absolute') != -1) {                        
                        src.style.position = "absolute";
                        src.style.left = (e.clientX-fixedXY.x) - dragedParent.getBoundingClientRect().left + "px";
                        src.style.top = (e.clientY-fixedXY.y) - dragedParent.getBoundingClientRect().top + "px";                    
                    }
                    dragedParent.appendChild(src);

                }
            }else{
                //그외 바깥으로 드래그한경우 처리
                for(var i = 0; i < dragdrop_o.source.length; i++) {
                    if(dragdrop_o.source[i].id == src.id) {
                        //원래 있던객체는 다시 보여주기
                        dragdrop_o.source[i].style.visibility = "visible";
                    }
                }                
                src.remove();
            }
            dragdrop_o.send();
        };
    },  
    setSource: function(src) {
        if(!src) return;
        src.draggable = false;
        var cloneSrc = src.cloneNode();
        var content = document.querySelector('.content_page');     
        
        var fixedXY = {};
        src.onpointerdown =  function (e) {      
            e.preventDefault();
            e.stopPropagation()
            content.style.touchAction = 'none';// 중요. 안해주면 드래그 안됨.
            cloneSrc.style.position = 'absolute';
            cloneSrc.style.zIndex = 99999999999999;
            cloneSrc.style.opacity = '0.6';    
            cloneSrc.style.left = src.getBoundingClientRect().left + 'px';
            cloneSrc.style.top = src.getBoundingClientRect().top + 'px';      
            fixedXY.x = e.clientX - src.getBoundingClientRect().left;
            fixedXY.y = e.clientY - src.getBoundingClientRect().top;
            content.appendChild(cloneSrc);
            cloneSrc.setPointerCapture(e.pointerId);
            src.style.visibility = "hidden";
        };
        cloneSrc.onpointermove =function (e) {
            e.preventDefault();
            e.stopPropagation()
            cloneSrc.setPointerCapture(e.pointerId);
            
            cloneSrc.style.left = (e.clientX-fixedXY.x) + 'px';
            cloneSrc.style.top = (e.clientY-fixedXY.y) + 'px'
        }
        cloneSrc.onpointerup = function (e) {
            e.preventDefault();
            e.stopPropagation()
            
            cloneSrc.releasePointerCapture(e.pointerId);    
            content.style.touchAction = 'auto';
            //드래그 되는 이미지는 제거하고,
            cloneSrc.remove();
            //마우스 포인터가 tgt에 들어가 있는지 판별 시작
            var currentTarget;
            for(var i = 0; i < dragdrop_o.target.length; i ++) {
                var target = dragdrop_o.target[i];                
                if((e.clientX >= target.getBoundingClientRect().left && e.clientX <= target.getBoundingClientRect().right) && (e.clientY >= target.getBoundingClientRect().top && e.clientY <= target.getBoundingClientRect().bottom)){
                    currentTarget = target;                                    
                    
                    break;                                     
                }            
            }
            
            var isOverLength = false;
            if(currentTarget){
                var srcs = currentTarget.querySelectorAll('[data-type="dragdrop_src"]');
                
                if(srcs.length >= target.dataset.maxlength) {
                    isOverLength = true;
                }
            }
            
            
            if(currentTarget && !isOverLength) {
                var newObj = src.cloneNode(false);
                
                if(newObj) {
                    dragdrop_o.setAddedItem(newObj);
                    dragdrop_o.send();                     
                    if(src.dataset.instyle) newObj.setAttribute("style", src.dataset.instyle);
                    else newObj.setAttribute("style", "");
                    
                    if(currentTarget.dataset.instyle) newObj.setAttribute("style", currentTarget.dataset.instyle);
                    if(currentTarget.dataset.instyle && currentTarget.dataset.instyle.indexOf('absolute') != -1) {                        
                        newObj.style.position = "absolute";
                        newObj.style.left = (e.clientX-fixedXY.x) - currentTarget.getBoundingClientRect().left + "px";
                        newObj.style.top = (e.clientY-fixedXY.y) - currentTarget.getBoundingClientRect().top + "px";
                    }
                    newObj.style.visibility = "visible";
                    currentTarget.appendChild(newObj);
                    dragdrop_o.send();
                }
            }else{
                src.style.visibility = "visible";
            }
        };         
    },
    setSourceBox: function(srcbox) {
        if(!srcbox) return;
       
    },
    checkTgts: function () {
        for(i = 0; i < dragdrop_o.target.length; i++) {
            var count = 0;
            var obj;
            for(j = 0; j < dragdrop_o.target[i].childElementCount; j++) {
                obj = dragdrop_o.target[i].children[j];
                if(obj.dataset.type && obj.dataset.type === "dragdrop_src") count++;
            }
            // console.log('checkTgts count', count);
            for(j = 0; j < dragdrop_o.target[i].childElementCount; j++) {
                obj = dragdrop_o.target[i].children[j];
                if(obj.dataset.type && obj.dataset.type === "dragdrop_text") {
                    if(count === 0) obj.style.display = '';
                    else obj.style.display = 'none';
                }
            }
        }
    },
    send: function () {
        dragdrop_o.checkTgts();
        var idxs = [];
        var values = [];
        if(dragdrop_o.subtype === 2) {
            for(i = 0; i < dragdrop_o.target.length; i++) {
                idxs.push(i);
                var count = 0;
                if(dragdrop_o.target[i].childElementCount > 0) {
                    for(j = 0; j < dragdrop_o.target[i].childElementCount; j++) {
                        var obj = dragdrop_o.target[i].children[j];
                        if(obj.dataset.type && obj.dataset.type === "dragdrop_src") {
                            count++;
                        }
                    }
                }     
                values.push(count + "");
            }
            // console.log('===> dragdrop iscount true idxs', idxs, 'values', values);
            if(idxs.length > 0 && values.length > 0) {
                msg = {};
                msg.basetype = 2; 
                msg.basetypename = "Drag&Drop"; 
                msg.subtype = 2;
                msg.subtypename = "drag&drop count";
                msg.choicedIdx = idxs;
                msg.choicedValue = values;
                // console.log('===> dragdrop msg', msg);
                sendPostMessage("submit", msg);
            }
        } else {
            for(i = 0; i < dragdrop_o.target.length; i++) {
                idxs.push(i);
                if(dragdrop_o.target[i].childElementCount > 0) {
                    var value = "";
                    for(j = 0; j < dragdrop_o.target[i].childElementCount; j++) {
                        var obj = dragdrop_o.target[i].children[j];
                        if(obj.dataset.type && obj.dataset.type === "dragdrop_src") {
                            if(value == "") value = obj.dataset.value;
                            else value += "," + obj.dataset.value;
                        }
                    }
                    if(value === "") values.push("0");
                    else values.push(value);
                } else values.push("0");     
            }
            // console.log('===> dragdrop iscount false idxs', idxs, 'values', values);
            if(idxs.length > 0 && values.length > 0) {
                msg = {};
                msg.basetype = 2; 
                msg.basetypename = "Drag&Drop"; 
                msg.subtype = dragdrop_o.subtype;
                if(dragdrop_o.subtype === 4) msg.subtypename = "drag&drop group_matchone";
                else msg.subtypename = "drag&drop";
                msg.choicedIdx = idxs;
                msg.choicedValue = values;
                // console.log('===> dragdrop msg', msg);
                sendPostMessage("submit", msg);
            }
        }
    },
    setCompleted: function (completed) {
        // console.log('====> setCompleted completed', completed);
        dragdrop_o.completed = completed;
    },
    reset: function () {
        var tgts = document.querySelectorAll("[data-type='dragdrop_tgt']");
        var srcbox = document.querySelector("[data-type='dragdrop_srcbox']");
        if(!tgts || tgts.length === 0 || !srcbox) return;
        for(var i = 0; i < tgts.length; i++) {
            if(tgts[i].childElementCount > 0) {
                // for(j = 0; j < tgts[i].; j++) {
                //     // console.log('j', j);
                //     var obj = tgts[i].children
                //     srcbox.appendChild(obj);
                //     tgts[i].removeChild(obj);
                // }
            }        
        }
    },
};

var dragdropcp_o = {
    idx: -1,
    target: [],
    source: [],
    sourcebox: null,
    completed: false,
    subtype: -1,
    init: function (idx, subtype) {
        if(dragdropcp_o.idx === idx) return;
        dragdropcp_o.idx = idx;
        dragdropcp_o.subtype = subtype;
        dragdropcp_o.reset();
        dragdropcp_o.groupcnt = 0;
        dragdropcp_o.source = [];
        dragdropcp_o.target = [];
        var tgts = document.querySelectorAll("[data-type='dragdrop_tgt']");
        if(tgts.length < 1) return;
        for(var i = 0; i < tgts.length; i++) {
            var findIdx = dragdropcp_o.target.findIndex((item) => item.id === tgts[i].id);
            if(findIdx < 0) dragdropcp_o.target.push(tgts[i]);
            dragdropcp_o.setTarget(tgts[i]);
        }
        dragdropcp_o.target = dragdropcp_o.target.sort((a, b) => a.id.localeCompare( b.id, 'en', { numeric: true }));
        var srcs = document.querySelectorAll("[data-type='dragdrop_src']");
        if(!srcs || srcs.length < 1) return;
        for(var i = 0; i < srcs.length; i++) {
            var findIdx = dragdropcp_o.source.findIndex((item) => item.id === srcs[i].id);
            if(findIdx < 0) dragdropcp_o.source.push(srcs[i]);
            dragdropcp_o.setSource(srcs[i]);
        }
        var srcbox = document.querySelector("[data-type='dragdrop_srcbox']");
        if(!srcbox) return;
        dragdropcp_o.sourcebox = srcbox;
        dragdropcp_o.setSourceBox(srcbox);
        // console.log('dragdropcp_o init', dragdropcp_o.source, dragdropcp_o.target, dragdropcp_o.sourcebox);
    },
    setTarget: function(tgt) {
        if(!tgt) return;        
    },
    setAddedItem: function(src) {
        //타겟 박스에 들어간 아이템의 처리, 박스끼리의 이동, 지우기처리
        if(!src) return;       
        src.draggable = false;
        var cloneSrc = src.cloneNode();
        var content = document.querySelector('.content_page');     
        
        var fixedXY = {};
        src.onpointerdown = function (e) {      
            content.style.touchAction = 'none';// 중요. 안해주면 드래그 안됨.
            cloneSrc.style.position = 'absolute';
            cloneSrc.style.zIndex = 99999999999999;
            cloneSrc.style.opacity = '0.6';    
            cloneSrc.style.left = src.getBoundingClientRect().left + 'px';
            cloneSrc.style.top = src.getBoundingClientRect().top + 'px';      
            fixedXY.x = e.clientX - src.getBoundingClientRect().left;
            fixedXY.y = e.clientY - src.getBoundingClientRect().top;
            content.appendChild(cloneSrc);
            src.style.display = "none";
            cloneSrc.setPointerCapture(e.pointerId);
            // src.style.backgroundColor = 'red';           
        };
        cloneSrc.onpointermove = function (e) {
            cloneSrc.setPointerCapture(e.pointerId);
            // console.log('pointermove', e);
            cloneSrc.style.left = (e.clientX-fixedXY.x) + 'px';
            cloneSrc.style.top = (e.clientY-fixedXY.y) + 'px'
        };
        cloneSrc.onpointerup = function (e) {
            // console.log('pointerup', e);
            cloneSrc.releasePointerCapture(e.pointerId);    
            content.style.touchAction = 'auto';
            //드래그 되는 이미지는 제거하고,
            cloneSrc.remove();
            var isParentSame = false;
            var isInside = false;
            var isOverLength = false;
            var dragedParent;
            //마우스 포인터가 tgt에 들어가 있는지 판별 시작
            for(var i = 0; i < dragdropcp_o.target.length; i ++) {
                var target = dragdropcp_o.target[i];                
                if(src.parentNode !== target) {
                    if((e.clientX >= target.getBoundingClientRect().left && e.clientX <= target.getBoundingClientRect().right) && (e.clientY >= target.getBoundingClientRect().top && e.clientY <= target.getBoundingClientRect().bottom)){                    
                        isInside = true;
                        dragedParent = target;
                        if(target.dataset.maxlength) {
                            var srcs = target.querySelectorAll('[data-type="dragdrop_src"]');
                            
                            if(srcs.length >= target.dataset.maxlength) {
                                isOverLength = true;
                            }
                        }                                                                        
                    }                    
                }else{                    
                    if((e.clientX >= target.getBoundingClientRect().left && e.clientX <= target.getBoundingClientRect().right) && (e.clientY >= target.getBoundingClientRect().top && e.clientY <= target.getBoundingClientRect().bottom)){                    
                        isInside = true;
                        isParentSame = true;
                        dragedParent = target;
                    }                  
                }                           
            }
            if(isInside && isParentSame) {
                //그냥 박스안에서의 드래그, 다시 보여주기
                if(dragedParent.dataset.instyle) src.setAttribute("style", dragedParent.dataset.instyle);
                if(dragedParent.dataset.instyle && dragedParent.dataset.instyle.indexOf('absolute') != -1) {
                    src.style.position = "absolute";
                    src.style.left = (e.clientX-fixedXY.x) - dragedParent.getBoundingClientRect().left + "px";
                    src.style.top = (e.clientY-fixedXY.y) - dragedParent.getBoundingClientRect().top + "px";                    
                }
                src.style.display = "block";
            }else if(isInside) {
                if(isOverLength) {
                    //옮긱자 하는 타겟 아이템이 꽉참. 다시 원위치
                    src.style.display = "block";
                }else{
                    // 아이템이 꽉 안찼을 때는 그쪽으로 옮기기
                    src.style.display = "block";
                    if(dragedParent.dataset.instyle) src.setAttribute("style", dragedParent.dataset.instyle);
                    if(dragedParent.dataset.instyle && dragedParent.dataset.instyle.indexOf('absolute') != -1) {
                        src.style.position = "absolute";
                        src.style.left = (e.clientX-fixedXY.x) - dragedParent.getBoundingClientRect().left + "px";
                        src.style.top = (e.clientY-fixedXY.y) - dragedParent.getBoundingClientRect().top + "px";                    
                    }
                    dragedParent.appendChild(src);

                }
            }else{
                //그외 바깥으로 드래그한경우는 그냥 지우기
                src.remove();
            }
            dragdropcp_o.send();
        };
    }, 
    setSource: function(src) {
        if(!src) return;
        src.draggable = false;
        var cloneSrc = src.cloneNode();
        var content = document.querySelector('.content_page');     
        
        var fixedXY = {};
        src.onpointerdown =  function (e) {      
            e.preventDefault();
            e.stopPropagation()
            content.style.touchAction = 'none';// 중요. 안해주면 드래그 안됨.
            cloneSrc.style.position = 'absolute';
            cloneSrc.style.zIndex = 99999999999999;
            cloneSrc.style.opacity = '0.6';    
            cloneSrc.style.left = src.getBoundingClientRect().left + 'px';
            cloneSrc.style.top = src.getBoundingClientRect().top + 'px';      
            fixedXY.x = e.clientX - src.getBoundingClientRect().left;
            fixedXY.y = e.clientY - src.getBoundingClientRect().top;
            content.appendChild(cloneSrc);
            cloneSrc.setPointerCapture(e.pointerId);
            // src.style.backgroundColor = 'red';           
        };
        cloneSrc.onpointermove =function (e) {
            e.preventDefault();
            e.stopPropagation()
            cloneSrc.setPointerCapture(e.pointerId);
            
            cloneSrc.style.left = (e.clientX-fixedXY.x) + 'px';
            cloneSrc.style.top = (e.clientY-fixedXY.y) + 'px'
        }
        cloneSrc.onpointerup = function (e) {
            e.preventDefault();
            e.stopPropagation()
            
            cloneSrc.releasePointerCapture(e.pointerId);    
            content.style.touchAction = 'auto';
            //드래그 되는 이미지는 제거하고,
            cloneSrc.remove();
            //마우스 포인터가 tgt에 들어가 있는지 판별 시작
            var currentTarget;
            for(var i = 0; i < dragdropcp_o.target.length; i ++) {
                var target = dragdropcp_o.target[i];                
                if((e.clientX >= target.getBoundingClientRect().left && e.clientX <= target.getBoundingClientRect().right) && (e.clientY >= target.getBoundingClientRect().top && e.clientY <= target.getBoundingClientRect().bottom)){
                    currentTarget = target;                                    
                    
                    break;                                     
                }            
            }
            var isOverLength = false;
            if(currentTarget){
            var srcs = currentTarget.querySelectorAll('[data-type="dragdrop_src"]');
            
            if(srcs.length >= target.dataset.maxlength) {
                isOverLength = true;
            }
            }
            if(currentTarget && !isOverLength) {
                var newObj = src.cloneNode(false);
                
                if(newObj) {
                    dragdropcp_o.setAddedItem(newObj);
                    dragdropcp_o.send();                     
                    if(src.dataset.instyle) newObj.setAttribute("style", src.dataset.instyle);
                    else newObj.setAttribute("style", "");
                    
                    if(currentTarget.dataset.instyle) newObj.setAttribute("style", currentTarget.dataset.instyle);
                    if(currentTarget.dataset.instyle && currentTarget.dataset.instyle.indexOf('absolute') != -1) {                        
                        newObj.style.position = "absolute";
                        newObj.style.left = (e.clientX-fixedXY.x) - currentTarget.getBoundingClientRect().left + "px";
                        newObj.style.top = (e.clientY-fixedXY.y) - currentTarget.getBoundingClientRect().top + "px";
                    
                    }
                    currentTarget.appendChild(newObj);
                    dragdropcp_o.send();
                }
            }
        };                
    },
    setSourceBox: function(srcbox) {
        if(!srcbox) return;
        
    },
    checkTgts: function () {
        for(i = 0; i < dragdropcp_o.target.length; i++) {
            var count = 0;
            var obj;
            for(j = 0; j < dragdropcp_o.target[i].childElementCount; j++) {
                obj = dragdropcp_o.target[i].children[j];
                if(obj.dataset.type && obj.dataset.type === "dragdrop_src") count++;
            }
            // console.log('checkTgts count', count);
            for(j = 0; j < dragdropcp_o.target[i].childElementCount; j++) {
                obj = dragdropcp_o.target[i].children[j];
                if(obj.dataset.type && obj.dataset.type === "dragdrop_text") {
                    if(count === 0) obj.style.display = '';
                    else obj.style.display = 'none';
                }
            }
        }
    },
    send: function () {
        dragdropcp_o.checkTgts();
        var idxs = [];
        var values = [];
        if(dragdropcp_o.subtype === 3) {
            for(i = 0; i < dragdropcp_o.target.length; i++) {
                idxs.push(i);
                var count = 0;
                if(dragdropcp_o.target[i].childElementCount > 0) {
                    for(j = 0; j < dragdropcp_o.target[i].childElementCount; j++) {
                        var obj = dragdropcp_o.target[i].children[j];
                        if(obj.dataset.type && obj.dataset.type === "dragdrop_src") {
                            count++;
                        }
                    }
                }     
                values.push(count + "");
            }
            // console.log('===> dragdropcp iscount true idxs', idxs, 'values', values);
            if(idxs.length > 0 && values.length > 0) {
                msg = {};
                msg.basetype = 2; 
                msg.basetypename = "Drag&Drop"; 
                msg.subtype = 3;
                msg.subtypename = "drag&drop copy&count";
                msg.choicedIdx = idxs;
                msg.choicedValue = values;
                // console.log('===> dragdropcp msg', msg);
                sendPostMessage("submit", msg);
            }
        } else {
            for(i = 0; i < dragdropcp_o.target.length; i++) {
                idxs.push(i);
                if(dragdropcp_o.target[i].childElementCount > 0) {
                    var value = "";
                    for(j = 0; j < dragdropcp_o.target[i].childElementCount; j++) {
                        var obj = dragdropcp_o.target[i].children[j];
                        if(obj.dataset.type && obj.dataset.type === "dragdrop_src") {
                            if(value == "") value = obj.dataset.value;
                            else value += "," + obj.dataset.value;
                        }
                    }
                    if(value === "") values.push("0");
                    else values.push(value);
                } else values.push("0");     
            }
            // console.log('===> dragdropcp iscount false idxs', idxs, 'values', values);
            if(idxs.length > 0 && values.length > 0) {
                msg = {};
                msg.basetype = 2; 
                msg.basetypename = "Drag&Drop"; 
                msg.subtype = 1;
                msg.subtypename = "drag&drop copy";
                msg.choicedIdx = idxs;
                msg.choicedValue = values;
                // console.log('===> dragdropcp msg', msg);
                sendPostMessage("submit", msg);
            }
        }
    },
    setCompleted: function (completed) {
        // console.log('====> setCompleted completed', completed);
        dragdropcp_o.completed = completed;
    },
    reset: function () {
        var tgts = document.querySelectorAll("[data-type='dragdrop_tgt']");
        var srcbox = document.querySelector("[data-type='dragdrop_srcbox']");
        if(!tgts || tgts.length === 0 || !srcbox) return;
        for(var i = 0; i < tgts.length; i++) {
            if(tgts[i].childElementCount > 0) {
                // for(j = 0; j < tgts[i].; j++) {
                //     // console.log('j', j);
                //     var obj = tgts[i].children
                //     srcbox.appendChild(obj);
                //     tgts[i].removeChild(obj);
                // }
            }        
        }
    },
};

//drag drop copy group match one
var dragdropcp_group_o = {
    idx: -1,
    target: [],
    source: [],
    sourcebox: null,
    completed: false,
    subtype: -1,
    init: function (idx, subtype) {
        if(dragdropcp_group_o.idx === idx) return;
        dragdropcp_group_o.idx = idx;
        dragdropcp_group_o.subtype = subtype;
        dragdropcp_group_o.reset();
        dragdropcp_group_o.groupcnt = 0;
        dragdropcp_group_o.source = [];
        dragdropcp_group_o.target = [];
        var tgts = document.querySelectorAll("[data-type='dragdrop_tgt']");
        
        if(tgts.length < 1) return;
        for(var i = 0; i < tgts.length; i++) {
            var findIdx = dragdropcp_group_o.target.findIndex((item) => item.id === tgts[i].id);
            if(findIdx < 0) dragdropcp_group_o.target.push(tgts[i]);
            dragdropcp_group_o.setTarget(tgts[i]);
        }
        var srcs = document.querySelectorAll("[data-type='dragdrop_src']");
        if(!srcs || srcs.length < 1) return;
        for(var i = 0; i < srcs.length; i++) {
            var findIdx = dragdropcp_group_o.source.findIndex((item) => item.id === srcs[i].id);
            if(findIdx < 0) dragdropcp_group_o.source.push(srcs[i]);
            dragdropcp_group_o.setSource(srcs[i]);
        }
        var srcbox = document.querySelector("[data-type='dragdrop_srcbox']");
        if(!srcbox) return;
        dragdropcp_group_o.sourcebox = srcbox;
        dragdropcp_group_o.setSourceBox(srcbox);
        // console.log('dragdropcp_group_o init', dragdropcp_group_o.source, dragdropcp_group_o.target, dragdropcp_group_o.sourcebox);
    },
    setTarget: function(tgt) {
        if(!tgt) return;        
    },
    setAddedItem: function(src) {
        //타겟 박스에 들어간 아이템의 처리, 박스끼리의 이동, 지우기처리
        if(!src) return;       
        src.draggable = false;
        var cloneSrc = src.cloneNode();
        var content = document.querySelector('.content_page');     
        
        var fixedXY = {};
        src.onpointerdown = function (e) {      
            content.style.touchAction = 'none';// 중요. 안해주면 드래그 안됨.
            cloneSrc.style.position = 'absolute';
            cloneSrc.style.zIndex = 99999999999999;
            cloneSrc.style.opacity = '0.6';    
            cloneSrc.style.left = src.getBoundingClientRect().left + 'px';
            cloneSrc.style.top = src.getBoundingClientRect().top + 'px';      
            fixedXY.x = e.clientX - src.getBoundingClientRect().left;
            fixedXY.y = e.clientY - src.getBoundingClientRect().top;
            content.appendChild(cloneSrc);
            src.style.display = "none";
            cloneSrc.setPointerCapture(e.pointerId);
            // src.style.backgroundColor = 'red';           
        };
        cloneSrc.onpointermove = function (e) {
            cloneSrc.setPointerCapture(e.pointerId);
            
            cloneSrc.style.left = (e.clientX-fixedXY.x) + 'px';
            cloneSrc.style.top = (e.clientY-fixedXY.y) + 'px'
        };
        cloneSrc.onpointerup = function (e) {
            
            cloneSrc.releasePointerCapture(e.pointerId);    
            content.style.touchAction = 'auto';
            //드래그 되는 이미지는 제거하고,
            cloneSrc.remove();
            var isParentSame = false;
            var isInside = false;
            var isOverLength = false;
            var dragedParent;
            //마우스 포인터가 tgt에 들어가 있는지 판별 시작
            for(var i = 0; i < dragdropcp_group_o.target.length; i ++) {
                var target = dragdropcp_group_o.target[i];
                
                if(src.parentNode !== target) {
                    if((e.clientX >= target.getBoundingClientRect().left && e.clientX <= target.getBoundingClientRect().right) && (e.clientY >= target.getBoundingClientRect().top && e.clientY <= target.getBoundingClientRect().bottom)){                    
                        isInside = true;
                        dragedParent = target;
                        if(target.dataset.maxlength) {
                            var srcs = target.querySelectorAll('[data-type="dragdrop_src"]');
                            
                            if(srcs.length >= target.dataset.maxlength) {
                                isOverLength = true;
                            }
                        }                                                                        
                    }                    
                }else{                    
                    if((e.clientX >= target.getBoundingClientRect().left && e.clientX <= target.getBoundingClientRect().right) && (e.clientY >= target.getBoundingClientRect().top && e.clientY <= target.getBoundingClientRect().bottom)){                    
                        isInside = true;
                        isParentSame = true;
                        dragedParent = target;
                    }                  
                }                           
            }
            if(isInside && isParentSame) {
                //그냥 박스안에서의 드래그, 다시 보여주기
                if(dragedParent.dataset.instyle) src.setAttribute("style", dragedParent.dataset.instyle);
                if(dragedParent.dataset.instyle && dragedParent.dataset.instyle.indexOf('absolute') != -1) {
                    src.style.position = "absolute";
                    src.style.left = (e.clientX-fixedXY.x) - dragedParent.getBoundingClientRect().left + "px";
                    src.style.top = (e.clientY-fixedXY.y) - dragedParent.getBoundingClientRect().top + "px";                    
                }
                src.style.display = "block";
            }else if(isInside) {
                if(isOverLength) {
                    //옮긱자 하는 타겟 아이템이 꽉참. 다시 원위치
                    src.style.display = "block";
                }else{
                    // 아이템이 꽉 안찼을 때는 그쪽으로 옮기기
                    src.style.display = "block";
                    if(dragedParent.dataset.instyle) src.setAttribute("style", dragedParent.dataset.instyle);
                    if(dragedParent.dataset.instyle && dragedParent.dataset.instyle.indexOf('absolute') != -1) {
                        src.style.position = "absolute";
                        src.style.left = (e.clientX-fixedXY.x) - dragedParent.getBoundingClientRect().left + "px";
                        src.style.top = (e.clientY-fixedXY.y) - dragedParent.getBoundingClientRect().top + "px";                    
                    }
                    dragedParent.appendChild(src);

                }
            }else{
                //그외 바깥으로 드래그한경우는 그냥 지우기
                src.remove();
            }
            dragdropcp_group_o.send();
        };
    }, 
    setSource: function(src) {
        if(!src) return;
        src.draggable = false;
        var cloneSrc = src.cloneNode();
        var content = document.querySelector('.content_page');     
        
        var fixedXY = {};
        src.onpointerdown =  function (e) {      
            e.preventDefault();
            e.stopPropagation()
            content.style.touchAction = 'none';// 중요. 안해주면 드래그 안됨.
            cloneSrc.style.position = 'absolute';
            cloneSrc.style.zIndex = 99999999999999;
            cloneSrc.style.opacity = '0.6';    
            cloneSrc.style.left = src.getBoundingClientRect().left + 'px';
            cloneSrc.style.top = src.getBoundingClientRect().top + 'px';      
            fixedXY.x = e.clientX - src.getBoundingClientRect().left;
            fixedXY.y = e.clientY - src.getBoundingClientRect().top;
            content.appendChild(cloneSrc);
            cloneSrc.setPointerCapture(e.pointerId);
            // src.style.backgroundColor = 'red';           
        };
        cloneSrc.onpointermove =function (e) {
            e.preventDefault();
            e.stopPropagation()
            cloneSrc.setPointerCapture(e.pointerId);
            
            cloneSrc.style.left = (e.clientX-fixedXY.x) + 'px';
            cloneSrc.style.top = (e.clientY-fixedXY.y) + 'px'
        }
        cloneSrc.onpointerup = function (e) {
            e.preventDefault();
            e.stopPropagation()
            
            cloneSrc.releasePointerCapture(e.pointerId);    
            content.style.touchAction = 'auto';
            //드래그 되는 이미지는 제거하고,
            cloneSrc.remove();
            //마우스 포인터가 tgt에 들어가 있는지 판별 시작
            var currentTarget;
            for(var i = 0; i < dragdropcp_group_o.target.length; i ++) {
                var target = dragdropcp_group_o.target[i];                
                if((e.clientX >= target.getBoundingClientRect().left && e.clientX <= target.getBoundingClientRect().right) && (e.clientY >= target.getBoundingClientRect().top && e.clientY <= target.getBoundingClientRect().bottom)){
                    currentTarget = target;                                    
                    
                    break;                                     
                }            
            }
            var isOverLength = false;
            if(currentTarget){
            var srcs = currentTarget.querySelectorAll('[data-type="dragdrop_src"]');
            // console.log('srcs',srcs);
            if(srcs.length >= target.dataset.maxlength) {
                isOverLength = true;
            }
            }
            if(currentTarget && !isOverLength) {
                var newObj = src.cloneNode(false);
                
                if(newObj) {
                    dragdropcp_group_o.setAddedItem(newObj);
                    dragdropcp_group_o.send();                     
                    if(src.dataset.instyle) newObj.setAttribute("style", src.dataset.instyle);
                    else newObj.setAttribute("style", "");
                    
                    if(currentTarget.dataset.instyle) newObj.setAttribute("style", currentTarget.dataset.instyle);
                    if(currentTarget.dataset.instyle && currentTarget.dataset.instyle.indexOf('absolute') != -1) {                        
                        newObj.style.position = "absolute";
                        newObj.style.left = (e.clientX-fixedXY.x) - currentTarget.getBoundingClientRect().left + "px";
                        newObj.style.top = (e.clientY-fixedXY.y) - currentTarget.getBoundingClientRect().top + "px";
                    
                    }
                    currentTarget.appendChild(newObj);
                    dragdropcp_group_o.send();
                }
            }
        };                
    },
    setSourceBox: function(srcbox) {
        if(!srcbox) return;
        
    },
    checkTgts: function () {
        for(i = 0; i < dragdropcp_group_o.target.length; i++) {
            var count = 0;
            var obj;
            for(j = 0; j < dragdropcp_group_o.target[i].childElementCount; j++) {
                obj = dragdropcp_group_o.target[i].children[j];
                if(obj.dataset.type && obj.dataset.type === "dragdrop_src") count++;
            }
            // console.log('checkTgts count', count);
            for(j = 0; j < dragdropcp_group_o.target[i].childElementCount; j++) {
                obj = dragdropcp_group_o.target[i].children[j];
                if(obj.dataset.type && obj.dataset.type === "dragdrop_text") {
                    if(count === 0) obj.style.display = '';
                    else obj.style.display = 'none';
                }
            }
        }
    },
    send: function () {
        dragdropcp_group_o.checkTgts();
        var idxs = [];
        var groupValues = [];
        // console.log('dragdropcp_group_o.target',dragdropcp_group_o.target);
        for(i = 0; i < dragdropcp_group_o.target.length; i++) {
            idxs.push(i);
            if(!dragdropcp_group_o.target[i].dataset.group) continue;
            // console.log('dragdropcp_group_o.target -dataset-group',dragdropcp_group_o.target[i].dataset.group);
            if(dragdropcp_group_o.target[i].childElementCount > 0) {
                var value = "";
                for(j = 0; j < dragdropcp_group_o.target[i].childElementCount; j++) {
                    var obj = dragdropcp_group_o.target[i].children[j];
                    if(obj.dataset.type && obj.dataset.type === "dragdrop_src") {
                        if(value == "") value = obj.dataset.value;
                        else value += "," + obj.dataset.value;
                    }
                }
                if(value === "") groupValues[Number(dragdropcp_group_o.target[i].dataset.group)-1] = "0";
                else groupValues[Number(dragdropcp_group_o.target[i].dataset.group)-1] = value;
            } else groupValues[Number(dragdropcp_group_o.target[i].dataset.group)-1] = "0";     
        }
        // console.log('===> dragdropcp group match one idxs', idxs, 'values', groupValues);
        if(idxs.length > 0 && groupValues.length > 0) {
            msg = {};
            msg.basetype = 2; 
            msg.basetypename = "Drag&Drop"; 
            msg.subtype = 5;
            msg.subtypename = "drag&drop copy group math";
            msg.choicedIdx = idxs;
            msg.choicedValue = groupValues;
            // console.log('===> dragdropcp group msg', msg);
            sendPostMessage("submit", msg);
        }
    },
    setCompleted: function (completed) {
        // console.log('====> setCompleted completed', completed);
        dragdropcp_group_o.completed = completed;
    },
    reset: function () {
        var tgts = document.querySelectorAll("[data-type='dragdrop_tgt']");
        var srcbox = document.querySelector("[data-type='dragdrop_srcbox']");
        if(!tgts || tgts.length === 0 || !srcbox) return;
        for(var i = 0; i < tgts.length; i++) {
            if(tgts[i].childElementCount > 0) {
                // for(j = 0; j < tgts[i].; j++) {
                //     // console.log('j', j);
                //     var obj = tgts[i].children
                //     srcbox.appendChild(obj);
                //     tgts[i].removeChild(obj);
                // }
            }        
        }
    },
};

// Add/Remove
var dragadd_o = {
    idx: -1,
    groupcnt: 1,
    subgroupcnt: [],
    target: [],
    source: [],
    trashbin: [],
    completed: false,
    subtype: -1,
    init: function (idx, subtype) {
        if(dragadd_o.idx === idx) return;
        dragadd_o.idx = idx;
        dragadd_o.subtype = subtype;
        dragadd_o.reset();
        dragadd_o.groupcnt = 1;
        dragadd_o.subgroupcnt = [];
        dragadd_o.source = [];
        dragadd_o.target = [];
        dragadd_o.trashbin = [];
        dragadd_o.completed = false;
        var srcs = document.querySelectorAll("[data-type='dragadd_src']");
        if(srcs.length < 1) return;
        for(var i = 0; i < srcs.length; i++) {
            if(srcs[i].dataset.group) {
                if(parseInt(srcs[i].dataset.group) > dragadd_o.groupcnt) dragadd_o.groupcnt = parseInt(srcs[i].dataset.group); 
                if(srcs[i].dataset.subgroup) {
                    // console.log('===>1 dragadd srcs[i].dataset.subgroup', srcs[i].dataset.subgroup);
                    if(dragadd_o.subgroupcnt.length < parseInt(srcs[i].dataset.group)) {
                        for(var j = dragadd_o.subgroupcnt.length; j < parseInt(srcs[i].dataset.group); j++)
                            dragadd_o.subgroupcnt.push(0);
                    }
                    if(dragadd_o.subgroupcnt[srcs[i].dataset.group - 1] < parseInt(srcs[i].dataset.subgroup))
                        dragadd_o.subgroupcnt[srcs[i].dataset.group - 1] = parseInt(srcs[i].dataset.subgroup);
                    // console.log('===>1 dragadd srcs[i].dataset.subgroup', srcs[i].dataset.group, dragadd_o.subgroupcnt[srcs[i].dataset.group - 1]);
                }
            } else if (srcs[i].dataset.subgroup) {
                if(dragadd_o.subgroupcnt.length === 0) dragadd_o.subgroupcnt.push(parseInt(srcs[i].dataset.subgroup));
                else if(parseInt(srcs[i].dataset.subgroup) > dragadd_o.subgroupcnt[0]) dragadd_o.groupcnt = parseInt(srcs[i].dataset.group);  
            }
        }
        if(dragadd_o.groupcnt < 1) return;
        for(i = 0; i < dragadd_o.groupcnt; i++) {
            dragadd_o.target[i] = [];
            dragadd_o.source[i] = [];
            dragadd_o.trashbin[i] = [];
        }
        for(i = 0; i < srcs.length; i++) {
            var findIdx = -1;
            if(srcs[i].dataset.group) {
                var group = parseInt(srcs[i].dataset.group);
                findIdx = dragadd_o.source[group-1].findIndex((item) => item.id === srcs[i].id);
                if(findIdx < 0) dragadd_o.source[group-1].push(srcs[i]);
                dragadd_o.setSource(srcs[i]);
            } else {
                findIdx = dragadd_o.source[0].findIndex((item) => item.id === srcs[i].id);
                if(findIdx < 0) dragadd_o.source[0].push(srcs[i]);
                dragadd_o.setSource(srcs[i]);
            }
        }
        var trashbins = document.querySelectorAll("[data-type='dragadd_trashbin']");
        if(trashbins && trashbins.length > 0) {
            for(i = 0; i < trashbins.length; i++) {
                var findIdx = -1;
                if(trashbins[i].dataset.group) {
                    var group = parseInt(trashbins[i].dataset.group);
                    findIdx = dragadd_o.trashbin[group-1].findIndex((item) => item.id === trashbins[i].id);
                    if(findIdx < 0) dragadd_o.trashbin[group-1].push(trashbins[i]);
                    dragadd_o.setTrashBin(trashbins[i]);
                } else {
                    findIdx = dragadd_o.trashbin[0].findIndex((item) => item.id === trashbins[i].id);
                    if(findIdx < 0) dragadd_o.trashbin[0].push(trashbins[i]);
                    dragadd_o.setTrashBin(trashbins[i]);
                }
            }
        } 
        var tgts = document.querySelectorAll("[data-type='dragadd_tgt']");
        if(tgts && tgts.length > 0) {
            for(i = 0; i < tgts.length; i++) {
                var findIdx = -1;
                if(tgts[i].dataset.group) {
                    var group = parseInt(tgts[i].dataset.group);
                    findIdx = dragadd_o.target[group-1].findIndex((item) => item.id === tgts[i].id);
                    if(findIdx < 0) dragadd_o.target[group-1].push(tgts[i]);
                    dragadd_o.setTarget(tgts[i]);
                } else {
                    findIdx = dragadd_o.target[0].findIndex((item) => item.id === tgts[i].id);
                    if(findIdx < 0) dragadd_o.target[0].push(tgts[i]);
                    dragadd_o.setTarget(tgts[i]);
                }
            }
            for(i = 0; i < dragadd_o.target.length; i++) {
                for (var j = 0; j < dragadd_o.target[i].length; j++) {
                    dragadd_o.target[i] = dragadd_o.target[i].sort((a, b) => a.id.localeCompare( b.id, 'en', { numeric: true }));
                }
            }
        }
        // console.log('dragadd_o init', dragadd_o.source, dragadd_o.trashbin, dragadd_o.target);
    },
    setTarget: function(tgt) {
        if(!tgt) return;
        //drag drop과 차별을 두기 위한 요청으로 드래그 이벤트 처리 제거
        // tgt.addEventListener('dragstart', function (e) {
        //     e.dataTransfer.setData('id', this.id);
        // });
        // tgt.addEventListener('dragenter', function (e) {
        //     e.preventDefault();
        //     e.stopPropagation(); // stop it here to prevent it bubble up
        // });
        // tgt.addEventListener('dragover', function (e) {
        //     e.preventDefault(); // allows us to drop
        //     e.stopPropagation(); // stop it here to prevent it bubble up
        // });
        // tgt.addEventListener('dragexit', function (e) {
        //     e.stopPropagation(); // stop it here to prevent it bubble up
        // });
        // tgt.addEventListener('dragleave', function (e) {
        //     e.stopPropagation(); // stop it here to prevent it bubble up
        // });
        // tgt.addEventListener('drop', function (e) {
        //     e.preventDefault();
        //     e.stopPropagation(); // stop it here to prevent it bubble up
        //     if(tgt.childElementCount > 0) return;

        //     var group = 0;
        //     if(tgt.dataset.group) {
        //         group = parseInt(tgt.dataset.group);
        //     } else {
        //         group = 1;
        //     }
        //     if(dragadd_o.target.length < group) return;
        //     if(dragadd_o.target[group-1].length === 0) return;
        //     if(dragadd_o.source.length < group) return;
        //     if(dragadd_o.source[group-1].length === 0) return;

        //     var curSrc = null;
        //     for(i = 0; i < dragadd_o.source[group-1].length; i++) {
        //         if(dragadd_o.source[group-1][i].id == e.dataTransfer.getData('id')) {
        //             curSrc = dragadd_o.source[group-1][i];
        //             break;
        //         }
        //     }
        //     if(!curSrc) return;
        //     // console.log('tgt drop tgt', tgt, 'curSrc', curSrc);
        //     if(tgt.dataset.group !== curSrc.dataset.group) return;
        //     var newObj = curSrc.cloneNode(false);
        //     if(newObj) {
        //         this.appendChild(newObj);
        //         dragadd_o.send();
        //     }
        // });
    }, 
    setSource: function(src) {
        if(!src) return;
        //drag drop과 차별을 두기 위한 요청으로 드래그 이벤트 처리 제거 및 draggable false처리
        src.draggable = false;
        // src.addEventListener('dragstart', function (e) {
        //     e.dataTransfer.setData('id', this.id);
        // });
        // src.addEventListener('drag', function (e) {
        //     // console.log('src drag');
        // });
        // src.addEventListener('dragend', function (e) {
        //     // console.log('src dragend with effect: ' + e.dataTransfer.dropEffect);
        // });
        src.addEventListener('click', function (e) {
            e.stopPropagation();
            e.preventDefault();

            // var tgt = e.target;
            if(src.dataset.type !== 'dragadd_src') return;

            var group = 0;
            if(src.dataset.group) {
                group = parseInt(src.dataset.group);
            } else {
                group = 1;
            }
            if(dragadd_o.target.length < group) return;
            if(dragadd_o.target[group-1].length === 0) return;

            var curTgt = null;
            for(i = 0; i < dragadd_o.target[group-1].length; i++) {
                if(dragadd_o.target[group-1][i].childElementCount == 0) {
                    curTgt = dragadd_o.target[group-1][i];
                    break;
                }
            }
            if(curTgt == null) return;
            // console.log('src click curTgt', curTgt, 'src', src);
            if(curTgt.dataset.group !== src.dataset.group) return;
            var newObj = this.cloneNode(false);
            if(newObj) {
                curTgt.appendChild(newObj);
                dragadd_o.send();
            }
        });
        src.addEventListener('dbclick', function (e) {
            e.preventDefault();
            e.stopPropagation();
            // console.log('dbclick', src.dataset.group, dragadd_o.target.length);
        });
    },
    setTrashBin: function(trashbin) {
        if(!trashbin) return;
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
            e.preventDefault();
            e.stopPropagation(); // stop it here to prevent it bubble up

            var group = 0;
            if(trashbin.dataset.group) {
                group = parseInt(trashbin.dataset.group);
            } else {
                group = 1;
            }
            if(dragadd_o.target.length < group) return;
            if(dragadd_o.target[group-1].length === 0) return;

            var curTgt = null;
            if(dragadd_o.subgroupcnt.length >= group && dragadd_o.subgroupcnt[group-1] > 0) {
                if(dragadd_o.trashbin[group-1].length === 1 && dragadd_o.trashbin[group-1][0].id === trashbin.id) {
                    for(i = dragadd_o.target[group-1].length - 1; i >= 0; i--) {
                        if(dragadd_o.target[group-1][i].id == e.dataTransfer.getData('id')) {
                            curTgt = dragadd_o.target[group-1][i];
                            break;
                        }
                    }
                } else {
                    for(i = dragadd_o.target[group-1].length - 1; i >= 0; i--) {
                        if(dragadd_o.target[group-1][i].id == e.dataTransfer.getData('id')
                            && dragadd_o.target[group-1][i].firstChild
                            && dragadd_o.target[group-1][i].firstChild.dataset.subgroup 
                            && dragadd_o.target[group-1][i].firstChild.dataset.subgroup === trashbin.dataset.subgroup) 
                        {
                            curTgt = dragadd_o.target[group-1][i];
                            break;
                        }
                    }
                }
            } else {
                for(i = dragadd_o.target[group-1].length - 1; i >= 0; i--) {
                    if(dragadd_o.target[group-1][i].id == e.dataTransfer.getData('id')) {
                        curTgt = dragadd_o.target[group-1][i];
                        break;
                    }
                }
            }
            if(curTgt == null) return;
            // console.log('trashbin drop curTgt.dataset.group', curTgt.dataset.group, 'trashbin.dataset.group', trashbin.dataset.group);
            if(curTgt.dataset.group !== trashbin.dataset.group) return;
            var imgObj = curTgt.firstChild;
            if(imgObj) {
                curTgt.removeChild(imgObj);
                dragadd_o.send();
            }
        });
        trashbin.addEventListener('click', function (e) {        
            e.preventDefault();
            e.stopPropagation(); // stop it here to prevent it bubble up

            var group = 0;
            if(trashbin.dataset.group) {
                group = parseInt(trashbin.dataset.group);
            } else {
                group = 1;
            }
            if(dragadd_o.target.length < group) return;
            if(dragadd_o.target[group-1].length === 0) return;

            var curTgt = null;
            if(dragadd_o.subgroupcnt.length >= group && dragadd_o.subgroupcnt[group-1] > 0) {
                if(dragadd_o.trashbin[group-1].length === 1 && dragadd_o.trashbin[group-1][0].id === trashbin.id) {
                    for(i = dragadd_o.target[group-1].length - 1; i >= 0; i--) {
                        if(dragadd_o.target[group-1][i].childElementCount > 0) {
                            curTgt = dragadd_o.target[group-1][i];
                            break;
                        }
                    }
                } else {
                    for(i = dragadd_o.target[group-1].length - 1; i >= 0; i--) {
                        if(dragadd_o.target[group-1][i].childElementCount > 0 
                            && dragadd_o.target[group-1][i].firstChild
                            && dragadd_o.target[group-1][i].firstChild.dataset.subgroup 
                            && dragadd_o.target[group-1][i].firstChild.dataset.subgroup === trashbin.dataset.subgroup) 
                        {
                            curTgt = dragadd_o.target[group-1][i];
                            break;
                        }
                    }
                }
            } else {
                for(i = dragadd_o.target[group-1].length - 1; i >= 0; i--) {
                    if(dragadd_o.target[group-1][i].childElementCount > 0) {
                        curTgt = dragadd_o.target[group-1][i];
                        break;
                    }
                }
            }
            if(curTgt == null) return;
            // console.log('trashbin click curTgt.dataset.group', curTgt.dataset.group, 'trashbin.dataset.group', trashbin.dataset.group);
            if(curTgt.dataset.group !== trashbin.dataset.group) return;
            var imgObj = curTgt.firstChild;
            if(imgObj) {
                curTgt.removeChild(imgObj);
                dragadd_o.send();
            }
        });
    },
    send: function () {
        if(dragadd_o.completed) return;
        var idxs = [];
        var values = [];
        var count = 0;
        var i;
        if(dragadd_o.subgroupcnt.length > 0) {
            var idx = 0;
            for(i = 0; i < dragadd_o.target.length; i++) {
                // console.log('===> dragadd dragadd_o.target[i]', dragadd_o.target[i], dragadd_o.subgroupcnt[i]);
                if(dragadd_o.subgroupcnt[i] > 0) {
                    var counts = [];
                    var j;
                    for (j = 0; j < dragadd_o.subgroupcnt[i]; j++) {
                        counts.push(0);
                        idxs.push(idx);
                        idx++;
                    }
                    // console.log('===> dragadd 1count', idx, counts, dragadd_o.target[i].length);
                    for (j = 0; j < dragadd_o.target[i].length; j++) {
                        if(dragadd_o.target[i][j].childElementCount == 0) continue;
                        else if(dragadd_o.target[i][j]){
                            for (var k = 0; k < dragadd_o.target[i][j].childElementCount; k++) {
                                // console.log('===> dragadd k', k, dragadd_o.target[i][j].children[k]);
                                if(dragadd_o.target[i][j].children[k] && dragadd_o.target[i][j].children[k].dataset.subgroup) {
                                    var subgroup = dragadd_o.target[i][j].children[k].dataset.subgroup;
                                    // console.log('===> dragadd subgroup', subgroup);
                                    counts[subgroup - 1]++;
                                }
                            }
                        }
                    }
                    for (j = 0; j < dragadd_o.subgroupcnt[i]; j++) {
                        values.push(counts[j] + "");
                    }
                    // console.log('===> dragadd sub', counts, idx, idxs, values);
                } else {    
                    idxs.push(idx);
                    idx++;
                    count = 0;
                    for (var j = 0; j < dragadd_o.target[i].length; j++) {
                        if(dragadd_o.target[i][j].childElementCount == 0) continue;
                        else count++;
                    }
                    values.push(count + "");
                }
            }
        } else {
            for(i = 0; i < dragadd_o.target.length; i++) {
                idxs.push(i);
                count = 0;
                for (var j = 0; j < dragadd_o.target[i].length; j++) {
                    if(dragadd_o.target[i][j].childElementCount == 0) continue;
                    else count++;
                }
                values.push(count + "");           
            }
        }
        // console.log('===> dragadd idxs', idxs, 'values', values);
        if(idxs.length > 0 && values.length > 0) {
            msg = {};
            msg.basetype = 4; 
            msg.basetypename = "Add/remove items"; 
            msg.subtype = dragadd_o.subtype;
            if(dragadd_o.subtype === 3) msg.subtypename = "gap plus";
            else msg.subtypename = "add/remove";
            msg.choicedIdx = idxs;
            msg.choicedValue = values;
            // console.log('===> dragadd msg', msg);
            sendPostMessage("submit", msg);
        }
    },
    setCompleted: function (completed) {
        // console.log('====> setCompleted completed', completed);
        dragadd_o.completed = completed;
    },
    reset: function () {
        var tgts = document.querySelectorAll("[data-type='dragadd_tgt']");
        if(!tgts || tgts.length === 0) return;
        for(var i = 0; i < tgts.length; i++) {
            if(tgts[i].childElementCount > 0) {
                var imgObj = tgts[i].firstChild;
                if(imgObj) tgts[i].removeChild(imgObj);
            }        
        }
    }, 
};

// Add/Remove Tally chart
var tallychart_o = {
    idx: -1,
    target: [],
    source: null,
    sourcebox: null,
    trashbin: null,
    completed: false,
    idno: 0,
    init: function (idx) {
        if(tallychart_o.idx === idx) return;
        tallychart_o.idx = idx;
        tallychart_o.reset();
        tallychart_o.source = null;
        tallychart_o.target = [];
        tallychart_o.trashbin = null;
        tallychart_o.completed = false;
        tallychart_o.idno = 0;
        var tgts = document.querySelectorAll("[data-type='dragadd_tgt']");
        if(tgts.length < 1) return;
        for(i = 0; i < tgts.length; i++) {
            findIdx = tallychart_o.target.findIndex((item) => item.id === tgts[i].id);
            if(findIdx < 0) tallychart_o.target.push(tgts[i]);
            tallychart_o.setTarget(tgts[i]);
        }
        var src = document.querySelector("[data-type='dragadd_src']");
        if(src) {
            tallychart_o.source = src;
            tallychart_o.setSource(src);
        }
        var srcbox = document.querySelector("[data-type='dragadd_srcbox']");
        if(srcbox) {
            tallychart_o.sourcebox = srcbox;
            tallychart_o.setSourceBox(srcbox);
        }
        var trashbins = document.querySelector("[data-type='dragadd_trashbin']");
        if(trashbins) {
            tallychart_o.trashbin = trashbins;
            tallychart_o.setTrashBin(trashbins);
        }
        // console.log('tallychart_o init', tallychart_o.source, tallychart_o.sourcebox, tallychart_o.trashbin, tallychart_o.target);
    },
    setTarget: function(tgt) {
        if(!tgt) return;
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
            e.preventDefault();
            e.stopPropagation(); // stop it here to prevent it bubble up
            // if(tgt.dataset.maxlength && tgt.childElementCount >= tgt.dataset.maxlength) return;

            var curSrc = null;
            if(tallychart_o.source && tallychart_o.source.id == e.dataTransfer.getData('id')) {
                curSrc = tallychart_o.source;
            }
            if(!curSrc) return;

            for(i = 0; i < tallychart_o.target.length; i++) {
                if(tgt.id !== tallychart_o.target[i].id && tallychart_o.target[i].classList.contains('on')) 
                   tallychart_o.target[i].classList.remove('on');
                else if(tgt.id === tallychart_o.target[i].id && !tallychart_o.target[i].classList.contains('on'))
                   tallychart_o.target[i].classList.add('on');
            }

            var newObj = curSrc.cloneNode(false);
            if(newObj) {
                newObj.id = 'srccp' + (++tallychart_o.idno);

                var count = 0;
                var removeObjs = [];
                var score = 0;
                for(i=0; i < tgt.childElementCount; i++) {
                    if(!tgt.children[i].classList.contains('on')) {
                        removeObjs.push(tgt.children[i]);
                        count++;
                        score += 1;
                    } else score += 5;
                }
                if(tgt.dataset.maxlength && score + 1 > tgt.dataset.maxlength) return;
                if(count >= 4) {
                    var src = newObj.getAttribute('src') ? newObj.getAttribute('src') : '';
                    var onsrc = newObj.getAttribute('onsrc') ? newObj.getAttribute('onsrc') : '';
                    newObj.setAttribute('src', onsrc);
                    newObj.setAttribute('onsrc', src);
                    newObj.classList.add('on');
                    for(i=0; i < removeObjs.length; i++) this.removeChild(removeObjs[i]);
                }
                tallychart_o.setCPSource(newObj);
                this.appendChild(newObj);
                tallychart_o.send();
            }
        });
        tgt.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation(); // stop it here to prevent it bubble up
            
            for(i = 0; i < tallychart_o.target.length; i++) {
                if(tgt.id !== tallychart_o.target[i].id && tallychart_o.target[i].classList.contains('on')) 
                   tallychart_o.target[i].classList.remove('on');
                else if(tgt.id === tallychart_o.target[i].id && !tallychart_o.target[i].classList.contains('on'))
                   tallychart_o.target[i].classList.add('on');
            }
        });
    }, 
    setSource: function(src) {
        if(!src) return;
        src.draggable = true;
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
            e.preventDefault();
            e.stopPropagation(); // stop it here to prevent it bubble up
            
            // console.log('==================> setSource click');
            var curTgt = null;
            for(i = 0; i <tallychart_o.target.length; i++) {
                if(tallychart_o.target[i].classList.contains('on')) {
                    curTgt = tallychart_o.target[i];
                    break;
                }
            }
            if(curTgt == null) return;

            // console.log('src click tgt', curTgt, 'curSrc', src);
            var newObj = src.cloneNode(false);
            if(newObj) {
                newObj.id = 'srccp' + (++tallychart_o.idno);

                var count = 0;
                var removeObjs = [];
                var score = 0;
                for(i=0; i < curTgt.childElementCount; i++) {
                    if(!curTgt.children[i].classList.contains('on')) {
                        removeObjs.push(curTgt.children[i]);
                        count++;
                        score += 1;
                    } else score += 5;
                }
                // console.log('==============> count',count, score);
                if(curTgt.dataset.maxlength && score + 1 > curTgt.dataset.maxlength) return;
                if(count >= 4) {
                    var imgsrc = newObj.getAttribute('src') ? newObj.getAttribute('src') : '';
                    var onimgsrc = newObj.getAttribute('onsrc') ? newObj.getAttribute('onsrc') : '';
                    newObj.setAttribute('src', onimgsrc);
                    newObj.setAttribute('onsrc', imgsrc);
                    newObj.classList.add('on');
                    for(i=0; i < removeObjs.length; i++) curTgt.removeChild(removeObjs[i]);
                }
                tallychart_o.setCPSource(newObj);
                curTgt.appendChild(newObj);
                tallychart_o.send();
            }
        });      
    },
    setCPSource: function(src) {
        if(!src) return;
        src.addEventListener('dragstart', function (e) {
            e.dataTransfer.setData('id', this.id);
        });
    },
    setSourceBox: function(srcbox) {
        if(!srcbox) return;
        srcbox.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation(); // stop it here to prevent it bubble up
            
            if(!tallychart_o.source) return;

            var curTgt = null;
            for(i = 0; i <tallychart_o.target.length; i++) {
                if(tallychart_o.target[i].classList.contains('on')) {
                    curTgt = tallychart_o.target[i];
                    break;
                }
            }
            if(curTgt == null) return;

            var newObj = tallychart_o.source.cloneNode(false);
            if(newObj) {
                newObj.id = 'srccp' + (++tallychart_o.idno);

                var count = 0;
                var removeObjs = [];
                var score = 0;
                for(i=0; i < curTgt.childElementCount; i++) {
                    if(!curTgt.children[i].classList.contains('on')) {
                        removeObjs.push(curTgt.children[i]);
                        count++;
                        score += 1;
                    } else score += 5;
                }
                if(curTgt.dataset.maxlength && score + 1 > curTgt.dataset.maxlength) return;
                if(count >= 4) {
                    var imgsrc = newObj.getAttribute('src') ? newObj.getAttribute('src') : '';
                    var onimgsrc = newObj.getAttribute('onsrc') ? newObj.getAttribute('onsrc') : '';
                    newObj.setAttribute('src', onimgsrc);
                    newObj.setAttribute('onsrc', imgsrc);
                    newObj.classList.add('on');
                    for(i=0; i < removeObjs.length; i++) curTgt.removeChild(removeObjs[i]);
                }
                tallychart_o.setCPSource(newObj);
                curTgt.appendChild(newObj);
                tallychart_o.send();
            }

        });      
    },
    setTrashBin: function(trashbin) {
        if(!trashbin) return;
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
            e.preventDefault();
            e.stopPropagation(); // stop it here to prevent it bubble up

            var curTgt = null;
            var imgObj = null;
            for(i = 0; i <tallychart_o.target.length; i++) {
                if(tallychart_o.target[i] && tallychart_o.target[i].id == e.dataTransfer.getData('id')) {
                    var obj = tallychart_o.target[i].children[j];
                }
                for (var j = 0; j < tallychart_o.target[i].childElementCount; j++) {
                    var obj = tallychart_o.target[i].children[j];
                    if(tallychart_o.target[i] && tallychart_o.target[i].id == e.dataTransfer.getData('id')) {
                        imgObj = obj;
                        curTgt = tallychart_o.target[i];
                        break;
                    }
                }
                if(curTgt) break;
            }
            if(curTgt == null) return;
            if(imgObj) {
                if(imgObj.classList.contains('on')) {
                    for(i=0; i < 4; i++) {
                        var newObj = tallychart_o.source.cloneNode(false);
                        if(newObj) {
                            newObj.id = 'srccp' + (++tallychart_o.idno);
                            tallychart_o.setCPSource(newObj);
                            curTgt.appendChild(newObj);
                        }
                    }
                }
                curTgt.removeChild(imgObj);
                tallychart_o.send();
            }
        });
        trashbin.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation(); // stop it here to prevent it bubble up

            var curTgt = null;
            for(i = 0; i <tallychart_o.target.length; i++) {
                if(tallychart_o.target[i].classList.contains('on')) {
                    curTgt = tallychart_o.target[i];
                    break;
                }
            }
            if(curTgt == null || curTgt.childElementCount == 0) return;
            var imgObj = curTgt.lastChild;
            if(imgObj) {
                if(imgObj.classList.contains('on')) {
                    for(i=0; i < 4; i++) {
                        var newObj = tallychart_o.source.cloneNode(false);
                        curTgt.appendChild(newObj);
                    }
                }
                curTgt.removeChild(imgObj);
                tallychart_o.send();
            }
        });
    },
    send: function () {
        if(tallychart_o.completed) return;
        var idxs = [];
        var values = [];
        var score = 0;
        var i;
        
        for(i = 0; i < tallychart_o.target.length; i++) {
            idxs.push(i);
            score = 0;
            for (var j = 0; j < tallychart_o.target[i].childElementCount; j++) {
                if(tallychart_o.target[i].children[j].classList.contains('on')) score += 5;
                else score += 1;
            }
            values.push(score + "");           
        }
        // console.log('===> tallychart idxs', idxs, 'values', values);
        if(idxs.length > 0 && values.length > 0) {
            msg = {};
            msg.basetype = 4; 
            msg.basetypename = "Add/remove items"; 
            msg.subtype = 2;
            msg.subtypename = "tally chart";
            msg.choicedIdx = idxs;
            msg.choicedValue = values;
            // console.log('===> tallychart msg', msg);
            sendPostMessage("submit", msg);
        }
    },
    setCompleted: function (completed) {
        // console.log('====> setCompleted completed', completed);
        tallychart_o.completed = completed;
    },
    reset: function () {
        var tgts = document.querySelectorAll("[data-type='dragadd_tgt']");
        if(!tgts || tgts.length === 0) return;
        for(var i = 0; i < tgts.length; i++) {
            if(tgts[i].childElementCount > 0) {
                while (tgts[i].firstChild) {
                    tgts[i].removeChild(tgts[i].firstChild);
                }
            }        
        }
    }, 
};

var connection_o = {
    idx: -1,
    srcs: [],
    tgts: [],
    srcboxs: [],
    tgtboxs: [],
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
    strokeStyle: '#00b0f0',
    lineWidth: 2,
    completed: false,
    subtype: -1,
    init: function (idx, subtype) {
        if(connection_o.idx === idx) return;
        connection_o.idx = idx;
        connection_o.subtype = subtype;
        connection_o.reset();
        connection_o.srcs = [];
        connection_o.tgts = [];
        connection_o.srcboxs = [];
        connection_o.tgtboxs = [];
        connection_o.box = null;
        connection_o.canvas = null;
        connection_o.ctx = null;
        connection_o._lines = []; 
        connection_o._leftPos = []; 
        connection_o._rightPos = [];
        connection_o._leftBox = [];
        connection_o._rightBox = [];
        connection_o.rect = null;
        connection_o._pid = -1;
        connection_o.cur = null;
        connection_o.choicedIdx = -1;
        connection_o.direction = 0;
        connection_o.strokeStyle = '#00b0f0';
        connection_o.lineWidth = 2;
        connection_o.completed = false;
        var srcs = document.querySelectorAll("[data-type='connection_srcdot']");
        for(var i = 0; i < srcs.length; i++) connection_o.srcs.push(srcs[i]);
        var tgts = document.querySelectorAll("[data-type='connection_tgtdot']");
        for(var i = 0; i < tgts.length; i++) connection_o.tgts.push(tgts[i]);
        var srcboxs = document.querySelectorAll("[data-type='connection_srcbox']");
        for(var i = 0; i < srcboxs.length; i++) connection_o.srcboxs.push(srcboxs[i]);
        var tgtboxs = document.querySelectorAll("[data-type='connection_tgtbox']");
        for(var i = 0; i < tgtboxs.length; i++) connection_o.tgtboxs.push(tgtboxs[i]);
        var convas = document.querySelector("[data-type='connection_canvas']");
        if(convas) connection_o.canvas = convas;
        var box = document.querySelector("[data-type='connection_box']");
        if(box) connection_o.box = box;
        var linecolor = box.getAttribute("data-linecolor");
        if(linecolor && linecolor != "") connection_o.strokeStyle = linecolor;
        var linewidth = box.getAttribute("data-linewidth");
        if(linewidth && linewidth != "") connection_o.lineWidth = parseInt(linewidth);
        connection_o.initalize();
        // console.log('===========================> connection_o init');
    },
    send: function () {
        var idxs = [];
        var values = [];
        if(connection_o.subtype == 1) {
            for(j = 0; j < connection_o._leftPos.length; j++) {
                var sublines = connection_o._lines.filter((line) => line.lpos == j);
                if(sublines && sublines.length > 0) {
                    idxs.push(j);
                    var line = sublines.sort((a, b) => a.rpos - b.rpos).map((item) => item.rpos + 1);
                    values.push(line.join(','));
                } else {
                    idxs.push(j);
                    values.push("0");
                }
            }
        } else {
            var lines = connection_o._lines.sort((a, b) => {
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
        }
        if(idxs.length > 0 && values.length > 0) {
            msg = {};
            msg.basetype = 5; 
            msg.basetypename = "Connection"; 
            msg.subtype = connection_o.subtype;
            if(connection_o.subtype == 1) msg.subtypename = "multi connection";
            else msg.subtypename = "connection";
            msg.choicedIdx = idxs;
            msg.choicedValue = values;
            // console.log('===> connection msg', msg);
            sendPostMessage("submit", msg);
        }
    },
    dotOn: function () {
        connection_o._lines.forEach((line) => {
            if(line.drawed) {
                if(line.lpos > -1 && !connection_o.srcs[line.lpos].classList.contains('on')) connection_o.srcs[line.lpos].classList.add('on'); 
                if(line.rpos > -1 && !connection_o.tgts[line.rpos].classList.contains('on')) connection_o.tgts[line.rpos].classList.add('on'); 
            }
        });
    },
    initalize: function() {
        if(!connection_o.canvas || !connection_o.box) return;

        if(connection_o.canvas.getContext) {
            connection_o.ctx = connection_o.canvas.getContext('2d');
            var hidpi = connection_o.canvas.getAttribute('hidpi');
            var ratio = 1;
            var deviceRatio = window.devicePixelRatio || 1;
            var backingStoreRatio;
            if (connection_o.ctx && deviceRatio > 0) {
                backingStoreRatio = connection_o.ctx['webkitBackingStorePixelRatio'] || connection_o.ctx['backingStorePixelRatio'] || 1; // tslint:disable-line
                ratio = deviceRatio / backingStoreRatio;
                connection_o.ctx.scale(ratio, ratio);
            } else if (hidpi && !/^off|false$/.test(hidpi)) {                
                backingStoreRatio = connection_o.ctx['webkitBackingStorePixelRatio'] || connection_o.ctx['backingStorePixelRatio'] || 1; // tslint:disable-line
                ratio = devicePixelRatio / backingStoreRatio;
                connection_o.ctx.scale(ratio, ratio);
            }
        }
        if(connection_o.box.getBoundingClientRect) connection_o.rect = connection_o.box.getBoundingClientRect();
        connection_o.canvas.width = connection_o.rect.right - connection_o.rect.left;
        connection_o.canvas.height = connection_o.rect.bottom - connection_o.rect.top;

        var i = 0;
        connection_o._leftBox = [];
        connection_o._rightBox = [];
        connection_o._leftPos = [];
        connection_o._rightPos = [];
        connection_o._lines = [];
        for(i = 0; i < connection_o.srcs.length; i++) connection_o.setPosObjs(connection_o.srcs[i], 'l');
        for(i = 0; i < connection_o.tgts.length; i++) connection_o.setPosObjs(connection_o.tgts[i], 'r');
        for(i = 0; i < connection_o.srcboxs.length; i++) connection_o.setBoxObjs(connection_o.srcboxs[i], 'l');
        for(i = 0; i < connection_o.tgtboxs.length; i++) connection_o.setBoxObjs(connection_o.tgtboxs[i], 'r');

        if(connection_o._leftPos.length > 0) {
            if(connection_o.subtype == 1) {
                for(i = 0; i < connection_o._leftPos.length * connection_o.tgts.length; i++) 
                    connection_o._lines.push({sx: 0, sy: 0, ex: 0, ey: 0, drawed: false, lpos: -1, rpos: -1});
            } else {
                for(i = 0; i < connection_o.tgts.length; i++) 
                    connection_o._lines.push({sx: 0, sy: 0, ex: 0, ey: 0, drawed: false, lpos: -1, rpos: -1});
            }
        }
        // console.log('=====>', connection_o._leftBox, connection_o._rightBox, connection_o._leftPos, connection_o._rightPos);
        if(connection_o.canvas && connection_o.ctx) {
            connection_o.canvas.addEventListener('pointerdown', function (e) {
                if(connection_o._pid >= 0) return;
                if(connection_o.choicedIdx >= connection_o._lines.length) return;

                connection_o._pid = e.pointerId;
                try {connection_o.canvas.setPointerCapture(connection_o._pid);} catch(e) {}

                var idxLeftPos = -1;
                var idxRightPos = -1;
                connection_o.direction = 0;
                
                var i = 0;
                for(i = 0; i < connection_o._leftPos.length; i++) {
                    if((connection_o._leftPos[i].x - (connection_o._leftPos[i].w / 2)) <= e.offsetX 
                    && (connection_o._leftPos[i].x + (connection_o._leftPos[i].w / 2)) > e.offsetX 
                    && (connection_o._leftPos[i].y - (connection_o._leftPos[i].h / 2)) <= e.offsetY 
                    && (connection_o._leftPos[i].y + (connection_o._leftPos[i].h / 2)) > e.offsetY) {
                        idxLeftPos = i;
                        break;
                    } else if((connection_o._leftBox[i].x - (connection_o._leftBox[i].w / 2)) <= e.offsetX 
                    && (connection_o._leftBox[i].x + (connection_o._leftBox[i].w / 2)) > e.offsetX 
                    && (connection_o._leftBox[i].y - (connection_o._leftBox[i].h / 2)) <= e.offsetY 
                    && (connection_o._leftBox[i].y + (connection_o._leftBox[i].h / 2)) > e.offsetY) {
                        idxLeftPos = i;
                        break;
                    }
                }

                if(idxLeftPos < 0) {
                    for(i = 0; i < connection_o._rightPos.length; i++) {
                        if((connection_o._rightPos[i].x - (connection_o._rightPos[i].w / 2)) <= e.offsetX 
                        && (connection_o._rightPos[i].x + (connection_o._rightPos[i].w / 2)) > e.offsetX 
                        && (connection_o._rightPos[i].y - (connection_o._rightPos[i].h / 2)) <= e.offsetY 
                        && (connection_o._rightPos[i].y + (connection_o._rightPos[i].h / 2)) > e.offsetY) {
                            idxRightPos = i;
                            break;
                        } else if((connection_o._rightBox[i].x - (connection_o._rightBox[i].w / 2)) <= e.offsetX 
                        && (connection_o._rightBox[i].x + (connection_o._rightBox[i].w / 2)) > e.offsetX 
                        && (connection_o._rightBox[i].y - (connection_o._rightBox[i].h / 2)) <= e.offsetY 
                        && (connection_o._rightBox[i].y + (connection_o._rightBox[i].h / 2)) > e.offsetY) {
                            idxRightPos = i;
                            break;
                        }
                    }
                    
                    if(idxRightPos < 0 ) return;
                    connection_o.direction = 2;
    
                    // 같은 위치에 있던 이전 선 정보 지우기
                    if(connection_o.subtype !== 1) {
                        for(i = 0; i < connection_o._lines.length; i++) {
                            if(idxRightPos === connection_o._lines[i].rpos && connection_o._lines[i].drawed) {
                                if(connection_o._lines[i].lpos > -1 && connection_o.srcs[connection_o._lines[i].lpos] && connection_o.srcs[connection_o._lines[i].lpos].classList.contains('on')) connection_o.srcs[connection_o._lines[i].lpos].classList.remove('on');
                                if(connection_o._lines[i].rpos > -1 && connection_o.tgts[connection_o._lines[i].rpos] && connection_o.tgts[connection_o._lines[i].rpos].classList.contains('on')) connection_o.tgts[connection_o._lines[i].rpos].classList.remove('on');
                                
                                connection_o._lines[i].drawed = false;
                                connection_o._lines[i].rpos = -1;
                                connection_o._lines[i].lpos = -1;
                                break;
                            }
                        }
                    }
                    // 다시 line의 connection_o.choicedIdx 를 선정
                    connection_o.choicedIdx = -1;
                    for(i = 0; i < connection_o._lines.length; i++) {
                        if(connection_o._lines[i].lpos === -1) {
                            connection_o.choicedIdx = i;
                            break;
                        }
                    }

                    // 만일 Target이 Source 보다 크고 Line이 모두 그려진 경우
                    if(connection_o.choicedIdx === -1) return;
                    connection_o.cur = connection_o._lines[connection_o.choicedIdx];
                    connection_o.cur.rpos = idxRightPos;
                    connection_o.cur.lpos = -1;
                    connection_o.cur.sx = connection_o._rightPos[idxRightPos].x; 
                    connection_o.cur.sy = connection_o._rightPos[idxRightPos].y; 
                    connection_o.cur.drawed = true;

                    if(idxRightPos > -1 && connection_o.tgts[idxRightPos] && !connection_o.tgts[idxRightPos].classList.contains('on')) connection_o.tgts[idxRightPos].classList.add('on');

                } else {
                    connection_o.direction = 1;
    
                    // 같은 위치에 있던 이전 선 정보 지우기
                    if(connection_o.subtype !== 1) {
                        for(i = 0; i < connection_o._lines.length; i++) {
                            if(idxLeftPos === connection_o._lines[i].lpos) {
                                if(connection_o._lines[i].lpos > -1 && connection_o.srcs[connection_o._lines[i].lpos] && connection_o.srcs[connection_o._lines[i].lpos].classList.contains('on')) connection_o.srcs[connection_o._lines[i].lpos].classList.remove('on');
                                if(connection_o._lines[i].rpos > -1 && connection_o.tgts[connection_o._lines[i].rpos] && connection_o.tgts[connection_o._lines[i].rpos].classList.contains('on')) connection_o.tgts[connection_o._lines[i].rpos].classList.remove('on');
                                
                                connection_o._lines[i].drawed = false;
                                connection_o._lines[i].rpos = -1;
                                connection_o._lines[i].lpos = -1;
                                break;
                            }
                        }
                    }
                    // 다시 line의 connection_o.choicedIdx 를 선정
                    connection_o.choicedIdx = -1;
                    for(i = 0; i < connection_o._lines.length; i++) {
                        if(connection_o._lines[i].lpos === -1) {
                            connection_o.choicedIdx = i;
                            break;
                        }
                    }
                    if(connection_o.choicedIdx === -1) return;
                    
                    connection_o.cur = connection_o._lines[connection_o.choicedIdx];
                    connection_o.cur.lpos = idxLeftPos;
                    connection_o.cur.rpos = -1;
                    connection_o.cur.sx = connection_o._leftPos[idxLeftPos].x;
                    connection_o.cur.sy = connection_o._leftPos[idxLeftPos].y;
                    connection_o.cur.drawed = true;

                    if(idxLeftPos > -1 && connection_o.srcs[idxLeftPos] && !connection_o.srcs[idxLeftPos].classList.contains('on')) connection_o.srcs[idxLeftPos].classList.add('on');
                }
            });
            connection_o.canvas.addEventListener('pointermove', function (e) {
                if(connection_o._pid !== e.pointerId) return;
                if(!connection_o.cur) return;

                connection_o.cur.ex = e.offsetX;
                connection_o.cur.ey = e.offsetY;
                
                connection_o.lineDraw();
            });
            connection_o.canvas.addEventListener('pointerup',  function (e) {
                if(connection_o._pid < 0 || connection_o._pid !== e.pointerId) return;
    
                try {connection_o.canvas.releasePointerCapture(connection_o._pid);} catch(e) {}
                connection_o._pid = -1;

                if(!connection_o.cur) return;
                if(connection_o.choicedIdx === -1) return;

                var i = 0;
                if(connection_o.direction === 2) {
                    var idxLeftPos = -1;
                    for(i = 0; i < connection_o._leftPos.length; i++) {
                        if((connection_o._leftPos[i].x - (connection_o._leftPos[i].w / 2)) <= e.offsetX 
                        && (connection_o._leftPos[i].x + (connection_o._leftPos[i].w / 2)) > e.offsetX 
                        && (connection_o._leftPos[i].y - (connection_o._leftPos[i].h / 2)) <= e.offsetY 
                        && (connection_o._leftPos[i].y + (connection_o._leftPos[i].h / 2)) > e.offsetY) {
                            idxLeftPos = i;
                            break;
                        } else if((connection_o._leftBox[i].x - (connection_o._leftBox[i].w / 2)) <= e.offsetX 
                        && (connection_o._leftBox[i].x + (connection_o._leftBox[i].w / 2)) > e.offsetX 
                        && (connection_o._leftBox[i].y - (connection_o._leftBox[i].h / 2)) <= e.offsetY 
                        && (connection_o._leftBox[i].y + (connection_o._leftBox[i].h / 2)) > e.offsetY) {
                            idxLeftPos = i;
                            break;
                        }
                    }
    
                    if(idxLeftPos < 0) {
                        if(connection_o.cur.lpos > -1 && connection_o.srcs[connection_o.cur.lpos] && connection_o.srcs[connection_o.cur.lpos].classList.contains('on')) connection_o.srcs[connection_o.cur.lpos].classList.remove('on');
                        if(connection_o.cur.rpos > -1 && connection_o.tgts[connection_o.cur.rpos] && connection_o.tgts[connection_o.cur.rpos].classList.contains('on')) connection_o.tgts[connection_o.cur.rpos].classList.remove('on');

                        connection_o.send();
                        connection_o.cur.drawed = false;
                        connection_o.cur.lpos = -1;
                        connection_o.cur.rpos = -1;
                        connection_o.cur.ex = connection_o.cur.sx;
                        connection_o.cur.ey = connection_o.cur.sx;
                        connection_o.cur = null;
                        connection_o.lineDraw();
                        connection_o.dotOn();
                        return;
                    }
    
                    if(connection_o.subtype == 1) {
                        for(i = 0; i < connection_o._lines.length; i++) {
                            if(i !== connection_o.choicedIdx && idxLeftPos === connection_o._lines[i].lpos && connection_o._lines[connection_o.choicedIdx].rpos === connection_o._lines[i].rpos) {
                                connection_o._lines[i].drawed = false;
                                connection_o._lines[i].rpos = -1;
                                connection_o._lines[i].lpos = -1;
                                break;
                            }
                        }
                    } else {
                        for(i = 0; i < connection_o._lines.length; i++) {
                            if(i !== connection_o.choicedIdx && idxLeftPos === connection_o._lines[i].lpos) {
                                if(connection_o._lines[i].lpos > -1 && connection_o.srcs[connection_o._lines[i].lpos] && connection_o.srcs[connection_o._lines[i].lpos].classList.contains('on')) connection_o.srcs[connection_o._lines[i].lpos].classList.remove('on');
                                if(connection_o._lines[i].rpos > -1 && connection_o.tgts[connection_o._lines[i].rpos] && connection_o.tgts[connection_o._lines[i].rpos].classList.contains('on')) connection_o.tgts[connection_o._lines[i].rpos].classList.remove('on');
        
                                connection_o._lines[i].drawed = false;
                                connection_o._lines[i].rpos = -1;
                                connection_o._lines[i].lpos = -1;
                                break;
                            }
                        }
                    }
                    connection_o.cur.lpos = idxLeftPos;
                    connection_o.cur.ex = connection_o._leftPos[idxLeftPos].x;
                    connection_o.cur.ey = connection_o._leftPos[idxLeftPos].y;
                    connection_o.cur = null;
                    connection_o.lineDraw();
                    connection_o.send();

                    if(idxLeftPos > -1 && connection_o.srcs[idxLeftPos] && !connection_o.srcs[idxLeftPos].classList.contains('on')) connection_o.srcs[idxLeftPos].classList.add('on');
                    
                } else {
                    var idxRightPos = -1;
                    for(i = 0; i < connection_o._rightPos.length; i++) {
                        if((connection_o._rightPos[i].x - (connection_o._rightPos[i].w / 2)) <= e.offsetX 
                        && (connection_o._rightPos[i].x + (connection_o._rightPos[i].w / 2)) > e.offsetX 
                        && (connection_o._rightPos[i].y - (connection_o._rightPos[i].h / 2)) <= e.offsetY 
                        && (connection_o._rightPos[i].y + (connection_o._rightPos[i].h / 2)) > e.offsetY) {
                            idxRightPos = i;
                            break;
                        } else if((connection_o._rightBox[i].x - (connection_o._rightBox[i].w / 2)) <= e.offsetX 
                        && (connection_o._rightBox[i].x + (connection_o._rightBox[i].w / 2)) > e.offsetX 
                        && (connection_o._rightBox[i].y - (connection_o._rightBox[i].h / 2)) <= e.offsetY 
                        && (connection_o._rightBox[i].y + (connection_o._rightBox[i].h / 2)) > e.offsetY) {
                            idxRightPos = i;
                            break;
                        }
                    }
                    if(idxRightPos < 0) {
                        if(connection_o.cur.lpos > -1 && connection_o.srcs[connection_o.cur.lpos] && connection_o.srcs[connection_o.cur.lpos].classList.contains('on')) connection_o.srcs[connection_o.cur.lpos].classList.remove('on');
                        if(connection_o.cur.rpos > -1 && connection_o.tgts[connection_o.cur.rpos] && connection_o.tgts[connection_o.cur.rpos].classList.contains('on')) connection_o.tgts[connection_o.cur.rpos].classList.remove('on');

                        connection_o.send();
                        connection_o.cur.drawed = false;
                        connection_o.cur.lpos = -1;
                        connection_o.cur.rpos = -1;
                        connection_o.cur.ex = connection_o.cur.sx;
                        connection_o.cur.ey = connection_o.cur.sx;
                        connection_o.cur = null;
                        connection_o.lineDraw();
                        connection_o.dotOn();
                        return;
                    }
    
                    if(connection_o.subtype == 1) {
                        for(i = 0; i < connection_o._lines.length; i++) {
                            if(i !== connection_o.choicedIdx && idxRightPos === connection_o._lines[i].rpos && connection_o._lines[connection_o.choicedIdx].lpos === connection_o._lines[i].lpos) {
                                connection_o._lines[i].drawed = false;
                                connection_o._lines[i].rpos = -1;
                                connection_o._lines[i].lpos = -1;
                                break;
                            }
                        }
                    } else {
                        for(i = 0; i < connection_o._lines.length; i++) {
                            if(i !== connection_o.choicedIdx && idxRightPos === connection_o._lines[i].rpos) {
                                if(connection_o._lines[i].lpos > -1 && connection_o.srcs[connection_o._lines[i].lpos] && connection_o.srcs[connection_o._lines[i].lpos].classList.contains('on')) connection_o.srcs[connection_o._lines[i].lpos].classList.remove('on');
                                if(connection_o._lines[i].rpos > -1 && connection_o.tgts[connection_o._lines[i].rpos] && connection_o.tgts[connection_o._lines[i].rpos].classList.contains('on')) connection_o.tgts[connection_o._lines[i].rpos].classList.remove('on');

                                connection_o._lines[i].drawed = false;
                                connection_o._lines[i].rpos = -1;
                                connection_o._lines[i].lpos = -1;
                                break;
                            }
                        }
                    }
                    connection_o.cur.rpos = idxRightPos;
                    connection_o.cur.ex = connection_o._rightPos[idxRightPos].x;
                    connection_o.cur.ey = connection_o._rightPos[idxRightPos].y;
                    connection_o.cur = null;
                    connection_o.lineDraw();

                    if(idxRightPos > -1 && connection_o.tgts[idxRightPos] && !connection_o.tgts[idxRightPos].classList.contains('on')) connection_o.tgts[idxRightPos].classList.add('on');
                    
                    // console.log('up2', idxRightPos, connection_o._lines, true);
                    connection_o.send();
                }
                connection_o.direction = 0;
                connection_o.dotOn();
            });
            connection_o.canvas.addEventListener('pointercancel',  function (e) {
                if(connection_o._pid < 0 || connection_o._pid !== e.pointerId) return;

                try {connection_o.canvas.releasePointerCapture(connection_o._pid);} catch(e) {}
                connection_o._pid = -1;
                if(!connection_o.cur) return;
                if(connection_o.direction === 0) return;
                if(connection_o.choicedIdx === -1) return;

                if(connection_o.direction === 2) {
                    if(connection_o.cur.lpos > -1 && connection_o.srcs[connection_o.cur.lpos] && connection_o.srcs[connection_o.cur.lpos].classList.contains('on')) connection_o.srcs[connection_o.cur.lpos].classList.remove('on');
                    if(connection_o.cur.rpos > -1 && connection_o.tgts[connection_o.cur.rpos] && connection_o.tgts[connection_o.cur.rpos].classList.contains('on')) connection_o.tgts[connection_o.cur.rpos].classList.remove('on');
                    
                    connection_o.send();
                    connection_o.cur.drawed = false;
                    connection_o.cur.lpos = -1;
                    connection_o.cur.rpos = -1;
                    connection_o.cur.ex = connection_o.cur.sx;
                    connection_o.cur.ey = connection_o.cur.sx;
                    connection_o.cur = null;
                    connection_o.lineDraw();
                    connection_o.dotOn();
                    return;
                } else {
                    if(connection_o.cur.lpos > -1 && connection_o.srcs[connection_o.cur.lpos] && connection_o.srcs[connection_o.cur.lpos].classList.contains('on')) connection_o.srcs[connection_o.cur.lpos].classList.remove('on');
                    if(connection_o.cur.rpos > -1 && connection_o.tgts[connection_o.cur.rpos] && connection_o.tgts[connection_o.cur.rpos].classList.contains('on')) connection_o.tgts[connection_o.cur.rpos].classList.remove('on');

                    connection_o.send();
                    connection_o.cur.drawed = false;
                    connection_o.cur.lpos = -1;
                    connection_o.cur.rpos = -1;
                    connection_o.cur.ex = connection_o.cur.sx;
                    connection_o.cur.ey = connection_o.cur.sx;
                    connection_o.cur = null;
                    connection_o.lineDraw();
                    connection_o.dotOn();
                    return;
                }
                connection_o.direction = 0;
            });	    
        }
    },
    setPosObjs: function(posobj, position) {
        if(connection_o.rect == null) return;
        else if(!posobj) return;
        else if(!posobj.getBoundingClientRect) return;

        var pos_rect = posobj.getBoundingClientRect();
        var x = pos_rect.left - connection_o.rect.left + (pos_rect.width/2);
        var y = pos_rect.top - connection_o.rect.top + (pos_rect.height/2);
        var w = pos_rect.width * 5;
        var h = pos_rect.height * 5;

        if(position == 'l' || position == 't') connection_o._leftPos.push({x: x, y:y, w:w, h:h});
        else if(position == 'r' || position == 'b') connection_o._rightPos.push({x:x, y:y, w:w, h:h});
    },
    setBoxObjs: function(boxobj, position) {
        if(connection_o.rect == null) return;
        else if(!boxobj) return;
        else if(!boxobj.getBoundingClientRect) return;

        var box_rect = boxobj.getBoundingClientRect();
        var x = box_rect.left - connection_o.rect.left + (box_rect.width/2);
        var y = box_rect.top - connection_o.rect.top + (box_rect.height/2);
        var w = box_rect.width;
        var h = box_rect.height;

        if(position == 'l' || position == 't') connection_o._leftBox.push({x: x, y:y, w:w, h:h});
        else if(position == 'r' || position == 'b') connection_o._rightBox.push({x:x, y:y, w:w, h:h});
    },
    lineDraw: function() {
        if(!connection_o.ctx) return;

        connection_o.ctx.clearRect(0, 0, connection_o.ctx.canvas.width, connection_o.ctx.canvas.height);
        
        connection_o.ctx.strokeStyle = connection_o.strokeStyle;
        connection_o.ctx.lineWidth = connection_o.lineWidth;
        connection_o.ctx.lineCap = 'round';
        connection_o._lines.forEach((c, cidx) => {
            if(c.drawed) {
                connection_o.ctx.beginPath();
                connection_o.ctx.moveTo(c.sx, c.sy);
                connection_o.ctx.lineTo(c.ex, c.ey);
                connection_o.ctx.stroke();
                connection_o.ctx.closePath();
            }
        });
    },
    setCompleted: function (completed) {
        // console.log('====> setCompleted completed', completed);
        connection_o.completed = completed;
    },
    reset: function () {
        if(!connection_o.ctx) return;
        connection_o.ctx.clearRect(0, 0, connection_o.ctx.canvas.width, connection_o.ctx.canvas.height);
        while(connection_o._lines.length > 0) connection_o._lines.pop();
        if(connection_o.subtype === 2) {
            for(i = 0; i < connection_o._leftPos.length * connection_o.tgts.length; i++) 
                connection_o._lines.push({sx: 0, sy: 0, ex: 0, ey: 0, drawed: false, lpos: -1, rpos: -1});
        } else {
            for(i = 0; i < connection_o._leftPos.length; i++) 
                connection_o._lines.push({sx: 0, sy: 0, ex: 0, ey: 0, drawed: false, lpos: -1, rpos: -1});
        }
    }
};

var radio_o = {
    idx: -1,
    groups: [],
    objs: [],
    completed: false,
    init: function(idx) {
        if(radio_o.idx === idx) return;
        radio_o.reset();        
        radio_o.idx = idx;
        radio_o.objs = [];
        var objs = document.querySelectorAll("[data-type='radio']");
        if(objs.length < 1) return;
        for(var i = 0; i < objs.length; i++) {
            var findIdx = radio_o.objs.findIndex((item) => item.id === objs[i].id);
            if(findIdx < 0)  {
                radio_o.objs.push(objs[i]);
                radio_o.setObj(objs[i]);
            }
            var findGroupIdx = radio_o.groups.findIndex((name) => name === objs[i].name);
            if(findGroupIdx < 0)  {
                radio_o.groups.push(objs[i].name);
            }
        }
        // console.log('objs len', radio_o.objs.length, 'groups len', radio_o.groups.length);
    },
    setObj: function(obj) {
        if(!obj) return;
        obj.addEventListener('click', function (e) {
            if(radio_o.completed) return;
            // console.log('radio setObj', e.target);
            e.target.checked = true;
            var radioValue = [];
            var radioIdx = [];
            for(var i = 0; i < radio_o.groups.length; i++) {
                radioIdx.push(i);
                radioValue.push('');
            }
            for(var i = 0; i < radio_o.groups.length; i++) {
                var rd = document.querySelector('input[name="'+radio_o.groups[i]+'"]:checked');
                
                if(!rd) continue;
                if(rd.dataset.group) {
                    var group = parseInt(rd.dataset.group);
                    if(group && group > 0) radioValue[group - 1] = rd.value
                } else {
                    radioValue[0] = rd.value;
                }
            }
            if(radioValue.length > 0) {
                msg = {};
                msg.basetype = 11; 
                msg.basetypename = "Radio button"; 
                msg.subtype = 0;
                msg.subtypename = "radio button";
                msg.choicedIdx = radioIdx;
                msg.choicedValue = radioValue;
                sendPostMessage("submit", msg);
            }
        });
    },
    reset: function () {
        for(var i = 0; i < radio_o.groups.length; i++) {
            var rd = document.querySelector('input[name="'+radio_o.groups[i]+'"]:checked');
            if(!rd) continue;
            rd.checked = false;
        }
    },
    setCompleted: function (completed) {
        // console.log('====> setCompleted completed', completed);
        radio_o.completed = completed;
    },
    showAnswer: function(item) {
        // console.log("radio_o-showAnswer", item);
        var answers = item.answers;
        var isGroup  = false;
        for(var i = 0; i < radio_o.objs.length; i++) {
            if(radio_o.objs[i].dataset.group && Number(radio_o.objs[i].dataset.group) != NaN){
                isGroup = true;
                break;
            }
        }
        if(!isGroup){
            for(var i = 0; i < radio_o.objs.length; i++) {
                const boxValue = radio_o.objs[i].value;
                // console.log('radio_o.objs[i]', radio_o.objs[i]);
                const isMatch = answers.includes(boxValue);
                // console.log('isMatch', isMatch);
                // console.log('radio_o.objs[i].checked',radio_o.objs[i].checked);
                if(isMatch) {
                    radio_o.objs[i].parentNode.classList.add('correct');
                    // radio_o.objs[i].checked = true;
                }else{                
                    if(radio_o.objs[i].checked) {
                        radio_o.objs[i].parentNode.classList.add('wrong'); 
                    }                
                }                       
            }
        }else{
            var radioGroup = [];            
            for(var i = 0; i < radio_o.objs.length; i++) {
                if(!radio_o.objs[i].dataset.group || Number(radio_o.objs[i].dataset.group)== NaN) continue;
                var groupName = Number(radio_o.objs[i].dataset.group);
                // console.log("radigoGroup -name", groupName);
                if(!radioGroup[groupName-1]) radioGroup[groupName-1] = [];
                radioGroup[groupName-1].push(radio_o.objs[i]);                                 
            }
            // console.log('radioGroup', radioGroup);
            // console.log('radioGroup-answers',answers)
            radioGroup.forEach((groupItems, idx) => {
                groupItems.forEach((radio,rIdx) => {
                    const boxValue = radio.value;                
                    const isMatch = answers[idx].includes(boxValue);
                    // console.log('radioGroup-isMatch', isMatch,"/",idx,"/",rIdx);                    
                    if(isMatch) {
                        radio.parentNode.classList.add('correct');
                        // radio_o.objs[i].checked = true;
                    }else{                
                        if(radio.checked) {
                            radio.parentNode.classList.add('wrong'); 
                        }                
                    }  
                });
                
            });
        }
        
    }
}

var checkbox_o = {
    idx: -1,
    objs: [],
    completed: false,
    init: function(idx) {
        if(checkbox_o.idx === idx) return;
        checkbox_o.reset();        
        checkbox_o.idx = idx;
        checkbox_o.objs = [];
        var objs = document.querySelectorAll("[data-type='checkbox']");
        if(objs.length < 1) return;
        for(var i = 0; i < objs.length; i++) {
            var findIdx = checkbox_o.objs.findIndex((item) => item.id === objs[i].id);
            if(findIdx < 0)  {
                checkbox_o.objs.push(objs[i]);
                checkbox_o.setObj(objs[i]);
            }
        }
    },
    setObj: function(obj) {
        if(!obj) return;
        obj.addEventListener('click', function (e) {
            if(checkbox_o.completed) return;
            // console.log('checkbox e target', e.target);
            if(e.target.parentNode.classList.contains('on')){
                e.target.parentNode.classList.remove('on');
            }else{
                e.target.parentNode.classList.add('on');
            } 
            var chkboxValue = [];
            var chkboxIdx = [];
            var idx = 0;
            for(var i = 0; i < checkbox_o.objs.length; i++) {
                if(checkbox_o.objs[i].checked) {
                    chkboxIdx.push(idx);
                    chkboxValue.push(checkbox_o.objs[i].value);
                    idx++;
                }
            }
            if(chkboxValue.length > 0) {
                msg = {};
                msg.basetype = 12; 
                msg.basetypename = "Check box"; 
                msg.subtype = 0;
                msg.subtypename = "checkbox";
                msg.choicedIdx = chkboxIdx;
                msg.choicedValue = chkboxValue;
                sendPostMessage("submit", msg);
            }
        });
    },
    reset: function () {
        for(var i = 0; i < checkbox_o.objs.length; i++) {
            if(checkbox_o.objs[i].checked) checkbox_o.objs[i].checked = false;
        }
    },
    setCompleted: function (completed) {
        // console.log('====> setCompleted completed', completed);
        checkbox_o.completed = completed;
    },
    showAnswer: function(item) {
        // console.log("ki~~!!111");
        const answers = item.answers;
        const matchType = item.matchType;
        for(var i = 0; i < checkbox_o.objs.length; i++) {
            const boxValue = checkbox_o.objs[i].value;
            const isMatch = answers.includes(boxValue);
            if(isMatch) {
                if(checkbox_o.objs[i].parentNode.classList.contains('on')){
                    checkbox_o.objs[i].parentNode.classList.remove('on');
                    checkbox_o.objs[i].parentNode.classList.add('correct');
                }else{
                    checkbox_o.objs[i].parentNode.classList.add('correct');
                }
                
            }else{
                if(checkbox_o.objs[i].parentNode.classList.contains('on')){
                    checkbox_o.objs[i].parentNode.classList.remove('on');
                    checkbox_o.objs[i].parentNode.classList.add('wrong');
                }else{
                    checkbox_o.objs[i].parentNode.classList.remove('on');
                }    
            }                        
        }
    }

}

var shade_o = {
    idx: -1,
    groupcnt: 1,
    objs: [],
    completed: false,
    subtype: -1,
    init: function(idx, subtype) {
        if(shade_o.idx === idx) return;
        shade_o.subtype = subtype;
        shade_o.reset();        
        shade_o.idx = idx;
        shade_o.groupcnt = 1;
        shade_o.objs = [];
        var objs = document.querySelectorAll("[data-type='shade']");
        if(objs.length < 1) return;
        for(var i = 0; i < objs.length; i++) {
            if(objs[i].dataset.group) {
                if(parseInt(objs[i].dataset.group) > shade_o.groupcnt) shade_o.groupcnt = parseInt(objs[i].dataset.group); 
            }
        }
        for(i = 0; i < shade_o.groupcnt; i++) shade_o.objs[i] = [];
        for(i = 0; i < objs.length; i++) {
            if(objs[i].dataset.group) {
                var group = parseInt(objs[i].dataset.group);
                // var findIdx = shade_o.objs[group-1].findIndex((item) => item.id === objs[i].id);
                // if(findIdx < 0) shade_o.objs[group-1].push(objs[i]);
                shade_o.objs[group-1].push(objs[i]);
                shade_o.setObj(objs[i]);
            } else {
                // var findIdx = shade_o.objs[0].findIndex((item) => item.id === objs[i].id);
                // if(findIdx < 0) shade_o.objs[0].push(objs[i]);
                shade_o.objs[0].push(objs[i]);
                shade_o.setObj(objs[i]);
            }
        }
        // console.log('objs len', shade_o.objs.length, 'groupcnt', shade_o.groupcnt);
    },
    setObj: function(obj) {
        if(!obj) return;
        obj.setAttribute('draggable', false);
        obj.addEventListener('click', function (e) {
            if(shade_o.completed) return;
            // if(!obj.onsrc) return;

            var src = obj.getAttribute('src') ? obj.getAttribute('src') : '';
            var onsrc = obj.getAttribute('onsrc') ? obj.getAttribute('onsrc') : '';
            obj.setAttribute('src', onsrc);
            obj.setAttribute('onsrc', src);

            if(obj.classList.contains('on')) {
                obj.classList.remove('on');
            } else {
                obj.classList.add('on');
            }

            var shadeValue = [];
            var shadeIdx = [];
            for(var i = 0; i < shade_o.groupcnt; i++) {
                shadeIdx.push(i);
                if(shade_o.subtype === 1) {
                    var values = [];
                    for (var j = 0; j < shade_o.objs[i].length; j++) {
                        if(shade_o.objs[i][j].classList.contains('on')) values.push(shade_o.objs[i][j].dataset.value);
                    }
                    // console.log('===> shade i', i, 'values', values);
                    shadeValue.push(values.sort().join(','));        
                } else {
                    var count = 0;
                    for (var j = 0; j < shade_o.objs[i].length; j++) {
                        if(shade_o.objs[i][j].classList.contains('on')) count++;
                    }
                    shadeValue.push(count + "");           
                }
            }
            // console.log('===> shade idxs', shadeIdx, 'values', shadeValue, 'groupcnt', shade_o.groupcnt, 'match', shade_o.subtype);
            if(shadeIdx.length > 0 && shadeValue.length > 0) {
                msg = {};
                msg.basetype = 3; 
                msg.basetypename = "Shade"; 
                if(shade_o.subtype === 1) {
                    msg.subtype = 1;
                    msg.subtypename = "match";
                } else {
                    msg.subtype = 0;
                    msg.subtypename = "shade";
                }
                msg.choicedIdx = shadeIdx;
                msg.choicedValue = shadeValue;
                // console.log('===> shade msg', msg);
                sendPostMessage("submit", msg);
            }
        });
    },
    reset: function () {
        for(var i = 0; i < shade_o.groupcnt.length; i++) {
            for (var j = 0; j < shade_o.objs[i].length; j++) {
                if(shade_o.objs[i].classList.contains('on')) {
                    var src = shade_o.objs[i].src;
                    var onsrc = shade_o.objs[i].onsrc;
                    shade_o.objs[i].src = onsrc;
                    shade_o.objs[i].onsrc = src;
                    shade_o.objs[i].classList.remove('on');
                }
            }
        }
    },
    setCompleted: function (completed) {
        // console.log('====> setCompleted completed', completed);
        shade_o.completed = completed;
    },
}

var picgraph_o = {
    idx: -1,
    target: [],
    source: [],
    completed: false,
    maxvalue: 0,
    subtype: -1, 
    init: function (idx, subtype) {
        if(picgraph_o.idx === idx) return;
        picgraph_o.idx = idx;
        picgraph_o.subtype = subtype;
        picgraph_o.reset();
        picgraph_o.source = [];
        picgraph_o.target = [];
        picgraph_o.completed = false;
        var srcs = document.querySelectorAll("[data-type='picgraph_src']");
        if(srcs.length < 1) return;
        for(i = 0; i < srcs.length; i++) {
            var findIdx = -1;
            findIdx = picgraph_o.source.findIndex((item) => item.id === srcs[i].id);
            if(findIdx < 0) picgraph_o.source.push(srcs[i]);
            picgraph_o.setSource(srcs[i]);
            if(srcs[i].dataset.value &&  picgraph_o.maxvalue < parseInt(srcs[i].dataset.value)) {
               picgraph_o.maxvalue = parseInt(srcs[i].dataset.value);
            }
        }
        var tgts = document.querySelectorAll("[data-type='picgraph_tgt']");
        if(tgts && tgts.length > 0) {
            for(i = 0; i < tgts.length; i++) {
                var findIdx = -1;
                findIdx = picgraph_o.target.findIndex((item) => item.id === tgts[i].id);
                if(findIdx < 0) picgraph_o.target.push(tgts[i]);
                picgraph_o.setTarget(tgts[i]);
            }
        }
        // console.log('picgraph_o init', picgraph_o.source, picgraph_o.target);
    },
    setTarget: function(tgt) {
        if(!tgt) return;
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
            e.preventDefault();
            e.stopPropagation(); // stop it here to prevent it bubble up
            if(tgt.dataset.maxlength && tgt.childElementCount >= parseInt(tgt.dataset.maxlength)) return;

            var curSrc = null;
            for(i = 0; i < picgraph_o.source.length; i++) {
                if(picgraph_o.source[i].id == e.dataTransfer.getData('id')) {
                    curSrc = picgraph_o.source[i];
                    break;
                }
            }
            if(!curSrc) return;
            // console.log('picgraph drop tgt', tgt, 'curSrc', curSrc);
            var newObj = curSrc.cloneNode(false);
            if(newObj) {
                // if it is half
                // console.log('picgraph_o.maxvalue', picgraph_o.maxvalue, parseInt(newObj.dataset.value));
                if(picgraph_o.maxvalue > parseInt(newObj.dataset.value)) {
                    // if the half is there, return;
                    // if(this.lastChild && parseInt(this.lastChild.dataset.value) != picgraph_o.maxvalue) return;
                    this.appendChild(newObj);
                } else {
                    this.insertBefore(newObj, this.firstChild);
                }
                picgraph_o.send();
            }
        });
        tgt.addEventListener('click', function (e) {
            e.stopPropagation();
            e.preventDefault();
            if(tgt.childElementCount == 0) return;
            // console.log('tgt.lastChild.dataset.type', tgt.lastChild.dataset.type);
            if(tgt.lastChild.dataset.type === 'picgraph_src') {
                tgt.removeChild(tgt.lastChild);
                picgraph_o.send();
            }
            // var curSrc = null;
            // for(i = 0; i < tgt.childElementCount; i++) {
            //     if(tgt.children[i].dataset.type === 'picgraph_src') {
            //         curSrc = tgt.children[i];
            //         break;
            //     }
            // }
            // if(curSrc) {
            //     tgt.removeChild(curSrc);
            //     picgraph_o.send();
            //     return;
            // }
        });
    }, 
    setSource: function(src) {
        if(!src) return;
        src.draggable = true;
        src.addEventListener('dragstart', function (e) {
            e.dataTransfer.setData('id', this.id);
        });
        src.addEventListener('drag', function (e) {
            // console.log('src drag');
        });
        src.addEventListener('dragend', function (e) {
            // console.log('src dragend with effect: ' + e.dataTransfer.dropEffect);
        });
        // src.addEventListener('click', function (e) {
        //     // console.log('src click', src.dataset.type, src.parentNode)
        //     e.stopPropagation();
        //     e.preventDefault();

        //     // var tgt = e.target;
        //     if(src.dataset.type !== 'picgraph_src') return;

        //     var parObj = src.parentNode;
        //     // console.log('picgraph parObj', parObj, parObj.dataset.type)
        //     if(parObj.dataset.type == 'picgraph_tgt') {
        //         parObj.removeChild(src);
        //         picgraph_o.send();
        //         return;
        //     }
        // });
    },
    send: function () {
        if(picgraph_o.completed) return;
        var idxs = [];
        var values = [];
        var i;
        
        for(i = 0; i < picgraph_o.target.length; i++) {
            idxs.push(i);
            var val = 0;
            // console.log('=========>', i, picgraph_o.target[i].childElementCount);
            for(j = 0; j < picgraph_o.target[i].childElementCount; j++) {
                // console.log('=========> s', i, picgraph_o.target[i].children[j].dataset.type, parseInt(picgraph_o.target[i].children[j].dataset.value));
                if(picgraph_o.target[i].children[j].dataset.type == "picgraph_src" && parseInt(picgraph_o.target[i].children[j].dataset.value) > -1) {
                    val += parseInt(picgraph_o.target[i].children[j].dataset.value);
                }
            }
            values.push(val + "");           
        }
        // console.log('===> picgraph idxs', idxs, 'values', values);
        if(idxs.length > 0 && values.length > 0) {
            msg = {};
            msg.basetype = 7; 
            msg.basetypename = "Picture graph"; 
            msg.subtype = 0;
            msg.subtypename = "picture graph";
            msg.choicedIdx = idxs;
            msg.choicedValue = values;
            // console.log('===> picgraph msg', msg);
            sendPostMessage("submit", msg);
        }
    },
    setCompleted: function (completed) {
        // console.log('====> setCompleted completed', completed);
        picgraph_o.completed = completed;
    },
    reset: function () {
        var tgts = document.querySelectorAll("[data-type='picgraph_tgt']");
        if(!tgts || tgts.length === 0) return;
        for(var i = 0; i < tgts.length; i++) {
            if(tgts[i].childElementCount > 0) {
                var imgObj = tgts[i].firstChild;
                if(imgObj) tgts[i].removeChild(imgObj);
            }        
        }
    }, 
}

var bargraph_o = {
    idx: -1,
    bargraph: [],
    bargraphvalue: [],
    bargraphbox: null,
    completed: false,
    min: 0,
    max: 0,
    gap: 0,
    direction: 'horizontal', // 'vertical'
    basepos: '10px',
    subtype: -1, 
    isDraw: false,
    level: 0,
    onestep: 0,
    org_pos: 0,
    init: function (idx, subtype) {
        if(bargraph_o.idx === idx) return;
        bargraph_o.idx = idx;
        bargraph_o.subtype = subtype;
        bargraph_o.reset();
        bargraph_o.bargraph = [];
        bargraph_o.bargraphvalue = [];
        bargraph_o.completed = false;
        bargraph_o.min = 0;
        bargraph_o.max = 0;
        bargraph_o.gap = 0;
        bargraph_o.bargraphbox = document.querySelector("[data-type='bargraph_info']");
        if(!bargraph_o.bargraphbox) return;
        if(bargraph_o.bargraphbox.dataset.min) bargraph_o.min = bargraph_o.bargraphbox.dataset.min;
        if(bargraph_o.bargraphbox.dataset.max) bargraph_o.max = bargraph_o.bargraphbox.dataset.max;
        if(bargraph_o.bargraphbox.dataset.gap) bargraph_o.gap = bargraph_o.bargraphbox.dataset.gap;
        if(bargraph_o.bargraphbox.dataset.direction) bargraph_o.direction = bargraph_o.bargraphbox.dataset.direction;
        if(bargraph_o.bargraphbox.dataset.basepos) bargraph_o.basepos = bargraph_o.bargraphbox.dataset.basepos;
        var bargraph = document.querySelectorAll("[data-type='bargraph']");
        if(bargraph.length < 1) return;
        for(i = 0; i < bargraph.length; i++) {
            bargraph_o.bargraph.push(bargraph[i]);
            bargraph_o.bargraphvalue.push(0);
            bargraph_o.setBargraph(bargraph[i], i);
        }
        bargraph_o.level = parseFloat((bargraph_o.max - bargraph_o.min) / bargraph_o.gap);
        bargraph_o.onestep = parseFloat(100 / bargraph_o.level);
        // console.log('bargraph_o init', bargraph_o.bargraph, bargraph_o.min, bargraph_o.max, bargraph_o.gap, bargraph_o.onestep, bargraph_o.direction, bargraph_o.basepos);
    },
    setBargraph: function(obj, idx) {
        if(!obj) return;
        var content = document.querySelector('.content_page');
        obj.addEventListener('pointerdown', function (e) {
            // console.log('pointerdown', bargraph_o.isDraw, idx);
            e.stopPropagation();
            e.preventDefault();

            if(obj.dataset.type !== 'bargraph') return;

            content.style.touchAction = 'none';// 중요. 안해주면 드래그 안됨.
            bargraph_o.isDraw = true;
            obj.setPointerCapture(e.pointerId);
            var rect = e.target.getBoundingClientRect();
            if(bargraph_o.direction == 'vertical') bargraph_o.org_pos = rect.bottom;
            else bargraph_o.org_pos = rect.left;
            // console.log('bargraph_o.org_pos', bargraph_o.org_pos);
        });
        obj.addEventListener('pointermove', function (e) {
            // console.log('pointermove', bargraph_o.isDraw, idx);
            e.stopPropagation();
            e.preventDefault();
            if(obj.dataset.type !== 'bargraph') return;
            // console.log('pointermove click', bargraph_o.isDraw);

            var rect = bargraph_o.bargraphbox.getBoundingClientRect();
            var move = 0;
            var per = 0;
            var step = 0;
            var pos = 0;
            if(bargraph_o.isDraw && rect) {
                if(bargraph_o.direction == 'vertical') {
                    move = bargraph_o.org_pos - e.clientY;
                    per = Math.round((move / rect.height) * 100);
                    step = Math.round((bargraph_o.level * per) / 100);
                    bargraph_o.bargraphvalue[idx] = step * bargraph_o.gap;
                    pos = step * bargraph_o.onestep;
    
                    // console.log('bargraph_o.bargraphvalue[idx] before', idx, bargraph_o.bargraphvalue[idx], pos);
                    if(pos <= 0) {
                        obj.style.height = '10px';
                        bargraph_o.bargraphvalue[idx] = bargraph_o.min;
                    }
                    else if (pos >= 100) {
                        obj.style.height = '100%';
                        bargraph_o.bargraphvalue[idx] = bargraph_o.max;
                    } 
                    else obj.style.height = pos + '%';
                    // console.log('bargraph_o.bargraphvalue[idx] after', idx, bargraph_o.bargraphvalue[idx], pos);
                }
                else {
                    move = e.clientX - bargraph_o.org_pos;
                    per = Math.round((move / rect.width) * 100);
                    step = Math.round((bargraph_o.level * per) / 100);
                    bargraph_o.bargraphvalue[idx] = step * bargraph_o.gap;
                    pos = step * bargraph_o.onestep;
    
                    // console.log('bargraph_o.bargraphvalue[idx] before', idx, bargraph_o.bargraphvalue[idx], pos);
                    if(pos <= 0) {
                        obj.style.width = '10px';
                        bargraph_o.bargraphvalue[idx] = bargraph_o.min;
                    } 
                    else if (pos >= 100) {
                        obj.style.width = '100%';
                        bargraph_o.bargraphvalue[idx] = bargraph_o.max;
                    } 
                    else obj.style.width = pos + '%';
                    // console.log('bargraph_o.bargraphvalue[idx] after', idx, bargraph_o.bargraphvalue[idx], pos);
                }  
            }
        });
        obj.addEventListener('pointerup', function (e) {
            // console.log('pointerup', bargraph_o.isDraw, idx);
            e.stopPropagation();
            e.preventDefault();
            if( bargraph_o.isDraw) {
                bargraph_o.isDraw = false;
                obj.releasePointerCapture(e.pointerId);
                bargraph_o.send();  
            }
            content.style.touchAction = 'auto';
        });
    }, 
    send: function () {
        if(bargraph_o.completed) return;
        var idxs = [];
        var values = [];
        
        for(i = 0; i < bargraph_o.bargraphvalue.length; i++) {
            idxs.push(i);
            values.push(bargraph_o.bargraphvalue[i] + "");  
        }
        // console.log('===> bargraph idxs', idxs, 'values', values);
        if(idxs.length > 0 && values.length > 0) {
            msg = {};
            msg.basetype = 8; 
            msg.basetypename = "Bar graph"; 
            msg.subtype = 0;
            msg.subtypename = "bar graph";
            msg.choicedIdx = idxs;
            msg.choicedValue = values;
            // console.log('===> bargraph msg', msg);
            sendPostMessage("submit", msg);
        }
    },
    setCompleted: function (completed) {
        // console.log('====> setCompleted completed', completed);
        bargraph_o.completed = completed;
    },
    reset: function () {
    //    
    }, 
}

var numberline_o = {
    idx: -1,
    groupcnt: 1,
    target: [],
    completed: false,
    init: function (idx, subtype) {
        if(numberline_o.idx === idx) return;
        numberline_o.idx = idx;
        numberline_o.subtype = subtype;
        numberline_o.reset();
        numberline_o.groupcnt = 1;
        numberline_o.target = [];
        numberline_o.completed = false;
        var tgts = document.querySelectorAll("[data-type='numberline']");
        if(tgts.length < 1) return;
        for(var i = 0; i < tgts.length; i++) {
            if(tgts[i].dataset.group) {
                if(parseInt(tgts[i].dataset.group) > numberline_o.groupcnt) numberline_o.groupcnt = parseInt(tgts[i].dataset.group);
            }
        }
        if(numberline_o.groupcnt < 1) return;
        for(i = 0; i < numberline_o.groupcnt; i++) {
            numberline_o.target[i] = [];
        }
        for(i = 0; i < tgts.length; i++) {
            if(tgts[i].dataset.group) {
                var group = parseInt(tgts[i].dataset.group);
                numberline_o.target[group-1].push(tgts[i]);
                numberline_o.setTarget(tgts[i]);
            } else {
                numberline_o.target[0].push(tgts[i]);
                numberline_o.setTarget(tgts[i]);
            }
        }
        // console.log('numberline_o init', numberline_o.target , numberline_o.groupcnt);
    },
    setTarget: function(obj) {
        if(!obj) return;
        obj.addEventListener('click', function (e) {
            // console.log('click', obj);
            e.stopPropagation();
            e.preventDefault();

            var group = 0;
            if(obj.dataset.group) {
                group = parseInt(obj.dataset.group);
            } else {
                group = 1;
            }
            if(numberline_o.target.length < group) return;
            if(numberline_o.target[group-1].length === 0) return;

            for(var i = 0; i < numberline_o.target[group-1].length; i++) {
                numberline_o.target[group-1][i].classList.remove('on');
            }
            obj.classList.add('on');
            numberline_o.send();
        });
    }, 
    send: function () {
        if(numberline_o.completed) return;
        var idxs = [];
        var values = [];
        
        for(i = 0; i < numberline_o.target.length; i++) {
            idxs.push(i);
            var val = "0";
            for (var j = 0; j < numberline_o.target[i].length; j++) {
                if(numberline_o.target[i][j].classList.contains('on') && numberline_o.target[i][j].dataset.value)  {
                    val = numberline_o.target[i][j].dataset.value;
                    break;
                }
             }
             values.push(val);
        }
        // console.log('===> numberline idxs', idxs, 'values', values);
        if(idxs.length > 0 && values.length > 0) {
            msg = {};
            msg.basetype = 6; 
            msg.basetypename = "Number line"; 
            msg.subtype = 0;
            msg.subtypename = "number line";
            msg.choicedIdx = idxs;
            msg.choicedValue = values;
            // console.log('===> numberline msg', msg);
            sendPostMessage("submit", msg);
        }
    },
    setCompleted: function (completed) {
        // console.log('====> setCompleted completed', completed);
        numberline_o.completed = completed;
    },
    reset: function () {
        // 
    }, 
    showAnswer: function(item) {
        // console.log("showAnswer numberline", item);        
        const answers = item.answers;
        const matchType = item.matchType;
        for(i = 0; i < numberline_o.target.length; i++) {            
            
            for (var j = 0; j < numberline_o.target[i].length; j++) {
                const boxValue = numberline_o.target[i][j].dataset.value;
                const isMatch = answers.includes(boxValue);
                // console.log("numberline_o.target[i][j]", numberline_o.target[i][j]);
                if(isMatch) {
                    if(numberline_o.target[i][j].classList.contains('on')){
                        numberline_o.target[i][j].classList.remove('on');
                        numberline_o.target[i][j].classList.add('correct');
                    }else{
                        numberline_o.target[i][j].classList.add('correct');
                    }
                    
                }else{
                    if(numberline_o.target[i][j].classList.contains('on')){
                        numberline_o.target[i][j].classList.remove('on');
                        numberline_o.target[i][j].classList.add('wrong');
                    }else{
                        numberline_o.target[i][j].classList.remove('on');
                    }    
                }     
             }
             
        }        
    }
}

var lineplot_o = {
    idx: -1,
    dotcnt: 0,
    target: [],
    targetvalue: [],
    basetarget: [],
    completed: false,
    isDrawDot: -1,
    init: function (idx, subtype) {
        if(lineplot_o.idx === idx) return;
        lineplot_o.idx = idx;
        lineplot_o.subtype = subtype;
        lineplot_o.reset();
        lineplot_o.dotcnt = 0;
        lineplot_o.target = [];
        lineplot_o.completed = false;
        var bases = document.querySelectorAll("[data-type='lineplot_base']");
        if(bases.length < 1) return;
        for(var i = 0; i < bases.length; i++) {
            if(bases[i].dataset.dot) {
                if(parseInt(bases[i].dataset.dot) + 1 > lineplot_o.dotcnt) lineplot_o.dotcnt = parseInt(bases[i].dataset.dot) + 1;
            }
        }
        if(lineplot_o.dotcnt < 0) return;
        for(i = 0; i < lineplot_o.dotcnt; i++) {
            lineplot_o.target[i] = [];
            lineplot_o.basetarget[i] = [];
            lineplot_o.targetvalue.push(0);
        }
        for(i = 0; i < bases.length; i++) {
            if(bases[i].dataset.dot) {
                var dot = parseInt(bases[i].dataset.dot);
                lineplot_o.basetarget[dot].push(bases[i]);
                lineplot_o.setBaseTarget(bases[i]);
            } else {
                lineplot_o.basetarget[0].push(bases[i]);
                lineplot_o.setBaseTarget(bases[i]);
            }
        }
        var tgts = document.querySelectorAll("[data-type='lineplot_dot']");
        if(tgts.length < 1) return;
        for(i = 0; i < tgts.length; i++) {
            if(tgts[i].dataset.dot) {
                var dot = parseInt(tgts[i].dataset.dot);
                lineplot_o.target[dot].push(tgts[i]);
                lineplot_o.setTarget(tgts[i]);
            } else {
                lineplot_o.target[0].push(tgts[i]);
                lineplot_o.setTarget(tgts[i]);
            }
        }
        // console.log('lineplot_o init', lineplot_o.target , lineplot_o.basetarget, lineplot_o.dotcnt);
    },
    setBaseTarget: function(obj) {
        if(!obj) return;
        obj.addEventListener('click', function (e) {
            // console.log('click', obj);
            e.stopPropagation();
            e.preventDefault();

            var dot = -1;
            if(obj.dataset.dot) {
                dot = parseInt(obj.dataset.dot);
            } else {
                dot = 0;
            }
            if(lineplot_o.target.length < dot + 1) return;
            if(lineplot_o.target[dot].length === 0) return;

            for(var i = 0; i < lineplot_o.target[dot].length; i++) {
                var tgt = lineplot_o.target[dot][i];
                if(tgt.dataset.value && tgt.classList.contains('on')) {
                    tgt.classList.remove('on');
                    var src = tgt.getAttribute('src') ? tgt.getAttribute('src') : '';
                    var onsrc = tgt.getAttribute('onsrc') ? tgt.getAttribute('onsrc') : '';
                    tgt.setAttribute('src', onsrc);
                    tgt.setAttribute('onsrc', src);
                }
            }
            lineplot_o.send();
        });
    }, 
    setTarget: function(obj) {
        if(!obj) return;
        obj.addEventListener('pointerdown', function (e) {
            // console.log('pointerdown', obj);
            e.stopPropagation();
            e.preventDefault();

            var dot = -1;
            if(obj.dataset.dot) {
                dot = parseInt(obj.dataset.dot);
            } else {
                dot = 0;
            }
            if(lineplot_o.target.length < dot + 1) return;
            if(lineplot_o.target[dot].length === 0) return;

            lineplot_o.isDrawDot = dot;
            var on = obj.classList.contains('on');
            var value = obj.dataset.value;
            if(on) {
                lineplot_o.targetvalue[dot] = parseInt(value) - 1;
            } else {
                lineplot_o.targetvalue[dot] = parseInt(value);
            }

            // console.log('on', on, value);
            for(var i = 0; i < lineplot_o.target[dot].length; i++) {
                var tgt = lineplot_o.target[dot][i];
                if(on) {
                    if(tgt.dataset.value && parseInt(tgt.dataset.value) >= parseInt(value) && tgt.classList.contains('on')) {
                        tgt.classList.remove('on');
                        var src = tgt.getAttribute('src') ? tgt.getAttribute('src') : '';
                        var onsrc = tgt.getAttribute('onsrc') ? tgt.getAttribute('onsrc') : '';
                        tgt.setAttribute('src', onsrc);
                        tgt.setAttribute('onsrc', src);
                    }
                } else {
                    if(tgt.dataset.value && parseInt(tgt.dataset.value) <= parseInt(value) && !tgt.classList.contains('on')) {
                        tgt.classList.add('on');
                        var src = tgt.getAttribute('src') ? tgt.getAttribute('src') : '';
                        var onsrc = tgt.getAttribute('onsrc') ? tgt.getAttribute('onsrc') : '';
                        tgt.setAttribute('src', onsrc);
                        tgt.setAttribute('onsrc', src);
                    }
                }
            }
        });
        // obj.addEventListener('pointerover', function (e) {
        //     // console.log('pointerover', obj);
        //     e.stopPropagation();
        //     e.preventDefault();

        //     var dot = -1;
        //     if(obj.dataset.dot) {
        //         dot = parseInt(obj.dataset.dot);
        //     } else {
        //         dot = 0;
        //     }
        //     if(lineplot_o.target.length < dot + 1) return;
        //     if(lineplot_o.target[dot].length === 0) return;
        //     if(dot !== lineplot_o.isDrawDot) return;

        //     var on = obj.classList.contains('on');
        //     var value = obj.dataset.value;
        //     if(on) {
        //         lineplot_o.targetvalue[dot] = parseInt(value) - 1;
        //     } else {
        //         lineplot_o.targetvalue[dot] = parseInt(value);
        //     }

        //     // console.log('on', on, value);
        //     for(var i = 0; i < lineplot_o.target[dot].length; i++) {
        //         var tgt = lineplot_o.target[dot][i];
        //         if(on) {
        //             if(tgt.dataset.value && parseInt(tgt.dataset.value) >= parseInt(value) && tgt.classList.contains('on')) {
        //                 tgt.classList.remove('on');
        //                 var src = tgt.getAttribute('src') ? tgt.getAttribute('src') : '';
        //                 var onsrc = tgt.getAttribute('onsrc') ? tgt.getAttribute('onsrc') : '';
        //                 tgt.setAttribute('src', onsrc);
        //                 tgt.setAttribute('onsrc', src);
        //             }
        //         } else {
        //             if(tgt.dataset.value && parseInt(tgt.dataset.value) <= parseInt(value) && !tgt.classList.contains('on')) {
        //                 tgt.classList.add('on');
        //                 var src = tgt.getAttribute('src') ? tgt.getAttribute('src') : '';
        //                 var onsrc = tgt.getAttribute('onsrc') ? tgt.getAttribute('onsrc') : '';
        //                 tgt.setAttribute('src', onsrc);
        //                 tgt.setAttribute('onsrc', src);
        //             }
        //         }
        //     }
        //     // lineplot_o.send();
        // });
        obj.addEventListener('pointerup', function (e) {
            // console.log('pointerup', obj);
            e.stopPropagation();
            e.preventDefault();

            var dot = -1;
            if(obj.dataset.dot) {
                dot = parseInt(obj.dataset.dot);
            } else {
                dot = 0;
            }
            if(lineplot_o.target.length < dot + 1) return;
            if(lineplot_o.target[dot].length === 0) return;
            if(dot !== lineplot_o.isDrawDot) return;

            lineplot_o.isDrawDot = -1;
            lineplot_o.send();
        });
    }, 
    send: function () {
        if(lineplot_o.completed) return;
        var idxs = [];
        var values = [];
        
        for(i = 0; i < lineplot_o.targetvalue.length; i++) {
            idxs.push(i);
            values.push(lineplot_o.targetvalue[i] + "");
        }
        // console.log('===> lineplot idxs', idxs, 'values', values);
        if(idxs.length > 0 && values.length > 0) {
            msg = {};
            msg.basetype = 9; 
            msg.basetypename = "Line plot"; 
            msg.subtype = 0;
            msg.subtypename = "line plot";
            msg.choicedIdx = idxs;
            msg.choicedValue = values;
            // console.log('===> lineplot msg', msg);
            sendPostMessage("submit", msg);
        }
    },
    setCompleted: function (completed) {
        // console.log('====> setCompleted completed', completed);
        lineplot_o.completed = completed;
    },
    reset: function () {
    //    
    }, 
}

var gridchart_o = {
    idx: -1,
    groupcnt: 1,
    target: [],
    completed: false,
    isDrawGroup: -1,
    isDrawOn: false,
    subtype: -1,
    init: function (idx, subtype) {
        if(gridchart_o.idx === idx) return;
        gridchart_o.idx = idx;
        gridchart_o.subtype = subtype;
        gridchart_o.reset();
        gridchart_o.groupcnt = 1;
        gridchart_o.target = [];
        gridchart_o.completed = false;
        var tgts = document.querySelectorAll("[data-type='gridchart']");
        if(tgts.length < 1) return;
        for(var i = 0; i < tgts.length; i++) {
            if(tgts[i].dataset.group) {
                if(parseInt(tgts[i].dataset.group) > gridchart_o.groupcnt) gridchart_o.groupcnt = parseInt(tgts[i].dataset.group);
            }
        }
        if(gridchart_o.groupcnt < 0) return;
        for(i = 0; i < gridchart_o.groupcnt; i++) {
            gridchart_o.target[i] = [];
        }
        for(i = 0; i < tgts.length; i++) {
            if(tgts[i].dataset.group) {
                var group = parseInt(tgts[i].dataset.group);
                gridchart_o.target[group - 1].push(tgts[i]);
                gridchart_o.setTarget(tgts[i]);
            } else {
                gridchart_o.target[0].push(tgts[i]);
                gridchart_o.setTarget(tgts[i]);
            }
        }
        // console.log('gridchart_o init', gridchart_o.target, gridchart_o.groupcnt);
    },
    setTarget: function(obj) {
        if(!obj) return;
        obj.addEventListener('pointerdown', function (e) {
            // console.log('pointerdown', obj);
            e.stopPropagation();
            e.preventDefault();

            var group = 0;
            if(obj.dataset.group) {
                group = parseInt(obj.dataset.group);
            } else {
                group = 1;
            }
            if(gridchart_o.target.length < group) return;
            if(gridchart_o.target[group - 1].length === 0) return;
            if(!obj.dataset.oncolor) return;

            // 고정색이 변경 안 되게 하는 경우
            //부모인 tr에 색이 들어가있는 경우가 있어서 or로 처리
            if((obj.dataset.fixed && obj.dataset.fixed === "true" && obj.style.backgroundColor !== "" && !obj.classList.contains('on')) || (obj.dataset.fixed && obj.dataset.fixed === "true" && obj.parentNode&&obj.parentNode.style.backgroundColor !== "" && !obj.classList.contains('on'))) return;
            gridchart_o.isDrawGroup = group;
            if(obj.classList.contains('on')) {
                obj.classList.remove('on');
                if(obj.dataset.color) obj.style.backgroundColor = obj.dataset.color;
                else obj.style.backgroundColor = "";
                gridchart_o.isDrawOn = false;
            } else {
                obj.classList.add('on');
                if(obj.style.backgroundColor !== "" && !obj.dataset.color) obj.setAttribute('data-color', obj.style.backgroundColor);
                obj.style.backgroundColor = obj.dataset.oncolor;
                gridchart_o.isDrawOn = true;
            }
        });
        obj.addEventListener('pointerover', function (e) {
            // console.log('pointerover', obj);
            e.stopPropagation();
            e.preventDefault();

            var group = 0;
            if(obj.dataset.group) {
                group = parseInt(obj.dataset.group);
            } else {
                group = 1;
            }
            if(gridchart_o.target.length < group) return;
            if(gridchart_o.target[group - 1].length === 0) return;
            if(group !== gridchart_o.isDrawGroup) return;
            if(!obj.dataset.oncolor) return;

            // 고정색이 변경 안 되게 하는 경우
            //부모인 tr에 색이 들어가있는 경우가 있어서 or로 처리
            if((obj.dataset.fixed && obj.dataset.fixed === "true" && obj.style.backgroundColor !== "" && !obj.classList.contains('on')) || (obj.dataset.fixed && obj.dataset.fixed === "true" && obj.parentNode&&obj.parentNode.style.backgroundColor !== "" && !obj.classList.contains('on'))) return;
            if(gridchart_o.isDrawOn) {
                if(!obj.classList.contains('on')) {
                    obj.classList.add('on');
                    if(obj.style.backgroundColor !== "" && !obj.dataset.color) obj.setAttribute('data-color', obj.style.backgroundColor);
                    obj.style.backgroundColor = obj.dataset.oncolor;
                }
            } else {
                if(obj.classList.contains('on')) {
                    obj.classList.remove('on');
                    if(obj.dataset.color) obj.style.backgroundColor = obj.dataset.color;
                    else obj.style.backgroundColor = "";
                }
            }
        });
        obj.addEventListener('pointerup', function (e) {
            // console.log('pointerup', obj);
            e.stopPropagation();
            e.preventDefault();

            var group = 0;
            if(obj.dataset.group) {
                group = parseInt(obj.dataset.group);
            } else {
                group = 1;
            }
            if(gridchart_o.target.length < group) return;
            if(gridchart_o.target[group - 1].length === 0) return;
            if(group !== gridchart_o.isDrawGroup) return;

            gridchart_o.isDrawGroup = -1;
            gridchart_o.isDrawOn = false;
            gridchart_o.send();  
        });
    }, 
    send: function () {
        if(gridchart_o.completed) return;
        var idxs = [];
        var values = [];
                
        var idx = 0;
        if(gridchart_o.subtype == 1) {
            for(i = 0; i < gridchart_o.target.length; i++) {
                for (var j = 0; j < gridchart_o.target[i].length; j++) {
                    let obj = gridchart_o.target[i][j];
                    if(obj.classList.contains('on') && obj.dataset.rowcol) {
                        idxs.push(idx++);
                        values.push(obj.dataset.rowcol);
                    }
                    if(i == gridchart_o.target.length-1 && j == gridchart_o.target[i].length-1 && obj.dataset.rowcol) {
                        idxs.push(idx++);
                        values.push(obj.dataset.rowcol);
                    }
                }
            }
        } else if(gridchart_o.subtype == 2) {
            for(i = 0; i < gridchart_o.target.length; i++) {
                var count = 0;
                for (var j = 0; j < gridchart_o.target[i].length; j++) {
                    let obj = gridchart_o.target[i][j];
                    if(obj.classList.contains('on') && obj.dataset.rowcol) {
                        count++;
                    }
                }
                idxs.push(idx++);
                values.push(count + "");
            }           
        } else {
            for(i = 0; i < gridchart_o.target.length; i++) {
                for (var j = 0; j < gridchart_o.target[i].length; j++) {
                    let obj = gridchart_o.target[i][j];
                    if(obj.classList.contains('on') && obj.dataset.rowcol) {
                        idxs.push(idx++);
                        values.push(obj.dataset.rowcol);
                    }
                }
            }
        }

        // console.log('===> gridchart idxs', idxs, 'values', values);
        if(idxs.length > 0 && values.length > 0) {
            msg = {};
            msg.basetype = 13; 
            msg.basetypename = "Grid and chart"; 
            msg.subtype = gridchart_o.subtype;
            if(gridchart_o.subtype === 1) msg.subtypename = "start end";
            else if(gridchart_o.subtype === 2) msg.subtypename = "count";
            else msg.subtypename = "grid and chart";
            msg.choicedIdx = idxs;
            msg.choicedValue = values;
            // console.log('===> gridchart msg', msg);
            sendPostMessage("submit", msg);
        }
    },
    setCompleted: function (completed) {
        // console.log('====> setCompleted completed', completed);
        gridchart_o.completed = completed;
    },
    reset: function () {
    //    
    }, 
}

var clockhands_o = {
    idx: -1,
    objs: [],
    subtype: -1,
    completed: false,    
    values:[],
    init: function (idx, subtype) {
        if(clockhands_o.idx === idx) return;
        clockhands_o.idx = idx;
        clockhands_o.subtype = subtype;
        clockhands_o.reset();
        clockhands_o.completed = false;
        var hourhands = document.querySelectorAll("[data-type='hourhands']");
        hourhands.forEach(hourhand => {
            // console.log('hourhand',hourhand.dataset.type);
            var obj = {
                minMoving:false,
                hourMoving:false,
                minDegree:0,
                hourDegree:180,
                hourhand:hourhand,
            }
            if(hourhand.dataset.initval) {
                var initval = parseInt(hourhand.dataset.initval);
                if(Number.isInteger(initval) && initval >= 0 && initval <= 12) {
                    if(initval === 12) initval = 0; 
                    obj.hourDegree = initval * 30;
                }
            }
            if(hourhand.dataset.group){
                this.objs[Number(hourhand.dataset.group)-1] = obj;
            }else{
                //그룹지정이없는 경우(시계 1개짜리) 대비
                this.objs[0] = obj;
            }
           
        });
        // console.log('clockhands_o objs', this.objs);
        
        var minhands = document.querySelectorAll("[data-type='minhands']");
        minhands.forEach(minhand => {
            var currentObj = null;
            if(minhand.dataset.group){
                currentObj = this.objs[Number(minhand.dataset.group)-1];
            }else{
                //그룹지정이없는 경우(시계 1개짜리) 대비
                currentObj = this.objs[0];
            }
            currentObj.minhand = minhand;
                if(minhand.dataset.initval) {
                    var initval = parseInt(minhand.dataset.initval);
                    if(Number.isInteger(initval) && initval >= 0 && initval <= 60) {
                        if(initval === 60) initval = 0; 
                        currentObj.minDegree = initval * 6;
                        currentObj.hourDegree += (initval * 0.5)
                    }
                }           
        });

        var clockCenters = document.querySelectorAll("[data-type='clockcenter']");
        clockCenters.forEach(clockCenter => {
            var currentObj = null;
            if(clockCenter.dataset.group){
                currentObj = this.objs[Number(clockCenter.dataset.group)-1];
            }else{
                //그룹지정이없는 경우(시계 1개짜리) 대비
                currentObj = this.objs[0];
            }
            currentObj.clockcenter = clockCenter;
        });

        this.objs.forEach(obj => {
            if(obj.minhand) obj.minhand.style.transform = 'rotate(' + obj.minDegree + 'deg)';
        if(obj.hourhand) obj.hourhand.style.transform = 'rotate(' + obj.hourDegree + 'deg)';
        
        clockhands_o.setMinHands(obj);
        clockhands_o.setHourHands(obj);
        // console.log('clockhands_o init', obj.minhand, obj.hourhand, obj.minDegree, obj.hourDegree);
        });
        
        
    },
    setMinHands: function(obj) {
        if(!obj) return;
        var content = document.querySelector('.content_page');
        obj.minhand.addEventListener('pointerdown', function (e) {
             // console.log('pointerover', obj);
             e.stopPropagation();
             e.preventDefault();
             content.style.touchAction = 'none';// 중요. 안해주면 드래그 안됨.
             obj.minMoving = true;
             obj.minhand.setPointerCapture(e.pointerId);
        });
        obj.minhand.addEventListener('pointermove', function (e) {
            // console.log('pointermove', obj);
            e.stopPropagation();
            e.preventDefault();
            if(!obj.minMoving) return;

            var tgt = e.target;
            var centerrect = obj.clockcenter.getBoundingClientRect();
            var x = e.clientX - Math.ceil(centerrect.x + centerrect.width/2);
            var y = e.clientY - Math.ceil(centerrect.y + centerrect.height/2);
            var radians = Math.atan2(y, x);

            //라디안을 360도식으로 변경
            var degrees = (180 / Math.PI) * radians;
            //-각도 대신 0~360 각도로 변경
            if (radians < 0) degrees += 360;
            //좌표계 바꾸기 우센터에서 상단 센터로.
            degrees += 90;
            if (degrees > 360) degrees -= 360;

            degrees = Math.round(degrees / 6) * 6;

            tgt.style.transformOrigin = '50% bottom';
            tgt.style.transform = 'rotate(' + degrees + 'deg)';
            // console.log('minute degrees', degrees);
            
            let direction = (degrees - obj.minDegree);
            let oldDegree = obj.minDegree;
            obj.minDegree = degrees;
            let gap = 0;
            if(oldDegree - degrees === -360 || oldDegree - degrees === 360 || oldDegree - degrees === 0) gap = 0;
            else if(degrees - oldDegree < 360) gap = Math.round((degrees - oldDegree) / 6);
            else if(degrees - oldDegree > 360) gap = -(Math.round((degrees - oldDegree) / 6));

            // console.log('gap', oldDegree, degrees, gap);
            if(obj.hourhand && Math.abs(gap) < 10) {
                var hdegrees = 0;
                if((oldDegree - degrees === -360 || oldDegree - degrees === 360) && direction > 0) {
                    var tmphdegrees = obj.hourDegree + (gap * 0.5);
                    hdegrees = Math.floor(obj.hourDegree / 30) * 30; 
                    if(Math.abs(hdegrees - tmphdegrees) > 25) return;
                    // console.log('test 1 direction11', direction, hdegrees, clockhands_o.hourDegree, tmphdegrees, Number.isInteger(clockhands_o.hourDegree), Number.isInteger(tmphdegrees), oldDegree, degrees)   
                } else hdegrees = obj.hourDegree + (gap * 0.5);            
                
                if(hdegrees >= 360) hdegrees -= 360;
                else if(hdegrees <= -360) hdegrees += 360;

                if(obj.minDegree === 0 || obj.minDegree === 360) {
                    let tmphdegrees = Math.round(hdegrees / 30) * 30;
                    hdegrees = tmphdegrees;
                    // console.log('test', hdegrees, tmphdegrees);
                }

                obj.hourhand.style.transformOrigin = '50% bottom';
                obj.hourhand.style.transform = 'rotate(' + hdegrees + 'deg)';
                obj.hourDegree = hdegrees;
                // console.log('hdegrees', hdegrees);
            }
        });
        obj.minhand.addEventListener('pointerup', function (e) {
            // console.log('pointerup', obj);
            e.stopPropagation();
            e.preventDefault();
            if(obj.minMoving) {
                obj.minhand.releasePointerCapture(e.pointerId);
                obj.minMoving = false;
                clockhands_o.send();  
            }
            content.style.touchAction = 'auto';
        });
    }, 
    setHourHands: function(obj) {
        if(!obj) return;
        var content = document.querySelector('.content_page');
        obj.hourhand.addEventListener('pointerdown', function (e) {
            // console.log('pointerover', obj);
            e.stopPropagation();
            e.preventDefault();
            content.style.touchAction = 'none';// 중요. 안해주면 드래그 안됨.
            obj.hourMoving = true;
            obj.hourhand.setPointerCapture(e.pointerId);
       });
       obj.hourhand.addEventListener('pointermove', function (e) {
           // console.log('pointermove', obj);
           e.stopPropagation();
           e.preventDefault();
           if(!obj.hourMoving) return;

           var tgt = e.target;
           var centerrect = obj.clockcenter.getBoundingClientRect();
           var x = e.clientX - Math.ceil(centerrect.x + centerrect.width/2);
           var y = e.clientY - Math.ceil(centerrect.y + centerrect.height/2);
           var radians = Math.atan2(y, x);

           //라디안을 360도식으로 변경
           var degrees = (180 / Math.PI) * radians;
           //-각도 대신 0~360 각도로 변경
           if (radians < 0) degrees += 360;
           //좌표계 바꾸기 우센터에서 상단 센터로.
            degrees += 90;
            if (degrees > 360) degrees -= 360;

            var tmpDegree = degrees * 10;
            tmpDegree = Math.floor(tmpDegree / 5) * 5;
            degrees = tmpDegree / 10;

            tgt.style.transformOrigin = '50% bottom';
            tgt.style.transform = 'rotate(' + degrees + 'deg)';
            // console.log('hour degrees', degrees);

            obj.hourDegree = degrees;

            var step = (obj.hourDegree % 30);
            // console.log('step', step);
                       
            if(obj.minhand && Math.abs(step) <= 30) {
                var mdegrees = step * 12;            
                obj.minhand.style.transformOrigin = '50% bottom';
                obj.minhand.style.transform = 'rotate(' + mdegrees + 'deg)';
                obj.minDegree = mdegrees;
                // console.log('mdegrees', mdegrees);
            }
       });
       obj.hourhand.addEventListener('pointerup', function (e) {
           // console.log('pointerup', obj);
           e.stopPropagation();
           e.preventDefault();
           if(obj.hourMoving) {
            obj.hourhand.releasePointerCapture(e.pointerId);
            obj.hourMoving = false;
               clockhands_o.send();  
            }
            content.style.touchAction = 'auto';
       });
    }, 
    send: function () {
        if(clockhands_o.completed) return;
        var idxs = [];
       //그룹이건 싱글이건 동일하게 처리
        clockhands_o.objs.forEach((obj, idx) => {
            var groupValues = [];
            var currentHour = Math.floor(((Math.abs(obj.hourDegree)) / 360) * 12);
            var currentMinute = ((Math.abs(obj.minDegree)) / 360) * 60;
            // console.log("clockhands_o.hourDegree", obj.hourDegree, "clockhands_o.minDegree", obj.minDegree, 'currentHour', currentHour, 'currentMinute', currentMinute);

            if(currentMinute === 60) currentMinute = 0;
            if(currentHour === 0) currentHour = 12;
            
            groupValues.push(currentHour+"");
            idxs.push(idx);
            if(currentMinute < 10) groupValues.push("0" + currentMinute);
            else groupValues.push(currentMinute+"");
            clockhands_o.values[idx] = groupValues;
            // console.log('===> clockhands idxs', idxs, 'values', clockhands_o.values);            
        });    
        if(idxs.length > 0 && clockhands_o.values.length > 0) {
            msg = {};
            msg.basetype = 10; 
            msg.basetypename = "Clock hands"; 
            msg.subtype = clockhands_o.subtype;
            msg.subtypename = "clock hands";
            msg.choicedIdx = idxs;
            msg.choicedValue = clockhands_o.values;
            // console.log('===> clockhands msg', msg);
            sendPostMessage("submit", msg);
        }
    },
    setCompleted: function (completed) {
        // console.log('====> setCompleted completed', completed);
        clockhands_o.completed = completed;
    },
    reset: function () {
    //    
    }, 
}   
var coordinate_o = {
    idx: -1,
    pointers: [],
    buttons: [],
    subtype: -1,
    completed: false,    
    values:[],
    mode:"pointer",
    canvas: null,
    ctx: null,
    rect: null,
    clickPointers: [],
    init: function (idx, subtype) {
        if(coordinate_o.idx === idx) return;
        
        // console.log('coordinate init subtype', subtype);
        coordinate_o.idx = idx;
        coordinate_o.subtype = subtype;
        coordinate_o.reset();
        coordinate_o.completed = false;
        coordinate_o.canvas = null;
        coordinate_o.ctx = null;
        coordinate_o.rect = null;
        while(coordinate_o.clickPointers.length > 0) coordinate_o.clickPointers.pop();
        mode = "pointer";
        var pointers = document.querySelectorAll("[data-xy");
        var initPoint = null;
        pointers.forEach(pointer => {
            // console.log('pointer',pointer);  
            if(pointer.dataset.xy === '0-0') initPoint = pointer;
            coordinate_o.setPointer(pointer);         
        });
        coordinate_o.buttons =  document.querySelectorAll(".coordinate_btn ");
        coordinate_o.buttons.forEach(button => {
            // console.log('button',button);  
            coordinate_o.seButton(button);         
        });
        coordinate_o.pointers = pointers;
        // console.log('coordinate_o pointers', this.pointers);            

        var convas = document.querySelector("[data-type='coordiate_canvas']");
        if(convas) {
            coordinate_o.canvas = convas;
            coordinate_o.canvas.style.zIndex = -1;
            if(coordinate_o.canvas.getContext) {
                coordinate_o.ctx = coordinate_o.canvas.getContext('2d');
                var hidpi = coordinate_o.canvas.getAttribute('hidpi');
                var ratio = 1;
                var deviceRatio = window.devicePixelRatio || 1;
                var backingStoreRatio;
                if (coordinate_o.ctx && deviceRatio > 0) {
                    backingStoreRatio = coordinate_o.ctx['webkitBackingStorePixelRatio'] || coordinate_o.ctx['backingStorePixelRatio'] || 1; // tslint:disable-line
                    ratio = deviceRatio / backingStoreRatio;
                    coordinate_o.ctx.scale(ratio, ratio);
                } else if (hidpi && !/^off|false$/.test(hidpi)) {                
                    backingStoreRatio = coordinate_o.ctx['webkitBackingStorePixelRatio'] || coordinate_o.ctx['backingStorePixelRatio'] || 1; // tslint:disable-line
                    ratio = devicePixelRatio / backingStoreRatio;
                    coordinate_o.ctx.scale(ratio, ratio);
                }
            }
            var box = document.querySelector(".coordiate_wrap");
            if(box.getBoundingClientRect) {
                coordinate_o.rect = box.getBoundingClientRect();
                coordinate_o.canvas.width = coordinate_o.rect.right - coordinate_o.rect.left;
                coordinate_o.canvas.height = coordinate_o.rect.bottom - coordinate_o.rect.top;
                if(initPoint) coordinate_o.setPosObjs(initPoint);
            }
        }
    },
    setPosObjs: function(posobj) {
        if(!coordinate_o.canvas || !coordinate_o.rect) return;
        else if(!posobj) return;
        else if(!posobj.getBoundingClientRect) return;

        var pos_rect = posobj.getBoundingClientRect();
        var x = pos_rect.left - coordinate_o.rect.left + (pos_rect.width/2);
        var y = pos_rect.top - coordinate_o.rect.top + (pos_rect.height/2);

        var findObj = coordinate_o.clickPointers.find((item) => item.key === posobj.dataset.xy);
        if(!findObj) coordinate_o.clickPointers.push({key: posobj.dataset.xy, x: x, y:y});
        // console.log('setPosObjs coordinate_o.clickPointers', coordinate_o.clickPointers);
    },
    removePosObjs: function(posobj) {
        if(!posobj) return;
        for(var i = 0; i < coordinate_o.clickPointers.length; i++) {
            if(coordinate_o.clickPointers[i].key === posobj.dataset.xy) {
                coordinate_o.clickPointers.splice(i, 1);
                break;
            }
        }
        // console.log('removePosObjs coordinate_o.clickPointers', coordinate_o.clickPointers);
    },
    seButton: function(obj) {
        obj.addEventListener('pointerdown', function (e) {
            e.preventDefault();
            e.stopPropagation()
            if(!obj.classList.contains('down')) {
                obj.classList.add('down');
            }
          
        });     
        obj.addEventListener('pointerleave', function (e) {
            e.preventDefault();
            e.stopPropagation()
            // console.log('pointerleave',e.target);
            if(obj.classList.contains('down')) {
                obj.classList.remove('down');
            }
        });
        obj.addEventListener('pointerout', function (e) {
            e.preventDefault();
            e.stopPropagation()
            // console.log('pointerout',e.target);
            if(obj.classList.contains('down')) {
                obj.classList.remove('down');
            }
        });
        obj.addEventListener('pointerup', function (e) {
            e.preventDefault();
            e.stopPropagation()
            // console.log('obj.id',obj.id, obj.classList.contains('down'));
            if(obj.id === "coordinate_eraser"){
                coordinate_o.mode = "eraser";
                coordinate_o.lineClearPoints();
            } else if(obj.id === "coordinate_draw"){
                coordinate_o.mode = "draw";
                coordinate_o.lineDrawPoints();
                // else coordinate_o.lineClearPoints();
            }else{
                coordinate_o.mode = "pointer";
                coordinate_o.lineClearPoints();
            }
            // console.log('pointerup',e.target);
            if(obj.classList.contains('down')) {
                obj.classList.remove('down');
            }
            coordinate_o.buttons.forEach(button => {                
                if(obj == button) {
                    if(!(button.classList.contains('on'))) {
                        button.classList.add('on');
                    }
                }else{
                    if(button.classList.contains('on')) {
                        button.classList.remove('on');
                    }
                }        
            });
        });  
    },
    setPointer: function(obj) {
        if(!obj) return;
        obj.addEventListener('click', function (e) {
             e.stopPropagation();
             e.preventDefault();
             // console.log('coordinate_o.subtype',coordinate_o.subtype);
             let selectedLabelValue = '';
             if(coordinate_o.subtype == 1){
                coordinate_o.buttons.forEach(button => {
                    if(button.classList.contains('on')) {
                        selectedLabelValue = button.innerHTML;
                    }  
                });
            }
            // console.log('selectedLabelValue',selectedLabelValue); 
            if(coordinate_o.subtype == 0){
                if(coordinate_o.mode ==="eraser"){
                    obj.style.opacity = 0;
                    coordinate_o.removePosObjs(obj);
                }else{
                    obj.style.opacity = 1;
                    coordinate_o.setPosObjs(obj);
                }                
            }else if(coordinate_o.subtype == 1){
                coordinate_o.pointers.forEach(pointer => {
                   var label = pointer.querySelector('.label');
                   if(label) {
                       if(selectedLabelValue == label.innerHTML) {
                           pointer.style.opacity = 0;
                           coordinate_o.removePosObjs(pointer);
                        }
                   }
                });
                obj.style.opacity = 1;  
                obj.innerHTML = `<span class="label" style="pointer-events: none;">${selectedLabelValue}</span>`;
                coordinate_o.setPosObjs(obj);
            }
            // console.log('pointer clicked xy', obj.dataset.xy);
            coordinate_o.send();
        });       
    },     
    send: function () {
        coordinate_o.values = [];
        // console.log('coordinate_o send',coordinate_o.completed);
        if(coordinate_o.completed) return;
        var idxs = [];
        coordinate_o.pointers.forEach((obj, idx) => {
            if(obj.style.opacity && obj.style.opacity ==1) {
                if(coordinate_o.subtype == 0) {
                    coordinate_o.values.push(obj.dataset.xy.replace(/-/gi, ","));
                }else if(coordinate_o.subtype == 1){
                    const labelValue = obj.querySelector('.label').innerHTML;
                    coordinate_o.values.push(labelValue+obj.dataset.xy.replace(/-/gi, ","));
                }
                idxs.push(idx);
            }                     
        });    
        msg = {};
        msg.basetype = 14;
        msg.basetypename = "Coordinate"; 
        msg.subtype = coordinate_o.subtype;
        msg.subtypename = coordinate_o.subtype == 0 ? "basic":"label";
        msg.choicedIdx = idxs;
        msg.choicedValue = coordinate_o.values;
        // console.log('===> Coordinate msg', msg);
        sendPostMessage("submit", msg);
    },
    setCompleted: function (completed) {
        // console.log('====> setCompleted completed', completed);
        coordinate_o.completed = completed;
    },
    reset: function () {
    //    
    },
    lineClearPoints: function() {
        if(!coordinate_o.canvas || !coordinate_o.ctx) return;
        console.log('lineClearPoints');
        coordinate_o.canvas.style.zIndex = -1;
        coordinate_o.ctx.clearRect(0, 0, coordinate_o.ctx.canvas.width, coordinate_o.ctx.canvas.height);
    },
    lineDrawPoints: function() {
        if(!coordinate_o.canvas || !coordinate_o.ctx) return;
        console.log('lineDrawPoints');

        coordinate_o.canvas.style.zIndex = 30;
        coordinate_o.ctx.clearRect(0, 0, coordinate_o.ctx.canvas.width, coordinate_o.ctx.canvas.height);
        coordinate_o.ctx.strokeStyle = '#e86888';
        coordinate_o.ctx.lineWidth = 2;
        coordinate_o.ctx.lineCap = 'round';

        var sortedAnswer = coordinate_o.clickPointers.sort((a,b) => {
            var arrA = a.key.split("-");
            var arrB = b.key.split("-");
            if (parseInt(arrA[0]) == parseInt(arrB[0])) return parseInt(arrA[1]) - parseInt(arrB[1]);
            return parseInt(arrA[0]) - parseInt(arrB[0]);
        });
        console.log('lineDrawPoints sortedAnswer', sortedAnswer);
        for(var i = 0; i < sortedAnswer.length - 1; i++) {
            var cur = coordinate_o.clickPointers[i];
            var next = coordinate_o.clickPointers[i+1];
            if(cur && next) {
                coordinate_o.ctx.beginPath();
                coordinate_o.ctx.moveTo(cur.x, cur.y);
                coordinate_o.ctx.lineTo(next.x, next.y);
                coordinate_o.ctx.stroke();
                coordinate_o.ctx.closePath();
                cur = next;
            }
        }
    },
    showAnswer: function(item) {
        if(!coordinate_o.canvas || !coordinate_o.ctx) return;
        var answers = item.answers;
        // console.log('coordinate showanswer item', item, answers, coordinate_o.values);
        var correct = false;
        var correctAnswer = '';
        for(var i=0; i < answers.length; i++){
            var answerXYs = [];
            var XYs = [];
            var answer = answers[i];
            if(coordinate_o.subtype === 0) {
                answer = answer.replace(/ /gi, "");
                answer = answer.replace(/\),\(/gi, "/");
                answer = answer.replace(/\(/gi, "");
                answer = answer.replace(/\)/gi, "");      
                // console.log('answer re', answer);
                if(answer.indexOf("/")) {
                    var arrAnswerXY = answer.split('/');
                    arrAnswerXY.forEach(answerXY => {
                        XYs.push(answerXY);
                    });
                } else {
                    XYs.push(answer);
                }
                answerXYs.push(XYs);
            } else if(coordinate_o.subtype === 1) {
                answer = answer.replace(/ /gi, "");
                answer = answer.replace(/\),/gi, "/");
                if(answer.indexOf("/")) {
                    var arrAnswerXY = answer.split('/');
                    arrAnswerXY.forEach(answerXY => {
                        answerXY = answerXY.replace(/\(/gi, "");
                        answerXY = answerXY.replace(/\)/gi, ""); 
                        XYs.push(answerXY);
                    });
                } else {
                    answer = answer.replace(/\(/gi, "");
                    answer = answer.replace(/\)/gi, ""); 
                    XYs.push(answer);
                }
                answerXYs.push(XYs);
                answer = answer.replace(/\(/gi, "");
                answer = answer.replace(/\)/gi, "");      
                // console.log('answer re', answer);
            }
            // console.log('answerXYs',answerXYs, answer)
            var sortedAnswerXYs = answerXYs[0].sort();
            var sortedChoicedValue = coordinate_o.values.sort();
            // console.log('coordinate showanswer sortedAnswerXYs',JSON.stringify(sortedAnswerXYs));
            // console.log('coordinate showanswer sortedChoicedValue',JSON.stringify(sortedChoicedValue));
            if(JSON.stringify(sortedAnswerXYs) == JSON.stringify(sortedChoicedValue)) {
                correct = true;
                if(coordinate_o.subtype == 1) {
                    var filtedSortedAnswerXYs = [];
                    sortedAnswerXYs.map((item => {
                        filtedSortedAnswerXYs.push(item.substr(1));
                    }));
                    correctAnswer = filtedSortedAnswerXYs;
                } else correctAnswer = sortedAnswerXYs;
            }
        }
        // console.log('coordinate showanswer correct', correct, sortedAnswerXYs);
        if(correct) coordinate_o.lineAnswerDraw(correctAnswer);
    },
    lineAnswerDraw: function(correctAnswer) {
        if(!coordinate_o.canvas || !coordinate_o.ctx) return;
        else if(!correctAnswer || correctAnswer.length < 0) return;

        coordinate_o.canvas.style.zIndex = 30;
        coordinate_o.ctx.clearRect(0, 0, coordinate_o.ctx.canvas.width, coordinate_o.ctx.canvas.height);
        coordinate_o.ctx.strokeStyle = '#e86888';
        coordinate_o.ctx.lineWidth = 2;
        coordinate_o.ctx.lineCap = 'round';

        var sortedAnswer = correctAnswer.sort((a,b) => {
            var arrA = a.split(",");
            var arrB = b.split(",");
            if (parseInt(arrA[0]) == parseInt(arrB[0])) return parseInt(arrA[1]) - parseInt(arrB[1]);
            return parseInt(arrA[0]) - parseInt(arrB[0]);
        });
        // console.log('lineAnswerDraw sortedAnswer', sortedAnswer, correctAnswer);
        var cur = null;
        for(var i = 0; i < sortedAnswer.length; i++) {
            var next = null;
            if(i==0) {
                cur = coordinate_o.clickPointers[0];
                next = coordinate_o.clickPointers.find((item) => item.key === sortedAnswer[i].replace(",", "-"));
            } else {
                next = coordinate_o.clickPointers.find((item) => item.key === sortedAnswer[i].replace(",", "-"));
            }
            if(cur && next) {
                coordinate_o.ctx.beginPath();
                coordinate_o.ctx.moveTo(cur.x, cur.y);
                coordinate_o.ctx.lineTo(next.x, next.y);
                coordinate_o.ctx.stroke();
                coordinate_o.ctx.closePath();
                cur = next;
            }
        }
    },
}   
var scriptsnd_o = {
    idx: -1,
    btns: [],
    init: function (idx) {
        if(scriptsnd_o.idx === idx) return;
        scriptsnd_o.idx = idx;
        scriptsnd_o.btns = [];
        var btns = document.querySelectorAll("[data-type='scriptsnd']");
        if(btns.length < 1) return;
        for(var i = 0; i < btns.length; i++) {
            var findIdx = scriptsnd_o.btns.findIndex((item) => item.id === btns[i].id);
            if(findIdx < 0)  {
                scriptsnd_o.btns.push(btns[i]);
                scriptsnd_o.setBtn(btns[i]);
            }
        }
    },
    setBtn: function (obj) {
        if(!obj) return;
        obj.addEventListener('click', function (e) {
            // console.log('sound click');
            e.stopPropagation();
            e.preventDefault();
            var audio = document.getElementById(obj.id+"_audio");
            if(audio && audio.play) {
                // console.log('audio play');
                audio.play();
            }
        });
    },
}

var domtoimage_o = {
    isTeacher: false,
    capture: function() {
        const element = document.getElementsByClassName('content_page')[0];
        // console.log("element",element)
        domtoimage.toPng(element,{bgcolor: '#ffffff'})
        .then(function(dataUrl) {
            msg = {};
            msg.base64Img = dataUrl;
            // console.log("dataurl",dataUrl);
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
    // console.log('content handlePostMessage', evt.data);
    const data = evt.data;
    if(data && data.type && data.type == 'hideHighlight'){
        // console.log('hideHighlight');
        var penIcons = document.querySelectorAll('.highlight .ico_pen');
        if(penIcons && penIcons.length > 0) {
            penIcons.forEach(penIcon => {
                penIcon.style.display = "none";
            });
        }
        var colorings = document.querySelectorAll('.highlight .coloring');
        if(colorings && colorings.length > 0) {
            colorings.forEach(coloring => {
                coloring.style.display = "none";
            });
        }
        var highlightBoxs = document.querySelectorAll('.strategy .highlight_box');
        if(highlightBoxs && highlightBoxs.length > 0) {
            highlightBoxs.forEach(highlightBox => {
                highlightBox.style.display = "none";
            });
        }
        var legends = document.querySelectorAll('.legend');
        if(legends && legends.length > 0) {
            legends.forEach(legend => {
                legend.style.display = "none";
            });
        }
        return;
    }
    if(data && data.type && data.type == 'showHighlight'){
        // console.log('showHighlight');
        var penIcons = document.querySelectorAll('.highlight .ico_pen');
        if(penIcons && penIcons.length > 0) {
            penIcons.forEach(penIcon => {
                penIcon.style.display = "block";
            });
        }
        var colorings = document.querySelectorAll('.highlight .coloring');
        if(colorings && colorings.length > 0) {
            colorings.forEach(coloring => {
                coloring.style.display = "block";
            });
        }
        var highlightBoxs = document.querySelectorAll('.strategy .highlight_box');
        if(highlightBoxs && highlightBoxs.length > 0) {
            highlightBoxs.forEach(highlightBox => {
                highlightBox.style.display = "block";
            });
        }
        var legends = document.querySelectorAll('.legend');
        if(legends && legends.length > 0) {
            legends.forEach(legend => {
                legend.style.display = "block";
            });
        }
        return;
    }
    if(data && data.type && data.type == 'reload'){
        // console.log('reload');
        location.reload();
        return;
    }
    /*
    if(data && data.type && data.type == 'changeBGStyle'){
        // console.log('changeBGStyle');        
        let body = document.querySelector("body");
        if(data.isInit){
            body.style.zoom = "0.529";
            body.style.background = "";              
            body.style.border = "";
        }
        let right = document.querySelector(".right");
        if (body) {
        if (right)
            body.style.background =
            "linear-gradient(to right, " +
            data.bgColor.main +
            " 50%, " +
            data.bgColor.right +
            " 50%)";
        else body.style.backgroundColor = data.bgColor.main;
        }
        return;
    }
    */
    if(data.from == 'matemplate') {
        if(data.type == 'init') {
            
            // console.log('content handlePostMessage current_o', current_o.idx, data.msg.idx);
            if(!current_o || current_o.idx != data.msg.idx) current_o.idx = data.msg.idx;
            // console.log('content init', current_o.idx, data.msg.idx, data.msg);
            current_o.quizmode = data.msg.quizmode;         
            current_o.content = data.msg.content;
            current_o.isTeacher = data.msg.isTeacher;
            
            var isReset = current_o.quizmode == 'ip' || current_o.quizmode == 'ep';
            // console.log('isReset', isReset);


            if(current_o.content && current_o.content.answers && current_o.content.answers.length > 0) {
                current_o.content.answers.map((item, idx) =>{
                    if(item.basetype === 0) { // Gap / gap
                        numpad_o.init(current_o.idx, item.subtype);
                    } else if(item.basetype === 1) { // Choice / choice or multi choice
                        
                        if(item.subtype === 2 || item.subtype === 3) {
                            // console.log("groupChoice~~init");
                            choicebtn_group_o.init(current_o.idx, item.subtype);
                        }else{
                            choicebtn_o.init(current_o.idx, item.subtype);
                        }
                            
                        
                    } else if(item.basetype === 2 && (item.subtype === 0 || item.subtype === 2 || item.subtype === 4)) { // Drag&Drop / dragdrop or count or group_matchone
                        dragdrop_o.init(current_o.idx, item.subtype);
                    } else if(item.basetype === 2 && (item.subtype === 1 || item.subtype === 3)) { // Drag&Drop / dragdrop copy or copy&count / dragdrop copy group_matchone
                        dragdropcp_o.init(current_o.idx, item.subtype);                        
                    } else if(item.basetype === 2 && item.subtype === 5) { // Drag&Drop / dragdrop copy group_matchone
                        dragdropcp_group_o.init(current_o.idx, item.subtype);                        
                    } else if(item.basetype === 3 && item.subtype === 0) { // Shade / shade
                        shade_o.init(current_o.idx, item.subtype);
                    } else if(item.basetype === 3 && item.subtype === 1) { // Shade / shade
                        shade_o.init(current_o.idx, item.subtype);
                    } else if(item.basetype === 4 && item.subtype === 0) { // Add/remove items / add
                        dragadd_o.init(current_o.idx, item.subtype);
                    } else if(item.basetype === 4 && item.subtype === 2) { // Add/remove tally chart
                        tallychart_o.init(current_o.idx);
                    } else if(item.basetype === 4 && item.subtype === 3) { // Add/remove gap plus
                        dragadd_o.init(current_o.idx, item.subtype); 
                    } else if(item.basetype === 5) { // Connetion / connetion
                        connection_o.init(current_o.idx, item.subtype);
                    } else if(item.basetype === 6) { // Number line / number line
                        numberline_o.init(current_o.idx, item.subtype);                        
                    } else if(item.basetype === 7) { // Picture graph / picture graph
                        picgraph_o.init(current_o.idx, item.subtype);
                    } else if(item.basetype === 8) { // Bar graph / bar graph
                        bargraph_o.init(current_o.idx, item.subtype);
                    } else if(item.basetype === 9) { // Line plot / line plot
                        lineplot_o.init(current_o.idx, item.subtype);                        
                    } else if(item.basetype === 10 && item.subtype === 0 || item.basetype === 10 && item.subtype === 1) { // Clock Hands / clock hands & group
                        clockhands_o.init(current_o.idx, item.subtype);
                    } else if(item.basetype === 11 && item.subtype === 0) { // Radio / radio
                        radio_o.init(current_o.idx);
                    } else if(item.basetype === 12 && item.subtype === 0) { // Checkbox / checkbox
                        checkbox_o.init(current_o.idx);
                    } else if(item.basetype === 13) { // Grid and Chart / grid and hart
                        gridchart_o.init(current_o.idx, item.subtype);
                    } else if(item.basetype === 14) { // coordinate
                        coordinate_o.init(current_o.idx, item.subtype);
                    }
                });

                if(current_o.quizmode === "hw") {
                    let rmsg = {};
                    rmsg.idx = current_o.idx;
                    rmsg.quizmode = current_o.quizmode;
                    this.sendPostMessage('inited', rmsg);
                }
            }
            scriptsnd_o.init(current_o.idx);
        } else if(data.type == 'completed') {
            // console.log('content completed', current_o.idx, data.msg.idx, current_o.content);
            if(current_o.idx != data.msg.idx) return;
            if(!current_o.content) return;

            if(current_o.content.answers && current_o.content.answers.length > 0) {
                current_o.content.answers.map((item, idx) =>{
                    if(item.basetype === 0) { // Gap / gap
                        if(current_o.quizmode && current_o.quizmode != 'hw'){ //home work일때는 정오답을 안보여줌.
                            numpad_o.showAnswer(item);
                        }                        
                        numpad_o.setCompleted(true);
                    } else if(item.basetype === 1) { // Choice / choice                        
                        if(item.subtype === 2 || item.subtype === 3) {
                            // console.log("groupChoice~~completed");
                            choicebtn_group_o.setCompleted(true);
                            if(current_o.quizmode && current_o.quizmode != 'hw'){ //home work일때는 정오답을 안보여줌.
                                if(item.matchType == '1'){ //그룹의 경우 match one은 or개념이라 정확한 정답을 표시 할수 없기 때문에,ME일대만 정답을 보여줌
                                    choicebtn_group_o.showAnswer(item);
                                }
                                
                            }
                        }else{
                            choicebtn_o.setCompleted(true);
                            if(current_o.quizmode && current_o.quizmode != 'hw'){ //home work일때는 정오답을 안보여줌.
                                choicebtn_o.showAnswer(item);                            
                            }
                        }
                    } else if(item.basetype === 2 && (item.subtype === 0 || item.subtype === 2 || item.subtype === 4)) { // Drag&Drop / dragdrop
                        dragdrop_o.setCompleted(true);
                    } else if(item.basetype === 2 && (item.subtype === 1 || item.subtype === 3)) { // Drag&Drop / dragdrop copy
                        dragdropcp_o.setCompleted(true);
                    } else if(item.basetype === 2 && item.subtype === 5) { // Drag&Drop / dragdrop copy group math one
                        dragdropcp_group_o.setCompleted(true);
                    } else if(item.basetype === 3) { // Shade / shade , match
                        shade_o.setCompleted(true);
                    } else if(item.basetype === 4 && item.subtype === 0) { // Add/remove items / add
                        dragadd_o.setCompleted(true);
                    } else if(item.basetype === 4 && item.subtype === 2) { // Add/remove tally chart
                        tallychart_o.setCompleted(true);
                    } else if(item.basetype === 4 && item.subtype === 3) { // Add/remove gap plus
                        dragadd_o.setCompleted(true); 
                    } else if(item.basetype === 5) { // Connetion / connetion
                        connection_o.setCompleted(true);
                    } else if(item.basetype === 6) { // Number line / number line
                        if(current_o.quizmode && current_o.quizmode != 'hw'){ //home work일때는 정오답을 안보여줌.
                            numberline_o.showAnswer(item);
                        }
                        numberline_o.setCompleted(true);                        
                    } else if(item.basetype === 7) { // Picture graph / picture graph
                        picgraph_o.setCompleted(true);                        
                    } else if(item.basetype === 8) { // Bar graph / bar graph
                        bargraph_o.setCompleted(true);                        
                    } else if(item.basetype === 9) { // Line plot / line plot
                        lineplot_o.setCompleted(true);
                    } else if(item.basetype === 10 && item.subtype === 0) { // Clock Hands / clock hands
                        clockhands_o.setCompleted(true);       
                    } else if(item.basetype === 11 && item.subtype === 0) { // Radio / radio
                        if(current_o.quizmode && current_o.quizmode != 'hw'){ //home work일때는 정오답을 안보여줌.
                            radio_o.showAnswer(item);
                        }
                        radio_o.setCompleted(true);
                    } else if(item.basetype === 12 && item.subtype === 0) { // Checkbox / checkbox
                        if(current_o.quizmode && current_o.quizmode != 'hw'){ //home work일때는 정오답을 안보여줌.
                            checkbox_o.showAnswer(item);
                        }
                        checkbox_o.setCompleted(true);
                    } else if(item.basetype === 13) { // Grid and chart / grid and Chart
                        gridchart_o.setCompleted(true);
                    } else if(item.basetype === 14) { // coordinate
                        // if(current_o.quizmode && current_o.quizmode != 'hw'){ //home work일때는 정오답을 안보여줌.
                        //     coordinate_o.showAnswer(item);
                        // }
                        coordinate_o.setCompleted(true);
                    }
                });
            }
        } else if(data.type == 'domtoimage') { // 2020_09_09 성준 추가 domtoimage 로 이미지 캡처링
            domtoimage_o.capture();
        } else if(data.type == 'captureContent'){ //현재 사용 안함.
            //domtoimage가 import안되어있을경우 대비 동적으로 넣음.
            var s = document.createElement("script");
            s.type = "text/javascript";
            s.async = false;
            // s.src = "https://cdnjs.cloudflare.com/ajax/libs/dom-to-image/2.6.0/dom-to-image.js";
            s.src = "/content/mathalive_lib/dom-to-image.js";
            const head = document.getElementsByTagName("head")[0];  
            head.appendChild(s);
            const element = document.getElementsByClassName('content_page')[0];
            // console.log("element",element)

            s.onload = () => {
                domtoimage.toPng(element)
                .then(function(dataUrl) {
                    msg = {};
                    msg.base64Img = dataUrl;
                    // console.log("captureContent",dataUrl);
                    this.sendPostMessage('captureContent',msg);
                    //스크립트는 다시 리무브.
                    head.removeChild(s);
                }).catch(function (error) {
                    alert(`something went wrong!(img src...,etc...)${error}`);
                });
            }
            
            
        } else if(data.type == 'changeBGStyle'){
            // console.log('changeBGStyle');        
            let body = document.querySelector("body");
            let right = document.querySelector(".desc_page + .right");
            if (body) {
                // console.log('right')
                if (right)
                    body.style.background =
                    "linear-gradient(to right, " +
                    data.msg.bgColor.main +
                    " 50%, " +
                    data.msg.bgColor.right +
                    " 50%)";
                else body.style.backgroundColor = data.msg.bgColor.main;
            }
            return;
        } else if(data.type == 'stgAnswerVisibility'){
            // console.log('stgAnswerVisibility');        
            var stgAnswers = document.querySelectorAll(".stg_answer");
            var visibleValue = data.msg.isVisible ? "visible" : "hidden";
            // console.log("visibleValue",visibleValue);
            stgAnswers.forEach(stgAnswer => {
                stgAnswer.style.visibility = visibleValue;
            });
        } else if(data.type == 'stgAnswerQuestionVisibility'){
            // console.log('stgAnswerQuestion');        
            var stgQuestions = document.querySelectorAll(".stg_question");
            var visibleValue = data.msg.isVisible ? "visible" : "hidden";
            stgQuestions.forEach(stgQuestion => {
                stgQuestion.style.visibility = visibleValue;
            });
        } else if(data.type == 'getStgAnswer'){
            var stgAnswers = document.querySelector(".stg_answer");            
            var msg = {};
            msg.innerHTML = stgAnswers? stgAnswers.innerHTML : "제작 이슈, .stgAnswer영역이 없음.";
            msg.to = data.from;
            // console.log("getStgAnswer post msg",msg);
            this.sendPostMessage('notifyStgAnswer',msg);
        }else if(data.type == 'getStgTitle'){                                 
            var contentInner = document.querySelector(".content_page").innerHTML;
            var cloneContent = document.createElement('div');
            cloneContent.innerHTML = contentInner;
            var stgAnswer = cloneContent.querySelector(".stg_answer"); 
            // console.log('stgAnswer', stgAnswer);
            var stgTitle = undefined;
            if(stgAnswer) {
                stgAnswer.remove();   
                stgTitle = cloneContent;   
            }            
            var msg = {};
            msg.innerHTML = stgTitle? stgTitle.innerHTML : "제작 이슈, .stgAnswer영역이 없음.";
            msg.to = data.from;
            // console.log("getStgTitle post msg",msg);
            this.sendPostMessage('notifyStgTitle',msg);
            if(cloneContent) cloneContent.remove();
        } else if(data.type == 'getLookbackAnswer'){
            var hasDataEls = document.querySelectorAll('[data-type]');
            var answerEls = [];
            hasDataEls.forEach(element => {
                if(element.dataset.type === data.msg.type){
                    answerEls.push(element);
                }                
            });
            var answerValues = data.msg.values;
            var correctAnswerEls = [];
            answerEls.forEach(element => {
                const findReturnValue = answerValues.find(value => value == element.getAttribute('value'));
                if(findReturnValue !== undefined) {
                    correctAnswerEls.push(element);
                }
            });            
            var lookbackAnswers = [];
            correctAnswerEls.forEach(element => {
                const imgEl = element.querySelector('img');
                if(imgEl){
                    lookbackAnswers.push({type:'img', data:imgEl.getAttribute('src')}); 
                }else{
                    const cloneEl = element.cloneNode(true);
                    // console.log('cloneEl',cloneEl);
                    const spanEls = cloneEl.querySelectorAll('span');
                    if(spanEls) {
                        spanEls.forEach(element => {
                            cloneEl.removeChild(element);
                        });
                    }

                    const innerHTML = cloneEl.innerHTML;
                    lookbackAnswers.push({type:'text', data:innerHTML});
                }
            });
            var msg = {};
            msg.answer = lookbackAnswers;
            msg.to = data.from;
            console.log("getLookbackAnswer post msg",msg);
            this.sendPostMessage('notifyLookbackAnswer',msg);
        }
    }else if(data.from == 'editor_preview' || data.from == 'editor_thumbnail') {
        if(data.type == 'captureContent'){ //에디터에서 솔루션용 문제 캡쳐를 위해 추가.
            //domtoimage가 import안되어있을경우 대비 동적으로 넣음.
            var s = document.createElement("script");
            s.type = "text/javascript";
            s.async = false;
            // s.src = "https://cdnjs.cloudflare.com/ajax/libs/dom-to-image/2.6.0/dom-to-image.js";
            s.src = "/content/mathalive_lib/dom-to-image.js";
            const head = document.getElementsByTagName("head")[0];  
            head.appendChild(s);
            const element = document.getElementsByClassName('content_page')[0];
            // console.log("element",element)

            s.onload = () => {
                domtoimage.toPng(element)
                .then(function(dataUrl) {
                    msg = {};
                    msg.base64Img = dataUrl;
                    msg.from = data.from;
                    // console.log("captureContent",data.from);
                    this.sendPostMessage('captureContent',msg);
                    //스크립트는 다시 리무브.
                    head.removeChild(s);
                }).catch(function (error) {
                    alert(`something went wrong!(img src...,etc...)${error}`);
                });
            }
            
            
        }
    }

} 
function sendPostMessage(type, msg) {
    // console.log('content sendPostMessage', type, msg);
    var postMsgData = { from:'macontent', to: "matemplate", type: type, msg: msg};
    window.parent.postMessage(postMsgData, "*");
} 

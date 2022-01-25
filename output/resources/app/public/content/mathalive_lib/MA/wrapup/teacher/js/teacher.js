(()=>{"use strict";var t={762:(t,o,e)=>{Object.defineProperty(o,"__esModule",{value:!0}),o.App=void 0;const n=e(478),i=e(201);function a(t){if(!t)return t;t.displayMode=""+t.displayMode=="2"?"2":"1";let o=t.thumb&&""!==t.thumb?t.thumb:"";(o.startsWith("static/")||""===o)&&(o="/content/mathalive_lib/images/default_elephant.png",t.thumb=o);let e=t.avatar&&""!==t.avatar?t.avatar:"";return""===e&&(e="/content/mathalive_lib/images/default_cheese.png",t.avatar=e),console.log("=====> _initStudent student",t),t}class c{static get isMobile(){return c._isMobile}static get tempEl(){return c._tempEl}static pub_init(){const t=navigator.userAgent;c._isMobile=/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(t)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(t)||/android/i.test(t),c._tempBnd=document.createElement("div"),c._tempBnd.style.display="none",c._tempEl=document.createElement("div"),c._tempBnd.appendChild(c._tempEl),null===document.body?document.addEventListener("DOMContentLoaded",(t=>{document.body.appendChild(c._tempBnd)})):document.body.appendChild(c._tempBnd)}static get students(){return c._students}static get student(){return c._student}static get lang(){return c._lang}static get isDvlp(){return c._isDvlp}static get data_url(){return c._data_url}static get lesson(){return c._lesson}static get book(){return c._book}static get nextBook(){return c._nextBook}static get prevBook(){return c._prevBook}static get addOnHost(){return c._addOnHost}static pub_load(t,o,e,n,i,r,d){c._lesson=n,c._book=e,c._nextBook=r,c._prevBook=d,c._students=[],t&&Array.isArray(t)&&t.forEach(((t,o)=>{c._students[o]=a(t)})),c._student=a(o),i&&""!==i&&(c._addOnHost=i)}static pub_reloadStudents(t){i.getStudents(((o,e)=>{for(;c._students.length>0;)c._students.pop();for(;c._students_inited.length>0;)c._students_inited.pop();for(let t=0,e=o.length;t<e;t++)c.isDvlp?c._students[t]=a(o[t]):c._students[t]=a({id:o[t].id,name:o[t].name,thumb:o[t].defaultThumbnail,avatar:o[t].profileThumbnail,nickname:o[t].nickName,displayMode:o[t].displayMode,inited:!0}),c._students_inited.push(o[t].id);t()}))}static pub_parseStyle(t){return c._tempEl.style.cssText=t,c._tempEl.style}static pub_initAudio(){c._common_audio=document.getElementById("common_audio"),c._ding_audio=document.getElementById("ding_audio"),c._dingend_audio=document.getElementById("dingend_audio"),c._btn_audio=document.getElementById("btn_audio"),c._correct_audio=document.getElementById("correct_audio"),c._wrong_audio=document.getElementById("wrong_audio"),c._topad_audio=document.getElementById("topad_audio"),c._goodjob_audio=document.getElementById("goodjob_audio"),c._btn_back_audio=document.getElementById("btn_back_audio"),c._btn_page_audio=document.getElementById("btn_page_audio"),c._popup_audio=document.getElementById("popup_audio"),c._clock_audio=document.getElementById("clock_audio"),c._ts_bgm_audio=document.getElementById("ts_bgm_audio"),c._bs_audio=document.getElementById("bs_audio"),c._bb_audio=document.getElementById("bb_audio"),c._cd_audio=document.getElementById("cd_audio"),c._tc_audio=document.getElementById("tc_audio"),c._te_audio=document.getElementById("te_audio"),c._trg_bgm_audio=document.getElementById("trg_bgm_audio"),c._afc_audio=document.getElementById("afc_audio"),c._trs_audio=document.getElementById("trs_audio"),c._btn_choice_audio=document.getElementById("btn_choice_audio"),c._retry_audio=document.getElementById("retry_audio"),c._sorry_audio=document.getElementById("sorry_audio"),c._great_audio=document.getElementById("great_audio"),c._memorygame_flipcard_audio=document.getElementById("flipcard_audio"),c._ispy_gameclick_audio=document.getElementById("gameclick_audio")}static pub_playClock(){c._clock_audio&&(c._clock_audio.currentTime=4.5,c._clock_audio.play())}static pub_playPopup(){c._popup_audio&&(c._popup_audio.currentTime=0,c._popup_audio.play())}static pub_playBtnPage(){c._btn_page_audio&&(c._btn_page_audio.currentTime=0,c._btn_page_audio.play())}static pub_playBtnBack(){c._btn_back_audio&&(c._btn_back_audio.currentTime=0,c._btn_back_audio.play())}static pub_playGoodjob(){c._goodjob_audio&&(c._goodjob_audio.currentTime=0,c._goodjob_audio.play())}static pub_playDing(){c._ding_audio&&(c._ding_audio.currentTime=0,c._ding_audio.play())}static pub_playDingend(){c._dingend_audio&&(c._dingend_audio.currentTime=0,c._dingend_audio.play())}static pub_playToPad(){c._topad_audio&&(c._topad_audio.currentTime=0,c._topad_audio.play())}static pub_playBtnTab(){c._btn_audio&&(c._btn_audio.currentTime=0,c._btn_audio.play())}static pub_playCorrect(){c._correct_audio&&(c._correct_audio.currentTime=0,c._correct_audio.play())}static pub_playWrong(){c._wrong_audio&&(c._wrong_audio.currentTime=0,c._wrong_audio.play())}static pub_playTeamSelectBgm(){c._ts_bgm_audio&&(c._ts_bgm_audio.currentTime=0,c._ts_bgm_audio.play())}static pub_stopTeamSelectBgm(){c._ts_bgm_audio&&(c._ts_bgm_audio.pause(),c._ts_bgm_audio.currentTime=0)}static pub_playStartButton(){c._bs_audio&&(c._bs_audio.currentTime=0,c._bs_audio.play())}static pub_playBasicButton(){c._bb_audio&&(c._bb_audio.currentTime=0,c._bb_audio.play())}static pub_playCountDown(){c._cd_audio&&(c._cd_audio.currentTime=0,c._cd_audio.play())}static pub_playTimerClock(){c._tc_audio&&(c._tc_audio.currentTime=0,c._tc_audio.play())}static pub_stopTimerClock(){c._tc_audio&&(c._tc_audio.pause(),c._tc_audio.currentTime=0)}static pub_playTimerEnd(){c._te_audio&&(c._te_audio.currentTime=0,c._te_audio.play())}static pub_playResultGraph(){c._trg_bgm_audio&&(c._trg_bgm_audio.currentTime=0,c._trg_bgm_audio.play())}static pub_playFireworksClapping(){c._afc_audio&&(c._afc_audio.currentTime=0,c._afc_audio.play())}static pub_playTotalResult(){c._trs_audio&&(c._trs_audio.currentTime=0,c._trs_audio.play())}static pub_playChoiceBtn(){c._btn_choice_audio&&(c._btn_choice_audio.currentTime=0,c._btn_choice_audio.play())}static pub_playsorry(){c._sorry_audio&&(c._sorry_audio.currentTime=0,c._sorry_audio.play())}static pub_playretry(){c._retry_audio&&(c._retry_audio.currentTime=0,c._retry_audio.play())}static pub_playgreat(){c._great_audio&&(c._great_audio.currentTime=0,c._great_audio.play())}static pub_playFlipCard(){c._memorygame_flipcard_audio&&(c._memorygame_flipcard_audio.currentTime=0,c._memorygame_flipcard_audio.play())}static pub_playGameClick(){c._ispy_gameclick_audio&&(c._ispy_gameclick_audio.currentTime=0,c._ispy_gameclick_audio.play())}static pub_stop(){null!=c._common_audio.onended&&c._common_audio.onended.call(c._common_audio,new Event("ended")),c._common_audio.oncanplaythrough=null,isNaN(c._common_audio.duration)||c._common_audio.paused||c._common_audio.pause()}static pub_play(t,o){c.pub_stop(),t=n.nteString(t,"");const e=n.nteString(c._common_audio.getAttribute("src"),"");if(""===t&&""===e)return void(null!=o&&o(!0));""!==t&&e!==t&&(c._common_audio.src=t);const i=t=>{c._common_audio.onended=null,null!==o&&o(!0),c._common_audio.removeEventListener("error",i)};c._common_audio.onended=t=>{c._common_audio.onended=null,null!==o&&o(!!t),c._common_audio.removeEventListener("error",i)},c._common_audio.addEventListener("error",i),isNaN(c._common_audio.duration)?(c._common_audio.oncanplaythrough=t=>{0!==c._common_audio.currentTime&&(c._common_audio.currentTime=0),c._common_audio.play(),c._common_audio.oncanplaythrough=null},c._common_audio.load()):(0!==c._common_audio.currentTime&&(c._common_audio.currentTime=0),c._common_audio.oncanplaythrough=null,c._common_audio.play())}static pub_set(t,o,e){c._isDvlp=o,c._lang=e,i.set(o)}static pub_addInitedStudent(t){let o=!0;for(let e=0,n=c._students_inited.length;e<n;e++)c._students_inited[e]===t.id&&(o=!1);o&&c._students_inited.push(t.id);const e=c._start_idx>0&&c._students.length>0&&c._students_inited.length>=c._students.length;return e&&(window.clearTimeout(c._start_idx),c._start_idx=-1),e}static pub_start(t){0===c._students.length||c._students_inited.length>=c._students.length?t():c._start_idx=window.setTimeout(t,2e3)}static pub_clear(){for(;c._students.length>0;)c._students.pop();for(;c._students_inited.length>0;)c._students_inited.pop()}}o.App=c,c._isMobile=!1,c._students=[],c._students_inited=[],c._student=null,c._lang="ko",c._isDvlp=!1,c._data_url="../data/",c._lesson="",c._book="",c._nextBook=!1,c._prevBook=!1,c._start_idx=-1,c.isStarted=!1,c._addOnHost="https://addonsapi.fel40.com"},268:(t,o)=>{Object.defineProperty(o,"__esModule",{value:!0}),o.importLink=o.importHTML=void 0,o.importHTML=function(t){return new Promise(((o,e)=>{const n=new XMLHttpRequest;n.open("GET",t,!0),n.responseType="document",n.onload=t=>{if(!t)return;const i=n.response;i&&i.body&&i.body.firstElementChild?o(i.body.firstElementChild):i&&i.documentElement?o(i.documentElement):e("error")},n.onerror=t=>{e(t)},n.send(null)}))},o.importLink=function(t,o){return new Promise(((o,e)=>{const n=new XMLHttpRequest;n.open("GET",t,!0),n.responseType="document",n.onload=t=>{if(!t)return;const e=n.response;o(e)},n.onerror=t=>{e(t)},n.send(null)}))}},478:(t,o)=>{Object.defineProperty(o,"__esModule",{value:!0}),o._toStringTimestamp=o.getDateStr=o.nteArray=o.intToHTMLcolor=o.nteBool=o.nteString=o.nteFloat=o.nteInt=o.nteUInt=o.getUnicUrl=o.getUnicNum=o.getUnic=void 0,Date.now||(Date.now=function(){return(new Date).getTime()});let e=0;function n(){return i().toString(36)}function i(){const t=Date.now();return t>e?e=t:e+=1,e}o.getUnic=n,o.getUnicNum=i,o.getUnicUrl=function(t){if(!t)return"";let o=t=t.trim();return 0!==o.indexOf("http://")&&0!==o.indexOf("https://")||(o=o.indexOf("?")>0?o+"&t="+n():o+"?t="+n()),o},o.nteUInt=function(t,o){if(null==t)return o;if("number"==typeof t)return isNaN(t)||t<0?o:Math.round(t);{const e=parseInt(String(t),10);return isNaN(e)||e<0?o:e}},o.nteInt=function(t,o){if(null==t)return o;if("number"==typeof t)return Math.round(t);{const e=parseInt(String(t),10);return isNaN(e)?o:e}},o.nteFloat=function(t,o){if(null==t)return o;if("number"==typeof t)return t;{const e=parseFloat(String(t));return isNaN(e)?o:e}},o.nteString=function(t,o){return null==t?o:String(t)},o.nteBool=function(t,o){if(null==t)return o;if("boolean"==typeof t)return t;const e=String(t);return"true"===e||"false"!==e&&o},o.intToHTMLcolor=function(t){let o,e,n,i=t-0;o=(255&i)<<16,e=65280&i,n=(16711680&i)>>>16,i=o|e|n;let a=i.toString(16);return a="#000000".substring(0,7-a.length)+a,a},o.nteArray=function(t){if(t){if(Array.isArray(t))return t;if("string"==typeof t){const o=t;if(o.indexOf("[")>=0&&o.indexOf("]")>0)try{return JSON.parse(o)}catch(t){}}const o=[];return o.push(t),o}return[]},o.getDateStr=function(t="."){const o=new Date,e=o.getFullYear(),n=o.getMonth()+1,i=o.getDate();return e+t+(n<10?"0"+n:""+n)+t+(i<10?"0"+i:""+i)},o._toStringTimestamp=function(t){let o;const e=t.getFullYear();let n=t.getMonth()+1+"";parseInt(n,10)<10&&(n="0"+n);let i=t.getDate()+"";return parseInt(i,10)<10&&(i="0"+i),o=e+"-"+n+"-"+i+" "+t.toTimeString().substr(0,8),o}},201:function(t,o,e){var n=this&&this.__awaiter||function(t,o,e,n){return new(e||(e=Promise))((function(i,a){function c(t){try{d(n.next(t))}catch(t){a(t)}}function r(t){try{d(n.throw(t))}catch(t){a(t)}}function d(t){var o;t.done?i(t.value):(o=t.value,o instanceof e?o:new e((function(t){t(o)}))).then(c,r)}d((n=n.apply(t,o||[])).next())}))};Object.defineProperty(o,"__esModule",{value:!0}),o.getPreviewDmsResult=o.getPreviewResult=o.clearPenTool=o.hidePenTool=o.showPenTool=o.showRecordTool=o.showSendButton=o.alertToStudent=o.showSLoading=o.showSMathKit=o.clearSPenTool=o.takePicture=o.uploadInclassReport=o.stopVideoRecord=o.startVideoRecord=o.switchCamera=o.stopCamera=o.startCustomCamera=o.startCamera=o.getStudents=o.uploadImageToServer=o.uploadFileToServer=o.stopVoiceRecord=o.startVoiceRecord=o.sendTeacher=o.disableSoftwareKeyboard=o.sendPAD=o.sendPADToID=o.sendLauncher=o.uploadStudentReport=o.addStudentForStudentReportType6=o.hideStudentReportListPage=o.showStudentReportListPage=o.showStudentReportUI=o.hideStudentReportUI=o.startStudentReportProcess=o.finishContentPage=o.showTMathKit=o.alertToTeacher=o.showTLoading=o.clearTPenTool=o.getBookCaptureInfo=o.uploadTImageToServer=o.useFractionBar=o.logOut=o.exitClass=o.getNaviInfo=o.launchPadTool=o.launchTool=o.exitBook=o.gotoBookByKey=o.gotoBook=o.set=void 0;const i=e(215);let a=!1;o.set=function(t){a=t},o.gotoBook=function(t,o){if(console.log("felsocket gotoBook",t,o),!a)try{window.tsoc_o.gotoBook(t,o)}catch(t){}},o.gotoBookByKey=function(t){if(console.log("felsocket gotoBookByKey",t),!a)try{window.tsoc_o.gotoBookByKey(t)}catch(t){}},o.exitBook=function(){if(console.log("felsocket exitBook"),!a)try{window.tsoc_o.exitBook()}catch(t){}},o.launchTool=function(t){if(console.log("felsocket launchTool",t),!a)try{window.tsoc_o.launchTool(t)}catch(t){}},o.launchPadTool=function(t){if(console.log("felsocket launchPadTool",t),!a)try{window.tsoc_o.launchPadTool(t)}catch(t){}},o.getNaviInfo=function(t){if(console.log("felsocket getNaviInfo",t),!a)try{window.tsoc_o.getNaviInfo(t)}catch(t){}},o.exitClass=function(){if(console.log("felsocket exitClass"),!a)try{window.tsoc_o.exitClass()}catch(t){}},o.logOut=function(){if(console.log("felsocket logOut"),!a)try{window.tsoc_o.logOut()}catch(t){}},o.useFractionBar=function(){if(console.log("felsocket useFractionBar"),!a)try{window.tsoc_o.useFractionBar()}catch(t){}},o.uploadTImageToServer=function(t,o,e,n){if(console.log("felsocket uploadTImageToServer",o,e,n),!a)try{window.tsoc_o.uploadImageToServer(t,o,e,n)}catch(t){}},o.getBookCaptureInfo=function(t){if(console.log("felsocket getBookCaptureInfo"),!a)try{window.tsoc_o.getBookCaptureInfo(t)}catch(t){}},o.clearTPenTool=function(){if(console.log("felsocket clearTPenTool"),!a)try{window.tsoc_o.clearPenTool()}catch(t){}},o.showTLoading=function(t){if(console.log("felsocket showTLoading",t),!a)try{window.tsoc_o.showLoading(t)}catch(t){}},o.alertToTeacher=function(t){if(console.log("felsocket alertToTeacher",t),!a)try{window.tsoc_o.alert(t)}catch(t){}},o.showTMathKit=function(t){if(console.log("felsocket showTMathKit",t),!a)try{window.tsoc_o.showMathKit(t)}catch(t){}},o.finishContentPage=function(){if(!a)try{window.tsoc_o.finishContentPage()}catch(t){}},o.startStudentReportProcess=function(t,o,e){if(!a)try{window.tsoc_o.startStudentReportProcess(t,o,e)}catch(t){}},o.hideStudentReportUI=function(){if(!a)try{window.tsoc_o.hideStudentReportUI()}catch(t){}},o.showStudentReportUI=function(){if(!a)try{window.tsoc_o.showStudentReportUI()}catch(t){}},o.showStudentReportListPage=function(){if(!a)try{window.tsoc_o.showStudentReportListPage()}catch(t){}},o.hideStudentReportListPage=function(){if(!a)try{window.tsoc_o.hideStudentReportListPage()}catch(t){}},o.addStudentForStudentReportType6=function(t){if(!a)try{window.tsoc_o.addStudentForStudentReportType6(t)}catch(t){}},o.uploadStudentReport=function(t,o,e){if(!a)try{window.psoc_o.uploadStudentReport(t,o,e)}catch(t){}},o.sendLauncher=function(t,o){if(5!==t||a)if(6!==t||a)if(7!==t||a){if(8===t)if(console.log("felsocket gotoPrevBook"),a)try{window.top.tsoc_o.gotoPrevBook()}catch(t){}else try{window.tsoc_o.gotoPrevBook()}catch(t){}else if(9===t)if(console.log("felsocket gotoNextBook"),a)try{window.top.tsoc_o.gotoNextBook()}catch(t){}else try{window.tsoc_o.gotoNextBook()}catch(t){}}else try{window.tsoc_o.setTitleBar(o)}catch(t){}else try{window.tsoc_o.showTitleBar()}catch(t){}else try{window.tsoc_o.hideTitleBar()}catch(t){}},o.sendPADToID=function(t,o,e){const n={type:o,data:e};if(a)try{window.top.tsoc_o.sendPADToID(t,n)}catch(t){}else try{window.tsoc_o.sendPADToID(t,n)}catch(t){}},o.sendPAD=function(t,o){const e={type:t,data:o};if(a)try{window.top.tsoc_o.sendAll(e)}catch(t){}else try{window.tsoc_o.sendAll(e)}catch(t){}},o.disableSoftwareKeyboard=function(){try{window.psoc_o.disableSoftwareKeyboard()}catch(t){}},o.sendTeacher=function(t,o){const e={type:t,data:o};if(a)try{window.opener.tsoc_o.sendTeacher(e)}catch(t){}else try{window.psoc_o.sendTeacher(e)}catch(t){}},o.startVoiceRecord=function(){try{window.psoc_o.startVoiceRecord()}catch(t){}},o.stopVoiceRecord=function(){try{window.psoc_o.stopVoiceRecord()}catch(t){}},o.uploadFileToServer=function(t){try{window.psoc_o.uploadFileToServer(t)}catch(t){}},o.uploadImageToServer=function(t,o,e,n){try{window.psoc_o.uploadImageToServer(t,o,e,n)}catch(t){}},o.getStudents=function(t){if(a)if(window.top.tsoc_o)try{window.top.tsoc_o.getStudents(t)}catch(t){}else t([],!1);else try{window.tsoc_o.getStudents(t)}catch(t){}},o.startCamera=function(){if(!a)try{window.psoc_o.startCamera()}catch(t){}},o.startCustomCamera=function(t){if(!a)try{window.psoc_o.startCustomCamera(t)}catch(t){}},o.stopCamera=function(){if(!a)try{window.psoc_o.stopCamera()}catch(t){}},o.switchCamera=function(){if(!a)try{window.psoc_o.switchCamera()}catch(t){}},o.startVideoRecord=function(){if(!a)try{window.psoc_o.startVideoRecord()}catch(t){}},o.stopVideoRecord=function(){if(!a)try{window.psoc_o.stopVideoRecord()}catch(t){}},o.uploadInclassReport=function(t){if(!a)try{window.tsoc_o.uploadInclassReport(t)}catch(t){}},o.takePicture=function(t){if(!a)try{window.psoc_o.takePicture(t)}catch(t){}},o.clearSPenTool=function(){if(console.log("felsocket clearPenTool"),!a)try{window.psoc_o.clearPenTool()}catch(t){}},o.showSMathKit=function(t){if(console.log("felsocket showSMathKit",t),!a)try{window.psoc_o.showMathKit(t)}catch(t){}},o.showSLoading=function(t){if(console.log("felsocket showSLoading",t),!a)try{window.psoc_o.showLoading(t)}catch(t){}},o.alertToStudent=function(t){if(console.log("felsocket alertToStudent",t),!a)try{window.psoc_o.alert(t)}catch(t){}},o.showSendButton=function(t){if(console.log("felsocket showSendButton"),!a)try{window.psoc_o.showSendButton(t)}catch(t){}},o.showRecordTool=function(t){if(console.log("felsocket showRecordTool",t),!a)try{window.psoc_o.showRecordTool(t)}catch(t){}},o.showPenTool=function(){if(console.log("felsocket showPentool"),!a)try{window.psoc_o.showPenTool()}catch(t){}},o.hidePenTool=function(){if(console.log("felsocket hidePentool"),!a)try{window.psoc_o.hidePenTool()}catch(t){}},o.clearPenTool=function(){if(console.log("felsocket clearPenTool"),!a)try{window.psoc_o.clearPenTool()}catch(t){}},o.getPreviewResult=function(t){return n(this,void 0,void 0,(function*(){return new Promise((o=>{if(a)o([]);else{let e=!1;const n=t=>{e||(e=!0,o(t))};window.tsoc_o.getPreviewResult(n,t),i.delay((()=>{e||(e=!0,o([]))}),5e3)}}))}))},o.getPreviewDmsResult=function(t){return n(this,void 0,void 0,(function*(){return new Promise((o=>{if(a)o([]);else{let e=!1;const n=t=>{e||(e=!0,o(t))};window.tsoc_o.getPreviewDmsResult(n,t),i.delay((()=>{e||(e=!0,o([]))}),5e3)}}))}))}},989:(t,o,e)=>{e.r(o)},209:(t,o,e)=>{Object.defineProperty(o,"__esModule",{value:!0});var n,i=(n=e(804))&&"object"==typeof n&&"default"in n?n.default:n;function a(t){return a.warnAboutHMRDisabled&&(a.warnAboutHMRDisabled=!0,console.error("React-Hot-Loader: misconfiguration detected, using production version in non-production environment."),console.error("React-Hot-Loader: Hot Module Replacement is not enabled.")),i.Children.only(t.children)}a.warnAboutHMRDisabled=!1;var c=function t(){return t.shouldWrapWithAppContainer?function(t){return function(o){return i.createElement(a,null,i.createElement(t,o))}}:function(t){return t}};c.shouldWrapWithAppContainer=!1,o.AppContainer=a,o.hot=c,o.areComponentsEqual=function(t,o){return t===o},o.setConfig=function(){},o.cold=function(t){return t},o.configureComponent=function(){}},53:(t,o,e)=>{t.exports=e(209)},804:t=>{t.exports=React},196:t=>{t.exports=ReactDOM},215:t=>{t.exports=_}},o={};function e(n){var i=o[n];if(void 0!==i)return i.exports;var a=o[n]={exports:{}};return t[n].call(a.exports,a,a.exports,e),a.exports}e.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(t){if("object"==typeof window)return window}}(),e.r=t=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},(()=>{const t=e(53),o=e(804),n=e(196),i=e(762),a=e(201),c=e(268);t.setConfig({ErrorOverlay:t=>o.createElement("div",null)});const r={clear:i.App.pub_clear,importLink:c.importLink,importHTML:c.importHTML};let d=!1;const u=void 0,s=u.default,l=u.AppProvider,_=u.appContext;r.set=(t,o,e)=>{i.App.pub_set(t,o,e),_.setData(t)},r.render=()=>{i.App.pub_initAudio(),n.render(o.createElement(l,null,o.createElement(s,null)),document.getElementById("wrap"))},r.init=(t,o,e,n,a,c)=>{i.App.pub_load(t,null,o,e,n,a,c)},r.start=()=>{d=!0,setTimeout((()=>_.start()),500)},r.receive=t=>{if(4===t.type){const o=t.data;d?o&&o.id&&""!==o.id&&(i.App.isStarted?a.sendPADToID(o.id,0,null):a.sendPADToID(o.id,1,null)):i.App.pub_addInitedStudent(o)&&(d||(d=!0,_.start()))}else _.receive(t)},r.teachingTool=t=>{},r.notifyNaviInfo=(t,o,e,n,i,a)=>{console.log("index.tsx ========>>>> notifyNaviInfo"),_.notifyNaviInfo(t,o,e,n,i,a)},r.notifyBookCaptureInfo=t=>{_.notifyBookCaptureInfo(t)},r.notifyUploadToServerResult=t=>{_.uploaded(t)},r.notifyAlert=t=>{_.notifyAlert(t)},r.notifyPenToolState=(t,o)=>{console.log("app_o notifyPenToolState"),_.notifyPenToolState(t,o)},e(989),e.g.app_o=r})()})();
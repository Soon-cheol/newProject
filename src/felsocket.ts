/**
 * ...
 * @author sychae@kdmt.com
 */
import * as _ from 'lodash';

let _isDvlp = false;

export function set(isDvlp: boolean) {
	// console.log('felsocket.set', isDvlp, _isDvlp);
	_isDvlp = isDvlp;
}
///////////////////////////////////
export function gotoBook(bookid: number, booklist: number[]) {
	console.log('felsocket gotoBook', bookid, booklist);
	if (_isDvlp) return;
	try {
		window['tsoc_o']['gotoBook'](bookid, booklist); // tslint:disable-line
	} catch(e) {} 
}
export function gotoBookByKey(bookkey: number) {
	console.log('felsocket gotoBookByKey', bookkey);
	if (_isDvlp) return;
	try {
		window['tsoc_o']['gotoBookByKey'](bookkey); // tslint:disable-line
	} catch(e) {} 
}
export function exitBook() {
	console.log('felsocket exitBook');
	if (_isDvlp) return;
	try {
		window['tsoc_o']['exitBook'](); // tslint:disable-line
	} catch(e) {} 
}
export function launchTool(conceptKey: string) {
	console.log('felsocket launchTool', conceptKey);
	if (_isDvlp) return;
	try {
		window['tsoc_o']['launchTool'](conceptKey); // tslint:disable-line
	} catch(e) {} 
}
export function launchPadTool(conceptKey: string) {
	console.log('felsocket launchPadTool', conceptKey);
	if (_isDvlp) return;
	try {
		window['tsoc_o']['launchPadTool'](conceptKey); // tslint:disable-line
	} catch(e) {} 
}
export function getNaviInfo(curriType: string) {
	console.log('felsocket getNaviInfo', curriType);
	if (_isDvlp) return;
	try {
		window['tsoc_o']['getNaviInfo'](curriType); // tslint:disable-line
	} catch(e) {} 
}
export function exitClass() {
	console.log('felsocket exitClass');
	if (_isDvlp) return;
	try {
		window['tsoc_o']['exitClass'](); // tslint:disable-line
	} catch(e) {} 
}
export function logOut() {
	console.log('felsocket logOut');
	if (_isDvlp) return;
	try {
		window['tsoc_o']['logOut'](); // tslint:disable-line
	} catch(e) {} 
}
export function useFractionBar() {
	console.log('felsocket useFractionBar');
	if (_isDvlp) return;
	try {
		window['tsoc_o']['useFractionBar'](); // tslint:disable-line
	} catch(e) {} 
}
export function uploadTImageToServer(base64: string, mixPen?: boolean, rect?: {left: number, top: number, width: number, height: number}, save?: { bookkey: number, idx: number}) {
	console.log('felsocket uploadTImageToServer', mixPen, rect, save);
	if (_isDvlp) return;
	try {window['tsoc_o']['uploadImageToServer'](base64, mixPen, rect, save);} catch(e) {} // tslint:disable-line 
}
export function getBookCaptureInfo(bookkey: number) {
	console.log('felsocket getBookCaptureInfo');
	if (_isDvlp) return;
	try {
		window['tsoc_o']['getBookCaptureInfo'](bookkey); // tslint:disable-line
	} catch(e) {} 
}
export function clearTPenTool() {
	console.log('felsocket clearTPenTool');
	if (_isDvlp) return;
	try {window['tsoc_o']['clearPenTool']();} catch(e) {} // tslint:disable-line 
}
export function showTLoading(show: boolean) {
	console.log('felsocket showTLoading', show);
	if (_isDvlp) return;
	try {window['tsoc_o']['showLoading'](show);} catch(e) {} // tslint:disable-line 
}
export function alertToTeacher(msg: string|{text: string, type?: 'confirm', from: 'book'}) {
	console.log('felsocket alertToTeacher', msg);
	if (_isDvlp) return;
	try {window['tsoc_o']['alert'](msg);} catch(e) {} // tslint:disable-line 
}
export function showTMathKit(show: boolean) {
	console.log('felsocket showTMathKit', show);
	if (_isDvlp) return;
	try {
		window['tsoc_o']['showMathKit'](show); // tslint:disable-line
	} catch(e) {} 
}
//////////////////////////////////
export function finishContentPage() {
	if (_isDvlp) return;
	try {
		window['tsoc_o']['finishContentPage'](); // tslint:disable-line
	} catch(e) {} 
}

export function startStudentReportProcess(type: $ReportType, students?: string[]|null, viewType?: 'A'|'B'|'C') {
	if (_isDvlp) return;
	try {
		window['tsoc_o']['startStudentReportProcess'](type, students, viewType); // tslint:disable-line
	} catch(e) {} 
}
export function hideStudentReportUI() {
	if (_isDvlp) return;
	try {
		window['tsoc_o']['hideStudentReportUI'](); // tslint:disable-line
	} catch(e) {} 
}
export function showStudentReportUI() {
	if (_isDvlp) return;
	try {
		window['tsoc_o']['showStudentReportUI'](); // tslint:disable-line
	} catch(e) {} 
}
export function showStudentReportListPage() {
	if (_isDvlp) return;
	try {
		window['tsoc_o']['showStudentReportListPage'](); // tslint:disable-line
	} catch(e) {} 
}
export function hideStudentReportListPage() {
	if (_isDvlp) return;
	try {
		window['tsoc_o']['hideStudentReportListPage'](); // tslint:disable-line
	} catch(e) {} 
}

export function addStudentForStudentReportType6(studentid: string) {
    if (_isDvlp) return;
	try {window['tsoc_o']['addStudentForStudentReportType6'](studentid);} catch(e) {} // tslint:disable-line 
}

export function uploadStudentReport(type: $ReportType, data: string, option: string) {
	if (_isDvlp) return;
	try {
		window['psoc_o']['uploadStudentReport'](type, data, option); // tslint:disable-line
	} catch(e) {}
}

export function sendLauncher(type: $SocketType, data: any) {
	if (type === $SocketType.TOP_TITLE_HIDE && !_isDvlp) {
		try {
			window['tsoc_o']['hideTitleBar'](); // tslint:disable-line
		} catch(e) {} 
	} else if (type === $SocketType.TOP_TITLE_VIEW && !_isDvlp) {
		try {
			window['tsoc_o']['showTitleBar'](); // tslint:disable-line
		} catch(e) {}
	} else if (type === $SocketType.TOP_TITLE_SET && !_isDvlp) {
		try {
			window['tsoc_o']['setTitleBar'](data); // tslint:disable-line
		} catch(e) {} 
	} else if (type === $SocketType.GOTO_PREV_BOOK) {
		console.log('felsocket gotoPrevBook');
		if (_isDvlp) {
			try {
				window.top['tsoc_o']['gotoPrevBook'](); // tslint:disable-line
			} catch(e) {}
		} else {
			try {
				window['tsoc_o']['gotoPrevBook'](); // tslint:disable-line
			} catch(e) {}
		}
	} else if (type === $SocketType.GOTO_NEXT_BOOK) {
		console.log('felsocket gotoNextBook');
		if (_isDvlp) {
			try {
				window.top['tsoc_o']['gotoNextBook'](); // tslint:disable-line
			} catch(e) {}
		} else {
			try {
				window['tsoc_o']['gotoNextBook'](); // tslint:disable-line
			} catch(e) {}
		}
	}
}
	
export function sendPADToID(id: string, type: $SocketType, data: any) {
	const obj = {
		type,
		data,
	};
	if (_isDvlp) {
		try {
			window.top['tsoc_o']['sendPADToID']( id, obj); // tslint:disable-line
		} catch(e) {}
	} else {
		try {
			window['tsoc_o']['sendPADToID'](id, obj); // tslint:disable-line
		} catch(e) {} 
	}
}
	
export function sendPAD(type: $SocketType, data: any) {
	const obj = {
		type,
		data
	};
	if (_isDvlp) {
		try {window.top['tsoc_o']['sendAll'](obj);} catch(e) {} // tslint:disable-line
	} else {
		try {window['tsoc_o']['sendAll'](obj);} catch(e) {} // tslint:disable-line
	}
}
export function disableSoftwareKeyboard() {
	try{ window['psoc_o']['disableSoftwareKeyboard']();} catch(e) {} // tslint:disable-line
}
export function sendTeacher(type: $SocketType, data: any) {
	const obj = {
		type,
		data,
	};
	
	if (_isDvlp) {
		try {
			if(window.opener !== null)window.opener['tsoc_o']['sendTeacher'](obj);// 2021-06-21 NULL 일떄 처리 추가 BY 성준 
		} catch(e) {} // tslint:disable-line
	} else {
		try {window['psoc_o']['sendTeacher'](obj);} catch(e) {} // tslint:disable-line
	}
}
	
export function startVoiceRecord() {
	try {window['psoc_o']['startVoiceRecord']();} catch(e) {} // tslint:disable-line

}
export function stopVoiceRecord() {
	try {window['psoc_o']['stopVoiceRecord']();} catch(e) {} // tslint:disable-line
}
export function uploadFileToServer(deviceUrl: string) {
	try {window['psoc_o']['uploadFileToServer'](deviceUrl);} catch(e) {} // tslint:disable-line
}
export function uploadImageToServer(base64: string, mixPen?: boolean|'split-pen', rect?: {left: number, top: number, width: number, height: number}, save?: { bookkey: number, idx: number}) {
	try {window['psoc_o']['uploadImageToServer'](base64, mixPen, rect, save);} catch(e) {} // tslint:disable-line 
}
export function uploadFileToServerMulti(deviceUrl: any) {
	try {window['psoc_o']['uploadFileToServerMulti'](deviceUrl);} catch(e) {} // tslint:disable-line
}
export function getStudents(callBack: (arr: any[], isOk: boolean) => void) {
	if (_isDvlp) {
		if(window.top['tsoc_o']) {    // tslint:disable-line
			try {
				window.top['tsoc_o']['getStudents'](callBack); // tslint:disable-line
			} catch(e) {} 
			
		} else {
			callBack([], false);
		}
	} else {
		try {window['tsoc_o']['getStudents'](callBack);} catch(e) {} // tslint:disable-line
	}
}

export function startCamera(back?: boolean) {
	if (_isDvlp) return;
	try {
		window['psoc_o']['startCamera'](back); // tslint:disable-line
	} catch(e) {}
}
export function startCustomCamera(rect: {top: number, left: number, width: number, height: number, rearCamera?: boolean, zIndexTop?: boolean, draggable?: boolean}) {
	if (_isDvlp) return;

	window.parent.postMessage({ from: 'content', srcFrame: 'book', type: 'startCustomCamera', msg: rect }, '*');
	/*
	try {
		window['psoc_o']['startCustomCamera'](rect); // tslint:disable-line
	} catch(e) {}
	*/
}
export function playRecordPlayer() {
	if (_isDvlp) return;

	window.parent.postMessage({ from: 'content', srcFrame: 'book', type: 'playRecordPlayer'}, '*');	
}
export function pauseRecordPlayer() {
	if (_isDvlp) return;

	window.parent.postMessage({ from: 'content', srcFrame: 'book', type: 'pauseRecordPlayer'}, '*');	
}
export function stopCamera() {
	if (_isDvlp) return;
	try {
		window['psoc_o']['stopCamera'](); // tslint:disable-line
	} catch(e) {}
}
export function switchCamera(doswitch?: boolean) {
	if (_isDvlp) return;
	try {
		window['psoc_o']['switchCamera'](doswitch); // tslint:disable-line
	} catch(e) {}
}
export function startVideoRecord() {
	if (_isDvlp) return;
	try {
		window['psoc_o']['startVideoRecord'](); // tslint:disable-line
	} catch(e) {}
}
export function stopVideoRecord() {
	if (_isDvlp) return;
	try {
		window['psoc_o']['stopVideoRecord'](); // tslint:disable-line
	} catch(e) {}
}
export function uploadInclassReport(obj: any[]) {
	if (_isDvlp) return;
	try {
		window['tsoc_o']['uploadInclassReport'](obj); // tslint:disable-line
	} catch(e) {} 
}
export function takePicture(rect: {top: number, left: number, width: number, height: number}) {
  if(_isDvlp) return;
  try {
    window['psoc_o']['takePicture'](rect); // tslint:disable-line
  } catch(e) {}
}
export function clearSPenTool() {
	console.log('felsocket clearPenTool');
	if (_isDvlp) return;
	try {window['psoc_o']['clearPenTool']();} catch(e) {} // tslint:disable-line 
}
export function showSMathKit(show: boolean) {
	console.log('felsocket showSMathKit', show);
	if (_isDvlp) return;
	try {
		window['psoc_o']['showMathKit'](show); // tslint:disable-line
	} catch(e) {} 
}
export function showSLoading(show: boolean) {
	console.log('felsocket showSLoading', show);
	if (_isDvlp) return;
	try {window['psoc_o']['showLoading'](show);} catch(e) {} // tslint:disable-line 
}
export function alertToStudent(msg: string|{text: string, type?: 'confirm', from: 'book'}) {
	console.log('felsocket alertToStudent', msg);
	if (_isDvlp) return;
	try {window['psoc_o']['alert'](msg);} catch(e) {} // tslint:disable-line 
}
export function showSendButton(show: boolean,isup?: boolean) {
	console.log('felsocket showSendButton');
	if (_isDvlp) return;
	try {window['psoc_o']['showSendButton'](show,isup);} catch(e) {} // tslint:disable-line 
}
export function showRecordTool(show: boolean) {
	console.log('felsocket showRecordTool', show);
	if (_isDvlp) return;
	try {
		window['psoc_o']['showRecordTool'](show); // tslint:disable-line
	} catch(e) {} 
}
export function showPenTool() {
	console.log('felsocket showPentool');
	if(_isDvlp) return; 
	try {
		window['psoc_o']['showPenTool'](); // tslint:disable-line
	} catch(e) {}
}// 2021 03 31 새로운 펜툴 불러오기 성준 추가
export function hidePenTool() {
	console.log('felsocket hidePentool');
	if(_isDvlp) return; 
	try {
		window['psoc_o']['hidePenTool'](); // tslint:disable-line
	} catch(e) {}
}// 2021 03 31 새로운 펜툴 불러오기 성준 추가
export function clearPenTool() {
	console.log('felsocket clearPenTool');
	if(_isDvlp) return; 
	try {
		window['psoc_o']['clearPenTool'](); // tslint:disable-line
	} catch(e) {}
}// 2021 03 31 새로운 펜툴 불러오기 성준 추가
export function launchSTool(conceptKey: string) {
	console.log('felsocket launchTool', conceptKey);
	if (_isDvlp) return;
	try {
		window['psoc_o']['launchTool'](conceptKey); // tslint:disable-line
	} catch(e) {} 
}// 2021 07 23 최순철 컨셉툴 직접실행 학생 추가 
export function showSLivePointPop(isVisible: boolean) {// true 이면 Popup 뜨는 것과 점수 갱신이 같이 되고 false 면 Popup은 뜨지 않고 점수만 갱신됨 
	console.log('felsocket showLivePointPop'); 
	if(_isDvlp) return;
	try {
		window['psoc_o']['showLivePointPop'](isVisible); // tslint:disable-line
	} catch(e) {}
}
export function showSGiftBox(livepoint: number, colorType?: 'red' | 'green' | null | undefined) {
	console.log('felsocket showGiftBox');
	if(_isDvlp) return; 
	try {
		window['psoc_o']['showGiftBox'](livepoint, colorType); // tslint:disable-line
	} catch(e) {}
}
export async function getPreviewResult(data: IPreviewTextMsg[]) {
	return new Promise<IPreviewTextResult[]>((resolve) => {
		
		if (_isDvlp) {
			resolve([]);
		} else {
			let isEnd = false;
			const callBack = (msg: IPreviewTextResult[]) => {
				if(!isEnd) {
					isEnd = true;
					resolve(msg);
				}
			};

			window['tsoc_o']['getPreviewResult'](callBack, data); // tslint:disable-line
			_.delay(() => {
				if(!isEnd) {
					isEnd = true;
					resolve([]);
				}				
			}, 5000);
		}
	});
}

export async function getPreviewDmsResult(data: IPreviewDmsMsg[]) {
	return new Promise<IPreviewTextResult[]>((resolve) => {
		if (_isDvlp) {
			resolve([]);
		} else {
			let isEnd = false;
			const callBack = (msg: IPreviewTextResult[]) => {
				if(!isEnd) {
					isEnd = true;
					resolve(msg);
				}
			};

			window['tsoc_o']['getPreviewDmsResult'](callBack, data); // tslint:disable-line
			_.delay(() => {
				if(!isEnd) {
					isEnd = true;
					resolve([]);
				}				
			}, 5000);
		}
	});
}

/* 2021_10_01 Remote 관련 추가 함수 */
export async function postViewDiv(msg: ''|'content'|'eyeon'|'direction'|'result') {
	console.log('postViewDiv', msg);
	window.top.postMessage({type: 'viewDiv', msg, from: 'content'}, '*');
}

/* 2021_10_01 Remote 관련 추가 함수 */
export async function postAttention(attention: boolean) {
	console.log('postAttention', attention);
	window.top.postMessage({type: 'attention', msg: attention, from: 'content'}, '*');
}
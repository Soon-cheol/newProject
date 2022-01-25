import { setConfig } from 'react-hot-loader';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { App, IMain } from './App';
import * as felsocket from './felsocket';
import * as importer from '@common/net/importer';

setConfig({
	ErrorOverlay: (errors) => <div/>,
});


const app_o = {
	clear: App.pub_clear,
	importLink: importer.importLink,
	importHTML: importer.importHTML,
};


let _require: any;
let _isTeacher = true;

if(p_base_template_t) {
	_require =  require('./p_base_template/teacher');
} else if(p_base_template_s) {
	_require =  require('./p_base_template/student');
	_isTeacher = false;
} else if(ox_check_t) {
	_require =  require('./ox_check/teacher');
} else if(ox_check_s) {
	_require =  require('./ox_check/student');
	_isTeacher = false;
}

interface IMoudule {
	default: IMain;
	AppProvider: any;
	appContext: IMain;
}

let _started = false;
const _module = _require as IMoudule;
const AppComp: any = _module.default;
const AppProvider = _module.AppProvider;
const appContext = _module.appContext;

app_o['set'] = (data: any, isDvlp: boolean, lang: string) => { // tslint:disable-line
	App.pub_set(data, isDvlp, lang);
	appContext.setData(data);
};

app_o['render'] = () => { // tslint:disable-line
	App.pub_initAudio();
	
	ReactDOM.render(
		<AppProvider><AppComp /></AppProvider>,
		document.getElementById('wrap') as HTMLElement
	);

};

if(_isTeacher) { // *********************** 전자칠판 ***********************
	app_o['init'] = (students: IStudent[], book: string, lesson: string, addOnHost: string, nextBook :boolean, prevBook: boolean) => {    // tslint:disable-line
		App.pub_load(students, null, book, lesson, addOnHost, nextBook, prevBook);
	};

	app_o['start'] = () => {  // tslint:disable-line
		_started = true;
		setTimeout(() => appContext.start(), 500);

	};
	
	app_o['receive'] = (obj: ISocketData) => {  // tslint:disable-line
		if (obj.type === $SocketType.PAD_INIT_COMPLETE) {
			const student = obj.data as IStudent;
			if (_started) {
				if (student && student.id && student.id !== '') {
					if(App.isStarted) {
						felsocket.sendPADToID(student.id, $SocketType.PAD_ONSCREEN, null);
					} else {
						felsocket.sendPADToID(student.id, $SocketType.PAD_START_DIRECTION, null);
					}
				}
			} else {
				if ( App.pub_addInitedStudent(student) ) {					
					if (!_started) {
						_started = true;
						appContext.start();
	
					}
				}
			}
		} else {
			appContext.receive(obj);
		}
	};
	
	app_o['teachingTool'] = (started: boolean) => { // tslint:disable-line
		//
	};

	app_o['notifyNaviInfo'] = (curriculum: CurriculumType, bookid: number, classid: number, unitid: number, lessonid: number, curritype: string) => { // tslint:disable-line
		// console.log("index.tsx ========>>>> notifyNaviInfo")
		appContext.notifyNaviInfo(curriculum, bookid, classid, unitid, lessonid, curritype);
	};

	app_o['notifyBookCaptureInfo'] = (infos: CaptureImageInfo[]) => { // tslint:disable-line
		appContext.notifyBookCaptureInfo(infos);
	};

	app_o['notifyUploadToServerResult'] = (url: string) => { // tslint:disable-line
		appContext.uploaded(url);
	};

	app_o['notifyUploadToServerMultiResult'] = (results: any) => { // tslint:disable-line
		appContext.multiUploaded(results);
	};

	app_o['notifyAlert'] = (isOk: boolean) => { // tslint:disable-line
		appContext.notifyAlert(isOk);
	};
	app_o['notifyPenToolState'] = (isVisible: boolean, height: number) => {// tslint:disable-line
		// console.log("app_o notifyPenToolState");
		appContext.notifyPenToolState(isVisible,height);
	};
	app_o['notifyHamburgerMenuClicked'] = (isView: boolean) => {// tslint:disable-line
		appContext.notifyHamburgerMenuClicked(isView);
	};
	app_o['callThreeminState'] = () => {// tslint:disable-line
		appContext.callThreeminState();
	};
} else {   // *********************** PAD 시작 ***********************
	app_o['init'] = (student: IStudent, book: string, lesson: string, addOnHost: string, nextBook :boolean, prevBook: boolean) => {    // tslint:disable-line
		App.pub_load(null, student, book, lesson, addOnHost, nextBook, prevBook);
		felsocket.sendTeacher($SocketType.PAD_INIT_COMPLETE, student);
		appContext.start();
	};

	app_o['receive'] = (obj: ISocketData) => {  // tslint:disable-line
		if (App.student == null) return;

		appContext.receive(obj);
	};
    
    app_o['notifyUploadToServerResult'] = (url: string) => { // tslint:disable-line
		appContext.uploaded(url);
	};

	app_o['notifyUploadToServerMultiResult'] = (results: any) => { // tslint:disable-line
		appContext.multiUploaded(results);
	};

	app_o['notify'] = (type: string) => { // tslint:disable-line
		appContext.notify(type);
	};
	app_o['notifyVideoRecord'] = (url: string) => { // tslint:disable-line
		appContext.notifyVideoRecord(url);
	};

	app_o['notifyStartVoice'] = () => { // tslint:disable-line
		appContext.notify('notifyStartVoice');
	};
	
	app_o['notifyVoiceRecordResult'] = (url: string) => { // tslint:disable-line
		appContext.notifyRecorded(url);
	};

	app_o['notifyTakePicture'] = (url: string, src: string) => { // tslint:disable-line
		if(!appContext.notifyTakePicture) return;
		appContext.notifyTakePicture(url, src);
	};

	app_o['clickSendButton'] = () => { // tslint:disable-line
		appContext.clickSendButton();
	};

	app_o['notifyRecordData'] = (audio: string, data: PenRecordData) => { // tslint:disable-line
		appContext.notifyRecordData(audio, data);
	};

	app_o['notifyAlert'] = (isOk: boolean) => { // tslint:disable-line
		appContext.notifyAlert(isOk);
	};
	
	app_o['notifyPenToolState'] = (isVisible: boolean, height: number) => {
		// console.log("app_o notifyPenToolState");
		appContext.notifyPenToolState(isVisible,height);
	};
	app_o['notifyLiveGivePopupClose'] = () => {
		// console.log("app_o notifyLiveGivePopupClose");
		appContext.notifyLiveGivePopupClose();
	};
} // *********************** PAD 종료 ***********************

import './index.scss';
(global as any)['app_o'] = app_o;  // tslint:disable-line


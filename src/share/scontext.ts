import { observable, action } from 'mobx';
import { App, IMain } from '../App';
import * as felsocket from '../felsocket';
import { parseDept4Div, parseDept5Div, parseDept5SubDiv } from '../common/component/DivFunc';
export type VIEWDIV = 'direction'|'eyeon'|'content';
export interface IStateBase {
	viewDiv: VIEWDIV;
	directionON: boolean;
	loading: boolean;// loading 화면 
	navi: {
		view: boolean,
		enableLeft: boolean,
		enableRight: boolean,		
	};
	bookid: number;
	bookkey: number;
	curriculumid: number;
	classid: number; // module
	unitid: number; // topic 
	lessonid: number; // concept 
	// greatjob: boolean;
	// goodjob: boolean;
	// cheerup: boolean;
	// incorrect: boolean;
	// likeSet: {on: boolean, id: string};
	// likeSoundOff: boolean;
	svg_bg: {
		view: boolean,
		bPlay: boolean,
		viewCharactor: boolean,
	};
	is_lock: boolean;
	isRemote: boolean;/* 2021_10_01 Remote 관련 추가 */
}
export interface IActionsBase {
	// startGreatJob: () => void;
	// greatjobComplete: () => void;
	// startGoodJob: () => void;
	// goodjobComplete: () => void;
	// startCheerUp: () => void;
	// cheerUpComplete: () => void;
	// startIncorrect: () => void;
	// incorrectComplete: () => void;
	setNaviView: (view: boolean) => void;
	setNavi: (enableLeft: boolean, enableRight: boolean) => void;
	setNaviFnc: (naviLeft: (() => void) | null, naviRight: (() => void) | null) => void;
	naviLeft: () => void;
	naviRight: () => void;
	setLoading: (loading: boolean) => void;
}
export abstract class StudentContextBase implements IMain {
	private _naviLeftFnc: (() => void)|null = null;
	private _naviRightFnc: (() => void)|null = null;
	@observable public state: IStateBase = {
		viewDiv: 'direction' as VIEWDIV,
		directionON: false,
		navi: {
			view: false,
			enableLeft: false,
			enableRight: false,		
		},
		loading: false,
		// goodjob: false,
		// likeSet: {on: false, id: ''},
		// likeSoundOff: false,
		bookid: 0,
		bookkey: 0,
		curriculumid: 0,
		classid: 0,
		unitid: 0,
		lessonid: 0,
		svg_bg: {
			view: true,
			bPlay: false,
			viewCharactor: true,
		},
		is_lock: false,
		isRemote: false,/* 2021_10_01 Remote 관련 추가 */
	};
	public actions: IActionsBase = {
		// startGoodJob: () => {
		// 	this.state.goodjob = true;
		// },
		// goodjobComplete: () => {
		// 	this.state.goodjob = false;
		// },
		setNaviView: (view: boolean) => {
			this.state.navi.view = view;
		},
		setNavi: (enableLeft: boolean, enableRight: boolean) => {
			this.state.navi.enableLeft = enableLeft;
			this.state.navi.enableRight = enableRight;	
		},
		setNaviFnc: (naviLeft: (() => void) | null, naviRight: (() => void) | null) => {
			this._naviLeftFnc = naviLeft;
			this._naviRightFnc = naviRight;
		},

		/* Navigation 좌 버튼 클릭시 */
		naviLeft: () => {
			App.pub_playBtnPage();
			if(this._naviLeftFnc) this._naviLeftFnc();
	
		},
		/* Navigation 우 버튼 클릭시 */
		naviRight: () => {

			App.pub_playBtnPage();
			if(this._naviRightFnc) this._naviRightFnc();
		
		},
		setLoading: (loading: boolean) => {
			// this.state.loading = loading;
			felsocket.showSLoading(loading);
		},
	};
	constructor() {
		this.state.isRemote = document.location.href.indexOf('remote=y') >= 0;

	}/* 2021_10_01 Remote 관련 추가 */
	@action protected _setViewDiv(viewDiv: VIEWDIV, no_pub_stop?: boolean) {
		if(this.state.viewDiv !== viewDiv) {
			felsocket.postViewDiv(viewDiv);/* 2021_10_01 Remote 관련 추가 */
			// if(!no_pub_stop) App.pub_stop();
			if(viewDiv === 'direction') {
				this.state.directionON = true;
				this.state.svg_bg.bPlay = true;
				this.state.svg_bg.viewCharactor = true;
			} else {
				this.state.directionON = false;
				this.state.svg_bg.bPlay = false;
				this.state.svg_bg.viewCharactor = false;
			}
			this.state.loading = false;
			// this.state.goodjob = false;
			// this.state.likeSet.on  = false;
			// this.state.likeSet.id  = '';
			this.state.viewDiv = viewDiv;
		}
	}
	@action public start() {
		// 
	}
	@action public receive(data: ISocketData) {
		switch(data.type) {
		case $SocketType.PAD_START_DIRECTION:
			if(this.state.viewDiv === 'direction') {
				this.state.directionON = true;
				this.state.svg_bg.bPlay = true;
				this.state.svg_bg.viewCharactor = true;
			} else this._setViewDiv('direction');
			felsocket.sendTeacher($SocketType.PAD_START_DIRECTION, {id: App.student ? App.student.id : '', name: App.student ? App.student.name : ''});
			break;
		case $SocketType.PAD_END_DIRECTION:
			this.state.directionON = false;
			felsocket.sendTeacher($SocketType.PAD_END_DIRECTION, {id: App.student ? App.student.id : '', name: App.student ? App.student.name : ''});
			break;
		case $SocketType.PAD_ONSCREEN:
			this._setViewDiv('eyeon');
			felsocket.sendTeacher($SocketType.PAD_ONSCREEN, {id: App.student ? App.student.id : '', name: App.student ? App.student.name : ''});
			break;
		case $SocketType.MSGTOPAD:
			if (data.data.msgtype === 'page_lock') {
				this.state.is_lock = true;
			} else if (data.data.msgtype === 'page_unlock') {
				this.state.is_lock = false;
			}
			break;
		// case $SocketType.LIKE_SET:
		// 	const lmsg = data.data as ILikeSetMsg;
		// 	if(this.state.viewDiv === 'content') {
		// 		this.state.likeSet.on  = lmsg.on;
		// 		this.state.likeSet.id  = lmsg.id;
		// 	}
		// 	this.state.likeSoundOff = false;
		// 	break;
		// case $SocketType.LIKE_SOUND_OFF:
		// 	this.state.likeSoundOff = true;
		// 	break;
		// case $SocketType.LIKE_SOUND_ON:
		// 	this.state.likeSoundOff = false;
		// 	break;
		default:
			break;
		}
	}
	public uploaded = (url: string) => {
		//
	}
	public multiUploaded(results: any) {
		//
	}
	public notify = (type: string) => {
		//
	}
	public notifyRecorded = (url: string) => {
		//
	}
	public notifyVideoRecord = (url: string) => {
		//
	}
	public notifySwitchCamera = () => {
		//
	}
	public notifyTakePicture = (url: string, src: string) => {
		//
	}
	public abstract setData(data: any): void;

	public notifyNaviInfo(curriculum: CurriculumType, bookid: number, classid: number, unitid?: number, lessonid?: number, curritype?: string) {
		//
	}
	public notifyPenToolState(isVisible: boolean, height: number) {
		//
	}
	public notifyLiveGivePopupClose() {
		//
	}
	public notifyBookCaptureInfo = (infos: CaptureImageInfo[]) => {
		//
	}

	public clickSendButton = () => {
		//
	}

	public notifyRecordData = (audio: string, data: PenRecordData) => {
		// 
	}

	public notifyAlert = (isOk: boolean) => {
		//
	}

	public notifyHamburgerMenuClicked(isView: boolean) {
		//
	}
	public callThreeminState() {
		//
	}
}
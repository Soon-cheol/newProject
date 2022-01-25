import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Observer, observer } from 'mobx-react';
import { observable } from 'mobx';
import * as _ from 'lodash';
import { App } from '../../App';
import * as common from '../common';
import SendUI from '../../share/sendui_new';
import * as felsocket from '../../felsocket';
import * as kutil from '@common/util/kutil';

import { IStateCtx, IActionsCtx, SENDPROG } from './t_store';

import { MAHeader } from '../../share/maheader_old';
import { MAQuizList } from '../../share/maquizlist';
import { MASubmitUserList, MASubmitUsers } from '../../share/masubmituserlist';
import { ToggleBtn } from '@common/component/button';
import { WarningPopup } from '../../share/AlertPopup';

interface ITCheck {
	view: boolean;
	state: IStateCtx;
    actions: IActionsCtx;
}

@observer
class TCheck extends React.Component<ITCheck> {
	@observable private _curIdx = 0;
	@observable private _prog: SENDPROG = SENDPROG.READY;
	@observable public _showQuizDesc: boolean[] = [];
	@observable private _viewQuizList = false;
	@observable private _onQuizList = true;
	@observable private _onSummaryResult = false;
	@observable private _quizResults: IQuizResult[] = [];

	@observable private _submitStudents: ISubmitStudent[][] = [];
	@observable private _viewSubmitList = false;

	@observable private _viewAlert = false;

	private ifr: HTMLIFrameElement[] = [];
	private ifr_desc: HTMLIFrameElement[] = [];
	
	constructor(props: ITCheck) {
		super(props);
		const { quizs } = this.props.actions.getData();
		quizs.map((quiz, qidx) => {
			this._submitStudents[qidx] = [];
			this._showQuizDesc[qidx] = false;
			this._quizResults[qidx] = {
				seq: quiz.seq,
				thumb: quiz.thumb,
				url: quiz.url,
				quizKind: 0,
				allusers: 0,
				submitusers: 0,
				heart2: 0,
				heart1: 0,
				heart0: 0,
				nosubmit: 0
			};
		});
	}
	public onExitBook = () => {
		if(this._prog >= SENDPROG.SENDING &&  this._prog <= SENDPROG.STOPED) return;
		felsocket.clearTPenTool();
		felsocket.exitBook();
	}
	public onGotoBook = (bookid: number, booklist: number[]) => {
		if(this._prog >= SENDPROG.SENDING && this._prog <= SENDPROG.STOPED) return;
		felsocket.clearTPenTool();
		felsocket.gotoBook(bookid, booklist);
	}
	private onOpenSubmitList = () => { this._viewSubmitList = true; };
	private onCloseSubmitList = () => { this._viewSubmitList = false; };
	private onPage = (page: number) => {
		if(!this.props.view) return;
		else if(this._viewQuizList) return;
		felsocket.clearTPenTool();
		this._curIdx = page;
	}
	private toggleQuizDesc = () => {
		if(this._curIdx < 0) return;
		else if(this._curIdx >= this._showQuizDesc.length) return;
		this._showQuizDesc[this._curIdx] = !this._showQuizDesc[this._curIdx];
	}
	public selectQuiz = (idx: number) => {
		if(!this.props.view) return;

		this._curIdx = idx;
		this._viewQuizList = false;
		this.initContentAll();
	}
	public clickSubmitlistOfQuizlist = (idx: number) => {
		if(!this.props.view) return;
		else if(!this._viewQuizList) return;
		
		this._curIdx = idx;
		this._viewSubmitList = true;
	}
	public backToList = () => {
		this._viewQuizList = true;
	}
	public toggleQuizList = () => {
		this._onQuizList = !this._onQuizList;
	}
	public toggleSummaryResult = () => {
		this._onSummaryResult = !this._onSummaryResult;
	}
	private _onPrev = () => {
		if(!this.props.view) return;
		else if(this._curIdx === 0) return;
		felsocket.clearTPenTool();
		this._curIdx -= 1;
	}
	private _onNext = () => {
		if(!this.props.view) return;
		else if(this._curIdx === this._quizResults.length - 1) return;
		felsocket.clearTPenTool();
		this._curIdx += 1;
	}
	private _onAlertPopup = () => {
		this._viewAlert = true;
		this._prog = SENDPROG.SENDING;
	}
	private _onAlertOk = () => {
		if(!this.props.view) return;
		this._viewAlert = false;
		const quizs = this.props.actions.getData().quizs;
		quizs.map((quiz, qidx) => {
			this.props.state.quizResult[qidx] = [];
			this._submitStudents[qidx] = [];
			this._showQuizDesc[qidx] = false;
			this._quizResults[qidx].allusers = App.students ? App.students.length : 0;
			this._quizResults[qidx].submitusers = 0;
			this._quizResults[qidx].heart2 = 0;
			this._quizResults[qidx].heart1 = 0;
			this._quizResults[qidx].heart0 = 0;
			this._quizResults[qidx].nosubmit = 0;
		});
		this._onSend();
	}
	private _onAlertCancel = () => {
		if(!this.props.view) return;
		this._viewAlert = false;
		this._prog = SENDPROG.READY;
	}
	private getResultCnt(): boolean {
		let isResult = false;
		const quizs = this.props.actions.getData().quizs;
		for(let i: number = 0; i < quizs.length; i++) {
			if(this.props.state.quizResult[i].length > 0 ) {
				isResult = true;
				break;
			}
		}
		return isResult;
	}
	private _onSend = () => {
		if(!this.props.view) return;
		else if(this.getResultCnt()) return;
		this._prog = SENDPROG.SENDING;
		
		App.pub_playToPad();

		const msg: common.IMsg = {msgtype: 'check_send'};
		felsocket.sendPAD($SocketType.MSGTOPAD, msg);

		this.props.actions.setQuizResultFnc(this._onQuizResult);

		App.pub_reloadStudents(async () => {
			if(!this.props.view) return;
			else if(this._prog !== SENDPROG.SENDING) return;
			await kutil.wait(600);
			this._prog = SENDPROG.SENDED;
			this._setNavi();
		});

	}
	private _onQuizResult = (qmsg: common.ICheckResultMsg) => {
		if(!this.props.view) return;
		else if(this._curIdx < 0) return;

		const result: common.ICheckResult = JSON.parse(qmsg.result);
		// console.log('===> result', result);

		const student = _.find(App.students, {id: result.studentid});
		if(!student) return;
		
		if(qmsg.idx < -1 || qmsg.idx > this._submitStudents.length - 1 || qmsg.idx > this._quizResults.length - 1) return;

		const sidx = this._submitStudents[qmsg.idx].findIndex((item) => item.student.id === result.studentid);
		if(sidx > -1) this._submitStudents[qmsg.idx][sidx].correct = result.correct;
		else this._submitStudents[qmsg.idx].push({ student, correct: result.correct, trycnt: result.tryCnt, livePoint: 0 });

		this._quizResults[qmsg.idx].allusers = App.students.length;
		this._quizResults[qmsg.idx].submitusers = this._submitStudents[qmsg.idx].length;
		
		const heart2Users = this._submitStudents[qmsg.idx].filter ((item) => item.correct === true && item.trycnt === 1);
		if(heart2Users) this._quizResults[qmsg.idx].heart2 = heart2Users.length;
		else this._quizResults[qmsg.idx].heart2 = 0;

		const heart1Users = this._submitStudents[qmsg.idx].filter ((item) => item.correct === true && item.trycnt === 2);
		if(heart1Users) this._quizResults[qmsg.idx].heart1 = heart1Users.length;
		else this._quizResults[qmsg.idx].heart1 = 0;

		const heart0Users = this._submitStudents[qmsg.idx].filter ((item) => item.correct === false && item.trycnt > 1);
		if(heart0Users) this._quizResults[qmsg.idx].heart0 = heart0Users.length;
		else this._quizResults[qmsg.idx].heart0 = 0;

		const nosubmitUsers = App.students.length - (heart2Users.length + heart1Users.length + heart0Users.length);
		this._quizResults[qmsg.idx].nosubmit = nosubmitUsers;

		if(this._prog === SENDPROG.STOPED && this._quizResults[this._curIdx].nosubmit === 0) this._prog = SENDPROG.READY;
		else if(qmsg.idx === this._quizResults.length - 1 && this._quizResults[qmsg.idx].nosubmit === 0) this._prog = SENDPROG.READY;
	}
	private _onSendStop = async () => {
		if(!this.props.view) return;
		else if(this._prog !== SENDPROG.SENDED) return;
		else if(this._curIdx === -1) return;

		App.pub_playToPad();

		const msg: common.IMsg = {msgtype: 'check_end'};
		felsocket.sendPAD($SocketType.MSGTOPAD, msg);
		
		this._prog = SENDPROG.STOPED;
	}
	private _setNavi() {
		this.props.actions.setNaviView(this._viewQuizList);
		if(this._prog >= SENDPROG.SENDING && this._prog <= SENDPROG.STOPED) this.props.actions.setNavi(false, false);
		else this.props.actions.setNavi(true, true);
		this.props.actions.setNaviFnc(
			() => {
				felsocket.clearTPenTool();
				this.props.actions.gotoDirection();
			},
			() => {
				felsocket.clearTPenTool();
				this.props.actions.gotoNextBook();
			}
		);
	}
	public componentDidMount() {
		window.addEventListener('message', this.handlePostMessage, false);
	}
	public componentWillUnmount() {
		window.removeEventListener('message', this.handlePostMessage, false);
	}
	public handlePostMessage = (evt: MessageEvent) => {
		// console.log('=====> handlePostMessage', evt.data);
		let data = evt.data;
		if(data.from === 'macontent') {
			if(data.type === 'submit') {
				// console.log('data.msg: ' + data.msg);
			}
		}
	}
	public sendPostMessage(type: string, msg: any, curIdx: number) {
		// console.log('=====> sendPostMessage', type, msg);	
		const postMsgData = {from: 'matemplate', to: 'macontent', type, msg};
		if (curIdx > -1 && this.ifr[curIdx]) this.ifr[curIdx].contentWindow!.postMessage(postMsgData, '*');
	}
	public initContent() {
		if(this._curIdx < 0) return;
		const quizs = this.props.actions.getData().quizs;
		if(this._curIdx < quizs.length) {
			let msg = { 
				idx: this._curIdx,
				quizmode: 'check',
				isTeacher: true,
				content: quizs[this._curIdx]
			};
			this.sendPostMessage('init', msg, this._curIdx);
		}
	}
	public initContentAll() {
		const quizs = this.props.actions.getData().quizs;
		for(let i = 0; i < quizs.length; i++) {
			let msg = { 
				idx: i,
				quizmode: 'check',
				isTeacher: true,
				content: quizs[i]
			};
			this.sendPostMessage('init', msg, i);
		}
	}
	public completeContentAll() {
		const quizs = this.props.actions.getData().quizs;
		for(let i = 0; i < quizs.length; i++) {
			let msg = { 
				idx: i,
				quizmode: 'check',
				isTeacher: true,
				content: quizs[i]
			};
			this.sendPostMessage('completed', msg, i);
		}
	}
	public componentDidUpdate(prev: ITCheck) {
		if(this.props.view && !prev.view) {
			this._curIdx = 0;
			this._prog = SENDPROG.READY;
			const quizs = this.props.actions.getData().quizs;
			quizs.map((quiz, qidx) => {
				this._submitStudents[qidx] = [];
				this._showQuizDesc[qidx] = false;
				this._quizResults[qidx].allusers = App.students ? App.students.length : 0;
				this._quizResults[qidx].submitusers = 0;
				this._quizResults[qidx].heart2 = 0;
				this._quizResults[qidx].heart1 = 0;
				this._quizResults[qidx].heart0 = 0;
				this._quizResults[qidx].nosubmit = 0;
			});
			this._viewSubmitList = false;
			this.props.actions.setQuizResultFnc(null);
			this._onQuizList = true;
			this._viewQuizList = true;
			this._viewAlert = false;
			this._onSummaryResult = true;
		} else if(!this.props.view && prev.view) {
			this.props.actions.setQuizResultFnc(null);
			this._viewSubmitList = false;
			this._onQuizList = true;
			this._viewQuizList = false;
			this._viewAlert = false;
			this._onSummaryResult = true;
		}

		if(this.props.view) this._setNavi();
	}
	public render() {
		const {view, state, actions} = this.props;
		const quizs = actions.getData().quizs;
		// console.log('this._quizResults', this._quizResults);
		return (
			<div className="t_check" style={{display: view ? undefined : 'none'}}>
          		<div className="checkContent">
					<MAHeader 
						view={view} 
						lesson={this.props.actions.getCurriculum()} 
						bookid={state.bookid} 
						onExitBook={this.onExitBook}
						onGotoBook={this.onGotoBook}
						onConceptLibrary={() => {this.props.state.conceptLibiary.view = true;}}
					/>
					<div className="topHeader">
						<ToggleBtn view={this._viewQuizList} on={this._onQuizList} className="btn_viewMark" onClick={this.toggleQuizList}/>
						<button 
							className="back"
							style={{ display: !this._viewQuizList ? undefined : 'none'}}
							onClick={this.backToList}
						/>
						<div className="page teacher" style={{display: !this._viewQuizList ? undefined : 'none'}}>
							{quizs.map((quiz, qidx) => {
								return(
									<div key={'page' + qidx} className={'num ' + (this._curIdx === qidx ? 'on' : '')} onClick={this.onPage.bind(this, qidx)}>
										<span>{qidx + 1}</span>
									</div>
								);
							})}
						</div>
						<MASubmitUsers 
							view={!this._viewQuizList}
							submitusers={this._submitStudents[this._curIdx] ? this._submitStudents[this._curIdx].length : 0} 
							totalusers={App.students ? App.students.length : 0} 
							onClick={this.onOpenSubmitList}
						/>
						<ToggleBtn 
							view={!this._viewQuizList} 
							on={this._onSummaryResult} 
							className="btn_viewSummary" 
							onClick={this.toggleSummaryResult}
						/>
						<div className="result" style={{display: !this._viewQuizList && this._onSummaryResult ? undefined : 'none'}} >
							<span className="h2">{this._quizResults[this._curIdx] ? this._quizResults[this._curIdx].heart2 : 0}</span>
							<span className="h1">{this._quizResults[this._curIdx] ? this._quizResults[this._curIdx].heart1 : 0}</span>
							<span className="h0">{this._quizResults[this._curIdx] ? this._quizResults[this._curIdx].heart0 : 0}</span>
							<span className="none">{this._quizResults[this._curIdx] ? this._quizResults[this._curIdx].nosubmit : 0}</span>
						</div>
					</div>
					<div id="contentWrap" className="contentWrap">
						<MAQuizList
							view={this._viewQuizList}
							on={this._onQuizList}
							quizresults={this._quizResults}
							selectQuiz={this.selectQuiz}
							clickSubmitlist={this.clickSubmitlistOfQuizlist}
						/>
						{quizs.map((quiz, qidx) => {
							return(
								<div key={'i' + qidx} style={{display: this._curIdx === qidx && !this._viewQuizList ? undefined : 'none'}}>
									<iframe 
										src={App.data_url + quiz.url + '?idx=' + qidx}
										ref={(ifr) => {
											if (ifr) this.ifr[qidx] = ifr;
										}}
									/>
									<div className={'moreBox ' + (this._showQuizDesc[qidx] ? 'show' : '' )}>
										<div className="more_content">
											<button className="btn_close" onClick={this.toggleQuizDesc}/>
											<iframe 
												src={App.data_url + quiz.desc + '?idx=' + qidx} 
												ref={(ifr) => {
													if (ifr) {
														this.ifr_desc[qidx] = ifr;
														_.delay(() => {
															if(this.ifr_desc[qidx].contentWindow !== null && this.ifr_desc[qidx].contentWindow!.document.body) {
																let height = this.ifr_desc[qidx].contentWindow!.document.body.scrollHeight;
																if(height > 500) height = 500; 
																ifr.height = height + 'px';
															}
														}, 300);
													}
												}}
											/>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</div>
				{/* <MASubmitUserList
					view={this._viewSubmitList} 
					mode={3}
					submitusers={this._submitStudents[this._curIdx] ? this._submitStudents[this._curIdx] : []} 
					onClose={this.onCloseSubmitList}
				/> */}
				<ToggleBtn 
					view={!this._viewQuizList}
					on={this._curIdx >= 0 && this._curIdx < this._showQuizDesc.length && this._showQuizDesc[this._curIdx]}
					className="btn_bulb"
					onClick={this.toggleQuizDesc} 
				/>
				<ToggleBtn className="btn_prev" view={!this._viewQuizList && this._curIdx > 0} onClick={this._onPrev} />
				<ToggleBtn className="btn_next" view={!this._viewQuizList && this._curIdx < quizs.length - 1} onClick={this._onNext} />
				<SendUI
					view={this._prog === SENDPROG.READY}
					type={'teacher'}
					sended={false}
					originY={0}
					onSend={this.getResultCnt() ? this._onAlertPopup : this._onSend}
				/>
				<ToggleBtn view={this._prog === SENDPROG.SENDED && !this._viewAlert} className="fel_stop" onClick={this._onSendStop} />
				<WarningPopup
					view={this._viewAlert}
					type={1}
					button={true}
					onOk={this._onAlertOk}
					onCancel={this._onAlertCancel}
				/>
			</div>
		);
	}
}

export default TCheck;

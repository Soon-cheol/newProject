import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Observer, observer } from 'mobx-react';
import { observable } from 'mobx';
import { App } from '../../App';
import * as common from '../common';
import * as kutil from '@common/util/kutil';
import * as felsocket from '../../felsocket';
import * as _ from 'lodash';
import SendUI from '../../share/sendui_new';
import { ToggleBtn } from '@common/component/button';

import { StudentContext, useStudent, IStateCtx, IActionsCtx, SENDPROG } from './s_store';
import { SayPopup } from '../../share/SayPopup';
import { WarningPopup } from '../../share/AlertPopup';
import * as answercheck from '@common/component/answercheck';

const SwiperComponent = require('react-id-swiper').default;

const _soption: SwiperOptions = {
	direction: 'horizontal',
	observer: true,
};

interface ISCheck {
	view: boolean;
	state: IStateCtx;
	actions: IActionsCtx;
	checkProg: SENDPROG;
}

@observer
class SCheck extends React.Component<ISCheck> {
	@observable private _curIdx = 0;
	@observable private _prog: SENDPROG = SENDPROG.READY;
	@observable public _showQuizDesc: boolean[] = [];
	@observable public _resultShowing: boolean[] = [];
	@observable private _typeSayPop = 0;
	@observable private quizResult: common.ICheckResult[] = [];
	@observable private _viewAlert = false;

	private ifr: HTMLIFrameElement[] = [];
	private ifr_desc: HTMLIFrameElement[] = [];

	private _swiper: Swiper|null = null;
	
	constructor(props: ISCheck) {
		super(props);
		const quizs = this.props.actions.getData().quizs;
		for(let i = 0; i < quizs.length; i++) {
			this._showQuizDesc[i] = false;
			this._resultShowing[i] = false;
			this.quizResult.push({
				studentid: '',
				contentSeq: quizs[i].seq,
				contentType: quizs[i].type,
				answer: quizs[i].answer,
				choicedIdx: [],
				choicedValue: [],
				correct: false,
				tryCnt: 0,
				completed: false,
			});
		}
	}
	private _refSwiper = (el: SwiperComponent) => {
		if(this._swiper || !el) return;

		const swiper = el.swiper;
		swiper.on('transitionStart', () => {
			this._curIdx = -1;
		});
		swiper.on('transitionEnd', () => {
			if(this.props.view) {
				felsocket.clearSPenTool();
				this._curIdx = swiper.activeIndex;
				if(!this.quizResult[this._curIdx].completed && this._prog !== SENDPROG.COMPLETE) {
					if(this._prog === SENDPROG.SENDED) this._prog = SENDPROG.READY;
					this.initContent();
				}
			}
		});
		this._swiper = swiper;
	}
	private onClickIdx = (idx: number) => {
		if(this._prog !== SENDPROG.COMPLETE) return;
		if(this._swiper) this._swiper.slideTo(idx, 0);
	}
	private toggleQuizDesc = () => {
		if(this._curIdx < 0) return;
		else if(this._curIdx >= this._showQuizDesc.length) return;
		this._showQuizDesc[this._curIdx] = !this._showQuizDesc[this._curIdx];
	}
	private _onPrev = () => {
		if(this._curIdx === 0) return;
		App.pub_playBtnTab();
		if(this._swiper) this._swiper.slidePrev(); 
	}
	private _onNext = () => {
		const quizs = this.props.actions.getData().quizs;
		if(this._curIdx === quizs.length - 1) return;
		App.pub_playBtnTab();
		if(this._swiper) this._swiper.slideNext(); 
	}
	private _onSend = async () => {
		if(!this.props.view) return;
		else if(this._prog !== SENDPROG.READY) return;
		else if(this._curIdx === -1) return;

		let result = this.quizResult[this._curIdx];
		if(!result.completed || result.tryCnt === 2) return;

		this._prog = SENDPROG.SENDING;
		App.pub_playToPad();

		result.tryCnt += 1;
		if(result.tryCnt === 1 && !result.correct) {
			result.completed = false;
			this.initContent();
			this._typeSayPop = 3;
			this._prog = SENDPROG.READY;
			return;
		}

		if(App.student) {
			result.studentid = App.student.id;
			const msg: common.ICheckResultMsg = {
				msgtype: 'check_result',
				idx: this._curIdx,
				result: JSON.stringify(result)
			};
			felsocket.sendTeacher($SocketType.MSGTOTEACHER, msg);
		}
		
		await kutil.wait(600);
		if(result.tryCnt === 1 && result.correct) this._typeSayPop = 1;
		else if(result.tryCnt === 2 && result.correct) this._typeSayPop = 2;
		else if(result.tryCnt === 2 && !result.correct) this._typeSayPop = 4;

		if(this._curIdx === this.quizResult.length - 1) {
			this._prog = SENDPROG.COMPLETE;
			this.props.state.checkProg = SENDPROG.SENDED;
		} else this._prog = SENDPROG.SENDED;
		this.completeContent();
		this._resultShowing[this._curIdx] = true;
	}
	public _onCompletedSayPop = () => {
		this._typeSayPop = 0;
		let result = this.quizResult[this._curIdx];
		if(result.tryCnt === 1 && !result.correct) return;
		// else this._onNext();
	}
	public _onCompletedAlertPop = () => {
		if(!this.props.view) return;
		// 강제 종료로 현재 풀것들 전송
		this._viewAlert = false;

		let result = this.quizResult[this._curIdx];
		if(result.choicedValue.length > 0) result.tryCnt += 1;
		if(App.student) {
			result.studentid = App.student.id;
			const msg: common.ICheckResultMsg = {
				msgtype: 'check_result',
				idx: this._curIdx,
				result: JSON.stringify(result),
			};
			felsocket.sendTeacher($SocketType.MSGTOTEACHER, msg);
		}
		this.props.state.checkProg = SENDPROG.SENDED;
	}
	public componentDidMount() {
		window.addEventListener('message', this.handlePostMessage, false);
	}
	public componentWillUnmount() {
		window.removeEventListener('message', this.handlePostMessage, false);
	}
	public handlePostMessage = (evt: MessageEvent) => {
		// console.log('=====> handlePostMessage', evt.data);
		const data = evt.data;
		if(data.from === 'macontent') {
			if(data.type === 'submit') {
				if(this._curIdx < -1 || this._curIdx >= this.quizResult.length) return;
				
				let result = this.quizResult[this._curIdx];
				answercheck.answercheck(result, data.msg);
			}
		}		
	}
	public sendPostMessage(type: string, msg: any, idx: number) {
		// console.log('=====> sendPostMessage', type, msg);	
		const postMsgData = {from: 'matemplate', to: 'macontent', type, msg};
		if (this.ifr[idx]) this.ifr[idx].contentWindow!.postMessage(postMsgData, '*');
	}
	public initContent() {
		if(this._curIdx < 0) return;
		const quizs = this.props.actions.getData().quizs;
		if(this._curIdx < quizs.length) {
			let msg = { 
				idx: this._curIdx,
				quizmode: 'check',
				isTeacher: false,
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
				isTeacher: false,
				content: quizs[i]
			};
			this.sendPostMessage('init', msg, i);
		}
	}
	public completeContent() {
		const quizs = this.props.actions.getData().quizs;
		let msg = {
			idx: this._curIdx,
			quizmode: 'check',
			isTeacher: false,
			content: quizs[this._curIdx],
		};
		this.sendPostMessage('completed', msg, this._curIdx);
	}
	public completeContentAll() {
		const quizs = this.props.actions.getData().quizs;
		for(let i = 0; i < quizs.length; i++) {
			let msg = { 
				idx: i,
				quizmode: 'check',
				isTeacher: false,
				content: quizs[i]
			};
			this.sendPostMessage('completed', msg, i);
		}
	}
	public componentDidUpdate(prev: ISCheck) {
		if(this.props.view && !prev.view) {
			this._curIdx = 0;
			this._prog = SENDPROG.READY;
			this._viewAlert = false;
			const quizs = this.props.actions.getData().quizs;
			for(let i = 0; i < quizs.length; i++) {
				this._showQuizDesc[i] = false;
				this._resultShowing[i] = false;
				this.quizResult[i].studentid = '';
				this.quizResult[i].choicedIdx = [];
				this.quizResult[i].choicedValue = [];
				this.quizResult[i].correct = false;
				this.quizResult[i].tryCnt = 0;
				this.quizResult[i].completed = false;
			}
			this.initContent();

			if(this._swiper) {
				this._swiper.update();
				this._swiper.slideTo(this._curIdx, 0);
			}
		} else if(!this.props.view && prev.view) {
			this._viewAlert = false; 
		}

		if(this.props.checkProg !== prev.checkProg) {
			if(this.props.checkProg === SENDPROG.COMPLETE && this._prog !== SENDPROG.COMPLETE) {
				// 강제 종료
				this._viewAlert = true;
				this._prog = SENDPROG.COMPLETE;
				this.completeContentAll();
				const quizs = this.props.actions.getData().quizs;
				for(let i = 0; i < quizs.length; i++) this._resultShowing[i] = true;
			} else if (this.props.view && prev.view && prev.checkProg === SENDPROG.SENDED && this._prog === SENDPROG.COMPLETE) {
				// reset
				this._prog = SENDPROG.READY;
				this._curIdx = 0;
				const quizs = this.props.actions.getData().quizs;
				for(let i = 0; i < quizs.length; i++) {
					this._showQuizDesc[i] = false;
					this._resultShowing[i] = false;
					this.quizResult[i].studentid = '';
					this.quizResult[i].choicedIdx = [];
					this.quizResult[i].choicedValue = [];
					this.quizResult[i].correct = false;
					this.quizResult[i].tryCnt = 0;
					this.quizResult[i].completed = false;
				}
				this.initContentAll();
	
				if(this._swiper) {
					this._swiper.update();
					this._swiper.slideTo(this._curIdx, 0);
				}
			}
		}
	}
	public render() {
		const {view, state, actions} = this.props;
		const quizs = actions.getData().quizs;
		return (
			<div className="s_check" style={{display: view ? undefined : 'none'}}>
				<div className="topHeader">
					<div className="page">
						{quizs.map((quiz, qidx) => {
							let className = 'num ' + (this._curIdx === qidx ? 'on' : '');
							if(this._resultShowing[qidx]) {
								if(this.quizResult[qidx].tryCnt === 1 && this.quizResult[qidx].correct) className += ' h2';
								else if(this.quizResult[qidx].tryCnt === 2 && this.quizResult[qidx].correct) className += ' h1';
								else if(this.quizResult[qidx].tryCnt > 0) className += ' h0';
							}
							return(
							<div 
								key={'page' + qidx} 
								className={className}
								onClick={this.onClickIdx.bind(this, qidx)}
							>
							<span>{qidx + 1}</span>
							</div>);
						})}
					</div>
				</div>
				<div id="contentWrap" className="contentWrap">
					<SwiperComponent 
						ref={this._refSwiper}
						{..._soption}
					>
					{quizs.map((quiz, qidx) => {
						return(
							<div key={qidx} className={this._prog < SENDPROG.COMPLETE ? 'swiper-no-swiping' : ''}>
								<iframe 
									src={App.data_url + quiz.url + '?idx=' + qidx} 
									style={{zIndex: this._prog !== SENDPROG.COMPLETE ? 10 : -1}}
									ref={(ifr) => {
										if (ifr) this.ifr[qidx] = ifr;
									}}
								/>
								<div style={{zIndex: this._prog === SENDPROG.COMPLETE ? 10 : -1}} />
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
					</SwiperComponent>
				</div>
				<SayPopup
					view={this._typeSayPop > 0}
					type={1}
					msgtype={this._typeSayPop}
					delay={3000}
					onComplete={this._onCompletedSayPop}
				/>
				<ToggleBtn 
					view={this._prog === SENDPROG.COMPLETE}
					on={this._curIdx >= 0 && this._curIdx < this._showQuizDesc.length && this._showQuizDesc[this._curIdx]}
					className="btn_bulb"
					onClick={this.toggleQuizDesc} 
				/>
				<ToggleBtn className="btn_prev" view={this._curIdx > 0 && this._resultShowing[this._curIdx - 1]} onClick={this._onPrev} />
				<ToggleBtn className="btn_next" view={this._curIdx < quizs.length - 1 && this._resultShowing[this._curIdx]} onClick={this._onNext} />
				<WarningPopup
					view={this._viewAlert}
					type={0}
					button={false}
					delay={3000}
					onComplete={this._onCompletedAlertPop}
				/>
				<SendUI
					view={view && this._curIdx > -1 && this.quizResult[this._curIdx].completed && this._prog === SENDPROG.READY}
					type={'pad'}
					sended={this._prog >= SENDPROG.SENDED || (this._curIdx > -1 && this._resultShowing[this._curIdx])}
					originY={0}
					onSend={this._onSend}
				/>
			</div>
		);
	}
}

export default SCheck;



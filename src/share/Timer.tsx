import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { observable, action, autorun, computed } from 'mobx';
import { observer } from 'mobx-react';
import * as _ from 'lodash';

import { App } from '../App';
import { ProgressCircle } from './ProgressCircle';

const enum RunState {
     INIT,
     RUNNING,
     PAUSE,
	 END,
}

export class TimerState {
     @observable private m_runState = RunState.INIT;
	 @computed get runState() {return this.m_runState;}
	 
	 public get isRunning() {return this.m_runState === RunState.RUNNING;}

	 @observable private m_max = 60;                  // 최대 시간(초)
	 @computed get max() {return this.m_max;}
		private m_playSound = true;
		get playSound() {return this.m_playSound;}
		public setPlaySound(v: boolean) {this.m_playSound = v;}


		constructor(max: number) {
			this.m_max = max;

			// this.m_max = 3;
		}
		public setMax(max: number) {
			this.m_max = max;
			// this.m_max = 13;
		}
     @action public start = () => {
         this.m_runState = RunState.RUNNING;
     }
     @action public reset = () => {
		this.m_runState = RunState.INIT;
     }
     @action public pause = () => {
         this.m_runState = RunState.PAUSE;
     }
     @action public end = () => {
		this.m_runState = RunState.END;
	}
}
interface ITimer {
     state: TimerState;
     view: boolean;
	 getTime?: boolean;
	 livePoint?: number;
     onComplete: () => void;
     onStart?: () => void;
	 isTeam?: boolean;
	 teamName?: string;
	 isFullSec?: boolean;
	 isBonus?: boolean; // bonus Time 인 경우 z-index 21
	 isAssessment?: boolean;
}

function _pToC(cX: number, cY: number, r: number, deg: number) {
     let rad = (deg - 90) * Math.PI / 180.0;
     return {
         x: cX + (r * Math.cos(rad)),
         y: cY + (r * Math.sin(rad))
     };
}


function _cToP(cX: number, cY: number, r: number, deg: number) {
	return {
		x: cX + (r * Math.cos(deg)),
		y: cY + (r * Math.sin(deg))
	};
}

function _dArc(cX: number, cY: number, r: number, sdeg: number, edeg: number) {

	let coord = {
		d : '',
		p : {
			x: 0,
			y: 0 
		}
	};

	if(edeg - sdeg >= 360) {
		coord.d = [
			'M', cX, cY,
			'm', -r, 0,
			'a', r, r, 0, '1', 0, r * 2, 0,
			'a', r, r, 0, '1', 0, -r * 2, 0
		].join(' ');
	} else {
		let largeFlag = edeg - sdeg <= 180 ? '0' : '1';
		let sPt = _pToC(cX, cY, r, edeg);
		let ePt = _pToC(cX, cY, r, sdeg);
		
		let pPt = _cToP(cX, cY, r, sdeg);
		coord.d = [
		'M', sPt.x, sPt.y,
		'A', r, r, 0, largeFlag, 0, ePt.x, ePt.y,
		].join(' ');

		coord.p.x =  sPt.x;
		coord.p.y =  sPt.y;
		// console.log(coord.p.x, coord.p.y);
	}
	return coord;
}

const _arcR = 37;
const _arcC = 10;
const _arcWH = 2 * _arcC;


@observer
export class Timer extends React.Component<ITimer> {
     private m_runState = RunState.INIT;
     private m_sec = 0;
     private m_stime = 0;
     @observable private m_text = '';
     @observable private m_d = '';
     @observable private m_px = 30;
     @observable private m_py = 6;
	 // for assessment
	 @observable private m_progress = 0;
	 @observable private m_initmax = 0;

     private _drawArc: ((time: number) => void) & _.Cancelable;
     constructor(props: ITimer) {
         super(props);
         this.m_text = this._getTime(this.props.state.max);
         this.m_d = '';
         this.m_px = 30;
         this.m_py = 6;

         autorun(() => {
			if(!this.props) return;
			const state = this.props.state;
			const max = state.max;
			if(state.runState === RunState.RUNNING && this.m_runState !== RunState.RUNNING) {
				this.m_runState = RunState.RUNNING;
				this._start();
			} else if(state.runState === RunState.INIT) {
				this.m_text = this._getTime(max);
				this.m_d = '';
				this.m_px = 30;
				this.m_py = 6;
			} else if(state.runState === RunState.END) {
				this._drawArc.cancel();
				let coord = _dArc(_arcC, _arcC, _arcR, 0, 1);
				this.m_d = coord.d;
				this.m_px = coord.p.x;
				this.m_py = coord.p.y;
			} else if(state.runState === RunState.PAUSE) {
				App.pub_stopTimerClock();
				App.pub_playTimerEnd();
			}
			this.m_runState = state.runState;
         });

         this._drawArc = _.throttle((time: number) => {
			if(!this.props || this.m_runState !== RunState.RUNNING) return;

			const max = this.props.state.max * 1000;
			let angle = 0;
			if( this.m_sec <= 5 ) {
				const d = time % 1000;
				if( time === 0 ) angle = 0;
				else if( d === 0) angle = 1;
				else angle = d / 1000;
			} else {
				angle = time / max;
			}
			angle = angle * 360;
			let coord;
			coord = _dArc(_arcC, _arcC, _arcR, 0, angle);
			this.m_d = coord.d;
			this.m_px = coord.p.x;
			this.m_py = coord.p.y;
			// console.log(this.m_px, this.m_py);
         }, 50, {trailing: true});
     }

     private _start = () => {
		// this.m_cnt = this.props.state.max;
		this.m_sec = this.props.state.max;
		if(this.props.isAssessment) this.m_text = Math.ceil(this.m_sec / 60) + "";
		else this.m_text = this._getTime(this.m_sec);
		if(this.props.state.max > 0 && this.m_initmax === 0) this.m_initmax = this.props.state.max;
		this.m_d = '';
		this.m_px = 30;
		this.m_py = 6;
		this.m_stime = Date.now();
		this._run(0);
		
		if(this.props.onStart) this.props.onStart();

		App.pub_playTimerClock();
     }

     private _run = (f: number) => {
		if(!this.props || this.m_runState !== RunState.RUNNING) return;
		const max = this.props.state.max;

		const time = Date.now() - this.m_stime;
		const sec = max - Math.floor(time / 1000);
		if(this.m_sec !== sec) {
			if(this.props.getTime) {
				// getTime 값이 트루면 숫자가 흐르지 않게 막기 위해 
			} else {
				if(this.props.isAssessment) this.m_text = Math.ceil(sec / 60) + "";
				else this.m_text = this._getTime(sec); // 이걸 멈추 면 화면에 숫자 그려지는걸 막을수 있음 
			}
			
			if(sec === 0) {
				if(this.props.state.playSound) App.pub_playDingend();
			} else if( sec < 5 ) {
				if(this.props.state.playSound) App.pub_playDing();
			} else if( sec >= 5 &&  sec <= 10) {
				if(this.props.state.playSound) App.pub_playClock();
			}
		}
		this.m_sec = sec;

		if(sec > 0) {
			this._drawArc(time);
			window.requestAnimationFrame(this._run);
			if(this.props.isAssessment) this.progresTimer(sec);
		} else {
			this._drawArc.cancel();
			let coord;
			coord = _dArc(_arcC, _arcC, _arcR, 0, 1);
			// coord = _dArc(_arcC, _arcC, _arcR, 0, 360);
			this.m_d = coord.d;
			this.m_px = coord.p.x;
			this.m_py = coord.p.y;
			
			this.props.onComplete();
			App.pub_stopTimerClock();
			App.pub_playTimerEnd();
		}
     }
	 private progresTimer = (sec: number) => {
		let progress = 100 - Math.floor(sec * 100 / this.m_initmax);
		if(this.m_progress !== progress) this.m_progress = progress;
	}
    private _getTime(t: number) {
		const m = Math.floor(t / 60);
		let s = t % 60;
		if(this.props.isFullSec) {
			s = t;
		}

		if(s > 99) {
			const elTimer = document.getElementsByClassName("timer")[0];
			if(elTimer) {
				const elMText = elTimer.getElementsByClassName("m_text")[0] as HTMLElement;
				if(elMText) {
					elMText.style.fontSize = "30px";
					elMText.style.paddingTop = "50px";
				}
			}
		} else {
			const elTimer = document.getElementsByClassName("timer")[0];
			if(elTimer) {
				const elMText = elTimer.getElementsByClassName("m_text")[0] as HTMLElement;
				if(elMText) {
					elMText.style.fontSize = "38px";
					elMText.style.paddingTop = "48px";
				}
			}
		}

		let ret = '';
		/* if(m < 10) ret = '0' + m;
		else ret = '' + m;
		if(s < 10) ret = ret + ':0' + s;
		else ret = ret + ':' + s; */

		/*if(s < 10) ret = ret + '0' + s;
		else ret = ret +  s;*/

		ret = ret + s;
		return ret;
    }
	// for assessment
	public getCurrentSec() {
		return this.m_sec;
	}
	public setInitMax(max: number) {
		this.m_initmax = max;
	}
	public setProgress(progress: number) {
		this.m_progress = progress;
	}
    public render() {
		if(this.props.isAssessment) {	
			let notice = (this.m_sec <= 300 && this.m_sec > 297) ? true : false;
			let progress = this.m_progress + "";

			return (
			<div className={"q_timer assess" + (notice? " swing" : "")} hidden={!this.props.view} style={{zIndex: this.props.isBonus ? 21 : 20}}>
				<div className="watch" />
				<ProgressCircle 
					watch={{text: this.m_text, progress: this.m_progress}}
					paint={null}
				/>
				<div className="minute">Minute</div>
				<div className={"alert_notice" + (notice ? " show" : "")}>
					<strong>5 minutes</strong> remaining.
				</div>
			</div>);
		} else {
			const {livePoint,isTeam} = this.props;
			let stroke = (this.m_sec <= 5) ? '#b61a1a' : '#004bb0';
			const point = this.props.livePoint ? this.props.livePoint : 0;
			let percent = Math.floor(point / 40 * 100);
			if(percent > 100) {
				percent = 100;
			}
	
			return	(
			<div className="q_timer" hidden={!this.props.view} style={{zIndex: this.props.isBonus ? 21 : 20}}>
				<div className="watch" />
				<ProgressCircle 
					watch={null}
					paint={{
						arcWH: _arcWH,
						px: this.m_px,
						py: this.m_py,
						r: 6,
						d: this.m_d,
						fill: '#aa41f5',
					}}
				/>
				<div className="m_text">{this.m_text}</div>
				<div className={'live_guage' + (isTeam ? '' : ' individual')}>
					<span className="ico_heart" />
					<div className="bar_wrap">
						<div className="bar" style={{width: percent + '%'}} />
						<div className={'text ' + (this.props.livePoint && this.props.livePoint > 40 ? 'overmax' : '')} data-value={this.props.livePoint}>{this.props.livePoint}</div>
						{/* data-value도 text값과 같은값으로 넣어주시고요 max값 초과시 overmax클래스도 붙여주세요. */}
					</div>
					<div className={'team_name ' + (this.props.teamName)} style={{display:this.props.isTeam ? '' : 'none'}}></div>
					{/* team_name 옆에 각 상황에 따라 red, green, yellow로 넣어주시면 됩니다. */}
				</div>
			</div>);
		}
    }
}

const _START = -0.5 * Math.PI;

@observer
export class CountDown2 extends React.Component<ITimer> {
	private m_runState = RunState.INIT;
	@observable private m_sec = 0;
	@observable private m_text = '';
	private m_stime = 0;

	private m_canvas!: HTMLCanvasElement;
	private m_ctx!: CanvasRenderingContext2D;
	private m_r: number = 0;
	private _drawArc: ((time: number) => void) & _.Cancelable;

	@observable private m_view = false;

	constructor(props: ITimer) {
		super(props);
		this.m_sec =  this.props.state.max;
		this.m_view = props.view;
		autorun(() => {
			if(!this.props) return;
			const state = this.props.state;
			if(state.runState === RunState.RUNNING && this.m_runState !== RunState.RUNNING) {
				this.m_runState = RunState.RUNNING;
				this._start();
			} else if(state.runState === RunState.INIT && this.m_runState !== RunState.INIT) {
				this.m_sec = state.max;
				if(this.m_ctx) {
					const r = this.m_r;
					this.m_ctx.clearRect(0, 0, 2 * r, 2 * r);
				}
			}
			this.m_runState = state.runState;
			// console.log('Timer ' + this.props.state.isRun);
		});
		this._drawArc = _.throttle((time: number) => {
			if(!this.m_canvas || !this.props || this.m_runState !== RunState.RUNNING) return;

			const angle = 2 * Math.PI * time / 1000;
			const r = this.m_r;

			this.m_ctx.clearRect(0, 0, 2 * r, 2 * r);
			this.m_ctx.beginPath();
			this.m_ctx.fillStyle = '#5538EB';
			this.m_ctx.moveTo(r, r);
			this.m_ctx.arc(r, r, r, _START, angle + _START);
			this.m_ctx.fill();
		}, 50);
		
	}
	private _start = () => {
		// this.m_cnt = this.props.state.max;
		this.m_sec = this.props.state.max;
		this.m_stime = Date.now();
		this._run(0);

		if(this.props.onStart) this.props.onStart();
	}

	private _run = (f: number) => {
		if(!this.props || this.m_runState !== RunState.RUNNING) return;

		const time = Date.now() - this.m_stime;
		const sec = this.props.state.max - Math.floor(time / 1000);
		if(this.m_sec !== sec) {
			this.m_sec = sec;
			// console.log(this.m_sec.toString());
			this.m_text = this.m_sec.toString();
			if(sec === 0) {
				if(this.props.state.playSound) App.pub_playDingend();
				this.m_text = 'start';
				this.props.onComplete();
			} else if( sec <= 5 ) {
				if(this.props.state.playSound) App.pub_playDing();
			}
		}
		if(sec > 0) {
			// this._drawArc(time % 1000);
			window.requestAnimationFrame(this._run);
		} else {
			// this._drawArc(1000);
		}
	}
	private _refCanvas = (el: HTMLCanvasElement|null) => {
		if(this.m_canvas || !el) return;
		this.m_canvas = el;
		this.m_r = el.width / 2;
		this.m_ctx = el.getContext('2d') as CanvasRenderingContext2D;
	}
	public componentDidUpdate(prev: ITimer) {
		if(prev.view !== this.props.view) {
			if(this.props.view) {
				this.m_view = true;
			} else {
				// this.m_view = false;
			}
		}
	}
	private _onTransEnd = () => {
		if(!this.props.view) this.m_view = false;
	}
	public render() {
		return (
			<div className={'countdown2 ' + (this.m_view ? '' : 'hide')}>
				{/* <div className={'countdown ' + (this.props.view ? 'view' : 'hide')} onTransitionEnd={this._onTransEnd}>
					<canvas width="206px" height="206px" ref={this._refCanvas}/>
					<div><div>{this.m_text}</div></div>
				</div> */}
				<div className={'countdown ' + (this.props.view ? 'view' : 'hide')} onTransitionEnd={this._onTransEnd}>
					<div className="start">
						<div className="text">{this.m_text}</div>
					</div>
				</div>
			</div>
		);
	}
}


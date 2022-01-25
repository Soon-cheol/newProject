import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { observable, action } from 'mobx';
import { observer } from 'mobx-react';

import { DraggableCore, DraggableData, DraggableEvent } from 'react-draggable';
import * as StrUtil from '@common/util/StrUtil';

interface IToPad {
	type: 'pad'|'teacher';
	view: boolean;
	sended: boolean;
	originY: number;
	disable?: boolean;// 버튼이 눌리는것을 방지 하기 위해 추가 2021_04_03 성준
	preventUpWhenView?: boolean;
	preventDrag?: boolean;
	isVisiblePenTool?: boolean;
	isRevise?:boolean;
	isRetry?:boolean;
	onSend: () => void;
	className?: string;
}

const DUR_FAST = 0.3;
const DUR_SLOW = 0.5;

@observer
export default class SendUINew extends React.Component<IToPad> {
	private m_btnH = 0;
	private m_max = 0;
	private m_sy = -1;
	private m_vy = -1;
	private m_time = -1;
	private m_bSend = false;

	@observable private m_state = {
		y: 0,
		alpha: 1,
		tDur: 0,
		aDur: 0,
		isOn: false,
		disabled: false,
	};
	constructor(props: IToPad) {
		super(props);
		if(props.sended) {
			this.m_state.alpha = 0;
			this.m_state.disabled = true;
		} else if(props.view) {
			this.m_state.y = props.originY;
			this.m_state.alpha = 1;
			this.m_state.tDur = DUR_FAST;
			this.m_state.aDur = 0;
			this.m_state.isOn = false;
			this.m_state.disabled = false;			
		} else if(!props.view) {
			this.m_state.y = props.originY;
			this.m_state.alpha = 0;
			this.m_state.tDur = DUR_FAST;
			this.m_state.aDur = DUR_FAST;
			this.m_state.isOn = false;
			this.m_state.disabled = true;		
		}
	}

	public componentWillReceiveProps(next: IToPad) {
		if(next.sended && !this.props.sended) {
			this.m_state.alpha = 0;
			this.m_state.disabled = true;

		} else if(next.view && !this.props.view) {
			this.m_state.y = next.originY;
			this.m_state.alpha = 1;
			if(next.preventUpWhenView) {
				this.m_state.tDur = 0;
				this.m_state.aDur = DUR_FAST;
			} else {
				this.m_state.tDur = DUR_FAST;
				this.m_state.aDur = 0;
			}
			this.m_state.isOn = false;
			this.m_state.disabled = false;
		} else if(!next.view && this.props.view) {
			this.m_state.y = this.m_max;
			this.m_state.alpha = 0;
			this.m_state.tDur = DUR_FAST;
			this.m_state.aDur = DUR_FAST;
			this.m_state.isOn = false;
			this.m_state.disabled = true;
		} else if(	next.view && 
					!next.sended && 
					!this.m_state.isOn && 
					next.originY !== this.props.originY
		) {
			this.m_state.y = next.originY;
			this.m_state.tDur = DUR_FAST;
			this.m_state.aDur = 0;
		}

		// 211130 Retry 기능 오류 수정 - 최순철
		if(!this.props.isRetry && next.isRetry) {
			this.m_state.y = next.originY;
			this.m_state.alpha = 1;
			if(next.preventUpWhenView) {
				this.m_state.tDur = 0;
				this.m_state.aDur = DUR_FAST;
			} else {
				this.m_state.tDur = DUR_FAST;
				this.m_state.aDur = 0;
			}
			this.m_state.isOn = false;
			this.m_state.disabled = false;
		}
	}

	private _ref = (el: HTMLButtonElement|null) => {
		if(this.m_max > 0 || !el) return;

		el.setAttribute('touch-action', 'none');
		const style = window.getComputedStyle(el);
		const height = StrUtil.nteFloat(style.height, 0);
		const bottom = StrUtil.nteFloat(style.bottom, 0);
		if( height > 0 ) {
			this.m_btnH = height;
			if(this.props.type === 'pad') this.m_max = bottom - height - 35;
			else this.m_max = height + bottom + 10;
			if(!this.props.view) this.m_state.y = this.m_max;
		}
	}

	private _down = (evt: MouseEvent) => {
		if(this.m_state.isOn || this.m_state.disabled) return;
		if(this.props.disable !== undefined && this.props.disable) return;

		this.m_state.y = this.props.originY;
		this.m_state.alpha = 1;
		this.m_state.tDur = 0;
		this.m_state.aDur = 0;
		this.m_state.isOn = true;
		this.m_vy = 0;
		this.m_time = Date.now();
	}
	private _start = (evt: DraggableEvent, data: DraggableData) => {
		this.m_sy = data.y;
		this.m_bSend = true;
	}
	private _drag = (evt: DraggableEvent, data: DraggableData) => {
		if(!this.m_state.isOn || this.m_state.disabled) return;
		
		let my = data.y - this.m_sy;

		if(this.props.type === 'teacher') {
			if(data.deltaY < -1 ) this.m_bSend = false;
			else if(data.deltaY >= 0 ) this.m_bSend = true;
			if(my < 0) my = 0;
		} else {
			if(data.deltaY > 1 ) this.m_bSend = false;
			else if(data.deltaY <= 0 ) this.m_bSend = true;	

			if(my > 0) my = 0;
		}
		if(this.props.preventDrag === false) this.m_state.y = my + this.props.originY;
		/* 학생패드 쪽 sendui drag 방지 관련
		else if(this.props.preventDrag !== true) {
			if(this.props.type !== 'teacher') this.m_state.y = my + this.props.originY;
		}
		*/
		
		const time = Date.now();
		this.m_vy = data.deltaY / (time - this.m_time);		
		this.m_time = time;

	}
	private _stop = (evt: DraggableEvent, data: DraggableData) => {
		if(!this.m_state.isOn || this.m_state.disabled) return;

		if(this.m_bSend) {
			let dy = this.m_vy * DUR_SLOW * 1000;
			let my = data.y - this.m_sy;

			if(this.props.type === 'teacher') {
				if( dy < this.m_btnH ) dy = this.m_btnH;
				else if( dy > 4 * this.m_btnH) dy = 4 * this.m_btnH;

				if(my < 0) my = 0;
			} else {
				if( -1 * dy < this.m_btnH ) dy = -this.m_btnH;
				else if( -1 * dy > 4 * this.m_btnH ) dy = -4 * this.m_btnH;
				if(my > 0) my = 0;
			} 
			
			this.m_state.tDur = DUR_SLOW;
			this.m_state.aDur = DUR_SLOW;
			this.m_state.alpha = 0;
			this.m_state.y = my + dy + this.props.originY;
			this.props.onSend();
		} else {
			this.m_state.isOn = false;
			this.m_state.tDur = DUR_FAST;
			this.m_state.aDur = 0;
			this.m_state.y = this.props.originY;
		}
	}
	public render() {
		const { y, tDur, aDur, alpha, isOn, disabled} = this.m_state;

		let style: React.CSSProperties = {
			transform: `translateY(${y}px)`,
			transition: `transform ${tDur}s, opacity ${aDur / 2}s ${aDur / 2}s`,
			opacity: alpha,
			pointerEvents: disabled || !this.props.view ? 'none' : 'auto',
			
		};
		if(this.props.preventDrag) style = {};

		const arr: string[] = [];
		if(this.props.type === 'pad') arr.push('fel_toteacher');
		else arr.push('fel_topad');
		if( isOn ) arr.push('on');
		if(this.props.isVisiblePenTool) {
			if(this.props.isVisiblePenTool) {
				arr.push('up');
			}
		}
		return (
			<DraggableCore
				onMouseDown={this._down}
				onDrag={this._drag}
				onStart={this._start}
				onStop={this._stop}
			>
				<button ref={this._ref} className={arr.join(' ') + (this.props.className ? ' ' + this.props.className : '')} style={style}>
					<span className={"revise" + (this.props.isRevise ? " on" : "")} style={{display: this.props.isRevise ? '' : 'none'}} />
				</button>
			</DraggableCore>
		);
	}
}
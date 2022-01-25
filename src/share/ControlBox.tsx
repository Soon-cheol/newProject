import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Observer, observer } from 'mobx-react';
import { ToggleBtn } from '@common/component/button';
import { observable } from 'mobx';
import { MPlayer, MConfig, MPRState, IMedia } from '@common/mplayer/mplayer';
import { DraggableCore, DraggableData, DraggableEvent } from 'react-draggable';

import * as _ from 'lodash';

export function _getTimeStr(ms: number, max: number) {
	const maxSec = Math.round(max / 1000);

	let sec = Math.round(ms / 1000);
	let min = Math.floor(sec / 60);
	let hour = Math.floor(min / 60);
	let ret = '';
	sec = sec % 60;
	min = min % 60;
	if (hour > 0 || maxSec >= 3600) {
		ret = hour + ':';
		if (min >= 10) ret += min + ':';
		else ret += '0' + min + ':';
	} else if (maxSec >= 600) {
		if (min >= 10) ret += min + ':';
		else ret += '0' + min + ':';
	} else ret = min + ':';

	if (sec >= 10) ret += sec;
	else ret += '0' + sec;

	return ret;
}

@observer
class ProgBox extends React.Component<{ player: MPlayer, disable: boolean, barDrag: boolean }> {
	private m_dragging = false;
	private m_bg!: HTMLElement;
	private m_bgW = 0;
	private m_s = 0;
	@observable private m_dragLeft = 0;
	private m_dragLeft_s = 0;
	private _seek = _.throttle((percent: number) => {
		if(this.props.disable) return;
		const player = this.props.player;
		player.seek(player.duration * percent / 100);
	}, 300, { leading: false });
	private _refBG = (el: HTMLElement | null) => {
		if (this.m_bg || !el) return;
		this.m_bg = el;
	}

	private _start = (evt: DraggableEvent, data: DraggableData) => {
		if (!this.m_bg || this.props.disable) return;
		const player = this.props.player;
		if (player.duration <= 0) return;

		this.m_bgW = this.m_bg.getBoundingClientRect().width;
		if (this.m_bgW <= 0) return;

		let left = 100 * data.x / this.m_bgW;
		if (left < 0) left = 0;
		else if (left > 100) left = 100;
		this.m_dragLeft_s = left;
		this.m_dragLeft = left;
		this.m_s = data.x;
		this.m_dragging = true;
	}
	private _drag = (evt: DraggableEvent, data: DraggableData) => {
		if (!this.m_dragging || this.props.disable) return;
		let left = this.m_dragLeft_s + 100 * (data.x - this.m_s - 100) / this.m_bgW;
		if (left < 0) left = 0;
		else if (left > 100) left = 100;
		this.m_dragLeft = left;

		const player = this.props.player;
		if (!player.bPlay) this._seek(left);
	}
	private _stop = (evt: DraggableEvent, data: DraggableData) => {
		if (!this.m_dragging || this.props.disable) return;

		this.m_dragging = false;
		const player = this.props.player;
		player.seek(player.duration * this.m_dragLeft / 100);
	}
	public render() {
		const player = this.props.player;
		let percent = 0;
		if (player.duration > 0) {
			percent = (player.viewTime / player.duration) * 100;
		}
		let btnLeft = 0;
		let dragLeft = this.m_dragLeft;
		if (this.m_dragging) btnLeft = dragLeft;
		else btnLeft = percent;

		return (
			<>
				{this.props.barDrag ? 
				<DraggableCore
					onDrag={this._drag}
					onStart={this._start}
					onStop={this._stop}
				>
					<div className="prog_box">
						<div className="prog_bg" ref={this._refBG}>
							<div className="prog_bar" style={{ width: btnLeft + '%' }} />
							<div className="prog_tmp" />
							{/* <ToggleBtn className="prog_btn" style={{ left: btnLeft + '%' }} /> */}
							<ToggleBtn className="prog_btn" style={{ left: btnLeft + '%' }} />
						</div>
					</div>
				</DraggableCore>
				:
				<div className="prog_box">
					<div className="prog_bg" ref={this._refBG}>
						<div className="prog_bar" style={{ width: btnLeft + '%' }} />
						<div className="prog_tmp" />
						<ToggleBtn className="prog_btn" style={{ left: btnLeft + '%' }} />
					</div>
				</div>
				}
				<div className="video_time" style={{ width: (player.duration >= 600000 ? 110 : 105) + 'px' }}><span className="crt_time">{_getTimeStr(player.viewTime, player.duration)}</span> / <span>{_getTimeStr(player.duration, player.duration)}</span></div>
			</>
		);
	}
}

interface IControlBox {
	player: MPlayer;
	disable: boolean;
	isPlay: boolean;
	barDrag: boolean;
	complete: () => void;
	togglePlay: (time: any) => void;
	toggleFullscreen: () => void;
	stopClick: () => void;
	toggleMute?: () => void;
	playType?: string;
	isFull?: boolean;
}
@observer
class ControlBox extends React.Component<IControlBox> {
    @observable private _isPlay: boolean = false;
	@observable private _isFull: boolean = false;

    constructor(props: IControlBox) {
        super(props);

		if(this.props.isFull !== undefined) this._isFull = this.props.isFull;
    } 

	public componentDidUpdate(prev: IControlBox) {
		// console.log('this.props.isPlay !!', this.props.isPlay)

		this._isPlay = this.props.isPlay;

		if(this.props.isFull !== undefined) this._isFull = this.props.isFull;
		// console.log('isFull?', this.props.isFull, this._isFull);
	}
		
	public render() {
		const player = this.props.player;
		let time: any = _getTimeStr(player.viewTime, player.duration).replace(':','')
		time = time * 1;


		if(this.props.player.duration > 0 && this.props.player.viewTime >= this.props.player.duration) {
			this.props.complete();
		}
		return (
			<div className={`control detail ${this.props.playType}`}>
				{/* <div className="control_left">
					<ToggleBtn className={this._isPlay ? 'btn_play_pause on' : 'btn_play_pause'} onClick={this.props.togglePlay.bind(this, time)} />
					<ToggleBtn className="btn_stop" onClick={this.props.stopClick} />
				</div>
				<div className="control_top">
					<div>
						<ProgBox player={player} disable={this.props.disable}/>
					</div>
				</div> */}
				<div className="control_top">
					<div>
						<ProgBox player={player} disable={this.props.disable} barDrag={this.props.barDrag}/>
					</div>
				</div>
				<div className="control_btm">
					<div>
						<ToggleBtn className={this._isPlay ? 'btn_play_pause on' : 'btn_play_pause'} onClick={this.props.togglePlay.bind(this, time)} />
						<ToggleBtn className="btn_stop" onClick={this.props.stopClick} />
						{/* <ToggleBtn className="btn_prev" />
						<ToggleBtn className="btn_next" /> */}
					</div>
					<div>
						<ToggleBtn className="btn_sound" onClick={this.props.toggleMute} on={player.muted} />
						<ToggleBtn className={this._isFull ? 'btn_fullscreen_off' : 'btn_fullscreen'} onClick={this.props.toggleFullscreen} />
					</div>
				</div>
			</div>
		);
	}
}

export default ControlBox;
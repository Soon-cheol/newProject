
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { observable, action } from 'mobx';
import { observer } from 'mobx-react';
import { App } from '../App';
import * as _ from 'lodash';
import * as style from './style';
import { CoverPopup } from './CoverPopup';
import { MPlayer, MConfig, IMedia, MPRState } from '@common/mplayer/mplayer';
import { ToggleBtn } from '@common/component/button';
import { DraggableEvent, DraggableData, DraggableCore } from 'react-draggable';
import PenRecordPlayer from './PenRecordPlayer';


function _getTimeStr(ms: number, max: number) {
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
function _getDateStr(time: number) {
	let ret = '';
	let d = new Date(time);
	if(!d) return ret;

	const ny = d.getFullYear();
	const nm = d.getMonth() + 1;
	const nd = d.getDate();
	const mm = (nm < 10) ? '0' + nm : '' + nm;
	const dd = (nd < 10) ? '0' + nd : '' + nd;
	return ny + '.' + mm + '.' + dd; 
}

@observer
class ProgBox extends React.Component<{ player: MPlayer, disable: boolean }> {
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
		let left = this.m_dragLeft_s + 100 * (data.x - this.m_s) / this.m_bgW;
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
		if (player && player.duration > 0) {
			percent = (player.viewTime / player.duration) * 100;
		}
		let btnLeft = 0;
		let dragLeft = this.m_dragLeft;
		if (this.m_dragging) btnLeft = dragLeft;
		else btnLeft = percent;
		return (
			<>
				<div className="prog_box">
					<DraggableCore
						onDrag={this._drag}
						onStart={this._start}
						onStop={this._stop}
					>
						<div className="prog_bg" ref={this._refBG}>
							<div className="prog_bar" style={{ width: percent + '%' }} />
							<div className="prog_tmp" />
							<ToggleBtn className="prog_btn" style={{ left: btnLeft + '%' }} />
							<div className="preview">
								<div className="video"></div>
								<div className="time">11:56</div>
							</div>
						</div>
					</DraggableCore>
				</div>
				<div className="volume">
					<button className="btn_volume"></button>
					{/* "btn_volume off" 시 볼륨버튼 오프됨 */}
					<div className="progress">
						<div className="bg_progress">
							<div className="bar" style={{width:'50%'}}></div>
							<button className="btn_progress" style={{left:'50%'}}></button>
						</div>
					</div>
				</div>
				<div className="video_time"><span>{_getTimeStr(player ? player.viewTime : 0, player ? player.duration: 0)}</span> <span> / {_getTimeStr(player ? player.duration: 0, player ? player.duration: 0)}</span></div>
				<div className="subtitle"></div>
				{/* "subtitle on" 시 자막 켜짐상태 */}
			</>
		);
	}
}

interface IControlBox {
	player: MPlayer;
	disable: boolean;
	isPlay: boolean;
	// toggleMute: () => void;
	// toggleFullscreen: () => void;
	togglePlay: () => void;
	// stopClick: () => void;
}
@observer
class ControlBox extends React.Component<IControlBox> {
	public render() {
		const {player, disable} = this.props;
		return (
			<div className="control_box">
				<ToggleBtn className="video-play-pause" on={this.props.isPlay} onClick={this.props.togglePlay}/>
				{/* <ToggleBtn className="video-stop"  onClick={this.props.stopClick}/>
				<ToggleBtn className="video-sound" onClick={this.props.toggleMute} on={player.muted} />
				<ToggleBtn className="video_fullscreen" onClick={this.props.toggleFullscreen} />
				<ToggleBtn className="video_fullscreen_off" onClick={this.props.toggleFullscreen} /> */}
				<ProgBox player={player} disable={disable}/>
			</div>
		);
	}
}

interface IPenRecordPopup {
	view: boolean;
	curIdx: number;
	on: boolean;
	thumbSrc: string;
	bgSrc: string;
	audioSrc: string;
	data: PenRecordData;
}

@observer
export class PenRecordPopup extends React.Component<IPenRecordPopup> {
	private _penplayer!: PenRecordPlayer;
	private _audioplayer!: MPlayer;
    private _cel: HTMLCanvasElement|null = null;
    private _ctx: CanvasRenderingContext2D|null = null;
	private _ratio: number = 1;
	
	@observable private m_loaded: boolean = false;

    constructor(props: IPenRecordPopup) {
		super(props);
		// this._audioplayer = new MPlayer(new MConfig(true));
    }
    private _refCanvas = (el: HTMLCanvasElement) => {
        if(this._cel || !el) return;
        this._cel = el;

        const ctx = el.getContext('2d') as CanvasRenderingContext2D;
        const hidpi = el.getAttribute('hidpi');
        let ratio = 1;
		if (hidpi && !/^off|false$/.test(hidpi)) {
			const deviceRatio = window.devicePixelRatio || 1;
			const backingStoreRatio = ctx['webkitBackingStorePixelRatio'] || ctx['backingStorePixelRatio'] || 1; // tslint:disable-line
			ratio = devicePixelRatio / backingStoreRatio;
			ctx.scale(ratio, ratio);
        }
        this._ctx = ctx;
        this._ratio = ratio;
		
		this._penplayer = new PenRecordPlayer(this._ctx);
    }
    // private _refAudio = (el: HTMLMediaElement | null) => {
    //     if (!el) return;
    //     const player  = this._audioplayer;
    //     if (player.media) return;
    //     player.mediaInited(el as IMedia);
    // }
    private _togglePlay = () => {
		if(!this._penplayer) return;
		App.pub_playBtnTab();

		if(this._penplayer.bPlay) this._penplayer.pause(false);
		else this._penplayer.play();
	}

    public componentDidUpdate(prev: IPenRecordPopup) {
		if(this.props.view && !prev.view) {
			// console.log('============> this.props.view && !prev.view')
			if(this._penplayer) {
				let records: string[] = [];
				records.push(this.props.audioSrc);
				this._penplayer.load(records, this.props.data);
				this._audioplayer = this._penplayer.player;
				this.m_loaded = true;
			}
		} else if(!this.props.view && prev.view) {
			// console.log('============> !this.props.view && prev.view')
			if(this._audioplayer){
				if(this._audioplayer.bPlay) {
					this._audioplayer.gotoAndPause(0);
				}
				this._audioplayer.unload();
			}
			this.m_loaded = false;
		}
		if(this.props.view) {
			if(this.props.on && !prev.on) {
				// console.log('============> this.props.on && !prev.on 1', this.m_loaded, this._penplayer, this._audioplayer, this.props.curIdx)
				if(this._penplayer && !this.m_loaded) {
					let records: string[] = [];
					this._penplayer.load(records, this.props.data);
					this._audioplayer = this._penplayer.player;
					this.m_loaded = true;
				}
			} else if(!this.props.on && prev.on) {
				// console.log('============> !this.props.on && prev.on 2', this.m_loaded, this._penplayer, this._audioplayer, this.props.curIdx)
				if(this._audioplayer){ 
					if(this._audioplayer.bPlay) {
						this._audioplayer.pause();
					}
				}
			}
		} 
    }
    public render() {
		const {view, on, thumbSrc, bgSrc} = this.props;
		// console.log('this._penplayer.bPlay', this._penplayer ? this._penplayer.bPlay : 'none' , 'this._audioplayer.bPlay', this._audioplayer.bPlay)
		let bPlay = this._audioplayer ? this._audioplayer.bPlay : false;
		// console.log('render', this.props.curIdx, this._audioplayer);
		return(
			<div className="t_penrecord_popup" style={view ? undefined : style.NONE}>
				<div className="penrecord_box">
					<div className="penrecord_play">
						<div className="penrecord_bg"></div>
						<div className="video_basis_img" style={{zIndex: bPlay ? -1 : 0}}>
							<img src={bgSrc} draggable={false}/>
						</div>
						<div className="video_thumb_img" style={{display: bPlay ? 'none' : 'block'}}>
							<img src={thumbSrc} draggable={false}/>
						</div>
						<canvas 
							ref={this._refCanvas}
							width={1280}
							height={800}
							style={{zIndex: bPlay ? 10 : -1}}
						/>
						{/* <audio controls={false} ref={this._refAudio} /> */}
						<ToggleBtn className="btn_play" view={this.m_loaded && !bPlay} onClick={this._togglePlay}/>
					</div>
					<ControlBox
						player={this._audioplayer}
						disable={!this.m_loaded}
						isPlay={bPlay}
						togglePlay={this._togglePlay}
					/>
				</div>
			</div>
        );
    }

}
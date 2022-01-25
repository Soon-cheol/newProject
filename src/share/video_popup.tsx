
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
		if (player.duration > 0) {
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
						</div>
					</DraggableCore>
				</div>
				<div className="video_time"><span>{_getTimeStr(player.viewTime, player.duration)}</span> / <span>{_getTimeStr(player.duration, player.duration)}</span></div>
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

interface IVideoPopup {
	view: boolean;
	videoSrc: string;
	curIdx: number;
	on: boolean;
}

@observer
export class VideoPopup extends React.Component<IVideoPopup> {

    private _player: MPlayer;
    private m_box!: HTMLElement;

    constructor(props: IVideoPopup) {
        super(props);
        this._player = new MPlayer(new MConfig(true));
    }

    private _refBox = (el: HTMLElement | null) => {
		if (this.m_box || !el) return;
		this.m_box = el;
	}
    private _refVideo = (el: HTMLMediaElement | null) => {
        if (!el) return;
        const player  = this._player;
        if (player.media) return;
        player.mediaInited(el as IMedia);
    }
    private _clickVideo = () => {
		if (this._player.bPlay) {
			App.pub_playBtnTab();
			this._player.pause();
		}
    }
    private _togglePlay = () => {
		App.pub_playBtnTab();
		if (this._player.bPlay) this._player.pause();
		else this._player.play();
	}
	// private _stopClick = () => {
	// 	App.pub_playBtnTab();
	// 	this._player.gotoAndPause(0);
	// }
	// private _toggleMute = () => {
	// 	App.pub_playBtnTab();
	// 	this._player.setMuted(!this._player.muted);
    // }
    // private _toggleFullscreen = () => {
	// 	App.pub_playBtnTab();
	// 	if (document['fullscreenElement'] === this.m_box || document['webkitFullscreenElement'] === this.m_box) { 	// tslint:disable-line
	// 		if (document.exitFullscreen) document.exitFullscreen();
	// 		else if (document['webkitExitFullscreen']) document['webkitExitFullscreen'](); 	// tslint:disable-line
	// 	} else {
	// 		if (this.m_box.requestFullscreen) this.m_box.requestFullscreen();
	// 		else if (this.m_box['webkitRequestFullscreen']) this.m_box['webkitRequestFullscreen'](); 	// tslint:disable-line
	// 	}
	// }

    public componentDidUpdate(prev: IVideoPopup) {
		if(this.props.view && !prev.view) {
			this._player.load(this.props.videoSrc);
		} else if(!this.props.view && prev.view) {
			if(this._player.bPlay) {
				this._player.gotoAndPause(0);
			}
			this._player.unload();
			
		}
		if(this.props.curIdx !== prev.curIdx) {
			this._player.unload();
			this._player.load(this.props.videoSrc);
		}
    }
    public render() {
        const {view} = this.props;

        return(
        <div className="t_video_popup" style={view ? undefined : style.NONE}>
			<div className="video_box" ref={this._refBox}>
				<div className="video_play">
					<video controls={false} ref={this._refVideo} onClick={this._clickVideo} />
					<ToggleBtn className="btn_play_video" view={!this._player.bPlay} onClick={this._togglePlay}/>
					{/* <div className="video_basis_img" style={{backgroundImage: charaterImg}}/> */}
				</div>
				<ControlBox
					player={this._player}
					disable={false}
					isPlay={this._player.bPlay}
					// toggleFullscreen={this._toggleFullscreen}
					togglePlay={this._togglePlay}
					// stopClick={this._stopClick}
					// toggleMute={this._toggleMute}
				/>
			</div>
        </div>
        );
    }

}
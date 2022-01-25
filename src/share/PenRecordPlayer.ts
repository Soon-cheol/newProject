import * as _ from 'lodash';
import { MPlayer, MConfig, MPRState, IMedia } from '@common/mplayer/mplayer';
import * as kutil from '@common/util/kutil';
import { computed, observable } from 'mobx';
import { App } from '../App';

export default class PenRecordPlayer {
	private _records?: string[];
	private _data?: PenRecordData;
	// private _durations?: number[];

	@observable private _duration = 0;

	private _ctx: CanvasRenderingContext2D;

	private _aniIdx = -1;					// window.requestAnimationFrame
	private _aniLast = -1;					// 펜 stroke ani 저장 시작시간

	private _bClear = true;					// play시 전체 펜 삭제
	private _ridx = 0;            			// 현재 녹음 index 
	private _pidx = 0;						// 현재 펜 index
	private _pidx_sub = 0; 					// 현재 펜 point idx
	private _player: MPlayer;

	private _lastTime = 0;
	@observable private _viewTime = 0;

	@observable private _timeStr = '00:00';
	@computed public get timeStr() {return this._timeStr;}

	@observable private _bPlay = false;
	@computed public get bPlay() {return this._bPlay;}

	@observable private _played = false;
	@computed public get played() {return this._played;}

	@computed public get viewTime() {return this._viewTime;}
	
	@computed public get duration() {return this._duration;}
	@computed public get muted() {return this._player.muted;}	
	@computed public get volume() {return this._player.volume;}	
	@computed public get player() {return this._player;}	


	constructor(ctx: CanvasRenderingContext2D) {
		this._ctx = ctx;
		this._player = new MPlayer(new MConfig(false));

		this._player.mediaInited(document.createElement('audio') as IMedia);

		const endFnc = async () => {
			if(!this._records) return;
			else if(!this._data) return;
			else if(!this._bPlay) return;
			const { 
				ridxs,
				starts,
				ends,
				erases,
				colors,
				thicks,
				arrX,
				arrY,			
			} = this._data;

			while(this._aniIdx >= 0) await kutil.wait(10);

			for(let i = this._pidx; i < ridxs.length; i++) {
				if(ridxs[i] === this._ridx) {
					this._pidx = i + 1;
					this._draw(0, 0, 0, erases[i], colors[i], thicks[i], arrX[i], arrY[i]);
				} 
			}
			if(this._ridx < this._records.length - 1) {
				if(this._player.bPlay) this._player.pause();
				_.defer(() => {
					if(!this._records) return;
					// if(this._durations) {
					// 	if(!App.isDvlp) {
					// 		// this._durations[this._ridx] = this._player.duration;
					// 	}

					// 	this._lastTime = this._lastTime + this._durations[this._ridx];
					// 	this._viewTime = this._lastTime;
					// 	if(this._viewTime > this._duration) this._viewTime = this._duration;
					// 	this._timeStr = kutil.getTimeStr(this._lastTime, 600000);
					// }

					// console.log('endFnc, defer', this._ridx);
					const muted = this._player.muted;
					const volume = this._player.volume;
					this._player.unload();
					this._player.load(this._records[++this._ridx]);
					this._player.play();
					this._player.setVolume(volume);
					this._player.setMuted(muted);
					
				});
			} else {
				if(this._player.bPlay) this._player.pause();
				this._bPlay = false;
				this._bClear = true;
			}		
		};

		this._player.addOnPlayEnd(endFnc);
		this._player.addOnTime((time: number) => {
			if(!this._player.bPlay) return;
			else if(!this._data) return;
			
			const { 
				ridxs,
				starts,
				ends,
				erases,
				colors,
				thicks,
				arrX,
				arrY,			
			} = this._data;

			// if(App.isDvlp) {
			// 	if(this._durations && time > this._durations[this._ridx]) {
			// 		// console.log('addOnTime call endFnc', this._player.bPlay);
			// 		endFnc();
			// 		return;
			// 	}
			// }

			this._viewTime = this._lastTime + time;
			if(this._viewTime > this._duration) this._viewTime = this._duration;

			this._timeStr = kutil.getTimeStr(this._viewTime, 600000);
			for(let i = this._pidx; i < ridxs.length; i++) {
				if(this._aniIdx >= 0 || !this._bPlay) break;
				if(ridxs[i] === this._ridx && starts[i] < time) {
					this._pidx = i + 1;
					this._draw(starts[i], ends[i], time, erases[i], colors[i], thicks[i], arrX[i], arrY[i]);
				} 
			}
		});
	}

	public seek(val: number) {
		if(val < 0 || val > this._duration) return;
		else if(!this._bPlay) return;
		else if(!this._data) return;
		// else if(!this._durations) return;
		else if(!this._records) return;

		if(this._aniIdx >= 0) {
			window.cancelAnimationFrame(this._aniIdx);
			this._aniIdx = -1;
		}
		const canvas = this._ctx.canvas;
		this._ctx.clearRect(0, 0, canvas.width, canvas.height);

		let start = 0;
		let ridx = -1;
		let time = -1;
		// for(let i = 0; i < this._durations.length; i++) {
		// 	const end = start + this._durations[i];
		// 	if(val + 0.1 < end) {
		// 		ridx = i;
		// 		time = val - start;
		// 		break;
		// 	}
		// 	start = end;
		// }
		if(ridx < 0) return;

		if(time < 0) time = time;

		this._lastTime = start;
		this._viewTime = start + time;
		if(this._viewTime > this._duration) this._viewTime = this._duration;

		this._timeStr = kutil.getTimeStr(this._viewTime, 600000);
		// this._

		this._pidx = 0;
		const { 
			ridxs,
			starts,
			ends,
			erases,
			colors,
			thicks,
			arrX,
			arrY,			
		} = this._data;


		
		for(let i = 0; i < ridxs.length; i++) {
			if(ridxs[i] < ridx || (ridxs[i] === ridx && ends[i] < time)) {
				this._pidx = i + 1;
				this._draw(0, 0, 0, erases[i], colors[i], thicks[i], arrX[i], arrY[i]);
			} else break;
		}

		// console.log('a', ridx, this._ridx, sum, time, val);
		if(this._ridx === ridx) {
			this._player.seek(time);
		} else {
			this._player.pause();
			_.defer(() => {
				if(!this._records) return;

				const muted = this._player.muted;
				const volume = this._player.volume;
				this._player.unload();
				this._player.load(this._records[ridx]);
				this._ridx = ridx;
				this._player.play();
				this._player.seek(time);
				this._player.setVolume(volume);
				this._player.setMuted(muted);
				
			});
		}
	}

	public setMuted(val: boolean) {
		this._player.setMuted(val);
	}
	public setVolume(val: number) {
		this._player.setVolume(val);
	}
	private _aniFnc?:	(f: number) => void;

	private async _draw(start: number, end: number, time: number, erase: number, color: string, thick: number, arrX: number[], arrY: number[]) {
		const ctx = this._ctx;
		const len = arrX.length;
		const vratio = 926 / 1280;
		const hratio = 477 / 725;

		if(len < 1) return;
		ctx.beginPath();
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
		ctx.strokeStyle = color;
		if(erase === 1) ctx.globalCompositeOperation = 'destination-out';
		else ctx.globalCompositeOperation = 'source-over';
		ctx.lineWidth = thick;
		// ctx.moveTo(arrX[0], arrY[0]);
		ctx.moveTo(arrX[0] * vratio, arrY[0] * hratio);

		if(time >= start && time < end ) {
			const interval = (end - start) / len;
			
			let diff = ((time - start) / interval) | 0;

			let nidx = 1;
			for(let i = 1; i <= diff && i < len; i++) {
				// ctx.lineTo(arrX[i], arrY[i]); 
				ctx.lineTo(arrX[i] * vratio, arrY[i] * hratio); 
				ctx.stroke();
				nidx = nidx + 1;
			}
			
			let didx = nidx;
			this._aniLast = Date.now();

			this._aniFnc = (f: number) => {
				if(!this._bPlay) return;
				diff = ( (Date.now() - this._aniLast) / interval) | 0;
				if(diff > 0) {
					nidx = didx;
					for(let i = didx; i <= didx + diff && i < len; i++) {
						// ctx.lineTo(arrX[i], arrY[i]); 
						ctx.lineTo(arrX[i]  * vratio, arrY[i] * hratio); 
						ctx.stroke();
						nidx = nidx + 1;
					}
					this._aniLast = this._aniLast + (nidx - didx) * interval;
					didx = nidx;
				}
				if(didx < len) {
					if(this._aniFnc) this._aniIdx = window.requestAnimationFrame(this._aniFnc);
				} else {
					ctx.closePath();
					this._aniIdx = -1;
				}
			};

			this._aniIdx = window.requestAnimationFrame(this._aniFnc);
		} else {
			for(let i = 1; i < len; i++) {
				// ctx.lineTo(arrX[i], arrY[i]); 
				ctx.lineTo(arrX[i] * vratio, arrY[i] * hratio); 
			}		
			ctx.stroke();
			ctx.closePath();
		}
			
	}


	public load(records: string[], data: PenRecordData) {
		let duration = 0;
		// for(let i = 0; i < durations.length; i++) duration = duration + durations[i];

		// const canvas = this._ctx.canvas;
		// this._ctx.clearRect(0, 0, canvas.width, canvas.height);
		this._player.setMuted(false);
		this._player.setVolume(1);
		this._viewTime = 0;
		this._lastTime = 0;
		this._timeStr = '00:00';
		this._records = records;
		this._data = data;
		// this._durations = durations;
		this._bPlay = false;
		this._bClear = true;
		this._played = false;
		// this._duration = duration;
		this._player.load(this._records[0]);
		this._duration = this._player.duration * 1000;
	}

	public play() {
		if(!this._records) return;
		else if(!this._data) return;
		// console.log('play', 'this._bClear=' + this._bClear, 'this._aniIdx=' + this._aniIdx);

		const muted = this._player.muted;
		const volume = this._player.volume;
		if(this._bClear) {
			
			this._timeStr = '00:00';
			this._viewTime = 0;
			this._lastTime = 0;
			this._aniIdx = -1;
			this._player.unload();
			this._player.load(this._records[0]);
			this._ridx = 0;
			this._bClear = false;
			this._player.setMuted(muted);
			

		} else if( this._aniIdx >= 0) {
			if(this._aniFnc) {
				this._aniLast = Date.now();
				this._aniIdx = window.requestAnimationFrame(this._aniFnc);
			} else {
				window.cancelAnimationFrame(this._aniIdx);
				this._aniIdx = -1;
			}
		}
		const canvas = this._ctx.canvas;
		this._ctx.clearRect(0, 0, canvas.width, canvas.height);
		const { 
			ridxs,
			starts,
			ends,
			erases,
			colors,
			thicks,
			arrX,
			arrY,			
		} = this._data;

		this._pidx = 0;
		for(let i = 0; i < ridxs.length; i++) {
			if(ridxs[i] < this._ridx || (ridxs[i] === this._ridx && ends[i] < this._player.currentTime)) {
				this._pidx = i + 1;
				this._draw(0, 0, 0, erases[i], colors[i], thicks[i], arrX[i], arrY[i]);
			} else break;
		}

		this._played = true;
		this._bPlay = true;
		this._player.setVolume(volume);
		this._player.setMuted(muted);
		this._player.play();
	}
	public pause(bClear: boolean, bClearDraw?: boolean) {
		// console.log('pause', 'bClear=' + bClear, 'bClearDraw=' + bClearDraw, 'this._aniIdx=' + this._aniIdx);
		if(this._aniIdx >= 0) {
			window.cancelAnimationFrame(this._aniIdx);
			this._aniIdx = -1;
		}
		if(bClear) {
			this._bClear = true;
			this._played = false;
			if(bClearDraw) {
				const canvas = this._ctx.canvas;
				this._ctx.clearRect(0, 0, canvas.width, canvas.height);
			}
		}
		this._bPlay = false;
		if(this._player.bPlay) this._player.pause();
	}
}
import * as geom from './geom';

const DEFAULT_MAX_REST_TIME = 100;
const DEFAULT_ESCAPE_VELOCITY = 0.2;
const DEFAULT_TIME_DISTORTION = 100;


export default class Dragger {
	public readonly load: () => void;
	public readonly unload: () => void;
	public readonly getSwipe: () => {vx: number, vy: number, length: number, deg: number};

	constructor(
		target: HTMLElement,
		option: {preventDefault: boolean, detectEnter?: boolean},
		dragStart: (ev: PointerEvent) => boolean|{ok: boolean, preventCapture: boolean},
		dragMove: (dx: number, dy: number, ev: PointerEvent) => void,
		dragEnd?: (ev: PointerEvent) => void,
		geomEl?: HTMLElement|SVGGElement,
		checkSwipe?: boolean,
	) {
		let loaded = false;
		let pointerId = - 1;
		let downX = 0;
		let downY = 0;
		target.style.touchAction = 'none';
		target.ondragstart = target.ondrag = (ev) => {
			console.log('aaaaaaaaaaaaaa', ev.type);
			ev.preventDefault();
			ev.stopImmediatePropagation();
		};

		let matr: DOMMatrix = new DOMMatrix();

		let moves: Array<{x: number, y: number, t: number}> = [];
		let moveIdx = 0;

		const onMouseMove = (ev: PointerEvent) => {
			if(pointerId !== ev.pointerId) return;
			if(option.preventDefault) {
				ev.preventDefault();
				ev.stopImmediatePropagation();
			}
			const localPt = matr.transformPoint({x: ev.clientX, y: ev.clientY});

			if(checkSwipe) {
				let idx = moveIdx++ % 10;
				moves[idx] = {t: Date.now(), x: localPt.x, y: localPt.y};
			}
			dragMove(localPt.x - downX, localPt.y - downY, ev);
		};
		const onMouseUp = (ev: PointerEvent) => {
			if(pointerId !== ev.pointerId) return;
			if(option.preventDefault) {
				ev.preventDefault();
				ev.stopImmediatePropagation();
			}
			target.removeEventListener('pointermove', onMouseMove, true);
			target.removeEventListener('pointerup', onMouseUp, true);
			target.removeEventListener('pointercancel', onMouseUp, true);

			target.releasePointerCapture(pointerId);
			pointerId = -1;


			if(dragEnd) dragEnd(ev);
		};
		const onMouseDown = (ev: PointerEvent) => {
			if(!ev.isPrimary || ev.buttons !== 1) return;

			let preventCapture;
			let ret = dragStart(ev);
			if(typeof ret === 'boolean') {
				if(!ret) return;

				preventCapture = false;
			} else {
				if(!ret.ok) return;
				preventCapture = ret.preventCapture;
			}
			

			if(option.preventDefault) {
				ev.preventDefault();
				ev.stopImmediatePropagation();
			}

			matr = geom.getElementMatrix(geomEl ?? target);		
			matr.invertSelf(); 
			
			const localPt = matr.transformPoint({x: ev.clientX, y: ev.clientY});
			downX = localPt.x;
			downY = localPt.y;
			moves.length = 0;
			moveIdx = 0;

			pointerId = ev.pointerId;
			if(!preventCapture) {
				target.setPointerCapture(pointerId);
			}
			target.addEventListener('pointermove', onMouseMove, true);
			target.addEventListener('pointerup', onMouseUp, true);
			target.addEventListener('pointercancel', onMouseUp, true);
		};

		target.addEventListener('pointerdown', onMouseDown);
		if(option.detectEnter) target.addEventListener('pointerenter', onMouseDown);
		loaded = true;

		this.getSwipe = () => {
			let ret = {vx: 0, vy: 0, length: 0, deg: 0};
			if(moves.length < 3) return ret;
			let len = moves.length;
			let last_0, last_1;

			let firstX, firstY;
			for(let i = 0; i < len; i++ ) {
				let idx = (moveIdx - 1) % 10 - i;
				idx = idx < 0 ? len + idx : idx;
				let item = moves[idx];

				if(i === 0 ) last_0 = item;
				else if(last_0 && item.t < last_0.t) {
					last_1 = item;
					break;
				}
			}
			

			if(last_0 && last_1) {
				ret.vx =  (last_0.x - last_1.x) / (last_0.t - last_1.t);
				ret.vy =  (last_0.y - last_1.y) / (last_0.t - last_1.t);
				ret.length = (ret.vx ** 2 + ret.vy ** 2) ** 0.5;  
				if(ret.length < 0.2) {
					ret.vx = 0;
					ret.vy = 0;
					ret.length = 0;	
				} else {
					if(ret.vx === 0) ret.deg = ret.vy > 0 ? 90 : -90;
					else if(ret.vy === 0 ) ret.deg = ret.vx > 0 ?  0 : 180;
					else if(ret.vx < 0 && ret.vy < 0 ) ret.deg = -180 + 180 * Math.atan(ret.vy / ret.vx) / Math.PI;
					else if(ret.vx < 0 && ret.vy > 0 ) ret.deg = 180 + 180 * Math.atan(ret.vy / ret.vx) / Math.PI;
					else ret.deg = 180 * Math.atan(ret.vy / ret.vx) / Math.PI;
				}
			}

			return ret;
		};

		this.load = () => {
			if(!loaded) {
				target.addEventListener('pointerdown', onMouseDown);
				if(option.detectEnter) target.addEventListener('pointerenter', onMouseDown);
				loaded = true;
			}
		};
		this.unload = () => {
			if(pointerId >= 0) {
				target.releasePointerCapture(pointerId);
				pointerId = -1;
			}
			moves.length = 0;
			loaded = false;
			target.removeEventListener('pointerdown', onMouseDown);
			target.removeEventListener('pointermove', onMouseMove, true);
			target.removeEventListener('pointerup', onMouseUp, true);
			target.removeEventListener('pointercancel', onMouseUp, true);
		};
	}
}
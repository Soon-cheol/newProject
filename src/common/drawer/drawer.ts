import { TypedEmitter } from 'tiny-typed-emitter';

import * as dutil from './drawer-util';
import Dragger from './dragger';

import './drawer.scss';

export const SVG_NS = 'http://www.w3.org/2000/svg';
export const CLS_DRAWER = 'drawer';
export const CLS_CONTAINER = 'pen-container';
export const CLS_STROKE = 'pen-stroke';
export const CLS_GUIDE = 'add-guide';

interface IBrush {
	strokeWidth: number;
	stroke: string;
	strokeOpacity: number;
	fill: string;
	fillOpacity: number;
	textColor: string;
}
interface IAdded {
	g: SVGGElement;
	path: SVGPathElement;
	arrx: number[];
	arry: number[];
}
interface IOption {
	size?: {width: number; height: number;};
	el: HTMLElement;
	undoLen?: number;
	type: 'svg'|'canvas';
}
type Mode = 'pen'|'line'|'eraser'|'eraser-area'|'add'|'select'|'save'|'';

export abstract class Drawer extends TypedEmitter<{
	'change-mode': (mode: Mode) => void;
	'change-brush': (brush: IBrush) => void;
	'change-history': () => void;
	'on-blur': () => void;
	'on-focus': () => void;
}> {
	protected _svg: SVGSVGElement;
	public get svg() {return this._svg;}

	protected _container: SVGGElement;
	protected _dragger: Dragger;

	protected _mode: Mode = 'pen';
	public get mode() {return this._mode;}

	protected _addType: 'text'|'image' = 'text';
	public get addType() {return this._addType;}

	protected _addSvgImage: string = '';
	// public get addImageUrl() {return this._addImageUrl;}

	public abstract get color(): string;
	public abstract set color(color: string);

	protected _brush: IBrush = {
		strokeWidth: 3,
		stroke: '#f00',
		strokeOpacity: 0.5,
		fill: 'transparent',
		fillOpacity: 0.5,
		textColor: '#000'
	};

	private _undoLen: number = 10;
	public get brush() {return this._brush;}

	protected abstract _undos: any[];
	protected abstract _redos: any[];
	protected abstract _downHandler: (mx: number, my: number, ev: PointerEvent) => boolean;
	protected abstract _moveHandler: (mx: number, my: number, ev: PointerEvent) => boolean;
	protected abstract _upHandler: (added: IAdded) => boolean;
	protected abstract _guideHandler: (x: number, y: number, width: number, height: number) => void;
	protected abstract _eraseHandler: (px: number, py: number, mx: number, my: number) => void;

	public abstract undo: () => void;
	public abstract redo: () => void;

	public abstract clearContent(): void;
	public abstract getBase64Data(): string;

	protected _paths: IAdded[] = [];

	protected _editable = true;

	constructor(option: IOption) {
		super();

		this._undoLen = option.undoLen ?? 20;
		const svg = this._svg = document.createElementNS(SVG_NS, 'svg');
		svg.classList.add(CLS_DRAWER);
		svg.style.position = 'relative';
		svg.style.zIndex = '0';

		option.el.appendChild(svg);
		
		const container = this._container = svg.appendChild(document.createElementNS(SVG_NS, 'g'));
		container.classList.add(CLS_CONTAINER);
		const brush = this._brush;

		let appendPath = (mx: number, my: number, cap: 'butt'|'round'|'square') => {
			const g = container.appendChild(document.createElementNS(SVG_NS,'g'));  
			g.classList.add(CLS_STROKE);
			// g.style.pointerEvents = 'none';
			const path = g.appendChild(document.createElementNS(SVG_NS,'path'));  
			path.style.strokeWidth = brush.strokeWidth + '';
			path.style.stroke = brush.stroke;
			path.style.strokeOpacity = brush.strokeOpacity + '';
			path.style.strokeLinecap = cap;
			path.style.strokeLinejoin = 'round';
			path.style.fill = 'none';
			path.style.pointerEvents = 'none';
			sPath = `M${mx} ${my}`;
			path.setAttribute('d', sPath);
			const ret: IAdded = {g, path, arrx: [], arry: []};
			return ret;
		};

		let eraser: SVGCircleElement|null = null;
		let guide: SVGRectElement|null = null;
		let added: IAdded|null = null;
		let sX = 0;
		let sY = 0;
		let eX = 0;
		let eY = 0;
		let pX1 = 0;
		let pY1 = 0;
		let pX2 = 0;
		let pY2 = 0;
		let pX3 = 0;
		let pY3 = 0;

		let sPath = '';
		let idx = 0;

		let elWidth = option.el.offsetWidth;
		let elHeight = option.el.offsetHeight;

		svg.setAttribute('width', elWidth + '');
		svg.setAttribute('height', elHeight + '');

		svg.setAttribute('viewBox', `0 0 ${elWidth} ${elHeight}`);

		const dragger = new Dragger(
			option.el, 
			{preventDefault: false},
			(ev) => {
				if(!this._editable) return false;
				elWidth = option.el.offsetWidth;
				elHeight = option.el.offsetHeight;
				svg.setAttribute('width', elWidth + '');
				svg.setAttribute('height', elHeight + '');
				svg.setAttribute('viewBox', `0 0 ${elWidth} ${elHeight}`);

				if(this._mode === 'select') return false;
		

				
				sX = pX1 = pX2 = pX3 = ev.offsetX;
				sY = pY1 = pY2 = pY3 = ev.offsetY;
				let ret = this._downHandler(sX, sY, ev);
				if(!ret) return false;

				if(this._mode === 'add') {
					this._guideHandler(sX, sY, 100, 100);
					return false;
				}

				idx = 0;
				return {ok: true, preventCapture: this._mode === 'eraser'};
			},
			(dx, dy, ev) => {
				let mx = sX + dx, my = sY + dy;
				let ret = this._moveHandler(mx, my, ev);
				if(!ret) return;

				if(this._mode === 'pen') {
					if(!added) {
						added = appendPath(sX, sY, 'round');
						added.arrx[idx] = sX;
						added.arry[idx++] = sY;
					}
					sPath += ` L${mx} ${my}`;
					added.path.setAttribute('d', sPath);
					added.arrx[idx] = mx;
					added.arry[idx++] = my;
				} else if(this._mode === 'line') {
					if(!added) {
						added = appendPath(sX, sY, 'butt');
						added.arrx[0] = sX;
						added.arry[0] = sY;
					}
					sPath = `M${sX} ${sY}l${dx} ${dy}`;

					eX = mx;
					eY = my;
					added.path.setAttribute('d', sPath);	
					
					added.arrx[1] = mx;
					added.arry[1] = my;
				} else if(this._mode === 'add' || this._mode === 'eraser-area') {
					if(!guide) {
						guide = svg.appendChild(document.createElementNS(SVG_NS, 'rect'));
						guide.classList.add(CLS_GUIDE);
						
					}
					if(mx < 0) mx = 0;
					else if(mx > elWidth) mx = elWidth;
					if(my < 0) my = 0;
					else if(my > elHeight) my = elHeight;					
					guide.setAttribute('x', Math.min(sX, mx) + '');
					guide.setAttribute('y', Math.min(sY, my) + '');
					guide.setAttribute('width', Math.abs(mx - sX) + '');
					guide.setAttribute('height', Math.abs(my - sY) + '');

					eX = mx;
					eY = my;
				} else if(this._mode === 'eraser') {
					if(!eraser) {
						eraser = svg.appendChild(document.createElementNS(SVG_NS, 'circle'));
						eraser.style.stroke = '#00baff';
						eraser.style.strokeWidth = '1';
						eraser.style.fill = dutil.hexToRgba('#00baff', 0.3);
						eraser.setAttribute('r', (this._brush.strokeWidth * 2) + '');
						eraser.style.pointerEvents = 'none';
					}
					this._eraseHandler(pX3, pY3, mx, my);

					eraser.setAttribute('cx', mx + '');
					eraser.setAttribute('cy', my + '');	
				}
				pX3 = pX2, pY3 = pY2,
				pX2 = pX1, pY2 = pY1,
				pX1 = mx,	 pY1 = my;
			},
			(ev) => {
				if(added) {
					this._upHandler(added);
					added = null;
				}
				if(guide) {
					if(this._mode === 'add' || this._mode === 'eraser-area') {
						this._guideHandler(
							Math.min(sX,  eX), 
							Math.min(sY,  eY), 
							Math.abs(sX - eX), 
							Math.abs(sY - eY), 
						);
					}
					svg.removeChild(guide);
					guide = null;
				}
				if(eraser) {
					svg.removeChild(eraser);
					eraser = null;
				}
			}
		);

		this._dragger = dragger;
	}
	public setEditable(val: boolean) {this._editable = val;}
	public getHistoryInfo() {
		return {undo: this._undos.length, redo: this._redos.length};
	}
	protected _addUndo(data: any) {
		this._redos.length = 0;
		this._undos.push(data);
		if(this._undos.length > 10) {
			this._undos.shift();
		}
		this.emit('change-history');
	}
	public setBrush(brush: Partial<IBrush>) {
		Object.keys(this._brush).forEach((key) => {
			if(typeof(brush[key]) !== 'undefined') {
				this._brush[key] = brush[key];
			}
		});

		this.emit('change-brush', this._brush);
	}

	public setMode(mode: Mode) {
		if(this._mode === mode) return;
		this._mode = mode;
		this.emit('change-mode', mode);
	}
	public async setAdd(type: 'text'|'image', url?: string) {
		this._mode = 'add';
		this._addType = type;
		if(type === 'image' && url) {
			const req = await fetch(url);
			const blob = await req.blob();
			const reader = new FileReader();
			reader.readAsDataURL(blob);
			reader.onloadend = () => {
				this._addSvgImage = reader.result as string;
			};			
		}

		this.emit('change-mode', 'add');
	}

	public clear() {
		this._undos.length = 0;
		this._redos.length = 0;
		this.emit('change-history');
	}
}

export { IAdded, IBrush, IOption, Mode };
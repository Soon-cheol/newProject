import * as opentype from 'opentype.js';
import Dragger from './dragger';
import * as geom from './geom';
import * as dutil from './drawer-util';

import { Drawer, IBrush, IAdded, IOption, SVG_NS, Mode, CLS_CONTAINER, CLS_STROKE } from './drawer';

const CLS_ITEM = 'item-class';
const CLS_ITEM_TEXT = 'item-text';
const CLS_ITEM_IMAGE = 'item-image';
const CLS_ITEM_SVG = 'item-svg';
const CLS_ITEM_CONTROL = 'item-svg-control';

let ico_rotate = '';
let ico_close = '';
let g_font: opentype.Font;
let FONT_FAMILY = 'maplestory-bold';

async function url2base64(url: string) {
	const req = await fetch(url);
	const blob = await req.blob();
	return new Promise<string>((resolve) => {
		const reader = new FileReader();
		reader.readAsDataURL(blob);
		reader.onloadend = () => {
			resolve(reader.result as string);
		};
	});
}

const DRAWER_ASSET = '/content/mathalive_lib/images/editor';
(async () => {
	ico_rotate = await url2base64(DRAWER_ASSET + '/ico_rotate.png');
	ico_close = await url2base64(DRAWER_ASSET + '/ico_close.png');
	g_font = await opentype.load(DRAWER_ASSET + '/Maplestory-Bold-simple.woff');
})();

function addTextPath(g: SVGElement, str: string, color: string, fsize: number, left: number, top: number, lineHeight: number) {
	if(!str || str === '') return;
	const ascender = (g_font.ascender - g_font.descender) * fsize /  g_font.unitsPerEm;

	str = str.replace(/\r\n/g, '\n').replace(/\n\r/g, '\n').replace(/\r/g, '\n');
	let arr = str.split('\n');
	arr.forEach((s, idx) => {
		const path = g_font.getPath(s, left, ascender + top + idx * lineHeight, fsize).toPathData(3);
		const p = g.appendChild(document.createElementNS(SVG_NS, 'path'));
		p.setAttribute('fill', color);
		p.setAttribute('d', path);
	});
}


type SVGHistoryType = 'add-pen'|'add-item'|'remove-pen'|'remove-item'|'first'|'item-value';
interface ISVGHistory {
	type: SVGHistoryType;
	container: SVGElement;
	itemID?: string;
}
class SVGDrawer extends Drawer {
	protected _downHandler: (mx: number, my: number, ev: PointerEvent) => boolean;
	protected _moveHandler: (mx: number, my: number, ev: PointerEvent) => boolean;
	protected _upHandler: (added: IAdded) => boolean;

	protected _undos: ISVGHistory[] = [];
	protected _redos: ISVGHistory[] = [];
	public undo: () => void;
	public redo: () => void;

	private _items: SVGItem[] = [];
	private _focusItem: SVGItem|null = null;
	protected _eraseHandler: (px: number, py: number, mx: number, my: number) => void;

	get color() {
		if(this._focusItem instanceof SVGTextItem) {
			return this._brush.textColor;
		} else {
			return this._brush.stroke;
		}		
	}
	set color(color: string) {
		let brush: Partial<IBrush>;
		if(this._focusItem instanceof SVGTextItem) {
			brush = {textColor: color};
		} else {
			brush = {stroke: color};
		}
		this.setBrush(brush);
	}

	private _breakHistory = false;
	constructor(option: IOption) {
		super(option);
		this._downHandler = (mx, my, ev) => {
			return true;
		};
		this._moveHandler = (mx, my, ev) => {
			return true;
		};
		this._upHandler = (added) => {
			let path = dutil.arrayToSVGPath(added.arrx, added.arry);
			added.path.setAttribute('d', path);
			this._paths.push(added);
			this.addHistory('add-pen', true);
			return true;
		};

		this.undo = () => {
			let data = this._undos.pop();
			if(!data) return;
			this._clearContainer();
			this.loadByContainer(data.container);
			this._redos.push(data);
			this._saved = this._container.cloneNode(true) as SVGElement;

			this._breakHistory = true;
			this.emit('change-history');
		};
		this.redo = () => {
			let data = this._redos.pop();
			if(!data) return;
			this._clearContainer();

			this.loadByContainer(data.container);
			this._undos.push(data);
			
			this.emit('change-history');
			this._breakHistory = true;
			this._saved = this._container.cloneNode(true) as SVGElement;
		};
		this._eraseHandler = (px: number, py: number, mx: number, my: number) => {
			let len = this._paths.length;
			for(let i = len - 1; i >= 0; i--) {
				let p = this._paths[i];
				let ok = dutil.intersectPath(p.arrx, p.arry, px, py, mx, my);
				if(ok) {
					this._container.removeChild(p.g);
					this._paths.splice(i, 1);

					this.addHistory('remove-pen', true);
					break;
				}
			}
		};

		this.addHistory('first');
	}

	
	public getBase64Data() {
		let fitem: SVGItem|null = null;
		let prevMode = this._mode;
		if(this._mode === 'select') {
			fitem = this._focusItem;
		}

		this.setFocusItem(null);
		this.setMode('save');

		const cbox = this._container.getBBox();
		const rect = this._svg.getBoundingClientRect();
		const width = rect.width;
		let height = cbox.y + cbox.height + 10;
		if(height > rect.height) height = rect.height;


		const svg = document.createElementNS(SVG_NS,'svg');
		svg.setAttribute('width', width + '');
		svg.setAttribute('height', height + '');
		svg.setAttribute('preserveAspectRatio', 'none');
		svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

		const def = svg.appendChild(document.createElementNS(SVG_NS, 'def'));
		const style = def.appendChild(document.createElementNS(SVG_NS, 'style'));

		const container = svg.appendChild(document.createElementNS(SVG_NS, 'g'));
		container.classList.add(CLS_CONTAINER);
		let children = this._container.children;
		let len = children.length;
		for(let i = 0; i < len; i++) {
			let el = children.item(i);
			if(el instanceof SVGElement) {				
				let node = el.cloneNode(true);
				if(node instanceof SVGElement && node.classList.contains(CLS_ITEM)) {
					const control = node.querySelector('.' + CLS_ITEM_CONTROL);
					if(control) control.parentElement?.removeChild(control);
					if(node.classList.contains(CLS_ITEM_TEXT)) {
						const srcArea = el.querySelector('textarea') as HTMLTextAreaElement;
						const tsvg = node.firstElementChild as SVGSVGElement;
						const str = srcArea.value;
						const fcolor = srcArea.style.color;
						const fsize = parseInt(srcArea.style.fontSize, 10);
						const paddingLeft = parseInt(srcArea.style.paddingLeft, 10);
						const paddingTop = parseInt(srcArea.style.paddingTop, 10);
						const lineHeight = parseInt(srcArea.style.lineHeight, 10);
			
						const tgtArea = node.querySelector('textarea') as HTMLTextAreaElement;
						tgtArea.innerText = tgtArea.value = srcArea.value;

						if(tsvg.firstElementChild instanceof SVGElement) tsvg.firstElementChild.style.display = 'none';

						addTextPath(tsvg, str, fcolor, fsize, paddingLeft, paddingTop, lineHeight);
					}
					
					// if(area) str += area.value;
				}
				container.appendChild(node);
			}
		}
		let cStyle = '';
		cStyle += `* {
			box-sizing: border-box;
			touch-action: none;
			user-select: none;
		}`;
		style.appendChild(document.createTextNode(cStyle));
		
		let s = new XMLSerializer().serializeToString(svg);
		s = s.replace(/\<br[\s]*[\/]?\>/g, '\r\n');
		const b64 = btoa(unescape(encodeURIComponent(s)));
		return 'data:image/svg+xml;base64,' + b64;
	}
	

	public async load(url: string) {
		this.clear();
		let req = await fetch(url);
		let q = await req.text();
		const doc = (new DOMParser()).parseFromString(q, 'image/svg+xml');
		let container = doc.documentElement.querySelector('.' + CLS_CONTAINER);
		if(container instanceof SVGElement) {
			this.loadByContainer(container);
		}
		this._saved = null;
		this.addHistory('first');
	}

	public loadByContainer(el: SVGElement) {
		this.setMode('select');
		el.childNodes.forEach((node) => {
			if(node instanceof SVGGElement) {
				if(node.classList.contains(CLS_STROKE)) {
					const g = this._container.appendChild(node.cloneNode(true)) as SVGGElement;  
					const path = g.firstElementChild as SVGPathElement;
					const {arrx, arry} = dutil.pathToArray(path.getAttribute('d')!);
					this._paths.push({g, path, arrx, arry});
				} else if(node.classList.contains(CLS_ITEM)) {
					let svg = node.firstElementChild as SVGSVGElement;
					const x = parseFloat(svg.getAttribute('x') ?? '0');
					const y = parseFloat(svg.getAttribute('y') ?? '0');
					const width = parseFloat(svg.getAttribute('width') ?? '0');
					const height = parseFloat(svg.getAttribute('height') ?? '0');
					const id = node.id;
					const transform = node.style.transform;
					const transformOrigin = node.style.transformOrigin;
					let item: SVGItem;
					if(node.classList.contains(CLS_ITEM_TEXT)) {
						let area = svg.querySelector('textarea')?.cloneNode(true) as HTMLTextAreaElement;
						const color = area.style.color;
						console.log(area.value, area.innerText, area.innerHTML);
						item = new SVGTextItem(this, x, y, width, height, color, area, id);
					} else {
						let img = svg.firstElementChild?.cloneNode(true) as SVGImageElement;
						item = new SVGImageItem(this, '', x, y, width, height, img, id);
					}
					this._items.push(item);
					this._container.appendChild(item.outer);	

					item.outer.style.transform = transform;
					item.outer.style.transformOrigin = transformOrigin;
					item.outer.style.pointerEvents = '';
					item.focus();
					this.setFocusItem(item);
					// drawer: SVGDrawer, url: string, x: number, y: number, width: number, height: number, img?: SVGImageElement, id?: string,
				}

			}
		});
	}


	protected _guideHandler = (x: number, y: number, width: number, height: number) => {
		if(this._mode === 'add') {
			if(this._addType === 'text') {
				let item = new SVGTextItem(this, x, y, width, height, this._brush.textColor);
				this._items.push(item);
				this._container.appendChild(item.outer);
				this.setMode('select');
				item.focus();
				this.setFocusItem(item);
				this.addHistory('add-item');
			} else if(this._addSvgImage) {
				let item = new SVGImageItem(this, this._addSvgImage, x, y, width, height);
				this._items.push(item);
				this._container.appendChild(item.outer);
				this.setMode('select');
				item.focus();
				this.setFocusItem(item);
				this.addHistory('add-item');
				this._addSvgImage = '';
			}
		}
	}

	private _saved: SVGElement|null = null;
	public addHistory(type: SVGHistoryType, checkLast?: boolean, id?: string) {
		let el = this._container.cloneNode(true) as SVGElement;
		const len = this._undos.length;
		let bAdd = true;
		

		if(!this._breakHistory && checkLast && len > 0 && this._saved) {
			const last = this._undos[len - 1];
			if(type === 'item-value' && type === last.type && last.itemID === id) {
				bAdd = false;
			} else if(type === last.type) {
				bAdd = false;
			}
		}

		if(bAdd && this._saved) {
			this._addUndo({type, container: this._saved.cloneNode(true), itemID: id});
		}
		this._saved = el;
		this._breakHistory = false;
	}

	public removeItem(item: SVGItem) {
		item.blur();
		if(this._focusItem === item) this.setFocusItem(null);
		item.destory();
		let idx = this._items.indexOf(item);
		if(idx >= 0) this._items.splice(idx, 1);

		this.addHistory('remove-item');
	}
	public setFocusItem(item: SVGItem|null) {
		if(this._focusItem) this._focusItem.blur();
		if(item instanceof SVGTextItem) this.setBrush({textColor: item.textColor});
		this._focusItem = item;
	}

	public focus() {
		if(this._focusItem instanceof SVGTextItem) this._focusItem.focus();
	}

	private _clearContainer() {
		this.setFocusItem(null);
		while(this._items.length > 0) {
			let item = this._items.pop();
			if(item) item.destory();
			else break;
		}
		this._items.length = 0;
		let children = this._container.children;
		let len = children.length;

		for(let i = len - 1; i >= 0; i--) {
			let child = children.item(i);
			if(child && child.parentElement) child.parentElement.removeChild(child);
		}
		this._paths.length = 0;
	}

	public clearContent() {
		if(this._container.children.length === 0) return;
		this._clearContainer();
		this.addHistory('first');
	}
	public clear() {
		super.clear();
		this._clearContainer();
		this._saved = null;
		this.addHistory('first');
	}
	public setBrush(brush: Partial<IBrush>) {
		if(brush.textColor && this._focusItem instanceof SVGTextItem) {
			this._focusItem.textColor = brush.textColor;
		}
		this._breakHistory = true;
		super.setBrush(brush);
	}


	public setMode(mode: Mode) {
		if(this._mode === mode) return;
		super.setMode(mode);

		this.setFocusItem(null);

		let children = this._container.children;
		let len = children.length;
		for(let i = 0; i < len; i++) {
			let el = children.item(i);
			if(el instanceof SVGElement && el.classList.contains(CLS_ITEM)) {
				el.style.pointerEvents = mode === 'select' ? '' : 'none';
			}
		}
	}
	public async setAdd(type: 'text'|'image', url?: string) {
		await super.setAdd(type, url);
		this.setFocusItem(null);
	}

}

const SVGItemClass = 'item';
type SVGItemType = 'text'|'image';
abstract class SVGItem {
	protected _drawer: SVGDrawer;
	protected _outer: SVGGElement;
	public get outer() {return this._outer;}	
	protected _svg: SVGSVGElement;
	protected _control: SVGGElement;
	protected _child: SVGElement;
	protected _type: SVGItemType;

	protected _minW = 0;
	protected _minH = 0;

	protected _bndW = 0;
	protected _bndH = 0;

	public abstract destory: () => void;
	protected _destoryAll: () => void;
	public get focused() {return this._control.style.display !== 'none';}

	protected _setWidthHeight: (w: number, h: number) => void;

	get id() {return this._outer.id;}

	constructor(drawer: SVGDrawer, child: SVGElement, type: SVGItemType, x: number, y: number, width: number, height: number, id?: string) {
		this._drawer = drawer;
		this._child = child;
		this._type = type;
		child.setAttribute('width', '100%');
		child.setAttribute('height', '100%');


		const outer = this._outer = document.createElementNS(SVG_NS,'g');
		outer.classList.add(CLS_ITEM);
		outer.classList.add(type === 'text' ? CLS_ITEM_TEXT : CLS_ITEM_IMAGE);
		outer.id = id ?? Date.now().toString(36);
		outer.style.pointerEvents = 'none';

		const svg = this._svg = outer.appendChild(document.createElementNS(SVG_NS,'svg'));
		svg.classList.add(CLS_ITEM_SVG);
		svg.classList.add(type);
		svg.style.overflow = 'visible';
		
		svg.setAttribute('x', x + '');
		svg.setAttribute('y', y + '');
		svg.setAttribute('width', width + '');
		svg.setAttribute('height', height + '');	
		svg.appendChild(child);

		const control = this._control = svg.appendChild(document.createElementNS(SVG_NS,'g'));
		control.classList.add(CLS_ITEM_CONTROL);
		control.style.display = 'none';

		let rect = control.appendChild(document.createElementNS(SVG_NS,'rect'));
		rect.setAttribute('width', '100%');
		rect.setAttribute('height', '100%');

		let line = control.appendChild(document.createElementNS(SVG_NS,'line'));
		line.setAttribute('x1', '50%');
		line.setAttribute('y1', '-50');
		line.setAttribute('x2', '50%');
		line.setAttribute('y2', '0');

		let left = x, right = x + width, top = y, bottom = y + height;
		let sL = left, sR = right, sT = top, sB = bottom;
		const fnDown = () => {
			sL = left, sR = right, sT = top, sB = bottom;
		};

		const fnCheckAddHistory = () => {
			return Math.abs(sL - left) > 1 || Math.abs(sR - right) > 1 || Math.abs(sT - top) > 1 || Math.abs(sB - bottom) > 1;
		};

		const dragger_move = new Dragger(
			child as any, 
			{preventDefault: false},
			(ev) => {
				if(drawer.mode !== 'select') {
					return false;
				} else if(!this.focused) {
					this.focus();
					drawer.setFocusItem(this);
				}
				this._controlDown();
				fnDown();
				return true;
			},
			(dx, dy, ev) => {
				if(drawer.mode !== 'select') return;
				const obj = this._controlMove(sL, sR, sT, sB, dx, dx, dy, dy);
				left = obj.left, right = obj.right, top = obj.top, bottom = obj.bottom;
			},
			(ev) => {
				this._controlUp(fnCheckAddHistory());
			},
			svg,
		);

		const radiusIcon = 6;
		const radius = 15;


		/* TOP - LEFT */
		let viewIcon = control.appendChild(document.createElementNS(SVG_NS,'circle'));
		viewIcon.classList.add('view');
		viewIcon.setAttribute('cx', '0%');
		viewIcon.setAttribute('cy', '0%');
		viewIcon.setAttribute('r', radiusIcon + '');

		let c_tl = control.appendChild(document.createElementNS(SVG_NS,'circle'));
		c_tl.classList.add('button');
		c_tl.setAttribute('cx', '0%');
		c_tl.setAttribute('cy', '0%');
		c_tl.setAttribute('r', radius + '');
		const dragger_tl = new Dragger(
			c_tl as any, 
			{preventDefault: true},
			(ev) => {
				if(drawer.mode !== 'select') return false;
				this._controlDown();
				fnDown();
				return true;
			},
			(dx, dy, ev) => {
				if(drawer.mode !== 'select') return;
				const obj = this._controlMove(sL, sR, sT, sB, dx, 0, dy, 0);
				left = obj.left, right = obj.right, top = obj.top, bottom = obj.bottom;
			},
			(ev) => {
				this._controlUp(fnCheckAddHistory());
			},
			svg,
		);

		/* TOP - CENTER */
		viewIcon = control.appendChild(document.createElementNS(SVG_NS,'circle'));
		viewIcon.classList.add('view');
		viewIcon.setAttribute('cx', '50%');
		viewIcon.setAttribute('cy', '0%');
		viewIcon.setAttribute('r', radiusIcon + '');

		let c_tc = control.appendChild(document.createElementNS(SVG_NS,'circle'));
		c_tc.classList.add('button');
		c_tc.setAttribute('cx', '50%');
		c_tc.setAttribute('cy', '0%');
		c_tc.setAttribute('r', radius + '');
		const dragger_tc = new Dragger(
			c_tc as any, 
			{preventDefault: true},
			(ev) => {
				if(drawer.mode !== 'select') return false;
				this._controlDown();
				fnDown();
				return true;
			},
			(dx, dy, ev) => {
				if(drawer.mode !== 'select') return;
				const obj = this._controlMove(sL, sR, sT, sB, 0, 0, dy, 0);
				left = obj.left, right = obj.right, top = obj.top, bottom = obj.bottom;
			},
			(ev) => {
				this._controlUp(fnCheckAddHistory());
			},
			svg,
		);

		/* Middle Left */
		viewIcon = control.appendChild(document.createElementNS(SVG_NS,'circle'));
		viewIcon.classList.add('view');
		viewIcon.setAttribute('cx', '0%');
		viewIcon.setAttribute('cy', '50%');
		viewIcon.setAttribute('r', radiusIcon + '');

		let c_ml = control.appendChild(document.createElementNS(SVG_NS,'circle'));
		c_ml.classList.add('button');
		c_ml.setAttribute('cx', '0%');
		c_ml.setAttribute('cy', '50%');
		c_ml.setAttribute('r', radius + '');
		const dragger_ml = new Dragger(
			c_ml as any, 
			{preventDefault: true},
			(ev) => {
				if(drawer.mode !== 'select') return false;
				this._controlDown();
				fnDown();
				return true;
			},
			(dx, dy, ev) => {
				if(drawer.mode !== 'select') return;
				const obj = this._controlMove(sL, sR, sT, sB, dx, 0, 0, 0);
				left = obj.left, right = obj.right, top = obj.top, bottom = obj.bottom;
			},
			(ev) => {
				this._controlUp(fnCheckAddHistory());
			},
			svg,
		);

		/* Middle Right */
		viewIcon = control.appendChild(document.createElementNS(SVG_NS,'circle'));
		viewIcon.classList.add('view');
		viewIcon.setAttribute('cx', '100%');
		viewIcon.setAttribute('cy', '50%');
		viewIcon.setAttribute('r', radiusIcon + '');

		let c_mr = control.appendChild(document.createElementNS(SVG_NS,'circle'));
		c_mr.classList.add('button');
		c_mr.setAttribute('cx', '100%');
		c_mr.setAttribute('cy', '50%');
		c_mr.setAttribute('r', radius + '');
		const dragger_mr = new Dragger(
			c_mr as any, 
			{preventDefault: true},
			(ev) => {
				if(drawer.mode !== 'select') return false;
				this._controlDown();
				fnDown();
				return true;
			},
			(dx, dy, ev) => {
				if(drawer.mode !== 'select') return;
				const obj = this._controlMove(sL, sR, sT, sB, 0, dx, 0, 0);
				left = obj.left, right = obj.right, top = obj.top, bottom = obj.bottom;
			},
			(ev) => {
				this._controlUp(fnCheckAddHistory());
			},
			svg,
		);

		/* Bottom Left */
		viewIcon = control.appendChild(document.createElementNS(SVG_NS,'circle'));
		viewIcon.classList.add('view');
		viewIcon.setAttribute('cx', '0%');
		viewIcon.setAttribute('cy', '100%');
		viewIcon.setAttribute('r', radiusIcon + '');

		let c_bl = control.appendChild(document.createElementNS(SVG_NS,'circle'));
		c_bl.classList.add('button');
		c_bl.setAttribute('cx', '0%');
		c_bl.setAttribute('cy', '100%');
		c_bl.setAttribute('r', radius + '');
		const dragger_bl = new Dragger(
			c_bl as any, 
			{preventDefault: true},
			(ev) => {
				if(drawer.mode !== 'select') return false;
				this._controlDown();
				fnDown();
				return true;
			},
			(dx, dy, ev) => {
				if(drawer.mode !== 'select') return;
				const obj = this._controlMove(sL, sR, sT, sB, dx, 0, 0, dy);
				left = obj.left, right = obj.right, top = obj.top, bottom = obj.bottom;
			},
			(ev) => {
				this._controlUp(fnCheckAddHistory());
			},
			svg,
		);
		
		/* Bottom Center */
		viewIcon = control.appendChild(document.createElementNS(SVG_NS,'circle'));
		viewIcon.classList.add('view');
		viewIcon.setAttribute('cx', '50%');
		viewIcon.setAttribute('cy', '100%');
		viewIcon.setAttribute('r', radiusIcon + '');
		let c_bc = control.appendChild(document.createElementNS(SVG_NS,'circle'));
		c_bc.classList.add('button');
		c_bc.setAttribute('cx', '50%');
		c_bc.setAttribute('cy', '100%');
		c_bc.setAttribute('r', radius + '');
		const dragger_bc = new Dragger(
			c_bc as any, 
			{preventDefault: true},
			(ev) => {
				if(drawer.mode !== 'select') return false;
				this._controlDown();
				fnDown();
				return true;
			},
			(dx, dy, ev) => {
				if(drawer.mode !== 'select') return;
				const obj = this._controlMove(sL, sR, sT, sB, 0, 0, 0, dy);
				left = obj.left, right = obj.right, top = obj.top, bottom = obj.bottom;
			},
			(ev) => {
				this._controlUp(fnCheckAddHistory());
			},
			svg,
		);

		viewIcon = control.appendChild(document.createElementNS(SVG_NS,'circle'));
		viewIcon.classList.add('view');
		viewIcon.setAttribute('cx', '100%');
		viewIcon.setAttribute('cy', '100%');
		viewIcon.setAttribute('r', radiusIcon + '');

		let c_br = control.appendChild(document.createElementNS(SVG_NS,'circle'));
		c_br.classList.add('button');
		c_br.setAttribute('cx', '100%');
		c_br.setAttribute('cy', '100%');
		c_br.setAttribute('r', radius + '');
		const dragger_br = new Dragger(
			c_br as any, 
			{preventDefault: true},
			(ev) => {
				if(drawer.mode !== 'select') return false;
				this._controlDown();
				fnDown();
				return true;
			},
			(dx, dy, ev) => {
				if(drawer.mode !== 'select') return;
				const obj = this._controlMove(sL, sR, sT, sB, 0, dx, 0, dy);
				left = obj.left, right = obj.right, top = obj.top, bottom = obj.bottom;
			},
			(ev) => {
				this._controlUp(fnCheckAddHistory());
			},
			svg,
		);

		let rotate = control.appendChild(document.createElementNS(SVG_NS, 'image'));
		rotate.setAttribute('href', ico_rotate);
		rotate.setAttribute('x', '50%');
		rotate.setAttribute('y', '-53');
		rotate.setAttribute('transform', 'translate(-16.5 0)');	

		let sX = 0, sY = 0;
		let deg = 0, prevDeg = 0;
		let center = {x: 0, y: 0};
		let global = new DOMMatrix();
		const dragger_rotate = new Dragger(
			rotate as any, 
			{preventDefault: true},
			(ev) => {
				if(drawer.mode !== 'select') return false;

				global = geom.getElementMatrix(drawer.svg);		
				global.invertSelf(); 
				
				const localPt = global.transformPoint({x: ev.clientX, y: ev.clientY});
				sX = localPt.x;
				sY = localPt.y;
				let prevX = center.x;
				let prevY = center.y;
				center.x = (left + right) / 2;
				center.y = (top + bottom) / 2;

				outer.style.transformOrigin = `${center.x}px ${center.y}px`;

				prevDeg = deg;
				fnDown();
				return true;
			},
			(dx, dy, ev) => {
				if(drawer.mode !== 'select') return;
				
				const mpt = global.transformPoint({x: ev.clientX, y: ev.clientY});
				deg = geom.getAngle(mpt, center);
				outer.style.transform = `rotate(${Math.round(deg)}deg)`;
			},
			(ev) => {
				this._controlUp(Math.abs(deg - prevDeg) > 1);
			},
			svg,
		);

		let close = control.appendChild(document.createElementNS(SVG_NS, 'image'));
		close.setAttribute('href', ico_close);
		close.setAttribute('x', '100%');
		close.setAttribute('y', '0%');
		close.setAttribute('transform', 'translate(-16 -16)');
		close.onclick = () => {
			drawer.removeItem(this);
		};
		
		this._setWidthHeight = (w, h) => {
			right = left + w;
			width = w;

			bottom = top + h;
			height = h;
		};
		this._destoryAll = () => {
			dragger_move.unload();
			dragger_tl.unload();
			dragger_tc.unload();
			dragger_ml.unload();
			dragger_mr.unload();
			dragger_bl.unload();
			dragger_bc.unload();
			dragger_br.unload();
			close.onclick = null;
			if(outer.parentElement) outer.parentElement.removeChild(outer);
		};
	}
	protected _controlDown() {
		this._bndW = this._drawer.svg.width.baseVal.value;
		this._bndH = this._drawer.svg.height.baseVal.value;
	}
	protected _controlMove(
		sL: number, sR: number, sT: number, sB: number, 
		dL: number, dR: number, dT: number, dB: number, 
	) {
		let left = sL + dL, right = sR + dR,
					top = sT + dT, bottom = sB + dB;

		if(left < 0) left = 0;
		else if(right > this._bndW) right = this._bndW;
		if(top < 0) top = 0;
		else if(bottom > this._bndH) bottom = this._bndH;

		let width = right - left, height = bottom - top;

		if(width < this._minW) width = this._minW;
		if(height < this._minH) height = this._minH;

		if(dL !== 0) left = right - width;
		else if(dR !== 0) right = left + width;

		if(dT !== 0) top = bottom - height;
		else if(dB !== 0) bottom = top + height;

		this._svg.setAttribute('x', left + '');
		this._svg.setAttribute('y', top + '');
		this._svg.setAttribute('width', (right - left) + '');
		this._svg.setAttribute('height', (bottom - top) + '');
		console.log({left, right, top, bottom});
		return {left, right, top, bottom};
	}
	protected _controlUp(addHistory: boolean) {
		if(addHistory) this._drawer.addHistory('item-value', true, this.id);
	}

	public focus() {
		this._control.style.display = '';
	}
	public blur() {
		this._control.style.display = 'none';
	}
}
class SVGTextItem extends SVGItem {
	private _textarea: HTMLTextAreaElement;

	private _textColor: string;
	set textColor(color: string) {
		this._textColor = color;
		this._textarea.style.color = color;

		this._drawer.addHistory('item-value', true, this.id);
	}
	get textColor() {return this._textColor;}
	public destory: () => void;
	
	constructor(drawer: SVGDrawer, x: number, y: number, width: number, height: number, color: string, area?: HTMLTextAreaElement, id?: string) {
		const foreign = document.createElementNS(SVG_NS,'foreignObject');  
		foreign.style.position = 'relative';
		foreign.style.width = '100%';
		foreign.style.height = '100%';

		const textarea = area ?? document.createElement('textarea');
		foreign.appendChild(textarea);

		textarea.style.width = width + 'px';
		textarea.style.height = height + 'px';
		textarea.style.resize = 'none';
		textarea.style.border = '0 none';
		textarea.style.outline = '0 none';
		textarea.style.padding = '10px';
		textarea.style.overflow = 'hidden';
		textarea.style.fontSize = '24px';
		textarea.style.lineHeight = '40px';
		textarea.style.fontFamily = FONT_FAMILY;
		textarea.style.color = color;
		textarea.style.backgroundColor = 'transparent';
		textarea.style.whiteSpace = 'nowrap';
		textarea.style.pointerEvents = 'none';
		textarea.autocomplete = 'off';
		textarea.autocapitalize = 'off';
		textarea.spellcheck = false;

		super(drawer, foreign, 'text', x, y, width, height, id);
		this._textarea = textarea;
		this._textColor = color;
		let tvalue = textarea.value;
		textarea.innerHTML = '';
		textarea.value = tvalue;

		textarea.onchange = textarea.onkeydown = textarea.onkeyup = textarea.onpaste = () => {
			let w = textarea.scrollWidth;
			let h = textarea.scrollHeight;
			this._svg.setAttribute('width',  w + '');
			this._svg.setAttribute('height',  h + '');
			textarea.style.width =  w + 'px';
			textarea.style.height =  h + 'px';
			textarea.scrollLeft = 0;
			textarea.scrollTop = 0;
			this._setWidthHeight(w, h);
			if(tvalue !== textarea.value) this._drawer.addHistory('item-value', true, this.id);
		};
		textarea.onblur = () => {
			this._drawer.emit('on-blur');
		}
		textarea.onfocus = () => {
			this._drawer.emit('on-focus');
		}
		this.destory = () => {
			this._destoryAll();
		};
	}
	
	protected _controlDown() {
		super._controlDown();
		this._minW = 100;
		this._minH = 50;
	}

	protected _controlMove(
		sL: number, sR: number, sT: number, sB: number, 
		dL: number, dR: number, dT: number, dB: number, 
	) {
		let left = sL + dL, right = sR + dR,
					top = sT + dT, bottom = sB + dB;

		if(left < 0) left = 0;
		else if(right > this._bndW) right = this._bndW;
		if(top < 0) top = 0;
		else if(bottom > this._bndH) bottom = this._bndH;

		let width = right - left, height = bottom - top;

		if(width < this._minW) width = this._minW;
		if(height < this._minH) height = this._minH;

		this._svg.setAttribute('width', width + '');
		this._textarea.style.width = width + 'px';
		this._textarea.style.height = height + 'px';
		if(width < this._textarea.scrollWidth) width = this._textarea.scrollWidth;
		if(height < this._textarea.scrollHeight) height = this._textarea.scrollHeight;


		if(dL !== 0) left = right - width;
		else if(dR !== 0) right = left + width;

		if(dT !== 0) top = bottom - height;
		else if(dB !== 0) bottom = top + height;

		this._svg.setAttribute('x', left + '');
		this._svg.setAttribute('y', top + '');
		this._svg.setAttribute('width', (right - left) + '');
		this._svg.setAttribute('height',  (bottom - top) + '');
		this._textarea.style.width =  (right - left) + 'px';
		this._textarea.style.height =  (bottom - top) + 'px';
		return {left, right, top, bottom};
	}
	protected _controlUp(addHistory: boolean) {
		super._controlUp(addHistory);
		this._textarea.focus();
	}

	public focus() {
		super.focus();
		this._textarea.style.pointerEvents = '';
		this._textarea.focus();
	}
	public blur() {
		super.blur();
		this._textarea.style.pointerEvents = 'none';
		this._textarea.blur();
	}
}
class SVGImageItem extends SVGItem {
	public destory: () => void;
	constructor(drawer: SVGDrawer, url: string, x: number, y: number, width: number, height: number, img?: SVGImageElement, id?: string) {
		let image: SVGImageElement;
		if(img) image = img;
		else {
			image = document.createElementNS(SVG_NS, 'image');
			image.setAttribute('href', url);
		}
		image.setAttribute('width', '100%');
		image.setAttribute('height', '100%');
		image.setAttribute('preserveAspectRatio', 'none');
		super(drawer, image, 'image', x, y, width, height, id);
		this.destory = () => {
			this._destoryAll();
		};
	}

	protected _controlDown() {
		super._controlDown();
		this._minW = 30;
		this._minH = 30;
	}
}


export function getSVGDrawer(el: HTMLElement) {
	return new SVGDrawer({
		el,
		type: 'svg',
	});
}

export { SVGDrawer, Drawer, IBrush, IAdded, IOption, SVG_NS, Mode, CLS_CONTAINER, CLS_STROKE };
// tslint:disable-next-line:no-string-literal
window['getSVGDrawer'] = getSVGDrawer;
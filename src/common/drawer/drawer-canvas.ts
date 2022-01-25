import { Drawer, IBrush, IAdded, IOption } from './drawer';
import * as dutil from './drawer-util';

export class CanvasDrawer extends Drawer {
	private _canvas: HTMLCanvasElement;
	get canvas() { return this._canvas; }
	private _initedSize = false;
	protected _downHandler: (mx: number, my: number, ev: PointerEvent) => boolean;
	protected _moveHandler: (mx: number, my: number, ev: PointerEvent) => boolean;
	protected _upHandler: (added: IAdded, ) => boolean;
	protected _guideHandler: (x: number, y: number, width: number, height: number) => void;
	protected _eraseHandler: (px: number, py: number, mx: number, my: number) => void;

	protected _undos: ImageData[] = [];
	protected _redos: ImageData[] = [];
	public undo: () => void;
	public redo: () => void;

	get color() { return this._brush.stroke; }
	set color(color: string) {this.setBrush({stroke: color});}


	constructor(option: IOption) {
		super(option);

		const canvas = this._canvas = document.createElement('canvas');
		const hidpi = canvas.getAttribute('hidpi');

		let deviceRatio = 0;
		if (hidpi && !/^off|false$/.test(hidpi)) {
			deviceRatio = window.devicePixelRatio || 1;
		}

		canvas.style.position = 'absolute';
		canvas.style.top = '0px';
		canvas.style.left = '0px';
		canvas.style.zIndex = '-1';
		canvas.style.pointerEvents = 'none';
		option.el.appendChild(canvas);

		const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
		if(ctx && deviceRatio > 0) {
			const backingStoreRatio = ctx['webkitBackingStorePixelRatio'] || ctx['backingStorePixelRatio'] || 1; // tslint:disable-line
			const scale = deviceRatio / backingStoreRatio;
			ctx.scale(scale, scale);				
		}		

		if(option.size && option.size.width > 0 && option.size.height > 0) {
			this._initedSize = true;
			canvas.width = Math.floor(option.size.width);
			canvas.height = Math.floor(option.size.height);
		}
		option.el.appendChild(canvas);

		let imgdata: ImageData|null = null;

		this._downHandler = (mx, my, ev) => {
			if(!this._initedSize) {
				this._initedSize = true;
				canvas.width = Math.floor(option.el.offsetWidth);
				canvas.height = Math.floor(option.el.offsetHeight);
			}

			imgdata = ctx.getImageData(0, 0, canvas.width, canvas.height);
			if(this._mode === 'eraser') {
				ctx.beginPath();
				ctx.globalCompositeOperation = 'destination-out';
				ctx.lineWidth = this._brush.strokeWidth * 4;
				ctx.lineCap = 'round';
				ctx.lineJoin = 'round';
				ctx.strokeStyle = '#000';
				ctx.fillStyle = 'transparent';
				ctx.moveTo(mx, my);
			}
			return true;
		};
		this._moveHandler = (mx: number, my: number, ev: PointerEvent) => {
			if(this._mode === 'eraser') {
				ctx.lineTo(mx, my);
				ctx.stroke();
			}
			return true;
		};
		this._upHandler = (added,) => {
			
			if(this._mode === 'eraser') {
				ctx.closePath();
				if(imgdata) this._addUndo(imgdata);
				imgdata = null;
				return false;
			}
			ctx.beginPath();
			ctx.globalCompositeOperation = 'source-over';
			ctx.lineWidth = this._brush.strokeWidth;
			ctx.lineCap = this._mode === 'pen' ? 'round' : 'butt';
			ctx.lineJoin = 'round';
			ctx.strokeStyle = dutil.hexToRgba(this._brush.stroke, this._brush.strokeOpacity);
			ctx.fillStyle = 'transparent';
			
			dutil.drawCanvas(ctx, dutil.simplify(added.arrx, added.arry));

			ctx.stroke();
			ctx.closePath();
			this._container.removeChild(added.g);
			if(imgdata) this._addUndo(imgdata);
			imgdata = null;
			return true;
		};
		this._guideHandler = (x, y, width, height) => {
			if(this._mode === 'eraser-area') {
				ctx.clearRect(x, y, width, height);
				if(imgdata) this._addUndo(imgdata);
				imgdata = null;
			}
		};

		this.undo = () => {
			let data = this._undos.pop();
			if(!data) return;
			this._redos.push(data);
			ctx.putImageData(data, 0, 0);
			this.emit('change-history');
		};
		this.redo = () => {
			let data = this._redos.pop();
			if(!data) return;
			this._undos.push(data);
			ctx.putImageData(data, 0, 0);
			this.emit('change-history');
		};

		this._eraseHandler = (px: number, py: number, mx: number, my: number) => {
			//
		};
	}
	public getBase64Data() {
		return this._canvas.toDataURL('image/png');
	}
	private _clearContent() {
		let ctx = this._canvas.getContext('2d');
		if(ctx) {
			ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
		}	
	}
	public clearContent() {
		const canvas = this._canvas;
		let ctx = canvas.getContext('2d');
		if(ctx) {
			const imgdata = ctx.getImageData(0, 0, canvas.width, canvas.height);
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			if(imgdata) this._addUndo(imgdata);
		}	

	}
	public clear() {
		this._clearContent();
		super.clear();
	}
}

export function getCanvasDrawer(el: HTMLElement) {
	return new CanvasDrawer({
		el,
		type: 'canvas',
		undoLen: 100,
	});
}

export { Drawer, IBrush, IAdded, IOption };

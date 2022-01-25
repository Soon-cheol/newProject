import * as React from 'react';


export const _pToC = (cX: number, cY: number, r: number, deg: number) => {
	let rad = (deg - 90) * Math.PI / 180.0;
	return {
		x: cX + (r * Math.cos(rad)),
		y: cY + (r * Math.sin(rad))
	};
};
export const _cToP = (cX: number, cY: number, r: number, deg: number) => {
	return {
		x: cX + (r * Math.cos(deg)),
		y: cY + (r * Math.sin(deg))
	};
};
export const _dArc = (cX: number, cY: number, r: number, sdeg: number, edeg: number, inset: number) => {
	let coord = {
		d : '',
		p : {
			x: 0,
			y: 0 
		}
	};
	r -= inset / 2;
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
};
interface IProgressCircle {
	watch: {progress: number, text: string,} | null;
	paint: {arcWH: number, d: string, px: number, py: number, r: number, fill: string, fillsize?: number, lineCarving?: boolean; strokeWidth?: number} | null;
	// max 를 99로 계산되게 해주세요. 100일경우 계산이 정확하게 나오지 않습니다
	percent?: number;
	zeropoint?: boolean;
}
export class ProgressCircle extends React.Component<IProgressCircle, {d: string, px: number, py: number}
> {
	constructor(props: any) {
		super(props);
		this.state = {
			d: '',
			px: 0,
			py: 0
		};
	}
	public _drawArc = (percent?: number) => {
		// console.log('percent', this.props.percent);
		if(percent !== undefined && this.props.paint !== null) {
			// console.log('_drawArc');
			const _arcR = this.props.paint.arcWH / 2;
			const _arcC = this.props.paint.arcWH / 2;
			let angle = percent / 100;
			angle = angle * 360;
			let coord;
			coord = _dArc(_arcC, _arcC, _arcR, 0, angle , this.props.paint.strokeWidth ? this.props.paint.strokeWidth : 0);
			this.setState({
				d: coord.d,
				px: coord.p.x,
				py: coord.p.y,
			});
		}
	}
	public componentWillReceiveProps(next: IProgressCircle) {
		if(
			next.paint !== null &&
			(this.state.d !== next.paint.d || this.state.py !== next.paint.py || this.state.px !== next.paint.px)
		) {
			this.setState({
				d: next.paint.d,
				px: next.paint.px,
				py: next.paint.py,
			});
			this._drawArc(next.percent);
		}
		if(this.props.percent !== next.percent) {
			// console.log('next.percent', next.percent);
			this._drawArc(next.percent);
		}
	}
	public componentDidMount() {
		if(
			this.props.paint !== null
		) {
			this.setState({
				d: this.props.paint.d,
				px: this.props.paint.px,
				py: this.props.paint.py,
			});
			this._drawArc(this.props.percent);
		}
	}
	public render() {
		if(this.props.paint !== null) {
			const {arcWH, d, px, py, r, fill, fillsize} = this.props.paint;
			const fillitem = (() => {
				if(fill.length > 10) {
					return 'url(#pattern)';
				} else {
					return fill;
				}
			})();
			return (
				<>
					<svg id="findsvg" style={{overflow: 'visible'}} width={arcWH} height={arcWH} viewBox={'0 0 ' + arcWH + ' ' + arcWH}>
						<path 
							strokeLinecap={this.props.paint.lineCarving ? 'butt' : 'round'}
							strokeWidth={this.props.paint.strokeWidth ? this.props.paint.strokeWidth : 5}
							stroke={fillitem}
							fill="none"
							d={this.state.d + ''} 
						/>
						<circle className="circle" cx={this.state.px === 0 ? (arcWH / 2) : this.state.px} cy={this.state.py} r={r} fill={fillitem} />
						{this.props.zeropoint ? <circle className="circle" cx={(arcWH / 2)} cy={1} r={r} fill={fillitem} /> : ''}
						<pattern id="pattern" patternUnits="userSpaceOnUse" x={0 - (r)} y={0 - (r)} width={fillsize ? fillsize + (r * 2) : 100} height={fillsize ? fillsize + (r * 2) : 100}>
							<image xlinkHref={this.props.paint.fill} x={0} y={0} width={fillsize ? fillsize + (r * 2) : 100} height={fillsize ? fillsize + (r * 2) : 100} />
						</pattern>
					</svg>
					{this.props.children ? this.props.children : ''}
				</>
			);
		} else if(this.props.watch !== null) {
			return (
				<>
					<div className="circle">
						<div className={"progress-circle progress-" + this.props.watch.progress} />
						<div className="m_text">{this.props.watch.text}</div>
					</div>
					{this.props.children ? this.props.children : ''}
				</>
			);
		}
		return <></>;
	}
}
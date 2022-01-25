const EPSILON = 10e-6;
const TOLERANCE = 10e-3;

interface Point {
	x: number;
	y: number;
	control?: [Point, Point];
}

function pointNomalize(pt: Point, scale: number = 1.0) {
	const norm = Math.sqrt(pt.x * pt.x + pt.y * pt.y);
	const ret = {x: pt.x, y: pt.y};
	if (norm !== 0) { // as3 return 0,0 for a point of zero length
		ret.x = scale * pt.x / norm;
		ret.y = scale * pt.y / norm;
	}
	return ret;
}
function pointSubtract(pt1: Point, pt2: Point) {
	return {x: pt1.x - pt2.x, y: pt1.y - pt2.y};
}
function pointAdd(pt1: Point, pt2: Point) {
	return {x: pt1.x + pt2.x, y: pt1.y + pt2.y};
}
function pointDistance(pt1: Point, pt2: Point) {
	let dx = pt1.x - pt2.x, dy = pt1.y - pt2.y;
	return Math.sqrt(dx * dx + dy * dy);
}
function pointDot(pt1: Point, pt2: Point) {
	return pt1.x * pt2.x + pt1.y * pt2.y;
}
function pointNegate(pt: Point) {
	return {x: -1 * pt.x, y: -1 * pt.y};
}
function pointMulti(pt: Point, scale: number) {
	return {x: pt.x * scale, y: pt.y * scale};
}
function pointDivide(pt: Point, scale: number) {
	return {x: pt.x / scale, y: pt.y / scale};
}
function evaluate(degree: number, curve: Point[], t: number) {
	const tmp: Point[] = curve.slice();
	for (let i = 1; i <= degree; i++) {
		for (let j = 0; j <= degree - i; j++) {
			tmp[j] = pointAdd(pointMulti(tmp[j], 1 - t),pointMulti(tmp[j + 1],t));
		}
	}
	return tmp[0];
}
function findRoot(curve: [Point, Point, Point, Point], point: Point, u: number) {
	const	curve1: Point[] = [],
				curve2: Point[] = [];

	for(let i = 0; i <= 2; i++) {
		curve1.push(pointMulti(pointSubtract(curve[i + 1], curve[i]), 3));
	}
	for(let i = 0; i <= 1; i++) {
		curve2.push(pointMulti(pointSubtract(curve1[i + 1], curve1[i]), 2));
	}
	const pt = evaluate(3, curve, u);
	const pt1 = evaluate(2, curve1, u);
	const pt2 = evaluate(1, curve2, u);
	const diff = pointSubtract(pt, point);
	const df = pointDot(pt1, pt1) + pointDot(diff, pt2);
	if (Math.abs(df) < TOLERANCE) return u;
	return u - pointDot(diff, pt1) / df;
}

function fixNumber(n: number, len: number = 1) {return Math.round(n * (10 ** len)) / (10 ** len);}

export function simplify(arrx: number[], arry: number[], tolerance: number = 10) {
	let pts: Point[] = [];
	arrx.forEach((x, idx) => {
		pts[idx] = {x, y: arry[idx]};
	});

	const len = pts.length;
	if(len < 4) return pts;

	const pts_fit: Point[] = [];

	const addFitCurve = (curve: [Point, Point, Point, Point]	, index: number) => {
		pts_fit.push({
			x: curve[3].x,
			y: curve[3].y,
			control: [
				curve[1],
				curve[2],
			]
		});
	};
	
	const chordLengthParameterize = (first: number, last: number) => {
		let ret: number[] = [];
		ret.push(0);
		for(let i = first + 1; i <= last; i++) {
			ret.push(ret[i - first - 1] + pointDistance(pts[i], pts[i - 1]));
		}
		const m = last - first;
		for(let i = 1;i <= m; i++) {
			ret[i] = ret[i] / ret[m];
		}
		return ret;
	};
	const generateBezier = (first: number, last: number, uPrime: number[], tan1: Point, tan2: Point) => {
		let epsilon = EPSILON;
		const pt1 = pts[first];
		const pt2 = pts[last];
		
		const C = [[0, 0], [0, 0]];
		const X = [0, 0];
		
		for(let i = 0; i < last - first + 1; i++) {
			const	u = uPrime[i],
						t = 1 - u,
						b = 3 * u * t,
						b0 = Math.pow(t, 3),
						b1 = b * t,
						b2 = b * u,
						b3 = Math.pow(u, 3),
						a1 = pointNomalize(tan1, b1),
						a2 = pointNomalize(tan2, b2);
		
			const tmp = pointSubtract(pointSubtract(pts[first + i], pointMulti(pt1, b0 + b1)), pointMulti(pt2,b2 + b3));

			C[0][0] = C[0][0] + pointDot(a1, a1);
			C[0][1] = C[0][1] + pointDot(a1, a2);
			C[1][0] = C[0][1];
			C[1][1] = C[1][1] + pointDot(a2, a2);
			X[0] = X[0] + pointDot(a1, tmp);
			X[1] = X[1] + pointDot(a2, tmp);
		}

		const detC0C1 = C[0][0] * C[1][1] - C[1][0] * C[0][1];
		let alpha1, alpha2;
		if(Math.abs(detC0C1) > epsilon) {
			alpha1 = (X[0]    * C[1][1] - X[1]    * C[0][1]) / detC0C1;
			alpha2 = (C[0][0] * X[1]    - C[1][0] * X[0]   ) / detC0C1;
		} else {
			const c0 = C[0][0] + C[0][1],
						c1 = C[1][0] + C[1][1];
			if (Math.abs(c0) > epsilon) {
				alpha1 = X[0] / c0;
				alpha2 = alpha1;
			} else if (Math.abs(c1) > epsilon) {
				alpha1 = X[1] / c1;
				alpha2 = alpha1;
			} else {
				alpha1 = 0;
				alpha2 = 0;
			}
		}
		
		const segLength = pointDistance(pt1, pt2);
		epsilon = epsilon * segLength;
		if (alpha1 < epsilon || alpha2 < epsilon) {
			alpha1 = segLength / 3;
			alpha2 = alpha1;
		}
		const tmp1 = pointNomalize(tan1, alpha1);
		const tmp2 = pointNomalize(tan2, alpha2);
		const ret: [Point, Point, Point, Point] = [
			pt1,
			pointAdd(pt1, tmp1),
			pointAdd(pt2, tmp2),
			pt2,
		];
		return ret;
	};
	const findMaxError = (first: number, last: number, curve: [Point, Point, Point, Point], u: number[]) => {
		let index = Math.floor((last - first + 1) / 2);
		let maxDist = 0;
		for (let i = first + 1; i < last;i++) {
			const P = evaluate(3, curve, u[i - first]);
			const v = pointSubtract(P, pts[i]);
			const dist = v.x * v.x + v.y * v.y; 
			if (dist >= maxDist) {
				maxDist = dist;
				index = i;
			}
		}
		return {
			error: maxDist,
			index,
		};
	};

	const reparameterize = (first: number, last: number, u: number[], curve:  [Point, Point, Point, Point]) => {
		for (let i = first; i <= last; i++) {
			u[i - first] = findRoot(curve, pts[i], u[i - first]);
		}
	};


	function fitCubic(first: number, last: number, tan1: Point, tan2: Point) {
		let curve: [Point, Point, Point, Point]|null = null;
		if (last - first === 1) {
			const pt1 = pts[first];
			const pt2 = pts[last];
			const dist = pointDistance(pt1,pt2) / 3;
			curve = [
				pt1,
				pointAdd(pt1, pointNomalize(tan1, dist)),
				pointAdd(pt2, pointNomalize(tan2, dist)),
				pt2
			];
			addFitCurve(curve, last);
			return;
		}
		const uPrime = chordLengthParameterize(first, last);
		let maxTolerance = Math.max(tolerance, tolerance * tolerance);
		let split = 0;
		for(let i = 0;i <= 4; i++) {
			curve = generateBezier(first, last, uPrime, tan1, tan2);
			
			const max = findMaxError(first, last, curve, uPrime);
			if(max.error < tolerance) {
				addFitCurve(curve, max.index);
				return;				
			}
			split = max.index;
			if(max.error >= maxTolerance) break;	
			reparameterize(first, last, uPrime, curve);
			maxTolerance = max.error;
		}
		
		const V1 = pointSubtract(pts[split - 1], pts[split]);
		const V2 = pointSubtract(pts[split], pts[split + 1]);
		const tanCenter = pointNomalize(pointDivide(pointAdd(V1, V2), 2));
		fitCubic(first, split, tan1, tanCenter);
		fitCubic(split, last, pointNegate(tanCenter), tan2);
	}

	pts_fit.push(pts[0]);
	fitCubic(0, len - 1, 
		pointNomalize(pointSubtract(pts[1], pts[0]), 1), 
		pointNomalize(pointSubtract(pts[len - 2], pts[len - 1]), 1)
	);
	return pts_fit;
}

export function toSVGPath(pts: Point[]) {
	let prev = {x: 0, y: 0};
	let ret;
	let arr = pts.map((pt, idx) => {
		if(idx === 0) {
			ret = `M${fixNumber(pt.x)} ${fixNumber(pt.y)}`;
			prev.x = pt.x, prev.y = pt.y;
		} else if(pt.control) {
			let c1 = pointSubtract(pt.control[0], prev);
			let c2 = pointSubtract(pt.control[1], prev);

			ret = `c${fixNumber(c1.x)} ${fixNumber(c1.y)},${fixNumber(c2.x)} ${fixNumber(c2.y)},${fixNumber(pt.x - prev.x)} ${fixNumber(pt.y - prev.y)}`; 
			prev.x = pt.x, prev.y = pt.y;
		} else {
			
			ret = `l${fixNumber(pt.x - prev.x)} ${fixNumber(pt.y - prev.y)}`;
			prev.x = pt.x, prev.y = pt.y;
		}
		return ret;
	});
	return arr.join('');
}

export function arrayToSVGPath(arrx: number[], arry: number[]) {
	let ret;
	let px = 0, py = 0;
	let arr = arrx.map((x, idx) => {
		const y = arry[idx];

		if(idx === 0) {
			ret = `M${fixNumber(x)} ${fixNumber(y)}`;
		} else {
			ret = `l${fixNumber(x - px)} ${fixNumber(y - py)}`;
		}
		px = x, py = y;
		return ret;
	});
	return arr.join('');
}

export function pathToArray(path: string) {
	const arr = path.split(/[lM]/);

	arr.shift();
	let sX = 0, sY = 0;
	let arrx: number[] = [], arry: number[] = [];
	arr.forEach((s, idx) => {
		let arr1 = s.split(/\s/);
		sX = arrx[idx] = parseInt(arr1[0], 10) + sX;
		sY = arry[idx] = parseInt(arr1[1], 10) + sY;
		
	});
	return {arrx, arry};

	// console.log(commands);
}

export function drawCanvas(ctx: CanvasRenderingContext2D, pts: Point[]) {
	let arr = pts.forEach((pt, idx) => {
		if(idx === 0) {
			ctx.moveTo(pt.x, pt.y);
		} else if(pt.control) {
			let c1 = pt.control[0];
			let c2 = pt.control[1];
			ctx.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, pt.x, pt.y);
		} else {
			ctx.lineTo(pt.x, pt.y);
		}
	});
}

export function intersectPath(arrx: number[], arry: number[], x1: number, y1: number, x2: number, y2: number) {
	let len = arrx.length;

	for(let i = 0; i < len - 1; i++) {
		let ok = intersects(
			arrx[i], arry[i], arrx[i + 1], arry[i + 1],
			x1, y1, x2, y2
		);
		if(ok) return true;
	}
	return false;
}


/*
	2라인 (a, b) => (c, d),   (p, q) => (r, s)  이 교차하는지
*/
export function intersects(a: number,b: number,c: number,d: number,p: number, q: number,r: number,s: number) {
  let det, gamma, lambda;
  det = (c - a) * (s - q) - (r - p) * (d - b);
  if (det === 0) {
    return false;
  } else {
    lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
    gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
    return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
  }
}


const removeHash = (hex: string) => (hex.charAt(0) === '#' ? hex.slice(1) : hex);

const parseHex = (nakedHex: string) => {
  const isShort = (
    nakedHex.length === 3
    || nakedHex.length === 4
  );

  const twoDigitHexR = isShort ? `${nakedHex.slice(0, 1)}${nakedHex.slice(0, 1)}` : nakedHex.slice(0, 2);
  const twoDigitHexG = isShort ? `${nakedHex.slice(1, 2)}${nakedHex.slice(1, 2)}` : nakedHex.slice(2, 4);
  const twoDigitHexB = isShort ? `${nakedHex.slice(2, 3)}${nakedHex.slice(2, 3)}` : nakedHex.slice(4, 6);
  const twoDigitHexA = ((isShort ? `${nakedHex.slice(3, 4)}${nakedHex.slice(3, 4)}` : nakedHex.slice(6, 8)) || 'ff');

  // const numericA = +((parseInt(a, 16) / 255).toFixed(2));

  return {
    r: twoDigitHexR,
    g: twoDigitHexG,
    b: twoDigitHexB,
    a: twoDigitHexA,
  };
};

const hexToDecimal = (hex: string) => parseInt(hex, 16);

const hexesToDecimals = (o: {
  r: string, g: string, b: string, a: string,
}) => ({
  r: hexToDecimal(o.r),
  g: hexToDecimal(o.g),
  b: hexToDecimal(o.b),
  a: +((hexToDecimal(o.a) / 255).toFixed(2)),
});

const isNumeric = (n: number) => !isNaN(n) && isFinite(n); // eslint-disable-line no-restricted-globals, max-len

const formatRgb = (
		decimalObject: {r: number, g: number, b: number, a: number,}, 
		parameterA: number
) => {
  const {
    r, g, b, a: parsedA,
  } = decimalObject;
  const a = isNumeric(parameterA) ? parameterA : parsedA;

  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

/**
 * Turns an old-fashioned css hex color value into a rgb color value.
 *
 * If you specify an alpha value, you'll get a rgba() value instead.
 *
 * @param The hex value to convert. ('123456'. '#123456', ''123', '#123')
 * @param An alpha value to apply. (optional) ('0.5', '0.25')
 * @return An rgb or rgba value. ('rgb(11, 22, 33)'. 'rgba(11, 22, 33, 0.5)')
 */
export const hexToRgba = (hex: string, a: number) => {
  const hashlessHex = removeHash(hex);
  const hexObject = parseHex(hashlessHex);
  const decimalObject = hexesToDecimals(hexObject);

  return formatRgb(decimalObject, a);
};

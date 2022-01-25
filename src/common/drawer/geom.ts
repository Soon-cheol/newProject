export function getAngle(pt: {x: number, y: number}, ct: {x: number, y: number}) {
	const dx = pt.x - ct.x;
	const dy = pt.y - ct.y;
	if(dx === 0) {
		if(dy >= 0) return 180;
		else return 0;
	} else if(dy === 0) {
		if(dx >= 0) return 90;
		else return -90;
	} else if(dx > 0 && dy > 0) return 90 + (180 / Math.PI) * Math.atan(dy / dx);
	else if(dx > 0 && dy < 0) return 90 - (180 / Math.PI) * Math.atan(-dy / dx);
	else if(dx < 0 && dy > 0) return -90 -  (180 / Math.PI) * Math.atan( -dy / dx);
	else if(dx < 0 && dy < 0) return -90 + (180 / Math.PI) * Math.atan(dy / dx);
	return 0;
}
export function getElementMatrix(el: HTMLElement|SVGGElement|SVGSVGElement) {
	if(el instanceof SVGGElement || el instanceof SVGSVGElement) {
		const m = new DOMMatrix();
		const sm = el.getScreenCTM();
		if(sm) {
			m.a = sm.a;
			m.b = sm.b;
			m.c = sm.c;
			m.d = sm.d;
			m.e = sm.e;
			m.f = sm.f;
		}
		return m;
		// return matrixNormalize(el.getScreenCTM() as DOMMatrix);
	}
	const elements: HTMLElement[] = [];											// body 에서 스크롤 element까지
	let element: HTMLElement|null = el;
	while(element) {
		elements.unshift(element);
		element = element.offsetParent as HTMLElement|null;
	}
	let stop = window.scrollY;
	let sleft = window.scrollX;
	const matr = new DOMMatrix();
	for(let i = 0; i < elements.length; i++) {
		element = elements[i];
		matr.translateSelf(element.offsetLeft - sleft, element.offsetTop - stop);  // element 좌상으로 좌표 중심 이동
		const s = window.getComputedStyle(element);
		
		if(s.transform && s.transform.startsWith('matrix(')) {
			let matrEL: DOMMatrix|null = null;
			try {matrEL = new DOMMatrix(s.transform);} catch(e) {matrEL = null;}
			if(matrEL && !matrEL.isIdentity) {
				/* 회전,확대 중심으로 좌표이동 */
				let arr = s.transformOrigin.split(' ');
				let orgx = parseFloat(arr[0]);
				let orgy = parseFloat(arr[1]);
				if(isNaN(orgx)) orgx = 0;
				if(isNaN(orgy)) orgy = 0;
				
				/*회전 확대 중심으로 좌표 이동*/
				matr.translateSelf(orgx, orgy);

				matr.multiplySelf(matrEL).translateSelf(-orgx, -orgy);
			}
		}
		stop = element.scrollTop;
		sleft = element.scrollLeft;
	}

	return matr;
}

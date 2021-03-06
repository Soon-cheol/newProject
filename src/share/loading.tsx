import * as React from 'react';
const Loading = ({ view }: {view: boolean}) => {
	// const style: React.CSSProperties = {};
	// style.position = 'absolute';
	// style.left = '0px';
	// style.top = '0px';
	// style.width = '100%';
	// style.height = '100%';
	// style.backgroundPosition = '50% 50%';
	// style.backgroundRepeat = 'no-repeat';
	// style.backgroundImage = `url("${_math_lib_}images/loading.svg")`;
	// style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
	// style.zIndex = 101;
	// if(!view) {
	// 	style.visibility = 'hidden';
	// 	style.zIndex = -1;
	// 	style.pointerEvents = 'none';
	// }
	

	// return (
	// 	<div style={style} />
	// );
	return (
		<div className={'loading ' + (view ? '' : 'hide' )}>
			<div className="loading_bg"/>
			<div className="loading_img">
				<span className="img"/>
				Loading
			</div>
		</div>
	);
};

export { Loading };
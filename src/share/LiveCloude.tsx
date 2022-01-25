import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { observable, action } from 'mobx';
import { Observer, observer } from 'mobx-react';
import * as _ from 'lodash';

interface ILiveCloude {
    view: boolean;
    delay: number;
    onComplete: () => void;
}

@observer
export class LiveCloude extends React.Component<ILiveCloude> {
	// 210219 숫자오름기능 추가
	@observable private _startTimestamp: number|null = null;
	// 210219 숫자 오름 기능 추가
	private _animateNumber = (obj: HTMLElement, from: number, to: number, duration: number) => {
        const step = (timestamp: number) => {
            if(!this._startTimestamp) this._startTimestamp = timestamp;
            const progress = Math.min((timestamp - this._startTimestamp) / duration, 1);
            obj.innerHTML = Math.floor(progress * (to - from) + from) + '';
            if(progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
	}

	public async componentDidUpdate (prevProps: ILiveCloude) {
		// console.log("current view",this.props.view,"prev view",prevProps.view)
		if(this.props.view && !prevProps.view) {
			// 210219 숫자 오름 기능 추가
			const obj = document.querySelector('.single .text');
			await this._animateNumber(obj as HTMLElement, 0, 520, 1500);
            _.delay(() => {
                if(this.props.onComplete)this.props.onComplete();
            },this.props.delay);
			// arg (HTMLElement,처음 시작 숫자,증가할 목표치,속도)
		} else if(!this.props.view && prevProps.view) {
            //
		}
	}
	public render() {
		return(
			<div className={'liveget_cloud'} style={{display: this.props.view ? '' : 'none'}}>
				<div className="single show">
					{/* <div className="text red">520</div> */}
					<div className="text red">0</div>
				</div>
				<div className="double hide">
					<div className="text red">9999</div>
					<div className="text green">9999</div>
				</div>
			</div>
		);
	}
}

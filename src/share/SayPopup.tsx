import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { observable, action } from 'mobx';
import { Observer, observer } from 'mobx-react';
import * as _ from 'lodash';

interface ISayPopup {
    view: boolean;
    type: number; 
    msgtype: number; // 1 - greate job, 2 -- good job, 3 -- incorrect, 4 -- incorrect
	delay?: number;
	onComplete: () => void;
}

@observer
export class SayPopup extends React.Component<ISayPopup> {
	public componentDidUpdate(prevProps: ISayPopup) {
		if( this.props.view && !prevProps.view) {
			let delay = this.props.delay;
			if(!delay) delay = 800;

			_.delay(() => {
				this.props.onComplete();
			}, delay);
		} else if(!this.props.view && prevProps.view ) {
            // 
		}
	}
	public render() {
        let src;
        let msg: string = '';

        src = `${_math_lib_}images/saypop_correct_0${Math.ceil(( Math.random() * 10) % 3 )}.gif`;

        if(this.props.type === 1 && this.props.msgtype === 1) msg = 'Great Job!!';
        else if(this.props.type === 1 && this.props.msgtype === 2) {
            msg = 'Good Job!!';
            src = `${_math_lib_}images/saypop_re_correct_0${Math.ceil(( Math.random() * 10) % 3 )}.gif`;
        } else if(this.props.type === 1 && this.props.msgtype === 3) {
            msg = 'Incorrect.<br/>Think again';
            src = `${_math_lib_}images/saypop_incorrect_0${Math.ceil(( Math.random() * 10) % 4 )}.gif`;
        } else if(this.props.type === 1 && this.props.msgtype === 4) {
            msg = 'Cheer up!!';
            src = `${_math_lib_}images/saypop_re_incorrect_0${Math.ceil(( Math.random() * 10) % 2 )}.gif`;
        } else if(this.props.type === 4 && this.props.msgtype === 1) msg = 'Good Work!!';
        else if(this.props.type === 4 && this.props.msgtype === 2) msg = 'Awesome!!';
        else if(this.props.type === 4 && this.props.msgtype === 3) msg = 'That\'s it!!';
        else if(this.props.type === 4 && this.props.msgtype === 4) msg = 'Perfect!!';
        else if(this.props.type === 4 && this.props.msgtype === 5) msg = 'Genius!!';

        return (
            <div className={'saypop_wrap ' + (this.props.view ? ' show' : '')}>
                <div className={'saypop type0' + (this.props.type === 4 ? '1' : this.props.msgtype) + ' ' + (this.props.view ? 'show' : '')}>
                    <img src={src} />
                    <div className="ment" dangerouslySetInnerHTML={{ __html: msg }} />
                </div>
            </div>
        );
	}
}


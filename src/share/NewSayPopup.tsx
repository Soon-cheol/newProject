import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { observable, action } from 'mobx';
import { Observer, observer } from 'mobx-react';
import * as _ from 'lodash';
import * as kutil from '@common/util/kutil';
import { App } from '../App';
import * as felsocket from '../../src/felsocket';
interface INewSayPopup {
    view: boolean;
    delay: number;
    type: number;
    isQuiz?: boolean;// warmup quiz 일때만 true 로 놓으면 됩니다.  
    onComplete: () => void;
    hideTeaching?: boolean;
}
@observer
export class NewSayPopup extends React.Component<INewSayPopup> {
    @observable private showopen = false;
    @observable private _innerType: number = 0;
    @observable private _name: 'great'|'awesome'|'perfect'|'excellent'|'bonus'|'sorry'|'retry' = 'great';
    private _onComplete = async () => {
        await kutil.wait(500); 
        this.props.onComplete();
        if(this.props.hideTeaching !== true) felsocket.showSMathKit(true); // warmup quiz 일떄는 실행 안하게 막음 
    }
    public componentDidUpdate(prevProps: INewSayPopup) {
		if( this.props.view && !prevProps.view) {
            let delay = this.props.delay;
            if(!delay) delay = 800;
            // console.log("props type",this.props.type);
            if(this.props.type < 5) {
                this._innerType = Math.floor((Math.random() * 4) + 1);// 1~4 까지 숫자를 랜덤으로 
              
            } else {
                this._innerType = this.props.type;
            }
            if(this._innerType === 1) {
                this._name = 'great';
            } else if(this._innerType === 2) {
                this._name = 'awesome';
            } else if(this._innerType === 3) {
                this._name = 'perfect';
            } else if(this._innerType === 4) {
                this._name = 'excellent';
            } else if(this._innerType === 5) {
                this._name = 'bonus';
            } else if(this._innerType === 6) {
                this._name = 'sorry';
            } else if(this._innerType === 7) {
                this._name = 'retry';
            }
            _.delay(() => {
                this.showopen = false;
                this._onComplete();
            }, 2000);
            _.delay(() => {
                this.showopen = true;
                if(this.props.hideTeaching !== true) felsocket.showSMathKit(false);
                if(this.props.type < 5) {
                    App.pub_playgreat();
                } else if(this.props.type === 6) {
                    App.pub_playsorry();
                } else if(this.props.type === 7) {
                    App.pub_playretry();
                }
            },500);      
         
		} else if(!this.props.view && prevProps.view ) {
            this._name = 'great';// 초기화 
            this._innerType = 0;
		}
	}
    public render() {
        return (
        <div className={'msg_rst' + (this.showopen ? ' open' : '')} style={{display: this.props.view ? '' : 'none'}}>
                <div className={'imgtxt ' + (this._name)} />
                <div className="twinkle">
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
        </div>
        );
    }

}
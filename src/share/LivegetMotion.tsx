import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { observable, action } from 'mobx';
import { Observer, observer } from 'mobx-react';
import * as felsocket from '../felsocket';
import * as _ from 'lodash';
import * as kutil from '@common/util/kutil';
import { App } from '../App';

interface ILivegetMotion {
    view: boolean;
    livePoint: number;
    onComplete: () => void;
}

@observer
export class LivegetMotion extends React.Component<ILivegetMotion> {
    private timerId: number = -1;
    private _closePopup = () => {
        this.props.onComplete();
    }
	public async componentDidUpdate(prevProps: ILivegetMotion) {
        if(this.props.view && !prevProps.view) {
           App.pub_playGamegood();
           this.timerId =  _.delay(() => {
                if(this.props.onComplete) {
                    this.props.onComplete();
                }
            },1500);
        } else if(!this.props.view && prevProps.view) {
            clearTimeout(this.timerId);
            felsocket.showSMathKit(true);
        }
	}
	public render() {
        const {view,livePoint} = this.props;
        return(
            <div className={'liveget_motion' + (view ? ' active' : '')} style={{display: view ? '' : 'none'}} onClick={this._closePopup}>
                <div className="inner">
                    <div className="ani_heartbox" />
                    <div className="text">
                        <strong>{'+' + livePoint}</strong> Lives!
                    </div>
                </div>
            </div>
        );
	}
}

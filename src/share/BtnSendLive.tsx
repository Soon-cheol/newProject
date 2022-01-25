import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Observer, observer, inject } from 'mobx-react';
import { observable } from 'mobx';
import * as _ from 'lodash';
import * as kutil from '@common/util/kutil';
import { ToggleBtn } from '@common/component/button';
import { App } from '../App';
interface IBtnSendLive {
    view: boolean;
    disabled: boolean;
    on: boolean;
    onClick: () => void;
    isStrategy?: boolean;
}
@observer
export class BtnSendLive extends React.Component<IBtnSendLive> {
    private _onClick = () => {
        App.pub_playBtnTab();
        this.props.onClick();
    }
    constructor(props: IBtnSendLive) {
        super(props);
        
    }
    public componentDidUpdate(prev: IBtnSendLive) {
        //
    }
    public render() {
        const {view,disabled,on,isStrategy} = this.props; 
        return (
            // 210518 수정
            <ToggleBtn className="btn_heart" style={{right: isStrategy ? '9px' : '0'}}view={view} disabled={disabled} on={on} onClick={this._onClick}/>
        );
    }
}
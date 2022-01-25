import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { observable, action } from 'mobx';
import { observer, Observer } from 'mobx-react';
import { hot } from 'react-hot-loader';
import { CoverPopup } from '../share/CoverPopup';
import * as _ from 'lodash';
import { App } from '../App';
export interface IWarningPopup {
    view: boolean;
    type: 0|1|2|3;
    button: boolean; 
	delay?: number;
    onComplete?: () => void;
    onOk?: () => void;
    onCancel?: () => void;
}

interface IAlertPopup {
    view: boolean;
    msg: string;
    onOk: () => void;
    onClose: () => void;
    isSingle?: boolean;
    msgclass?: string;

}// 기본적인 팝업

interface IStrategyPopup {
    view: boolean;
    type: 0|1|2|3|4|5;
    button: boolean; 
	delay?: number;
    isSingle?: boolean;
    onComplete?: () => void;
    onOk?: () => void;
    onCancel?: () => void;
}
@observer
export class StrategyPopup extends React.Component<IStrategyPopup> {
	public componentDidUpdate(prevProps: IStrategyPopup) {
		if( this.props.view && !prevProps.view) {
            if(!this.props.button) {
                let delay = this.props.delay;
                if(!delay) delay = 800;
    
                _.delay(() => {
                    if(this.props.onComplete) this.props.onComplete();
                }, delay);
            }
		} else if(!this.props.view && prevProps.view ) {
            // 
		}
	}
	public render() {
        const { type } = this.props;

        let msg = '';
        if(type === 0)  msg = 'The teacher has stopped you from the activity. After 3 seconds, only the contents has been created so far will be submitted.';
        else if(type === 1) msg = 'All students are already in progress. If you restart, existing data will be deleted. Are you sure you want to request the submission?';
        else if(type === 2) msg = 'You can share a solution only in the problem solving state.';
        else if(type === 3) msg = 'Do you want to save the current learning screen? If there is already saved data, the current data will be overwritten.';
        else if(type === 4) msg = 'Picture not taken.\nYou have reached the maximum number of pictures available.';
        else if(type === 5) msg = 'For this activity, We recommend students to wear a headset or an earphone with a microphone.';

        let classname = "exclamation";
        if (type === 4) classname = "nocamera";
        else if(type === 5) classname = "headset";

        return (
            <div className={'alertpop strategy' + (this.props.view ? ' show' : '')}>
                <div className={'alertpop-inner'}>
                    <div className={classname} />
                    <div className="ment">
                        {msg}
                    </div>
                    <div className={'buttons' + (this.props.isSingle ? ' single' : '') + (!this.props.button ? ' hide' : '')}>
                        {/* 버튼이 하나일 경우 buttons옆에 single을 붙여주고 하단 숨길 btn옆에 hide를 붙여주세요.*/}
                        <button className="btn cancel" onClick={this.props.onCancel}>Cancel</button>
                        <button className="btn ok" onClick={this.props.onOk}>Ok</button>
                    </div>
                </div>
            </div> 
        );
	}
}


@observer
export class WarningPopup extends React.Component<IWarningPopup> {
    @observable private second: number = 3;
    private interval: NodeJS.Timeout | null = null;
	public componentDidUpdate(prevProps:  IWarningPopup) {
		if( this.props.view && !prevProps.view) {
            this.second = 3;
            if(!this.props.button) {
                let delay = this.props.delay;
                if(!delay) delay = 800;
                // typescript 버전에 따라 컴파일할때 에러나서 처리
                // @ts-ignore
                this.interval = setInterval(() => {
                    this.second--;
                    if(this.second === 0) {
                        if(this.props.onComplete) this.props.onComplete();
                        // typescript 버전에 따라 컴파일할때 에러나서 처리
                        // @ts-ignore
                        if(this.interval !== null)clearInterval(this.interval);
                    }
                },1000);// 무조건 3초로 통일 delay props 제거 할 예정
            }
		} else if(!this.props.view && prevProps.view) {
            if(this.interval !== null) clearInterval(this.interval);
            if(this.props.onComplete) this.props.onComplete();
		}
	}
	public render() {
        const { type } = this.props;

        let msg = '';
        if(type === 0) msg = `Submit your answer within <strong>${this.second} seconds.</strong>`;
        return (
            <div className="warningpopup" style={{display: this.props.view ? '' : 'none'}}>
            {/* <div className="msg">Submit your answer within <strong>3 seconds.</strong></div> */}
            <div className="msg" dangerouslySetInnerHTML={{__html: msg}}/>
            </div>
        );
	}
}


export class AlertPopup extends React.Component<IAlertPopup> {
    private _onOk = () => {
        // App.pub_playBtnTab();
        if(this.props.onOk)this.props.onOk();
    }
    private _onClose = () => {
        // App.pub_playBtnTab();
        if(this.props.onClose)this.props.onClose();
    }
    public componentDidUpdate(prevProps: IAlertPopup) {
		if( this.props.view && !prevProps.view) {
            //
		} else if(!this.props.view && prevProps.view ) {
            App.pub_playBtnTab();
		}
	}
    public render() {
        const {view,msg,isSingle, msgclass} = this.props;
     
        return(
            <CoverPopup className="alert_popup" view={view} onClosed={this.props.isSingle ? this._onOk : this._onClose}>
                <div className="pop_box">
                    <span className="ico_alert"/>
                    <span className={"text" + (msgclass && msgclass !== '' ? " " + msgclass : "")} dangerouslySetInnerHTML={{__html: msg}}/>
                    <div className="btns">
                        <button className="btn_cancel" onClick={this._onClose} style={{display: isSingle ? 'none' : ''}}>
                            <span>Cancel</span>
                        </button>
                        <button className="btn_ok" onClick={this._onOk}>
                            <span>OK</span>
                        </button>
                    </div>
                </div>
            </CoverPopup>
        );
    }
}
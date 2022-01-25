import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { observable, action } from 'mobx';
import { observer, Observer } from 'mobx-react';
import { hot } from 'react-hot-loader';
import { CoverPopup } from '../share/CoverPopup';

interface ICheckAlert {
    view: boolean;
    onOk: () => void;
    msg?: string;

}
export class CheckAlert extends React.Component<ICheckAlert> {
    public render() {
        const {msg} = this.props;
        return(
        <CoverPopup className="alert_popup" view={this.props.view} onClosed={this.props.onOk}>
            <div className="pop_box">
                <span className="ico_alert"/>
                <span className="text">{msg && msg !== '' ? msg : 'Check the Problem'}</span>
                <div className="btns">
                    <button className="btn_ok" onClick={this.props.onOk}>
                        <span>OK</span>
                    </button>
                </div>
            </div>
        </CoverPopup>
        );
    }
}
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Observer, observer, inject } from 'mobx-react';
import { observable } from 'mobx';
import * as _ from 'lodash';
import * as kutil from '@common/util/kutil';
import { ToggleBtn } from '@common/component/button';
import { App } from '../App';
interface IBtnProgress {
    view: boolean;
    onClick: () => void;
    isEnd: boolean;
    totalStudents: number; // 전체 학생수 
    submitStudents: number; // 제출한 학생수
    noFinishView?: boolean;
    noRetryView?: boolean;
}
@observer
export class BtnProgress extends React.Component<IBtnProgress> {
    @observable private isHide = false;
    private timerid  = -1;
    private _onClick = () => {
        App.pub_playBtnTab();
        this.props.onClick();
    }
    constructor(props: IBtnProgress) {
        super(props);
        if(this.props.isEnd) {
            _.delay(() => {
                this.isHide = true;
            }, 2500);
        }
    }
    public componentDidUpdate(prev: IBtnProgress) {
        if(this.props.isEnd && !prev.isEnd) {
            this.timerid = _.delay(() => {
                this.isHide = true;
            },2500);
        } else if(!this.props.isEnd && prev.isEnd) {
            this.isHide = false;
            clearTimeout(this.timerid);
        } 
    }
    public render() {
        const {submitStudents,totalStudents, noFinishView} = this.props; 
        return (
            // 210518 수정
            <div className={'progressWrap' + (this.props.isEnd ? ' end' : '') + (this.props.view ? ' on' : '')}>
                {(() => {
                    if(!(this.props.noRetryView && this.props.isEnd)) {
                        return <ToggleBtn className={'btn_progress'} view={this.props.view} onClick={this._onClick}>
                            <span>{`${submitStudents}/${totalStudents}`}</span>
                        </ToggleBtn>
                    }
                    return <></>;
                })()}
                <div className={'msg' + (this.isHide || noFinishView ? ' hide' : '')}>
                    Finish
                    <span/>
                    <span/>
                    <span/>
                    <span/>
                    <span/>
                </div>
            </div>
        );
    }
}
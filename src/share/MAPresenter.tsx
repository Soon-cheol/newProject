import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { observable, action } from 'mobx';
import { Observer, observer } from 'mobx-react';
import * as _ from 'lodash';
import { App } from '../App';
import * as felsocket from '../felsocket';

interface IHistorySendCount { 
    student: string; // Live Point 선물 받은 학생 당사자 
    sendCount: number; // 몇번 보냈는지 횟수 
}// 어떤 학생에게 몇 포인트 전달 했는지 기록 하기 위함

interface IMAPresenter {
    view: boolean;
    showHide: 'show'|'hide'|'';
    onSendLive: (sendStudent: string) => void;
    destiStudent: string; // Live Point를 받을 학생 presenter 로 선정된 학생을 의미
    students: IStudent[];
    isReset: boolean;
    hideTeaching?: boolean;
    curIdx: number;// 현재 팀의 index 
    length: number;// 팀의 갯수가 몇개인지 
}

@observer
export class MAPresenter extends React.Component<IMAPresenter> {
    @observable private sendCount: number = 0;
    @observable private name: string = '';
    @observable private thumbImage: string = '';
    @observable private gender: string | undefined = '';
    private isInit: boolean = false;
    @observable private sendHistory: IHistorySendCount[][] = [];
    constructor(props: IMAPresenter) {
        super(props);
        for(let i = 0; i < props.length; i++) {
            this.sendHistory.push([]);
        }
        // console.log("sendHistroy leng",this.sendHistory.length);
    }
    private _onSend = () => {
        if(!this.props.view) return;
        App.pub_playBtnTab();
        let stuid = this.props.destiStudent + ''; 
        let student = _.find(this.sendHistory[this.props.curIdx],{student: stuid});
        if(student) {
            if(student.sendCount === 50) {
                return; 
            } else { 
                student.sendCount += 5;
                this.props.onSendLive(this.props.destiStudent);
            }
        }
    }
    public componentWillReceiveProps(next: IMAPresenter) {
        if(next.students.length > 0 && !this.isInit) {
            for(let i = 0; i < this.props.length; i++) {
                for(let j = 0; j < next.students.length; j++) {
                    this.sendHistory[i].push({
                        student: next.students[j].id + '',
                        sendCount: 0
                    });
                    // console.log("insert student",this.sendHistory[i]);
                }
            }
          
            this.isInit = true;
        }
        if(!this.props.view && next.view) {
            const student = _.find(next.students,(item) => {
                return item.id === next.destiStudent; 
            });
            if(student) {
                this.gender = student.gender;
                if(student.displayMode === '1') {
                    this.name = student.name;
                    this.thumbImage = student.thumb;
                } else {
                    if(student.nickname && student.nickname !== '') {
                        this.name = student.nickname;
                    } else {
                        this.name = student.name;
                    }
                    this.thumbImage = student.avatar;
                }
            }
          
        }
    }
	public componentDidUpdate(prevProps: IMAPresenter) {
        if(this.props.view && !prevProps.view) {
            this.sendCount = 0;
            felsocket.showSMathKit(false);
        } else if(!this.props.view && prevProps.view && !this.props.hideTeaching) {
            felsocket.showSMathKit(true);
            this.sendCount = 0;
        }
        if(this.props.isReset && !prevProps.isReset) {
            if(this.sendHistory[this.props.curIdx].length > 0) {
                for(let i = 0; i < this.sendHistory[this.props.curIdx].length; i++) {
                    this.sendHistory[this.props.curIdx][i].sendCount = 0;
                }
            }
        }
	}
	public render() {
        const {view, showHide,curIdx} = this.props;
        // console.log("curIdx",curIdx)
        let id = this.props.destiStudent + '';
        // console.log("가공~~",id)
        let point = 0;
        let student = _.find(this.sendHistory[curIdx],{student: id});
        if(student) {
            point = student.sendCount;
        }
        return(
            <div className="mapresenter" style={{display: view ? '' : 'none'}}>
                <div className="content">
                    <div className="profile_img">
                        {showHide === 'hide' && <img className="default" src={`${_math_lib_}images/ico_profile_default.png`}/>}
                        {(showHide === 'show' && this.thumbImage === '') && <div className={this.gender === 'F' ? 'defaultImg_f' : 'defaultImg_m'}><div>{this.name.substring(0,2).toUpperCase()}</div></div>}
                        {(showHide === 'show' && this.thumbImage !== '') && <img className="thumbnail" src={this.thumbImage}/>}
                    </div>
                    <div className="profile_name" style={{display: showHide === 'show' ? '' : 'none'}}>{this.name}</div>
                    <div className="live_name">
                        <div className="number">
                            {/* <span>{this.sendCount}</span> / 50 */}
                            <span>{point}</span> / 50
                        </div>
                        <div className="box" onClick={this._onSend}>
                            {/* 비활성화일경우 box옆에 gray를 붙여주세요. */}
                            <div className="twinkles">
                                <span className="t1" /><span className="t1" /><span className="t1" />
                                <span className="t2" /><span className="t2" /><span className="t2" />
                            </div>
                            <span className="ico_heart" />
                            Green Lives
                        </div>
                    </div>
                </div>
            </div>
        );
	}
}

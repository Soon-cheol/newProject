import * as React from 'react';
import * as _ from 'lodash';
import * as felsocket from '../felsocket';
import { App } from '../App';

interface ILockMsg {
    msgtype: 'page_lock' | 'page_unlock';
}
/*
    ---- 선생님 예시
    <LockUI
        is_lock={this.quiz_prog_lock}
        view={this.quiz_prog === IQuizProg.RUN}
        onToggle={(v: boolean) => {
            this.quiz_prog_lock = v;
        }}
        is_teacher={true}
    />
    ---- 학생 예시
    <LockUI
        is_lock={this.props.state.is_lock}
        is_teacher={false}
    />
    ---- css 는 LockUI.scss 안에 있는 mixin인 lockui 를 쓰시면 됩니다
*/
export default class LockUI extends React.Component<{
    is_lock: boolean; // lock 활성화 여부
    view?: boolean; // 선생님일때는 lock 이지만 버튼이 안보일때도 있습니다
    onToggle?: (v: boolean) => void; // lock 제어
    is_teacher: boolean;
}> {
    public render() {
        if (this.props.is_teacher) { // 선생님일때 lock버튼
            return (
                <button
                    onClick={() => {
                        if (this.props.is_lock) {
                            App.pub_reloadStudents(() => {
                                //
                            });
                            
                            if (this.props.onToggle) this.props.onToggle(false);
                            let qmsg: ILockMsg = { msgtype: 'page_unlock' };
                            felsocket.sendPAD($SocketType.MSGTOPAD, qmsg);
                        } else {
                            App.pub_reloadStudents(() => {
                                //
                            });
                            if (this.props.onToggle) this.props.onToggle(true);
                            let qmsg: ILockMsg = { msgtype: 'page_lock' };
                            felsocket.sendPAD($SocketType.MSGTOPAD, qmsg);
                        }
                    }}
                    className="lock_btn"
                    data-active={this.props.view} // 버튼이 보이는지 아닌지
                    data-locked={this.props.is_lock} // lock 상태 디자인
                />
            );
        } else { // 학생일때 가림막
            return (
                <div 
                    className="lockking" 
                    style={this.props.is_lock ? { display: 'block' } : { display: 'none' }}
                >
                    {this.props.children ? this.props.children : <div className="text">
						<strong>Pay Attention</strong>
                        <img src={`${_math_lib_}images/imgFairy.png`} />
					</div>}
                </div>
            );
        }
    }
}
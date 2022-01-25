import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { observable, action } from 'mobx';
import { observer } from 'mobx-react';
import { App } from '../App';
import * as _ from 'lodash';
import { isNumber } from 'lodash';

const SwiperComponent = require('react-id-swiper').default;

interface IMASubmitUserList {
    view: boolean;
    mode: 1|2|3|4; 
    type: string;
    quizIdx: number;
    onType?: (type: string,index: number) => void;
    submitusers: ISubmitStudent[];
    isNoNum?: boolean;/* true 일 경우 warmup_quiz 에 있는 형식으로 파란 배경의 퀴즈 번호 들어 가는 형태로 바뀜 */
    isAssessment?: boolean;
    isStrategy?: boolean;
    onClose: () => void;
}

@observer
export class MASubmitUserList extends React.Component<IMASubmitUserList> {
    @observable private allStudents: IStudent[] = [];
    @observable private heartTwoStudents: IStudent[] = [];
    @observable private heartOneStudents: IStudent[] = [];
    @observable private wrongStudents: IStudent[] = [];
    @observable private notsubmitUsers: IStudent[] = [];
    @observable private submitusersCnt = 0;
   
    private _swiper!: Swiper;

    private _soption: SwiperOptions = {
		direction: 'vertical',
		observer: true,
		slidesPerView: 'auto',
		freeMode: true,
		mousewheel: true,			
		noSwiping: false,
		followFinger: true,
		scrollbar: {el: '.swiper-scrollbar',draggable: true, hide: false},	
    };
    
    constructor(props: IMASubmitUserList) {
		super(props);
    }
    private _refSwiper = (el: SwiperComponent|null) => {
        if(this._swiper || !el) return;
        this._swiper = el.swiper;
    }
    private clickTab = (type: '1'|'2'|'3'|'4'|'',index: number) => {
        if(this._swiper) {
            this._swiper.update();
            if(this._swiper.scrollbar) this._swiper.scrollbar.updateSize();
            this._swiper.slideTo(0);
        }				
        _.delay(() => {
            if(this._swiper) {
                this._swiper.update();
                if(this._swiper.scrollbar) this._swiper.scrollbar.updateSize();
                this._swiper.slideTo(0);
            }				
        }, 300);
        switch(type) {
            case '1':
                if(this.heartTwoStudents.length < 1) return;
                break;
            case '2':
                if(this.heartOneStudents.length < 1) return;
                break;
            case '3':
                if(this.wrongStudents.length < 1) return;
                break;
            case '4':
                if(this.notsubmitUsers.length < 1) return;
                break;
            case '':
                break;
            default:
                break;
        }
        App.pub_playBtnTab();
        if(this.props.onType) this.props.onType(type,index);
    }
	public componentDidUpdate(prev: IMASubmitUserList) {
        if(this.props.view && !prev.view) {
            // this._tabno = this.props.type && this.props.type !== '' ? this.props.type : '';
            if(this._swiper) {
                this._swiper.update();
                if(this._swiper.scrollbar) this._swiper.scrollbar.updateSize();
                this._swiper.slideTo(0);
            }				
            _.delay(() => {
                if(this._swiper) {
                    this._swiper.update();
                    if(this._swiper.scrollbar) this._swiper.scrollbar.updateSize();
                    this._swiper.slideTo(0);
                }				
            }, 300);

            if(App.students) this.allStudents = App.students;
        
            while(this.heartTwoStudents.length > 0) this.heartTwoStudents.pop();
            while(this.heartOneStudents.length > 0) this.heartOneStudents.pop();
            while(this.wrongStudents.length > 0) this.wrongStudents.pop();
            while(this.notsubmitUsers.length > 0) this.notsubmitUsers.pop();

            if(this.props.isAssessment) {
                if(this.props.submitusers.length > 0) {
                    this.allStudents.map((allStudent, i) => {
                        let submitStudent = this.props.submitusers.find((user) => user.student.id === allStudent.id);
                        if(submitStudent) this.heartTwoStudents.push(submitStudent.student);
                        else this.notsubmitUsers.push(allStudent);
                    });
                } else {
                    this.notsubmitUsers = this.allStudents;
                }
            } else {
                if(this.props.mode === 3) {
                    // this._tabno = 3;
                    if(this.props.submitusers.length > 0) {
                        this.allStudents.map((allStudent, i) => {
                            let submitStudent = this.props.submitusers.find((user) => user.student.id === allStudent.id);
                            if(submitStudent && submitStudent.trycnt !== 0) {
                                if(submitStudent.correct) {
                                    if(submitStudent.trycnt === 1) this.heartTwoStudents.push(submitStudent.student);
                                    else this.heartOneStudents.push(submitStudent.student);
                                } else this.wrongStudents.push(submitStudent.student);
                            } else this.notsubmitUsers.push(allStudent);
                        });
                    } else {
                        this.notsubmitUsers = this.allStudents;
                    }
                } else if(this.props.mode === 2) {
                    // this._tabno = 2;
                    if(this.props.submitusers.length > 0) {
                        this.allStudents.map((allStudent, i) => {
                            let submitStudent = this.props.submitusers.find((user) => user.student.id === allStudent.id);
                            if(submitStudent) {
                                if(submitStudent.correct) this.heartOneStudents.push(submitStudent.student);
                                else this.wrongStudents.push(submitStudent.student);
                            } else this.notsubmitUsers.push(allStudent);
                        });
                    } else {
                        this.notsubmitUsers = this.allStudents;
                    }  
                } else if(this.props.mode === 4) {
                    if(this.props.submitusers.length > 0) {
                        this.allStudents.map((allStudent, i) => {
                            let submitStudent = this.props.submitusers.find((user) => user.student.id === allStudent.id);
                            if(submitStudent && submitStudent.trycnt !== 0) {
                                if(submitStudent.correct) {
                                    if(submitStudent.trycnt === 1) this.heartTwoStudents.push(submitStudent.student);
                                } else this.wrongStudents.push(submitStudent.student);
                            } else this.notsubmitUsers.push(allStudent);
                        });
                    } else {
                        this.notsubmitUsers = this.allStudents;
                    }  
                } else {
                    // this._tabno = 1;
                    if(this.props.submitusers.length > 0) {
                        this.allStudents.map((allStudent, i) => {
                            let submitStudent = this.props.submitusers.find((user) => user.student.id === allStudent.id);
                            if(!submitStudent) this.notsubmitUsers.push(allStudent);
                        });
                    } else {
                        this.notsubmitUsers = this.allStudents;
                    } 
                }
            }

            this.submitusersCnt = this.props.submitusers.length;

            if(this.props.isStrategy && this.props.onType) {
                if(this.heartTwoStudents.length > 0) this.props.onType('1',this.props.quizIdx);
                else if(this.heartOneStudents.length > 0) this.props.onType('2',this.props.quizIdx);
                else if(this.wrongStudents.length > 0) this.props.onType('3',this.props.quizIdx);
                else if(this.notsubmitUsers.length > 0) this.props.onType('4',this.props.quizIdx);
            }
            
            if(this.heartTwoStudents.length > 0) this.clickTab('1', this.props.quizIdx)
            else if(this.heartOneStudents.length > 0) this.clickTab('2', this.props.quizIdx)
            else if(this.wrongStudents.length > 0) this.clickTab('3', this.props.quizIdx)
            else if(this.notsubmitUsers.length > 0) this.clickTab('4', this.props.quizIdx)

        } else if(this.props.view && prev.view && this.props.submitusers.length !== this.submitusersCnt) {
            if(this._swiper) {
                this._swiper.update();
                if(this._swiper.scrollbar) this._swiper.scrollbar.updateSize();
                this._swiper.slideTo(0);
            }				
            _.delay(() => {
                if(this._swiper) {
                    this._swiper.update();
                    if(this._swiper.scrollbar) this._swiper.scrollbar.updateSize();
                    this._swiper.slideTo(0);
                }				
            }, 300);

            if(App.students) this.allStudents = App.students;

            while(this.heartTwoStudents.length > 0) this.heartTwoStudents.pop();
            while(this.heartOneStudents.length > 0) this.heartOneStudents.pop();
            while(this.wrongStudents.length > 0) this.wrongStudents.pop();
            while(this.notsubmitUsers.length > 0) this.notsubmitUsers.pop();

            if(this.props.isAssessment) {
                if(this.props.submitusers.length > 0) {
                    this.allStudents.map((allStudent, i) => {
                        let submitStudent = this.props.submitusers.find((user) => user.student.id === allStudent.id);
                        if(submitStudent) this.heartTwoStudents.push(submitStudent.student);
                        else this.notsubmitUsers.push(allStudent);
                    });
                } else {
                    this.notsubmitUsers = this.allStudents;
                }
            } else {
                if(this.props.mode === 3) {
                    // this._tabno = 3;
                    if(this.props.submitusers.length > 0) {
                        this.allStudents.map((allStudent, i) => {
                            let submitStudent = this.props.submitusers.find((user) => user.student.id === allStudent.id);
                            if(submitStudent && submitStudent.trycnt !== 0) {
                                if(submitStudent.correct) {
                                    if(submitStudent.trycnt === 1) this.heartTwoStudents.push(submitStudent.student);
                                    else this.heartOneStudents.push(submitStudent.student);
                                } else this.wrongStudents.push(submitStudent.student);
                            } else this.notsubmitUsers.push(allStudent);
                        });
                    } else {
                        this.notsubmitUsers = this.allStudents;
                    }
                } else if(this.props.mode === 2) {
                    // this._tabno = 2;
                    if(this.props.submitusers.length > 0) {
                        this.allStudents.map((allStudent, i) => {
                            let submitStudent = this.props.submitusers.find((user) => user.student.id === allStudent.id);
                            if(submitStudent) {
                                if(submitStudent.correct) this.heartOneStudents.push(submitStudent.student);
                                else this.wrongStudents.push(submitStudent.student);
                            } else this.notsubmitUsers.push(allStudent);
                        });
                    } else {
                        this.notsubmitUsers = this.allStudents;
                    }  
                } else if(this.props.mode === 4) {
                    if(this.props.submitusers.length > 0) {
                        this.allStudents.map((allStudent, i) => {
                            let submitStudent = this.props.submitusers.find((user) => user.student.id === allStudent.id);
                            if(submitStudent && submitStudent.trycnt !== 0) {
                                if(submitStudent.correct) {
                                    if(submitStudent.trycnt === 1) this.heartTwoStudents.push(submitStudent.student);
                                } else this.wrongStudents.push(submitStudent.student);
                            } else this.notsubmitUsers.push(allStudent);
                        });
                    } else {
                        this.notsubmitUsers = this.allStudents;
                    }  
                } else {
                    // this._tabno = 1;
                    if(this.props.submitusers.length > 0) {
                        this.allStudents.map((allStudent, i) => {
                            let submitStudent = this.props.submitusers.find((user) => user.student.id === allStudent.id);
                            if(!submitStudent) this.notsubmitUsers.push(allStudent);
                        });
                    } else {
                        this.notsubmitUsers = this.allStudents;
                    } 
                }
            }

            this.submitusersCnt = this.props.submitusers.length;

            if(this.props.isStrategy && this.props.onType) {
                if(this.heartTwoStudents.length > 0) this.props.onType('1',this.props.quizIdx);
                else if(this.heartOneStudents.length > 0) this.props.onType('2',this.props.quizIdx);
                else if(this.wrongStudents.length > 0) this.props.onType('3',this.props.quizIdx);
                else if(this.notsubmitUsers.length > 0) this.props.onType('4',this.props.quizIdx);
            }
        }
	}
    
    public render() {
        const {view, onClose, isNoNum, isAssessment, quizIdx, isStrategy, submitusers} = this.props;

        let addClasstype = '';
        if(isNoNum) addClasstype += ' nonum';
        if(isAssessment) addClasstype += ' assessment';
        return(
            <>
            <div className={'submituserlist_bg' + (view ? ' show' : '')}/>
            <div className={'submituserlist' + (view ? ' show' : '') + addClasstype}>
                {/* 앞에 번호 없을경우 submituserlist옆에 nonum을 붙여주세요. Assessment일 경우 assessment 붙여주세요. */}
                <div className="header">
                    <div className="quiz_tit">{'Q' + (quizIdx + 1)}</div>
                    <div className="score_set">
                        <ul>
                            <li className={'type01' + (this.props.type === '1' ? ' arrow' : '') + (this.heartTwoStudents.length > 0 ? ' on' : '')} style={{cursor: this.heartTwoStudents.length > 0 ? 'pointer' : 'default'}} onClick={this.clickTab.bind(this,'1',quizIdx)}>
                                {this.heartTwoStudents.length}
                            </li>
                            {this.props.mode < 4 && <li className={'type02' + (this.props.type === '2' ? ' arrow' : '') + (this.heartOneStudents.length > 0 ? ' on' : '')} style={{cursor: this.heartOneStudents.length > 0 ? 'pointer' : 'default'}} onClick={this.clickTab.bind(this,'2',quizIdx)}>
                                {this.heartOneStudents.length}
                            </li>}
                            <li className={'type03' + (this.props.type === '3' ? ' arrow' : '') + (this.wrongStudents.length > 0 ? ' on' : '')} style={{cursor: this.wrongStudents.length > 0 ? 'pointer' : 'default'}} onClick={this.clickTab.bind(this,'3',quizIdx)}>
                                {this.wrongStudents.length}
                            </li>
                            <li className={'type04' + (this.props.type === '4' ? ' arrow' : '') + (this.notsubmitUsers.length > 0 ? ' on' : '')} style={{cursor: this.notsubmitUsers.length > 0 ? 'pointer' : 'default'}} onClick={this.clickTab.bind(this,'4',quizIdx)}>
                                {this.notsubmitUsers.length}
                            </li>
                        </ul>
                    </div>
                    <div className="submitter">Submitter<span><strong>{this.heartTwoStudents.length}</strong> / {this.allStudents.length}</span></div>
                    <button className="btn_close" onClick={onClose} />
                </div>
                <div className="list_box">
                    <div className="innerbox">
                    <SwiperComponent {...this._soption} ref={this._refSwiper}>
                    <div className="inner">
                        <ul>
                            {
                                this.props.type === '1' &&
                                (
                                   this.heartTwoStudents.map((item,index) => {
                                        const name = item.displayMode === '2' && item.nickname ? item.nickname : item.name;
                                        const image = item.displayMode === '2' ? item.avatar : item.thumb;
                                        return(
                                            <li key={index}>
                                            {image === '' && <div className={item.gender === 'F' ? 'defaultImg_f' : 'defaultImg_m'}><div>{name.substring(0,2).toUpperCase()}</div></div>}
                                            {image !== '' && <img src={image} />}
                                            <span className="name">{name}</span>
                                            </li>
                                        );
                                   })
                                )
                            }
                            {
                                this.props.type === '2' &&
                                (
                                   this.heartOneStudents.map((item,index) => {
                                        const name = item.displayMode === '2' && item.nickname ? item.nickname : item.name;
                                        const image = item.displayMode === '2' ? item.avatar : item.thumb;
                                        return(
                                            <li key={index}>
                                            {image === '' && <div className={item.gender === 'F' ? 'defaultImg_f' : 'defaultImg_m'}><div>{name.substring(0,2).toUpperCase()}</div></div>}
                                            {image !== '' && <img src={image} />}
                                            <span className="name">{name}</span>
                                            </li>
                                        );
                                   })
                                )
                            }
                            {
                                this.props.type === '3' &&
                                (
                                   this.wrongStudents.map((item,index) => {
                                        const name = item.displayMode === '2' && item.nickname ? item.nickname : item.name;
                                        const image = item.displayMode === '2' ? item.avatar : item.thumb;
                                        return(
                                            <li key={index}>
                                            {image === '' && <div className={item.gender === 'F' ? 'defaultImg_f' : 'defaultImg_m'}><div>{name.substring(0,2).toUpperCase()}</div></div>}
                                            {image !== '' && <img src={image} />}
                                            <span className="name">{name}</span>
                                            </li>
                                        );
                                   })
                                )
                            }
                            {
                                this.props.type === '4' &&
                                (
                                   this.notsubmitUsers.map((item,index) => {
                                        const name = item.displayMode === '2' && item.nickname ? item.nickname : item.name;
                                        const image = item.displayMode === '2' ? item.avatar : item.thumb;
                                        return(
                                            <li key={index}>
                                            {image === '' && <div className={item.gender === 'F' ? 'defaultImg_f' : 'defaultImg_m'}><div>{name.substring(0,2).toUpperCase()}</div></div>}
                                            {image !== '' && <img src={image} />}
                                            <span className="name">{name}</span>
                                            </li>
                                        );
                                   })
                                )
                            }
                        </ul>
                    </div>
                    </SwiperComponent>
                    </div>
                </div>
            </div>
            </>
        );
    }
}

interface IMASubmitUsers {
    view: boolean;
    submitusers: number;
    totalusers: number;
    onClick?: () => void;
}

@observer
export class MASubmitUsers extends React.Component<IMASubmitUsers> {
    constructor(props: IMASubmitUsers) {
		super(props);
    }
    public render() {
        const {view, submitusers, totalusers, onClick} = this.props;
        return(
        <div className={'submitusers' + (!view ? ' hide' : '')} onClick={onClick ? onClick : undefined}>{submitusers} / {totalusers}</div>
       );
    }
}
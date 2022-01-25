import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { observable, action } from 'mobx';
import { observer } from 'mobx-react';
import { App } from '../App';
import * as _ from 'lodash';
import { find, findIndex, filter } from 'lodash';
import { CoverPopup } from './CoverPopup';
import { MALiveHeader } from './MALivegetHeader';
import { setLivePoint,ILivePointRequest,ILivePointResponse } from '@common/component/livepoint';
import { ToggleBtn } from '@common/component/button';
import { setInterval, setTimeout } from 'timers';
import * as felsocket from '../felsocket';

const SwiperComponent = require('react-id-swiper').default;

interface IDetailPopup {
    view: boolean;
    studentId: string;
    quizIdx: number;
    from: 'presenter'|'list'; // 프리젠터에서 들어왔는지 목록에서 들어왔는지 여부 
    submitStudents: ISubmitStudent[][];
    showhide: 'show'|'hide'|'';
    onClosed: (from: 'presenter'|'list',studentId: string) => void;
    onSendLiveget: (studentId: string)  => void;
    onPrev: (studentId: string) => void;
    onNext: (studentId: string) => void;
}

@observer
class DetailPopup extends React.Component<IDetailPopup> {
    private m_swiper!: Swiper;
    @observable private m_view = false;
    @observable private _curIdx: number = -1;
    @observable private _sIdx: number = -1;
    @observable private _imageIdx: number = 0;
    constructor(props: IDetailPopup) {
        super(props);
    }
    private _refSwiper =  (el: SwiperComponent|null) => {
        if(this.m_swiper || !el) return;

        this.m_swiper = el.swiper;
        this.m_swiper.on('transitionStart', () => {
            // console.log('transition start');
            this._imageIdx = -1;
        });
        this.m_swiper.on('transitionEnd', () => {
            // console.log("transition end");
            this._imageIdx = this.m_swiper.activeIndex;
        });
        // console.log("m_swiper",this.m_swiper)
        
	}

    private _onPage = (index: number) => {
        if(!this.props.view)return;
        App.pub_playBtnTab();
        this._imageIdx = index;
        this.m_swiper.slideTo(this._imageIdx);
    }
    private _onBack = (from: 'presenter'|'list',studentId: string) => {
        let sid = this.props.submitStudents[this._curIdx][this._sIdx].student.id;
        this.props.onClosed(from,sid);
        this.props.onSendLiveget(sid);
    }
    private _onPrev = () => {
        if(!this.props.view) return;
        if(this._sIdx === 0) return;
        App.pub_playBtnTab();
        this._sIdx--;
        let sid = this.props.submitStudents[this._curIdx][this._sIdx].student.id;
        this.props.onPrev(sid);
    }
    private _onNext =  () => {
        if(!this.props.view) return;
        if(this._sIdx === this.props.submitStudents[this._curIdx].length - 1)return; 
        App.pub_playBtnTab();
        this._sIdx++;
        let sid = this.props.submitStudents[this._curIdx][this._sIdx].student.id;
        this.props.onNext(sid);

    }
    private _onRNavi = () => {
        if(!this.props.view) return;
        App.pub_playBtnTab();
        this._imageIdx++;
        this.m_swiper.slideTo(this._imageIdx);
    }
    private _onLNavi = () => {
        if(!this.props.view) return;
        App.pub_playBtnTab();
        this._imageIdx--;
        this.m_swiper.slideTo(this._imageIdx);

    }
    public componentDidUpdate(prev: IDetailPopup) {
        // 21-07-01 최순철 activity 예외처리
        const cont = document.querySelector('.content-container');
        // --------------------------------
        if(this.props.view && !prev.view) {
            this.m_view = true;
            this._curIdx = this.props.quizIdx;
            this._sIdx =  _.findIndex(this.props.submitStudents[this._curIdx],{student: {id: this.props.studentId}});
            // 21-07-01 최순철 activity 예외처리
            if(cont) cont.classList.add('fix-activity');
            // --------------------------------
            this.m_swiper.slideTo(0, 0);
            _.delay(() => {
				if(!this.m_swiper) { return; }
				this.m_swiper.update();
				if(this.m_swiper.scrollbar) this.m_swiper.scrollbar.updateSize();
			}, 100);
        } else if(!this.props.view && prev.view) {
            App.pub_playBtnTab();
            this.m_view = false;
            this._imageIdx = 0;
            if(cont) cont.classList.remove('fix-activity');
        }
    }
    public render() {
        const{from,studentId,showhide} = this.props;
        let livePoint: number = 0; 
        let thumb = '';
        let studentName = '';
        let images; 
        let sid = '';
        let gender: string|undefined = '';
        let prev = true;
        let next = true;
        if(this.props.submitStudents && this.props.submitStudents.length > 0 && this._curIdx > -1 && this._sIdx > -1) {
            if(this.props.submitStudents[this._curIdx][this._sIdx] !== undefined) {
                livePoint = this.props.submitStudents[this._curIdx][this._sIdx].livePoint;
            
                if(this.props.submitStudents[this._curIdx][this._sIdx].student.displayMode !== undefined && this.props.submitStudents[this._curIdx][this._sIdx].student.displayMode === '1') {
                    thumb = this.props.submitStudents[this._curIdx][this._sIdx].student.thumb;
                    studentName = this.props.submitStudents[this._curIdx][this._sIdx].student.name;
                } else {
                    thumb = this.props.submitStudents[this._curIdx][this._sIdx].student.avatar;
                    if(this.props.submitStudents[this._curIdx][this._sIdx].student.nickname !== undefined && this.props.submitStudents[this._curIdx][this._sIdx].student.nickname !== '') {
                        studentName = this.props.submitStudents[this._curIdx][this._sIdx].student.nickname;
                    } else {
                        studentName = this.props.submitStudents[this._curIdx][this._sIdx].student.name;
                    }
                }
        
                images = this.props.submitStudents[this._curIdx][this._sIdx].images ? this.props.submitStudents[this._curIdx][this._sIdx].images : [`${_math_lib_}images/img_send_error.png`];
                sid = this.props.submitStudents[this._curIdx][this._sIdx].student.id + '';
                gender = this.props.submitStudents[this._curIdx][this._sIdx].student.gender ? this.props.submitStudents[this._curIdx][this._sIdx].student.gender : '';
           
                if(this._sIdx === 0) prev = false;
                if(this._sIdx === this.props.submitStudents[this._curIdx].length - 1) next = false;
                else if(this._sIdx > -1 && this._sIdx < this.props.submitStudents[this._curIdx].length - 1) {
                    let nextImages = this.props.submitStudents[this._curIdx][this._sIdx + 1].images;
                    if(!nextImages || nextImages.length < 1) next = false;
                }
            }
        }
        // console.log('======> prev', prev, 'next', next);
        return (
            <CoverPopup className="result_popup" view={this.m_view} onClosed={this._onBack.bind(this,from,studentId)}>
                 <MALiveHeader
                    view={this.m_view}
                    thumb={thumb}
                    showhide={showhide}
                    studentName={studentName}
                    livePoint={livePoint}
                    gender={gender}
                 />
                 <div className="progress_dot">
                     {
                         (images && images.length > 1) && images.map((item,index) => {
                            return(
                                <span key={index} className={index === this._imageIdx ? 'on' : ''} onClick={this._onPage.bind(this,index)}/>
                            );
                         })
                     }
                   
                 </div>
                <div className="images_container">
                    <SwiperComponent
                        ref={this._refSwiper}
                        direction="horizontal"
                        observer={true}
                        // slidesPerView="auto"
                        // freeMode={true}
                        // mousewheel={true}			
                        noSwiping={false}
                        // followFinger={true}
                    >
                    {
                        (images && images.length > 0) && images.map((item,index) => {
                            return(
                                <img
                                    key={'q_' + index}
                                    className="submitimg" 
                                    src={item}
                                    // style={{display: this._imageIdx === index ? '' : 'none'}}
                                />
                            );
                        })
                    }
                    </SwiperComponent>
                </div>
                {(images && images.length > 1) && (
                    <>
                    <div className="navi_left">
                        <ToggleBtn className="right" disabled={this._imageIdx === images.length - 1 ? true : false} onClick={this._onRNavi}/>
                        <ToggleBtn className="left" disabled={this._imageIdx <= 0 ? true : false} onClick={this._onLNavi}/>
                    
                    </div>
                    <div className="navi_right">
                        <ToggleBtn className="right" disabled={this._imageIdx === images.length - 1 ? true : false} onClick={this._onRNavi}/>
                        <ToggleBtn className="left" disabled={this._imageIdx <= 0 ? true : false} onClick={this._onLNavi}/> 
                    </div>
                    </>
                    )
                }
        
                <div className="control_page" style={{display: from === 'list' ? '' : 'none'}}>
                    <button className={"btn_left" + (!prev ? " off" : "")} onClick={!prev ? undefined : this._onPrev} />
                    <button className="btn_menu" onClick={this._onBack.bind(this,from,studentId)} />
                    <button className={"btn_right" + (!next ? " off" : "")} onClick={!next ? undefined : this._onNext} />
                </div>
                <div className="btn_container" style={{display: from === 'presenter' ? '' : 'none'}}>
                    <button className="btn_01" onClick={this._onBack.bind(this,from,studentId)}>Back</button>
                </div>

            </CoverPopup>
        );
    }
}

interface IPresenter {
    view: boolean;
    submitStudents: ISubmitStudent[][];
    showDetail: (studentId: string) => void;
    hidePresenter: () => void;
}

@observer 
class Presenter extends React.Component<IPresenter> {
    @observable private _step: 'setting'|'choose' = 'setting';
    @observable private submitUserNum: number = 0; 
    @observable private userCnt: number = 0; 
    @observable private randomThumb0: string = '';
    @observable private randomThumb1: string = '';
    @observable private randomThumb2: string = '';
    @observable private randomThumb3: string = '';
    @observable private randomName: string = '';
    @observable private displayMode: string = '1';
    @observable private randomTime: boolean = false;
    
    private students: IStudent[] = [];
    private studentsThumb: string[] = [];
    private studentsName: string[] = [];

    private _onMinus = () => {
        if(!this.props.view) return;
        if(this.userCnt <= 1) return; 
        App.pub_playChoiceBtn();
        this.userCnt--;
    }
    private _onPlus = () => {
        if(!this.props.view) return;
        if(this.userCnt === 0) return; 
        if(this.userCnt >= this.submitUserNum || this.userCnt === 4) return;
        App.pub_playChoiceBtn();
        this.userCnt++;
    }
    private _hidePresenter = () => {
        if(!this.props.view) return;
        App.pub_playBtnTab();
        this.props.hidePresenter();
    }
    private _showDetail = (studentId: string) => {
        if(!this.props.view) return;
        App.pub_quizDone();
        this.props.showDetail(studentId);
    }
    private _onBack = () => { 
        if(!this.props.view) return;
        App.pub_playBtnTab();
        this._step = 'setting';
    }
    private _onSuffle = () => {
        this.students = [];
        while(true) {
            let ranval = Math.floor((Math.random() * App.students.length) + 0);
            let sidx = this.students.findIndex((item) => item.id === App.students[ranval].id);
            let nosidx =  _.findIndex(this.props.submitStudents[0],{student: {id: App.students[ranval].id}});

            if(sidx > -1 || this.props.submitStudents[0][nosidx].nosubmit) {
                // console.log('중복 되는 학생이 있어 다시 랜덤값으로 학생 선택함')
                continue;
            } else {
                this.students.push({
                    id: App.students[ranval].id,
                    name: App.students[ranval].name,
                    nickname: App.students[ranval].nickname,
                    thumb: App.students[ranval].thumb,
                    avatar: App.students[ranval].avatar,
                    displayMode: App.students[ranval].displayMode,
                    gender: App.students[ranval].gender
                });
            }
            this.displayMode = this.students[0].displayMode!;
            if(this.students.length === this.userCnt) {
                break;
            }    
        }
    }
    private _onPick = () => {
        if(!this.props.view) return;
        if(this.userCnt === 0) return; 
        App.pub_pick_presenter();

        this._step = 'choose';
        this.randomThumb0 = this.studentsThumb[0]
        this.randomName = this.studentsName[0]
        this._randomStart();
    }
    private _randomStart = () => {
        if(this.randomTime) return; // 랜덤 진행중이므로 리턴
        this.randomTime = true;
        this._onSuffle();

        App.students.map((item, idx) => {
            if(this.displayMode === '1') {
                if(item.thumb && item.thumb !== '') {
                    this.studentsThumb.push(item.thumb)
                } else {
                    this.studentsThumb.push(item.name.substring(0,2).toUpperCase())
                    // this.studentsThumb.push(item.name)
                }
                this.studentsName.push(item.name)
            } else if (this.displayMode === '2') { 
                this.studentsThumb.push(item.avatar)
                this.studentsName.push(item.nickname)
            }
        })
        this._setTime();
        setTimeout(() => {
            // clearInterval(set);
            this.randomTime = false;
        }, 2000);
    }
    private _setTime = () => {
        setTimeout(() => {    
            this.randomThumb0 = this.studentsThumb[Math.floor(Math.random() * this.studentsThumb.length)]
            this.randomThumb1 = this.studentsThumb[Math.floor(Math.random() * this.studentsThumb.length)]
            this.randomThumb2 = this.studentsThumb[Math.floor(Math.random() * this.studentsThumb.length)]
            this.randomThumb3 = this.studentsThumb[Math.floor(Math.random() * this.studentsThumb.length)]
            this.randomName = this.studentsName[Math.floor(Math.random() * this.studentsName.length)]
            if(this.randomTime) this._setTime();
        }, 50)
    }
    public componentDidUpdate(prev: IPresenter) {
        if(this.props.view && !prev.view) {
            this._step = 'setting';
            this.submitUserNum = App.students.length - this.props.submitStudents[0].filter((item) => item.nosubmit).length;
            this.userCnt = this.submitUserNum >= 4 ? 4 : this.submitUserNum;
        }
    }
    public render() {
        const {view} = this.props;
        return(
        <div className="presenter" style={{display: view ? '' : 'none'}}>
            <div className="presenter_content">
                <h3>Presenter</h3>
                <button className="btn_close" onClick={this._hidePresenter}/>
                <div className="presenter_wrap" style={{display: this._step === 'choose' ? '' : 'none'}}>
                    <ul>
                        {this.students.map((item,index) => {
                            return(
                            <li key={'q_' + index} className={this.randomTime ? 'on random' : 'on click'}>
                                {this.randomTime ? undefined : <span className="ico_heart" />}
                                {this.randomTime ? 
                                    // 랜덤중
                                    <div className="img">
                                        {item.displayMode === '1' ? 
                                            // 1 = 아이디, 썸네일일 경우
                                            <div>
                                                {index === 0 ? <div><img src={this.randomThumb0} style={{display: item.thumb === '' ? 'none' : ''}} /></div> : undefined}
                                                {index === 1 ? <div><img src={this.randomThumb1} style={{display: item.thumb === '' ? 'none' : ''}} /></div> : undefined}
                                                {index === 2 ? <div><img src={this.randomThumb2} style={{display: item.thumb === '' ? 'none' : ''}} /></div> : undefined}
                                                {index === 3 ? <div><img src={this.randomThumb3} style={{display: item.thumb === '' ? 'none' : ''}} /></div> : undefined}
                                                {index === 0 ? <div className={item.gender === 'F' ? 'defaultImg_f' : 'defaultImg_m'} style={{display: item.thumb === '' ? '' : 'none'}}><div>{this.randomThumb0}</div></div> : undefined}
                                                {index === 1 ? <div className={item.gender === 'F' ? 'defaultImg_f' : 'defaultImg_m'} style={{display: item.thumb === '' ? '' : 'none'}}><div>{this.randomThumb1}</div></div> : undefined}
                                                {index === 2 ? <div className={item.gender === 'F' ? 'defaultImg_f' : 'defaultImg_m'} style={{display: item.thumb === '' ? '' : 'none'}}><div>{this.randomThumb2}</div></div> : undefined}
                                                {index === 3 ? <div className={item.gender === 'F' ? 'defaultImg_f' : 'defaultImg_m'} style={{display: item.thumb === '' ? '' : 'none'}}><div>{this.randomThumb3}</div></div> : undefined}
                                            </div>
                                        :
                                            // 2 = 닉네임, 아바타일 경우
                                            <div>
                                                <div style={{display: index === 0 ? '' : 'none' }}><img src={this.randomThumb0} style={{display: item.avatar === '' ? 'none' : ''}} /></div>
                                                <div style={{display: index === 1 ? '' : 'none' }}><img src={this.randomThumb1} style={{display: item.avatar === '' ? 'none' : ''}} /></div>
                                                <div style={{display: index === 2 ? '' : 'none' }}><img src={this.randomThumb2} style={{display: item.avatar === '' ? 'none' : ''}} /></div>
                                                <div style={{display: index === 3 ? '' : 'none' }}><img src={this.randomThumb3} style={{display: item.avatar === '' ? 'none' : ''}} /></div>
                                            </div>
                                        }
                                    </div>
                                :
                                    // 랜덤 끝남
                                    <div className="img" onClick={this._showDetail.bind(this,item.id)}>
                                        {/* {item.thumb === '' && <div className={item.gender === 'F' ? 'defaultImg_f' : 'defaultImg_m'}><div>{item.name.substring(0,2).toUpperCase()}</div></div>} */}
                                        {item.displayMode === '1' ? 
                                            // 1 = 아이디, 썸네일일 경우
                                            <div>
                                                <img src={item.thumb} style={{display: item.thumb === '' ? 'none' : ''}} />
                                                <div className={item.gender === 'F' ? 'defaultImg_f' : 'defaultImg_m'} style={{display: item.thumb === '' ? '' : 'none'}}><div>{item.name.substring(0,2).toUpperCase()}</div></div>
                                            </div>
                                        :
                                            // 2 = 닉네임, 아바타일 경우
                                            <div>
                                                <img src={item.avatar} style={{display: item.avatar === '' ? 'none' : ''}} />
                                                <img src={`${_math_lib_}images/default_candy.png`} style={{display: item.avatar === '' && item.gender === 'F' ? '' : 'none'}} />
                                                <img src={`${_math_lib_}images/default_cheese.png`} style={{display: item.avatar === '' && item.gender === 'M' ? '' : 'none'}} />
                                            </div>
                                        }
                                    </div>
                                }
                                {this.randomTime ? 
                                    // 랜덤중
                                    <p>{this.randomName}</p>
                                :
                                    // 랜덤 끝남
                                    <p>{(item.displayMode !== undefined && item.displayMode === '1') ? item.name : item.nickname}</p>
                                }
                            </li>
                            );
                        })}

                    </ul>
                    <div className="btn_control">
                        <button className="btn_01" onClick={this._onBack}>Back</button>
                        <button className="btn_02" onClick={this._onPick}>Again</button>
                    </div>
                </div>
                <div className="timesetting_wrap" style={{display: this._step === 'setting' ? '' : 'none'}}>
                    <div className="timebox">
                        <div className="time">{this.userCnt}</div>
                        <button className="btn_time minus" onClick={this._onMinus}/>
                        <button className="btn_time plus" onClick={this._onPlus}/>
                    </div>
                    <div className="btn_control">
                        <button className="btn_02" onClick={this._onPick}>Pick</button>
                    </div>
                </div>
            </div>
        </div>
        );
    }
}

interface ISubmitList {
    view: boolean;
    type: '2'|'3'|'4';
    viewPresenter: boolean;
    submitStudent: ISubmitStudent[][];
    showhide: 'show'|'hide'|'';
    hidePresenter: () => void;
    onSendLiveget: (studentId: string)  => void;
    onSendPresenter: (studentId: string) => void;
    isReset: boolean;
    isAllFlip: boolean;
    quizIdx: number;
    onNext: (studentId: string) => void;
    onPrev: (studentId: string) => void;
    typeStrategy?: string; // 'module_strategy' | 'topic_strategy'
    strategyComplete?: boolean; // topic_strategy 
}
@observer
export class SubmitList extends React.Component<ISubmitList> {
    @observable private _viewPresenter: boolean = false;
    @observable private isFlip: boolean[] = [];
    @observable private _viewDetail: boolean = false;
    @observable private _from: 'presenter'|'list' = 'list';
    @observable private _studentId: string = '';
    private isFinished: boolean = false;
    private _onClick = (idx: number, studentId: string) => {
        App.pub_playBtnTab();
        if(this.isFinished) {
            this._viewDetail = true;
            this._from = 'list';
            this._studentId = studentId;
            this.props.onSendPresenter(studentId);
        } else {
            this.isFlip[idx] = !this.isFlip[idx];
        }
   
    }
    private _showDetailPopup = (studentId: string) => {
        // 프리젠터 선택 화면에서 호출 하는 함수 
        this._from = 'presenter';
        this._viewDetail = true;
        this._studentId = studentId;
        this.props.onSendPresenter(studentId);
    }
    private _closeDetailPopup = (from: 'presenter' | 'list',studentId: string) => {
        this._viewDetail = false;
        if(from === 'presenter') {
            this.props.onSendLiveget(studentId);
        }
    }
    private onNext = (studentId: string) => {
        this.props.onNext(studentId);
    }
    private onPrev = (studentId: string) => {
        this.props.onPrev(studentId);
    }
    public componentWillReceiveProps(next: ISubmitList) {
        if(!this.props.isReset && next.isReset) {
            if(this.isFlip.length > 0) {
                for(let i = 0; i < this.isFlip.length; i++) {
                    this.isFlip[i] = false;
                }
            }
            this.isFinished = false;
        }// retry 버튼 눌러서 리셋 시킬 경우 
        if(this.isFlip.length <= 0) {
            for(let i = 0; i < next.submitStudent[0].length; i++) {
                this.isFlip.push(false);
            }
        }
        if(this.props.typeStrategy && this.props.typeStrategy === 'topic_strategy') {
            if(this.props.submitStudent[0] && next.submitStudent[0] && this.props.submitStudent[0].length !== next.submitStudent[0].length) {
                while(this.isFlip.length>0) this.isFlip.pop();
                for(let i = 0; i < next.submitStudent[0].length; i++) this.isFlip.push(false);
            }
        }
    }
    public componentDidUpdate(prev: ISubmitList) {
        if(this.props.view && !prev.view) {
            this.isFinished = false;
            this._from = 'list';
        } 
        if(this.props.isAllFlip && !prev.isAllFlip) {
           for(let i = 0; i < this.isFlip.length; i++) {
               this.isFlip[i] = true;
           }
           this.isFinished = true; 
        }// 제출이 전부 끝났을때 
        if(this.props.strategyComplete && !prev.strategyComplete) {
            for(let i = 0; i < this.isFlip.length; i++) {
                this.isFlip[i] = true;
            }
            this.isFinished = true; 
        }
 
        
    }
    public render() {
        const {type, submitStudent, showhide} = this.props;
        let className = ''; 
        if(type === '3') {
            className = 'r3';
        } else if(type === '4') {
            className = 'r4';
        }
     
        let tmpSubmitStudents: ISubmitStudent[][] = [[]];
        if(submitStudent && submitStudent.length > 0) {
            for(let i = 0; i < submitStudent.length; i++) {
                tmpSubmitStudents.push(submitStudent[i]);
            }
            tmpSubmitStudents[0] = (_.orderBy(submitStudent[0],['trycnt','order'],['desc','asc']));
        }
        // console.log('tmpSubmitStudents', tmpSubmitStudents);
        return (
        <>
        <div className={'content ' + (className)}>
            <div className="thumbset">
                {
                    /* 첫번째  문제에 대한 결과값을  대표 썸네일로 하기때문에 submitStudent[0] 으로 지정*/
                    (tmpSubmitStudents && tmpSubmitStudents[0]).map((item,index) => {
                        if(item.trycnt > 0) {
                            // 제출 한 경우
                            let isNew = false; 
                            if(item.new) {
                                isNew = true;
                            } else {
                                isNew = false;
                            }
                            const name = item.student.displayMode === '2' && item.student.nickname ? item.student.nickname : item.student.name;
                            const image = item.student.displayMode === '2' ? item.student.avatar : item.student.thumb;
                            return(
                                <div key={'q_' + index} className={'thumb_cnt ' + (this.isFlip[index] ? '' : 'user')} onClick={this._onClick.bind(this,index,item.student.id)}>
                                    <div className="front">
                                        <span className="new_icon" style={{display: isNew ? '' : 'none'}}/>
                                        {image === '' && <div className={item.student.gender === 'F' ? 'defaultImg_f' : 'defaultImg_m'}><div>{name.substring(0,2).toUpperCase()}</div></div>}
                                        {image !== '' && <img src={image} style={{display: showhide === 'show' ? '' : 'none'}}/>}                             
                                        <img src={`${_math_lib_}images/penimage.png`} style={{display: showhide === 'hide' ? '' : 'none'}}/>                                     
                                        <div className="name" style={{display: showhide === 'show' ? '' : 'none'}}>
                                        {name}
                                        </div>
                                    </div>
                                    <div className="back">
                                        <span className="new_icon" style={{display: isNew ? '' : 'none'}}/>
                                        <img src={item.images && item.images.length > 0 ? item.images[0] : `${_math_lib_}images/img_send_error.png`} />
                                        <div className="title user" style={{display: showhide === 'show' ? '' : 'none'}}>
                                            {image === '' && <div className={item.student.gender === 'F' ? 'defaultImg_f' : 'defaultImg_m'}><div>{name.substring(0,2).toUpperCase()}</div></div>}
                                            {image !== '' && <div className="img"><img src={image} /></div>}
                                            {name}
                                            {/* 그린라이브 말풍선 표시 */}
                                            <div className="live_bubble" style={{display: item.livePoint > 0 ? '' : ' none'}}>{item.livePoint}</div>
                                        </div>
                                    </div>
                                </div>
                            );
                        } else {
                            // 제출 안한 경우
                            const name = item.student.displayMode === '2' && item.student.nickname ? item.student.nickname : item.student.name;
                            const image = item.student.displayMode === '2' ? item.student.avatar : item.student.thumb;
                            return(
                                <div key={'q_' + index} className="thumb_cnt">
                                    <div className="not_submitted" />
                                    {showhide === 'show' && (<div className="title user">
                                        {image === '' && <div className={item.student.gender === 'F' ? 'defaultImg_f' : 'defaultImg_m'}><div>{name.substring(0,2).toUpperCase()}</div></div>}
                                        {image !== '' && <div className="img"><img src={image} /></div>}
                                        {name}
                                    </div>)}
                                </div>
                            );
                        }
                    })
                }
            </div>
        </div>
        <Presenter
            view={this.props.viewPresenter}
            submitStudents={_.cloneDeep(tmpSubmitStudents)}
            hidePresenter={this.props.hidePresenter}
            showDetail={this._showDetailPopup}
        />
        <DetailPopup
            view={this._viewDetail}
            showhide={showhide}
            from={this._from}
            submitStudents={_.cloneDeep(tmpSubmitStudents)}
            onClosed={this._closeDetailPopup}
            onSendLiveget={this.props.onSendLiveget}
            quizIdx={this.props.quizIdx}
            studentId={this._studentId}
            onNext={this.onNext}
            onPrev={this.onPrev}
        />
        </>
        );
    }
}
interface ISendnShare {
    view: boolean;
    type: 'penrecord' | 'video' | 'image'; 
    submitStudent: ISubmitStudent[][];
    isComplete: boolean;
    onSendPresenter: (studentId: string, sshowhide: 'show'|'hide'|'') => void;
    onSendLiveget: (studentId: string) => void;
    onHidePresenter: () => void;// Presenter 창이 닫힐 경우 호출됨
    checkIsPlayed: () => void;// 한번 플레이 했는지 여부 확인 하기 위해 
    quizIdx: number;
    isReset: boolean;
    isPlayed: boolean;// 한번 플레이 했는지 여부 확인 하기 위해 
    onNext: (studentId: string, sshowhide: 'show'|'hide'|'') => void;
    onPrev: (studentId: string, sshowhide: 'show'|'hide'|'') => void;
    clsIdx: number;// 클래스 아이디 
    curriculumid: number;// 커리큘럼 아이디 
    typeStrategy?: string; // 'module_strategy' | 'topic_strategy'
    strategyComplete?: boolean; // topic_strategy 일 경우만 사용 함
}

@observer
export class SendnShare extends React.Component<ISendnShare> {
    @observable private _type: 'show'|'hide'|'' = 'show';
    @observable private _step: 'selection'|'list' = 'selection';
    @observable private _listType: '2'|'3'|'4' = '3';
    @observable private _submitusers: ISubmitStudent[][] = [];
    @observable private _viewPresenter: boolean = false;
    @observable private isAllFlip: boolean = false;
    constructor(props: ISendnShare) {
        super(props);    
    }
    private _showPresenter = () => {
        if(!this.props.view) return;
        if(!this.isAllFlip) return;// 전부 제출 한 경우에만 볼수 있게 하기 위해 
        /* 211201 최순철 모든 템플릿 상황을 고려하기 어려워 강제적으로 STYLE 추가 및 삭제 */
        document.querySelector('#wrap > .content-container')?.setAttribute('style', 'z-index: 1000;');
        document.querySelector('.progressWrap')?.setAttribute('style', 'display: none');
        document.querySelector('.btn_heart')?.setAttribute('style', 'display: none');

        App.pub_quizDone();
        this._viewPresenter = true;
    }
    private _hidePresenter = () => {
        /* 211201 최순철 모든 템플릿 상황을 고려하기 어려워 강제적으로 STYLE 추가 및 삭제 */
        document.querySelector('#wrap > .content-container')?.removeAttribute('style');
        document.querySelector('.progressWrap')?.removeAttribute('style');
        document.querySelector('.btn_heart')?.removeAttribute('style');

        this._viewPresenter = false;
        this.props.onHidePresenter();
    }
    private _onShowHide = (type: 'show'|'hide') => {
        if(type === 'show') {
            this._type = 'show';
            this._step = 'list';
        } else if(type === 'hide') {
            this._type = 'hide';
            this._step = 'list';
        }
        App.pub_playBtnTab();
        this.props.checkIsPlayed();
    }
    private onSendLiveget = (studentId: string) => {
        this.props.onSendLiveget(studentId);
    }
    private onSendPresenter = (studentId: string) => {
        this.props.onSendPresenter(studentId,this._type);
    } 
    private _toggleBtn = (type: 'show'|'hide') => {
        App.pub_playBtnTab();
        if(type === 'show') {
            this._type = 'show';
        } else if(type === 'hide') {
            this._type = 'hide';
        }
    }
    private _callBackFnc = (studentid: string,livepoint: number) => {
        // console.log("studentid",studentid,"livepoint",livepoint);
        let data = {live: livepoint};
        felsocket.sendPADToID(studentid,$SocketType.SHOW_GIFTBOX,data);
    }
   
    private _onClickList = (type: '2'|'3'|'4') => {
        App.pub_playBtnTab();
        this._listType = type;
    }

    private onNext = (studentId: string) => {
        this.props.onNext(studentId,this._type);
    }
    private onPrev = (studentId: string) => {
        this.props.onPrev(studentId,this._type);
    }
    public componentWillReceiveProps(next: ISendnShare) {
        if(next.submitStudent.length > 0) {
            this._submitusers = _.cloneDeep(next.submitStudent);
        }
    }
    public componentDidUpdate(prev: ISendnShare) {
        if(this.props.view && !prev.view) {
            this._listType = '3';
            this._viewPresenter = false;
            this.isAllFlip = false;
            if(!this.props.isPlayed)this._step = 'selection'; // 한번도 플레이 된적 없을때만 
        }

        if((this.props.isComplete && !prev.isComplete) || (this.props.isComplete && prev.isComplete)) {
            // 모두 제출 완료 했을 경우
            this.isAllFlip = true;
        } else {
            this.isAllFlip = false;
        }
    }
    public render() {
        const {view,typeStrategy} = this.props;
        return ( 
        	<div className={'t_sendshare' + (this._step === 'selection' ? ' selection' : '')} style={{display: view ? '' : 'none'}}>
				<div className="top_header">
					<div className={this.isAllFlip ? 'presenter btn complete' : 'presenter btn'} onClick={this._showPresenter}>Presenter</div>
					<div className="select_list">
						<button className={'list_01' + (this._listType === '2' ? ' on' : '')} onClick={this._onClickList.bind(this,'2')}><span/><span/></button>
						<button className={'list_02' + (this._listType === '3' ? ' on' : '')} onClick={this._onClickList.bind(this,'3')}><span/><span/><span/></button>
						<button className={'list_03' + (this._listType === '4' ? ' on' : '')} onClick={this._onClickList.bind(this,'4')}><span/><span/><span/><span/></button>
					</div>
					<div className="msg_text" style={{opacity: this.isAllFlip ? 0 : 1}}>Waiting for student responses...</div>{/* 풀이가 전부 완료 되지 않았을때 */}
				</div>
				<div className="openhiding" style={{display: this._step === 'list' ? '' : 'none'}}>
                    {typeStrategy === 'module_strategy' && <div className="strategy">
						<button className={'on'}>A Strategy</button>
						<button className={''}>B Strategy</button>
					</div>/* Module strategy 일때만 나오게*/}
					<div className="inner">
						<button className={this._type === 'show' ? 'on' : ''} onClick={this._toggleBtn.bind(this,'show')}>Show</button>
						<button className={this._type === 'hide' ? 'on' : ''} onClick={this._toggleBtn.bind(this,'hide')}>Hide</button>
					</div>
				</div>
                <div className="content selection" style={{display: this._step === 'selection' ? '' : 'none'}}>
					<div className="profile">
						<img src={`${_math_lib_}images/ico_student_profile.png`} />
						<p className="t1">Student info</p>
						<p className="t2" style={{opacity: this.isAllFlip ? 0 : 1}}>Waiting for student responses...</p>{/* 풀이가 전부 완료 되지 않았을때 */}
					</div>
					<div className="btn_set">
						<button  onClick={this._onShowHide.bind(this,'show')}>
							<span>Show</span>
						</button>
						<button  onClick={this._onShowHide.bind(this,'hide')}>
							<span>Hide</span>
						</button>
					</div>
				</div>
                <SubmitList
                    view={this._step === 'selection'}
                    viewPresenter={this._viewPresenter}
                    type={this._listType}
                    submitStudent={this._submitusers}
                    showhide={this._type}
                    isReset={this.props.isReset}
                    onSendLiveget={this.onSendLiveget}
                    onSendPresenter={this.onSendPresenter}
                    hidePresenter={this._hidePresenter}
                    isAllFlip={this.isAllFlip}
                    quizIdx={this.props.quizIdx}
                    onNext={this.onNext}
                    onPrev={this.onPrev}
                    typeStrategy={typeStrategy}
                    strategyComplete={this.props.strategyComplete}
                />
			</div>
        );
    }
}
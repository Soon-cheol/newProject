import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Observer, observer, inject } from 'mobx-react';
import { observable } from 'mobx';
import * as _ from 'lodash';
import { App } from '../App';
import * as kutil from '@common/util/kutil';
import * as felsocket from '../felsocket';
import { AlertPopup } from './AlertPopup';

export interface IProblemBGColor {
	main: string;
	right: string;
}

interface IProblemList {
    view: boolean;
    submitType: string[];
    type: 1|2; // 1: 분할 없음 2: 2분할  
    disable: boolean; // 문제 목록을 클릭 할수 있는지 여부 
    quizresults: IQuizResult[];
    submitusers: ISubmitStudent[][];
    checkedList: boolean[]; // 체크한 리스트 목록 
    retryList: boolean[];
    init: boolean;
    isEnd: boolean;
    bgColors?: IProblemBGColor[];
    submitlistClick: (type: string, qseq: number) => void;// 퀴즈번호와 제출 타입을 보낸다
    onClick: (type: 1|2) => void;
    onType: (type: string, index: number) => void;
    checkClick: (index: number, checked: boolean) => void;
    retryClick: (index: number) => void;
    selectQuiz: (idx: number) => void;
    onExitBook?: () => void;
    onExitClass?: () => void;
    onLogout?: () => void;
}

interface IProblemQuizResult extends IQuizResult {
    idx: number;
}

@observer
export class ProblemList extends React.Component<IProblemList> {
    @observable private quizList: IProblemQuizResult[][] = [];
    @observable private _viewLeftMenu: boolean = false;
    private elCheckBtn: HTMLButtonElement[] = [];
    private elRetryBtn: HTMLButtonElement[] = [];
    private elSubmit: HTMLUListElement[] = [];
    private el: HTMLElement[][] = [];
    @observable private _viewAlert = 0;
    private alertMsg = '';
    constructor(props: IProblemList) {
        super(props);
        for(let i = 0; i < this.props.quizresults.length; i++) {
            this.el.push([]);
        }
  
    }
    private _onClick(index: 1|2) {
        App.pub_playBtnTab();
        this.props.onClick(index);
    }
    private doExitClass = () => {
        this._viewAlert = 0;
        felsocket.clearTPenTool();
        felsocket.exitClass();
    }
    private doLogOut = () => {
        this._viewAlert = 0;
        felsocket.clearTPenTool();
        felsocket.logOut();
    }
    private cancelAlertPopup = () => {
        this._viewAlert = 0;
    }

    public componentWillReceiveProps(next: IProblemList) {
        while(this.quizList.length > 0)this.quizList.pop();
        if(next.quizresults.length > 0 && next.quizresults) {
            let leng = this.props.quizresults.length / 2;
            let idx = 0;
            for(let i = 1; i <= leng; i++) {
                const qresult  = _.filter(this.props.quizresults,{qnumber: i});
                let pResults : IProblemQuizResult[] = [];
                for(let j = 0; j < qresult.length; j++) {
                    pResults.push({
                        idx: idx++,
                        seq: qresult[j].seq,
                        thumb: qresult[j].thumb,
                        url: qresult[j].thumb,
                        allusers: qresult[j].allusers,
                        submitusers: qresult[j].submitusers,
                        heart2: qresult[j].heart2,
                        heart1: qresult[j].heart1,
                        heart0: qresult[j].heart0,
                        nosubmit: qresult[j].nosubmit,
                        qnumber: qresult[j].qnumber,
                        difiicult: qresult[j].difiicult,
                    });
                }
                this.quizList.push(pResults);
            }
        }  
    }
    public componentDidUpdate(prev: IProblemList) {
        if(this.props.view && !prev.view) { 
            this._viewAlert = 0;
        } else if(!this.props.view && prev.view) {
            this._viewAlert = 0;
        }
    }
  
    public render() {
        const {quizresults,selectQuiz,submitusers,submitType} = this.props;
        return (
        <>
          {/* t_problem에 topic_strategy를 넣어주면 나타납니다 */}
        <div className="t_problem" style={{display: this.props.view ? '' : 'none'}}>
          
            <div className="top_header">
                {/* <button className="btn_menu" onClick={this.openLeftMenu} /> */}
                {/* <div className={'left_menu' + (this._viewLeftMenu ? ' show' : '')}>
                    <div className="innerbox">
                        <div className="close">
                            <button className="btn_close" onClick={this.closeLeftMenu} />
                        </div>
                        <ul>
                            <li onClick={this.onExitBook}>Lesson</li>
                            <li onClick={this.onExitClass}>End Class</li>
                            <li onClick={this.logOut}>Logout</li>
                        </ul>
                    </div>
                </div> */}
                <div className="worksheet">
                    Worksheet Guide
                </div>
                <div className="select_list">
                    <button className={'list_01' + (this.props.type === 1 ? ' on' : '')} onClick={this._onClick.bind(this,1)}/>
                    <button className={'list_02' + (this.props.type === 2 ? ' on' : '')} onClick={this._onClick.bind(this,2)}/>
                </div>
            </div>
            <div className={'content' + (this.props.type === 2 ? ' view12' : '')}>
                {
                    this.quizList.map((item,index) => {
                        return(
                            <div className="thumbset" key={'qssss_' + index}>
                                {
                                    item.map((innerItem,innerIndex) => {
                                        let jsx: JSX.Element[] = [];
                                        let leng = innerItem.difiicult !== undefined ? innerItem.difiicult : 0; 
                                        for(let i = 0; i < leng; i++) {
                                            jsx.push(<span key={i}/>);
                                        }
                                        return (
                                        <div className={'thumb_cnt' + (innerIndex > 0 ? ' right' : ' left')} key={index + '_' + innerIndex} onClick={selectQuiz.bind(this,innerItem.idx)}>
                                            <div className="title">
                                                <div 
                                                    className="num"
                                                >
                                                    {innerItem.qnumber + (innerIndex === 1 ? '+' : '')}
                                                </div>

                                                {/* strategy 일 경우 사용 */}
                                                {/* <ul className="step" style={{display:'none'}}>
                                                    <li className="on">Step1</li>
                                                    <li>Step2</li>
                                                    <li>Step3</li>
                                                </ul> */}
                                                <ul 
                                                    className="result"
                                                    style={{display: (submitusers[innerItem.idx].length > 0) ||  this.props.retryList[innerItem.idx] ? '' : 'none'}}
                                                    ref={(ref) => {
                                                        if(ref) {
                                                            if(this.elSubmit[innerItem.idx]) return;
                                                            this.elSubmit[innerItem.idx] = ref;
                                                            if(this.elSubmit[innerItem.idx] ) {
                                                                this.elSubmit[innerItem.idx].addEventListener('click',(ev: MouseEvent) => {
                                                                    ev.stopPropagation();
                                                                    switch(submitType[innerItem.idx]) {
                                                                        case '1':
                                                                            if(quizresults[_.findIndex(quizresults,{seq: innerItem.seq})].heart2 < 1) return;
                                                                            break;
                                                                        case '2':
                                                                            if(quizresults[_.findIndex(quizresults,{seq: innerItem.seq})].heart1 < 1) return;
                                                                            break;
                                                                        case '3':
                                                                            if(quizresults[_.findIndex(quizresults,{seq: innerItem.seq})].heart0 < 1) return;
                                                                            break;
                                                                        case '4':
                                                                            if(quizresults[_.findIndex(quizresults,{seq: innerItem.seq})].nosubmit < 1) return;
                                                                            break;
                                                                        default:
                                                                    }
                                                                    this.props.submitlistClick(submitType[innerItem.idx],innerItem.idx);
                                                                    
                                                                });
                                                            }
                                                        }
                                                    }}
                                                >
                                                    <li 
                                                        className={'type01' + (quizresults[_.findIndex(quizresults,{seq: innerItem.seq})].heart2 > 0 ? ' on' : '')}  
                                                        ref={(ref) => {
                                                            if(ref) {
                                                                if(this.el[innerItem.idx][0]) return;
                                                                this.el[innerItem.idx][0] = ref;
                                                                if(this.el[innerItem.idx][0]) {
                                                                    this.el[innerItem.idx][0].addEventListener('click',() => {
                                                                        this.props.onType('1',innerItem.idx);
                                                                    });
                                                                }
                                                            }
                                                        }} 
                                                    >
                                                        {quizresults[_.findIndex(quizresults,{seq: innerItem.seq})] ? quizresults[_.findIndex(quizresults,{seq: innerItem.seq})].heart2 : -1}
                                                    </li>
                                                    <li 
                                                        className={'type02' + (quizresults[_.findIndex(quizresults,{seq: innerItem.seq})].heart1 > 0 ? ' on' : '')}  
                                                        ref={(ref) => {
                                                            if(ref) {
                                                                if(this.el[innerItem.idx][1]) return;
                                                                this.el[innerItem.idx][1] = ref;
                                                                if(this.el[innerItem.idx][1]) {
                                                                    this.el[innerItem.idx][1].addEventListener('click',() => {
                                                                        this.props.onType('2',innerItem.idx);
                                                                    });
                                                                }
                                                            }
                                                        }}  
                                                    >
                                                        {quizresults[_.findIndex(quizresults,{seq: innerItem.seq})] ? quizresults[_.findIndex(quizresults,{seq: innerItem.seq})].heart1 : -1}
                                                    </li>
                                                    <li 
                                                        className={'type03' + (quizresults[_.findIndex(quizresults,{seq: innerItem.seq})].heart0 > 0 ? ' on' : '')}   
                                                        ref={(ref) => {
                                                            if(ref) {
                                                                if(this.el[innerItem.idx][2]) return;
                                                                this.el[innerItem.idx][2] = ref;
                                                                if(this.el[innerItem.idx][2]) {
                                                                    this.el[innerItem.idx][2].addEventListener('click',() => {
                                                                        this.props.onType('3',innerItem.idx);
                                                                    });
                                                                }
                                                            }
                                                        }} 
                                                    >
                                                        {quizresults[_.findIndex(quizresults,{seq: innerItem.seq})] ? quizresults[_.findIndex(quizresults,{seq: innerItem.seq})].heart0 : -1}
                                                    </li>
                                                    <li 
                                                        className={'type04' + (quizresults[_.findIndex(quizresults,{seq: innerItem.seq})].nosubmit > 0 ? ' on' : '')}   
                                                        ref={(ref) => {
                                                            if(ref) {
                                                                if(this.el[innerItem.idx][3]) return;
                                                                this.el[innerItem.idx][3] = ref;
                                                                if(this.el[innerItem.idx][3]) {
                                                                    this.el[innerItem.idx][3].addEventListener('click',() => {
                                                                        this.props.onType('4',innerItem.idx);
                                                                    });
                                                                }
                                                            }
                                                        }} 
                                                    >
                                                        {quizresults[_.findIndex(quizresults,{seq: innerItem.seq})] ? quizresults[_.findIndex(quizresults,{seq: innerItem.seq})].nosubmit : -1}
                                                    </li>
                                                </ul>
                                            </div>
                                            {(innerItem.thumb.substring(0,8) === "https://" || innerItem.thumb.substring(0,7) === "http://") ? (
                                            <img src={innerItem.thumb} style={{backgroundColor: this.props.bgColors ? this.props.bgColors[((index * 2 + innerIndex) % this.props.bgColors.length)].main : undefined}}/>
                                            ) : (<img src={App.data_url + innerItem.thumb} />)}
                                            <div className="ico_star">
                                               {jsx}
                                            </div>
                                            <button 
                                                style={{display: this.props.retryList[innerItem.idx] ? 'none' : '' }}
                                                className={'btn_check' + (this.props.checkedList[innerItem.idx] ? ' on' : '')} 
                                                value={innerItem.seq}
                                                ref={(ref) => {
                                                    if(ref) {
                                                        if(this.elCheckBtn[innerItem.idx]) return;
                                                        this.elCheckBtn[innerItem.idx] = ref;
                                                        if(this.elCheckBtn[innerItem.idx] ) {
                                                            this.elCheckBtn[innerItem.idx].addEventListener('click',(ev: MouseEvent) => {
                                                                ev.stopPropagation();
                                                                if(this.props.disable) return;
                                                                App.pub_playBtnTab();
                                                                let checked; 
                                                                if(this.props.checkedList[innerItem.idx]) {
                                                                    checked = false;
                                                                } else {
                                                                    checked = true;
                                                                }
                                                                this.props.checkClick(innerItem.idx,checked);
                                                            });
                                                        }
                                                    }
                                                }}

                                            />
                                            <button 
                                                className="btn_retry" 
                                                style={{display: this.props.retryList[innerItem.idx] ? '' : 'none'}}
                                                ref={(ref) => {
                                                    if(ref) {
                                                        if(this.elRetryBtn[innerItem.idx]) return;
                                                        this.elRetryBtn[innerItem.idx] = ref;
                                                        if(this.elRetryBtn[innerItem.idx] ) {
                                                            this.elRetryBtn[innerItem.idx].addEventListener('click',(ev: MouseEvent) => {
                                                                ev.stopPropagation();
                                                                if(this.props.disable) return;
                                                                App.pub_playBtnTab();
                                                                this.props.retryClick(innerItem.idx);
                                                            });
                                                        }
                                                    }
                                                }} 
                                            />
                                        </div>
                                        );
                                    })
                                }
                            </div>
                        );
                      
                    })
                }
            </div>
        </div>
        <div className="worksheet_guide " style={{display: 'none'}}>
            {/* worksheet_guide에 show를 붙여주면 나타납니다. */}
            <div className="stage">
                <div className="header">
                    Worksheet Guide
                    <button className="btn_closed"></button>
                </div>
                <div className="contents">
                    <div className="top_imgs">
                        <img className="img01" src={`${_math_lib_}images/img_worksheet_guide_01.png`} />
                        <img className="img02" src={`${_math_lib_}images/img_worksheet_guide_02.png`} />
                    </div>
                    <div className="screenshot">
                        <img src={`${_math_lib_}images/img_sc_worksheet.png`} />
                        <button className="btn_download"></button>
                        {/* 버튼 다운로드시 mathalive_lib/images/worksheet.png를 다운받게 해주시면 됩니다. */}
                    </div>
                </div>
            </div>
        </div>
        <AlertPopup
            view={this._viewAlert > 0}
            onClose={this.cancelAlertPopup}
            onOk={this._viewAlert === 2 ? this.doLogOut : this.doExitClass}
            msg={this.alertMsg}
        />
        </>
        );
    }
}
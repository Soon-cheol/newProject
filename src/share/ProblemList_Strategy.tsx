import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Observer, observer, inject } from 'mobx-react';
import { observable } from 'mobx';
import * as _ from 'lodash';
import { App } from '../App';
import * as kutil from '@common/util/kutil';
import * as felsocket from '../felsocket';
import { AlertPopup } from './AlertPopup';
import { IContentAnswer, IContentResult } from '@common/component/answercheck';
import { IProblemBGColor } from './ProblemList';

// for strategy quiz
export interface IStrategyQuizStep{
    id: number;
    seq: number;
    url: string;
    desc: string;
    answers: IContentAnswer[];
    quizKind: number; 
    difiicult: number; // 난이도 (별점)
    team?: 0|1;
    mainSeq?: number;
    quesSeq?: number;
    lookback_stepleft?: string;
    lookback_stepright?: string;
}
export interface IStrategyQuiz {
    seq: number;
    idx: number;
    url: string;
    desc: string;
    thumb: string;
    answers: IContentAnswer[];
    qnumber: number;// 퀴즈 번호 
    difiicult: number; // 난이도 (별점)
    quizKind: number; 
    step: IStrategyQuizStep[];
    stepCnt: number;
    mainSeq?: number;
    quesSeq?: number;
    smTypeMtlSeq?: number;
    smTypeValue?: string;
    smTypeNm?: string;
    smTypeReason?: string;
    lookback_title?: string;
    lookback_answer?: string;
}
// for message result
export interface IStrategyQuizResult {
    seq: number;
    result: IStrategyResult[];
    allusers: number;
    submitusers: number;
    nosubmit: number;
    completed: boolean;
}

// for answer check result
export interface IStrategyStepResult extends IContentResult {
    id: number;
    starttime?: number;
    endtime?: number;
}
export interface IStrategyResult extends IContentResult {
    qnumber: number;
    quizKind: number;
    step: IStrategyStepResult[];
    team?: 0|1;
    starttime?: number;
    endtime?: number
}

interface IProblemList_Strategy {
    view: boolean;
    type: 1|2; // 1: 분할 없음 2: 2분할  
    disable: boolean; // 문제 목록을 클릭 할수 있는지 여부 
    quizs: IStrategyQuiz[];
    quizresults?: IStrategyQuizResult[];
    checkedList?: boolean[]; // 체크한 리스트 목록 
    retryList?: boolean[];
    init: boolean;
    isEnd: boolean;
    typeStrategy: string;
    stepCnt: number;
    bgColors?: IProblemBGColor[];
    onClick: (type: 1|2) => void;
    onType: (type: string, index: number) => void;
    checkClick?: (index: number, checked: boolean) => void;
    retryClick?: (index: number) => void;
    selectQuiz: (idx: number) => void;
    onViewResult?: (seq: number, step: 1|2|3) => void;
    onViewWorkSheet?: () => void;
}

@observer
export class ProblemListStrategy extends React.Component<IProblemList_Strategy> {
    @observable private quizList: IStrategyQuiz[][] = [];
    @observable private _viewLeftMenu: boolean = false;
    private elCheckBtn: HTMLButtonElement[] = [];
    private elRetryBtn: HTMLButtonElement[] = [];
    private elSubmit: HTMLUListElement[] = [];
    private el: HTMLElement[][] = [];
    @observable private _viewAlert = 0;
    private alertMsg = '';
    private activeSeq = -1;

    constructor(props: IProblemList_Strategy) {
        super(props);
    }
    private cancelAlertPopup = () => {
        this._viewAlert = 0;
    }
    public componentDidMount() {
        while(this.quizList.length > 0)this.quizList.pop();
        let leng = Math.ceil(this.props.quizs.length / 2);
        for(let i = 1; i <= leng; i++) {
            this.quizList.push(_.filter(this.props.quizs,{qnumber: i}));
        }
        // console.log('componentDidMount quizList', this.quizList)
    }
    public componentWillReceiveProps(next: IProblemList_Strategy) {
        while(this.quizList.length > 0)this.quizList.pop();
        if(next.quizs.length > 0 && next.quizs) {
            let leng = Math.ceil(this.props.quizs.length / 2);
            for(let i = 1; i <= leng; i++) {
                this.quizList.push(_.filter(this.props.quizs,{qnumber: i}));
            }
            // console.log('componentWillReceiveProps quizList', this.quizList)
        }  
    }
    public componentDidUpdate(prev: IProblemList_Strategy) {
        if(this.props.view && !prev.view) { 
            this._viewAlert = 0;
        } else if(!this.props.view && prev.view) {
            this._viewAlert = 0;
        }
    }
    onViewResult = (e: React.MouseEvent, seq:number, step: 1|2|3) => {
        e.stopPropagation();
        if(seq === -1) return;
        App.pub_playBtnTab();
        if(this.props.onViewResult) this.props.onViewResult(seq, step);
    }
    onRetry = () => {
        App.pub_playBtnTab();
        this._viewAlert = 0;
        if(this.props.retryClick) this.props.retryClick(this.activeSeq);
    }
    onViewWorkSheet = (e: React.MouseEvent) => {
        e.stopPropagation();
        App.pub_playBtnTab();
        if(this.props.onViewWorkSheet) this.props.onViewWorkSheet();
    }
    onSelectQuiz(e: React.MouseEvent, idx:number) {
        e.stopPropagation();
        App.pub_playBtnTab();
        if(this.props.selectQuiz) this.props.selectQuiz(idx);
    }
    onClick = (type:1|2) => {
        App.pub_playBtnTab();
        if(this.props.onClick) this.props.onClick(type);
    }
    public render() {
        const {quizs, selectQuiz, onClick, quizresults, typeStrategy} = this.props;
        // console.log('quizList', this.quizList, quizs)
        return (
        <>
        <div className={"t_problem" + (typeStrategy === "topic_strategy" ? " topic_strategy" : "" )} style={{display: this.props.view ? '' : 'none'}}>
            <div className="top_header">
                <div className="select_list">
                    <button className={'list_01' + (this.props.type === 1 ? ' on' : '')} onClick={this.onClick.bind(this,1)}/>
                    <button className={'list_02' + (this.props.type === 2 ? ' on' : '')} onClick={this.onClick.bind(this,2)}/>
                </div>
                <span className="worksheet" style={{display: typeStrategy === "topic_strategy" ? "block" : 'none', cursor: 'pointer'}} onClick={this.onViewWorkSheet.bind(this)}>Worksheet Guide</span>
            </div>
            <div className={'content' + (this.props.type === 2 ? ' view12' : '')}>
                {
                    this.quizList.map((item,index) => {
                        return(
                            <div className="thumbset" key={'qssss_' + index}>
                                {
                                    item.map((innerItem, innerIndex) => {
                                        // console.log("innerItem", innerItem, innerIndex);
                                        let jsx: JSX.Element[] = [];
                                        let leng = innerItem.difiicult !== undefined ? innerItem.difiicult : 0; 
                                        for(let i = 0; i < leng; i++) {
                                            jsx.push(<span key={i}/>);
                                        }
                                        
                                        let step1Results:IStrategyStepResult[] = [];
                                        let step2Results:IStrategyStepResult[] = [];
                                        let step3Results:IStrategyStepResult[] = [];
                                        let step1Percent = "";
                                        let step2Percent = "";
                                        let step3Percent = "";
                                        let lowpercent = "";
    
                                        if(quizresults) {
                                            const _result = quizresults.find((result, _) => result.seq === innerItem.seq);
                                            if(_result) {
                                                // console.log("problem result", _result);
                                                _result.result.map((sr, _) => {
                                                    step1Results.push(sr.step[0]);
                                                    step2Results.push(sr.step[1]);
                                                    if(sr.step.length === 3) {
                                                        step3Results.push(sr.step[2]);
                                                    }
                                                })
                                                // console.log("problem stepResults", step1Results.length, step2Results.length, step3Results.length);
                                                let s1p = 0;
                                                let s2p = 0;
                                                let s3p = 0;
                                                if(_result.allusers > 0) {
                                                    let tmpStep1Results:IStrategyStepResult[] = [];
                                                    let tmpStep2Results:IStrategyStepResult[] = [];
                                                    let tmpStep3Results:IStrategyStepResult[] = [];

                                                    tmpStep1Results = step1Results.filter((step, _) => step.tryCnt === 1 && step.correct === true);
                                                    tmpStep2Results = step2Results.filter((step, _) => step.tryCnt === 1 && step.correct === true);
                                                    if(step3Results.length > 0) {
                                                        tmpStep3Results = step3Results.filter((step, _) => step.tryCnt === 1 && step.correct === true);
                                                    }
                                                    s1p = (tmpStep1Results.length > 0 ? (tmpStep1Results.length / _result.allusers) * 100 : 0);
                                                    s2p = (tmpStep2Results.length > 0 ? (tmpStep2Results.length / _result.allusers) * 100 : 0);
                                                    s3p = (tmpStep3Results.length > 0 ? (tmpStep3Results.length / _result.allusers) * 100 : 0);
                                                    // console.log("problem tmpStepResults", tmpStep1Results.length, tmpStep2Results.length, step3Results.length);
                                                }
                                                step1Percent = Number.isInteger(s1p) ? s1p + "%" : s1p.toFixed(2) + "%";
                                                step2Percent = Number.isInteger(s2p) ? s2p + "%" : s2p.toFixed(2) + "%";
                                                step3Percent = Number.isInteger(s3p) ? s3p + "%" : s3p.toFixed(2) + "%";

                                                if(innerItem.stepCnt === 3) {
                                                    if(s1p === 0 && s2p === 0 && s3p === 0) lowpercent = "";
                                                    else if(s1p <= 50 || s2p <= 50 || s3p <= 50) lowpercent = " light";
                                                } else {
                                                    if(s1p === 0 && s2p === 0) lowpercent = "";
                                                    else if(s1p <= 50 || s2p <= 50) lowpercent = " light";
                                                }
                                            }
                                        }

                                        let num = innerItem.qnumber + (innerIndex === 1 ? '+' : '');
                                        if(typeStrategy === "topic_strategy") num = innerItem.idx + "";

                                        return (
                                        <div className={'thumb_cnt' + lowpercent + (innerIndex > 0 ? ' right' : ' left')} key={innerIndex} onClick={(e) => this.onSelectQuiz(e, innerItem.idx-1)} style={{cursor:'pointer'}}>
                                            <div className="title">
                                                <div className="num">
                                                    {num}
                                                </div>

                                                {/* strategy 일 경우 사용 */}
                                                <ul className="step" style={{display: this.props.typeStrategy === "strategy" ? 'block' : 'none'}}>
                                                    <li className={step1Percent === "" ? "" : "on"} onClick={(e) => step1Percent === "" ? this.onViewResult(e, -1, 1) : this.onViewResult(e, innerItem.seq, 1)}>{step1Percent === "" ? "Step1" : step1Percent}</li>
                                                    <li className={step2Percent === "" ? "" : "on"} onClick={(e) => step2Percent === "" ? this.onViewResult(e, -1, 2) : this.onViewResult(e, innerItem.seq, 2)}>{step2Percent === "" ? "Step2" : step2Percent}</li>
                                                    {innerItem.stepCnt === 3 &&
                                                    <li className={step3Percent === "" ? "" : "on"} onClick={(e) => step3Percent === "" ? this.onViewResult(e, -1, 3) : this.onViewResult(e, innerItem.seq, 3)}>{step3Percent === "" ? "Step3" : step3Percent}</li>
                                                    }
                                                </ul>
                                            </div>
                                            <img src={innerItem.thumb} style={{backgroundColor: this.props.bgColors ? this.props.bgColors[((index * 2 + innerIndex) % this.props.bgColors.length)].main : undefined}}/>
                                            <div className="ico_star">
                                               {jsx}
                                            </div>
                                            {this.props.typeStrategy === "strategy" &&
                                            <>
                                                <button 
                                                    style={{display: this.props.retryList![innerItem.idx - 1] ? 'none' : '' }}
                                                    className={'btn_check' + (this.props.checkedList![innerItem.idx - 1] ? ' on' : '')} 
                                                    value={innerItem.idx}
                                                    ref={(ref) => {
                                                        if(ref) {
                                                            if(this.elCheckBtn[innerItem.idx - 1]) return;
                                                            this.elCheckBtn[innerItem.idx - 1] = ref;
                                                            if(this.elCheckBtn[innerItem.idx - 1] ) {
                                                                this.elCheckBtn[innerItem.idx - 1].addEventListener('click',(ev: MouseEvent) => {
                                                                    ev.stopPropagation();
                                                                    if(this.props.disable) return;
                                                                    App.pub_playBtnTab();
                                                                    let checked; 
                                                                    if(this.props.checkedList![innerItem.idx - 1]) {
                                                                        checked = false;
                                                                    } else {
                                                                        checked = true;
                                                                    }
                                                                    if(this.props.checkClick) this.props.checkClick(innerItem.idx - 1, checked);
                                                                });
                                                            }
                                                        }
                                                    }}
                                                />
                                                <button 
                                                    className="btn_retry" 
                                                    style={{display: this.props.retryList![innerItem.idx - 1] ? '' : 'none'}}
                                                    ref={(ref) => {
                                                        if(ref) {
                                                            if(this.elRetryBtn[innerItem.idx - 1]) return;
                                                            this.elRetryBtn[innerItem.idx - 1] = ref;
                                                            if(this.elRetryBtn[innerItem.idx - 1] ) {
                                                                this.elRetryBtn[innerItem.idx - 1].addEventListener('click',(ev: MouseEvent) => {
                                                                    ev.stopPropagation();
                                                                    if(this.props.disable) return;
                                                                    App.pub_playBtnTab();
                                                                    this.activeSeq = innerItem.idx - 1;
                                                                    this._viewLeftMenu = false;
                                                                    this.alertMsg = 'Retry?';                                                       
                                                                    this._viewAlert = 3;
                                                                });
                                                            }
                                                        }
                                                    }} 
                                                />
                                            </>}
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
        <AlertPopup
            view={this._viewAlert > 0}
            onClose={this.cancelAlertPopup}
            onOk={this.onRetry}
            msg={this.alertMsg}
        />
        </>
        );
    }
}
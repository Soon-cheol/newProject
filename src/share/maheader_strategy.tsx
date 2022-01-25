import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { observable, action } from 'mobx';
import { Observer, observer } from 'mobx-react';
import * as _ from 'lodash';
const SwiperComponent = require('react-id-swiper').default;
import * as felsocket from '../felsocket';
import { App } from '../App';
import { IStrategyQuizStep, IStrategyQuiz, IStrategyQuizResult, IStrategyStepResult, IStrategyResult } from './ProblemList_Strategy'


interface IMAHeader_STRATEGY {
    view: boolean;
    isStudent: boolean;// 선생님 페이지 인지 학생 페이지 인지 
    curProgress: number;
    quizIdx: number;
    submitState?: ISubmitState;// 학생 쪽 헤더에서만 쓰임
    heart2?: number;
    heart1?: number;
    heart0?: number;
    nosubmit?: number;
    headerResult?: IStrategyResult[];// 문제 제출 현황을 위한 Result 학생에서 보이는 헤더일 경우에만 사용
    pageCnt?: number; 
    retryList?: boolean[];
    stepCnt?: number;
    stepCnt_A?: number;
    stepCnt_B?: number;
    typeStrategy: string;
    team?: number;
    pageIdx?: number;
    plan?: string;
    quizresult?: IStrategyQuizResult; // for strategy
    onExitBook?: () => void;
    onExitClass?: () => void;
    onLogout?: () => void;
    onGotoProgress?: (progress: 0|1|10|100|200|300) => void;
    onChangeTeam?: (team:0|1, id:0|1|10|100|200|300) => void;
    onViewWorkSheet?: () => void;
    onChangeQuestion? : (qid: number) => void;
}

@observer export class MAHeader_STRATEGY extends React.Component<IMAHeader_STRATEGY> {

    constructor(props: IMAHeader_STRATEGY) {
        super(props);
    }
    private _soption: SwiperOptions = {
        direction: 'horizontal',
        observer: true,
		slidesPerView: 'auto',
		freeMode: true,
		mousewheel: true,			
		noSwiping: false,
		followFinger: true,
		scrollbar: {el: '.swiper-scrollbar',draggable: true, hide: false},	
    };
    private _swiper: Swiper|null = null;
    private _refSwiper = (el: SwiperComponent) => {
		if(this._swiper || !el) return;

		const swiper = el.swiper;
		swiper.on('transitionStart', () => {
			//
		});
		swiper.on('transitionEnd', () => {
           //
		});
		this._swiper = swiper;
	}
    public componentDidUpdate(prev: IMAHeader_STRATEGY) {
        if(this.props.typeStrategy === "module_strategy") {
        } else {
            if(this.props.view && !prev.view) {
                _.delay(() => {
                    if(this._swiper) {
                        this._swiper.slideTo(0, 0);
                        this._swiper.update();
                        if(this._swiper.scrollbar) this._swiper.scrollbar.updateSize();
                    }				
                }, 300);
            } else if(!this.props.view && prev.view) {
              //
            }
            if(this.props.quizIdx !== prev.quizIdx) {
                if(this._swiper) {
                    this._swiper.update();
                    this._swiper.slideTo(this.props.quizIdx,0);
                }
            }
        }
    }
    onChangeTeam = (team:-1|0|1, id: 0|1|10|100|200|300) => {
        if(this.props.typeStrategy === "module_strategy" && team !== -1) {
            if(this.props.onChangeTeam) this.props.onChangeTeam(team, id); 
        }
    }
    onGotoProgress = (id: 0|1|10|100|200|300) => {
        if(this.props.onGotoProgress) this.props.onGotoProgress(id); 
        // this.props.onGotoProgress(id);
    }
    onViewWorkSheet = (e: React.MouseEvent) => {
        e.stopPropagation();
        App.pub_playGameClick();
        if(this.props.onViewWorkSheet) this.props.onViewWorkSheet();
    }
    onChangeQuestion = (qid: number) => {
        App.pub_playBtnTab();
        if(this.props.onChangeQuestion) this.props.onChangeQuestion(qid);
    }

    public render() {
        const {view, isStudent, quizIdx, pageCnt, headerResult, curProgress, typeStrategy, team, stepCnt_A, stepCnt_B, pageIdx, quizresult} = this.props;
        let jsx: JSX.Element[] = [];
        if(pageCnt && pageCnt > 0) {
            for(let i = 0; i < pageCnt; i++) {
                jsx.push(<span key={'p' + i} className={quizIdx === i ? 'on' : undefined} />);
            }
        }
        let qizNumber = '';
        let stepStatus: string[] = ["", "", ""];

        if(isStudent) {
            if(typeStrategy === "topic_strategy") {
                // qizNumber = quizIdx + "";
            } else if(headerResult && headerResult.length > 0 && quizIdx > -1) {
                if(typeStrategy === "strategy") {
                    if(headerResult[quizIdx].quizKind > 0) {
                        qizNumber = headerResult[quizIdx].qnumber + '+';
                    } else {
                        qizNumber = headerResult[quizIdx].qnumber + '';
                    }
                } 
                if(headerResult[headerResult.length-1].completed) {
                    _.delay(() => {
                        if(this._swiper) {
                            this._swiper.slideTo(0, 0);
                            this._swiper.update();
                            if(this._swiper.scrollbar) this._swiper.scrollbar.updateSize();
                        }				
                    }, 600);
                }
                
                let result = headerResult[quizIdx];
                if(typeStrategy === "module_strategy") {
                    result = headerResult[0];
                }
                for(let i=0;i<result.step.length;i++) {
                    if(result.step[i].correct) {
                        if(result.step[i].tryCnt === 1) {
                            stepStatus[i] = " pass1";
                        } else if(result.step[i].tryCnt === 2) {
                            stepStatus[i] = " pass2";
                        }
                    } else {
                        if(result.step[i].tryCnt === 2) {
                            stepStatus[i] = " fail1";
                        } else if(result.step[i].completed) {
                            stepStatus[i] = " fail2";
                        }
                    }
                }
            }
        } else {
            if(typeStrategy === "strategy") {
                if(quizIdx % 2 === 0) {
                    qizNumber = (Math.floor(quizIdx/2)+1) + '';
                } else {
                    qizNumber = (Math.floor(quizIdx/2)+1) + '+';
                }
            } else {
                qizNumber = (quizIdx+1) + "";
            }
        }

        let step1Results:IStrategyStepResult[] = [];
        let step2Results:IStrategyStepResult[] = [];
        let step3Results:IStrategyStepResult[] = [];
        let step1Percent = "";
        let step2Percent = "";
        let step3Percent = "";
        if(quizresult) {
            // console.log("problem result", _result);
            quizresult.result.map((sr, _) => {
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
            if(quizresult.allusers > 0) {
                let tmpStep1Results:IStrategyStepResult[] = [];
                let tmpStep2Results:IStrategyStepResult[] = [];
                let tmpStep3Results:IStrategyStepResult[] = [];

                tmpStep1Results = step1Results.filter((step, _) => step.tryCnt === 1 && step.correct === true);
                tmpStep2Results = step2Results.filter((step, _) => step.tryCnt === 1 && step.correct === true);
                if(step3Results.length > 0) {
                    tmpStep3Results = step3Results.filter((step, _) => step.tryCnt === 1 && step.correct === true);
                }
                s1p = (tmpStep1Results.length > 0 ? (tmpStep1Results.length / quizresult.allusers) * 100 : 0);
                s2p = (tmpStep2Results.length > 0 ? (tmpStep2Results.length / quizresult.allusers) * 100 : 0);
                s3p = (tmpStep3Results.length > 0 ? (tmpStep3Results.length / quizresult.allusers) * 100 : 0);
                // console.log("problem tmpStepResults", tmpStep1Results.length, tmpStep2Results.length, step3Results.length);
            }
            step1Percent = Number.isInteger(s1p) ? s1p + "%" : s1p.toFixed(2) + "%";
            step2Percent = Number.isInteger(s2p) ? s2p + "%" : s2p.toFixed(2) + "%";
            step3Percent = Number.isInteger(s3p) ? s3p + "%" : s3p.toFixed(2) + "%";
        }

        return (
            <>
            <div className={'topHeader_strategy'} style={{display: view ? '' : 'none'}}>
                {typeStrategy !== "module_strategy" && 
                <>
                    <div className="number" style={{display: isStudent ? 'none' : ''}}>
                        <span>{qizNumber}</span>
                    </div>
                    {isStudent && 
                    <>
                    <div className={'result_score' + (isStudent ? ' student' : '')}>
                        <SwiperComponent
                            ref={this._refSwiper}
                            {...this._soption}
                        >
                        {/* 상단 클래스를 strategy일 경우 result_score student strategy 같이 붙여줌 */}
                        {/* 선생님쪽에서 정보를 전달 받아 와야 함 */}
                        {
                            headerResult && headerResult.length > 0 && headerResult.map((item,index) => {
                                let qnumber = '';
                                if(typeStrategy === "strategy") {
                                    if(item.quizKind > 0) {
                                        qnumber = item.qnumber + '+';
                                    } else {
                                        qnumber = item.qnumber + '';
                                    }    
                                } else {
                                    qnumber = item.contentSeq + "";
                                }
                                return (
                                    <div className={'num' + (quizIdx === index ? " now" : (quizIdx > index ? " past" :  " notyet"))} key={'s_' + index}>
                                        <span className="txt">{qnumber}</span>
                                    </div>
                                ); 
                            })
                        }
                        {!headerResult &&
                            <div className={'num now'}>
                                <span className="txt">{quizIdx}</span>
                            </div>
                        }
                        </SwiperComponent>
                    </div>
                    <span className="worksheet" style={{display: isStudent && quizIdx === 0 && typeStrategy === "topic_strategy" ? "" : "none"}} onClick={this.onViewWorkSheet.bind(this)}>Worksheet</span>
                    </>}
                </>}

                {((isStudent && typeStrategy !== "topic_strategy") || (!isStudent && typeStrategy !== "module_strategy")) &&
                <div className={(typeStrategy === "module_strategy" ? "progress _module strategy" : "progress strategy") + (isStudent ? " student" : "")} style={{display: isStudent && quizIdx === 2 ? "none" : ""}}>
                    {/* 상단 클래스를 strategy일 경우 progress strategy 같이 붙여줌 */}
                    <ul>
                        <li className={"a" + (curProgress > 0 ? " on" : "")} onClick={this.onGotoProgress.bind(this, 1)} 
                        style={{width: this.props.stepCnt === 3 ? "20%" : "25%"}}>
                            {/* 한번에 맞췄을경우 pass1 두번에 맞췄을경우 pass2 를 on옆에 붙여주세요. */}
                            <span className="tit1">Understand</span>
                        </li>
                        <li className={"a" + (curProgress > 1 ? " on" : "")} onClick={this.onGotoProgress.bind(this, 10)}
                        style={{width: this.props.stepCnt === 3 ? "20%" : "25%"}}>
                            <span className="tit1">How to solve?</span>
                        </li>
                        <li className={"a" + (curProgress > 10 ? (" on") : "") + stepStatus[0]} onClick={this.onGotoProgress.bind(this, 100)}
                        style={{width: this.props.stepCnt === 3 ? "20%" : "25%"}}>
                            <span className="tit1">{step1Percent !== '' ? step1Percent : 'Step 1'}</span>
                        </li>
                        <li className={"a" + (curProgress > 100 ? " on" : "") + stepStatus[1]} onClick={this.onGotoProgress.bind(this, 200)}
                        style={{width: this.props.stepCnt === 3 ? "20%" : "25%"}}>
                            <span className="tit1">{step2Percent !== '' ? step2Percent : 'Step 2'}</span>
                        </li>
                        {this.props.stepCnt === 3 &&
                        <li className={"a" + (curProgress > 200 ? " on" : "") + stepStatus[2]} onClick={this.onGotoProgress.bind(this, 300)}
                        style={{width: this.props.stepCnt === 3 ? "20%" : "25%"}}>
                            <span className="tit1">{step3Percent !== '' ? step3Percent : 'Step 3'}</span>
                        </li>
                        }
                    </ul>
                </div>
                }
                {typeStrategy === "module_strategy" && isStudent &&
                <div className={"team_title " + (this.props.team === 0 ? "a" : 'b')}>
                    {/* 팀타이틀이 B일경우 team_title b로 변경 후 아래 team을 B로, title을 Restate a problem으로 변경해주세요. */}
                    <span className="team">{this.props.team === 0 ? "A" : "B"}</span>
                    <span className="title">{this.props.plan ? this.props.plan : ""}</span>
                </div>}

                {((typeStrategy === "module_strategy" && quizIdx !== 2) && !isStudent) &&
                <div className={"progress strategy module" + (isStudent ? " student" : "")}>
                    {/* 상단 클래스를 strategy일 경우 progress strategy 같이 붙여줌 */}
                    <ul>
                        <li className={"a" + (curProgress > 0 ? " on" : "")} onClick={this.onGotoProgress.bind(this, 1)}
                        style={{width: this.props.stepCnt === 3 ? "20%" : "25%"}}>
                            {/* 한번에 맞췄을경우 pass1 두번에 맞췄을경우 pass2 를 on옆에 붙여주세요. */}
                            <span className="tit1">Understand</span>
                        </li>
                        <li className={"a" + (curProgress > 1 ? " on" : "")} onClick={this.onGotoProgress.bind(this, 10)}
                        style={{width: this.props.stepCnt === 3 ? "20%" : "25%"}}>
                            <span className="tit1">How to solve?</span>
                        </li>
                        <li className={(isStudent ? "a" : "ab") + (curProgress > 10 ? (isStudent ? " on" : (team === 0 ? " a_on" : " b_on")) : "") + stepStatus[0]}
                        style={{width: this.props.stepCnt === 3 ? "20%" : "25%"}}>
                            <div className="btn">
                                <button className="a" onClick={this.onChangeTeam.bind(this, 0, 100)}></button>
                                <button className="b" onClick={this.onChangeTeam.bind(this, 1, 100)}></button>
                            </div>
                            <span className="tit1">Step 1</span>
                            <div className="tit2">
                                <span id="s1a" className="a">0%</span>
                                <span id="s1b" className="b">0%</span>
                            </div>
                        </li>
                        <li className={(isStudent ? "a" : "ab") + (curProgress > 100 ? (isStudent ? " on" : (team === 0 ? " a_on" : " b_on")) : "") + stepStatus[1]}
                        style={{width: this.props.stepCnt === 3 ? "20%" : "25%"}}>
                            <div className="btn">
                                <button className="a" onClick={this.onChangeTeam.bind(this, 0, 200)}></button>
                                <button className="b" onClick={this.onChangeTeam.bind(this, 1, 200)}></button>
                            </div>
                            <span className="tit1">Step 2</span>
                            <div className="tit2">
                                <span id="s2a" className="a">0%</span>
                                <span id="s2b" className="b">0%</span>
                            </div>
                        </li>
                        {/* {stepCnt_A === 2 && (team === 1 && stepCnt_B === 3) &&
                        <li className={(isStudent ? "a" : "b") + (curProgress > 200 ? " on" : "") + stepStatus[2]} onClick={this.onGotoProgress.bind(this, 300)}
                        style={{width: this.props.stepCnt === 3 ? "20%" : "25%"}}>
                            <div className="btn">
                                <button className="a" onClick={this.onChangeTeam.bind(this, 0)}></button>
                                <button className="b" onClick={this.onChangeTeam.bind(this, 1)}></button>
                            </div>
                            <span className="tit1">Step 3</span>
                            <div className="tit2">
                                <span id="s3a" className="a">0%</span>
                                <span id="s3b" className="b">0%</span>
                            </div>
                        </li>
                        }
                        {(team === 0 && stepCnt_A === 3) && stepCnt_B === 2 &&
                        <li className={(isStudent ? "a" : "a") + (curProgress > 200 ? " on" : "") + stepStatus[2]} onClick={this.onGotoProgress.bind(this, 300)}
                        style={{width: this.props.stepCnt === 3 ? "20%" : "25%"}}>
                            <span className="tit1">Step 3</span>
                            <div className="tit2">
                                <span id="s3a" className="a">0%</span>
                                <span id="s3b" className="b">0%</span>
                            </div>
                        </li>
                        }
                        {stepCnt_A === 3 && stepCnt_B === 3 &&
                        <li className={(isStudent ? "a" : "ab") + (curProgress > 200 ? (isStudent ? " on" : (team === 0 ? " a_on" : " b_on")) : "") + stepStatus[2]} onClick={this.onGotoProgress.bind(this, 300)}
                        style={{width: this.props.stepCnt === 3 ? "20%" : "25%"}}>
                            <span className="tit1">Step 3</span>
                            <div className="tit2">
                                <span id="s3a" className="a">0%</span>
                                <span id="s3b" className="b">0%</span>
                            </div>
                        </li>
                        } */}
                        {/* {(true || curProgress < 100 || ((team === 0 && stepCnt_A === 3) || (team === 1 && stepCnt_B === 3))) && */}
                        {!(stepCnt_A === 2 && stepCnt_B === 2) &&
                            <li className={(isStudent ? "a" : (stepCnt_A === 3 && stepCnt_B === 3 ? "ab" : (stepCnt_A === 3 ? "step3_a" : "step3_b"))) + 
                            (curProgress > 200 ? (isStudent || (!isStudent && !(stepCnt_A === 2 && stepCnt_B === 2)) ? " on" : (team === 0 ? " a_on" : " b_on")) : "") + stepStatus[2]}
                            style={{width: this.props.stepCnt === 3 ? "20%" : "25%"}} onClick={this.onChangeTeam.bind(this, stepCnt_A === 3 ? (stepCnt_B === 3 ? -1 : 0) : 1, 300)}>
                            <div className="btn">
                                <button className="a" onClick={this.onChangeTeam.bind(this, 0, 300)}></button>
                                <button className="b" onClick={this.onChangeTeam.bind(this, 1, 300)}></button>
                            </div>
                            <span className="tit1">Step 3</span>
                            <div className="tit2">
                                <span id="s3a" className="a">0%</span>
                                <span id="s3b" className="b">0%</span>
                            </div>
                        </li>}
                    </ul>
                </div>
                }

                {typeStrategy === "module_strategy" && quizIdx === 2 &&
                <>
                <span className={"worksheet module" + (!isStudent ? "" : " student")} onClick={this.onViewWorkSheet.bind(this)} style={{display: isStudent ? "none" : ""}}>
                    {isStudent ? "Worksheet" : "Worksheet Guide"}
                </span>
                </>}

                {!isStudent && typeStrategy === "module_strategy" && 
                <div className="pager">
                    <span className={quizIdx === 0 ? "on" : ""} onClick={this.onChangeQuestion.bind(this, 0)}></span>
                    <span className={quizIdx === 1 ? "on" : ""} onClick={this.onChangeQuestion.bind(this, 1)}></span>
                    <span className={quizIdx === 2 ? "on" : ""} onClick={this.onChangeQuestion.bind(this, 2)}></span>
                </div>
                }

                {isStudent && (typeStrategy === "module_strategy" && quizIdx == 2) && 
                <div className="pagination">
                    <span className={(pageIdx === undefined || pageIdx === 0) ? "on" : ""}></span>
                    <span className={pageIdx === 1 ? "on" : ""}></span>
                </div>
                }

                {isStudent && typeStrategy === "topic_strategy" && 
                <div className="pagination">
                    <span className={pageIdx === 0 ? "on" : ""}></span>
                    <span className={pageIdx === 1 ? "on" : ""}></span>
                </div>
                }
            </div>
            </>
        );
    }
}
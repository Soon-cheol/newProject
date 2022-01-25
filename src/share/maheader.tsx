import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { observable, action } from 'mobx';
import { Observer, observer } from 'mobx-react';
import * as _ from 'lodash';
const SwiperComponent = require('react-id-swiper').default;
import * as felsocket from '../felsocket';
import { App } from '../App';

interface IMAHeader {
    view: boolean;
    isStudent: boolean;// 선생님 페이지 인지 학생 페이지 인지 
    isStep: boolean;// 스탭이 있는 문제 인지 아닌지 여부
    submitType?: string;
    type: 'concept_summary' | 'learning_object' |''; 
    onClickSubmitTile?: (qidx: number) => void;
    onClickSubmitItem?: (type: string) => void;
    quizIdx: number;
    quizResult?: IQuizResult[];
    heart2?: number;
    heart1?: number;
    heart0?: number;
    nosubmit?: number;
    headerResult?: IResult[];// 문제 제출 현황을 위한 Result 학생에서 보이는 헤더일 경우에만 사용
    pageCnt?: number; 
    retryList?: boolean[];
    active?: boolean[];// 한번 활성화 됬던 Quiz 페이지면 true 값 
    onExitBook?: () => void;
    onExitClass?: () => void;
    onLogout?: () => void;
    onClickIdx?: (idx: number) => void;
}
@observer
export class MAHeader extends React.Component<IMAHeader> {
    private clickable: boolean = true;
    private isMore: boolean = false;
    @observable private active: boolean[] = [];
    constructor(props: IMAHeader) {
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
    private _clickSubmitTitle = (quizIdx: number) => {
        
        if(this.props.onClickSubmitTile && this.clickable)this.props.onClickSubmitTile(quizIdx);
    }
    private _onClick = (type: ''|'1'|'2'|'3'|'4') => {
        switch(type) {
            case '1':
                if(this.props.quizResult && this.props.quizResult.length > 0) {
                    if(this.props.quizResult[this.props.quizIdx].heart2 < 1) {
                        this.clickable = false;
                        return;
                    }
                }
                break;
            case '2':
                if(this.props.quizResult && this.props.quizResult.length > 0) {
                    if(this.props.quizResult[this.props.quizIdx].heart1 < 1) {
                        this.clickable = false;
                        return;
                    }
                   
                }
                break;
            case '3':
                if(this.props.quizResult && this.props.quizResult.length > 0) {
                    if(this.props.quizResult[this.props.quizIdx].heart0 < 1) {
                        this.clickable = false;
                        return;
                    }
                }
                break;
            case '4':
                if(this.props.quizResult && this.props.quizResult.length > 0) {
                    if(this.props.quizResult[this.props.quizIdx].nosubmit < 1) {
                        this.clickable = false;
                        return;
                    }
                }
                break;
            default:
                break;
        }
        this.clickable = true;
        if(this.props.onClickSubmitItem) this.props.onClickSubmitItem(type);
    }
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

    private onClickIdx = (idx: number, firstName: string) => {
      if(this.props.onClickIdx && firstName !== 'notyet') {
          App.pub_playBtnTab();
          this.props.onClickIdx(idx);
      }
    }
    public componentDidUpdate(prev: IMAHeader) {
        if(this.props.view && !prev.view) {
            _.delay(() => {
                if(this._swiper) {
                    this._swiper.slideTo(0, 0);
                    this._swiper.update();
                    if(this._swiper.scrollbar) this._swiper.scrollbar.updateSize();
                }				
            }, 300);
            this.clickable = true;
        } else if(!this.props.view && prev.view) {
          //
        }
        // if(this.props.quizIdx !== prev.quizIdx) {
        //     if(this._swiper) {
        //         this._swiper.update();
        //         this._swiper.slideTo(this.props.quizIdx,0);
        //     }
        // }
        if(this.props.quizIdx !== prev.quizIdx && this.props.quizIdx >= 8) {
            if(this.props.headerResult) {
                if(!this.props.headerResult[this.props.headerResult.length - 1].compelete) {
            if(this._swiper) {
                this._swiper.update();
                        this._swiper.slideTo(this.props.quizIdx - 7, 0);
                    }
                }
            }
        }
    }
    public render() {
        const {view, isStep, isStudent, quizIdx, quizResult, headerResult, pageCnt, type, submitType} = this.props;
        let showHeader = false; 
        if(quizResult && quizResult.length > 0) {
            if(quizResult[quizIdx].submitusers <= 0) showHeader = false;
            else showHeader = true;
        }
  
        let qizNumber = '';
        if(isStudent) {
            if(headerResult && headerResult.length > 0 && quizIdx > -1) {
                // 210629 스크롤 생기는 개수부터는 스타일 다르게
                if(headerResult.length >= 10) {
                    this.isMore = true;
                } else {
                    this.isMore = false;
                }

                if(headerResult[quizIdx].quizKind > 0) {
                    qizNumber = headerResult[quizIdx].qnumber + '+';
                } else {
                    qizNumber = headerResult[quizIdx].qnumber + '';
                }

                if(headerResult[headerResult.length - 1 ].compelete) {
                    _.delay(() => {
                        if(this._swiper) {
                            this._swiper.slideTo(0, 0);
                            this._swiper.update();
                            if(this._swiper.scrollbar) this._swiper.scrollbar.updateSize();
                        }				
                    }, 600);
                }
            }
           
    
        } else {
            if(this.props.quizResult && this.props.quizResult.length > 0) {
                const result = this.props.quizResult[this.props.quizIdx];
                if(result.quizKind && result.quizKind > 0) {
                    qizNumber = result.qnumber + '+';
                } else {
                    qizNumber = result.qnumber + '';
                }
            } else {
                qizNumber = (this.props.quizIdx + 1) + '';
            }
          
        }
        return (
        <div className={'topHeader' + ((type === 'concept_summary' || type === 'learning_object') ? ' summary' : '') + (isStudent ? ' student' : '')} style={{display: view ? '' : 'none'}}>
                <div className="number" style={{display: type === 'learning_object' || isStudent ? 'none' : ''}}><span>{qizNumber}</span></div>

                {!isStudent && !isStep  && (
                <div className="result_score" style={{display: showHeader || (this.props.retryList && this.props.retryList.length > quizIdx && this.props.retryList[quizIdx]) ? '' : 'none'}}>
                    {/* 학생페이지에서 student붙여주시고 자식클래스에 on이나 notyet으로 제어 */}
                    <div onClick={this._clickSubmitTitle.bind(this,quizIdx)}>
                        {/* 210512 클래스 이동 */}
                        <div className={'num first' + ((quizResult && quizResult.length > 0) && quizResult[quizIdx].heart2 > 0 ? ' on' : '')} onClick={this._onClick.bind(this,'1')}>
                            <span>{(quizResult && quizResult.length > 0) ? quizResult[quizIdx].heart2 : 0}</span>
                        </div>
                        <div className={'num second' + ((quizResult && quizResult.length > 0) && quizResult[quizIdx].heart1 > 0 ? ' on' : '')} onClick={this._onClick.bind(this,'2')}>
                            <span>{(quizResult && quizResult.length > 0) ? quizResult[quizIdx].heart1 : 0}</span>
                        </div>
                        <div className={'num wrong' + ((quizResult && quizResult.length > 0) && quizResult[quizIdx].heart0 > 0 ? ' on' : '')} onClick={this._onClick.bind(this,'3')}>
                            <span>{(quizResult && quizResult.length > 0) ? quizResult[quizIdx].heart0 : 0}</span>
                        </div>
                        <div className={'num unsubmission notyet' + ((quizResult && quizResult.length > 0) && quizResult[quizIdx].nosubmit > 0 ? ' on' : '')} onClick={this._onClick.bind(this,'4')}>
                            <span>{(quizResult && quizResult.length > 0) ? quizResult[quizIdx].nosubmit : 0}</span>
                        </div>
                    </div>
                </div>)}

                {isStudent && (
                    <>
                    {/* [s] Asssesment용 Pager */}
                    <div className="assessment">
                        {/* assessment에 show를 붙이면 나옵니다 */}
                        <div className="pagination">
                            <button className="btn_prev"></button>
                            <button className="btn_next on"></button>
                        </div>
                        <div className="numbers">
                            <button className="num"><span>1</span></button>
                            <button className="num"><span>2</span></button>
                            <button className="num"><span>3</span></button>
                            <button className="num"><span>4</span></button>
                            <button className="num skip_none"><span>5</span></button>
                            <button className="num"><span>6</span></button>
                            <button className="num"><span>7</span></button>
                            <button className="num skip_exist"><span>8</span></button>
                            <button className="num now"><span>9</span></button>
                            <button className="num before"><span>10</span></button>
                        </div>
                    </div>
                    {/* [e] Asssesment용 Pager */}
                    <div className={'result_score' + (isStudent ? ' student' : '') + (this.isMore ? ' more' : '')}>
                        <span className="worksheet" style={{display: 'none'}}>Worksheet</span>
                        <SwiperComponent
                            ref={this._refSwiper}
                            {...this._soption}
                        >
                        {/* 상단 클래스를 strategy일 경우 result_score student strategy 같이 붙여줌 */}
                        {/* 선생님쪽에서 정보를 전달 받아 와야 함 */}
                        {
                              
                              headerResult && headerResult.length > 0 && headerResult.map((item,index) => {
                                let firstName = '';
                                let secondName = '';
                                let thirdName = '';
                                // console.log("header in quizIdx",quizIdx)
                                if(item.tryCnt === 1 && item.correct) secondName = 'first';
                                else if(item.tryCnt === 2 && item.correct) secondName = 'second';
                                else if(item.tryCnt > 1 && item.correct === false) secondName = 'wrong';
                                if(headerResult[headerResult.length - 1].compelete) {// 마지막 까지 다 풀었을떄에 대한 처리 
                                    if(quizIdx === index)firstName = '';
                                    else firstName = 'past';
                                    if(item.tryCnt === 0 && item.correct === false) secondName = 'unsubmission';
                                } else {// 마지막 까지 다푼 경우가 아닐떄 
                                    if(index < quizIdx && item.tryCnt > 0) { // 제출 까지 끝난 경우
                                        firstName = 'past';
                                    } 

                                    if(quizIdx === index && !item.compelete) {// 현재 풀이 중 
                                        firstName = '';
                                    } else if(quizIdx < index && !item.compelete && !(this.props.active && this.props.active[index])) {// 문제 풀이 하지 않은 경우 
                                        firstName = 'notyet';
                                    } else if(quizIdx === index && item.compelete) {
                                        firstName = '';
                                    }
                                  
                                }
                                if(quizIdx === index) {
                                    thirdName = 'active';
                                } else {
                                    thirdName = '';
                                }
                        
                                let _arr: string[] = [firstName];
                                _arr.push(secondName);
                                _arr.push(thirdName);

                                let qnumber = '';
                                if(item.quizKind > 0) {
                                    qnumber = item.qnumber + '+';
                                } else {
                                    qnumber = item.qnumber + '';
                                }
                                return (
                                    <div className={'num ' + _arr.join(' ')} key={'s_' + index} onClick={this.onClickIdx.bind(this, index,firstName)}>
                                        <span className="txt">{qnumber}</span>
                                        <span className="ico" />
                                    </div>
                                    
                                ); 
                              })
                        }
                        </SwiperComponent>
                        
                    </div>
                    </>
                )}
                <div className="progress" style={{display: isStep ? '' : 'none'}}>
                    {/* 상단 클래스를 strategy일 경우 progress strategy 같이 붙여줌 */}
                    <ul>
                        <li className="a on">
                            {/* 한번에 맞췄을경우 pass1 두번에 맞췄을경우 pass2 를 on옆에 붙여주세요. */}
                            <span className="tit1">Understand</span>
                            <div className="tit2">
                                <span className="a">100%</span>
                                <span className="b">75%</span>
                            </div>
                        </li>
                        <li className="ab on">
                            <span className="tit1">How to solve?</span>
                            <div className="tit2">
                                <span className="a">100%</span>
                                <span className="b">75%</span>
                            </div>
                        </li>
                        <li className="ab on">
                            <span className="tit1">Step 1</span>
                            <div className="tit2">
                                <span className="a">100%</span>
                                <span className="b">75%</span>
                            </div>
                        </li>
                        <li className="ab">
                            <span className="tit1">Step 2</span>
                            <div className="tit2">
                                <span className="a">100%</span>
                                <span className="b">75%</span>
                            </div>
                        </li>
                        <li className="ab on">
                            <span className="tit1">Step 3</span>
                            <div className="tit2">
                                <span className="a">100%</span>
                                <span className="b">75%</span>
                            </div>
                        </li>
                    </ul>
                </div>
                    {/*
                    <div className="page fixWidth" style={{display: isStudent ? 'none' : ''}}>
                        <div className="inner">
                            <SwiperComponent
                                ref={this._refSwiper}
                                {...this._soption}
                            >
                            {
                                quizResult && quizResult.length > 0 && quizResult.map((quiz,index) => {
                                    let isTwin = false; 
                                    if((quiz.seq % 2) === 0) isTwin = true;
                                    return(
                                    <div className={'num' + (quizIdx === index ? ' on' : '')} key={index}>
                                        <span>{quiz.seq + (isTwin ? '+' : '')}</span>
                                    </div> 
                                    );
                                })
                            }
                            </SwiperComponent>
                        </div>
                        </div> 
                    추후 사용할 경우를 대비해 주석 처리 
                    */}
            </div>
        );
    }
}
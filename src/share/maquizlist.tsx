import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { observable, action } from 'mobx';
import { observer } from 'mobx-react';
import { App } from '../App';
import * as _ from 'lodash';
import * as style from './style';
import { ToggleBtn } from '@common/component/button';

const SwiperComponent = require('react-id-swiper').default;

interface IMAQuizList {
    view: boolean;
    on: boolean;
    quizresults: IQuizResult[];
    strategyStep?: string[];// strategy 인 경우는 이미지로 번호 표시를 하지 않고 텍스트로만 표시 해달라는 요청이 있어서 추가 from 성준 
    selectQuiz: (idx: number) => void;
    clickSubmitlist: (idx: number) => void;
}

@observer
export class MAQuizList extends React.Component<IMAQuizList> {
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

    constructor(props: IMAQuizList) {
        super(props);
    }
    private _refSwiper = (el: SwiperComponent|null) => {
        if(this._swiper || !el) return;
        this._swiper = el.swiper;
    }
    public componentDidUpdate(prev: IMAQuizList) {
        if(this.props.view && !prev.view) {
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
        }
    }
    
    public render() {
        const {view, on, quizresults, selectQuiz, clickSubmitlist} = this.props;

        return(
            <div className="quizlist" style={{display: view ? undefined : 'none'}}>
                <SwiperComponent {...this._soption} ref={this._refSwiper}>
                <div className="listWrap">
                    <ul>
                        {quizresults.map((quiz,idx) => {
                            return(
                                <li key={idx}>
                                    <div className="top">
                                        {this.props.strategyStep ? <span className="textTitle">{this.props.strategyStep[idx]}</span> : <span className={'qNum on'}>{idx + 1}</span>}
                                        <div className="return_cnt_box" onClick={clickSubmitlist.bind(this,idx)}>
                                            <div>{quiz.submitusers} / <span className="numOfS">{quiz.allusers}</span></div>
                                        </div>
                                    </div>
                                    <div className="content" onClick={selectQuiz.bind(this,idx)}>
                                        <img src={App.data_url + quiz.thumb} />
                                        <div className={'markingState' + (on ? ' on' : '')}>
                                            <ul>
                                                <li>{quiz.heart2}</li>
                                                <li>{quiz.heart1}</li>
                                                <li>{quiz.heart0}</li>
                                                <li>{quiz.nosubmit}</li>
                                            </ul>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
                </SwiperComponent>
            </div>
        );
    }
}
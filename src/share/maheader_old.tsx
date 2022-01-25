import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { observable, action } from 'mobx';
import { observer } from 'mobx-react';
import * as _ from 'lodash';
import * as felsocket from '../felsocket';
import { parseDept3Div, parseDept4Div, parseDept5Div, parseDept5SubDiv } from '../common/component/DivFunc';

const SwiperComponent = require('react-id-swiper').default;

interface IMAHeader {
    view: boolean;
    lesson?: CurriculumType;
    lessontype?: string;
    bookid?: number;
    onExitBook?: () => void;
    onGotoBook?: (bookid: number, booklist: number[]) => void;
    onConceptLibrary?: () => void;
}

@observer
export class MAHeader extends React.Component<IMAHeader> {
    private lesson: CurriculumType|undefined = undefined;
    private curStep: CurriculumType|undefined = undefined;
    @observable public step_groups: CurriculumType[][] = []; 
    @observable public step_group_names: string[] = [];       
    @observable public viewUnitSelectBox: boolean = false;

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

    constructor(props: IMAHeader) {
		super(props);
    }
    private _refSwiper = (el: SwiperComponent|null) => {
        if(this._swiper || !el) return;
        this._swiper = el.swiper;
	}
    private onExitBook = () => {
        if(this.props.onExitBook) this.props.onExitBook();
        else {
            felsocket.clearTPenTool();
            felsocket.exitBook();
        }
    }
    private onConceptLibrary = () => {
        if(this.props.onConceptLibrary) this.props.onConceptLibrary();
    }
    private onChoiceStep = (stepid: number) => {
        if(this.lesson) {
            const step = this.lesson.childrenList.find((item, idx) => item.id === stepid);

            let booklist: number[] = [];
            this.lesson.childrenList.map((item) => {
                const id = item.book ? item.book.id : 0;
                if(id > 0) booklist.push(id);
            });

            if(step && step.book) {
                if(this.props.onGotoBook) this.props.onGotoBook(step.book.id, booklist);
                else felsocket.gotoBook(step.book.id, booklist);
            }
        }
    }
    public onViewSelectBox = () => {
        this.viewUnitSelectBox = !this.viewUnitSelectBox; 
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
    public select_box_parse() {
        if(!this.lesson || !this.curStep || this.lesson.div === undefined) return;
        if(parseDept4Div(this.lesson.div) === LessonType.CONCEPT) {
            let step_group = this.lesson.childrenList.filter((item) => parseDept5Div(item.div) === StepGroupType.WARMUP);
            if(step_group) {
                this.step_groups.push(step_group);
                this.step_group_names.push(StepGroupType.WARMUP);
            }
            step_group = this.lesson.childrenList.filter((item) => parseDept5Div(item.div) === StepGroupType.CONCEPTLEARNING);
            if(step_group) {
                this.step_groups.push(step_group);
                this.step_group_names.push(StepGroupType.CONCEPTLEARNING);
            }
            step_group = this.lesson.childrenList.filter((item) => parseDept5Div(item.div) === StepGroupType.CONCEPTLEARNING2);
            if(step_group) {
                this.step_groups.push(step_group);
                this.step_group_names.push(StepGroupType.CONCEPTLEARNING2);
            }
            step_group = this.lesson.childrenList.filter((item) => parseDept5Div(item.div) === StepGroupType.CONCEPTLEARNING3);
            if(step_group) {
                this.step_groups.push(step_group);
                this.step_group_names.push(StepGroupType.CONCEPTLEARNING3);
            }
            step_group = this.lesson.childrenList.filter((item) => parseDept5Div(item.div) === StepGroupType.WRAPUP);
            if(step_group) {
                this.step_groups.push(step_group);
                this.step_group_names.push(StepGroupType.WRAPUP);
            }

        } else if(parseDept4Div(this.lesson.div) === LessonType.PROBLEM) {
            let step_group = this.lesson.childrenList.filter((item) => parseDept5Div(item.div) === StepGroupType.WARMUP);
            if(step_group) {
                this.step_groups.push(step_group);
                this.step_group_names.push(StepGroupType.WARMUP);
            }
            step_group = this.lesson.childrenList.filter((item) => parseDept5Div(item.div) === StepGroupType.PROBLEMSOLVING);
            if(step_group) {
                this.step_groups.push(step_group);
                this.step_group_names.push(StepGroupType.PROBLEMSOLVING);
            }
            step_group = this.lesson.childrenList.filter((item) => parseDept5Div(item.div) === StepGroupType.WRAPUP);
            if(step_group) {
                this.step_groups.push(step_group);
                this.step_group_names.push(StepGroupType.WRAPUP);
            }
        }  
    }
    public componentDidMount() {
        if(this.props.lesson) {
            this.lesson = this.props.lesson;
            if(this.props.bookid) {
                this.lesson.childrenList.map((step) => {
                    if(step.book && step.book.id === this.props.bookid) this.curStep = step;
                });
            }
        }
        this.select_box_parse();
    }
	public componentDidUpdate(prev: IMAHeader) {
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
        if(this.props.lesson !== prev.lesson) {
            if(this.props.lesson) {
                this.lesson = this.props.lesson;
                if(this.props.bookid) {
                    this.lesson.childrenList.map((step) => {
                        if(step.book && step.book.id === this.props.bookid) this.curStep = step;
                    });
                }
                this.select_box_parse();
            }
        }
	}
 
    public render() {

        let curStepGroup: CurriculumType[] = [];
        
        return(
            <div className="maheader">
                <button className="btn_menu"></button>
                <div className="user">
                    <img src={`${_math_lib_}images/temp_ico_submituser_01.png`} />
                    <span className="name">Charlotee</span>
                </div>
                <div className="live_guage twinkle">
                    <div className="heart"></div>
                    <div className="bar_wrap">
                        <div className="bar" style={{width:'100%'}}></div>
                        <div className="num overmax" data-value="100">100</div>
                        {/* data-value도 text값과 같은값으로 넣어주시고요 max값 초과시 overmax클래스도 붙여주세요. */}
                    </div>
                </div>
                <div style={{display:'none'}}>
                <div className="pulldown">
                    <div className="tit" onClick={this.onViewSelectBox}>{this.curStep ? this.curStep.name : ''}</div>
                    <button className="btn_arrow" onClick={this.onViewSelectBox}/>
                </div>
                <div className={'pulldown_content ' + (this.viewUnitSelectBox ? 'on' : '')}>
                </div>
                <div>
                <SwiperComponent {...this._soption} ref={this._refSwiper}>
					{this.step_groups && this.step_groups.map((step_group, igrp) => {
                    return (
                    <div key={'grp' + igrp}>
                        <div className="tit">{this.step_group_names[igrp]}</div>
                        {step_group.map((step, istep) => {
                            if(this.curStep && step.id === this.curStep.id) curStepGroup = step_group;
                            return(<div key={'step' + istep} className="tit_sub" onClick={this.onChoiceStep.bind(this, step.id)}>{step.name}</div>);
                        })}   
                    </div>);
                    })}
				</SwiperComponent>
                </div>
                <div className="class_name">
                    {curStepGroup.map((item, ii) => {
                        return (
                            <span 
                                key={'span' + item.id} 
                                className={this.curStep && item.id === this.curStep.id ? 'now' : undefined} 
                                onClick={this.onChoiceStep.bind(this, item.id)}
                            >
                                {item.name}
                            </span>);
                    })}
                </div>
                <div className="concept_library" onClick={this.onConceptLibrary}>
                    Concept<br/>
                    Library
                </div>
                </div>
            </div>
        );
    }
}
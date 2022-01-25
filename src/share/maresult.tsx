import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { observable, action } from 'mobx';
import { observer } from 'mobx-react';
import { App } from '../App';
import * as _ from 'lodash';
import { CoverPopup } from './CoverPopup';
import { VideoPopup } from './video_popup';
import { ToggleBtn } from '@common/component/button';
import { NItem } from './NItem';
import { MASubmitUsers, MASubmitUserList } from './masubmituserlist';
import * as kutil from '@common/util/kutil';
import * as felsocket from '../felsocket';
import { PenRecordPopup } from './penrecord_popup';

const SwiperComponent = require('react-id-swiper').default;

interface IMAResultPenRecordPopUp {
    view: boolean;
    curIdx: number;
    returnStudent: ISubmitStudent;
    displayMode: number;
    onClosed: () => void;
}

@observer
class MAResultPenRecordPopUp extends React.Component<IMAResultPenRecordPopUp> {
    @observable private m_view = false;
    @observable private _curIdx: number = 0;
    
    private _swiper: Swiper|null = null;

    constructor(props: IMAResultPenRecordPopUp) {
        super(props);
    }
   
    private _refSwiper = (el: SwiperComponent) => {
		if(this._swiper || !el) return;

		const swiper = el.swiper;
		swiper.on('transitionStart', () => {
			// this._curIdx = -1;
		});
		swiper.on('transitionEnd', () => {
			if(this.props.view) {
                felsocket.clearTPenTool();
                this._curIdx = swiper.activeIndex;
			}
		});
		this._swiper = swiper;
    }
    private _updateSwiper() {
		if(this._swiper) {
			this._swiper.slideTo(0, 0);
			this._swiper.update();
			if(this._swiper.scrollbar) this._swiper.scrollbar.updateSize();

			_.delay(() => {
				if(this._swiper) {
                    this._swiper.update();
                    if(this._swiper.scrollbar) this._swiper.scrollbar.updateSize();
				}
			}, 600);
		}
    }
    private _onPrev = () => {
        if(this._curIdx === 0) return;
        App.pub_playBtnTab();
        if(this._swiper) this._swiper.slidePrev();
	}
    private _onNext = () => {
        App.pub_playBtnTab();
        if(this._swiper) this._swiper.slideNext();
    }
    private _onClose = () => {
		App.pub_playBtnTab();
		this.m_view = false;
    }
    private _onClick = (idx: number) => {
        if(this._curIdx !== idx) {
            this._curIdx = idx;
        }
    }
    public componentDidUpdate(prev: IMAResultPenRecordPopUp) {
		if(this.props.view && !prev.view) {
            this.m_view = true;
            this._updateSwiper();
		} else if(!this.props.view && prev.view) {
            this.m_view = false;
		}
    }
    
	public render() {
        const {returnStudent,displayMode} = this.props;

        const penRecordData: string[] = returnStudent && returnStudent.penRecordData ?  returnStudent.penRecordData : [];
        const student = returnStudent ? returnStudent.student : undefined;
        let usrSrc = '';
        let usrName = '';
        if(student) {
            if(displayMode === 1) {
                usrSrc = student.thumb;
                usrName = student.name;
            } else {
                usrSrc = student.avatar;
                usrName = student.nickname;
            }
        }

        return (
            <CoverPopup className="result_popup" view={this.m_view} onClosed={this.props.onClosed}>
                {/* <div className="top">
                    <div className="user_info">
                        <img src={usrSrc}/>
                        <span className="name">{usrName}</span>
                    </div>
                    <div className="page_navi">
                        {penRecordData.map((pendata,idx) => {
                            return(
                                <NItem 
                                    key={idx}
                                    idx={idx}
                                    on={this._curIdx === idx}
                                    onClick={this._onClick}
                                />
                            );
                        })}
                    </div>
                    <ToggleBtn className="btn_close" onClick={this._onClose}/>
                </div> */}
                <div className="penrecord_area">
                    <SwiperComponent
                        ref={this._refSwiper}
                        direction="horizontal"
                        observer={true}					
                    >
                    {penRecordData.map((pendata,pidx) => {
                        let audioSrc = '';
                        let bgSrc = '';
                        let thumbSrc = '';
                        if(this.props.returnStudent.audios && pidx < this.props.returnStudent.audios.length) audioSrc = this.props.returnStudent.audios[pidx];
                        if(this.props.returnStudent.images && pidx < this.props.returnStudent.images.length) bgSrc = this.props.returnStudent.images[pidx];
                        if(this.props.returnStudent.penimages && pidx < this.props.returnStudent.penimages.length) thumbSrc = this.props.returnStudent.penimages[pidx];
                        const data: PenRecordData = JSON.parse(pendata);
                        return(
                            <div key={pidx}>
                               <PenRecordPopup
                                    view={this.m_view && this._curIdx === pidx}
                                    curIdx={pidx}
                                    on={this._curIdx === pidx}
                                    thumbSrc={thumbSrc}
                                    bgSrc={bgSrc}
                                    audioSrc={audioSrc}
                                    data={data}
                                />
                            </div>
                        );
                    })}
                    </SwiperComponent>
                    <ToggleBtn className="btn_prev" view={this._curIdx > 0} onClick={this._onPrev}/>
                    <ToggleBtn className="btn_next" view={this._curIdx < penRecordData.length - 1} onClick={this._onNext}/>
                </div>
            </CoverPopup>
        );
	}
}

interface IMAResultVideoPopUp {
    view: boolean;
    curIdx: number;
    returnStudent: ISubmitStudent;
    displayMode: number;
    onClosed: () => void;
}

@observer
class MAResultVideoPopUp extends React.Component<IMAResultVideoPopUp> {
    @observable private m_view = false;
    @observable private _curIdx: number = 0;
    
	private _swiper: Swiper|null = null;

    constructor(props: IMAResultVideoPopUp) {
        super(props);
    }
    private _refSwiper = (el: SwiperComponent) => {
		if(this._swiper || !el) return;

		const swiper = el.swiper;
		swiper.on('transitionStart', () => {
			// this._curIdx = -1;
		});
		swiper.on('transitionEnd', () => {
			if(this.props.view) {
                felsocket.clearTPenTool();
                this._curIdx = swiper.activeIndex;
			}
		});
		this._swiper = swiper;
    }
    private _updateSwiper() {
		if(this._swiper) {
			this._swiper.slideTo(0, 0);
			this._swiper.update();
			if(this._swiper.scrollbar) this._swiper.scrollbar.updateSize();

			_.delay(() => {
				if(this._swiper) {
                    this._swiper.update();
                    if(this._swiper.scrollbar) this._swiper.scrollbar.updateSize();
				}
			}, 600);
		}
    }
    private _onPrev = () => {
		if(this._curIdx === 0) return;
		App.pub_playBtnTab();
		if(this._swiper) this._swiper.slidePrev();
	}
    private _onNext = () => {
        App.pub_playBtnTab();
        if(this._swiper) this._swiper.slideNext();
    }
    private _onClose = () => {
		App.pub_playBtnTab();
		this.m_view = false;
    }
    private _onClick = (idx: number) => {
        if(this._curIdx !== idx) {
            this._curIdx = idx;
        }
    }
    public componentDidUpdate(prev: IMAResultVideoPopUp) {
		if(this.props.view && !prev.view) {
            this.m_view = true;
            this._updateSwiper();
		} else if(!this.props.view && prev.view) {
            this.m_view = false;
		}
    }
    
	public render() {
        const {returnStudent,displayMode} = this.props;

        const videos: string[] = returnStudent && returnStudent.videos ?  returnStudent.videos : [];
        const student = returnStudent ? returnStudent.student : undefined;
        let usrSrc = '';
        let usrName = '';
        if(student) {
            if(displayMode === 1) {
                usrSrc = student.thumb;
                usrName = student.name;
            } else {
                usrSrc = student.avatar;
                usrName = student.nickname;
            }
        }

        return (
            <CoverPopup className="result_popup" view={this.m_view} onClosed={this.props.onClosed}>
                <div className="top">
                    <div className="user_info">
                        <img src={usrSrc}/>
                        <span className="name">{usrName}</span>
                    </div>
                    <div className="page_navi">
                        {videos.map((video,idx) => {
                            return(
                                <NItem 
                                    key={idx}
                                    idx={idx}
                                    on={this._curIdx === idx}
                                    onClick={this._onClick}
                                />
                            );
                        })}
                    </div>
                    <ToggleBtn className="btn_close" onClick={this._onClose}/>
                </div>
                <div className="penrecord_area">
                    <SwiperComponent
                        ref={this._refSwiper}
                        direction="horizontal"
                        observer={true}					
                    >
                    {videos.map((video,vidx) => {
                        return(
                            <div key={vidx}>
                                <VideoPopup
                                    view={this.m_view}
                                    videoSrc={video}
                                    curIdx={vidx}
                                    on={this._curIdx === vidx}
                                />
                            </div>
                        );
                    })}
                    </SwiperComponent>
                    <ToggleBtn className="btn_prev" view={this._curIdx > 0} onClick={this._onPrev}/>
                    <ToggleBtn className="btn_next" view={this._curIdx < videos.length - 1} onClick={this._onNext}/>
                </div>
            </CoverPopup>
        );
	}

}

interface IMAResultImagePopUp {
    view: boolean;
    curIdx: number;
    returnStudent: ISubmitStudent;
    displayMode: number;
    onClosed: () => void;
}

@observer
class MAResultImagePopUp extends React.Component<IMAResultImagePopUp> {
    @observable private m_view = false;
    @observable private _curIdx: number = 0;
        
	private _swiper: Swiper|null = null;

    constructor(props: IMAResultImagePopUp) {
        super(props);
    }
    private _refSwiper = (el: SwiperComponent) => {
		if(this._swiper || !el) return;

		const swiper = el.swiper;
		swiper.on('transitionStart', () => {
			this._curIdx = -1;
		});
		swiper.on('transitionEnd', () => {
			if(this.props.view) {
                felsocket.clearTPenTool();
                this._curIdx = swiper.activeIndex;
			}
		});
		this._swiper = swiper;
    }
    private _onClose = () => {
		App.pub_playBtnTab();
		this.m_view = false;
    }
    private _onClick = (idx: number) => {
        if(this._curIdx !== idx) {
            this._curIdx = idx;
        }
    }
    private _onPrev = () => {
		if(this._curIdx === 0) return;
		App.pub_playBtnTab();
		if(this._swiper) this._swiper.slidePrev();
	}
    private _onNext = () => {
        App.pub_playBtnTab();
        if(this._swiper) this._swiper.slideNext();
    }
    private _updateSwiper() {
		if(this._swiper) {
			this._swiper.slideTo(0, 0);
			this._swiper.update();
			if(this._swiper.scrollbar) this._swiper.scrollbar.updateSize();

			_.delay(() => {
				if(this._swiper) {
                    this._swiper.update();
                    if(this._swiper.scrollbar) this._swiper.scrollbar.updateSize();
				}
			}, 600);
		}
    }
    public componentDidUpdate(prev: IMAResultImagePopUp) {
		if(this.props.view && !prev.view) {
            this.m_view = true;
            this._updateSwiper();
		} else if(!this.props.view && prev.view) {
			this.m_view = false;
		}
    }
    
    
	public render() {
        const {returnStudent,displayMode} = this.props;

        const images: string[] = returnStudent && returnStudent.images ?  returnStudent.images : [];
        const student = returnStudent ? returnStudent.student : undefined;
        let usrSrc = '';
        let usrName = '';
        if(student) {
            if(displayMode === 1) {
                usrSrc = student.thumb;
                usrName = student.name;
            } else {
                usrSrc = student.avatar;
                usrName = student.nickname;
            }
        }

        return (
            <CoverPopup className="result_popup" view={this.m_view} onClosed={this.props.onClosed}>
                <div className="top">
                    <div className="user_info">
                        <img src={usrSrc}/>
                        <span className="name">{usrName}</span>
                    </div>
                    <div className="page_navi">
                        {images.map((image,iidx) => {
                            return(
                                <NItem 
                                    key={iidx}
                                    idx={iidx}
                                    on={this._curIdx === iidx}
                                    onClick={this._onClick}
                                />
                            );
                        })}
                    </div>
                    <ToggleBtn className="btn_close" onClick={this._onClose}/>
                </div>
                <div className="image_area">
                    <SwiperComponent
                        ref={this._refSwiper}
                        direction="horizontal"
                        observer={true}					
                    >
                    {images.map((image,index) => {
                        return(
                            <img key={index} src={image}/>
                        );
                    })}
                    </SwiperComponent>
                    <ToggleBtn className="btn_prev" view={this._curIdx > 0} onClick={this._onPrev}/>
                    <ToggleBtn className="btn_next" view={this._curIdx < images.length - 1} onClick={this._onNext}/>
                </div>
            </CoverPopup>
        );
	}

}

interface IMAResult {
    view: boolean;
    type: 'penrecord' | 'video' | 'image'; 
    sumbitMode: 1|2|3;
    submitStudent: ISubmitStudent[];
    submitUsers: number;
    displayMode: number;
}

@observer
export class MAResult extends React.Component<IMAResult> {
    @observable private _viewPenRecordPopup = false;
    @observable private _viewVideoPopup = false;
    @observable private _viewImagePopup = false;
    @observable private _selected: boolean[] = [];
    @observable private _viewInfo: boolean = true;
    @observable private _viewSubmitList: boolean = false;

    private curIdx: number = -1;

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

    constructor(props: IMAResult) {
        super(props);    
    }
    private _refSwiper = (el: SwiperComponent|null) => {
        if(this._swiper || !el) return;
        this._swiper = el.swiper;
    }
    private onOpenSubmitList = () => { this._viewSubmitList = true; };
	private onCloseSubmitList = () => { this._viewSubmitList = false; };
    private _penrecordPopupClosed = () => {
		this._viewPenRecordPopup = false;
    }
    private _videoPopupClosed = () => {
		this._viewVideoPopup = false;
    }
    private _imagePopupClosed = () => {
		this._viewImagePopup = false;
    }
    private _showPenRecordPopup = (idx: number) => {
        this.curIdx = idx;
        this._viewPenRecordPopup = !this._viewPenRecordPopup;
    }
    private _showVideoPopup = (idx: number) => {
        this.curIdx = idx;
        this._viewVideoPopup = !this._viewVideoPopup;
    }
    private _showImagePopup = (idx: number) => {
        this.curIdx = idx;
        this._viewImagePopup = !this._viewImagePopup;
    }
    private _showUserInfo = (idx: number) => {
        if(this._selected[idx]) this._selected[idx] = false;
        else this._selected[idx] = true;
       
    }
    private _showViewInfo = () => {
        if(this.props.submitStudent.length === 0) return;
        this._viewInfo = !this._viewInfo;
    }
    private _updateSwiper() {
		if(this._swiper) {
			this._swiper.slideTo(0, 0);
			this._swiper.update();
			if(this._swiper.scrollbar) this._swiper.scrollbar.updateSize();

			_.delay(() => {
				if(this._swiper) {
                    this._swiper.slideTo(0, 0);
                    this._swiper.update();
                    if(this._swiper.scrollbar) this._swiper.scrollbar.updateSize();
				}
			}, 600);
		}
    }
    public componentDidUpdate(prev: IMAResult) {
        if(this.props.view && !prev.view) {
            for(let i = 0; i < App.students.length; i++) {
                this._selected.push(false);
            }
            this._updateSwiper();
        } 
        if(this.props.submitUsers !== prev.submitUsers) {
            this._updateSwiper();
        }
    }
    public render() {
        const {submitStudent,type,view,displayMode} = this.props;
        return ( 
        <div className="resultlist" style={{display: view ? undefined : 'none'}} >
            <div className="top_control">
                {/* <div className="status">1 / <span>15</span></div> */}
                <MASubmitUsers
                    view={view}
                    submitusers={submitStudent.length}
                    totalusers={App.students.length}
                    onClick={this.onOpenSubmitList}
                />
                <ToggleBtn className="btn_viewInfo" on={this._viewInfo} onClick={this._showViewInfo}/>
            </div>
            <div className="list">
            <SwiperComponent {...this._soption} ref={this._refSwiper}>
            <div className="listWrap">
            <ul>
                {submitStudent.map((student,lidx) => {
                    let usrSrc = '';
                    let usrName = '';
                    if(student) {
                        if(displayMode === 1) {
                            usrSrc = student.student.thumb;
                            usrName = student.student.name;
                        } else {
                            usrSrc = student.student.avatar;
                            usrName = student.student.nickname;
                        }
                    }
                    
                    if(type === 'penrecord') {
                        const isdata = student.penRecordData && student.penRecordData.length > 0 && student.penRecordData[0] !== '';
                        const isimage = student.images && student.images.length > 0 && student.images[0] !== '';
                        return(
                        <li key={lidx}>
                            <div className={'cntBox'}> {/* no_result: 미 판서 상태일 경우 */}
                                <span className="no_result" style={{display: isdata ? 'none' : undefined }}/>
                                <img 
                                    className="bg"
                                    src={student.images ? student.images[0] : ''}
                                    hidden={!this._viewInfo || !isimage || !isdata}
                                /> {/* 비공개 상태일 때 hidden으로 감추기 */}
                                <img 
                                    className="thumb"
                                    src={student.penimages ? student.penimages[0] : ''}
                                    hidden={!this._viewInfo || !isimage || !isdata}
                                /> {/* 비공개 상태일 때 hidden으로 감추기 */}
                                <ToggleBtn 
                                    view={isdata}
                                    className="btn_play" 
                                    onClick={this._showPenRecordPopup.bind(this,lidx)}
                                />
                            </div>
                            <div className="user_info">
                                <ToggleBtn className="btn_info" style={{display: this._viewInfo ? 'none' : undefined}}  onClick={this._showUserInfo.bind(this,lidx)}/> {/* 비공개 상태에서만 보임 */}
                                <div className={('user' + (this._viewInfo ? '' : ' open'))} style={{display: this._selected[lidx] || this._viewInfo ? undefined : 'none'}}> {/* 개별적 오픈 - open 클래스 추가 */}
                                    <img src={usrSrc} />
                                    <span className="user_name">{usrName}</span>
                                    <ToggleBtn className="btn_close" onClick={this._showUserInfo.bind(this,lidx)}/>
                                </div>
                            </div>
                        </li>
                        );
                    } else if(type === 'video') {
                        const isvideo = student.videos && student.videos.length > 0 && student.videos[0] !== '';
                        return(
                        <li key={lidx}>
                            <div className={'cntBox'}> {/* no_result: 미 판서 상태일 경우 */}
                                <span className="no_result" style={{display: isvideo ? 'none' : undefined }}/>
                                <video 
                                    src={student.videos ? student.videos[0] : ''} 
                                    hidden={!this._viewInfo || !isvideo}
                                />
                                <ToggleBtn 
                                    view={isvideo}
                                    className="btn_play" 
                                    onClick={this._showVideoPopup.bind(this,lidx)}
                                />
                            </div>
                            <div className="user_info">
                                <ToggleBtn className="btn_info" style={{display: this._viewInfo ? 'none' : undefined}}  onClick={this._showUserInfo.bind(this,lidx)}/> {/* 비공개 상태에서만 보임 */}
                                <div className={('user' + (this._viewInfo ? '' : ' open'))} style={{display: this._selected[lidx] || this._viewInfo ? undefined : 'none'}}> {/* 개별적 오픈 - open 클래스 추가 */}
                                    <img src={usrSrc} />
                                    <span className="user_name">{usrName}</span>
                                    <ToggleBtn className="btn_close" onClick={this._showUserInfo.bind(this,lidx)}/>
                                </div>
                            </div>
                        </li>
                        );
                    } else {
                        const isimage = student.images && student.images.length > 0 && student.images[0] !== '';
                        return(
                        <li key={lidx}>
                            <div className="cntBox"> {/* no_result: 미 판서 상태일 경우 */}
                                <span className="no_result" style={{display: isimage ? 'none' : undefined }}/>
                                <img 
                                    src={student.images ? student.images[0] : ''} 
                                    hidden={!this._viewInfo || !isimage}
                                /> {/* 비공개 상태일 때 hidden으로 감추기 */}
                                <ToggleBtn 
                                    view={isimage}
                                    className="btn_view" 
                                    onClick={this._showImagePopup.bind(this,lidx)}
                                />
                            </div>
                            <div className="user_info">
                                <ToggleBtn className="btn_info" style={{display: this._viewInfo ? 'none' : undefined}} onClick={this._showUserInfo.bind(this,lidx)}/> {/* 비공개 상태에서만 보임 */}
                                <div className={('user' + (this._viewInfo ? '' : ' open'))} style={{display: this._selected[lidx] || this._viewInfo ? undefined : 'none'}}> {/* 개별적 오픈 - open 클래스 추가 */}
                                    <img src={usrSrc} />
                                    <span className="user_name">{usrName}</span>
                                    <ToggleBtn className="btn_close" onClick={this._showUserInfo.bind(this,lidx)}/>
                                </div>
                            </div>
                        </li>
                        );
                    }
                })}
            </ul>
            </div>
            </SwiperComponent>
            </div>
            <div className="ready" style={{display: submitStudent.length > 0 ? 'none' : undefined}}/>
            {/* <MASubmitUserList
                view={this._viewSubmitList} 
                mode={this.props.sumbitMode}
                submitusers={submitStudent}
                displayMode={displayMode}
                onClose={this.onCloseSubmitList}
            /> */}
            <MAResultPenRecordPopUp
                view={this._viewPenRecordPopup}
                curIdx={this.curIdx}
                returnStudent={this.props.submitStudent[this.curIdx]}
                displayMode={displayMode}
                onClosed={this._penrecordPopupClosed}
            />
            <MAResultVideoPopUp
                view={this._viewVideoPopup}
                curIdx={this.curIdx}
                returnStudent={this.props.submitStudent[this.curIdx]}
                displayMode={displayMode}
                onClosed={this._videoPopupClosed}
            />
            <MAResultImagePopUp
                view={this._viewImagePopup}
                curIdx={this.curIdx}
                returnStudent={this.props.submitStudent[this.curIdx]}
                displayMode={displayMode}
                onClosed={this._imagePopupClosed}
            />
        </div>
        );
    }
}
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { observable, action } from 'mobx';
import { observer } from 'mobx-react';
import { App } from '../App';
import * as _ from 'lodash';
import { ToggleBtn } from '@common/component/button';
import { find, findIndex } from 'lodash';
import * as kutil from '@common/util/kutil';
import { CoverPopup } from './CoverPopup';
import ControlBox from './ControlBox';
import { setLivePoint,ILivePointRequest,ILivePointResponse } from '@common/component/livepoint';
import { MALiveHeader } from './MALivegetHeader';
import { MPlayer, MConfig, MPRState, IMedia } from '@common/mplayer/mplayer';
import Draggable from 'react-draggable';
import * as felsocket from '../felsocket';
// import * as style from './style';
import { state } from '@common/component/Keyboard';

// 비디오, 오디오 필수 때문에 재정의 (= /ma_module_portfolio/common.ts)
interface ISubmitStudent {
	student: IStudent;
	correct: boolean;
	trycnt: number; // 정답 맞춘 회수
	livePoint: number // bonus time + 일반 점수 합친 토탈 점수 
	point?: number // 순수 점수 
	timebonus?: number // 보너스 타임 점수 
	medal?: string; // 순위 관련 메달 이름
	bar_color?: string;// 순위바 색깔 관련
	images?: string[];
	videos: string[];
	audios: string[];
    beat: string[];
    playTime?: string;
    record: string;// 모듈 포트폴리오 녹음 / 녹화
	penimages?: string[];
	penRecordData?: string[];
    recordType: 'lyrics_lab'|'';
	order?: number;// 제출 순서  
    nosubmit?: boolean;
}

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
    contentType?: string;
    contentName?: string;
}

const enum BEATPROG {
	LODING,    
	READY,
	PLAY,				
	PAUSE,
	STOP,				
}

const enum MYSTATE {
	VIEW,
	READY,
	WAIT_START,
	RECORDING,
	WAIT_END,
	RECORDED,
	SENDING,
	SENDED,
}

@observer
class DetailPopup extends React.Component<IDetailPopup> {
	private _box!: HTMLElement;
    private _imagebox!: HTMLElement;
    @observable private m_view = false;
    @observable private _curIdx: number = -1;
    @observable private _sIdx: number = -1;
    @observable private _imageIdx: number = 0;
	@observable private _time = 0;
    @observable private playlistOpen: boolean = false;
    @observable private beatSelect: {image: number, mp3: string} = {image: 0, mp3: ''}; // 노래 파일 경로
    @observable private beatProg: BEATPROG = BEATPROG.READY;
    @observable private presenterBeat: JSX.Element[] = []
    private beatList: string[] = [];
    private beatPlayTime: number[] = [57, 53, 50, 49, 56, 47]
    private beatAudio: HTMLAudioElement = new Audio(); // 비트 오디오
    @observable private getBeatTime: number = 0;

	private _audio = new MPlayer(new MConfig(false));
	private _video = new MPlayer(new MConfig(true));
    
	@observable private _playCnt = 0;
	@observable private _loaded = false;
	private recordState: 'video' | 'audio' | '' = '';
    private recordType: '' | 'lyrics_lab' = '';
    // private beat: string = '';
    private cTime: number = 0;

    @observable private recordUrl: string = '';    
    @observable private _isPlay: boolean = false;
    @observable private isFull: boolean = false;

	@observable private _videoState = MYSTATE.READY;

    constructor(props: IDetailPopup) {
        super(props);

        for (let i = 1; i < 7; i++) {
            this.beatList.push(`${_math_lib_}MA/module_portfolio/common/beat0${i}.mp3`)   
        }
    }

    private _onBack = (from: 'presenter'|'list',studentId: string) => {
        let sid = this.props.submitStudents[this._curIdx][this._sIdx].student.id;
        this.props.onClosed(from,sid);
        this.props.onSendLiveget(sid);
        this._isPlay = false;
        // this._audio.gotoAndPause(0);
        // this._video.gotoAndPause(0);
        if(this._video.bPlay) this._video.pause();
        this._video.destory();
        if(this._audio.bPlay) this._audio.pause();
        this._audio.destory();
        this.recordState = "";
    }
    private _onPrev = () => {
        App.pub_playBtnTab();

        // const lyrics_wrap = document.querySelector('.result_popup .result_cnt.type04 .wrap_bg .img_wrap');
        // if(lyrics_wrap) lyrics_wrap.scrollTop = 0;
        if(this._sIdx === 0) return;

        this._sIdx--;
        // 녹음/녹화 발표시 결과물 없는 경우에 대한 예외처리
        if(this.recordState === 'video') {
            const video = this.props.submitStudents[this._curIdx][this._sIdx].videos[0]
            // console.log('이전 학생 video', video)
            if(video === '' || !video) {
                this._sIdx++;
                return;
            }
        } else if(this.recordState === 'audio') {
            const audio = this.props.submitStudents[this._curIdx][this._sIdx].audios[0]
            // console.log('이전 학생 audio', audio)
            if(audio === '' || !audio) {
                this._sIdx++;
                return;
            }
        }
        // 미제출일 경우 안보기
        if(this.props.submitStudents[this._curIdx][this._sIdx].nosubmit) {
            this._sIdx++;
            return;
        }
		kutil.wait(1000); 

        let sid = this.props.submitStudents[this._curIdx][this._sIdx].student.id;

        // console.log('prev presenter')
        if(sid) this._stopClick();
        this.props.onPrev(sid);

        // const img_wrap = document.querySelector('.t_sendshare .result_popup .result_cnt .img_wrap')
        // console.log('img_wrap', img_wrap);
        // if(img_wrap) {
        //     img_wrap.scrollTop = 0;
        // }
        this._imagebox.scrollTop = 0;
        
        this._video.unload();
        this._audio.unload();
        this.beatAudio.pause;
        if(this.recordType === 'lyrics_lab') { 
            // console.log('_onPrev recordType === lyrics_lab')
            this.beatAudio.src = this.props.submitStudents[this._curIdx][this._sIdx].beat[0];
            this.beatAudio.play;
            this.beatAudio.loop = true;
        } else {
            // console.log('_onPrev recordType !== lyrics_lab')
        }

        this.presenterBeatRender();
    
        if(this.recordState === 'audio') { 
            this._audio.load(this.props.submitStudents[this._curIdx][this._sIdx].audios[0]);
            // console.log('_onPrev audio', this._audio.duration);
        } else if(this.recordState === 'video') {
            this._video.load(this.props.submitStudents[this._curIdx][this._sIdx].videos[0]);
            // console.log('_onPrev video', this._video.duration);
        }
    }
    private _onNext = () => {
        App.pub_playBtnTab();
        
        // const lyrics_wrap = document.querySelector('.result_popup .result_cnt.type04 .wrap_bg .img_wrap');
        // if(lyrics_wrap) lyrics_wrap.scrollTop = 0;
        if(this._sIdx === this.props.submitStudents[this._curIdx].length - 1) return; 

        this._sIdx++;
        // 녹음/녹화 발표시 결과물 없는 경우에 대한 예외처리
        if(this.recordState === 'video') {
            const video = this.props.submitStudents[this._curIdx][this._sIdx].videos[0]
            // console.log('다음 학생 audio', video)
            if(video === '' || !video) {
                this._sIdx--;
                return;
            }
        } else if(this.recordState === 'audio') {
            const audio = this.props.submitStudents[this._curIdx][this._sIdx].audios[0]
            // console.log('다음 학생 audio', audio)
            if(audio === '' || !audio) {
                this._sIdx--;
                return;
            }
        }
        // 미제출일 경우 안보기
        if(this.props.submitStudents[this._curIdx][this._sIdx].nosubmit) {
            this._sIdx--;
            return;
        }
		kutil.wait(1000); 

        let sid = this.props.submitStudents[this._curIdx][this._sIdx].student.id;
        // console.log('next presenter')
        if(sid) this._stopClick();
        this.props.onNext(sid);

        // const img_wrap = document.querySelector('.t_sendshare .result_popup .result_cnt .img_wrap')
        // if(img_wrap) {
        //     img_wrap.scrollTop = 0;
        // }
        this._imagebox.scrollTop = 0;

        this._video.unload();
        this._audio.unload();
        this.beatAudio.pause;
        if(this.recordType === 'lyrics_lab') { 
            // console.log('_onNext recordType === lyrics_lab')
            this.beatAudio.src = this.props.submitStudents[this._curIdx][this._sIdx].beat[0];
            this.beatAudio.play;
            this.beatAudio.loop = true;
        } else {
            // console.log('_onNext recordType !== lyrics_lab')
        }

        this.presenterBeatRender();

        if(this.recordState === 'audio') { 
            this._audio.load(this.props.submitStudents[this._curIdx][this._sIdx].audios[0]);
            // console.log('_onNext audio', this._audio.duration);
        } else if(this.recordState === 'video') {
            this._video.load(this.props.submitStudents[this._curIdx][this._sIdx].videos[0]);
            // console.log('_onNext video', this._video.duration);
        }
    }
    private presenterBeatRender = () => {
        this.presenterBeat = []
        let alphabet = ['a', 'b', 'c', 'd', 'e', 'f'];

        for (let i = 0; i < this.beatList.length; i++) {
            if(this.props.submitStudents[this._curIdx][this._sIdx].beat[0] === this.beatList[i]) {    
                this.presenterBeat.unshift(
                    <li key={`beat${i}`}>
                        <button onClick={() => this.beatPlay(i)} className={this.beatSelect.mp3 === this.beatList[i] && this.beatProg === BEATPROG.PLAY ? `${alphabet[i]} check pause` : this.beatSelect.mp3 === this.beatList[i] && this.beatProg === BEATPROG.STOP ? `${alphabet[i]} check play` : `${alphabet[i]}`} />
                    </li>
                )
            } else {
                this.presenterBeat.push(
                    <li key={`beat${i}`}>
                        <button onClick={() => this.beatPlay(i)} className={this.beatSelect.mp3 === this.beatList[i] && this.beatProg === BEATPROG.PLAY ? `${alphabet[i]} check pause` : this.beatSelect.mp3 === this.beatList[i] && this.beatProg === BEATPROG.STOP ? `${alphabet[i]} check play` : `${alphabet[i]}`} />
                    </li>
                )
            }
        }
        this.forceUpdate();
    }
	private _refBox = (el: HTMLElement | null) => {
		if (this._box || !el) return;
		this._box = el;
	}
    private _refImageBox = (el: HTMLElement | null) =>{
        if(this._imagebox || !el) return;
        this._imagebox = el;
        if(this._imagebox) {
            this._imagebox.scrollTop = 0;
        }
    }
    // 오디오
	private _refAudio = (audio: HTMLAudioElement|null) => {
		if(this._audio.media || !audio) return;
		this._audio.mediaInited(audio as IMedia);
	}
	private _refVideo = (video: HTMLVideoElement|null) => {
		if(this._video.media || !video) return;
		this._video.mediaInited(video as IMedia);

		this._video.addOnState((newState, oldState) => {
			if(newState === MPRState.READY) {
				this._loaded = true;
				this._video.gotoAndPause(0);
			}
		});
	}
	private playEnd = () => {
        // console.log('재생 완료', );
        
        this.beatAudio.pause();	
        this.beatAudio.currentTime = 0;
        this.beatProg = BEATPROG.STOP;
        
        _.delay(() => {
            this._audio.gotoAndPause(0);
            this._video.gotoAndPause(0);
            this._isPlay = false;
        }, 500);
    }
	private _stopClick = () => {
		App.pub_playBtnTab();

		this._audio.gotoAndPause(0);
		this._video.gotoAndPause(0);
        this.beatProg = BEATPROG.STOP
        this.beatAudio.pause();	
        this.beatAudio.currentTime = 0;
        this._isPlay = false;
	}
	private _onPlayStop = (getTime: number) => {
		App.pub_playBtnTab();
		// if(!this.props.view) return;
		// else if(this._videoState < MYSTATE.RECORDED) return;
        // console.log('getTime', getTime);
		// this._playCnt++;
        // 플레이 / 일시정지 현 상태 확인
        if(this.recordType === 'lyrics_lab') { 
            if(this.beatProg === BEATPROG.STOP || this.beatProg === BEATPROG.READY) {
                // console.log('비트 정지 -> 플레이', );
                this.beatAudio.play();	
                this.beatProg = BEATPROG.PLAY;
                this.beatAudio.currentTime = 0;
            } else if(this.beatProg === BEATPROG.PLAY) {
                // console.log('비트 플레이중 -> 일시정지', );
                this.beatProg = BEATPROG.PAUSE;
                this.beatAudio.pause();	
            } else if(this.beatProg === BEATPROG.PAUSE)  {
                // console.log('비트 일시정지 -> 플레이', );
                this.beatProg = BEATPROG.PLAY;
                this.beatAudio.play();	
                this.beatAudio.currentTime = getTime;
            }
        }

		if(this.recordState === 'audio') {
			if(this._audio.bPlay) {
                // console.log('audio pause');
                this._audio.pause();
                this._isPlay = false;
			} else { 
                // console.log('audio play')
                this._audio.play();
                this._isPlay = true;
            }
		} else if(this.recordState === 'video') {
			if(this._video.bPlay) {
                // console.log('video pause');
                this._video.pause();
                this._isPlay = false;
            } else { 
                // console.log('video play', this._video)
                this._video.play();
                this._isPlay = true;
            }
		}
	}
    private dragStart = (data: {x: any, y: any}, num: number) => {
        // console.log('드래그 시작', data)
    }
    private dragStop = (data: {x: any, y: any}, num: number) => {
        // console.log('드래그 멈춤', data)
    }
    private barTimeCheck = async () => {
        if(this.recordType === 'lyrics_lab') {
            // console.log('drag check')
            this.beatProg = BEATPROG.PAUSE;
            this.beatAudio.pause();	
            this.beatAudio.currentTime = 0;
            await kutil.wait(300);
            const time = document.querySelector('.audio_box .control .video_time .crt_time')?.childNodes[0].nodeValue;
            let arr;
            const beatNum = this.beatAudio.src.substr(-5, 1);
            if(time) arr = time.split(":")
            // console.log('time arr', arr, beatNum)

            if(arr && arr[0] === '0') {
                // console.log('arr[0] === 00')
                this.beatAudio.currentTime = Number(arr[1]);
            } else if(arr && arr[0] === '1') {
                // console.log('arr[0] === 01')
                switch (beatNum) {
                    case '1':
                        this.beatAudio.currentTime = 1 + Number(arr[1]);
                        break;
                    case '2':
                        this.beatAudio.currentTime = 2 + Number(arr[1]);
                        break;
                    case '3':
                        this.beatAudio.currentTime = 3 + Number(arr[1]);
                        break;
                    case '4':
                        this.beatAudio.currentTime = 1 + Number(arr[1]);
                        break;
                    case '5':
                        this.beatAudio.currentTime = 0 + Number(arr[1]);
                        break;
                    case '6':
                        this.beatAudio.currentTime = 3 + Number(arr[1]);
                        break;
                    default:
                        break;
                }
            }
            // console.log('this.beatAudio.currentTime', this.beatAudio.currentTime)

            if(this._audio.bPlay || this._video.bPlay) {
                // console.log('beatAudio.play')
                this.beatProg = BEATPROG.PLAY;
                this.beatAudio.play();
            }
        }
    }
	private _toggleFullscreen = () => {
		App.pub_playBtnTab();
		if (document['fullscreenElement'] === this._box || document['webkitFullscreenElement'] === this._box) {
			if (document.exitFullscreen) { 
                document.exitFullscreen();
            } else if (document['webkitExitFullscreen']) { 
                document['webkitExitFullscreen'](); 
            }
		} else {
            if (this._box.requestFullscreen) this._box.requestFullscreen();
			else if (this._box['webkitRequestFullscreen']) this._box['webkitRequestFullscreen'](); 	
		}
        this.isFull = !this.isFull;
	}    
	private _toggleMute = () => {
		App.pub_playBtnTab();
		this._audio.setMuted(!this._audio.muted);
		this._video.setMuted(!this._video.muted);
	}
    private _playlistOpen = () => {
        this.playlistOpen = !this.playlistOpen;
    }
    private beatPlay = (num: number) => {
        this.beatAudio.loop = true;
        this.cTime = this.beatAudio.currentTime;
        if(this.beatSelect.mp3 !== this.beatList[num]) {
            // console.log('다른 비트 재생')
            this.beatSelect.mp3 = this.beatAudio.src = this.beatList[num];
            this.beatSelect.image = num;
            this.beatProg = BEATPROG.PLAY;
            this.beatAudio.play();
            this.presenterBeatRender();
            return;
        }
        if(this.beatProg === BEATPROG.PLAY) {
            this.beatProg = BEATPROG.STOP;
            this.beatAudio.pause();
        } else {
            this.beatProg = BEATPROG.PLAY;
            this.beatAudio.currentTime = this.cTime
            this.beatAudio.play();
        }
        this.presenterBeatRender();
    }

    public componentDidUpdate(prev: IDetailPopup) {
        if(this.props.view && !prev.view) {
            // 뷰 true
            this.m_view = true;
            this._curIdx = this.props.quizIdx;
            this.beatAudio.loop = true;
    
            
            this._sIdx =  _.findIndex(this.props.submitStudents[this._curIdx],{student: {id: this.props.studentId}});
            this.recordType = this.props.submitStudents[this._curIdx][this._sIdx].recordType === 'lyrics_lab' ? 'lyrics_lab' : '';
            
            // lyrics_lab 일 경우
            if(this.recordType === 'lyrics_lab') { 
                this.presenterBeatRender();
                this.beatAudio.src = this.props.submitStudents[this._curIdx][this._sIdx].beat[0];
            } else {
                this.beatAudio.src = '';
            }
            const recordProps = this.props.submitStudents[this._curIdx][this._sIdx].record;

            if(recordProps === 'video') {
                this.recordState = 'video';
                this.recordUrl = this.props.submitStudents[this._curIdx][this._sIdx].videos[0]
                // console.log('비디오', this.recordUrl);

                this._video.load(this.recordUrl);
            } else if(recordProps === 'audio') {
                this.recordState = 'audio';
                this.recordUrl = this.props.submitStudents[this._curIdx][this._sIdx].audios[0]
                // console.log('오디오', this.recordUrl);
                
                this._audio.load(this.recordUrl);
            } else {
                this._videoState = MYSTATE.READY;
                this.recordState = ''
                this.recordUrl = ''
                // console.log('녹음 / 녹화 없음')
            }

            // 플레이리스트
            this.beatProg = BEATPROG.READY;
            this.playlistOpen = false;
        } else if(!this.props.view && prev.view) {
            // 뷰 false
            App.pub_playBtnTab();
            this._imagebox.scrollTop = 0;
            this.beatAudio.pause();
            if(this._video.bPlay) this._video.pause();
            if(this._audio.bPlay) this._audio.pause();
			this._video.destory();
			this._audio.destory();
            // const img_wrap = document.querySelector('.t_sendshare .result_popup .result_cnt .img_wrap');
            // if(img_wrap) {
            //     img_wrap.scrollTop = 0;
            // }

            // 플레이리스트
            this.beatProg = BEATPROG.READY;
            this.playlistOpen = false;
            
            this.m_view = false;
        }
    }
    public render() {
        const{from,studentId,showhide, contentType, contentName} = this.props;
        let livePoint: number = 0; 
        let thumb = '';
        let studentName = '';
        let images; 
        let sid = '';
        let gender: string|undefined = '';
        let recordUrl: string = '';

        console.log('this.props.submitStudents', this.props.submitStudents);
        if(this.props.submitStudents && this.props.submitStudents.length > 0 && this._curIdx > -1 && this._sIdx > -1) {
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
            
            if(this.props.submitStudents[this._curIdx][this._sIdx].images) {
                images = this.props.submitStudents[this._curIdx][this._sIdx].images;
                if(images && images?.length <= 0) {
                    if(contentType === 'type01') images[0] = `${_math_lib_}MA/module_portfolio/common/bg_s_math_journal.png`
                    else if(contentType === 'type02') images[0] = `${_math_lib_}MA/module_portfolio/common/bg_s_role_playing.png`
                    else if(contentType === 'type03') images[0] = `${_math_lib_}MA/module_portfolio/common/bg_s_concept_board.png`;
                    else if(contentType === 'type04') images[0] = `${_math_lib_}MA/module_portfolio/common/bg_s_lyrics_lab.png`;
                    else if(contentType === 'type05') images[0] = `${_math_lib_}MA/module_portfolio/common/temp_letme_explain_problem.png`;
                    // '' | 'pink' | 'orange' | 'blue' | 'green' | 'purple'
                    else if(contentType === 'pink') images[0] = `${_math_lib_}MA/steam_portfolio/common/bg_t_pink.png`;
                    else if(contentType === 'orange') images[0] = `${_math_lib_}MA/steam_portfolio/common/bg_t_orange.png`;
                    else if(contentType === 'blue') images[0] = `${_math_lib_}MA/steam_portfolio/common/bg_t_blue.png`;
                    else if(contentType === 'green') images[0] = `${_math_lib_}MA/steam_portfolio/common/bg_t_green.png`;
                    else if(contentType === 'purple') images[0] = `${_math_lib_}MA/steam_portfolio/common/bg_t_purple.png`;
                } else if(images === undefined) {
                    console.log('img_send_error images');
                    images = [];
                    images[0] = `${_math_lib_}images/img_send_error.png`;
                }
            }
            sid = this.props.submitStudents[this._curIdx][this._sIdx].student.id + '';
            gender = this.props.submitStudents[this._curIdx][this._sIdx].student.gender ? this.props.submitStudents[this._curIdx][this._sIdx].student.gender : '';

            // if(this.props.submitStudents[this._curIdx][this._sIdx].record === 'video') {
            //     recordUrl = this.props.submitStudents[this._curIdx][this._sIdx].videos[0]
            // } else if(this.props.submitStudents[this._curIdx][this._sIdx].record === 'audio') {
            //     recordUrl = this.props.submitStudents[this._curIdx][this._sIdx].audios[0]
            //     // this._audio.load(recordUrl);
            // } else { 
            //     console.log('비디오 / 오디오 없음')
            // }
        }
        // const MAX_TIME = 30;
        // const MAX_TIME_STR = '00:30';
        
        function _toStr(n: number) {
            n = Math.ceil(n / 1000);
            const m = Math.floor(n / 60);
            const s = n % 60;
            return (m < 10 ? '0' + m : '' + m) + ':' + (s < 10 ? '0' + s : '' + s);
        }
        const _RECT = {
            right: 0,
            top: 0,
            width: 420,
            height: 238,
        };
        /*let timeStr = '';
		if(this._videoState >= MYSTATE.WAIT_START && this._videoState <= MYSTATE.WAIT_END) {
			timeStr = _toStr(Math.floor(this._time) * 1000) + ' / ' + MAX_TIME_STR;
		} else if(this._videoState >= MYSTATE.RECORDED) {
			let duration = this._audio.duration / 1000;
			if(duration > MAX_TIME) duration = MAX_TIME;

			if(this._playCnt > 0) {
				let viewTime = this._audio.viewTime / 1000;
				if(viewTime > MAX_TIME) viewTime = MAX_TIME;

				timeStr = _toStr(Math.floor(viewTime) * 1000) + ' / ' + _toStr(Math.floor(duration) * 1000);
			} else timeStr = _toStr(Math.floor(duration) * 1000);
		}*/

		const videoStyle: React.CSSProperties = {
			position: 'absolute',
			// opacity: (this._videoState !== MYSTATE.READY ? 1 : 0),
			opacity: 1,
			right: _RECT.right,
			top: _RECT.top,
			width: _RECT.width,
			height: _RECT.height,
			objectFit: 'fill',       
            overflow: 'hidden',
            borderRadius: '6px 6px 0 0',
            zIndex: 40
		};

        return (
            <CoverPopup className={`result_popup ${this.recordState}`} view={this.m_view} onClosed={this._onBack.bind(this,from,studentId)}>
                <MALiveHeader
                    view={this.m_view}
                    thumb={thumb}
                    showhide={showhide}
                    studentName={studentName}
                    livePoint={livePoint}
                    gender={gender}
                    contentType={contentType}
                    contentName={contentName}
                />
                {!images ? 
                <div className={`result_cnt ${contentType}`}>
                    <div className="img_wrap no_image">
                        <img className="submitimg" src={`${_math_lib_}images/img_send_error.png`} />
                    </div>
                </div>: undefined}
                {images && images?.length > 0 ? 
                    images.map((item,index) => {
                        return(
                            <div key={'q_' + index} className={`result_cnt ${contentType}`}>
                                <div className="wrap_bg">
                                    <div className="img_wrap" ref={this._refImageBox}>
                                        <>
                                            {this.recordState === 'video' ?
                                                <Draggable onStart={(e, data) => this.dragStart(data, 0)} onStop={(e, data) => this.dragStop(data, 0)}>
                                                    <div className="video-wrapper" ref={this._refBox}>
                                                        <div className="video">
                                                            <video 
                                                                controls={false} 
                                                                style={videoStyle} 
                                                                autoPlay={false} 
                                                                ref={this._refVideo} 
                                                            />
                                                        </div>
                                                        <div className="btn-box video">
                                                            <div className="center-box">
                                                                <div className="audio_box_container">
                                                                    <div className="audio_box" onClick={this.barTimeCheck} onTouchEnd={this.barTimeCheck}>
                                                                        <ControlBox
                                                                            player={this._video}
                                                                            disable={false}
                                                                            isPlay={this._isPlay}
                                                                            complete={this.playEnd}
                                                                            togglePlay={this._onPlayStop}
                                                                            toggleFullscreen={this._toggleFullscreen}
                                                                            stopClick={this._stopClick}
                                                                            toggleMute={this._toggleMute}
                                                                            playType={'video'}
                                                                            // barDrag={this.recordType !== 'lyrics_lab}
                                                                            barDrag={true}
                                                                            isFull={this.isFull}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <span className="time-box" hidden={this._videoState <= MYSTATE.READY}>
                                                                <img 
                                                                    draggable={false} 
                                                                    hidden={this._videoState < MYSTATE.WAIT_START || this._videoState > MYSTATE.WAIT_END} 
                                                                    src={_project_ + 'common/icon_recording.png'}
                                                                />
                                                            </span>
                                                        </div>
                                                    </div>
                                                </Draggable>
                                            : undefined}
                                            {this.recordState === 'audio' ?
                                                <>
                                                    <div className="audio">
                                                        <audio controls={false} autoPlay={false} ref={this._refAudio}/>
                                                    </div>
                                                    <div className="btn-box audio">
                                                        <div className="center-box">
                                                            <div className="audio_box_container">
                                                                <div className="audio_box" onClick={this.barTimeCheck} onTouchEnd={this.barTimeCheck}>  
                                                                    <ControlBox
                                                                        player={this._audio}
                                                                        disable={false}
                                                                        isPlay={this._isPlay}
                                                                        complete={this.playEnd}
                                                                        togglePlay={this._onPlayStop}
                                                                        stopClick={this._stopClick}
                                                                        toggleFullscreen={this._toggleFullscreen}
                                                                        // barDrag={this.recordType !== 'lyrics_lab}
                                                                        barDrag={true}
                                                                        playType={'audio'}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <span className="time-box" hidden={this._videoState <= MYSTATE.READY}>
                                                            <img 
                                                                draggable={false} 
                                                                hidden={this._videoState < MYSTATE.WAIT_START || this._videoState > MYSTATE.WAIT_END} 
                                                                src={_project_ + 'common/icon_recording.png'}
                                                            />
                                                        </span>
                                                    </div>
                                                </>
                                            : undefined}
                                            {this.recordState !== '' ?
                                                <img
                                                    className={this.recordState === 'video' ? 'submitimg video' : 'submitimg audio'}
                                                    src={item.substr(0,8) === 'content/' ? `/${item}` : item}
                                                />
                                            :
                                                <img className="submitimg" src={item.substr(0,8) === 'content/' ? `/${item}` : item} />
                                            }
                                        </>
                                    </div>        
                                </div>
                                {/* Lyrics Lab PlayList */}
                                { this.recordState === '' ? 
                                <div className={this.playlistOpen ? 'playlist open' : 'playlist'} style={{display: contentType === 'type04' ? 'block' : 'none'}}>
                                    <div className="inner">
                                        <ul>
                                            {this.presenterBeat}
                                        </ul>
                                    </div>
                                    <button className="btn_next" onClick={this._playlistOpen} />
                                </div> : undefined
                                }
                            </div>
                        );
                    }) : undefined
                }
                <div className="control_page" style={{display: from === 'list' ? '' : 'none'}}>
                    <button className="btn_left" onClick={this._onPrev} />
                    <button className="btn_menu" onClick={this._onBack.bind(this,from,studentId)} />
                    <button className="btn_right" onClick={this._onNext} />
                </div>
                <div className={this.recordState === 'audio' ? 'btn_container audio' : 'btn_container'} style={{display: from === 'presenter' ? '' : 'none'}}>
                {/* <div className="btn_container" style={{display: from === 'presenter' ? '' : 'none'}}> */}
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
            if(this.students.length === this.userCnt) break;
        }
    }
    private _onPick = () => {
        if(!this.props.view) return;
        App.pub_pick_presenter();
        this._onSuffle();

        this._step = 'choose';
        this.randomThumb0 = this.studentsThumb[0]
        this.randomName = this.studentsName[0]
        this._randomStart();
    }
    private _randomStart = () => {
        if(!this.props.view) return; 
        if(this.randomTime) return; // 랜덤 진행중이므로 리턴
        App.pub_pick_presenter();
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
                        <button className="btn_02" onClick={this._randomStart}>Again</button>
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
    thumeType: 'audio' | 'video' | 'image';
    hidePresenter: () => void;
    onSendLiveget: (studentId: string)  => void;
    onSendPresenter: (studentId: string) => void;
    isReset: boolean;
    isAllFlip: boolean;
    quizIdx: number;
    onNext: (studentId: string) => void;
    onPrev: (studentId: string) => void;
    contentType: string;
}
@observer
export class SubmitList extends React.Component<ISubmitList> {
    @observable private _viewPresenter: boolean = false;
    @observable private isFlip: boolean[] = [];
    @observable private _viewDetail: boolean = false;
    @observable private _from: 'presenter'|'list' = 'list';
    @observable private _studentId: string = '';
    private thumeType = this.props.thumeType;
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
            // retry 버튼 눌러서 리셋 시킬 경우 
            if(this.isFlip.length > 0) {
                // console.log('초기화')
                for(let i = 0; i < this.isFlip.length; i++) {
                    this.isFlip[i] = false;
                }
            }
            this.isFinished = false;
        }
        if(this.isFlip.length <= 0) {
            for(let i = 0; i < next.submitStudent[0].length; i++) {
                this.isFlip.push(false);
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
        
    }
    public render() {
        const {type, submitStudent, showhide, contentType} = this.props;
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

        let contentName: string;
        if(contentType === 'type01') {
            contentName = 'Math Journal';
        } else if(contentType === 'type02') {
            contentName = 'Role Play';
        } else if(contentType === 'type03') {
            contentName = 'Concept Board';
        } else if(contentType === 'type04') {
            contentName = 'Lyrics Lab';
        } else if(contentType === 'type05') {
            contentName = 'Let Me Explain';
        } else if(contentType === 'pink' || contentType === 'orange' || contentType === 'blue' || contentType === 'green' || contentType === 'purple') {
            contentName = 'STEAM PORTFOLIO';
        } else {
            contentName = '';
        }

        return (
        <>
        <div className={'content ' + (className)}>
            <div className="thumbset">
                {
                    /* 첫번째  문제에 대한 결과값을  대표 썸네일로 하기때문에 submitStudent[0] 으로 지정*/
                    (tmpSubmitStudents && tmpSubmitStudents[0]).map((item,index) => {
                        if(item.trycnt > 0) {
                            // 제출 한 경우 
                            const name = item.student.displayMode === '2' && item.student.nickname ? item.student.nickname : item.student.name;
                            const image = item.student.displayMode === '2' ? item.student.avatar : item.student.thumb;

                            return(
                                <div key={'q_' + index} className={'thumb_cnt ' + (this.isFlip[index] ? '' : 'user')} onClick={this._onClick.bind(this,index,item.student.id)}>
                                    <div className="front">
                                        {image === '' && <div className={item.student.gender === 'F' ? 'defaultImg_f' : 'defaultImg_m'}><div>{name.substring(0,2).toUpperCase()}</div></div>}
                                        {image !== '' && <img src={image} style={{display: showhide === 'show' ? '' : 'none'}}/>}                             
                                        <img src={`${_math_lib_}images/penimage.png`} style={{display: showhide === 'hide' ? '' : 'none'}}/>                                     
                                        <div className="name" style={{display: showhide === 'show' ? '' : 'none'}}>
                                        {name}
                                        </div>
                                    </div>
                                    <div className="back">
                                        {item.playTime ? <p className="play_time">{item.playTime}</p> : undefined}
                                        {/* <img src={item.images ? item.images[0] : ''} />*/}
                                        <div className={`thumb_img ${contentType} ${!contentType ? 'noheader' : ''} ${item.videos.length > 0 && item.videos[0] ? 'video' : ''}`}>
                                            <div className="header">{contentName}</div>
                                            {item.videos.length > 0 && item.videos[0] ? <video src={item.videos[0]} /> : <img src={item.images && item.images.length > 0 ? item.images[0].substr(0,8) === 'content/' ? `/${item.images[0]}` : item.images[0] : `${_math_lib_}images/img_send_error.png`} />}
                                        </div>
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
            contentType={contentType}
            contentName={contentName}
        />
        </>
        );
    }
}
interface ISendnShare {
    view: boolean;
    type: 'audio' | 'video' | 'image'; 
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
    contentType?: string | undefined;
}

@observer
export class SendnShare extends React.Component<ISendnShare> {
    @observable private _type: 'show'|'hide'|'' = 'show';
    @observable private _step: 'selection'|'list' = 'selection';
    @observable private _listType: '2'|'3'|'4' = '3';
    @observable private _submitusers: ISubmitStudent[][] = [];
    @observable private _viewPresenter: boolean = false;
    @observable private isAllFlip: boolean = false;
    private _thumeType: 'audio' | 'video' | 'image' = this.props.type;

    constructor(props: ISendnShare) {
        super(props);    
    }
    private _showPresenter = () => {
        if(!this.props.view) return;
        if(!this.isAllFlip) return;// 전부 제출 한 경우에만 볼수 있게 하기 위해 
        /* 211201 최순철 모든 템플릿 상황을 고려하기 어려워 강제적으로 STYLE 추가 및 삭제 */
        document.querySelector('#wrap > .content-container')?.setAttribute('style', 'z-index: 1000;');

        const sendshare = document.querySelector('#wrap .t_sendshare .contents.r3');
        if(sendshare) sendshare.scrollTop = 0;

        const btn_heart = document.querySelectorAll('.btn_heart');
        btn_heart.forEach((heart, idx) => {
            heart.setAttribute('style', 'display: none; z-index: 0');
        })
        App.pub_quizDone();
        this._viewPresenter = true;
    }
    private _hidePresenter = () => {
        document.querySelector('#wrap > .content-container')?.removeAttribute('style');
        // document.querySelector('.btn_heart')?.removeAttribute('style');
        const btn_heart = document.querySelectorAll('.btn_heart');
        btn_heart.forEach((heart, idx) => {
            heart.removeAttribute('style');;
        })
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
        // console.log('studentid',studentid,'livepoint',livepoint);
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
        /*if(!next.view && this.props.view) {
            if(!App.isDvlp) {
                for(let i = 0; i < this.props.submitStudent[this.props.quizIdx].length; i++) {
                    let request: ILivePointRequest = {
                        addOnHost: App.addOnHost,
                        liveType: 'green',
                        plusMinusType: 'plus',
                        score: this.props.submitStudent[this.props.quizIdx][i].livePoint,
                        userIdx: this.props.submitStudent[this.props.quizIdx][i].student.id,
                        clsIdx: this.props.clsIdx,
                        depthItemIdx: this.props.curriculumid,
                        callback: (v: ILivePointResponse) => {
                            this._callBackFnc(request.userIdx,request.score);
                        },
                        error: (e: Error) => {
                            console.log('Request Error ! Check the params');
                        }
                    };
                    setLivePoint(request);
                    console.log('Live Point 전송',this.props.submitStudent[this.props.quizIdx][i].livePoint)
    
                }
            }
        }// Live Point 가 초기화 되기 전에 서버로 Live Point 전송 */
    }
    public componentDidUpdate(prev: ISendnShare) {
        if(this.props.view && !prev.view) {
            this._listType = '3';
            this._viewPresenter = false;
            this.isAllFlip = false;
            if(!this.props.isPlayed)this._step = 'selection'; // 한번도 플레이 된적 없을때만 

        } 
        if(this.props.isComplete && !prev.isComplete) {
            // 모두 제출 완료 했을 경우
            // 제출한 학생 카드를 플립 시키는 코드 넣으 세여 
            this.isAllFlip = true;

        }
    }
    public render() {
        const {view, contentType} = this.props;
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
                    thumeType={this._thumeType}
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
                    contentType={contentType ? contentType : ''}
                />
			</div>
        );
    }
}
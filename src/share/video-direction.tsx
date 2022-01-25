import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { observable, action } from 'mobx';
import { observer } from 'mobx-react';
import * as _ from 'lodash';
import * as kutil from '@common/util/kutil';
import * as felsocket from '../felsocket';

interface IVideoDirection {
	className: string;
	view: boolean;
	on: boolean;
	isTeacher: boolean;
	lesson: CurriculumType;
	bookId: number;
	poster_url?: string;
	video_url: string;
	video_frame: number;
	onEnd?: () => void;
	onEndStart?: () => void;
	category?: string;
	title?: string;	
	subtitle: string;
	offMathKit?: boolean;
	audio_url?: string;
}
interface IBookInfo {
	id: number; 
	bookName: string;
	lesson: string;
	subtitle: string;
}
@observer
class VideoDirection extends React.Component<IVideoDirection> {
	@observable private m_on = false;
	private m_showMathKit = false;
	private bookInfo: IBookInfo[] = [];
	private curIndex: number = 0;
	@observable private _list: CurriculumType[] = [];
	constructor(props: IVideoDirection) {
		super(props);
		this.m_on = props.view && props.on;
	
	}
	private _onClick = () => {
		if(this.props.isTeacher) this._off();
	}
	@action private _off = async () => {
		if(this.props.view && this.m_on) {
			this.m_on = false;

			if(this.props.onEndStart) this.props.onEndStart();
			await kutil.wait(500);

			if(this.props.view && !this.m_on) {
				if(this.props.onEnd) this.props.onEnd();
			}

		}
	}
	private async _on() {
		this.m_on = true;
	}
	public componentWillReceiveProps(next: IVideoDirection) {
		if(next.lesson && this.props.lesson !== next.lesson || this.props.view !== next.view) {
			while(this.bookInfo.length > 0) this.bookInfo.pop();
			if(next.lesson && next.lesson.childrenList && next.lesson.childrenList.length > 0) {
				next.lesson.childrenList.map((item,idx) => {
					try {
						if(item.book) {
							if(item.book.id === next.bookId) {
								this.curIndex = this.bookInfo.length;
							}

							let subtitle = item.depth_name ? item.depth_name : '';
							subtitle = subtitle.replace(/\&lt;/g, "<");
							subtitle = subtitle.replace(/\&gt;/g, ">");

							this.bookInfo.push({
								bookName: item.name ? item.name : '',
								id: item.id,
								lesson: next.lesson ? next.lesson.name : '',
								subtitle,
							});
						}
					} catch(e) {
						alert('A ee  ' + JSON.stringify(e));
					}
				});
			}
		}
	}
	public componentDidUpdate(prev: IVideoDirection) {
		if(this.props.view) {
			if(!prev.view) {
				if(this.props.on)  {
					this._on();
				
				} else {
					this.m_on = false;
				} 
				
			} else if(this.props.on && !prev.on) {
				this._on();
			} else if (!this.props.on && prev.on) {
				this._off();
			}
		
			// if(this.m_showMathKit) {
			// 	this.m_showMathKit = false;
			// 	if(this.props.isTeacher) felsocket.showTMathKit(this.m_showMathKit);
			// 	else felsocket.showSMathKit(this.m_showMathKit);
			// }
		} else {
			this.m_on = false;
			// if(!this.props.offMathKit && !this.m_showMathKit) {
			// 	this.m_showMathKit = true;
			// 	if(this.props.isTeacher) felsocket.showTMathKit(this.m_showMathKit);
			// 	else felsocket.showSMathKit(this.m_showMathKit);
			// }
		}
	}

	public render() {
		const {isTeacher,subtitle} = this.props;
		const arr: string[] = [];
		// console.log("bookInfo",this.bookInfo,"CURiDX",this.curIndex)
		arr.push(this.props.className);
		const bgm: HTMLAudioElement | null = document.querySelector('.bgm');
		if(this.props.view) {
			if(this.m_on) arr.push('on');
			if(bgm) bgm.play();
		} else {
			arr.push('hide');
			if(bgm) {
				bgm.pause();
				bgm.currentTime = 0;
			}
		}

		return (
			<div className={arr.join(' ')} onClick={this._onClick}>
				{isTeacher && this.bookInfo && <span className="concept_name">{this.bookInfo.length > 0 ? this.bookInfo[this.curIndex].lesson : ''}</span>}
				<div className="progress_dot">
						{
							isTeacher && this.bookInfo && this.bookInfo.map((item,index) => {
								return (
									<span key={'q_' + index} className={this.curIndex === index ? 'on' : ''}/>
								);
							})
						}
				</div>
				<div className="video">
					<video muted autoPlay={true} poster={this.props.poster_url ? this.props.poster_url : undefined}>
						<source src={this.props.video_url} type="video/mp4" />
						<strong>Your browser does not support the video tag.</strong>
					</video>
				</div>
				<div className="text">
					<div className="t1">{this.bookInfo && this.bookInfo.length > 0 ? this.bookInfo[this.curIndex].bookName : ''}</div>
					{isTeacher && <div className="t2" dangerouslySetInnerHTML={{__html: this.bookInfo && this.bookInfo.length > 0 ? this.bookInfo[this.curIndex].subtitle : ''}}/>}
					{!isTeacher && <div className="t2" dangerouslySetInnerHTML={{__html: subtitle.length === 0 && this.bookInfo[this.curIndex] ? this.bookInfo[this.curIndex].subtitle : subtitle}}/>}
				</div>
				<audio className="bgm" autoPlay={true} src={this.props.audio_url ? this.props.audio_url : undefined} />
			</div>
		);
	}
}

export default VideoDirection;
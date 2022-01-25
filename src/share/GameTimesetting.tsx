import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Observer, observer } from 'mobx-react';
import { observable } from 'mobx';
import * as _ from 'lodash';
import './GameTimesetting.scss';
import { App } from '../App';
interface IGameTimeSetting {
	view: boolean;
	timeSec: number;
	onStart: (timeSec: number) => void;
}

@observer
class GameTimeSetting extends React.Component<IGameTimeSetting> {
	@observable private timeSec = 0;

	constructor(props: IGameTimeSetting) {
		super(props);
	}
	public componentDidMount() {
	}
	public componentWillUnmount() {
		//
	}
	public componentDidUpdate(prev: IGameTimeSetting) {
		if(this.props.view && !prev.view) {
			this.timeSec = this.props.timeSec;
			// console.log("GameTimeSetting", this.timeSec);
		} else if(!this.props.view && prev.view) {
			//
		}

		// if(this.props.view) this.props.onSetNavi();
	}

	private _onSendStart = async () => {
		if(!this.props.view) return;
		// else if(this._prog !== SENDPROG.READY) return;

		// this.props.onStart();

		// this._prog = SENDPROG.SENDING;
		// App.pub_playToPad();

		// const msg: common.IMemoryGameMsg = {msgtype: 'memorygame_send', idx: this._curIdx, seconds: this.timeSec};
		// felsocket.sendPAD($SocketType.MSGTOPAD, msg);

		// this.props.state.process = "START";

		// App.pub_reloadStudents(async () => {
		// 	if(!this.props.view) return;
		// 	else if(this._prog !== SENDPROG.SENDING) return;

		// 	await kutil.wait(600);
		// 	if(!this.props.view) return;
		// 	else if(this._prog !== SENDPROG.SENDING) return;
		// 	this._prog = SENDPROG.SENDED;
		// });
	}

	private onStart = () => {
		App.pub_game_timesetting_start();// 소리 나오게 추가 2021-06-24 by 김성준 
		// this.props.state.prog = "card";
		// this._onSendStart();
		this.props.onStart(this.timeSec);

	}
	private onPlusTime = () => {
		App.pub_playBtnTab();
		this.timeSec = this.timeSec + 5;
		if(this.timeSec > 600) {
			this.timeSec = 600;
		}
	}
	private onMinusTime = () => {
		App.pub_playBtnTab();
		this.timeSec = this.timeSec - 5;
		if(this.timeSec < 5) {
			this.timeSec = 5;
		}
	}

	public render() {
		const {view} = this.props;
		return (
		<div className="t_timesetting" style={{display: view ? undefined : 'none'}}>
			{App.isDvlp ? <button className="btn_menu" /> : undefined}
			{/* <div className="student_count">3</div>  */}
			
			<div className="tit">Time Setting</div>
			<div className="settingTimer">
				<span className="num">{this.timeSec}</span>
				<button className="btn_minus" onClick={this.onMinusTime} />
				<button className="btn_plus" onClick={this.onPlusTime} />
			</div>
			<button className="btn_start" onClick={this.onStart.bind(this)} />
			{/* <div className="btn_stop_wrap">
				<span>Go!</span>
				<button className="btn_stop"></button>
			</div> */}
		</div>
		);
	}
}

export default GameTimeSetting;



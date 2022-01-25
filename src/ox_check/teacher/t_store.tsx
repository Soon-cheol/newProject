import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as _ from 'lodash';
import { observable, action } from 'mobx';
import { App, IMain } from '../../App';
import * as felsocket from '../../felsocket';
import { TeacherContextBase, VIEWDIV, IStateBase, IActionsBase } from '../../share/tcontext';
import * as common from '../common';

const enum SENDPROG {
	READY,
	SENDING,
	SENDED,
	STOPED,
	COMPLETE,
}

interface IStateCtx extends IStateBase {
	prog: common.MYPROG;
	quizResult: common.ICheckResult[][];
}

interface IActionsCtx extends IActionsBase {
	getData: () => common.IData;
	getCurriculum: () => CurriculumType;
	gotoDirection: () => void;
	gotoNextBook: () => void;
	setQuizResultFnc: (fnc: ((msg: common.ICheckResultMsg) => void)|null) => void;
}

class TeacherContext extends TeacherContextBase {
	@observable public state!: IStateCtx;
	public actions!: IActionsCtx;

	private _data!: common.IData;
	private _curriculum!: CurriculumType;

	private _quizResultFnc: ((msg: common.ICheckResultMsg) => void)|null = null;

	constructor() {
		super();
		this.state.prog = 'check';
		this.state.quizResult = [];
		this.actions.getData = () => this._data;
		this.actions.getCurriculum = () => this._curriculum;
		this.actions.gotoDirection = () => this._setViewDiv('direction');
		this.actions.gotoNextBook = () => {
			felsocket.sendLauncher($SocketType.GOTO_NEXT_BOOK, null);
		};
		this.actions.setQuizResultFnc = (fnc: ((msg: common.ICheckResultMsg) => void)|null) => {
			this._quizResultFnc = fnc;
		};
	}

	@action protected _setViewDiv(viewDiv: VIEWDIV) {
		// console.log('viewDiv', viewDiv, this.state.prog);
		super._setViewDiv(viewDiv);
	}
	public receive(data: ISocketData) {
		super.receive(data);
		// console.log('receive data', data);
		if(data.type === $SocketType.MSGTOTEACHER && data.data) {
			const msg = data.data as common.IMsg;
			if(msg.msgtype === 'check_result') {
				const qmsg = msg as common.ICheckResultMsg;
				const result: common.ICheckResult = JSON.parse(qmsg.result);
				
				let resultIdx = _.findIndex(this.state.quizResult[qmsg.idx], {studentid: result.studentid});
				if(resultIdx > -1) this.state.quizResult[qmsg.idx][resultIdx] = result;
				else this.state.quizResult[qmsg.idx].push(result);
				
				if(this._quizResultFnc) this._quizResultFnc(qmsg);
			}
		}
	}
	public setData(data: any) {
		this._data = data as common.IData;
		for(let i: number = 0; i < this._data.quizs.length; i++) {
			this.state.quizResult[i] = [];
		}
	}
	public notifyNaviInfo(curriculum: CurriculumType, bookid: number, classid: number, unitid: number, lessonid: number, curritype: string) {
		// console.log('notifyNaviInfo curriculum', curriculum, bookid, classid);
		this._curriculum = curriculum;
		this.state.bookid = bookid;
		this.state.classid = classid;
	}
}


const tContext = new TeacherContext();
const  { Provider: TProvider, Consumer: TeacherConsumer } = React.createContext( tContext );
class TeacherProvider extends React.Component<{}> {
	public render() {
		return (
			<TProvider value={tContext}>
				{this.props.children}
			</TProvider>
		);
	}
}

function useTeacher(WrappedComponent: any) {
	return function UseAnother(props: any) {
		return (
			<TeacherConsumer>{(store: TeacherContext) => (
					<WrappedComponent
						{...store}
					/>
			)}</TeacherConsumer>
		);
	};
}

export {
	TeacherContext,
	TeacherProvider,
	TeacherConsumer,
	tContext,
	useTeacher,
	IStateCtx,
	IActionsCtx,
	SENDPROG
};
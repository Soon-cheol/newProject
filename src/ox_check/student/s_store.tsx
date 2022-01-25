import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as _ from 'lodash';
import { observable, action } from 'mobx';
import { App, IMain } from '../../App';
import * as felsocket from '../../felsocket';
import { StudentContextBase, IActionsBase, IStateBase, VIEWDIV } from '../../share/scontext';

import * as common from '../common';

const enum SENDPROG {
	MOUNT,
	READY,
	SENDING,
	SENDED,
	COMPLETE,
}
interface IStateCtx extends IStateBase {
	prog: common.MYPROG;
	checkProg: SENDPROG;
}
interface IActionsCtx extends IActionsBase {
	getData: () => common.IData;
	getCurriculum: () => CurriculumType;
}

class StudentContext extends StudentContextBase {
	@observable public state!: IStateCtx;
	public actions!: IActionsCtx;

	private _data!: common.IData;
	private _curriculum!: CurriculumType;
	constructor() {
		super();
		this.state.prog = '';
		this.state.checkProg = SENDPROG.MOUNT;
		this.actions.getData = () => this._data;
		this.actions.getCurriculum = () => this._curriculum;
	}

	@action protected _setViewDiv(viewDiv: VIEWDIV) {
		const state = this.state;
		super._setViewDiv(viewDiv);
	}
	@action public receive(data: ISocketData) {
		super.receive(data);
		// console.log('===> receive', data);
		if(data.type === $SocketType.MSGTOPAD && data.data) {
			const msg = data.data as common.IMsg;
			if (msg.msgtype === 'check_send') {
				this._setViewDiv('content');
				this.state.prog = 'check';
				this.state.checkProg = SENDPROG.READY;
			} else if (msg.msgtype === 'check_end') {
				if(this.state.prog !== 'check') return;
				this.state.checkProg = SENDPROG.COMPLETE;
			}
		}
	}
	public uploaded = (url: string) => {
		//
	}
	@action public notify = (type: string) => {
		//
	}
	@action public notifyRecorded = (url: string) => {
		//
	}

	public setData(data: any) {
		this._data = data as common.IData;
	}
}

const sContext = new StudentContext();
const  { Provider: SProvider, Consumer: StudentConsumer } = React.createContext( sContext );
class StudentProvider extends React.Component<{}> {
	public render() {
		return (
			<SProvider value={sContext}>
				{this.props.children}
			</SProvider>
		);
	}
}
function useStudent(WrappedComponent: any) {
	return function UseAnother(props: any) {
		return (
			<StudentConsumer>{(store: StudentContext) => (
					<WrappedComponent
						{...store}
					/>
			)}</StudentConsumer>
		);
	};
}

export {
	sContext,
	StudentProvider,
	StudentConsumer,
	StudentContext,
	useStudent,
	IStateCtx,
	IActionsCtx,
	SENDPROG
};
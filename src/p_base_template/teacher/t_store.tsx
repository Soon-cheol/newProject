import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as _ from 'lodash';
import { observable, action } from 'mobx';
import { App, IMain } from '../../App';
import * as felsocket from '../../felsocket';
import { TeacherContextBase, VIEWDIV, IStateBase, IActionsBase } from '../../share/tcontext';

interface IStateCtx extends IStateBase {

}
interface IActionsCtx extends IActionsBase {

}

class TeacherContext extends TeacherContextBase {
	@observable public state!: IStateCtx;
	public actions!: IActionsCtx;

	constructor() {
		super();
	}
	
	@action protected _setViewDiv(viewDiv: VIEWDIV) {
		super._setViewDiv(viewDiv);
	}

	public receive(data: ISocketData) {
		super.receive(data);
	}
	public setData(data: any) {
		//
	}
	public notifyNaviInfo(curriculum: CurriculumType, bookid: number, classid: number, unitid: number, lessonid: number, curritype: string) {
		//
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
};
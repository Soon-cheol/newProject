import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { observable, action } from 'mobx';
import { observer, Observer } from 'mobx-react';
import { hot } from 'react-hot-loader';
import * as _ from 'lodash';

import * as felsocket from '../felsocket';
import VideoDirection from '../share/video-direction';
import { SVGBg, SVGEmbed, SVGAni } from '../share/svg_object';
import { Loading } from '../share/loading';
import Attention from '../share/Attention';

import { sContext, StudentProvider, IStateCtx, IActionsCtx, StudentContext, useStudent, } from './student/s_store';

import SCheck from './student/s_check';

import './student.scss';
import '../font.scss';


@observer
class Comp extends React.Component<{state: IStateCtx, actions: IActionsCtx}> {
	public render() {
		const {state, actions} = this.props;
		const viewDiv = state.viewDiv;
		return (
			<>
			<div className="content-container">
				<div className="content-wrapper" style={{left: (viewDiv === 'direction' ? 0 : -1280) + 'px'}}>
					<div><VideoDirection 
						className="video-direction" 
						view={state.viewDiv === 'direction'} 
						on={state.directionON} 
						isTeacher={false}
						lesson={actions.getCurriculum()}
						bookId={state.bookid}
						subtitle={''}
						poster_url={`${_project_}common/bg_direction.jpg`}
						video_url={`${_project_}common/mv_check.mp4`}
						video_frame={125}
					/></div>
					<div>
						<SCheck
							view={viewDiv === 'content' && state.prog === 'check'}
							state={state}
							actions={actions}
							checkProg={state.checkProg}
						/>
						{/* <Loading view={state.loading}/>
						<SVGEmbed 
							className="eyeon_svg" 
							data={`${_math_lib_}images/eyeon_ma.svg`}
							view={state.viewDiv === 'eyeon'}
							bPlay={false}
						/> */}
						<Attention view={state.viewDiv === 'eyeon'} />
					</div>
				</div>
			</div>
			</>
		);
	}
}

const Student = useStudent((store: StudentContext) => (
	<Observer>{() => (
		<Comp 
			state={store.state} 
			actions={store.actions}
		/>
	)}</Observer>
));
export { StudentProvider as AppProvider, sContext as appContext };
export default hot(module)(Student);
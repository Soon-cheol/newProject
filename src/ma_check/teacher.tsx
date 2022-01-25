import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { observable, action } from 'mobx';
import { observer, inject, Observer } from 'mobx-react';
import { hot } from 'react-hot-loader';
import * as _ from 'lodash';
import ReactResizeDetector from 'react-resize-detector';
const SwiperComponent = require('react-id-swiper').default;

import VideoDirection from '../share/video-direction';
import { Navi } from '../share/navi';

import '../font.scss';
import './teacher.scss';

import { TeacherProvider, tContext, IStateCtx, IActionsCtx, useTeacher, TeacherContext } from './teacher/t_store';

import TCheck from './teacher/t_check';

interface ITeacher {
	state: IStateCtx;
	actions: IActionsCtx;
}

@observer
class Comp extends React.Component<ITeacher> {
	public render() {
		const {state, actions} = this.props;
		const viewDiv = state.viewDiv;
		return (
			<>
				<div className="content-container">
					<div className="content-wrapper" style={{left: (viewDiv === 'direction' ? 0 : -1280) + 'px'}}>
						<div><VideoDirection 
							className="video-direction" 
							view={viewDiv === 'direction'} 
							on={state.directionON} 
							isTeacher={true}
							lesson={actions.getCurriculum()}
							bookId={state.bookid}
							subtitle={''}
							poster_url={`${_project_}common/bg_direction.jpg`}
							video_url={`${_project_}common/mv_check.mp4`}
							video_frame={125}
							onEndStart={actions.onDirectionEndStart}
							onEnd={actions.onDirectionEnded}
						>
							<div className="lesson">{''}</div>
						</VideoDirection></div>
						<div>
							<TCheck
								view={viewDiv === 'content' && state.prog === 'check'} 
								state={state}
								actions={actions}
							/>
						</div>
					</div>
				</div>

				<Navi {...state.navi} onLeftClick={actions.naviLeft} onRightClick={actions.naviRight}/>
				
			</>
		);
	}
}

const Teacher = useTeacher((val: TeacherContext) => (
	<Observer>{() => (
		<Comp state={val.state} actions={val.actions}/>
	)}</Observer>
));

export { TeacherProvider as AppProvider, tContext as appContext };
export default hot(module)(Teacher);

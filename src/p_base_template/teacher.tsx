import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { observable, action } from 'mobx';
import { observer, inject, Observer } from 'mobx-react';
import { hot } from 'react-hot-loader';
import * as _ from 'lodash';
import ReactResizeDetector from 'react-resize-detector';
const SwiperComponent = require('react-id-swiper').default;

import '../font.scss';
import './teacher.scss';
import { App, IMain } from '../App';
import * as felsocket from '../felsocket';

import { tContext, TeacherContext, TeacherProvider, TeacherConsumer, useTeacher } from './teacher/t_store';
import { Sample } from './teacher/t_sample';

class Teacher extends React.Component {
	public render() {

		return (
			<>
				<div id="preload_hidden">
					<span>가나다라s</span><span style={{fontWeight: 'bold'}}>가나다라</span>
					<span className="set" /> <span className="unlimit" /> <span className="start" />
					<span className="time1" /><span className="time2" /> <span className="time3" />
				</div>
				<Sample />
			</>
		);
	}
}

export {TeacherProvider as AppProvider, tContext as appContext};
export default hot(module)(Teacher);

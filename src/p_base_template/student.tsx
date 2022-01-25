import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { observable, action } from 'mobx';
import { observer, Observer } from 'mobx-react';
import { hot } from 'react-hot-loader';
import * as _ from 'lodash';

import * as felsocket from '../felsocket';

import { sContext, StudentProvider, StudentConsumer, StudentContext, useStudent, } from './student/s_store';
import { Sample } from './student/s_sample';


import './student.scss';
import '../font.scss';


class Student extends React.Component<{}> {
	public render() {
		return (
			<>
			<div id="preload_hidden">
				<span>가나다라</span><span style={{fontWeight: 'bold'}}>가나다라</span>
			</div>
			<Sample/>
			</>
		);
	}
}
export {StudentProvider as AppProvider, sContext as appContext};
export default hot(module)(Student);
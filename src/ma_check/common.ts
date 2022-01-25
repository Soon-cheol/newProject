import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { observable, action, } from 'mobx';
import { observer } from 'mobx-react';
import * as _ from 'lodash';
import { App } from '../App';

export type MYPROG = ''|'check';

export interface IMsg {
    msgtype: 'check_send'|'check_end'|'check_result';
}

export interface ICheckResult {
    studentid: string;
	contentSeq: number;
	contentType: string;
	answer: string[];
    choicedIdx: number[];
	choicedValue: string[];
    correct: boolean;
    tryCnt: number;
    completed: boolean;
}

export interface ICheckResultMsg extends IMsg {
	idx: number;
	result: string;
}

export interface IQuizMsg extends IMsg {
    quizidx: number;
}

export interface IQuiz {
    seq: number;
    url: string;
    desc: string;
    thumb: string;
    type: string;
    answer: string[];
}

export interface IData {
    quizs: IQuiz[];
}
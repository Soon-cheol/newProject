import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Observer, observer } from 'mobx-react';
import { observable } from 'mobx';
import * as _ from 'lodash';
import { App } from '../App';
import './LookbackStrategy.scss';
import { IStrategyQuizStep, IStrategyQuiz, IStrategyQuizResult, IStrategyStepResult, IStrategyResult } from './ProblemList_Strategy';

export interface ISoulutionHTML {
	leftInnerHTML: string;
	rightInnerHTML: string;
}

export interface ILookbackAnswer {
	type: string;
	data: string;
}

interface ILookbackStrategy {
	view: boolean;
	quiz: IStrategyQuiz;
	title: string;
	solutions: ISoulutionHTML[];
	lookanswers?: ILookbackAnswer[];
	onClose: () => void;
}

@observer
export class LookbackStrategy extends React.Component<ILookbackStrategy> {
	@observable private understand = "";
	@observable private lookback_step1_left = "";
	@observable private lookback_step1_right = "";
	@observable private lookback_step2_left = "";
	@observable private lookback_step2_right = "";
	@observable private lookback_step3_left = "";
	@observable private lookback_step3_right = "";

	constructor(props: ILookbackStrategy) {
		super(props);
	}
	public componentDidMount() {
		this.onShow();
	}
	public componentWillUnmount() {
	}
	public componentDidUpdate(prev: ILookbackStrategy) {
		if(this.props.view && !prev.view) {
			this.lookback_step1_left = '';
			this.lookback_step1_right = '';
			this.lookback_step2_left = '';
			this.lookback_step2_right = '';
			this.lookback_step3_left = '';
			this.lookback_step3_right = '';
			this.onShow();
		} else if(!this.props.view && prev.view) {
			this.lookback_step1_left = '';
			this.lookback_step1_right = '';
			this.lookback_step2_left = '';
			this.lookback_step2_right = '';
			this.lookback_step3_left = '';
			this.lookback_step3_right = '';
		}
	}
	private onShow = () => {
		const {quiz, title, solutions, lookanswers} = this.props;
		// console.log("LookbackStrategy", quiz, title, solutions);

		let plan = quiz.smTypeReason ? quiz.smTypeReason : "";
		let strategy = quiz.smTypeNm ? quiz.smTypeNm : "";
		let strategyNum = quiz.smTypeValue ? quiz.smTypeValue : "";
		strategy = strategy.replace(strategyNum, "").trim();

		if(quiz.lookback_title) {
			this.understand = "<img src='" + quiz.lookback_title + "' style='max-width: 847px;' />";
		} else {
			let _title = title;
			let re = />/gi;
			_title = _title.replace(re, ">\n");

			let arrayOfLines = _title.match(/[^\r\n]+/g);
			let newValue = "";
			if(arrayOfLines) {
				arrayOfLines.map((line, _) => {
					if(line.indexOf("class=\"title") > 0 || line.indexOf("class=\"problem_explain") > 0 || line.indexOf("class=\"legend") > 0) {
						line = line.replace("class=\"title", "class=\"lookback_title");
						line = line.replace("style=", "_style=");
					}
					// if(line.indexOf("class=\"highlight yellow\"") > 0) {
					// 	line = line.replace("highlight yellow", "highlight yellow start");
					// }
					newValue += line.trim();
					// console.log("line", line);
				});
			}
			// console.log(newValue, arrayOfLines);

			this.understand = newValue;
		}

		const _plan = document.getElementById("plan");
		if(_plan) {
			_plan.innerHTML = plan;
			_plan.innerHTML += "<div class=\"arrow_strategy\">" + strategy + "</div>";
		}

		const answer = document.getElementById("answer_content");
		// console.log('============> lookanswers', lookanswers)
		if(answer) {
			answer.innerHTML = "";
			if(quiz.lookback_answer) {
				answer.innerHTML = "<img src='" + quiz.lookback_answer + "' style='max-width: 847px;' />";
			} else {
				if(lookanswers && lookanswers.length > 0) {
					lookanswers.map((item) => {
						if(item.type === "img") {
							if(item.data.indexOf('data:image') > -1) {
								if(answer.innerHTML !== "")  answer.innerHTML += "<span>,</span>" + '<img src="'+item.data+'"/>';
								else answer.innerHTML += '<img src="'+item.data+'"/>';
							} else {
								if(answer.innerHTML !== "")  answer.innerHTML += "<span>,</span>" + item.data;
								else answer.innerHTML += item.data;
							}
						} else {
							if(answer.innerHTML !== "")  answer.innerHTML += (", " + item.data);
							else answer.innerHTML += (" " + item.data); 
						}
					});
				} else {
					let answers: string[] = [];
					quiz.answers.map((_answer) => {
						if(_answer.matchType === 2)  {
							if(_answer.answers.length > 0) {
								let arr = _answer.answers[0].split(',');
								arr.map((arr_item) => {
									answers.push(arr_item.trim());
								})
							}
						} else {
							_answer.answers.map((item) => {
								answers.push(item);
							});
						}
					});
					answers.map((item) => {
						if(answer.innerHTML !== "")  answer.innerHTML += (", " + item);
						else answer.innerHTML += (" " + item); 
					});
				}
			}
		}

		// console.log('============> solutions', solutions);
		let stepCnt = quiz.step.length;
		if(stepCnt > 0 && quiz.step[0].lookback_stepleft !== "") {
			this.lookback_step1_left = "<img src='" + quiz.step[0].lookback_stepleft + "' style='max-width: 847px;' />";
			if(quiz.step[0].lookback_stepright !== "") this.lookback_step1_right = "<img src='" + quiz.step[0].lookback_stepright + "' style='max-width: 847px;' />";
		} else {
			if(solutions.length > 0 && solutions[0]) {
				this.lookback_step1_left = solutions[0].leftInnerHTML;
				this.lookback_step1_right = solutions[0].rightInnerHTML;
			}
		}
		if(stepCnt > 1 && quiz.step[1].lookback_stepleft !== "") {
			this.lookback_step2_left = "<img src='" + quiz.step[1].lookback_stepleft + "' style='max-width: 847px;' />";
			if(quiz.step[1].lookback_stepright !== "") this.lookback_step2_right = "<img src='" + quiz.step[1].lookback_stepright + "' style='max-width: 847px;' />";
		} else {
			if(solutions.length > 0 && solutions[1]) {
				this.lookback_step2_left = solutions[1].leftInnerHTML;
				this.lookback_step2_right = solutions[1].rightInnerHTML;
			}
		}
		if(stepCnt > 2 && quiz.step[2].lookback_stepleft !== "") {
			this.lookback_step3_left = "<img src='" + quiz.step[2].lookback_stepleft + "' style='max-width: 847px;' />";
			if(quiz.step[1].lookback_stepright !== "") this.lookback_step3_right = "<img src='" + quiz.step[2].lookback_stepright + "' style='max-width: 847px;' />";
		} else {
			if(solutions.length > 2 && solutions[2]) {
				this.lookback_step3_left = solutions[2].leftInnerHTML;
				this.lookback_step3_right = solutions[2].rightInnerHTML;
			}
		}
	}
	onClose = () => {
		if(this.props.onClose) this.props.onClose();
	}
	public render() {
		const {view, quiz} = this.props;
		let stepCnt = quiz.step.length;

		return (
			<div className="lookback" style={{display: view ? "block" : "none"}}>
				<div className="stage">
					<div className="header">
						<span className="logo"></span>
						<button className="btn_close" onClick={this.onClose}></button>
					</div>
					<div className="content">
						<table>
							<tbody>
							<tr className="step s01">
								<td className="title">
									<span className="img"></span>
									Understand
								</td>
								<td className={"cnt" + (quiz.lookback_title !== "" ? " new" : "")}>
									<div id="understand" dangerouslySetInnerHTML={{ __html: this.understand }}></div>								
								</td>
							</tr>
							<tr className="step s02">
								<td className="title">
									<span className="img"></span>
									Plan
								</td>
								<td className="cnt" id="plan">
								</td>
							</tr>
							<tr className="step s03">
								<td className="title">
									<span className="img"></span>
									Do it
								</td>
								<td className="cnt">
									<div className="icon_step" >Step 1</div>
									<div className={"lookback_step" + (stepCnt > 0 && quiz.step[0].lookback_stepleft !== "" ? " new" : "")} id="lookback_step1">
										{/* <iframe srcDoc={'<httml>'+this.lookback_step1_left+'</httml>'} style={{transform: 'scale(0.75)', border: '1px solid red'}}/> */}
										<div className="answer" dangerouslySetInnerHTML={{ __html: this.lookback_step1_left }}></div>
										<div className="solution" dangerouslySetInnerHTML={{ __html: this.lookback_step1_right }}></div>
									</div>
									<div className="icon_step">Step 2</div>
									<div className={"lookback_step" + (stepCnt > 1 && quiz.step[1].lookback_stepleft !== "" ? " new" : "")} id="lookback_step2">
										<div className="answer" dangerouslySetInnerHTML={{ __html: this.lookback_step2_left }}></div>
										<div className="solution" dangerouslySetInnerHTML={{ __html: this.lookback_step2_right }}></div>
									</div>
									<div className="icon_step" style={{display: stepCnt === 3 ? '' : "none"}}>Step 3</div>
									<div className={"lookback_step" + (stepCnt > 2 && quiz.step[2].lookback_stepleft !== "" ? " new" : "")} id="lookback_step3">
										<div className="answer" dangerouslySetInnerHTML={{ __html: this.lookback_step3_left }}></div>
										<div className="solution" dangerouslySetInnerHTML={{ __html: this.lookback_step3_right }}></div>
									</div>
								</td>
							</tr>
							<tr className="step s04">
								<td className="title">
									<span className="img"></span>
									Answer
								</td>
								<td className={"cnt" + (quiz.lookback_answer !== "" ? " new" : "")}>
									<div id="answer_content"></div>
								</td>
							</tr>
							</tbody>
						</table>
					</div>
				</div>
			</div>
		);
	}
}



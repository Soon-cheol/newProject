import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Observer, observer } from 'mobx-react';
import { observable } from 'mobx';
import * as _ from 'lodash';
import { App } from '../App';
import './GameResult.scss';
import { timeStamp } from 'console';

export interface ICommonGameResult {
    studentid: string;
	contentSeq?: number;
	contentType?: string;
    score:number
    correct: number;
    bonus: number;
    tryCnt: number;
    completed: boolean;
    level: string;
    level_bonus: number;
}

interface IGameResult {
	view: boolean;
	onClose: () => void;
	gold: ICommonGameResult[];
	silver: ICommonGameResult[];
	bronze: ICommonGameResult[];
	other: ICommonGameResult[];
}

@observer
class TGameResult extends React.Component<IGameResult> {

	@observable private _prog: SENDPROG = SENDPROG.READY;

	constructor(props: IGameResult) {
		super(props);
	}

	public componentDidMount() {
	}
	public componentWillUnmount() {
	}
	public componentDidUpdate(prev: IGameResult) {
		if(this.props.view && !prev.view) {
			let el = document.getElementsByClassName("confetti")[0] as HTMLElement;
			if(el) {
				var date = new Date();
				var _timestamp = date.getTime();
				const img = "/content/mathalive_lib/images/ani_effect_result_850.gif?" + _timestamp;
				el.style.backgroundImage = "url('"+img+"')";
				// el.style.backgroundRepeat = "no-repeat";
				el.style.display = "";
				setTimeout(() => {
					el.style.display = "none";
				}, 3100);
				// console.log(el, el.style.backgroundImage);
			}

			App.pub_playGameresult();
			
		} else if(!this.props.view && prev.view) {
			let el = document.getElementsByClassName("confetti")[0] as HTMLElement;
			if(el) {
				el.style.display = "";
				// console.log(el, el.style.backgroundImage);
			}
		}
	}

	public render() {
		const {view, onClose, gold, silver, bronze, other} = this.props;
		let highLen = gold.length + silver.length + bronze.length;

		const reverseOther = [...other].reverse();

		return (
			<div className="quizContent" style={{display: view ? undefined : "none"}}>
				<div id="contentWrap" className="contentWrap">
					<div className="result_ranking">						
						<div className="btn_close" onClick={onClose}></div>
						<div className="high_rank_list">
							<div className="scroll">
								{highLen > 0 && <>
								<div className="title">High Ranking</div>
								<ul>
									{ gold.map((item, i) => {
										const score = item.score;
										const student = App.students.find((student, si) => student.id === item.studentid);
										if(student) {
											const name = student.displayMode === '2' && student.nickname ? student.nickname : student.name;
											const image = student.displayMode === '2' ? student.avatar : student.thumb;

											return(
												<li key={"gold"+i} className="gold">
													{image !== '' && <img src={image}/>}
													{image === '' && <div className={student.gender && student.gender === 'F' ? 'defaultImg_f' : 'defaultImg_m'}><div>{name.substring(0,2).toUpperCase()}</div></div>}
													{/* <img src={image}/> */}
													<div className="score">
														{score}
														<span className="heart">{item.score-item.bonus}</span>
                                    					<span className="plus">{item.bonus}</span>
													</div>
													<div className="name">{name}</div>
												</li>);
										} else return null;
									})}
									{ silver.map((item, i) => {
										const score = item.score;
										const student = App.students.find((student, si) => student.id === item.studentid);
										if(student) {
											const name = student.displayMode === '2' && student.nickname ? student.nickname : student.name;
											const image = student.displayMode === '2' ? student.avatar : student.thumb;
											return(
												<li key={"silver"+i} className="silver">
													{image !== '' && <img src={image}/>}
													{image === '' && <div className={student.gender && student.gender === 'F' ? 'defaultImg_f' : 'defaultImg_m'}><div>{name.substring(0,2).toUpperCase()}</div></div>}
													{/* <img src={image}/> */}
													<div className="score">
														{score}
														<span className="heart">{item.score-item.bonus}</span>
                                    					<span className="plus">{item.bonus}</span>
													</div>
													<div className="name">{name}</div>
												</li>);
										} else return null;
									})}
									{ bronze.map((item, i) => {
										const score = item.score;
										const student = App.students.find((student, si) => student.id === item.studentid);
										if(student) {
											const name = student.displayMode === '2' && student.nickname ? student.nickname : student.name;
											const image = student.displayMode === '2' ? student.avatar : student.thumb;
											return(
												<li key={"bronze"+i} className="bronze">
													{image !== '' && <img src={image}/>}
													{image === '' && <div className={student.gender && student.gender === 'F' ? 'defaultImg_f' : 'defaultImg_m'}><div>{name.substring(0,2).toUpperCase()}</div></div>}
													{/* <img src={image}/> */}
													<div className="score">
														{score}
														<span className="heart">{item.score-item.bonus}</span>
                                    					<span className="plus">{item.bonus}</span>
													</div>
													<div className="name">{name}</div>
												</li>);
										} else return null;
									})}
								</ul>
								</>}
								{other.length > 0 && <>
								<div className="title">Result</div>
								<ul>
									{ reverseOther.map((item, i) => {
										const score = item.score;
										const student = App.students.find((student, si) => student.id === item.studentid);
										if(student) {
											const name = student.displayMode === '2' && student.nickname ? student.nickname : student.name;
											const image = student.displayMode === '2' ? student.avatar : student.thumb;
											return(
												<li key={"other"+i}>
													{image !== '' && <img src={image}/>}
													{image === '' && <div className={student.gender && student.gender === 'F' ? 'defaultImg_f' : 'defaultImg_m'}><div>{name.substring(0,2).toUpperCase()}</div></div>}
													{/* <img src={image}/> */}
													<div className="score">
														{score}
														<span className="heart">{item.score-item.bonus}</span>
                                    					<span className="plus">{item.bonus}</span>
													</div>
													<div className="name">{name}</div>
												</li>);
										} else return null;
									})}
								</ul>
								</>}
							</div>
							<div className="confetti"></div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default TGameResult;



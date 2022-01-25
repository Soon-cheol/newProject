import { observable, action } from 'mobx';
import { App, IMain } from '../App';
import * as felsocket from '../felsocket';

export type VIEWDIV = 'direction'|'content';
import { parseDept4Div, parseDept5Div, parseDept5SubDiv } from '../common/component/DivFunc';

export interface IStateBase {
	viewDiv: VIEWDIV;
	directionON: boolean;
	loading: boolean;// loading 화면 
	navi: {
		view: boolean,
		enableLeft: boolean,
		enableRight: boolean,		
	};
	svg_bg: {
		view: boolean,
		bPlay: boolean,
		viewCharactor: boolean,
	};
	retCnt: number;
	numOfStudent: number;
	bookid: number;
	bookkey: number;
	curriculumid: number;
	classid: number; // module
	unitid: number; // topic 
	lessonid: number; // concept 
	conceptLibiary: {
		view: boolean,
		datatype: 'grade'|'domain', 
		resultmode: boolean,
	};
}
export interface IActionsBase {
	onDirectionEndStart: () => void;
	onDirectionEnded: () => void;
	setNaviView: (view: boolean) => void;
	setNavi: (enableLeft: boolean, enableRight: boolean) => void;
	setNaviFnc: (naviLeft: (() => void) | null, naviRight: (() => void) | null) => void;
	naviLeft: () => void;
	naviRight: () => void;

	setRetCnt: (cnt: number) => void;
	setNumOfStudent: (num: number) => void;

	setConcepLibaryView: (view: boolean) => void;
	setConcepLibaryDataType: (datatype: 'grade'|'domain') => void;
	setConcepLibaryResultMode: (resultmode: boolean) => void;
	setLoading: (loading: boolean) => void;
}

export abstract class TeacherContextBase implements IMain {
	private _naviLeftFnc: (() => void)|null = null;
	private _naviRightFnc: (() => void)|null = null;

	@observable public state: IStateBase = {
		viewDiv: 'direction',
		directionON: false,
		navi: {
			view: false,
			enableLeft: false,
			enableRight: false,		
		},
		svg_bg: {
			view: true,
			bPlay: false,
			viewCharactor: true,
		},
		loading: false,
		retCnt: 0,
		numOfStudent: 0,
		bookid: 0,
		bookkey: 0,
		curriculumid: 0,
		classid: 0,
		unitid: 0,
		lessonid: 0,
		conceptLibiary: {
			view: false,
			datatype: 'grade', 
			resultmode: false,
		}
	};

	public actions: IActionsBase = {
		/* Direction animatiton 완료후 호출됨 */
		onDirectionEndStart: () => {
			if(this.state.viewDiv === 'direction') {
				felsocket.sendPAD($SocketType.PAD_END_DIRECTION, null);
			}
		},
		onDirectionEnded: () => {
			if(this.state.viewDiv === 'direction') {
				this._setViewDiv('content');
			}

			App.isStarted = true;
		},

		setNaviView: (view: boolean) => {
			this.state.navi.view = view;
		},
		setNavi: (enableLeft: boolean, enableRight: boolean) => {
			this.state.navi.enableLeft = enableLeft;
			this.state.navi.enableRight = enableRight;	
		},
		setNaviFnc: (naviLeft: (() => void) | null, naviRight: (() => void) | null) => {
			this._naviLeftFnc = naviLeft;
			this._naviRightFnc = naviRight;
		},

		/* Navigation 좌 버튼 클릭시 */
		naviLeft: () => {
			if(this.state.viewDiv === 'direction') {
				felsocket.sendLauncher($SocketType.GOTO_PREV_BOOK, null);
			} else {
				App.pub_playBtnPage();

				if(this._naviLeftFnc) this._naviLeftFnc();
				else this._setViewDiv('direction');
			}
		},
		/* Navigation 우 버튼 클릭시 */
		naviRight: () => {
			if(this.state.viewDiv === 'direction') {
				App.pub_playBtnPage();
				this.state.directionON = false;
			} else {
				App.pub_playBtnPage();
				if(this._naviRightFnc) this._naviRightFnc();
				else felsocket.sendLauncher($SocketType.GOTO_NEXT_BOOK, null);
			}
		},
		setRetCnt: (cnt: number) => {
			if(cnt > this.state.numOfStudent) cnt = this.state.numOfStudent;
			this.state.retCnt = cnt;
		},
		setNumOfStudent: (num: number) => {this.state.numOfStudent = num;},
		setConcepLibaryView: (view: boolean) => {this.state.conceptLibiary.view = view;},
		setConcepLibaryDataType: (datatype: 'grade'|'domain') => { this.state.conceptLibiary.datatype = datatype;},
		setConcepLibaryResultMode: (resultmode: boolean) => {this.state.conceptLibiary.resultmode = resultmode;},
		setLoading: (loading: boolean) => {
			// this.state.loading = loading;
			felsocket.showTLoading(loading);
		}
	};

	@action protected _setViewDiv(viewDiv: VIEWDIV, no_pub_stop?: boolean) {
		if(this.state.viewDiv !== viewDiv) {
			if(!no_pub_stop) App.pub_stop();
			if(viewDiv === 'direction') {
				this.state.directionON = true;
				this.state.svg_bg.bPlay = true;
				this.state.svg_bg.viewCharactor = true;


				felsocket.sendLauncher($SocketType.TOP_TITLE_HIDE, null);
				felsocket.sendPAD($SocketType.PAD_START_DIRECTION, null);
				this.state.navi.view = true;
				this.state.navi.enableLeft = App.prevBook;
				this.state.navi.enableRight = true;
				this._naviLeftFnc = null;
				this._naviRightFnc = null;

				this.state.conceptLibiary.view = false;
				this.state.conceptLibiary.datatype = 'grade';
				this.state.conceptLibiary.resultmode = false;
			} else {
				this.state.directionON = false;
				this.state.svg_bg.bPlay = false;
				this.state.svg_bg.viewCharactor = false;

				felsocket.sendLauncher($SocketType.TOP_TITLE_VIEW, null);
				felsocket.sendPAD($SocketType.PAD_ONSCREEN, null);
			}
			this._naviLeftFnc = null;
			this._naviRightFnc = null;
			this.state.numOfStudent = 0;
			this.state.retCnt = 0;
			this.state.viewDiv = viewDiv;
			// this.setState({viewDiv, directionON, btnView, svg_bg});
		}
	}

	/* ../index.tsx  한 번만 실행 */
	@action public start() {
		if(this.state.viewDiv === 'direction') {
			this.state.directionON = true;
			this.state.navi.view = true;
			this.state.navi.enableLeft = App.prevBook;
			this.state.navi.enableRight = true;

			this.state.svg_bg.bPlay = true;
			felsocket.sendLauncher($SocketType.TOP_TITLE_HIDE, null);
			felsocket.sendPAD($SocketType.PAD_START_DIRECTION, null);
			// console.log('tcontext start App.isStarted', App.isStarted);
		}
		if(App.isDvlp) {
			if(ma_assessment_t || ma_adaptive_learning_t || ma_assessment_review_t) {
				let class_id = 1398;
				if(ma_adaptive_learning_t) {
					class_id = parseInt((window as any).app_o.dlvp_info.curr, 10);
				} else if(ma_assessment_review_t) {
					class_id = 1398;
				}
				
				let curr_id = 23813;
				if(ma_adaptive_learning_t) {
					curr_id = parseInt((window as any).app_o.dlvp_info.curr, 10);
				} else if(ma_assessment_review_t) {
					curr_id = 23832;
				} 
				
				let book_id = 23813;
				if(ma_adaptive_learning_t) {
					book_id = parseInt((window as any).app_o.dlvp_info.curr, 10);
				} else if(ma_assessment_review_t) {
					book_id = 23832;
				}

				let step_id = (k: number) => (book_id + k);
				if(ma_adaptive_learning_t) {
					step_id = (k: number) => (book_id + k);
				} else if(ma_assessment_review_t) {
					step_id = (k: number) => (book_id + k);
				}
				
				let step_depth = () => 'Check Your Skills';
				if(ma_adaptive_learning_t) {
					step_depth = () => 'adaptive_learning';
				} else if(ma_assessment_review_t) {
					step_depth = () => 'Improve Your Skills';
				}
				
				let curriculum: CurriculumType = {
					id: curr_id,
					code: '00010001',
					depth: 2,
					depth_name: 'Module 1',
					info: '',
					div: '',
					subDiv: '',
					name: 'Understand and Compare Fractions',
					thumbnail: '',
					childrenList: [],
					useYn: 'Y',
					cmsLevel: ""
				};
				// depth 3 - topic(unit)
				for(let i = 0; i < 7; i++) {
					let unit_name = 'Understand Fractions with Number line';
					if(i === 1) unit_name = 'Count, Read and Write Numbers 4 – 5';
					else if(i === 2) unit_name = 'Ways to make 5';
					else if(i === 3) unit_name = 'Add and Subtract Decimals and Multiply Decimals and Whole Numbers';
					else if(i === 4) unit_name = '55555';
					else if(i === 5) unit_name = '66666';
					else if(i === 6) unit_name = '77777';

					let unitcode = '00010001000' + (i + 1); 
					let unit: CurriculumType = {
						id: (1000 + i),
						code: unitcode,
						depth: 3,
						depth_name: 'Topic ' + (i + 1) + '.',
						info: '',
						// mag 에 등록 되어 있는 코드관리 값 과 동일
						div: 'M0301',
						subDiv: '',
						name: unit_name,
						thumbnail: '',
						childrenList: [],
						useYn: i === 0 ? 'N' : 'Y',
						cmsLevel: ""
					};
					// depth 4 - lesson
					for(let j = 0; j < 6; j++) {
						let l_div = 'M0401';
						if(j === 1) l_div = 'M0402';

						let lessoncode = unitcode + '000' + (j + 1); 
						let lesson: CurriculumType = {
							id: (1000 + j),
							code: lessoncode,
							depth: 4,
							depth_name: 'CONCEPT ' + (j + 1),
							info: '',
							div: l_div,
							subDiv: '',
							// mag 에 등록 되어 있는 코드관리 값 과 동일
							name: parseDept4Div(l_div),
							thumbnail: '',
							childrenList: [],
							useYn: 'Y',
							cmsLevel: ""
						};
						let step_div = 'M0501';
						let step_name = 'M050101';
						// depth 5 - step
						for(let k = 0; k < 24; k++) {
							// mag 에 등록 되어 있는 코드관리 값 과 동일
							// step_div - 각 스텝들의 타입 (어디에 속할지는 mag에서 정함)
							// step_name - 각 스텝명 (엘리프로 따지는 간지상의 북 이름)
							if(k < 2) step_div = 'M0501';
							else if(k >= 2 && k < 6) step_div = 'M0502';
							else if(k >= 6 && k < 9) step_div = 'M0503';
							else if(k >= 9 && k < 12) step_div = 'M0504';
							else if(k === 12) step_div = 'M0506';
							else if(k === 14) step_div = 'M0509';
							else if(k === 19) step_div = 'M0510';
							if(k < 2) step_name = 'M05010' + (k + 1);
							else if(k >= 2 && k < 6) step_name = 'M05020' + (k - 1);
							else if(k === 6) step_name = 'M050302';
							else if(k > 6 && k < 9) step_name = 'M05030' + (k - 4);
							else if(k === 9) step_name = 'M050401';
							else if(k === 10) step_name = 'M050403';
							else if(k === 11) step_name = 'M050404';
							else if(k === 12) step_name = 'M050601';
							else if(k === 13) step_name = 'M050701';
							else if(k === 14) step_name = 'M050702';
							else if(k === 15) step_name = 'M050801';
							else if(k === 16) step_name = 'M050802';
							else if(k === 17) step_name = 'M050803';
							else if(k === 18) step_name = 'M050804';
							else if(k === 19) step_name = 'M050901';
							else if(k === 20) step_name = 'M050902';
							else if(k === 21) step_name = 'M050903';
							else if(k === 22) step_name = 'M050904';
							else if(k === 23) step_name = 'M050905';
							let stepcode = lessoncode + '000' + (k + 1); 
							let completed_temp: 0|1 = 0; 
							let updatetime_temp = '';
							if(k === 0) {
								completed_temp = 1; 
								updatetime_temp = '2020-09-20 04:42:46';
							} else if(k === 3) {
								completed_temp = 1; 
								updatetime_temp = '2020-09-20 04:42:47';
							}	
							let step: CurriculumType = {
								id: step_id(k), // 북 번호
								code: stepcode,
								cmsCode: '18992,20125,20135,20139',
								depth: 5,
								depth_name: step_depth(), // assessment 는 'Check Your Skills
								info: '',
								div: step_div,
								subDiv: step_name,
								name: parseDept5SubDiv(step_name),
								thumbnail: '',
								childrenList: [],
								book: {
									id: book_id + k,
									path: '',
									viewMode: 2,
									key: k + 1,
									cmsKey: k + 1,
									completed: completed_temp, 
									updatetime: updatetime_temp,
								},
								cmsLevel: ""
							};
							lesson.childrenList.push(step);
						}
						unit.childrenList.push(lesson);
					}
					curriculum.childrenList.push(unit);
				}
				/*
					1번 매개변수 - 받아온 커리큘럼 자체
					2번 매개변수 - 북 ID
					3번 매개변수 - class ID
					4번 매개변수 - 레슨 ID
					5번 배개변수 - 북 ID
				*/

				this.notifyNaviInfo(curriculum, book_id, class_id, 1000, 1000, 'total');
				return;
			}
			let lessondiv = '';
			if(ma_summary_t || ma_check_t || ma_discussion_t) {   
				lessondiv = 'M0401'; // LessonType.CONCEPT // 사용안함
			} else if(ma_reasoning1_t || ma_reasoning2_t || ma_topic_portfolio_t) {  
				lessondiv = 'M0402'; // LessonType.PROBLEM // 사용안함
 			} else if(ma_warmup_quiz_t || ma_warmup_quiz_r_t || ma_hit_mole_t || ma_hidden_picture_t || ma_memory_game_t || ma_mathtalk_t|| 
				ma_learning_objects_t || ma_activity_t || ma_concept_tool_t ||  ma_concept_summary_t ||
				ma_independent_practice_t || ma_independent_practice_r_t || ma_extended_practice_t || ma_extended_practice_r_t || 
				ma_strategy_t || ma_strategy_r_t) {  
				lessondiv = 'M0408'; // LessonType.CONCEPTLEARNING
 			} else if(ma_topic_strategy_t || ma_topic_portfolio_t) {
				lessondiv = 'M0409'; // LessonType.TOPICLEARNING; 
			} else if(ma_module_review_t || ma_module_strategy_t || ma_module_portfolio_t) {
				lessondiv = 'M0410'; // LessonType.MODULELEARNING; 
			} else if(ma_steam_portfolio_t){
				lessondiv = 'M0411'; // LessonType.MODULETEST; 
			}			
			if(lessondiv === '') return;

			let lesson: CurriculumType = {
				id: 1000,
				code: '',
				depth: 4,
				depth_name: parseDept4Div(lessondiv),
				info: '',
				div: lessondiv,
				subDiv: '',
				name: lessondiv === "M0408" ? 'Identify the Number 0, Read and Write 0': "" ,
				thumbnail: '',
				cmsLevel: "",
				childrenList: [],
			};
			let step_div = '';
			let step_subdiv = '';
			let step_name = '';
			let learn_step = 1;
			if(parseDept4Div(lessondiv) === LessonType.CONCEPT) {
				for(let k = 0; k < 3; k++) {
					if(k === 0) {
						step_div = 'M0503';
						step_subdiv = 'M050303';
						step_name = parseDept5SubDiv('M050303'); // summary
					} else if(k === 1) {
						step_div = 'M0503';
						step_subdiv = 'M050304';
						step_name = parseDept5SubDiv('M050304'); // check
					}  else if(k === 2) {
						step_div = 'M0506';
						step_subdiv = 'M050601';
						step_name = parseDept5SubDiv('M050601'); // discuss
					}
					let step: CurriculumType = {
						id: 16815 + k,
						code: '',
						depth: 5,
						depth_name: step_name,
						info: '',
						div: step_div,
						subDiv: step_subdiv,
						name: step_name,
						thumbnail: '',
						cmsLevel: "",
						childrenList: [],
						book: {
							id: 90000 + k,
							path: '/content/' + (5787 + k),
							viewMode: 2,
							key: 5280 + k,
							cmsKey: 5787 + k,
							completed: 0,
							updatetime: '',
						},
					};
					lesson.childrenList.push(step);
				}
			} else if(parseDept4Div(lessondiv) === LessonType.PROBLEM) {
				for(let k = 0; k < 3; k++) {
					if(k === 0) {
						step_div = 'M0505';
						step_subdiv = 'M050504';
						step_name = 'Reasoning (1)'; // ma_reasoning1_t
					} else if(k === 1) {
						step_div = 'M0505';
						step_subdiv = 'M050504';
						step_name = parseDept5SubDiv('M050504'); // ma_reasoning2_t
					} else if(k === 2) {
						step_div = 'M0506';
						step_subdiv = 'M050602';
						step_name = parseDept5SubDiv('M050602'); // ma_reasoning2_t
					}
					let step: CurriculumType = {
						id: 16815 + k,
						code: '',
						depth: 5,
						depth_name: step_name,
						info: '',
						div: step_div,
						subDiv: step_subdiv,
						name: step_name,
						thumbnail: '',
						cmsLevel: "",
						childrenList: [],
						book: {
							id: 80000 + k,
							path: '/content/' + (5787 + k),
							viewMode: 2,
							key: 5280 + k,
							cmsKey: 5787 + k,
							completed: 0,
							updatetime: '',
						},
					};
					lesson.childrenList.push(step);
				}	
			} else if(parseDept4Div(lessondiv) === LessonType.CONCEPTLEARNING) {
				for(let k = 0; k < 12; k++) {
					if(k === 0) {
						step_div = 'M0501';
						step_subdiv = 'M050101';
						step_name = 'WarmUp Quiz';
					} else if(k === 1) {
						step_div = 'M0501';
						step_subdiv = 'M050101';
						step_name = 'I SPY';
					} else if(k === 2) {
						step_div = 'M0501';
						step_subdiv = 'M050101';
						step_name = 'Hit a Mole';
					} else if(k === 3) {
						step_div = 'M0506';
						step_subdiv = 'M050601';
						step_name = 'Memory Game';
					} else if(k === 4) {
						step_div = 'M0506';
						step_subdiv = 'M050601';
						step_name = 'Math Talk';
					} else if(k === 5) {
						step_div = 'M0501';
						step_subdiv = 'M050102';
						step_name = 'Learning Objectives';
					} else if(k === 6) {
						step_div = 'M0502';
						step_subdiv = 'M050202';
						step_name = 'Concept Acivity';
					} else if(k === 7) {
						step_div = 'M0502';
						step_subdiv = 'M050203';
						step_name = 'Concept Tool';
					} else if(k === 8) {
						step_div = 'M0502';
						step_subdiv = 'M050204';
						step_name = 'Concept Summary';
					} else if(k === 9) {
						step_div = 'M0505';
						step_subdiv = 'M050501';
						step_name = 'Independent Practice';
					} else if(k === 10) {
						step_div = 'M0505';
						step_subdiv = 'M050502';
						step_name = 'Extended Practice';
					} else if(k === 11) {
						step_div = 'M0505';
						step_subdiv = 'M050505';
						step_name = 'CL Strategy';
					} 
					let step: CurriculumType = {
						id: 16815 + k,
						code: '',
						depth: 5,
						depth_name: step_name,
						info: '',
						div: step_div,
						subDiv: step_subdiv,
						name: step_name,
						thumbnail: '',
						cmsLevel: "",
						childrenList: [],
						book: {
							id: 10000 + k,
							path: '/content/' + (5787 + k),
							viewMode: 2,
							key: 5280 + k,
							cmsKey: 5787 + k,
							completed: 0,
							updatetime: '',
						},
					};
					lesson.childrenList.push(step);
				}
			} else if (parseDept4Div(lessondiv) === LessonType.TOPICLEARNING) {
				for(let k = 0; k < 1; k++) {
					if(k === 0) {
						step_div = 'M0507';
						step_subdiv = 'M050701';
						step_name = parseDept5SubDiv('M050701'); // topic strategy
					} 
					let step: CurriculumType = {
						id: 16815 + k,
						code: '',
						depth: 5,
						depth_name: step_name,
						info: '',
						div: step_div,
						subDiv: step_subdiv,
						name: step_name,
						thumbnail: '',
						cmsLevel: "",
						childrenList: [],
						book: {
							id: 20000 + k,
							path: '/content/' + (5787 + k),
							viewMode: 2,
							key: 5280 + k,
							cmsKey: 5787 + k,
							completed: 0,
							updatetime: '',
						},
					};
					lesson.childrenList.push(step);
				}
			} else if (parseDept4Div(lessondiv) === LessonType.MODULELEARNING) {
				for(let k = 0; k < 3; k++) {
					if(k === 0) {
						step_div = 'M0508';
						step_subdiv = 'M050801';
						step_name = parseDept5SubDiv('M050801'); // module review
					} else if(k === 1) {
						step_div = 'M0508';
						step_subdiv = 'M050803';
						step_name = parseDept5SubDiv('M050803'); // module portfolio
					} else if(k === 2) {
						step_div = 'M0508';
						step_subdiv = 'M050804';
						step_name = parseDept5SubDiv('M050804'); // module strategy
					} 
					let step: CurriculumType = {
						id: 16815 + k,
						code: '',
						depth: 5,
						depth_name: step_name,
						info: '',
						div: step_div,
						subDiv: step_subdiv,
						name: step_name,
						thumbnail: '',
						cmsLevel: "",
						childrenList: [],
						book: {
							id: 30000 + k,
							path: '/content/' + (5787 + k),
							viewMode: 2,
							key: 5280 + k,
							cmsKey: 5787 + k,
							completed: 0,
							updatetime: '',
						},
					};
					lesson.childrenList.push(step);
				}
			} else if (parseDept4Div(lessondiv) === LessonType.MODULETEST) {
				for(let k = 0; k < 1; k++) {
					if(k === 0) {
						step_div = 'M0509';
						step_subdiv = 'M050905';
						step_name = parseDept5SubDiv('M050905'); // steam portfolio
					} 
					let step: CurriculumType = {
						id: 16815 + k,
						code: '',
						depth: 5,
						depth_name: step_name,
						info: '',
						div: step_div,
						subDiv: step_subdiv,
						name: step_name,
						thumbnail: '',
						cmsLevel: "",
						childrenList: [],
						book: {
							id: 40000 + k,
							path: '/content/' + (5787 + k),
							viewMode: 2,
							key: 5280 + k,
							cmsKey: 5787 + k,
							completed: 0,
							updatetime: '',
						},
					};
					lesson.childrenList.push(step);
				}
			}
			let bookid = 10000;
			if(ma_summary_t) bookid = 90000;
			else if(ma_check_t) bookid = 90001;
			else if(ma_discussion_t) bookid = 90002;
			else if(ma_reasoning1_t) bookid = 80000;
			else if(ma_reasoning2_t) bookid = 80001;
			else if(ma_topic_portfolio_t) bookid = 80002;
			else if(ma_warmup_quiz_t) bookid = 10000;
			else if(ma_warmup_quiz_r_t) bookid = 10000;
			else if(ma_hidden_picture_t) bookid = 10001;
			else if(ma_hit_mole_t) bookid = 10002;
			else if(ma_memory_game_t) bookid = 10003;
			else if(ma_mathtalk_t)bookid = 10004;
			else if(ma_learning_objects_t) bookid = 10005;
			else if(ma_activity_t) bookid = 10006;
			else if(ma_concept_tool_t) bookid = 10007;
			else if(ma_concept_summary_t) bookid = 10008;
			else if(ma_independent_practice_t) bookid = 10009;
			else if(ma_independent_practice_r_t) bookid = 10009;
			else if(ma_extended_practice_t) bookid = 10010;
			else if(ma_extended_practice_r_t) bookid = 10010;
			else if(ma_strategy_t) bookid = 10011;
			else if(ma_strategy_r_t) bookid = 10011;
			else if(ma_topic_strategy_t) bookid = 20000;
			else if(ma_module_review_t) bookid = 30000;
			else if(ma_module_portfolio_t) bookid = 30001;
			else if(ma_module_strategy_t) bookid = 30002;
			else if(ma_steam_portfolio_t) bookid = 40000;
			this.notifyNaviInfo(lesson, bookid, 1);
		} else {
			let curriType = '';
			// total , unit 커리큘럼을 잘라서 가져오는 시점이 total은 module부터, unit은 topic부터 가져옵니다.
			if(ma_adaptive_learning_t) curriType = 'total';
			else if(ma_assessment_review_t) curriType = 'total';
			else if(ma_assessment_t) curriType = 'total';
			felsocket.getNaviInfo(curriType);
		}
	}
	public receive(data: ISocketData) {
		// console.log('Base Receive', data);
		//
	}

	public uploaded(url: string) {
		//
	}
	public multiUploaded(results: any) {
		//
	}
	public notify(type: string) {
		//
	}
	public notifyRecorded(url: string) {
		//
	}
	public notifyVideoRecord(url: string) {
		//
	}
	public abstract setData(data: any): void;

	public notifyNaviInfo(curriculum: CurriculumType, bookid: number, classid: number, unitid?: number, lessonid?: number, curritype?: string) {
		//
	}
	public notifyPenToolState(isVisible: boolean, height: number) {
		//
	}

	public notifyLiveGivePopupClose() {
		// 
	}
	public notifyBookCaptureInfo = (infos: CaptureImageInfo[]) => {
		//
	}

	public clickSendButton = () => {
		//
	}

	public notifyRecordData = (audio: string, data: PenRecordData) => {
		//
	}

	public notifyAlert(isOk: boolean) {
		//
	}

	public notifyHamburgerMenuClicked(isView: boolean) {
		//
	}
	public callThreeminState() {
		//
	}
}
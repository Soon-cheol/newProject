
declare const enum SENDPROG {
	READY,
	SENDING,
	SENDED,
	COMPLETE,
}

declare interface IPREVIEW_MEMBER_AI {
  BK_KEY_INCLASS: number;
  CLS_IDX: number;
  MEM_IDX: number;
  AVG_PERCENT: number;
  STD_TYPE: number;

}
/*
declare interface ILikeSetMsg {
	id: string;
	on: boolean;
}

declare type LikeAniType = 'love'|'happy'|'normal';
declare interface ILikeSendMsg {
	from : string;
	to : string;
	like : number;
	ani : LikeAniType;
}

declare interface IGroupSelectedMsg {
	ga: string
	na: string;
}

declare interface IStarSetMsg {
	id: string;
	on: boolean;
}

declare interface IStarSendMsg {
	from : string;
	to : string;
	star_content : number;
	star_presenter : number;
}
*/

declare const enum $SocketType {
	PAD_ONSCREEN,				// 0
	PAD_START_DIRECTION,		// 1
	PAD_LOCATION,				// 2
	PAD_END_DIRECTION,			// 3
	PAD_INIT_COMPLETE,			// 4

	TOP_TITLE_HIDE,				// 5
	TOP_TITLE_VIEW,				// 6
	TOP_TITLE_SET,				// 7
	GOTO_PREV_BOOK,				// 8
	GOTO_NEXT_BOOK,				// 9

	MSGTOPAD,					// 10
	MSGTOTEACHER,				// 11
	LIKE_SET,					// 12
	LIKE_SEND,					// 13
	GROUPING,					// 14

	GROUP_SELECTED,				// 15

	LIKE_SOUND_ON,				// 16
  	LIKE_SOUND_OFF,				// 17
  
	STAR_SET, // 18
	STAR_SEND, // 19
	PAD_ONSCREEN_FIX, // 20 // 리포트(스텝1) 미제출 학생은 unmount까지 계속 ONSCREEN
	SHOW_GIFTBOX, //21 
}

declare const enum $ReportType {
	DEFAULT = 1,
	TEXT = 2,
	IMAGE = 3,
	AUDIO = 4,
	VIDEO = 5,
	JOIN = 6,
}

declare interface IStudent {
	id: string;
	name: string;
	thumb: string;
	avatar: string;
	nickname: string;
	gender?: string;
	birthday?: string;
	team?: number;
	displayMode?: '1'|'2';      // '1':실사모드 | '2':아바타모드
}

declare interface ISubmitState {
	heart2: number;
	heart1: number;
	heart0: number;
	nosubmit: number;
}

declare interface ISubmitStudent {
	student: IStudent;
	correct: boolean;
	trycnt: number; // 정답 맞춘 회수
	livePoint: number // bonus time + 일반 점수 합친 토탈 점수 
	point?: number // 순수 점수 
	timebonus?: number // 보너스 타임 점수 
	medal?: string;//순위 관련 메달 이름
	bar_color?: string;// 순위바 색깔 관련
	images?: string[];
	videos?: string[];
	audios?: string[];
	penimages?: string[];
	penRecordData?: string[];
	order?:number;// 제출 순서 
	new?: boolean;// 2021 07 29 신규 추가 new 일 경우 Send & Share 에서 제출한 학생카드에 New 이미지가 붙음 
	nosubmit?: boolean; // 20211208 최순철 - 샌드앤쉐어 미제출 여부 위해 추가 
}

declare interface IQcountStudent {
	id: string;
	count: number;
}// 학생이 문제를 몇개 풀었는지 정보를 저장하기 위한 인터페이스

declare interface IReturnStudent {
	students: IStudent;
	images: string[];
	videos:string[];
	forced:boolean;
}
declare interface IResult {
	quizSeq: number;
	correct: boolean;
	tryCnt: number;
	compelete: boolean;
	qnumber: number;
	quizKind: number; // 0 main, 1 쌍둥이 or step1, 2 step2....
	mainSeq?: number;
}

declare interface IQuizResult {
	seq: number;
	thumb: string;
	url: string;
	allusers: number;
	submitusers: number;
	heart2: number;
	heart1: number;
	heart0: number;
	nosubmit: number;
	qnumber?: number;// 퀴즈 조합 번호 
	quizKind?: number;
	difiicult?: number;
	isProgress?: boolean;//현재 진행중인 퀴즈 인지 여부 
}

declare interface ISocketData {
	type: $SocketType;
	data: any;
}

declare interface IMessage<T> {
	msgtype: T;
}

declare interface IForDraw {
	reset: () => void;
	undo: () => void;
	redo: () => void;
	canUndo(): boolean;
	canRedo(): boolean;
}

declare namespace domtoimage{
	function toPng(node:Element, options?: {}):Promise<string>;
	function toSvg(node:Element, options?: {}):Promise<string>;
}
/*
declare type TypeQuizProg = ''|'quiz'|'wait-result'|'result';
declare type TypeGroupProg = ''|'initing'|'inited'|'onquiz'|'complete';

declare type QUIZ_SELECT_TYPE = ''|'all'|'studied'|'ai';
declare type TEAM_SPINDLE_MSG = 'next_quiz'|'start_quiz'|'send_point'|'force_stop'|'end_quiz';
declare type TEAM_GROUPING_MSG = 'grouping'|'pad_gana';
declare type QUIZ_RESULT_MSG = 'quiz_result';

declare interface IMsgGaNa extends IMessage<TEAM_GROUPING_MSG> {
	ga: string;
	na: string;
}

declare interface IMsgQuizIdx extends IMessage<TEAM_SPINDLE_MSG> {
	qidx: number;
	point: number;
}
declare interface IFlipMsg extends IMessage<TEAM_SPINDLE_MSG> {
	idx: number;
}
declare interface IMsgGaNaResult extends IMessage<TEAM_SPINDLE_MSG> {
	ga_point: number;
	na_point: number;
}
declare interface IQuizResultMsg extends IMessage<QUIZ_RESULT_MSG> {
	result: boolean;
	id: string;
	input: string;
	idx: number;
	stime: string;
	etime: string;
}

declare interface IUserResult {
	id: string;
	result: boolean[];
	stimes: string[];
	etimes: string[];
	inputs: string[];
	name: string;
	numOfCorrect: number;
	ga_na?: 'ga'|'na';
	grade?: number;
} 

declare interface IQusetionResult {
	qidx: number;
	numOfCorrect: number;
	name: string;
	preview: number;
}

declare interface IGaNaResult {
	qidx: number;
	point: number;
	ga_correct: number;
	na_correct: number;
	returnUsers: string[];
}


declare interface IQuizGroupResult {
	readonly questions: IGaNaResult[];
	users: IUserResult[];
	ga_point: number;
	na_point: number;
	qtime: number;
}

declare interface IQuizSingleResult {
	readonly questions: IQusetionResult[];
	readonly users: IUserResult[];
	qtime: number;
}

declare interface IQuizPageProps<T> {
	view: boolean;
	on: boolean;
	idx: number;
	isTeacher: boolean;
	isGroup: boolean;
	quizProg: TypeQuizProg;
	hasPreview: boolean;
	percent: number;
	group?: 'A' | 'B';
	quiz: T;
	onItemChange?: (idx: number, input: string) => void;
	onComplete?: (idx: number, correct: boolean) => void;
	onSoundComplete: (idx: number) => void;
}

interface IStudentQuizInfo {
	qidxs: number[];
	points: number[];
	qtime: number;
}

interface IShareQuizData {
	app_idx: number;
	app_result: boolean;
}
*/

declare type PREVIEW_EVAL = 'C01'|'C02'|'C03'|'C04'|
							'C0101'|'C0102'|'C0103'|'C0104'|
							'C0201'|'C0202'|'C0203'|
							'C0301'|'C0302'|'C0303'|'C0304'|'C0305'|
							'C0401'|'C0402'|'C0403';

declare interface IPreviewTextMsg {
	textvalue: string;
	eval: PREVIEW_EVAL;
}

declare interface IPreviewTextResult {
	divCode?: string;
	dmsSeq?: number;
	pageSeq?: number;
	percentage: number;
}

declare interface IPreviewDmsResult {
	divCode?: string;
	dmsSeq?: number;
	pageSeq?: number;
	percentage: number;
}


declare interface IPreviewDmsMsg {
	dms_seq: number;
	eval: PREVIEW_EVAL;
}

declare interface IInClassStudyProps {
	SC_DIV1?: string;
	SC_DIV2?: string;
	SC_DIV3?: string;
	SC_DIV4?: string;
	SC_SAVE?: boolean;
	tmq_seq?: number;
}
declare interface IInClassReport {
	std_cont_seq: number;
	studentId: string;
	ans_tf: '0'|'1';
	ans_submit: string;
	ans_starttime: string;
	ans_endtime: string;	
	sc_div1: string;
	sc_div2: string;
	sc_div3: string;
	sc_div4: string;
	files: string[]|null;
	ans_correct: string;
	tab_index: string;
	sml_order?: number;
	obj_kind?: string; // portfolio 결과 저장 (20210809 최순철 추가)
	objKindDetailCd?: '' | 'MP010401' | 'MP010402' | 'MP010403' | 'MP010404' | 'MP010405' | 'MP010406' | 'MW010201' | 'MW010202';// portfolio beat 저장 (20210929 최순철 추가)
}

// portfolio 영상 풀스크린 on/off 상태 판별용
declare interface Document extends Node, NonElementParentNode, DocumentOrShadowRoot, ParentNode, XPathEvaluatorBase, GlobalEventHandlers, DocumentAndElementEventHandlers {
  webkitIsFullScreen: any;
}

declare interface CaptureImageInfo {
	idx: number;
	url: string;
}

declare interface PenRecordData {
	ridxs: number[];
	starts: number[];
	ends: number[];
	erases: number[];
	colors: string[];
	thicks: number[];
	arrX: number[][];
	arrY: number[][];
}

declare interface CurriculumBookType {
	id: number;
	path: string;
	viewMode: number;
	key: number;
	cmsKey: number;
	updatetime: string;
	completed: 0|1;
}

declare interface CurriculumType {
	id: number;
	code: string;
	depth: number;
	depth_name: string;
	info: string;
	div: string; 
	subDiv?: string;
	name: string;
	thumbnail: string;
	childrenList: CurriculumType[];
	book?: CurriculumBookType;
	useYn?: string;
	extraactivity?: number;
	cmsCode?: string;
	cmsLevel: string;
}

declare const enum ClassColorType {
	WHITE = 'White',
	BLACK = 'Black'
}
  
declare const enum UnitDivType {
	NONE = '',
	NOOP = 'Number&Operations',
	MEDA = 'Measurement&Date',
	OPAL = 'Operations&Algebra',
	GEO = 'Geometry',
	TOPIC = 'Topic',
	MODULEREVIEW = 'Module Review'
}

declare const enum LessonType {
	NONE = '',
	CONCEPT = 'Concept',
	PROBLEM = 'Problem',
	STRATEGY = 'Strategy',
	NOOP = 'Number&Operations',
	MEDA = 'Measurement&Date',
	OPAL = 'Operations&Algebra',
	GEO = 'Geometry',
	CONCEPTLEARNING = 'Concept Learning',  
	TOPICLEARNING = 'Topic Learning',
	MODULELEARNING = 'Module Learning',
	MODULETEST = 'Module Test'
}
  
declare const enum StepGroupType {
	NONE = '',
	WARMUP = 'Warm-Up',
	CONCEPTLEARNING = 'Concept Learning',
	CONCEPTLEARNING2 = 'Concept Learning 2', // 사용안함
	CONCEPTLEARNING3 = 'Concept Learning 3', // 사용안함
	PROBLEMSOLVING = 'Problem Solving',
	WRAPUP = 'Wrap-Up',
	TOPICLEARNING = 'Topic Learning',
	MODULELEARNING = 'Module Learning',
	MODULETEST = 'Module Test'
}
  
declare const enum StepType {
	NONE = '',
	WARMUPACTIVITY = 'Warm-Up Activity',
	LEARNINGOBJECTS = 'Learning Objectives',
	CONCEPTLEARNING = 'Concept Learning',
	CONCEPTACTIVITY = 'Concept Activity',
	CONCEPTTOOL = 'Concept Tool',
	CONCEPTSUMMAMRY = 'Concept Summary',
	ACTIVITY = 'Activity', // 사용안함
	SUMMAMRY = 'Summary', // 사용안함
	CHECK = 'Check', // 사용안함
	INDEPENDENTPRACTICE = 'Independent Practice',
	STRATEGY = 'Strategy',
	EXTENDEDPRACTICE = 'Extended Practice',
	REASONING2 = 'Reasoning (2)', // 사용안함
	WRAPUPACTIVITY= 'Wrap-Up Activity',
	PORTFOLIO = 'Portfolio',
	TOPICSTRATEGY = 'Topic Strategy',
	ADAPTIVELEARNING1 = 'Adaptive Learning',
	MODULEREVIEW = 'Module Review',
	ADAPTIVELEARNING2 = 'Adaptive Learning',
	MODULEPORTFOLIO = 'Module Portfolio',
	MODULESTRATEGY = 'Module Strategy',
	ASSESSMENT = 'Assessment',
	ASSESSMENTREVIEW = 'Assessment Review',
	STEAMACTIVITY = 'STEAM Activity',
	STEAMPORTFOLIO = 'STEAM Portfolio'
} 

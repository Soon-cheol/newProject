import * as StrUtil from '@common/util/StrUtil';
import * as felsocket from './felsocket';

/*function _initStudent<T extends IStudent|null>(student: T): T {
	if(!student) return student;
	student.displayMode = ('' + student.displayMode) === '2' ? '2' : '1';
	let thumb = student.thumb && student.thumb !== '' ? student.thumb : '';
	if(thumb.startsWith('static/') || thumb === '') {
		if(student.gender) {
			const ranval = Math.floor((Math.random() * 3) + 1);
			if(student.gender === 'F') thumb = `${_math_lib_}images/user/female_0${ranval}.png`;
			else thumb = `${_math_lib_}images/user/male_0${ranval}.png`;
		} else {
			if(thumb.endsWith('w.jpg')) thumb = `${_math_lib_}images/default_member_w.png`;
			else thumb = `${_math_lib_}images/default_member_m.png`;
		}
		student.thumb = thumb;
	}
	let avatar = student.avatar && student.avatar !== '' ? student.avatar : '';
	if(avatar === '') {
		const ranval = Math.floor((Math.random() * 2) + 1);
		avatar = `${_math_lib_}images/user/user_0${ranval}.png`;
		student.avatar = avatar;
	}
	console.log('=====> _initStudent student', student);
	return student;
}*/
function _initStudent<T extends IStudent|null>(student: T): T {
	if(!student) return student;
	// console.log("student display Mode",student)
	console.log("init student",student)
	student.displayMode = ('' + student.displayMode) === '2' ? '2' : '1';
	student.gender = student.gender;
	// let thumb = student.thumb && student.thumb !== '' ? student.thumb : '';
	// if(thumb.startsWith('static/') || thumb === '') {
		// if(student.gender) {
		// 	const ranval = Math.floor((Math.random() * 3) + 1);
		// 	if(student.gender === 'F') thumb = `${_math_lib_}images/user/female_0${ranval}.png`;
		// 	else thumb = `${_math_lib_}images/user/male_0${ranval}.png`;
		// } else {
		// 	if(thumb.endsWith('w.jpg')) thumb = `${_math_lib_}images/default_member_w.png`;
		// 	else thumb = `${_math_lib_}images/default_member_m.png`;
		// }
		// thumb = `${_math_lib_}images/default_elephant.png`;
		// student.thumb = thumb;
	// }
	if(student.nickname === "")student.nickname = student.name;
	let avatar = student.avatar && student.avatar !== '' ? student.avatar : '';
	if(avatar === '') {
		// const ranval = Math.floor((Math.random() * 2) + 1);
		// avatar = `${_math_lib_}images/user/user_0${ranval}.png`;
		if(student.gender === 'f' || student.gender === 'F') {
			avatar = `${_math_lib_}images/default_candy.png`;
		} else {
			avatar = `${_math_lib_}images/default_cheese.png`;
		}
		student.avatar = avatar;
	}
	// console.log('=====> _initStudent student', student);
	return student;
}
export interface IMain {
	start: () => void;
	receive: (data: ISocketData) => void;
	uploaded: (url: string) => void;
	multiUploaded: (results: any) => void;
	notify: (type: string) => void;
	notifyRecorded: (url: string) => void;
  	notifyVideoRecord: (url: string) => void;  
  	notifyTakePicture?: (url: string, src: string) => void;
	setData: (data: any) => void;
	notifyNaviInfo: (curriculum: CurriculumType, bookid: number, classid: number, unitid?: number, lessonid?: number, curritype?: string) => void;
	notifyBookCaptureInfo: (infos: CaptureImageInfo[]) => void;
	clickSendButton: () => void;
	notifyRecordData: (audio: string, data: PenRecordData) => void;
	notifyAlert: (isOk: boolean) => void;
	notifyPenToolState: (isVisible: boolean, height: number) => void;
	notifyLiveGivePopupClose: () => void;
	notifyHamburgerMenuClicked: (isView: boolean) => void;
	callThreeminState: () => void;
}

export class App {
	private static _isMobile = false;
	private static _tempBnd: HTMLDivElement;
	private static _tempEl: HTMLDivElement;


	static get isMobile() {return App._isMobile; }
	static get tempEl() {return App._tempEl;}

	public static pub_init() {
		const a = navigator.userAgent;
		const r1 = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i;	
		const r2 = /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i;
		const r3 = /android/i;
		App._isMobile = r1.test(a) || r2.test(a)  || r3.test(a);

		App._tempBnd = document.createElement('div');
		App._tempBnd.style.display = 'none';
		App._tempEl = document.createElement('div');
		App._tempBnd.appendChild(App._tempEl);
		
		if(document.body === null) {
			document.addEventListener('DOMContentLoaded', (e) => {
				document.body.appendChild(App._tempBnd);
			});
		} else {
			document.body.appendChild(App._tempBnd);
		}
	}

	private static _students: IStudent[] = [];
	private static _students_inited: string[] = [];
	static get students() {return App._students; }
	
	// Pad 에서 사용
	private static _student: IStudent|null = null;
	static get student() {return App._student; }
	
	private static _lang = 'ko';
	static get lang() {return App._lang; }
	private static _isDvlp = false;
	static get isDvlp() {return App._isDvlp; }
	
	private static _data_url = '../data/';
	static get data_url() {return App._data_url; }
	
	private static _lesson = '';
	static get lesson() {return App._lesson; }

	private static _book = '';
	static get book() {return App._book; }

	private static _nextBook = false;
	static get nextBook() {return App._nextBook; }
	
	private static _prevBook = false;
	static get prevBook() {return App._prevBook; }

	private static _start_idx = -1;
	public static isStarted = false;

	private static _addOnHost = 'https://addonsapi.fel40.com';
	static get addOnHost() {return App._addOnHost; }

	// 애드온 개발자가 로컬서버로 바꾸어서 테스트 할 수 있도록 제공.
	public static setaddOnHost(url: string) {App._addOnHost = url;}

	public static pub_load(students: IStudent[]|null, student: IStudent|null, book: string, lesson: string, addOnHost: string, nextBook: boolean, prevBook: boolean) {
		// console.log("pub_load", students, student);
		App._lesson = lesson;
		App._book = book;
		// App._initAudio();
		App._nextBook = nextBook;
		App._prevBook = prevBook;

		App._students = [];
		if(students && Array.isArray(students)) {
			students.forEach((s, idx) => {
				App._students[idx] = _initStudent(s);
			});
		}
		App._student = _initStudent(student);

		if(addOnHost && addOnHost !== "") App._addOnHost = addOnHost;
	}
	
	public static pub_reloadStudents(callBack: () => void) {
		felsocket.getStudents((students: any[], isOk: boolean) => {
			while (App._students.length > 0) {
				App._students.pop();
			}
			while (App._students_inited.length > 0) {
				App._students_inited.pop();
			}	
			for(let i = 0, len = students.length; i < len; i++) {
				if (App.isDvlp) {
					App._students[i] = _initStudent(students[i]);
				} else {
					App._students[i] = _initStudent({
						id : students[i].id,
						name : students[i].name,
						thumb : students[i].defaultThumbnail,
						avatar : students[i].profileThumbnail,
						nickname : students[i].nickName !== '' ? students[i].nickName : students[i].name,// 2021-11-14 김성준 수정 nickname 이 없는 경우 name 값으로 셋팅 
						displayMode: students[i].displayMode,
						gender: students[i].gender,
						inited : true,
					});

				}
				console.log("student",students[i])
				App._students_inited.push(students[i].id);
			}
			callBack();
		});
	}

	public static pub_parseStyle(str: string) {
		App._tempEl.style.cssText = str;
		return App._tempEl.style;
	}
	private static _common_audio: HTMLAudioElement;
	private static _ding_audio: HTMLAudioElement|null;
	private static _dingend_audio: HTMLAudioElement|null;
	private static _btn_audio: HTMLAudioElement|null;
	private static _correct_audio: HTMLAudioElement|null;
	private static _wrong_audio: HTMLAudioElement|null;
	private static _topad_audio: HTMLAudioElement|null;
	private static _goodjob_audio: HTMLAudioElement|null;

	private static _btn_back_audio: HTMLAudioElement|null;
	private static _btn_page_audio: HTMLAudioElement|null;
	private static _card_audio: HTMLAudioElement|null;
	private static _popup_audio: HTMLAudioElement|null;

	private static _flips_audio: HTMLAudioElement|null;
	private static _clock_audio: HTMLAudioElement|null;

	private static _write_audio: HTMLAudioElement|null;

	private static _like_bubble_audio: HTMLAudioElement|null;
	private static _all_btn_click_audio: HTMLAudioElement|null;

	private static _ts_bgm_audio: HTMLAudioElement|null;
	private static _bs_audio: HTMLAudioElement|null;
	private static _bb_audio: HTMLAudioElement|null;
	private static _cd_audio: HTMLAudioElement|null;
	private static _tc_audio: HTMLAudioElement|null;
	private static _te_audio: HTMLAudioElement|null;
	private static _trg_bgm_audio: HTMLAudioElement|null;
	private static _afc_audio: HTMLAudioElement|null;
	private static _trs_audio: HTMLAudioElement|null;

	private static _btn_choice_audio: HTMLAudioElement|null;
	private static _retry_audio: HTMLAudioElement|null;
	private static _sorry_audio: HTMLAudioElement|null;
	private static _great_audio: HTMLAudioElement|null;

	private static _memorygame_flipcard_audio: HTMLAudioElement|null;
	private static _ispy_gameclick_audio: HTMLAudioElement|null;

	private static _game_timesetting_start_audio: HTMLAudioElement|null;
	private static _solution_btn_audio: HTMLAudioElement|null;
	private static _game_result_audio: HTMLAudioElement|null;// Game 최종 결과 화면에서 나야 하는 소리 
	private static _open_problom_audio: HTMLAudioElement|null;// 문제 oepn 버튼 눌렀을때 나는 소리 ex) I SPY , Memory Game
	private static _quiz_done_audio: HTMLAudioElement|null; // Quiz 에서 Done 버튼 눌렀을때 나는 소리 
	private static _pick_presenter: HTMLAudioElement|null;// 프리젠터
	private static _hit_up_audio: HTMLAudioElement|null; 
	private static _hit_down_audio: HTMLAudioElement|null; 
	private static _hit_good_audio: HTMLAudioElement|null; 
	private static _hit_wrong_audio: HTMLAudioElement|null; 

	private static _game_good_audio: HTMLAudioElement|null; // 카드 맞췄을 경우 	

	public static pub_initAudio() {
		App._common_audio = document.getElementById('common_audio') as HTMLAudioElement;

		App._ding_audio  = document.getElementById('ding_audio') as HTMLAudioElement|null;
		App._dingend_audio  = document.getElementById('dingend_audio') as HTMLAudioElement|null;
		App._btn_audio = document.getElementById('btn_audio') as HTMLAudioElement|null;
		App._correct_audio = document.getElementById('correct_audio') as HTMLAudioElement|null;
		App._wrong_audio = document.getElementById('wrong_audio') as HTMLAudioElement|null;
		App._topad_audio = document.getElementById('topad_audio') as HTMLAudioElement|null;
		App._goodjob_audio = document.getElementById('goodjob_audio') as HTMLAudioElement|null;

		App._btn_back_audio = document.getElementById('btn_back_audio') as HTMLAudioElement|null;
		App._btn_page_audio = document.getElementById('btn_page_audio') as HTMLAudioElement|null;
		
		// App._card_audio = document.getElementById('card_audio') as HTMLAudioElement|null;
		App._popup_audio = document.getElementById('popup_audio') as HTMLAudioElement|null;
		// App._flips_audio = document.getElementById('card_flips') as HTMLAudioElement|null;
		App._clock_audio = document.getElementById('clock_audio') as HTMLAudioElement|null;
		// App._write_audio = document.getElementById('write_audio') as HTMLAudioElement|null;
		// App._like_bubble_audio = document.getElementById('like_bubble') as HTMLAudioElement|null;
		// App._all_btn_click_audio = document.getElementById('all_btn_click') as HTMLAudioElement|null;

		App._ts_bgm_audio = document.getElementById('ts_bgm_audio') as HTMLAudioElement|null;
		App._bs_audio = document.getElementById('bs_audio') as HTMLAudioElement|null;
		App._bb_audio = document.getElementById('bb_audio') as HTMLAudioElement|null;
		App._cd_audio = document.getElementById('cd_audio') as HTMLAudioElement|null;
		App._tc_audio = document.getElementById('tc_audio') as HTMLAudioElement|null;
		App._te_audio = document.getElementById('te_audio') as HTMLAudioElement|null;
		App._trg_bgm_audio = document.getElementById('trg_bgm_audio') as HTMLAudioElement|null;
		App._afc_audio = document.getElementById('afc_audio') as HTMLAudioElement|null;
		App._trs_audio = document.getElementById('trs_audio') as HTMLAudioElement|null;

		App._btn_choice_audio = document.getElementById('btn_choice_audio') as HTMLAudioElement|null;
		App._retry_audio = document.getElementById('retry_audio') as HTMLAudioElement|null;
		App._sorry_audio = document.getElementById('sorry_audio') as HTMLAudioElement|null;
		App._great_audio = document.getElementById('great_audio') as HTMLAudioElement|null;
		App._memorygame_flipcard_audio = document.getElementById('flipcard_audio') as HTMLAudioElement|null;
		App._ispy_gameclick_audio = document.getElementById('gameclick_audio') as HTMLAudioElement|null;
		App._game_timesetting_start_audio = document.getElementById('game_timesetting_start') as HTMLAudioElement|null;
		App._solution_btn_audio = document.getElementById('solution_btn_audio') as HTMLAudioElement|null;
		App._game_result_audio = document.getElementById('game_result_audio') as HTMLAudioElement|null;
		App._open_problom_audio = document.getElementById('open_problom_audio') as HTMLAudioElement|null;
		App._quiz_done_audio = document.getElementById('quiz_done_audio') as HTMLAudioElement|null;

		App._hit_up_audio = document.getElementById('hu_audio') as HTMLAudioElement|null;
		App._hit_down_audio = document.getElementById('hd_audio') as HTMLAudioElement|null;
		App._hit_good_audio = document.getElementById('hg_audio') as HTMLAudioElement|null;
		App._hit_wrong_audio = document.getElementById('hw_audio') as HTMLAudioElement|null;
		App._pick_presenter = document.getElementById('pick_presenter') as HTMLAudioElement|null;
		App._game_good_audio = document.getElementById('gg_audio') as HTMLAudioElement|null;
	}
  
  	// public static pub_playAllBtnClick() {
	// 	if (App._all_btn_click_audio) {
	// 		App._all_btn_click_audio.currentTime = 0;
	// 		App._all_btn_click_audio.play();
	// 	}
  	// }
	// public static pub_playLikeBubble() {
	// 	if (App._like_bubble_audio) {
	// 		App._like_bubble_audio.currentTime = 0;
	// 		App._like_bubble_audio.play();
	// 	}
	// }
	// public static pub_playWrite() {
	// 	if (App._write_audio) {
	// 		App._write_audio.currentTime = 0;
	// 		App._write_audio.play();
	// 	}
	// }
	public static pub_playClock() {
		if (App._clock_audio) {
			App._clock_audio.currentTime = 4.5;
			App._clock_audio.play();
		}
	}
	// public static pub_playFlips() {
	// 	if (App._flips_audio) {
	// 		App._flips_audio.currentTime = 0;
	// 		App._flips_audio.play();
	// 	}
	// }
	public static pub_playPopup() {
		if (App._popup_audio) {
			App._popup_audio.currentTime = 0;
			App._popup_audio.play();
		}
	}
	// public static pub_playCard() {
	// 	if (App._card_audio) {
	// 		App._card_audio.currentTime = 0;
	// 		App._card_audio.play();
	// 	}
	// }
	public static pub_playBtnPage() {
		if (App._btn_page_audio) {
			App._btn_page_audio.currentTime = 0;
			App._btn_page_audio.play();
		}
	}
	public static pub_playBtnBack() {
		if (App._btn_back_audio) {
			App._btn_back_audio.currentTime = 0;
			App._btn_back_audio.play();
		}
	}
	public static pub_playGoodjob() {
		if (App._goodjob_audio) {
			App._goodjob_audio.currentTime = 0;
			App._goodjob_audio.play();
		}
	}
	public static pub_playDing() {
		if (App._ding_audio) {
			App._ding_audio.currentTime = 0;
			App._ding_audio.play();
		}
	}
	public static pub_playDingend() {
		if (App._dingend_audio) {
			App._dingend_audio.currentTime = 0;
			App._dingend_audio.play();
		}
	}
	public static pub_playToPad() {
		if (App._topad_audio) {
			App._topad_audio.currentTime = 0;
			App._topad_audio.play();
		}
	}// Send Button 누를떄 나는 소리 
	public static pub_playBtnTab() {
		if (App._btn_audio) {
			App._btn_audio.currentTime = 0;
			App._btn_audio.play();
		}
	}// 버튼 클릭시 나야 하는 효과음 
	public static pub_playCorrect() {
		if (App._correct_audio) {
			App._correct_audio.currentTime = 0;
			App._correct_audio.play();
		}
	}
	public static pub_playWrong() {
		if (App._wrong_audio) {
			App._wrong_audio.currentTime = 0;
			App._wrong_audio.play();
		}
	}
	// public static pub_playStudentBubble() {
	// 	const audio = document.getElementById('student_bubble') as HTMLAudioElement|null;
	// 	if(audio) {
	// 		audio.currentTime = 0;
	// 		if(audio.paused) audio.play();			
	// 	}
	// }
	public static pub_playTeamSelectBgm() {
		if (App._ts_bgm_audio) {
			App._ts_bgm_audio.currentTime = 0;
			App._ts_bgm_audio.play();
		}
	}
	public static pub_stopTeamSelectBgm() {
		if (App._ts_bgm_audio) {
			App._ts_bgm_audio.pause();
			App._ts_bgm_audio.currentTime = 0;
		}
	}
	public static pub_playStartButton() {
		if (App._bs_audio) {
			App._bs_audio.currentTime = 0;
			App._bs_audio.play();
		}
	}
	public static pub_playBasicButton() {
		if (App._bb_audio) {
			App._bb_audio.currentTime = 0;
			App._bb_audio.play();
		}
	}
	public static pub_playCountDown() {
		if (App._cd_audio) {
			App._cd_audio.currentTime = 0;
			App._cd_audio.play();
		}
	}
	public static pub_playTimerClock() {
		if (App._tc_audio) {
			App._tc_audio.currentTime = 0;
			App._tc_audio.play();
		}
	}
	public static pub_stopTimerClock() {
		if (App._tc_audio) {
			App._tc_audio.pause();
			App._tc_audio.currentTime = 0;
		}
	}
	public static pub_playTimerEnd() {
		if (App._te_audio) {
			App._te_audio.currentTime = 0;
			App._te_audio.play();
		}
	}
	public static pub_playResultGraph() {
		if (App._trg_bgm_audio) {
			App._trg_bgm_audio.currentTime = 0;
			App._trg_bgm_audio.play();
		}
	}
	public static pub_playFireworksClapping() {
		if (App._afc_audio) {
			App._afc_audio.currentTime = 0;
			App._afc_audio.play();
		}
	}
	public static pub_playTotalResult() {
		if (App._trs_audio) {
			App._trs_audio.currentTime = 0;
			App._trs_audio.play();
		}
	}
	public static pub_playChoiceBtn() {
		if	(App._btn_choice_audio) {
			App._btn_choice_audio.currentTime = 0;
			App._btn_choice_audio.play();
		}
	}
	public static pub_playsorry() {
		if	(App._sorry_audio) {
			App._sorry_audio.currentTime = 0;
			App._sorry_audio.play();
		}
	}
	public static pub_playretry() {
		if	(App._retry_audio) {
			App._retry_audio.currentTime = 0;
			App._retry_audio.play();
		}
	}
	public static pub_playgreat() {
		if	(App._great_audio) {
			App._great_audio.currentTime = 0;
			App._great_audio.play();
		}
	}
	public static pub_playFlipCard() {
		if	(App._memorygame_flipcard_audio) {
			App._memorygame_flipcard_audio.currentTime = 0;
			App._memorygame_flipcard_audio.play();
		}
	}// 카드 뒤집 히는 소리 및 Quiz 에서 팀 석을때 나는 소리 
	public static pub_playGameClick() {
		if	(App._ispy_gameclick_audio) {
			App._ispy_gameclick_audio.currentTime = 0;
			App._ispy_gameclick_audio.play();
		}
	}
	public static pub_game_timesetting_start() {
		if (App._game_timesetting_start_audio) {
			App._game_timesetting_start_audio.currentTime = 0; 
			App._game_timesetting_start_audio.play();
		}
	}// 타이머 셋팅후 start 버튼 누를시 
	public static pub_solution_btn_click() {
		if (App._solution_btn_audio) {
			App._solution_btn_audio.currentTime = 0;
			App._solution_btn_audio.play();
		}
	}// 솔루션 버튼 또는 answer 버튼 클릭시 나야 하는 효과음
	public static pub_playGameresult() {
		if(App._game_result_audio) {
			App._game_result_audio.currentTime = 0;
			App._game_result_audio.play();
		}
	}// Game 에서 최종 결과 화면 나올떄 나야 하는 소리 
	public static pub_openProblom() {
		if(App._open_problom_audio) {
			App._open_problom_audio.currentTime = 0;
			App._open_problom_audio.play();
		}
	}// 문제 open 버튼 눌렀을 경우 나는 소리 
	public static pub_quizDone() {
		if(App._quiz_done_audio) {
			App._quiz_done_audio.currentTime = 0;
			App._quiz_done_audio.play();
		}
	}// Quiz 활동에 팀 선택 화면에서 눌렀을 경우 나야 되는 소리 
	public static pub_pick_presenter() {
		if(App._pick_presenter) {
			App._pick_presenter.currentTime = 0;
			App._pick_presenter.play();
		}
	}// 프리젠터 누를때 나와야 하는 소리 
	public static pub_stop() {
		if (App._common_audio.onended != null) {
			App._common_audio.onended.call(App._common_audio, new Event('ended'));
		}
		App._common_audio.oncanplaythrough = null;
		if (!isNaN(App._common_audio.duration) && !App._common_audio.paused) {
			App._common_audio.pause();
		}	
	}
	
	public static pub_play(url: string, callBack: (isEnded: boolean) => void) {
		App.pub_stop();
		
		url = StrUtil.nteString(url, '');
		const curSrc = StrUtil.nteString(App._common_audio.getAttribute('src'), '');

		if (url === '' && curSrc === '') {
			if (callBack != null) callBack(true);
			return;
		}
			
		if (url !== '' && curSrc !== url) {
			// console.log('src', url);
			App._common_audio.src = url;
		}

		const _onerror = (e: Event) => {
			
			App._common_audio.onended = null;   // 반복적인 호출로 맨앞으로 이동
			if(callBack !== null) callBack(true);
			
			App._common_audio.removeEventListener('error', _onerror);
		};

		App._common_audio.onended = (e: Event ) => {
			App._common_audio.onended = null;			// 반복적인 호출로 맨앞으로 이동
			if(callBack !== null) callBack(e ? true : false);
			
			App._common_audio.removeEventListener('error', _onerror);
		};

		App._common_audio.addEventListener('error', _onerror);

		
		if (isNaN(App._common_audio.duration)) {
			App._common_audio.oncanplaythrough = (e) => {
				if(App._common_audio.currentTime !== 0) App._common_audio.currentTime = 0;
				App._common_audio.play();
				App._common_audio.oncanplaythrough = null;
			};
			App._common_audio.load();			
		} else {
			if(App._common_audio.currentTime !== 0) App._common_audio.currentTime = 0;
			
			App._common_audio.oncanplaythrough = null;
			App._common_audio.play();
		}
	}

	public static pub_set(data: any, isDvlp: boolean, lang: string) {
		App._isDvlp = isDvlp;
		App._lang = lang;
		felsocket.set(isDvlp);
	}
	
	public static pub_addInitedStudent(student: IStudent) {
		let bAdd = true;

		for (let i = 0, len = App._students_inited.length; i < len; i++) {
			const chk = App._students_inited[i];
			if (chk === student.id) {
				bAdd = false;
			}
		}
		if (bAdd) {
			App._students_inited.push(student.id);
		}
		
		const ret = (	App._start_idx > 0 && 
						App._students.length > 0 && 
						App._students_inited.length >= App._students.length
					);
		if (ret) {
			window.clearTimeout(App._start_idx);
			App._start_idx = -1;
		}
		return ret;
	}
	
	public static pub_start(callBack: () => void) {
		if (App._students.length === 0 || App._students_inited.length >= App._students.length) {
			callBack();
		} else {
			App._start_idx = window.setTimeout(callBack, 2000);
		}
	}

	public static pub_clear() {
		while (App._students.length > 0) {
			App._students.pop();
		}
		while (App._students_inited.length > 0) {
			App._students_inited.pop();
		}		
	}
	public static pub_playHitup() {
		if(App._hit_up_audio) {
			App._hit_up_audio.currentTime = 0;
			App._hit_up_audio.play();
		}
	}// Game 에서 최종 결과 화면 나올떄 나야 하는 소리 
	public static pub_playHitdown() {
		if(App._hit_down_audio) {
			App._hit_down_audio.currentTime = 0;
			App._hit_down_audio.play();
		}
	}// Game 에서 최종 결과 화면 나올떄 나야 하는 소리 
	public static pub_playHitgood() {
		if(App._hit_good_audio) {
			App._hit_good_audio.currentTime = 0;
			App._hit_good_audio.play();
		}
	}// Game 에서 최종 결과 화면 나올떄 나야 하는 소리 
	public static pub_playHitwrong() {
		if(App._hit_wrong_audio) {
			App._hit_wrong_audio.currentTime = 0;
			App._hit_wrong_audio.play();
		}
	}// Game 에서 최종 결과 화면 나올떄 나야 하는 소리 
	public static pub_playGamegood() {
		if(App._game_good_audio) {
			App._game_good_audio.currentTime = 0;
			App._game_good_audio.play();
		}
	}// Game 에서 최종 결과 화면 나올떄 나야 하는 소리 

}

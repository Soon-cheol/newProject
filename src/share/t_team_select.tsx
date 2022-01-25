import * as React from 'react';
import { Observer, observer, inject } from 'mobx-react';
import { observable } from 'mobx';
import * as _ from 'lodash';
import { App } from '../App';
import { CoverPopup } from '../share/CoverPopup';
import './t_team_select.scss';
import { AlertPopup } from './AlertPopup';
import { max } from 'lodash';


interface IStudentThumb {
    thumbnail: string;
    avatar: string;
    displayMode: '1' | '2' | undefined;
    name: string;
    className: string;
    gender: string | undefined;
}
const StudentThumb = (props: IStudentThumb) => {
    const [innerContent, setContent] = React.useState(<></>);
    const [gender, setGender] = React.useState('defaultImg_f');
    React.useEffect(() => {
        let temp = <></>;
        const c1 = props.displayMode === '1' && (props.thumbnail === '' || !props.thumbnail) ;
        const c2 = props.displayMode === '2' && (props.avatar === '' || !props.avatar) ;
        if((c1 || c2) && props.name && props.name.length >= 2) {
            temp = <span className="text">{props.name[0].toUpperCase() + props.name[1].toUpperCase()}</span>;
        } else if(props.displayMode === '1' && props.thumbnail !== '') {
            temp = <img src={props.thumbnail} />;
        } else {
            temp = <img src={props.avatar} />;
        }
        setContent(temp);
        setGender(props.gender === 'F' ? 'defaultImg_f' : 'defaultImg_m');
    },[props.displayMode, props.name, props.thumbnail, props.avatar, props.gender]);
    return (
        <div className={'custom_thumbnail ' + props.className + ' ' + gender + (props.thumbnail !== '' ? ' no-bold' : '')}>
            {innerContent}
        </div>
    );    
};

const SwiperComponent = require('react-id-swiper').default;

const _soption: SwiperOptions = {
	direction: 'vertical',
	observer: true,
};
const makeLestUser = (res_team: IStudent[][], popluation: number, teamcheck: boolean[], users: IStudent[], lestuserlist: IStudent[]) => {

	// users 가 두가지 경우가 있음.
	// 1 -> 처음 로딩시에는 전체유저
	// 2 -> 빼기 시에는 삭제된 유저

	// 한팀당 몇명씩 빼낼건가
	let oneteam_user: number[] = [];
	let lest_user: IStudent[][] = [];
	let lestcount = 0;

	res_team.map((t, idx) => {
		oneteam_user.push(popluation - t.length);
		lest_user.push([]);
	}); 


	if(users.length === 0) users = App.students;
	// 우선적으로 그룹에서 빠졌던 학생들이 들어갈수 있도록 이렇게 처리함
	users = [...lestuserlist, ...users];
	for(let j = 0; j < res_team.length; j++) {
		if(oneteam_user.length > j && oneteam_user[j] !== 0) {
			for(let u = 0; u < oneteam_user[j]; u++) {
				let lest = users[lestcount];
				let check = 0;
				if(res_team[j] !== undefined && res_team[j].length !== 0) check = res_team[j].map((r) => r.id).indexOf(lest.id);	
			
				if(check) {
					lest = users[lestcount];
				}
				if(lest) {
					(lest as any).isLest = 1; // 원본
					lest_user[j].push(lest);
				}
				lestcount++;
			}
		}
	}
	
	/* 0827 */
	// 깍두기가 한명이어야 한대서 기존로직에서 이 부분만 수정 - 8 / 13 일 작업 확인 필요
	let rd_idx = Math.floor(Math.random() * lest_user.length - 1);
	let rest_user: any = null;
	lest_user.map((u) => {
		if(u.length > 0 && rest_user === null) {
			if(rest_user === null) rest_user = u[0];
		}
		for(let i = 0; i < u.length; i ++) {
			u[i] = rest_user;
		}
	});
	/* 0827 */

	// 깍두기가 필요한 팀에게 넣어주기
	res_team.forEach((item, idx) => {
		if(lest_user[idx]) {
			lest_user[idx].map((u) => {
				if((u as any)) {
					if(lestuserlist.length === 0 || lestuserlist.indexOf(u) !== -1) {
						(u as any).isLest = 2;
						item.unshift(JSON.parse(JSON.stringify(u)));
					} else {
						(u as any).isLest = 2;
						item.push(JSON.parse(JSON.stringify(u)));
					}
				}
			});
		}
	});

	let temp: any[] = [];
	let temp_count = 0;
	teamcheck.map((i: boolean, d: number) => {
		if(temp[d] === undefined) temp[d] = [];
		if(i) {
			temp[d] = res_team[temp_count];
			temp_count++;
		}
	});
	return temp;
};

const prepareLestUser = (count: number, res_team: IStudent[][], teamcheck: boolean[], users: IStudent[], isadd: boolean, list: IStudent[]) => {
	// 몇명으로 나눠지는지 처리.	
	let popluation = 0;
	popluation = Math.ceil(App.students.length / count);

	// 팀 지정
	let user_idx = 0;
	
	if(isadd === false) {
		users.map((u,u_i) => {
			if(res_team[u_i % count]) {
				(u as any).isLest = 0;
				res_team[u_i % count].push(JSON.parse(JSON.stringify(u)));
				user_idx++;
			}
		});
	} else {
		res_team.map((t, t_dx) => {
			if(teamcheck[t_dx]) {
				if(t.length < popluation) {
					const i = users.slice(0, popluation - t.length);
					i.map((item) => {
						t.push(JSON.parse(JSON.stringify(item)));
					});
				}
			}
		});
	}
	if(isadd === false && App.students.length < count - 1) {
		// 팀보다 인원 자체가 모자라는 경우
		res_team.map((i,d) => {
			if(res_team[d].length === 0) {
				if(res_team[d - 1] && res_team[d - 1].length > 0) {
					let u = {...res_team[d - 1][0]};
					(u as any).isLest = 1;
					res_team[d] = [JSON.parse(JSON.stringify(u))];
				}
			}
		});
		return res_team;
	} else if (res_team[res_team.length - 1].length === popluation) {
		// 깍두기가 안 생길 경우
		return res_team;
	} else {
		return makeLestUser(res_team, popluation, teamcheck, users, list);
	}
};

const devideTeam = (users: IStudent[], teamcheck: boolean[], list: IStudent[]) => {
	// 셔플
	users.sort(() => Math.random() - 0.5);

	// 빈 팀 추가
	const res_team: IStudent[][] = [];
	let count = 3; // teamcheck.filter((i) => i === true).length;
	for(let i = 0; i < count; i++) {
		res_team.push([]);
	}
	// 깍두기 준비
	return prepareLestUser(teamcheck.filter((i) => i === true).length, res_team, teamcheck, users, false, list);
};

interface ITeamMember {
	student: IStudent;
	isLest: number;
	index: number;
}

@observer
class TeamMember extends React.Component<ITeamMember> {
	public render() {
		const {index} = this.props;
		if(this.props.student) {
			return (
				<div className={'student '  + (this.props.isLest > 0 ? 'on' : '')}>
					<StudentThumb 
						thumbnail={this.props.student.thumb}
						avatar={this.props.student.avatar}
						displayMode={this.props.student.displayMode}
						name={this.props.student.displayMode === '1' ? this.props.student.name : this.props.student.nickname}
						gender={this.props.student.gender}
						className={''}
					/>
					<span>{(index + 1) + '.  ' +  (this.props.student.displayMode === '1' ? this.props.student.name : this.props.student.nickname)}</span>
				</div>
			);
		} else {
			return <></>;
		}
	}
}

interface ITeamSetting {
	view: boolean;
	state: any;
	onStartTeamQuiz: () => void;
	_onClosed: () => void;
	teamSetting: (team: any[]) => void;
	onShuffle: (callback: () => void) => void;
	toggleNavi?: (v: boolean) => void;
	teamsize: number;
}

@observer
class TTeamSetting extends React.Component<ITeamSetting> {
	@observable private m_view: boolean = false;
	@observable private teamGroup: IStudent[][] = [];// 이전에 4개 팀에서 3개 팀으로 줄어듬 4 -> 3
	@observable private teamActivate: boolean[] = [true, true, true];
	@observable private lastMinusedStudent: IStudent[] = [];
	@observable private _pluse = false;
	@observable private viewAlertPopup = false;
	
	private _onSubmit = () => {
		App.pub_quizDone();
		this.props.state.teamNum = this.teamActivate.length;
		this.props.onStartTeamQuiz();
		this.m_view = false;
		this.props.state.prog = 'timesetting';
	}
	private _onShuffle = (re: boolean) => {
		App.pub_playFlipCard();
		this.teamUp();
	}
	private teamUp() {
		App.pub_playFlipCard();
		this.teamActivate.map((t, i) => {
			if(i < this.props.teamsize) {
				this.teamActivate[i] = true;
			} else {
				this.teamActivate[i] = false;
			}
		});
		if(App.students && App.students.length === 0) {
			this.teamGroup = [[],[]];
		} else if(App.students && App.students.length > 0) {
			this.teamGroup = devideTeam(App.students, this.teamActivate, this.lastMinusedStudent);
		}
		let teamsinfo: ITeamsInfo[] = [];
		teamsinfo.push({ name: 'red', thumb: `${_project_}teacher/images/team_char01.png`, hearts: 0, livePoint: 0});
		teamsinfo.push({ name: 'green', thumb: `${_project_}teacher/images/team_char02.png`, hearts: 0, livePoint: 0});
		teamsinfo.push({ name: 'yellow', thumb: `${_project_}teacher/images/team_char03.png`, hearts: 0, livePoint: 0});
		teamsinfo.forEach((item, idx) => {
			this.props.state.teamsinfo[idx] = item;
		});
	}
	public componentDidUpdate(prev: ITeamSetting) {
		if(this.props.view && !prev.view) {
			this.viewAlertPopup = false;
			if(this.props.toggleNavi) this.props.toggleNavi(true);
			if(App.students && App.students.length === 0) {
				this.teamGroup = [[],[]];
			}
			_.delay(() => {
				this.m_view = true;
				this._onShuffle(false);
				this.teamGroup.map((team, idx) => {
					if(this.props.state.teamsinfo && this.props.state.teamsinfo[idx]) {
						this.props.state.teamsinfo[idx].teams = team;
						this.props.state.teamsinfo[idx].solved = [];
					}
				});
				this.props.teamSetting(this.teamGroup);
			}, 300 * this.props.state.teamsinfo.length);
		} else if(!this.props.view && prev.view) {
			this.m_view = false;
		}
	}
	public componentDidMount() {
		this.props.onShuffle(() => {
			this.teamGroup.map((team, idx) => {
				if(this.props.state.teamsinfo && this.props.state.teamsinfo.length > idx) {
					this.props.state.teamsinfo[idx].teams = team;
					this.props.state.teamsinfo[idx].solved = [];
				}
			});
			this.props.teamSetting(this.teamGroup);
			this._onSubmit();
		});
	}
	public printTeam(team: IStudent[], idx: number) {
		const teamcolor = ['red', 'green', 'yellow'];
		const teamName = ['Red', 'Green', 'Yellow'];
		if(team === undefined || idx > this.props.teamsize - 1) return <React.Fragment  key={'group' + idx} />;
		let stus: IStudent[] = [];
		this.teamGroup.map((i) => {
			i.map((j) => {
				stus.push(j);
			});
		});
		return (
			<div className={'teamtype ' + teamcolor[idx]} key={'group' + idx}>
				<div className="title">{teamName[idx]}({team.length})
					<button 
						className="btn_plus" 
						style={{display: this._pluse ? '' : 'none'}} 
						onClick={() => {
							const itemidx = this.teamActivate.findIndex((i) => !i);
							this.teamActivate[itemidx] = true;
							this.teamUp();
							this._pluse = false;
						}}
					/>
					<button 
						className="btn_minus" 
						style={{display: this._pluse ? 'none' : ''}} 
						onClick={() => {
							this.teamActivate[idx] = false;
							this.teamUp();
							this._pluse = true;
						}}
					/>
				</div>
				<div className="crew">
					{
						
						team.map((i, sidx: number) => {
							return <TeamMember key={sidx} student={i} index={sidx} isLest={stus.filter((i_i) => i_i.id === i.id).length - 1} />;
						})
					}
				</div>
			</div>
		);
	}
	public render() {
		const { state, _onClosed } = this.props;
		return (
			<CoverPopup className="setting_popup open" view={this.props.view} onClosed={_onClosed}>
				<div className="popContainer">
					<div className="tit">Team Setting</div>
					<div className="list_team">
						{this.teamGroup.map((t, i) => this.printTeam(t, i))}
					</div>
					<div className="btn_btm">
						<button 
							className="btn_random" 
							disabled={App.students && App.students.length === 0}
							onClick={() => {
								this._onShuffle(false);
								this.teamGroup.map((team, idx) => {
									if(this.props.state.teamsinfo && this.props.state.teamsinfo.length > idx) {
										this.props.state.teamsinfo[idx].teams = team;
										this.props.state.teamsinfo[idx].solved = [];
									}
								});
								this.props.teamSetting(this.teamGroup);
							}}
						/>
						<button 
							className="btn_done"
							onClick={() => {
								if(App.students && App.students.length === 0) {
									this.viewAlertPopup = true;
									if(this.props.toggleNavi) this.props.toggleNavi(false);
								} else {
									this._onSubmit();
								}
							}}
						/>
					</div>
				</div>
				<AlertPopup 
					view={this.viewAlertPopup}	
					msg={'There are no team members available.<br />Team Quiz requires a student log-in.<br />Would you still like to proceed?'}							
					onClose={() => {
						this.viewAlertPopup = false;
						if(this.props.toggleNavi) this.props.toggleNavi(true);
					}}
					onOk={() => {
						this._onSubmit();
					}}
				/>
			</CoverPopup>
		);
	}
}

interface ITeamsInfo {
	name: string;
    thumb: string;
    hearts: number;
    livePoint: number;
    lank?: number;
}

interface ITTeamSelect {
	view: boolean;
	state: any;
    actions: any;
	teamsize: number;
	startAction: () => void;
	setShuffled: (teams: any[]) => void;
	onShuffle: (callback: () => void) => void;
}

@observer
class TTeamSelect extends React.Component<ITTeamSelect> {
	constructor(props: ITTeamSelect) {
		super(props);
	}
	private _onClosed = () => {
		//
	}
	private onStartTeam = async () => {
		App.pub_playStartButton();
		this.props.startAction();
	}
	private _setNavi() {
		//
	}
	public componentDidUpdate(prev: ITTeamSelect) {
		if(this.props.view && !prev.view) {
			this.props.state.selection = 'team';
		}

		if(this.props.view) this._setNavi();
	}
	public render() {
		const {view, actions, state } = this.props;
		return (
			<>
				<div className="t_teamselect" style={{display: view ? undefined : 'none'}}>
					<TTeamSetting 
						teamSetting={(v) => {
							v.map((i,idx) => {
								state['team' + (idx + 1)] = i;
							});
							this.props.setShuffled(v);
						}} 
						view={this.props.view}
						state={state} 
						_onClosed={this._onClosed} 
						onStartTeamQuiz={() => this.onStartTeam()}
						teamsize={this.props.teamsize}
						onShuffle={(callback) => this.props.onShuffle(callback)}
						toggleNavi={actions.toggleNavi ? actions.toggleNavi : undefined}
					/>
				</div>
			</>
		);
	}
}

export default TTeamSelect;

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Observer, observer } from 'mobx-react';
import { observable } from 'mobx';
import * as _ from 'lodash';
import { App } from '../App';

// import * as common_memory_game from '../ma_memory_game/common'
// import * as common_hidden_picture from '../ma_hidden_picture/common'
// import * as common_hit_mole from '../ma_hit_mole/common'
import { type } from 'os';

interface IGameResultPopup {
	view: boolean;
	isTeam: boolean;
	isRank: boolean;// 랭커 인지 아닌지 여부
	onClosed: () => void;
	// quizResult: common.IMemoryGameResult;
	quizResult: any;
}

@observer export class GameResultPopup extends React.Component<IGameResultPopup> {
	@observable private m_view = false;
	
	private _onClose = () => {
		App.pub_playBtnTab();
		this.props.onClosed();
	}

	public componentDidUpdate(prevProps: IGameResultPopup) {
		if(this.props.view && !prevProps.view) {
			// console.log("All student list",App.students)
			this.m_view = true;
		} else if(!this.props.view && prevProps.view ) {
			this.m_view = false;
		}
	}
	public getRandomInt(min:number, max:number) {
		min = Math.ceil(min) + 1;
		max = Math.floor(max) + 1;
		return Math.floor(Math.random() * (max - min)) + min;
	}  
	public render() {
		const {isRank, quizResult} = this.props;
		if(!quizResult) return null;

		const lives = quizResult.score;
		const bonus = quizResult.level_bonus;
		const level = quizResult.level;
		let rank = "box rank hide";
		let rankImg = "";
		const type = level === "gold" ? String(this.getRandomInt(0, 2)) : String(this.getRandomInt(0, 4));
		rankImg = "ani_image type" + (level === "gold" ? "_gold_0" : "_0");
		rankImg += type;
		if(isRank) {
			rank = "box rank no_0" + (level === "gold" ? "1" : level === "silver" ? "2" : "3")
		} 

		return(
		<div className={'pop_liveget' + (this.m_view ? ' show' : '')}>{/* pop_liveget 옆에 show를 붙이면 보입니다 */}					
			<div className="inner">
				<button className="btn_close" onClick={this._onClose}/>
				<div className="left">
					<div className="heartbox">
						<div className="ani_image"></div>
						<div className="text">Good Work!</div>
						<div className="box heart">
							<strong>{lives}</strong> Lives
						</div>
						<div className={rank}>
							{/* no_01:금매달, no_02:은매달, no_03:동매달 hide붙이면 사라짐 */}
							{/* 팀전 랭커 또는 개인전 랭커 인 경우만 나옴 */}
							<strong>{bonus}</strong> Lives
						</div>
					</div>
				</div>
				<div className="right">
					<div className={rankImg}></div>
					{/* type_01~04, type_gold_01~02 두가지 타입이 있습니다. */}
				</div>
			</div>
		</div>
		);
	}
}
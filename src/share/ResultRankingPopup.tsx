import * as React from 'react';
import { Observer, observer } from 'mobx-react';
import { observable } from 'mobx';

/* 미완성 개발 예정 */
interface IResultRankingPopup {
    view: boolean;
    onClose: () => void;
}
export class ResultRankingPopup extends React.Component<IResultRankingPopup> {
    public render() {
        const {view} = this.props;
        return(
        <div className="result_ranking type02" style={{display: view ? '' : 'none'}}>{/* 트로피 눌렀을때 나오는 놈 */}
        <div className="high_rank_list">
            <button className="btn_close" onClick={this.props.onClose}/>
            <div className="scroll">
                <div className="title">High Ranking</div>
                <ul>
                    <li className="gold">
                        <img src={`${_project_}common/temp_user_01.png`}/>
                        <div className="score">13</div>
                        <div className="name">Olivia</div>
                    </li>
                    <li className="silver">
                        <img src={`${_project_}common/temp_user_02.png`}/>
                        <div className="score">13</div>
                        <div className="name">William</div>
                    </li>
                    <li className="silver">
                        <img src={`${_project_}common/temp_user_03.png`}/>
                        <div className="score">13</div>
                        <div className="name">Emma</div>
                    </li>
                    <li className="bronze">
                        <img src={`${_project_}common/temp_user_04.png`}/>
                        <div className="score">13</div>
                        <div className="name">Noah</div>
                    </li>
                </ul>
                <div className="title line">Result</div>
                <ul className="result">
                    <li>
                        <img src={`${_project_}common/temp_user_01.png`}/>
                        <div className="score">13</div>
                        <div className="name">Olivia</div>
                    </li>
                    <li>
                        <img src={`${_project_}common/temp_user_02.png`}/>
                        <div className="score">13</div>
                        <div className="name">William</div>
                    </li>
                    <li>
                        <img src={`${_project_}common/temp_user_03.png`}/>
                        <div className="score">13</div>
                        <div className="name">Emma</div>
                    </li>
                    <li>
                        <img src={`${_project_}common/temp_user_04.png`}/>
                        <div className="score">13</div>
                        <div className="name">Noah</div>
                    </li>
                </ul>
            </div>
            <div className="confetti"></div>
        </div>
        </div>
        );
    }
}


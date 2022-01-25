import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Observer, observer, inject } from 'mobx-react';
import { observable } from 'mobx';
import './team_cover.scss';

interface ITeamCover {
    view: boolean;
    teamnames: string;
}

@observer 
export class TeamCover extends React.Component<ITeamCover> {
    private teamSel: HTMLDivElement | null = null;

    public componentDidUpdate(prev: ITeamCover) {
        const teamSel = this.teamSel;
        if(teamSel === null) return;
        if(this.props.view && !prev.view) {
            setTimeout(() => {
                teamSel.classList.add('open');
            }, 10);
        }
        if(this.props.teamnames !== prev.teamnames) {
            teamSel.classList.remove('open');
            setTimeout(() => {
                teamSel.classList.add('open');
            }, 1000);
        }
    }

    public render() {
        const {view,teamnames} = this.props;
        return (
        <div 
            className={'cover_teamselection ' + (teamnames)} 
            style={{display: view ? '' : 'none'}}
            ref={(e) => this.teamSel = e}
        >
            <div className="img_text" />
            <div className="circle">
                <div className="c01" />
                <div className="c02" />
                <div className="c03" />
            </div>
        </div>
        );
    }
}

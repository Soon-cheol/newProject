import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { observable, action } from 'mobx';
import { observer, Observer } from 'mobx-react';
import { hot } from 'react-hot-loader';

import { ToggleBtn } from '@common/component/button';
interface IRankingBtn {
    view: boolean;
    onClick: () => void;

}
export class RankingBtn extends React.Component<IRankingBtn> {
    public render() {
        return (
            <ToggleBtn className="btn_ranking" style={{display: this.props.view ? '' :'none'}} onClick={this.props.onClick}/>
        );
    }
}
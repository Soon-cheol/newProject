
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Observer, observer, inject } from 'mobx-react';
import { observable } from 'mobx';
import * as kutil from '@common/util/kutil';
interface IIntroPage {
	view: boolean;
    setNavi: () => void;
    startQuiz: () => void;
}

@observer 
class IntroPage extends React.Component<IIntroPage> {

	@observable private _opened: boolean = false;

	private async _startQuiz() {
		await kutil.wait(400);
		this._opened  = true;
		await kutil.wait(1000);
		this.props.startQuiz();

	}
	private _setNavi() {
        if(!this.props.view) return;
        this.props.setNavi();
        // this.props.actions.setNaviView(false);

        // this.props.actions.setNaviFnc(
        //     null,
        //     null
        // );
	}
	public componentDidUpdate(prev: IIntroPage) {
		if(this.props.view && !prev.view) {
			this._setNavi();
			this._startQuiz();
		
		} else if(!this.props.view && prev.view) {
			this._opened = false;
		}
	}
	public render() {
		const {view} = this.props;
		return (
			<div className={'intro_quiz' + (this._opened ? ' open' : '')} style={{display: view ? undefined : 'none'}}>
				<div className="intro_img">
					<span className="secondhand" />
				</div>
			</div>
		);
	}

}

export default IntroPage;
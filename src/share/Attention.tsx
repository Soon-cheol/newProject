import * as React from 'react';
import * as felsocket from '../felsocket';

interface IAttention {
    view: boolean;
    offMathKit?: boolean;
}

class Attention extends React.Component<IAttention> {
    public componentDidUpdate(prev: IAttention) {
		// if(this.props.view && !prev.view) {
		// 	felsocket.showSMathKit(false);
		// } else if(!this.props.view && prev.view) {
		// 	if(!this.props.offMathKit) felsocket.showSMathKit(true);
		// }
	}
    public render() {
        return (
            <div className={'attention ' + (this.props.view ? '' : 'hide' )}><span>Attention</span></div>
        );
     }
};

export default Attention;
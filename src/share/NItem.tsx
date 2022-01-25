import * as React from 'react';
import * as ReactDOM from 'react-dom';
interface INItem {
    idx: number;
    on: boolean;
    onClick: (idx: number) => void;
}
export class NItem extends React.Component<INItem> {
    private _click = () => {
		this.props.onClick(this.props.idx);
	}

    public render() {
        const {on} = this.props;
        return(
            <span className={on ? 'on' : ''} onClick={this._click} />
        );
    }
}

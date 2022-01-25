import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { App } from './../App';

export default class SoundButton extends React.Component<{
    url: string;
    play: boolean;
    changePlay: (v: boolean) => void;
}> {
    
    public componentDidUpdate(prev: {play: boolean, url: string}) {
        if(this.props.url !== prev.url) {
            this.props.changePlay(false);
        }
        if(this.props.play !== prev.play) {
            if(this.props.play) {
                App.pub_play(this.props.url, () => {
                    // console.log('AAAA');
                });
            } else {
                App.pub_stop();
            }
        }
    }
    public onClick() {
        this.props.changePlay(!this.props.play);
    }
    
    public render() {
        return <button className={'sound_button'} onClick={() => this.onClick()} />;
    }
}
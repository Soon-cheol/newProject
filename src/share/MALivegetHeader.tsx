import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { observable, action } from 'mobx';
import { observer } from 'mobx-react';
import * as _ from 'lodash';
import * as kutil from '@common/util/kutil';
import { App } from '../App';
const SwiperComponent = require('react-id-swiper').default;

interface IMALiveHeader {
    view: boolean;
    showhide: 'show'|'hide'|'';
    studentName: string;
    thumb: string;
    gender: string | undefined;
    livePoint: number|undefined;
    contentType?: string;
    contentName?: string;
}

@observer
export class MALiveHeader extends React.Component<IMALiveHeader> {
    constructor(props: IMALiveHeader) {
		super(props);
    }
    private editClassName = async () => {
        let div = document.getElementsByClassName('live_guage');
        await kutil.wait(1900); 
        div[0].className = 'live_guage';
    }
	public async componentDidUpdate(prev: IMALiveHeader) {
        if(this.props.view && !prev.view) {
            //
        } 
	}
 
    public render() {
        const{studentName,livePoint,thumb,showhide,gender,contentType,contentName} = this.props;
        
        let point = 0;
        let isOverPoint = false;
        let isTwinkle = false;
        if(livePoint && (livePoint > 300)) {
            point = 300;
            // isTwinkle = true;
        } else if(livePoint && livePoint === 300) {
            if(this.props.view && isOverPoint === false)App.pub_playgreat();
            isTwinkle = true; 
            isOverPoint = true;
            point = livePoint;
            this.editClassName();
           

        } else if(livePoint && livePoint < 300) {
         
            point = livePoint;
            isOverPoint = false;
        } 
        return(
            <div className={`maheader ${contentType}`}>
                <div className="user" style={{opacity: showhide === 'show' ? 1 : 0}}>
                    {thumb === '' && <div className={gender === 'F' ? 'defaultImg_f' : 'defaultImg_m'}><div>{studentName.substring(0,2).toUpperCase()}</div></div>}
                    {thumb !== '' && <img src={thumb} />}
                    <span className="name">{studentName}</span>
                </div>
                <div className={'live_guage' + (isTwinkle ? ' twinkle' : '')}>
                    <div className="heart" />
                    <div className="bar_wrap">
                        <div className="bar" style={{width: point / 3 + '%'}} />
                        <div className={'num' + (isOverPoint ? ' overmax' : '')} data-value={point + ''}>{point}</div>
                        {/* data-value도 text값과 같은값으로 넣어주시고요 max값 초과시 overmax클래스도 붙여주세요. */}
                    </div>
                </div>
                <div className="typeName">{contentName}</div>
            </div>
        );
    }
}
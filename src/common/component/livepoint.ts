import axios from 'axios';
import * as felsocket from '../../felsocket';
import * as kutil from '../util/kutil';
export interface ILivePointResponse {
    redScore: number;
    redAccScore: number;
    greenScore: number;
    greenAccScore: number;
}

export interface ILivePointRequest {
    addOnHost: string;
    liveType: 'red' | 'green';
    plusMinusType: 'minus' | 'plus';
    score: number;
    userIdx: string;
    clsIdx: number;
    depthItemIdx: number;
    callback: (v: ILivePointResponse) => void;
    error: (e: Error) => void;
}

export async function setLivePoint(props: ILivePointRequest) {
    let formdata_next = new FormData();
    formdata_next.append('score', props.score + '');
    formdata_next.append('userIdx', props.userIdx);
    formdata_next.append('clsIdx', props.clsIdx + '');
    formdata_next.append('depthItemIdx', props.depthItemIdx + '');
    felsocket.showTLoading(true); 
    await axios({
        method: 'post',
        url: props.addOnHost + `/ma/rw/${props.plusMinusType}/${props.liveType}`,
        data: formdata_next,
    }).then(async (response) => {
        await axios.get(props.addOnHost + '/ma/rw/info', {
            params: {
                userIdx: props.userIdx
            }
        }).then(async (res) => {
            felsocket.showTLoading(false);
            if(res.data && res.data.resultData) {
                res.data.resultData.map((user: ILivePointResponse) => {
                    props.callback({
                        redScore: user.redScore,
                        redAccScore: user.redAccScore,
                        greenScore: user.greenScore,
                        greenAccScore: user.greenAccScore
                    });
                });
            }
        }).catch((e) => {
            felsocket.showTLoading(false);
            felsocket.alertToTeacher('서버로 부터 응답 받지 못하였습니다.');
            props.error(e);
        });
    }).catch((e) => {
        felsocket.showTLoading(false);
        felsocket.alertToTeacher('서버로 부터 응답 받지 못하였습니다.');
        props.error(e);
    });
}
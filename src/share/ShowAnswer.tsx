import * as React from 'react';
import { App } from '../App';
import './ShowAnswer.scss';

const ShowAnswerLayer = (props: { mode: 'list' | 'single' }) => {
    const [qNum, setQnum] = React.useState(0);
    const [visible, setVisible] = React.useState(false);
    const [inner_visible, setInnerVisible] = React.useState(false);
    const [dragging, setDragging] = React.useState(false);
    const [styles, setStyles] = React.useState({ top: 0, left: 0, display: 'none' });
    const [startPoint, setPoint] = React.useState({ x: 0, y: 0 });
    const layer = React.useRef() as React.MutableRefObject<HTMLDivElement>;
    let keyEvent: any = null;
    let keyPressed: string[] = [];
    React.useEffect(() => {
        if (visible) setStyles({ ...styles, display: 'block' });
        else setStyles({ ...styles, display: 'none' });
    }, [visible]);
    const questionLoading = async (callback: (data: string[]) => void) => {
        let reg: RegExp = /\/\d+\//g;
        let qz: string[] = [];
        [...document.querySelectorAll('.swiper-slide-active iframe') as any].map((j) => {
            let quizNum = j.src;
            if (quizNum.indexOf('MAproblem') !== -1 && quizNum.match(reg) !== null) {
                quizNum = j.src.match(reg)[0];
                qz.push(quizNum.replace(/\//gi, ''));
            }
        });
        if(callback && qz.length > 0) callback(qz);
    };
    const moveQuestionBtn = React.useCallback(() => {
        if (props.mode === 'single') return;
        return (
            <>
                <button onClick={() => setQnum(parseInt(JSON.stringify(qNum), 10) - 1)}>이전</button>
                <button onClick={() => setQnum(parseInt(JSON.stringify(qNum), 10) + 1)}>다음</button>
            </>
        );
    },  [qNum, props.mode]);

    React.useEffect(() => {
        keyPressed = [];
    }, [props, visible]);


    const onDragStart = React.useCallback((e: React.PointerEvent) => {
        if (e.pressure > 0) {
            setDragging(true);
            setPoint({ x: e.clientX, y: e.clientY });
        }
    }, [layer]);

    const onLoad = React.useCallback(() => {
        document.addEventListener('keydown', (e) => {
            let k = keyPressed.indexOf(e.key);
            if (k === -1) keyPressed.push(e.key);
            if (keyPressed.indexOf('T') !== -1 && keyPressed.indexOf('V') !== -1 && e.shiftKey) {
                setVisible(true);
            } else {
                setVisible(false);
            }
        });
        document.addEventListener('keyup', (e) => {
            let k = keyPressed.indexOf(e.key);
            if (k !== -1) keyPressed.splice(k, 1);
        });
    }, [layer]);

    const onDragging = React.useCallback((e: React.PointerEvent) => {
        let y = e.clientY - startPoint.y - 20;
        let x = e.clientX - startPoint.x - 20;
        if (dragging) {
            setStyles({ ...styles, top: styles.top + y, left: styles.left + x });
        }
    }, [layer]);

    const onDragEnd = React.useCallback((e: React.PointerEvent) => {
        if (dragging) {
            setDragging(false);
        }
    }, [layer]);

    React.useEffect(() => {
        return () => {
            setDragging(false);
            setVisible(false);
            setInnerVisible(false);
            setQnum(0);
            setPoint({ x: 0, y: 0 });
            setStyles({ top: 0, left: 0, display: 'none' });
        };
      }, []);

    if ((window as any).location.href.indexOf('192.168') === -1) return <></>;
    
    return (
        <>
            <div
                id="answerLayer"
                data-custom="true"
                ref={layer}
                onPointerDown={(e) => onDragStart(e)}
                onPointerMove={(e) => onDragging(e)}
                onPointerUp={(e) => onDragEnd(e)}
            >
                <div 
                    style={inner_visible ? { height: 0 } : { height: 0 }}
                    ref={(e) => {
                        if(e !== null) {
                            onLoad();
                        }
                    }}
                />
                <button onClick={() => {
                    questionLoading((list: string[]) => {
                        if(list.length === 0 || !list[qNum]) alert('다시 한번 눌러주세요');
                        setInnerVisible(!visible);
                        window.open(`https://contents.fel40.com/fileRoot/MAproblem/${list.length > qNum ? list[qNum] : ''}/desc.html`, '_blank', "toolbar=yes,scrollbars=yes,resizable=yes,top=10,left=10,width=1200,height=600");
                    });
                }}>정답</button>
            </div>
        </>
    );
};

export default ShowAnswerLayer;
import React from 'react'
import { useGesture } from '@use-gesture/react'
import { useSpring } from '@react-spring/web'
import Styles from './styles.module.css'
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import Button from '../../ui/button';

interface Props {
    children?: React.ReactNode;
}

export default function ScrollRow(props: Props) {

    const scroll = React.useRef<HTMLDivElement>(null);
    const scrollX = React.useRef(0);
    
    // Watch scroll to determine boolean scroll min/max
    const [max, setMax] = React.useState(false);
    const [min, setMin] = React.useState(false);
    React.useEffect(() => {

        function listener () {
            if (!scroll.current) return

            // Track boolean scroll min
            if (!min && scroll.current.scrollLeft === 0) {
                setMin(true);
            } else if (min && scroll.current.scrollLeft !== 0) {
                setMin(false);
            };

            // Track boolean scroll max
            if (!max && scroll.current.scrollLeft === scroll.current.scrollWidth - scroll.current.clientWidth) {
                setMax(true);
            } else if (max && scroll.current.scrollLeft !== scroll.current.scrollWidth - scroll.current.clientWidth) {
                setMax(false);
            }
        };

        listener();

        scroll.current?.addEventListener('scroll', listener);
        return () => scroll.current?.removeEventListener('scroll', listener);
    }, [scroll.current, min, max]);

    // Function to jump the scroll position based on a percent of row width (negative backwards, positive forwards)
    const jump = React.useMemo(() => function (percent : number) {
        if (!scroll.current) return;
        spring.start({ x: scrollX.current + scroll.current.clientWidth * percent });
    }, [scroll.current]);

    // Spring to animate scroll position
    const [, spring] = useSpring(() => ({
        immediate: false,
        x: 0,
        onChange (props) {
            scroll.current?.scrollTo(props.value.x, 0);
        },
        onRest () {
            scrollX.current = scroll.current?.scrollLeft || 0;
            // This is where I would implement locking
        },
        config: {
            mass: 1, tension: 80, friction: 16,
        }
    }));

    // Bind drag gesture to the scroll spring
    const bind = useGesture({
        onDrag ({ movement: [x], first }) {
            if (first) scrollX.current = scroll.current?.scrollLeft || 0;
            spring.start({
                x: scrollX.current - x,
            });
        },
    }, {
        drag: {
            filterTaps: true,
        }
    });

    return <div className={`${Styles.root} ${min ? Styles.min : ''} ${max ? Styles.max : ''}`}>
        <div className={Styles.scroll} {...bind()} ref={scroll}>
            <div className={Styles.row}>
                {props.children}
            </div>
        </div>
        <div className={Styles.control}>
            <div className={Styles.back}><Button flush onClick={() => jump(-1)}><FaArrowLeft /></Button></div>
            <div className={Styles.next}><Button flush onClick={() => jump(1)}><FaArrowRight /></Button></div>
            <div className={Styles.edgeLeft} />
            <div className={Styles.edgeRight} />
        </div>
    </div>
};

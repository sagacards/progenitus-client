import useModalStore from './store';
import Styles from './styles.module.css'

export default function Modal () {
    const {
        state,
        content,
        title,
        close,
    } = useModalStore();
    return <div className={[Styles.root, state ? Styles.open : ''].join(' ')}>
        <div className={Styles.overlay} onClick={close} />
        <div className={Styles.frame}>
            <div className={Styles.title}>{title}</div>
            <div className={Styles.content}>{content}</div>
        </div>
    </div>
}
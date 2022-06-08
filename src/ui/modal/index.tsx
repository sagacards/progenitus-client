import { AnimatePresence, motion } from 'framer-motion';
import useModalStore from './store';
import Styles from './styles.module.css'

export default function Modal() {
    const {
        state,
        content,
        title,
        close,
    } = useModalStore();
    return <AnimatePresence exitBeforeEnter>
        {state && <motion.div
            key='modal'
            className={[Styles.root, state ? Styles.open : ''].join(' ')}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
        >
            <div className={Styles.overlay} onClick={close} />
            <div className={Styles.frame}>
                <div className={Styles.title}>{title}</div>
                <div className={Styles.content}>{content}</div>
            </div>
        </motion.div>}
    </AnimatePresence>
}
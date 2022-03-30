import React from 'react'
import useStore from 'stores/index'
import Spinner from 'ui/spinner'
import Styles from './styles.module.css'

interface Props {
    children?: React.ReactNode;
}

export default function Grid (props : Props) {
    // const { status } = useStore()

    return props.children ? <div className={Styles.root}>
        {props.children}
    </div> : <div className={[Styles.root, Styles.empty].join(' ')}>
        {/* {status === 'initialized' ? `😵 Nothing found! Please adjust your search settings.` : <Spinner />} */}
        <Spinner />
    </div>
}
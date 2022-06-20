import React from 'react'
import Spinner from 'ui/spinner'
import Styles from './styles.module.css'

interface Props {
    children?: React.ReactNode;
    columns?: number;
}

export default function Grid({ children, columns }: Props) {
    // const { status } = useStore()

    return children ? <div className={Styles.root}>
        {children}
    </div> : <div className={[Styles.root, Styles.empty, columns && Styles[`col${columns}`]].join(' ')}>
        {/* {status === 'initialized' ? `😵 Nothing found! Please adjust your search settings.` : <Spinner />} */}
        <Spinner />
    </div>
}
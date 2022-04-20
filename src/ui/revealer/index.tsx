import React from 'react'
import ReactMarkdown from 'react-markdown';
import Styles from './styles.module.css'

interface Props {
    content?: string;
}

export default function Revealer ({ content } : Props) {
    const [show, setShow] = React.useState(false);
    return <div className={Styles.root}>
        {content && content != '' && <>
            <ReactMarkdown skipHtml allowedElements={['p', 'ul', 'li', 'a', 'h1', 'h2', 'br']}>
                {
                    show
                    ? content
                    : content.split(' ').slice(0, 12).join(' ') + '...'
                }
            </ReactMarkdown>
            <span className="link" onClick={() => setShow(!show)}>Read {show ? 'Less' : 'More'}</span>
        </>}
        
    </div>
}
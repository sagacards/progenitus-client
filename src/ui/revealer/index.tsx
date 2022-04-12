import React from 'react'
import ReactMarkdown from 'react-markdown';
import Styles from './styles.module.css'

interface Props {
    content?: string;
}

export default function Revealer ({ content } : Props) {
    const [show, setShow] = React.useState(false);
    console.log(content)
    return <div className={Styles.root}>
        {content && content != '' && <>
            <ReactMarkdown skipHtml allowedElements={['p', 'ul', 'li', 'a', 'h1', 'h2']}>
                {
                    show
                    ? content
                    : content.split(' ').slice(0, 12).join(' ') + '...'
                }
            </ReactMarkdown>
            <a href="#" onClick={() => setShow(!show)}>Read {show ? 'Less' : 'More'}</a>
        </>}
        
    </div>
}
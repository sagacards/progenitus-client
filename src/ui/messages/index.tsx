import React from 'react'
import { toast, ToastContainer } from 'react-toastify';
import useStore, { Message } from 'stores/index';
import Styles from './styles.module.css'

interface Props {
    children?: React.ReactNode;
}

export default function Messages (props : Props) {
    const { messages, readMessage, colorScheme } = useStore();

    React.useEffect(() => {
        const unread = Object.entries(messages).filter(([i, message]) => !message.read);
        unread.forEach(([i, message]) => {
            readMessage(parseInt(i));
            toast(message.message);
        });
    }, [messages]);

    return <ToastContainer theme={colorScheme} position='bottom-center' />
}
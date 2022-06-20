import React from 'react'
import { toast, ToastContainer } from 'react-toastify';
import useMessageStore from 'stores/messages';
import useThemeStore from 'stores/theme';

interface Props {
    children?: React.ReactNode;
}

export default function Messages (props : Props) {
    const { theme } = useThemeStore();
    const { messages, readMessage } = useMessageStore();

    React.useEffect(() => {
        const unread = Object.entries(messages).filter(([i, message]) => !message.read);
        unread.forEach(([i, message]) => {
            readMessage(parseInt(i));
            toast(message.message);
        });
    }, [messages]);

    return <ToastContainer theme={theme} position='bottom-center' />
}
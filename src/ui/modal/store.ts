import React from 'react';
import create from 'zustand';

interface SingleModalStore {
    state: boolean;
    title?: string;
    content: React.ReactNode;

    open: (t?: string, c?: React.ReactNode) => void;
    close: () => void;
    setContent: (c: React.ReactNode) => void;
}

const useModalStore = create<SingleModalStore>((set, get) => ({
    title: undefined,
    state: false,
    content: undefined,

    open(title, content) {
        set({ state: true });
        content && set({ title, content });
    },

    close() {
        set({ state: false });
    },

    setContent(content) {
        set({ content });
    },
}));

export default useModalStore;

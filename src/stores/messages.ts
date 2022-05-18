// A simple store to facilitate generically posting messages to the user.
import create from 'zustand'

export interface Message {
    type    : 'error' | 'info';
    message : string;
    read?   : boolean;
};

interface MessagesStore {

    initialized: boolean;
    init: () => void;

    messages: { [key: number] : Message };
    pushMessage: (m : Message) => void;
    readMessage: (i : number) => void;

};

// Main store function
const useMessageStore = create<MessagesStore>((set, get) => ({

    initialized: false,
    init () {
        const { initialized } = get();
        if (initialized) return;

        window.alert = (message : string) => {
            get().pushMessage({ type: 'info', message });
        };

        set({ initialized : true });
    },

    messages: {},

    pushMessage (message) {
        set(state => ({
            messages: {
                ...state.messages,
                [Object.values(state.messages).length - 1]: message
            }
        }));
    },

    readMessage (i) {
        set(state => ({
            messages: {
                ...state.messages,
                [i]: { ...state.messages[i], read: true }
            }
        }));
    },

}));

export default useMessageStore;
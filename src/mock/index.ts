import { Event, Collection } from 'stores/index'
import Disk from 'assets/disk/8.png'
import { Principal } from '@dfinity/principal';

export default function makeEvents (count : number = 3) : { [ key : Event['id']] : Event } {
    let events : { [ key : Event['id']] : Event } = {};
    while (Object.values(events).length < count) {
        const event = eventFactory();
        events[event.id] = event;
    }
    return events;
};

export function eventFactory () : Event {
    return {
        id : Math.floor(Math.random() * 1_000_000_000),
        supply: 100 + (50 - Math.floor(100 * Math.random())),
        access: Math.random() > .5 ? 'private' : 'public',
        price: {
            e8s: 4_00_000_000 + Math.floor(Math.random() * 10) * 1_00_000_000,
        },
        startDate: new Date(),
        endDate: new Date(),
        collection: collectionFactory(),
    };
};

export function collectionFactory () : Collection {
    const arcana = ['The Fool', 'The Magician', 'The High Priestess', 'The Empress', 'The Emperor', 'The Hierophant', 'The Lovers', 'The Chariot', 'Strength', 'The Hermit', 'Wheel of Fortune', 'Justice', 'The Hanged Man', 'Death', 'Temperance', 'The Devil', 'The Tower', 'The Star', 'The Moon', 'The Sun', 'Judgement', 'The World'];
    const i = Math.floor(Math.random() * arcana.length);
    return {
        name: `#${i} ${arcana[i]}`,
        icon: Disk,
        banner: '',
        canister: Principal.fromText("ztlax-3lufm-ahpvx-36scg-7b4lf-m34dn-md7or-ltgjf-nhq4k-qqffn-oqe"),
        description: '',
    };
};
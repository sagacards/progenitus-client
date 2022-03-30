import { Event, Collection, CAPEvent, _Token } from 'stores/index'
import Disk from 'assets/disk/8.png'

export default function makeEvents (count : number = 3) : { [ key : Event['id']] : Event } {
    let events : { [ key : Event['id']] : Event } = {};
    while (Object.values(events).length < count) {
        const event = eventFactory();
        events[event.id] = event;
    }
    return events;
};

export function makeCollections (count : number = 3) : { [ key : string ] : Collection } {
    const collections : { [ key : string ] : Collection } = {};;
    while (Object.values(collections).length < count) {
        const collection = collectionFactory(Object.values(collections).length);
        collections[collection.canister] = collection;
    }
    return collections;
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

export function collectionFactory (index? : number) : Collection {
    const arcana = ['The Fool', 'The Magician', 'The High Priestess', 'The Empress', 'The Emperor', 'The Hierophant', 'The Lovers', 'The Chariot', 'Strength', 'The Hermit', 'Wheel of Fortune', 'Justice', 'The Hanged Man', 'Death', 'Temperance', 'The Devil', 'The Tower', 'The Star', 'The Moon', 'The Sun', 'Judgement', 'The World'];
    const i = Math.floor(Math.random() * arcana.length);
    return {
        name: `#${i} ${arcana[i]}`,
        icon: Disk,
        banner: '',
        canister: SagaCanisters[index || Math.floor(SagaCanisters.length * Math.random())],
        description: '',
    };
};

// We have our own list of canisters for this marketplace!
// TODO: This should be a DAO maintained directory of Tarot NFTs.
// TODO: Create a custom DAB directory for this :)
const SagaCanisters = [
    "nges7-giaaa-aaaaj-qaiya-cai",
    "6e6eb-piaaa-aaaaj-qal6a-cai",
    "cwu5z-wyaaa-aaaaj-qaoaq-cai",
];

const history : { [key : string] : _Token[] } = {};
let index = 0;
for (const canister of SagaCanisters) {
    let l = [];
    for (let i = 50; i >= 0; i--) {
        l.push({
            token: { index, canister, },
            // listing: { price: Math.random() * 100, id : index, canister },
            event: { type: 'mint', timestamp: new Date(new Date().getTime() - Math.random() * 1000 * 60 * 4) } as CAPEvent,
        });
        index++
    };
    history[canister] = l;
};

export {
    history,
}
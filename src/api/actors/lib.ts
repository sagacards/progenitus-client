// A global manager for canister actors. (unused)
// What's the point of something like this, since we can simply create a new actor whenever we need one? Perhaps we need the same actor in many places in our application at the same time: is there much cost to creating many copies?

// I suppose one perk is that in cases where creating an actor requires some form of async, we can remove the need to repeat that async.

// Perhaps one objective might be to simplify the API of using actors. For example, we might want to be able to register known canisters once, then simply call an actor by name when we need it:

// registerActor('myActor', factory, id);
// actor<T>('myActor');
// actor<T>('myActor', agent);

// We could handle disconnection by providing a method to invalidate actors with a given agent.

// invalidate(agent);

// We could provide a way to globally configure your actors.

// configure({
//     host: 'https://ic0.app',
// });

// Perhaps we could also register identities, for use in creating actors.

// registerAgent('userPlug', agent);

// Now we could get an actor using an agent as a string without needing a reference the object, or with the agent object itself.

// actor<T>('myActor', 'userPlug');

// Sometimes I want to create a bunch of actors using the same factory, but a different canister ID (ex: many canisters using the same interface standard.)

// registerFactory('legend', factory);
// actor<T>(['legend', canisterId]);
// registerActor('fool', ['legend', canisterId], 'userPlug');

// We might return the actor when registering. This flexibility might lead to some confusion about intended use.

// const actor = await registerActor<T>('someActor', factory, id);

// I'm not sure what to do with the first parameter. Sometimes it seems that I want it to be an ActorKey, but in others (perhaps more niche) I want to pass a Canister. Perhaps I'll just make the first param always an ActorKey.

// After mucking about, the interface looks like this: (key : string, Canister, Agent) where Canister and Agent can be overloaded to achieve different wants.

// Use this to create an actor with the given interface and id and the default (anonymous) agent.
// actor<T>('likes', [interface, id]);

// Optionally, you can pass a CanisterKey so that you can use this canister by name later.
// actor<T>('likes', ['likes', interface, id]);

// Use this to call an actor that you've already created by name.
// actor<T>('likes');

// Use this to create an actor with some specific (likely authenticated) agent.
// actor<T>('likes-authed', 'likes', agent);

// This leaves me with a bit of a question, about why this is any better than created single actors in some module and exporting them? Perhaps the ability to work with different identities is smoother this way? I wonder if using this simpler method and simply swapping out the agent/agent when one becomes available or changes wouldn't be better.... perhaps with an updateAgent method?

// The keyed pattern might support dynamic actor creation better? It might support multiple agents better?

// A major drawback is that because it's dynamic, we lose static typing.

import {
    Actor,
    ActorSubclass,
    Agent as DfAgent,
    HttpAgent,
} from '@dfinity/agent';
import { InterfaceFactory } from '@dfinity/candid/lib/cjs/idl';
import { Principal } from '@dfinity/principal';

////////////
// Types //
//////////

// Note: make key in array types optional?

// A key identifying a registered actor.
type ActorKey = string;

// A key identifying a registered agent.
// TODO: Change this to an Agent.
type AgentKey = string;
type Agent = AgentKey | DfAgent | [AgentKey, DfAgent];

// A key identifying a registered interface factory.
type FactoryKey = string;
type Factory = FactoryKey | InterfaceFactory | [FactoryKey, InterfaceFactory];

// A key identifying a registered canister.
type CanisterKey = string;
type CanisterId = string;
type Canister =
    | CanisterKey
    | [Factory, CanisterId]
    | [CanisterKey, Factory, CanisterId];

////////////
// State //
//////////

// Object storing shared actor configuration.
const Conf = {
    host: 'https://ic0.app',
};

const defaultAgent = new HttpAgent({ host: Conf.host });

// Object storing existing initialized actors.
const Actors: { [key: ActorKey]: ActorSubclass<unknown> } = {};

// Object storing registered canisters.
const RegisteredCanisters: {
    [key: CanisterKey]: [InterfaceFactory, CanisterId];
} = {};

// Object storing registered canisters.
const RegisteredFactories: { [key: FactoryKey]: InterfaceFactory } = {};

// Object storing registered agents.
const RegisteredAgents: { [key: AgentKey]: DfAgent } = {};

///////////////////
// Internal API //
/////////////////

// Internal function to create a new actor.
// Some wallets may not directly expose an agent that we can use to create actors (plug).
function create(
    factory: InterfaceFactory,
    canisterId: string,
    agent?: DfAgent
): ActorSubclass<unknown> {
    // NOTE: window?.ic?.plug.isConnected() ? window?.ic?.plug.createActor :
    return Actor.createActor(factory, {
        canisterId,
        ...Conf,
        agent: agent || defaultAgent,
    });
}

// Get existing actor, create if none.
function getOrCreate<T>(
    actor: ActorKey,
    canister?: Canister,
    agent?: Agent
): ActorSubclass<unknown> | undefined {
    // Retrieve existing actor.
    if (actor in Actors) {
        const existing = Actors[actor];
        // Error if the user has passed overloads that don't match the existing actor.
        if (canister) {
            const [factory, id] = unpackCanister(canister);
            const _id = Actor.canisterIdOf(existing);
            const _factory = Actor.interfaceOf(existing);
            if (_id !== Principal.fromText(id)) {
                throw new Error(
                    `Bad call! Provided canister ID "${id}" differs from existing actor "${actor}" canister ID "${_id}".`
                );
            }
            // NOTE: Not sure how I might compare factories
            // if (_factory !== factory) {}
        }
        return existing;
    }
    // Create a new actor.
    if (canister) {
        Actors[actor] = create(...unpackCanister(canister), unpackAgent(agent));
        return Actors[actor];
    }
    console.warn(`No actor "${actor}" found and no creation values provided.`);
}

// Unpack a Canister type into a factory and an ID. Error on failed lookup.
function unpackCanister(canister: Canister): [InterfaceFactory, CanisterId] {
    // Lookup canister if it uses a key.
    if (typeof canister === 'string') {
        if (canister in RegisteredCanisters) {
            return RegisteredCanisters[canister];
        } else {
            throw new Error(`Reference to unknown canister "${canister}"`);
        }
    }
    if (canister.length === 3) {
        // Return ready-to-go interface factory and canister id, unwrapping the factory.
        const [key, factory, id] = canister;
        RegisteredCanisters[key] = [unpackFactory(factory), id];
        return RegisteredCanisters[key];
    }
    // Return ready-to-go interface factory and canister id, unwrapping the factory.
    const [factory, id] = canister;
    return [unpackFactory(factory), id];
}

// Unpack a Factory type (key or factory) into an interface factory. Error on failed lookup.
function unpackFactory(factory: Factory): InterfaceFactory {
    // Lookup factory if it uses a key.
    if (typeof factory === 'string') {
        if (factory in RegisteredFactories) {
            return RegisteredFactories[factory];
        } else {
            throw new Error(`Reference to unknown factory "${factory}"`);
        }
    }
    if (Array.isArray(factory)) {
        const [key, _factory] = factory;
        RegisteredFactories[key] = _factory;
        return _factory;
    }
    return factory;
}

// Unpack a Agent type into a @dfinity/agent.Agent. Error on failed lookup.
function unpackAgent(agent?: Agent): DfAgent | undefined {
    // Lookup agent if it uses a key.
    if (typeof agent === 'string') {
        if (agent in RegisteredAgents) {
            return RegisteredAgents[agent];
        } else {
            throw new Error(`Reference to unknown agent "${agent}"`);
        }
    }
    if (Array.isArray(agent)) {
        const [key, _agent] = agent;
        RegisteredAgents[key] = _agent;
        return _agent;
    }
    return agent;
}

/////////////////
// Public API //
///////////////

// Get an actor
export function actor<T>(
    actor: ActorKey,
    canister?: Canister,
    agent?: Agent
): ActorSubclass<T> {
    // TODO: differentiate on identities
    return getOrCreate(actor, canister, agent) as ActorSubclass<T>;
}

// Utility displaying all registered factories.
export function listFactories(): FactoryKey[] {
    return Object.keys(RegisteredFactories);
}

// Utility displaying all registered canisters.
export function listCanisters(): CanisterKey[] {
    return Object.keys(RegisteredCanisters);
}

// Utility displaying all registered identities.
export function listIdentities(): AgentKey[] {
    return Object.keys(RegisteredAgents);
}

// Utility displaying all initialized actors.
export function listActors(): ActorKey[] {
    return Object.keys(Actors);
}

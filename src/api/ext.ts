// Generic API for EXT standard NFTs

import { decodeTokenIdentifier } from 'ictool';
import { useQuery } from 'react-query';
import { legend } from './actors';
import { unpackResult } from './.common';

////////////
// Types //
//////////

// ...
export interface SomeType {}

//////////////
// Mapping //
////////////

// ...
function mapSomething(input: any): SomeType {
    return {};
}

///////////////
// Fetching //
/////////////

// Retrieve owner of specific NFT.
async function fetchOwner(token: string): Promise<string> {
    const { canister, index } = decodeTokenIdentifier(token);
    try {
        return unpackResult(await legend(canister).bearer(token));
    } catch {
        throw new Error(`Failed to fetch owner of token ${token}`);
    }
}

////////////
// Hooks //
//////////

// Hook to retrieve something.
export function useOwner(token: string) {
    return useQuery<string>(`bearer-${token}`, () => fetchOwner(token), {
        cacheTime: 60_000 * 60 * 24 * 7,
        staleTime: 60_000,
    });
}

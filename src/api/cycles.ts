// Querying the cycles minting canister.

import { IcpXdrConversionResponse } from 'canisters/cycles/cycles.did.d';
import { useQuery } from 'react-query';
import { cycles } from './actors';

////////////
// Types //
//////////

// ...
export interface SomeType {}

//////////////
// Mapping //
////////////

// Map ICP -> XDR conversion rate response into 1 normalized float.
function mapIcpXdrConversion(input: IcpXdrConversionResponse): number {
    return Number(input.data.xdr_permyriad_per_icp) / 10_000;
}

// Map currconv.com api response to normalized float

///////////////
// Fetching //
/////////////

// Retrieve the conversion rate of cycles to XDR.
async function fetchCyclesToXdr() {
    // Get ICP to USD exchange rate
    return cycles.get_icp_xdr_conversion_rate().then(mapIcpXdrConversion);
}

// Retrieve conversion rate of XDR to USD.
async function fetchXdrToUsd() {
    return fetch(
        'https://free.currconv.com/api/v7/convert?q=XDR_USD&compact=ultra&apiKey=df6440fc0578491bb13eb2088c4f60c7'
    )
        .then(r => r.json())
        .then(r => (r.hasOwnProperty('XDR_USD') ? r.XDR_USD : 1.4023));
}

////////////
// Hooks //
//////////

// Hook to retrieve conversion rate from ICP to USD.
export function useIcpToUsd() {
    return useQuery<number>(
        `icp-to-usd`,
        async () => {
            const cyclesToXdr = await fetchCyclesToXdr();
            const xdrToUsd = await fetchXdrToUsd();
            return cyclesToXdr * xdrToUsd;
        },
        {
            cacheTime: 60_000 * 60 * 24 * 365,
            staleTime: 60_000 * 20,
        }
    );
}

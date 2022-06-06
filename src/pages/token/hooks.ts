import React from 'react';
import { useSupply } from 'api/legends';
import { encodeTokenIdentifier } from 'ictool';

// Handle overflow in determining the next and previous items in a collection.
export function useBackNext(canister: string, index: number) {
    const { data: supply } = useSupply(canister);
    const wrap = React.useMemo(
        () => (i: number) =>
            !supply ? undefined : i < 0 ? supply - 1 : i >= supply ? 0 : i,
        [supply]
    );
    const back = React.useMemo(() => wrap(index - 1), [supply, index]);
    const next = React.useMemo(() => wrap(index + 1), [supply, index]);
    return {
        back: back !== undefined && encodeTokenIdentifier(canister, back),
        next: next !== undefined && encodeTokenIdentifier(canister, next),
    };
}

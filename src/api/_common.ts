import { Principal } from '@dfinity/principal';
import { DateTime } from 'luxon';

////////////
// Types //
//////////

// Principal in string form. Principals break when put in local storage, probably some solveable serialization issue.
export type CanisterId = string;

//////////////
// Mapping //
////////////

// Suite of functions mapping canister data into idiomatic typescript.

// Canister dates are BigInts with 6 extra digits.
export function mapDate(candid: bigint): DateTime {
    const millis = Number(candid) / 10 ** 6;
    const date = DateTime.fromMillis(millis, {
        zone: 'America/Vancouver',
    });
    return date;
}

// Canisters often return ICP amounts in such a way.

export interface ICP8s {
    e8s: number;
}

export function mapToken(candid: { e8s: bigint }): ICP8s {
    return { e8s: Number(candid.e8s) };
}

///////////
// Util //
/////////

export function asPrincipal(principal: string | Principal): Principal {
    if (typeof principal === 'string') {
        return Principal.fromText(principal);
    }
    return principal;
}

// Adds a discriminated union field to canister result types.
export function typeResult<T, U>(
    result: { ok: T } | { err: U }
): { status: 'ok'; ok: T } | { status: 'err'; err: U } {
    return 'ok' in result
        ? {
              status: 'ok',
              ...(result as { ok: T }),
          }
        : {
              status: 'err',
              ...(result as { err: U }),
          };
}

export function unpackResult<T, U>(result: { ok: T } | { err: U }): T {
    const r = typeResult(result);
    switch (r.status) {
        case 'ok':
            return r.ok;
        case 'err':
            throw new Error(`Error from canister: ${r.err}`);
    }
}

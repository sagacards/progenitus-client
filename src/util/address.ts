import { Principal } from '@dfinity/principal';
import { sha224 } from '@dfinity/principal/lib/esm/utils/sha224';
import { getCrc32 } from '@dfinity/principal/lib/esm/utils/getCrc';
import { to32bits, toHexString } from './bits';

export class Address {

    static fromPrincipal(
        principal: Principal,
        subaccount: number | number[],
    ) : number[] {
        const padding = Buffer.from("\x0Aaccount-id");
        const array = new Uint8Array([
            ...padding,
            ...principal.toUint8Array(),
            ...getSubAccountArray(subaccount)
        ]);
        const hash = sha224(array);
        const checksum = to32bits(getCrc32(hash));
        return [
            ...checksum,
            ...hash,
        ];
    };

    static toHex (
        bytes : number[],
    ) : string {
        return toHexString(bytes);
    }

};

function getSubAccountArray(
    subaccount: number | number[]
) {
    if (Array.isArray(subaccount)) {
        return subaccount.concat(Array(32 - subaccount.length).fill(0));
    } else {
        return Array(28).fill(0).concat(to32bits(subaccount ? subaccount : 0))
    }
};
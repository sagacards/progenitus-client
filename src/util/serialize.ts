// JSON serialization support for Luxon, Principal, etc.

import { Principal } from '@dfinity/principal';
import { DateTime } from 'luxon';

// Prevent default DateTime string serialization
// @ts-ignore
DateTime.prototype.toJSON = undefined;

export function serialize(value: any): string {
    let v = value;

    // Serialize Date
    if (Object.prototype.toString.call(value) === '[object Date]') {
        v = {
            isJsDate: true,
            value: value,
        };
    }

    return JSON.stringify(v, (key, value) => {
        // Serialize Principal
        if (value?._isPrincipal) {
            return {
                _isPrincipal: true,
                value: value.toText(),
            };
        }

        // Serialize DateTime
        if (value?.isLuxonDateTime) {
            return {
                isLuxonDateTime: true,
                value: value.toISO(),
            };
        }

        return value;
    });
}

export function deserialize(text: string) {
    return JSON.parse(text, (key, value) => {
        // Deserialize Principal
        if (value?._isPrincipal) {
            return Principal.fromText(value.value);
        }

        // Deserialize DateTime
        if (value?.isLuxonDateTime) {
            return DateTime.fromISO(value.value);
        }

        // Deserialize Date
        if (value?.isJsDate) {
            return new Date(value.value);
        }

        return value;
    });
}

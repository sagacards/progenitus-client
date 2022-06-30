import { serialize, deserialize } from './serialize';
import { DateTime } from 'luxon';

const t = DateTime.now();
const tSerialized = serialize(t);
const tDeserialized = deserialize(tSerialized);

test('luxon date time serializes to string', () => {
    expect(typeof tSerialized).toBe('string');
});

test('luxon date time serializes to json object with identifier', () => {
    expect('isLuxonDateTime' in JSON.parse(tSerialized)).toBeTruthy();
});

test('luxon date time deserializes', () => {
    expect('isLuxonDateTime' in tDeserialized).toBeTruthy();
});

const d = new Date();
const dSerialized = serialize(d);
const dDeserialized = deserialize(dSerialized);

test('js date serializes to json object with identifier', () => {
    expect('isJsDate' in JSON.parse(dSerialized)).toBeTruthy();
});

test('js date deserializes', () => {
    expect(typeof dDeserialized.getTime()).toBe('number');
});

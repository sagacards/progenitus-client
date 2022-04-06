import type { Principal } from '@dfinity/principal';
export type Access = { 'Private' : StableAllowlist } |
  { 'Public' : null };
export interface CollectionDetails {
  'descriptionMarkdownUrl' : string,
  'iconImageUrl' : string,
  'bannerImageUrl' : string,
  'previewImageUrl' : string,
}
export interface Data {
  'startsAt' : Time,
  'name' : EventName,
  'description' : string,
  'accessType' : Access,
  'details' : CollectionDetails,
  'price' : Tokens,
  'endsAt' : Time,
}
export type EventName = string;
export type MintError = { 'NoneAvailable' : null } |
  { 'TryCatchTrap' : null };
export interface MockNFT {
  'launchpadEventCreate' : (arg_0: Data) => Promise<bigint>,
  'launchpadEventUpdate' : (arg_0: bigint, arg_1: Data) => Promise<undefined>,
  'launchpadMint' : (arg_0: Principal) => Promise<Result>,
  'launchpadTotalAvailable' : (arg_0: bigint) => Promise<bigint>,
}
export type Result = { 'ok' : bigint } |
  { 'err' : MintError };
export type StableAllowlist = Array<[Principal, [] | [bigint]]>;
export type Time = bigint;
export interface Tokens { 'e8s' : bigint }
export interface _SERVICE extends MockNFT {}

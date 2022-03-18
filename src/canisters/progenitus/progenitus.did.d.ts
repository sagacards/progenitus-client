import type { Principal } from '@dfinity/principal';
export type AccountIdentifier = Array<number>;
export type BlockIndex = bigint;
export interface Rex {
  'addAdmin' : (arg_0: Principal) => Promise<undefined>,
  'balance' : () => Promise<Tokens>,
  'getAdmins' : () => Promise<Array<Principal>>,
  'getPersonalAccount' : () => Promise<AccountIdentifier>,
  'getPrice' : () => Promise<Tokens>,
  'removeAdmin' : (arg_0: Principal) => Promise<undefined>,
  'setPrice' : (arg_0: Tokens) => Promise<undefined>,
  'syncAvailableTokens' : () => Promise<undefined>,
  'transfer' : (arg_0: Tokens, arg_1: AccountIdentifier) => Promise<
      TransferResult
    >,
}
export interface Tokens { 'e8s' : bigint }
export type TransferError = {
    'TxTooOld' : { 'allowed_window_nanos' : bigint }
  } |
  { 'BadFee' : { 'expected_fee' : Tokens } } |
  { 'TxDuplicate' : { 'duplicate_of' : BlockIndex } } |
  { 'TxCreatedInFuture' : null } |
  { 'InsufficientFunds' : { 'balance' : Tokens } };
export type TransferResult = { 'Ok' : BlockIndex } |
  { 'Err' : TransferError };
export interface _SERVICE extends Rex {}

export const idlFactory = ({ IDL }) => {
  const Tokens = IDL.Record({ 'e8s' : IDL.Nat64 });
  const AccountIdentifier = IDL.Vec(IDL.Nat8);
  const BlockIndex = IDL.Nat64;
  const TransferError = IDL.Variant({
    'TxTooOld' : IDL.Record({ 'allowed_window_nanos' : IDL.Nat64 }),
    'BadFee' : IDL.Record({ 'expected_fee' : Tokens }),
    'TxDuplicate' : IDL.Record({ 'duplicate_of' : BlockIndex }),
    'TxCreatedInFuture' : IDL.Null,
    'InsufficientFunds' : IDL.Record({ 'balance' : Tokens }),
  });
  const TransferResult = IDL.Variant({
    'Ok' : BlockIndex,
    'Err' : TransferError,
  });
  const Rex = IDL.Service({
    'addAdmin' : IDL.Func([IDL.Principal], [], ['oneway']),
    'balance' : IDL.Func([], [Tokens], []),
    'getAdmins' : IDL.Func([], [IDL.Vec(IDL.Principal)], ['query']),
    'getPersonalAccount' : IDL.Func([], [AccountIdentifier], ['query']),
    'getPrice' : IDL.Func([], [Tokens], ['query']),
    'removeAdmin' : IDL.Func([IDL.Principal], [], ['oneway']),
    'setPrice' : IDL.Func([Tokens], [], ['oneway']),
    'syncAvailableTokens' : IDL.Func([], [], ['oneway']),
    'transfer' : IDL.Func([Tokens, AccountIdentifier], [TransferResult], []),
  });
  return Rex;
};
export const init = ({ IDL }) => { return [IDL.Text, IDL.Text]; };

export const idlFactory = ({ IDL }) => {
  const Tokens = IDL.Record({ 'e8s' : IDL.Nat64 });
  const Time = IDL.Int;
  const EventName = IDL.Text;
  const StableAllowlist = IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Opt(IDL.Int)));
  const Access = IDL.Variant({
    'Private' : StableAllowlist,
    'Public' : IDL.Null,
  });
  const CollectionDetails = IDL.Record({
    'descriptionMarkdownUrl' : IDL.Text,
    'iconImageUrl' : IDL.Text,
    'bannerImageUrl' : IDL.Text,
    'previewImageUrl' : IDL.Text,
  });
  const Data = IDL.Record({
    'startsAt' : Time,
    'name' : EventName,
    'description' : IDL.Text,
    'accessType' : Access,
    'details' : CollectionDetails,
    'price' : Tokens,
    'endsAt' : Time,
  });
  const Events = IDL.Vec(IDL.Tuple(IDL.Principal, Data));
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
    'createEvent' : IDL.Func([Data], [IDL.Nat], []),
    'getAdmins' : IDL.Func([], [IDL.Vec(IDL.Principal)], ['query']),
    'getAllEvents' : IDL.Func([], [Events], ['query']),
    'getAllowlistSpots' : IDL.Func(
        [IDL.Principal, IDL.Nat],
        [IDL.Opt(IDL.Int)],
        ['query'],
      ),
    'getEvent' : IDL.Func([IDL.Principal, IDL.Nat], [IDL.Opt(Data)], ['query']),
    'getEvents' : IDL.Func([IDL.Vec(IDL.Principal)], [Events], ['query']),
    'getEventsOfToken' : IDL.Func([IDL.Principal], [IDL.Vec(Data)], ['query']),
    'getOwnEvents' : IDL.Func([], [IDL.Vec(Data)], ['query']),
    'getPersonalAccount' : IDL.Func([], [AccountIdentifier], ['query']),
    'getPrice' : IDL.Func([], [Tokens], ['query']),
    'mint' : IDL.Func([IDL.Principal, IDL.Nat], [IDL.Nat], []),
    'removeAdmin' : IDL.Func([IDL.Principal], [], ['oneway']),
    'setPrice' : IDL.Func([Tokens], [], ['oneway']),
    'transfer' : IDL.Func([Tokens, AccountIdentifier], [TransferResult], []),
    'updateEvent' : IDL.Func([IDL.Nat, Data], [], []),
  });
  return Rex;
};
export const init = ({ IDL }) => { return [IDL.Text]; };

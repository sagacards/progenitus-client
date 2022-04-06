export const idlFactory = ({ IDL }) => {
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
  const Tokens = IDL.Record({ 'e8s' : IDL.Nat64 });
  const Data = IDL.Record({
    'startsAt' : Time,
    'name' : EventName,
    'description' : IDL.Text,
    'accessType' : Access,
    'details' : CollectionDetails,
    'price' : Tokens,
    'endsAt' : Time,
  });
  const MintError = IDL.Variant({
    'NoneAvailable' : IDL.Null,
    'TryCatchTrap' : IDL.Null,
  });
  const Result = IDL.Variant({ 'ok' : IDL.Nat, 'err' : MintError });
  const MockNFT = IDL.Service({
    'launchpadEventCreate' : IDL.Func([Data], [IDL.Nat], []),
    'launchpadEventUpdate' : IDL.Func([IDL.Nat, Data], [], []),
    'launchpadMint' : IDL.Func([IDL.Principal], [Result], []),
    'launchpadTotalAvailable' : IDL.Func([IDL.Nat], [IDL.Nat], ['query']),
  });
  return MockNFT;
};
export const init = ({ IDL }) => { return [IDL.Text]; };

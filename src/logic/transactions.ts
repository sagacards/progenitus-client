

/* 
Basically a straight rip from cap explorer, except I mutate time on each transaction into a date and throw out any transactions that don't have time on them.
Might be worth including this in the cap-js lib because it's so useful.
*/


import { Event as TransactionEvent, } from '@psychedelic/cap-js';
import { prettifyCapTransactions } from '@psychedelic/cap-js'
import { Principal } from '@dfinity/principal';
import { decodeTokenIdentifier } from 'ictool';

export default {};

export interface Price {
  value: number,
  currency: string,
  decimals: number,
};

export interface Transaction extends Omit<TransactionEvent, 'to' | 'from' | 'caller' | 'operation' | 'time'> {
  item: number,
  to: string;
  from: string;
  caller: string;
  operation: string;
  time: Date;
  token: string;
  price: Price;
}

export const toTransactionTime = (time: bigint) => {
  if (typeof time !== 'bigint') return;

  let ISOString;

  try {
    ISOString = new Date(Number(time))?.toISOString();
  } catch (err) {
    console.warn(err);
    return;
  };

  return ISOString;
}

type TransactionDetails = {
  from: Principal | string;
  to: Principal | string;
  token?: string;
  tokenId?: string;
  token_id?: string;
  price?: bigint;
  price_decimals?: bigint;
  price_currency?: string;
}

type TokenField = 'token' | 'token_id' | 'tokenId';
type TokenFields = TokenField[];

export const parseGetTransactionsResponse = ({
  data,
}: {
  data?: TransactionEvent[],
}): Transaction[] | [] => {
  if (!data || !Array.isArray(data) || !data.length) return [];

  return data.reduce<Transaction[]>((agg, transaction) => {
    if (transaction.time === undefined) {
      // Filter out transaction without a timestamp.
      return agg;
    }
    // Sometimes we get more digits than we want.
    let t = Number(transaction.time);
    while (t > 9999999999999) {
      t = t / 10;
    }
    const { details } = prettifyCapTransactions(transaction) as unknown as { details: TransactionDetails };

    // TODO: validate details

    // TODO: To remove "possible fields" as the Token Standard field is now available!
    // TODO: there are no conventions on naming fields
    // so, for the moment will check for matching token
    const possibleFields: TokenFields = ['token', 'token_id', 'tokenId'];
    const tokenField = possibleFields.find((field) => details[field]);

    if (!tokenField) return agg;

    const itemHandler = (details: TransactionDetails, tokenField: TokenField) => {
      let tokenIndex: number | undefined;

      if (typeof details?.token_id === 'bigint') {
        return details.token_id;
      }

      try {
        const tokenIdText = details[tokenField];

        if (!tokenIdText) throw Error('Oops! Token field not found');

        const { index } = decodeTokenIdentifier(tokenIdText);
        tokenIndex = index;

        if (!tokenIndex) throw Error('Oops! Not a valid tokenIndex');
      } catch (err) {
        // console.warn(err);
      }

      return tokenIndex;
    };

    return [
      ...agg,
      {
        ...transaction,
        item: tokenField
          ? itemHandler(
            details,
            tokenField,
          )
          : undefined,
        to: details?.to?.toString(),
        from: details?.from?.toString(),
        price: {
          value: Number(details?.price),
          currency: details?.price_currency,
          decimals: Number(details?.price_decimals),
        },
        token: tokenField && details[tokenField],
        operation: transaction.operation,
        time: new Date(t),
      }
    ]
  }, [])
    // Reverse the order
    // because the natural order that the data is presented
    // from the response, is at the very top
    // showing the oldest transaction in the page
    .sort((a, b) => b.time.getTime() - a.time.getTime());
}

export function priceDisplay ({ decimals, value, currency }: Transaction['price'], ticker = true) {
  return `${(value / 10 ** decimals).toFixed(2)} ${ticker ? currency : ''}`;
}
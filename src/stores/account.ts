// A slice of the Bazaar store handling the user's minting account.

import axios from 'axios';
import {
    principalToAddress,
    principalToAddressBytes,
    fromHexString,
} from 'ictool';
import { CompleteStore, StoreSlice } from '.';
import { ICP8s } from './connect';
import useMessageStore from './messages';

// Rosetta API Config
const rosetta = 'https://rosetta-api.internetcomputer.org';

function rosettaData(account: string) {
    return {
        network_identifier: {
            blockchain: 'Internet Computer',
            network: '00000000000000020101',
        },
        account_identifier: {
            address: account,
        },
    };
}

export interface AccountStore {
    address?: string;
    balance?: ICP8s;
    fetchBalance: () => void;
    deposit: (a: number) => Promise<void>;
    withdraw: (a: number) => Promise<void>;
    balanceDisplay: () => number | undefined;
}

export const createAccountSlice: StoreSlice<AccountStore, CompleteStore> = (
    set,
    get
) => ({
    fetchBalance() {
        const { address, principal } = get();
        if (!address || !principal) return;
        axios
            .post(`${rosetta}/account/balance`, rosettaData(address))
            .then(r => {
                set({ balance: { e8s: parseInt(r.data.balances[0].value) } });
            });
        axios
            .post(
                `${rosetta}/account/balance`,
                rosettaData(principalToAddress(principal))
            )
            .then(r => {
                set({
                    walletBalance: { e8s: parseInt(r.data.balances[0].value) },
                });
            });
    },

    balanceDisplay() {
        const { balance } = get();
        if (balance) {
            return balance.e8s / 10 ** 8;
        } else {
            return undefined;
        }
    },

    async withdraw(amount: number) {
        const {
            actors: { bazaar },
            principal,
            fetchBalance,
        } = get();
        const { pushMessage } = useMessageStore();

        if (!principal || !bazaar) return;

        const address = Object.values(
            principalToAddressBytes(principal, 0)
        ) as number[];

        return bazaar
            .transfer({ e8s: BigInt(amount.toFixed()) }, address)
            .catch(e => {
                console.error(e);
                pushMessage({ type: 'error', message: 'Transfer failed!' });
            })
            .then(r => {
                if (r && 'Err' in r) {
                    pushMessage({
                        type: 'error',
                        message: Object.keys(r.Err)[0],
                    });
                } else {
                    setTimeout(fetchBalance, 1000);
                }
            });
    },

    async deposit(amount: number) {
        const { address, wallet } = get();

        if (!address || !wallet) return;

        async function transferPlug(amount: number, to: string) {
            return window.ic?.plug
                ?.requestTransfer({ to, amount })
                .catch(e => {
                    console.error(e);
                    alert('Transfer failed!');
                })
                .then(() => void setTimeout(get().fetchBalance, 1000));
        }

        async function transferStoic(amount: number, to: string) {
            const {
                actors: { nns },
            } = get();
            if (!nns) return;
            return nns
                .transfer({
                    to: fromHexString(to),
                    amount: { e8s: BigInt(amount.toFixed()) },
                    memo: BigInt(0),
                    fee: { e8s: BigInt(10_000) },
                    from_subaccount: [],
                    created_at_time: [],
                })
                .catch(e => {
                    console.error(e);
                    alert('Transfer failed!');
                })
                .then(r => {
                    if (r && 'Err' in r) {
                        alert(Object.keys(r.Err)[0]);
                    } else {
                        setTimeout(get().fetchBalance, 1000);
                    }
                });
        }

        if (wallet === 'stoic') {
            return transferStoic(amount, address);
        } else {
            return transferPlug(amount, address);
        }
    },
});

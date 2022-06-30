// Transfering ICP.

import { useMutation } from 'react-query';
import { nns } from 'api/actors';
import { fromHexString } from 'ictool';
import { ICP8s, Wallet } from 'stores/connect';
import { unpackResult } from './.common';

export interface TransferRequest {
    wallet: Wallet;
    amount: ICP8s;
    to: string;
}

export function transfer(wallet: Wallet, amount: ICP8s, to: string) {
    switch (wallet) {
        case 'plug':
            return plugTransferICP(amount, to);
        case 'stoic':
            return stoicTransferICP(amount, to);
    }
    throw new Error(`Can't transfer using wallet ${wallet}`);
}

export async function stoicTransferICP(amount: ICP8s, to: string) {
    if (!nns)
        throw new Error(
            'Unreachable: NNS actor unavailable for stoic transfer'
        );
    return nns
        .transfer({
            to: fromHexString(to),
            amount: { e8s: BigInt(amount.e8s.toFixed()) },
            memo: BigInt(0),
            fee: { e8s: BigInt(10_000) },
            from_subaccount: [],
            created_at_time: [],
        })
        .then(r => Number(unpackResult(r)))
        .catch(e => {
            console.error(e);
            alert('Transfer failed!');
        });
}

export async function plugTransferICP(amount: ICP8s, to: string) {
    if (!window.ic?.plug?.requestTransfer) {
        throw new Error(`Can't perform Plug transfer at this time.`);
    }
    return window.ic.plug
        .requestTransfer({ to, amount: amount.e8s })
        .then(r => r.height)
        .catch(e => {
            console.error(e);
            alert('Transfer failed!');
        });
}

// TODO: Would be nice to have some idempotence insurance here.
export function useTransfer() {
    return useMutation<number | void, void, TransferRequest, unknown>({
        mutationFn: ({ wallet, amount, to }) => transfer(wallet, amount, to),
        onSuccess() {
            // TODO: Invalidate balance query
        },
    });
}

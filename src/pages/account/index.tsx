import Styles from './styles.module.css'
import React from 'react';
import axios from 'axios'
import Navbar from 'ui/navbar';
import Footer from 'ui/footer';
import Container from 'ui/container';
import Button from 'ui/button';
import Hash from 'ui/hash';
import useStore from 'stores/index';
import { Navigate } from 'react-router-dom';
import WalletIcon from 'ui/wallet-icon';
import Swap from 'ui/swap';

interface Props { };

interface Transaction {
    id: string;
    from: string;
    to: string;
    amount: string;
    timestamp: Date;
    operation: string;
};

export default function AccountPage(props: Props) {

    const { balance, balanceDisplay, fetchBalance, disconnect, connected, address, principal, } = useStore();
    React.useEffect(() => {
        fetchBalance();
    }, []);

    const Rosetta = 'https://rosetta-api.internetcomputer.org';
    const data = {
        "network_identifier": {
            "blockchain": "Internet Computer",
            "network": "00000000000000020101",
        },
        "account_identifier": {
            "address": address,
        },
    };

    const [txs, setTxs] = React.useState<Transaction[]>([]);
    const [perPage, setPerPage] = React.useState<number>(25);
    const [pageIndex, setPageIndex] = React.useState<number>(0);
    const pageCount = React.useMemo(() => Math.ceil(txs.length / perPage), [txs, perPage]);
    const page = React.useMemo(() => txs.slice(pageIndex * perPage, pageIndex * perPage + perPage), [txs, perPage, pageIndex]);

    // Fetch transactions from rosetta
    React.useEffect(() => {
        if (!address) return;
        axios.post(`${Rosetta}/search/transactions`, data)
            .then(r => {
                setTxs(r.data.transactions
                    .map((x: any) => {
                        return {
                            id: x.transaction.transaction_identifier.hash,
                            operation: x.transaction.operations[0].account.address === address ? 'Withdrawal' : 'Deposit',
                            from: x.transaction.operations[0].account.address,
                            to: x.transaction.operations[1].account.address,
                            amount: (parseFloat(x.transaction.operations[1].amount.value) / 10 ** 8).toFixed(2),
                            timestamp: new Date(x.transaction.metadata.timestamp / 1000000),
                        }
                    })
                    .sort((a: Transaction, b: Transaction) => b.timestamp.getTime() - a.timestamp.getTime())
                );
            })
    }, [address, balance]);

    const columns = React.useMemo(() => [
        {
            accessor: 'id',
            Header: 'Tx',
            Cell: ({ v } : { v : Transaction['id']}) => <Hash>{v}</Hash>
        },
        {
            accessor: 'operation',
            Header: 'Operation',
            Cell: ({ v } : { v : Transaction['operation']}) => <>{v}</>
        },
        {
            accessor: 'amount',
            Header: 'Amount',
            Cell: ({ v } : { v : Transaction['amount']}) => <>{v} <small>ICP</small></>
        },
        {
            accessor: 'from',
            Header: 'From',
            Cell: ({ v } : { v : Transaction['from']}) => <Hash>{v}</Hash>
        },
        {
            accessor: 'to',
            Header: 'To',
            Cell: ({ v } : { v : Transaction['to']}) => <Hash>{v}</Hash>
        },
        {
            accessor: 'timestamp',
            Header: 'Timestamp',
            Cell: ({ v } : { v : Transaction['timestamp']}) => <>{v.toLocaleString()}</>
        },
    ], []);

    function nextPage () {
        setPageIndex(Math.min(pageIndex + 1, pageCount - 1));
    };

    function prevPage () {
        setPageIndex(Math.max(pageIndex - 1, 0));
    };

    const pagination = <div className={Styles.pagination}>
        <div>{pageIndex + 1} / {pageCount}</div>
        {pageIndex < pageCount - 1 && <div onClick={nextPage}>Next</div>}
        {pageIndex > 0 && <div onClick={prevPage}>Prev</div>}
    </div>;

    if (!connected) return <Navigate to="/" />

    return <>
        <Navbar />
        <Container>
            <div className={Styles.root}>
                <div className={Styles.top}>
                    <h1 className="page-title">Account</h1>
                </div>
                <div className={Styles.body}>
                    <div className={Styles.aside}>
                        <div className={Styles.asideCard}>
                            <div className={Styles.asideGroup}>
                                <div className={Styles.asideLabel}>Wallet</div>
                                <div className={Styles.asideRow}>
                                    <WalletIcon size='small' />
                                    <Hash>{principal?.toText()}</Hash>
                                    <Button size='small' onClick={disconnect}>Disconnect</Button>
                                </div>
                            </div>
                            <div className={Styles.asideGroup}>
                                <div className={Styles.asideLabel}>Minting Account</div>
                                <div className={Styles.asideRow}>
                                    <Hash>{address}</Hash>
                                    <small>Use for minting events, move funds freely</small>
                                </div>
                            </div>
                            <div className={Styles.asideGroup}>
                                <div className={Styles.asideLabel}>Balance</div>
                                <div className={Styles.asideRow}>
                                    <div>
                                        {balanceDisplay()?.toFixed(2)} <span>ICP</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Swap />
                    </div>
                    <div className={Styles.main}>
                        <div>
                            <div className={Styles.paginationHead}>
                                <h2 className={Styles.subtitle}>Transaction History</h2>
                                {pagination}
                            </div>
                            <table className={Styles.txTable}>
                                <thead>
                                    <tr className={Styles.txTr}>
                                        {columns.map(({ accessor, Header }) => <th
                                            key={`th${accessor}`}
                                            children={Header}
                                        />)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {page.map(tx => <tr key={`tx${tx.id}`} className={Styles.txTr}>
                                        {columns.map(({ accessor, Cell }) => <td key={`td${tx.id}${accessor}`} className={Styles.txTd}>
                                            {/* @ts-ignore */}
                                            <Cell v={tx[accessor]} />
                                        </td>)}
                                    </tr>)}
                                </tbody>
                            </table>
                            {pagination}
                        </div>
                    </div>
                </div>
            </div>
        </Container>
        {/* <Footer /> */}
    </>
};
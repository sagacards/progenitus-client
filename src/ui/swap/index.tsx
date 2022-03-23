import React from 'react'
import useStore from 'stores/index';
import Button from 'ui/button';
import Hash from 'ui/hash';
import Spinner from 'ui/spinner';
import WalletIcon from 'ui/wallet-icon';
import Styles from './styles.module.css'
import { FaArrowDown } from 'react-icons/fa'

interface Props {
    children?: React.ReactNode;
}

export default function Swap (props : Props) {

    const { principal, pushMessage, deposit, withdraw } = useStore()

    const [active, setActive] = React.useState<'deposit' | 'withdraw'>('deposit');
    const [amount, setAmount] = React.useState<string>('0');
    const [loading, setLoading] = React.useState<boolean>(false);

    return <div className={[Styles.root, Styles[active]].join(' ')}>
        <div className={Styles.top}>
            <div>
                <Switch
                    options={[
                        { label: 'Deposit', value: 'deposit' },
                        { label: 'Withdraw', value: 'withdraw' },
                    ]}
                    onChange={v => setActive(v as 'deposit' | 'withdraw')}
                    active={active}
                />
            </div>
            <div className={Styles.fee}>Fee: 0.0001 ICP</div>
        </div>
        <div className={Styles.inputGroup}>
            <input className={Styles.input} type="text" value={amount} onChange={v => setAmount(v.currentTarget.value)} />
            <div className={Styles.conversion}>~$0.00</div>
            <div className={Styles.currencyContainer}>
                <div className={Styles.currency}>ICP</div>
            </div>
        </div>
        <div className={Styles.arrow}>
            <FaArrowDown />
        </div>
        <div className={Styles.wallet}>
            <Hash icon={<WalletIcon />} size='large' alt>{principal}</Hash>
        </div>                
        <div className={Styles.actions}>
            <Button onClick={() => {
                setLoading(true);
                if (active === 'deposit') {
                    deposit(parseFloat(amount) * 10**8)
                    .finally(() => setLoading(false));
                } else {
                    withdraw(parseFloat(amount) * 10**8)
                    .finally(() => setLoading(false));
                };
            }}>{loading ? <Spinner size='small' /> : active}</Button>
        </div>
    </div>
}

interface SwitchProps {
    children?: React.ReactNode;
    options: { label: string, value: string }[];
    onChange: (v : string) => void; 
    active: string;
};

function Switch (props : SwitchProps) {
    return <div className={Styles.switch}>
        {props.options.map(option => <div
            key={`switch${option.value}`}
            className={[Styles.item, option.value === props.active ? Styles.active : ''].join(' ')}
            onClick={() => props.onChange(option.value)}
        >
            {option.label}
        </div>)}
    </div>
};
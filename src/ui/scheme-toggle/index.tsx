import React from 'react'
import useThemeStore from 'stores/theme';
import Button from 'ui/button';
import { MoonIcon, SunIcon } from 'ui/svgcons';
import Styles from './styles.module.css'

interface Props {};

export default function SchemeToggle (props: Props) {
    const { theme, setTheme } = useThemeStore();
    return <Button flush>
        <div className={[Styles.root, Styles[theme]].join(' ')} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            <PlaneSwitcher
                toggle={theme === 'light'}
                a={<SunIcon />}
                b={<MoonIcon />}
            />
        </div>
    </Button>
};

interface SwitcherProps {
    children?: React.ReactNode;
    width?: number;
    height?: number;
    a?: React.ReactNode;
    b?: React.ReactNode;
    toggle: boolean;
}

export function PlaneSwitcher ({
    a,
    b,
    toggle,
} : SwitcherProps) {
    return <div className={[Styles.switcher, toggle ? Styles.switch : ''].join(' ')}>
        <div className={Styles.a}>{a}</div>
        <div className={Styles.b}>{b}</div>
    </div>
}
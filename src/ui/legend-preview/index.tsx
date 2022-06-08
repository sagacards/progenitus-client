import { Link } from 'react-router-dom';
import Styles from './styles.module.css'

interface Props {
    title: string;
    flavour: string;
    featured: boolean;
    image: string;
    canister?: string;
};

export default function LegendPreview(props: Props) {
    return <div className={Styles.root}>
        <Link className={`no-fancy ${Styles.body}`} to={`/collection/${props?.canister}`}>
            <div className={Styles.title}>{props.title}</div>
            <div className={Styles.flavour}>{props.flavour}</div>
        </Link>
        <img className={Styles.image} src={props.image} />
    </div>
};

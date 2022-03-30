import Styles from './styles.module.css'
import React from 'react';
import Navbar from 'ui/navbar';
import Footer from 'ui/footer';
import Container from 'ui/container';

import { Navigate, useParams } from 'react-router-dom';
import useStore from 'stores/index';

interface Props {};

export default function DropDetailPage (props : Props) {
    const { id } = useParams();
    const { getCollection, getEvent, pushMessage } = useStore();
    const supplyRemaining = undefined;
    const allowlistSpots = undefined;
    const event = React.useMemo(() => id ? getEvent(parseInt(id)) : undefined, []);
    
    if (!event) {
        console.log(event, id)
        pushMessage({
            type: 'error',
            message: 'Could not find that event.'
        });
        return <Navigate to="/" />
    }

    const collection = event.collection;
    
    return <>
        <Navbar />
        <Container>
            <div className={Styles.root}>
                <div className={Styles.top}>
                    <img className={Styles.banner} src={collection.banner} />
                    <img className={Styles.collection} src={collection.icon} />
                </div>
                <div className={Styles.name}>{collection.name}</div>
                <div className={Styles.description}>{collection.description}</div>
                <div className={Styles.stats}>
                    <div className={Styles.stat}>
                        <div className={Styles.statLabel}>Supply</div>
                        <div className={Styles.statValue}>{event.supply}</div>
                    </div>
                    <div className={Styles.stat}>
                        <div className={Styles.statLabel}>Remaining</div>
                        <div className={Styles.statValue}>{supplyRemaining}</div>
                    </div>
                    <div className={Styles.stat}>
                        <div className={Styles.statLabel}>Price</div>
                        <div className={Styles.statValue}>{event.price.e8s / 10 ** 8} ICP</div>
                    </div>
                    <div className={Styles.stat}>
                        <div className={Styles.statLabel}>Access</div>
                        <div className={Styles.statValue}>{event.access}</div>
                    </div>
                    <div className={Styles.stat}>
                        <div className={Styles.statLabel}>Allowlist</div>
                        <div className={Styles.statValue}>
                            {
                                allowlistSpots
                                ? <>{allowlistSpots} Mints</>
                                : <>No Access</>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </Container>
        <Footer />
    </>;
};
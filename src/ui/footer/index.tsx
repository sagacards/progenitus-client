import Styles from './styles.module.css'
import React from 'react'
import { FaInstagram, FaTwitter, FaDiscord } from 'react-icons/fa'
import Button from 'ui/button';

interface Props {
    children?: React.ReactNode;
}

export default function Footer (props : Props) {
    // https://posts.saga.cards/feed
    return <div className={Styles.root}>
        <div className={Styles.container}>
            <div className={Styles.section}>
                <div><strong>The Saga Tarot Network</strong></div>
                <div className={Styles.links}>
                    <div>
                        <a href="https://legends.saga.cards">Legends Series</a>
                    </div>
                    <div>
                        <a href="https://table.saga.cards">Tarot Table</a>
                    </div>
                    <div>
                        <a href="https://l2jyf-nqaaa-aaaah-qadha-cai.raw.ic0.app">Daily Single Card Draw</a>
                    </div>
                </div>
                <div>
                    <div className={Styles.socials}>
                            <a className={Styles.social} href="https://twitter.com/sagacards">
                        <Button size="large">
                                <FaTwitter />
                        </Button>
                            </a>
                            <a className={Styles.social} href="https://instagram.com/sagacards">
                        <Button size="large">
                                <FaInstagram />
                        </Button>
                            </a>
                            <a className={Styles.social} href="http://discord.gg/jNgjgvzCGC">
                        <Button size="large">
                                <FaDiscord />
                        </Button>
                            </a>
                    </div>
                </div>
            </div>
            <div className={Styles.foot}>
                <div>
                    Built with ❤️ on Internet Computer
                </div>
                <div>
                    <a href="https://github.com/sagacards/progenitus-client">Source</a>
                </div>
            </div>
        </div>
    </div>
}
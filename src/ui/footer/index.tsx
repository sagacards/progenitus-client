import Styles from './styles.module.css'
import React from 'react'
import { FaInstagram, FaTwitter, FaDiscord } from 'react-icons/fa'
import Button from 'ui/button';
import Feed from 'assets/feed.xml'

interface Props {
    children?: React.ReactNode;
}

export default function Footer (props : Props) {
    const feed : {figure : HTMLElement, link: string, date: string, title: string}[] = React.useMemo(() => {
        const parser = new DOMParser();
        return Feed.feed.entry.map((item : any) => {
            const xml = parser.parseFromString(item['content'], 'text/html');
            return {
                figure: xml.querySelector('figure'),
                link: item.link[0].$.href,
                date: item.updated[0],
                title: item.title[0]._,
            }
        });
    }, []);
    return <div className={Styles.root}>
        <div className={Styles.container}>
            <div className={Styles.section}>
                <div className={Styles.column}>
                    <div className={Styles.title}>The Saga Tarot Network</div>
                    <div className={Styles.links}>
                        <div className={Styles.smallTitle}>Info</div>
                        <div>
                            <a href="https://legends.saga.cards">Legends Series</a>
                        </div>
                        <div className={Styles.smallTitle}>Apps</div>
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
                            <Button size="large" alt>
                                    <FaTwitter />
                            </Button>
                                </a>
                                <a className={Styles.social} href="https://instagram.com/sagacards">
                            <Button size="large" alt>
                                    <FaInstagram />
                            </Button>
                                </a>
                                <a className={Styles.social} href="http://discord.gg/jNgjgvzCGC">
                            <Button size="large" alt>
                                    <FaDiscord />
                            </Button>
                                </a>
                        </div>
                    </div>
                </div>
                <div className={Styles.column}>
                    <div className={Styles.links}>
                        <div className={Styles.smallTitle}>News</div>
                        {feed.map((item, i) => <div key={`feed${i}`}><a href={item.link}>{item.title}</a></div>)}
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
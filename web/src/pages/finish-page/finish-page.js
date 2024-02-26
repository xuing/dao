import React from 'react';
import { useSelector } from 'react-redux';

import Header from '../../components/Header/Header';
import Progress from '../../components/Progress/Progress';
import Title from '../../components/Title/Title';
import WalletInfo from '../../components/WalletInfo/WalletInfo';
import Button from '../../components/Button/Button';
import Footer from '../../components/Footer/Footer';
import Url from '../../components/Url/Url';
import styles from './finish-page.module.css';
import { hideString } from '../../utils';
import { addTokenToMetamask } from '../../utils/metamask';
import { governanceContracts } from '../../constants';
import TwitterShare from '../../hoc/TwitterShare';
import { useWeb3Connection } from "../../hooks/useWeb3Connection";

const TwitterShareButton = TwitterShare(Button)

const FinishPage = () => {
    const { address, network } = useWeb3Connection();
    const { delegatee } = useSelector(state => state.governance.values)
    const { currentAward } = useSelector(state => state.distributor)

    const handleAddToken = () => {
        addTokenToMetamask(governanceContracts[network.name].token)
    }

    return (
        <div className={styles.background}>
            <div className={styles.background__image}>

            </div>
            <div className={styles.header}>
                <Header button />
            </div>


            <div className="container">
                <main className={` main ${styles.main}`}>
                    <div className={styles.progress}>
                        <Progress />
                    </div>
                    <ul className={styles.wallets}>
                        <li className={styles.wallet}>
                            <WalletInfo wallet="wallet" account={hideString(address)} />
                        </li>
                        <li className={styles.wallet}>
                            <WalletInfo wallet="delegate" account={hideString(delegatee)} />
                        </li>
                    </ul>

                    <div className={styles.title}>
                        <Title type="h1" size="large" text={`${currentAward} FLT claimed`}  />
                        <span className={styles["icon-fire"]}> 🔥</span>
                    </div>

                    <p className={styles.caption}>
                        You have successfully claimed the FLT reward!
                    </p>
                    <ul className={styles.buttons}>
                        <li className={styles.button}>
                            <Button callback={handleAddToken} type="large" text="Display FLT in Metamask" />
                        </li>
                        <li className={styles.button}>
                            <TwitterShareButton
                                type="large"
                                icon="twitter"
                                text="Share on Twitter"
                                caption={`I have just claimed ${currentAward} FLT tokens of Fluence!`}
                                url="https://fluence.network"
                            />
                        </li>
                    </ul>
                </main>
            </div>
            <Footer />
        </div>
    )
}

export default FinishPage;

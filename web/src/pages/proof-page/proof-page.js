import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import Header from "../../components/Header/Header";
import Progress from "../../components/Progress/Progress";
import Title from "../../components/Title/Title";
import Button from "../../components/Button/Button";
import Dashboard from "../../components/Dashboard/Dashboard";
import WalletInfo from "../../components/WalletInfo/WalletInfo";
import TextArea from "../../components/TextArea/TextArea";
import Footer from "../../components/Footer/Footer";

import danger from "../../images/danger.svg";
import styles from "./proof-page.module.css";
import { hideString } from "../../utils";

import { checkHasClaimed, storeProof } from "../../store/actions/governance";
import { ROUTE_CLAIMED, ROUTE_DONE } from "../../constants/routes";
import { toast } from "react-toastify";
import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";
import { hashedLeaf } from "../../utils/award";
import { Buffer } from "buffer";
import { validateSignature } from "../../utils/asn1";
import { ethers } from "ethers";
import { useWeb3Connection } from "../../hooks/useWeb3Connection";

const ProofPage = () => {
  const { address, provider, network } = useWeb3Connection();
  const { proof } = useSelector((state) => state.governance.values);
  const [haveProof, setHaveProof] = useState(!!proof);
  const { hasClaimed } = useSelector((state) => state.governance);

  const { merkleRoot } = useSelector((state) => state.distributor);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [proofValue, setProofValue] = useState("");

  console.log("merkleRoot is", merkleRoot);

  window.Buffer = Buffer;

  useEffect(() => {
    if (hasClaimed?.claimed) {
      navigate(ROUTE_CLAIMED);
    }
  }, [hasClaimed]);

  function fromHex(str) {
    if (str.startsWith("0x")) {
      return Buffer.from(str.slice(2), "hex");
    } else {
      return Buffer.from(str, "hex");
    }
  }

  const handleForm = async (e) => {
    e.preventDefault();

    try {
      // TODO: validate data better
      let [userId, tmpEthAddrNoPrefix, signatureHex, merkleProofHex] =
        proofValue.split(",");
      let tmpEthAddr = tmpEthAddrNoPrefix;

      dispatch(checkHasClaimed(userId, provider, network.name));

      try {
        console.log("signatureHex", signatureHex);
        console.log("tmpEthAddr", tmpEthAddr);
        let isASN1 = !signatureHex.startsWith("0x");
        console.log("isASN1", isASN1);

        let merkleProof = JSON.parse(
          Buffer.from(merkleProofHex, "base64").toString()
        );
        try {
          console.log("address is", address);
          let signedHash = ethers.utils.hashMessage(fromHex(address));
          console.log("Signed Hash", signedHash);

          let signature = validateSignature(
            signedHash,
            signatureHex,
            tmpEthAddr,
            isASN1
          );
          console.log("Signature is correct.", signature);

          const leaf = await hashedLeaf(userId, tmpEthAddr);
          const verified = MerkleTree.verify(
            merkleProof,
            leaf,
            merkleRoot,
            keccak256,
            { hashLeaves: false, sortPairs: true }
          );

          console.log("MerkleTree verified", verified);
          if (verified) {
            setHaveProof(true);
            dispatch(
              storeProof({ userId, tmpEthAddr, signature, merkleProof })
            );
          } else {
            toast("Invalid merkle proof. Please check the data.");
          }
        } catch (error) {
          console.log(error);
          toast("Invalid signature.");
        }
      } catch (error) {
        console.log(error);
        toast(
          "Invalid proof format. Please check the data. It should be [userId,tmpEthAddr,signatureHex,merkleProofHex]."
        );
      }
    } catch (error) {
      console.log(error);
      toast("The proof should be a valid hex string");
    }
  };

  useEffect(() => {
    if (haveProof & !hasClaimed?.claimed & hasClaimed?.checked) {
      navigate(ROUTE_DONE);
    }
  }, [haveProof, hasClaimed]);

  return (
    <div className={styles.background}>
      <Header />
      <div className={styles.container}>
        <main className={styles.main1}>
          <div className={styles.content}>
            <div className={styles.progress}>
              <Progress />
            </div>
            <div className={styles.wallet}>
              <WalletInfo
                wallet="wallet"
                account={address ? hideString(address) : ""}
              />
            </div>
            <div className={styles.title}>
              <Title
                type="h1"
                size="large"
                text="Submit the proof of Github account ownership"
              />
            </div>
          </div>

          <div className={styles.dashboard}>
            <Dashboard>
              <form onSubmit={handleForm}>
                <ul className={styles.dashboard__list}>
                  <li className={styles.dashboard__item}>
                    <p
                      className={`${styles.dashboard__text} ${styles.dashboard__text_size_large}`}
                    >
                      <span className={styles.dashboard__span}>Step 1: </span>
                      Get the bash script
                    </p>
                    <p
                      className={`${styles.dashboard__text} ${styles.dashboard__text_size_mid}`}
                    >
                      <Link to="/" className={styles.dashboard__link}>
                        Download{" "}
                      </Link>
                      the proof generation bash script to your local machine
                      from Github and run it with the following command.
                    </p>
                    <p
                      className={`${styles.dashboard__paragraph} ${styles.dashboard__paragraph_pl_27}`}
                    >
                      <img
                        src={danger}
                        className={styles.dashboard__danger}
                        alt="danger-icon"
                      />
                      This script will read your private key, so we highly
                      recommend inspecting the source code first
                    </p>
                  </li>

                  <li className={styles.dashboard__item}>
                    <p
                      className={`${styles.dashboard__text} ${styles.dashboard__text_size_large}`}
                    >
                      <span className={styles.dashboard__span}>Step 2: </span>
                      Generate a proof
                    </p>
                    <p
                      className={`${styles.dashboard__text} ${styles.dashboard__text_size_mid}`}
                    >
                      Run the script in your machine terminal. Make sure keys
                      that are uploaded to Github are also stored on this
                      machine. You can sign with any of those keys (only RSA and Ed25519 are supported).
                    </p>
                    <p
                      className={`${styles.dashboard__text} ${styles.dashboard__text_size_mid}`}
                    >
                      If everything went well, you should see a base64-encoded
                      string in your terminal — that’s your proof.
                    </p>
                    <div className={styles.dashboard__textarea}>
                      <p className={styles.paragraph}>./flt-proof.sh</p>
                    </div>
                  </li>

                  <li className={styles.dashboard__item}>
                    <p
                      className={`${styles.dashboard__text} ${styles.dashboard__text_size_large}`}
                    >
                      <span className={styles.dashboard__span}>Step 3: </span>
                      Enter your proof
                    </p>
                    <p
                      className={`${styles.dashboard__text} ${styles.dashboard__text_size_mid}`}
                    >
                      Copy the base64-encoded proof from your terminal into the
                      box below. The proof will be sent to the smart contract to
                      unlock your tokens.
                    </p>

                    <div className={styles.dashboard__textarea}>
                      <TextArea
                        onChange={(e) => setProofValue(e.target.value)}
                        name="token"
                        rows="4"
                      />
                    </div>
                  </li>
                </ul>

                <div className={styles.dashboard__button}>
                  <Button type="large" text="Submit proof" />
                </div>
                <p className={styles.dashboard__paragraph}>
                  If you are not comfortable submiting the proof via web UI, you can claim directly
                  from the smart contract {" "}
                  <Link to="/" className={styles.dashboard__link}>
                    on Etherescan
                  </Link>
                </p>
              </form>
            </Dashboard>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default ProofPage;

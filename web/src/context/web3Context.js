import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Web3Modal from "web3modal";
import { providers } from "ethers";
import supportedChains from "../constants/chains";
import Web3 from "web3";
import { toast } from "react-toastify";

const { REACT_APP_INFURA_KEY: INFURA_ID } = process.env;

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider, // required
    options: {
      infuraId: INFURA_ID, // required
    },
  },
};

let web3Modal;
if (typeof window !== "undefined") {
  web3Modal = new Web3Modal({
    network: "sepolia", // optional
    cacheProvider: true,
    providerOptions, // required
  });
}

const defaultProvider = new providers.JsonRpcProvider(
  supportedChains[0].rpc_url,
  {
    name: supportedChains[0].network,
    chainId: supportedChains[0].chain_id,
  },
);

export const Web3Context = createContext(null);

export const Web3ContextProvider = ({ children }) => {
  const [provider, setProvider] = useState(defaultProvider);
  const [address, setAddress] = useState(null);

  const connect = useCallback(async () => {
    try {
      const modal = await web3Modal.connect();
      const networkData = supportedChains.find(
        (chain) => chain.network_id === Number(modal.networkVersion),
      );
      const web3Provider = new providers.Web3Provider(
        await web3Modal.connect(),
        {
          name: networkData.network,
          chainId: networkData.chain_id,
        },
      );

      const signer = web3Provider.getSigner();
      const address = await signer.getAddress();
      setProvider(web3Provider);
      setAddress(address);
    } catch (e) {
      console.log(e);
    }
  }, []);

  const disconnect = useCallback(async function () {
    await web3Modal.clearCachedProvider();
    setProvider(defaultProvider);
    setAddress(null);
  }, []);

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      void connect();
    }
  }, []);

  useEffect(() => {
    if (provider?.on) {
      const handleAccountsChanged = (accounts) => {
        console.log("accountsChanged", accounts);
      };

      const handleChainChanged = (_hexChainId) => {
        let chainSupported = false;

        supportedChains.forEach((chain) => {
          if (Web3.utils.hexToNumber(_hexChainId) === chain.chain_id) {
            chainSupported = true;
          }
        });

        chainSupported
          ? window.location.reload()
          : toast(
              `Network not supported. Please switch to ${supportedChains[0].name}.`,
            );
      };

      const handleDisconnect = (error) => {
        console.log("disconnect", error);
        disconnect();
      };

      provider.on("accountsChanged", handleAccountsChanged);
      provider.on("chainChanged", handleChainChanged);
      provider.on("disconnect", handleDisconnect);

      // Subscription Cleanup
      return () => {
        if (provider.removeListener) {
          provider.removeListener("accountsChanged", handleAccountsChanged);
          provider.removeListener("chainChanged", handleChainChanged);
          provider.removeListener("disconnect", handleDisconnect);
        }
      };
    }
  }, [provider, disconnect]);

  return (
    <Web3Context.Provider
      value={{
        connect,
        disconnect,
        provider,
        address,
        network: provider.network,
        web3Modal,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};
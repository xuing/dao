import { createContext, useCallback, useEffect, useState } from "react";
import { providers } from "ethers";
import supportedChains from "../constants/chains";
import {
  createWeb3Modal,
  defaultConfig,
  useDisconnect,
  useWeb3Modal,
  useWeb3ModalAccount,
  useWeb3ModalProvider
} from "@web3modal/ethers5/react";

const metadata = {
  name: 'Fluence reward',
  description: 'Fluence dao reward for participating in web3 development',
  url: 'https://claim.fluence.network/',
  icons: ['https://claim.fluence.network/favicon.ico']
}

const chains = supportedChains.map(({chain_id, network, native_currency, explorer_url, rpc_url}) => ({
  chainId: chain_id,
  name: network,
  currency: native_currency.symbol,
  explorerUrl: explorer_url,
  rpcUrl: rpc_url
}));

const DEFAULT_NETWORK_NAME = 'sepolia';

createWeb3Modal({
  ethersConfig: defaultConfig({ metadata }),
  chains,
  defaultChain: chains.find(chain => chain.name === DEFAULT_NETWORK_NAME),
  projectId: 'c7ce6e969f0b45089bfe1aed1187d348',
  enableAnalytics: false // Optional - defaults to your Cloud configuration
});

const defaultProvider = new providers.JsonRpcProvider(
  supportedChains[0].rpc_url,
  {
    name: supportedChains[0].network,
    chainId: supportedChains[0].chain_id,
  },
);

export const Web3Context = createContext(null);

export const Web3ContextProvider = ({ children }) => {
  const { open, close } = useWeb3Modal()
  const [provider, setProvider] = useState(defaultProvider);
  const { modalProvider } = useWeb3ModalProvider();
  const { address, chainId, isConnected } = useWeb3ModalAccount();
  const { disconnect: disconnectWallet } = useDisconnect();

  const connect = useCallback(async () => {
    try {
      await open();
    } catch (e) {
      console.log(e);
    }
  }, [open]);

  useEffect(() => {
    if (modalProvider) {
      const web3Provider = new providers.Web3Provider(
        modalProvider,
      );
      setProvider(web3Provider)
    } else {
      setProvider(defaultProvider);
    }
  }, [modalProvider]);

  const disconnect = useCallback(async function () {
    await disconnectWallet();
    setProvider(defaultProvider);
  }, []);

  return (
    <Web3Context.Provider
      value={{
        connect,
        disconnect,
        provider,
        address,
        network: provider.network,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

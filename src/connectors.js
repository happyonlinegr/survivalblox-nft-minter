import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";

const injected = new InjectedConnector({
  supportedChainIds: [1, 3, 4, 5, 42,56]
});

const walletconnect = new WalletConnectConnector({
  rpc: {
	56: 'https://bsc-dataseed1.binance.org:443'
  },
  bridge: "https://bridge.walletconnect.org",
  qrcode: true, 
  chainId: 56,
  network: 'mainnet'
});
export const connectors = {
  injected: injected,
  walletConnect: walletconnect,
};
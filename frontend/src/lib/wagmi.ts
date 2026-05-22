import { http, createConfig } from 'wagmi';
import { mainnet, mantleSepoliaTestnet } from 'wagmi/chains';
import { getDefaultConfig } from 'connectkit';

export const config = createConfig(
  getDefaultConfig({
    chains: [mantleSepoliaTestnet, mainnet],
    transports: {
      [mantleSepoliaTestnet.id]: http('https://rpc.sepolia.mantle.xyz'),
      [mainnet.id]: http('https://cloudflare-eth.com'),
    },
    walletConnectProjectId: 'def4ca562725e1a1200155b41a227eb5',
    appName: 'Aegis',
  })
);

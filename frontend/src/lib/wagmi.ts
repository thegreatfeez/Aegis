import { http, createConfig } from 'wagmi';
import { mantleSepoliaTestnet } from 'wagmi/chains';
import { getDefaultConfig } from 'connectkit';

export const config = createConfig(
  getDefaultConfig({
    chains: [mantleSepoliaTestnet],
    transports: {
      [mantleSepoliaTestnet.id]: http('https://rpc.sepolia.mantle.xyz'),
    },
    walletConnectProjectId: 'def4ca562725e1a1200155b41a227eb5',
    appName: 'Aegis',
  })
);

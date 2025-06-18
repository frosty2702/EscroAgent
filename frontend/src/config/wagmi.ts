import { http, createConfig } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { coinbaseWallet, metaMask } from 'wagmi/connectors';

export const config = createConfig({
  chains: [baseSepolia],
  connectors: [
    coinbaseWallet({
      appName: 'TrustFlow',
      appLogoUrl: 'https://trustflow.app/logo.png',
    }),
    metaMask({
      dappMetadata: {
        name: 'TrustFlow',
        url: 'https://trustflow.app',
      },
    }),
  ],
  transports: {
    [baseSepolia.id]: http(),
  },
}); 
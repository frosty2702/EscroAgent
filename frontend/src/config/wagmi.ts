import { http, createConfig } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { coinbaseWallet } from 'wagmi/connectors';

export const config = createConfig({
  chains: [baseSepolia],
  connectors: [
    coinbaseWallet({
      appName: 'TrustFlow',
      appLogoUrl: 'https://trustflow.app/logo.png',
    }),
  ],
  transports: {
    [baseSepolia.id]: http(),
  },
}); 
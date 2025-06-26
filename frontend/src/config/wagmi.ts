import { http, createConfig } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { coinbaseWallet } from 'wagmi/connectors';

export const config = createConfig({
  chains: [baseSepolia],
  connectors: [
    coinbaseWallet({
      appName: 'TrustFlow',
      appLogoUrl: undefined, // Remove the logo URL as it might cause issues
      preference: 'all', // Allow both extension and Smart Wallet
    }),
  ],
  transports: {
    [baseSepolia.id]: http('https://sepolia.base.org'), // Use explicit RPC URL
  },
}); 
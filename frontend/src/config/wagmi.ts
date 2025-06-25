import { http, createConfig } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { coinbaseWallet } from 'wagmi/connectors';

export const config = createConfig({
  chains: [baseSepolia],
  connectors: [
    coinbaseWallet({
      appName: 'TrustFlow',
      appLogoUrl: undefined, // Remove the logo URL as it might cause issues
      preference: 'smartWalletOnly', // Focus on Coinbase Smart Wallet
    }),
  ],
  transports: {
    [baseSepolia.id]: http('https://sepolia.base.org'), // Use explicit RPC URL
  },
}); 
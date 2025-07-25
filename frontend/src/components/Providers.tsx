'use client';

import React from 'react';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from '../config/wagmi';
import { FirebaseProvider } from '../context/FirebaseContext';
import '@rainbow-me/rainbowkit/styles.css';

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <FirebaseProvider>
            {children}
          </FirebaseProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
} 
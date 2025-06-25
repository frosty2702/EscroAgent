'use client';

import React from 'react';
import { Typography, Card, CardContent } from '@mui/material';
import { useAccount } from 'wagmi';
import WalletConnection from '../components/WalletConnection';
import CreateAgreementForm from '../components/CreateAgreementForm';
import ActiveAgreements from '../components/ActiveAgreements';

export default function Home() {
  const { address, isConnected } = useAccount();

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: '#EEEFE1' }}>
      {/* Large centered TrustFlow logo */}
      <div className="text-center mb-12">
        <Typography 
          variant="h2" 
          className="font-bold"
          style={{ 
            fontWeight: 800,
            fontFamily: 'var(--font-tilt-warp)',
            fontSize: '4rem',
            color: '#66ADFF',
            textShadow: '-2px -2px 0 #000000, 2px -2px 0 #000000, -2px 2px 0 #000000, 2px 2px 0 #000000'
          }}
        >
          TrustFlow
        </Typography>
      </div>

      {/* Wallet info and connection - split layout */}
      <div className="flex justify-between items-center mb-8 px-8 max-w-6xl mx-auto">
        {/* Wallet address display on left */}
        <div className="flex items-center gap-2">
          <Typography variant="h6" className="text-gray-700 font-medium" style={{ fontFamily: 'var(--font-doppio-one)' }}>
            Wallet:
          </Typography>
          <Typography variant="body1" className="text-gray-600" style={{ fontFamily: 'var(--font-doppio-one)' }}>
            {isConnected && address ? formatAddress(address) : 'Not connected'}
          </Typography>
        </div>
        
        {/* Connect/Disconnect wallet button on right */}
        <WalletConnection />
      </div>

      {/* Large content box */}
      <div className="flex justify-center px-8">
        <Card className="w-full max-w-6xl shadow-lg" style={{ minHeight: '500px', borderRadius: '20px', border: '3px solid #000' }}>
          <CardContent className="p-12">
            <Typography 
              variant="h3" 
              className="text-gray-800 font-semibold"
              style={{ fontSize: '30px', fontFamily: 'var(--font-doppio-one)', marginBottom: '32px' }}
            >
              Create Agreement:
            </Typography>
            
            {/* Form content */}
            <CreateAgreementForm />
          </CardContent>
        </Card>
      </div>

      {/* Active Agreements section below */}
      <div className="w-full max-w-6xl mx-auto mt-8">
        <ActiveAgreements />
      </div>
    </div>
  );
}

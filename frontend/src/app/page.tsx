'use client';

import React from 'react';
import { Typography } from '@mui/material';
import WalletConnection from '../components/WalletConnection';
import CreateAgreementFormSimple from '../components/CreateAgreementFormSimple';
import ActiveAgreements from '../components/ActiveAgreements';

export default function Home() {
  return (
    <div className="min-h-screen" style={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
    }}>
      <div className="flex flex-col items-center py-10 px-4">
        {/* Header */}
        <Typography 
          variant="h3" 
          className="text-white font-bold text-center mb-2" 
          style={{ fontWeight: 800 }}
        >
          TrustFlow
        </Typography>
        <Typography 
          variant="subtitle1" 
          className="text-gray-200 text-center mb-8 max-w-2xl"
        >
          Secure Every Deal. Automate Every Outcome.
        </Typography>

        {/* Wallet Connection */}
        <WalletConnection />

        {/* Create New Agreement Form */}
        <CreateAgreementFormSimple />

        {/* Active Agreements */}
        <ActiveAgreements />
      </div>
    </div>
  );
}

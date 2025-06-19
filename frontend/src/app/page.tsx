'use client';

import React from 'react';
import { Typography } from '@mui/material';
import WalletConnection from '../components/WalletConnection';
import CreateAgreementForm from '../components/CreateAgreementForm';
import ActiveAgreements from '../components/ActiveAgreements';

export default function Home() {
  return (
    <div className="min-h-screen" style={{ 
      backgroundColor: '#4A90E2' 
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
        <CreateAgreementForm />

        {/* Active Agreements */}
        <ActiveAgreements />
      </div>
    </div>
  );
}

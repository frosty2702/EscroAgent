'use client';

import React from 'react';
import { Card, CardContent, Button, Typography, Box, Chip } from '@mui/material';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { coinbaseWallet } from 'wagmi/connectors';

export default function WalletConnection() {
  const { address, isConnected, chain } = useAccount();
  const { connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  const handleConnect = () => {
    connect({ connector: coinbaseWallet() });
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="w-full max-w-4xl mb-6 p-4 rounded-xl border-2 border-white/30 bg-white/10 backdrop-blur-sm">
      <Box className="flex flex-row justify-between items-center">
        <Box className="flex items-center gap-4">
          <Typography variant="h6" className="text-white font-medium">
            Wallet Status:
          </Typography>
          {isConnected ? (
            <Box className="flex items-center gap-2">
              <Chip 
                label="Connected" 
                color="success" 
                size="medium"
                variant="filled"
              />
              <Typography variant="body1" className="text-white/90 font-medium">
                {formatAddress(address!)}
              </Typography>
              {chain && (
                <Chip 
                  label={chain.name} 
                  size="medium"
                  variant="outlined"
                  sx={{ color: 'white', borderColor: 'white' }}
                />
              )}
            </Box>
          ) : (
            <Chip 
              label="Not Connected" 
              size="medium"
              variant="outlined"
              sx={{ color: 'white', borderColor: 'white' }}
            />
          )}
        </Box>
        
        <Box className="flex gap-2">
          {isConnected ? (
            <Button 
              variant="outlined" 
              onClick={() => disconnect()}
              size="medium"
              sx={{ 
                color: 'white', 
                borderColor: 'white',
                fontWeight: 'bold',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              Disconnect
            </Button>
          ) : (
            <Button 
              variant="contained" 
              onClick={handleConnect}
              disabled={isPending}
              size="large"
              sx={{
                backgroundColor: '#2563eb !important',
                color: 'white !important',
                fontWeight: 'bold !important',
                fontSize: '1rem !important',
                px: 4,
                py: 1.5,
                borderRadius: '8px !important',
                textTransform: 'none !important',
                border: 'none !important',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3) !important',
                minWidth: '180px !important',
                '&:hover': {
                  backgroundColor: '#1d4ed8 !important',
                  boxShadow: '0 6px 16px rgba(29, 78, 216, 0.4) !important'
                },
                '&:disabled': {
                  backgroundColor: 'rgba(37, 99, 235, 0.5) !important',
                  color: 'white !important'
                },
                '&.MuiButton-root': {
                  backgroundColor: '#2563eb !important'
                },
                '&.MuiButton-contained': {
                  backgroundColor: '#2563eb !important'
                }
              }}
            >
              {isPending ? 'Connecting...' : 'CONNECT WALLET'}
            </Button>
          )}
        </Box>
      </Box>
    </div>
  );
} 
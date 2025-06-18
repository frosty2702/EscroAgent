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
    <Card className="w-full max-w-4xl mb-6">
      <CardContent>
        <Box className="flex flex-row justify-between items-center">
          <Box className="flex items-center gap-4">
            <Typography variant="body1" className="text-gray-600">
              Wallet Status:
            </Typography>
            {isConnected ? (
              <Box className="flex items-center gap-2">
                <Chip 
                  label="Connected" 
                  color="success" 
                  size="small"
                  variant="filled"
                />
                <Typography variant="body2" className="text-gray-700">
                  {formatAddress(address!)}
                </Typography>
                {chain && (
                  <Chip 
                    label={chain.name} 
                    size="small"
                    variant="outlined"
                  />
                )}
              </Box>
            ) : (
              <Chip 
                label="Not Connected" 
                color="default" 
                size="small"
                variant="outlined"
              />
            )}
          </Box>
          
          <Box className="flex gap-2">
            {isConnected ? (
              <Button 
                variant="outlined" 
                color="secondary"
                onClick={() => disconnect()}
                size="small"
              >
                Disconnect
              </Button>
            ) : (
              <Button 
                variant="contained" 
                color="primary"
                onClick={handleConnect}
                disabled={isPending}
                className="!font-bold"
              >
                {isPending ? 'Connecting...' : 'CONNECT WALLET'}
              </Button>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
} 
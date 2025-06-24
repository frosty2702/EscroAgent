'use client';

import React, { useState, useEffect } from 'react';
import { Button, Typography, Box, Modal, Link, Alert } from '@mui/material';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { coinbaseWallet } from 'wagmi/connectors';

export default function WalletConnection() {
  const { address, isConnected } = useAccount();
  const { connect, isPending, error } = useConnect();
  const { disconnect } = useDisconnect();
  const [open, setOpen] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleOpen = () => {
    setOpen(true);
    setConnectionError(null);
  };

  const handleClose = () => {
    setOpen(false);
    setConnectionError(null);
    setIsConnecting(false);
  };

  const handleReset = () => {
    setConnectionError(null);
    setIsConnecting(false);
    disconnect();
    // Force a page refresh to clear any stuck states
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const handleConnect = async () => {
    try {
      setConnectionError(null);
      setIsConnecting(true);
      
      connect({ connector: coinbaseWallet() });
      handleClose();
    } catch (err) {
      console.error('Connection error:', err);
      setIsConnecting(false);
      setConnectionError('Failed to connect wallet. Please try again.');
    }
  };

  const handleDisconnect = () => {
    disconnect();
  };

  // Clear error when connection succeeds
  useEffect(() => {
    if (isConnected) {
      setConnectionError(null);
      setIsConnecting(false);
      setOpen(false);
    }
  }, [isConnected]);

  // Handle wagmi connection errors
  useEffect(() => {
    if (error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errorMessage = (error as any)?.message || 'Connection failed. Please try again.';
      setConnectionError(errorMessage);
      setIsConnecting(false);
    }
  }, [error]);

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (isConnected) {
    return (
      <Button 
        variant="outlined" 
        onClick={handleDisconnect}
        size="medium"
        sx={{ 
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: '16px',
          px: 3,
          color: '#000',
          borderColor: '#000',
          fontFamily: 'var(--font-doppio-one)',
          '&:hover': {
            borderColor: '#333',
            backgroundColor: 'rgba(0,0,0,0.05)'
          }
        }}
      >
        Disconnect
      </Button>
    );
  }

  return (
    <>
      <Button 
        variant="outlined" 
        onClick={handleOpen}
        disabled={isPending}
        sx={{
          backgroundColor: '#EEEFE1',
          color: '#000',
          fontWeight: 600,
          px: 4,
          py: 1.5,
          borderRadius: '16px',
          textTransform: 'none',
          fontSize: '1rem',
          minWidth: '160px',
          border: '2px solid #000',
          boxShadow: '-2px 3px 0px 2px #000000',
          fontFamily: 'var(--font-doppio-one)',
          '&:hover': {
            backgroundColor: '#E0E1D3',
            border: '2px solid #000',
            boxShadow: '-2px 3px 0px 2px #000000'
          },
          '&:disabled': {
            backgroundColor: 'rgba(238, 239, 225, 0.5)',
            color: 'rgba(0, 0, 0, 0.5)',
            border: '2px solid rgba(0, 0, 0, 0.3)',
            boxShadow: '-2px 3px 0px 2px rgba(0, 0, 0, 0.3)'
          }
        }}
      >
        {isPending ? 'Connecting...' : 'Connect Wallet'}
      </Button>
      
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="wallet-selection-modal"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: 400,
            backgroundColor: '#EEEFE1',
            borderRadius: '20px',
            border: '3px solid #000',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            p: 4,
            outline: 'none',
            fontFamily: 'var(--font-doppio-one)',
          }}
        >
          {/* Close button */}
          <Button
            onClick={handleClose}
            sx={{
              position: 'absolute',
              top: 16,
              left: 16,
              minWidth: 'auto',
              width: 32,
              height: 32,
              borderRadius: '50%',
              color: '#000',
              fontSize: '20px',
              fontWeight: 'bold',
              p: 0,
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.1)'
              }
            }}
          >
            ×
          </Button>

          {/* Title */}
          <Typography
            variant="h6"
            sx={{
              textAlign: 'center',
              mb: 4,
              mt: 2,
              fontFamily: 'var(--font-doppio-one)',
              fontWeight: 600,
              color: '#000'
            }}
          >
            Connect your Coinbase Wallet
          </Typography>

          {/* Error Alert */}
          {connectionError && (
            <Alert 
              severity="error" 
              sx={{ mb: 3, fontFamily: 'var(--font-doppio-one)' }}
              action={
                <Button 
                  color="inherit" 
                  size="small" 
                  onClick={handleReset}
                  sx={{ fontFamily: 'var(--font-doppio-one)' }}
                >
                  Reset
                </Button>
              }
            >
              {connectionError}
            </Alert>
          )}

          {/* Wallet Options */}
          <Box sx={{ mb: 3 }}>
            {/* Coinbase Wallet */}
            <Button
              onClick={handleConnect}
              fullWidth
              disabled={isPending || isConnecting}
              sx={{
                backgroundColor: '#EEEFE1',
                color: '#000',
                border: '3px solid #000',
                borderRadius: '20px',
                py: 2,
                px: 3,
                textTransform: 'none',
                fontSize: '18px',
                fontWeight: 600,
                fontFamily: 'var(--font-doppio-one)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                '&:hover': {
                  backgroundColor: '#E0E1D3',
                  border: '3px solid #000',
                },
                '&:disabled': {
                  backgroundColor: 'rgba(238, 239, 225, 0.5)',
                  color: 'rgba(0, 0, 0, 0.5)',
                  border: '3px solid rgba(0, 0, 0, 0.3)',
                }
              }}
            >
              <span>{(isPending || isConnecting) ? 'Connecting to Coinbase...' : 'Coinbase Wallet'}</span>
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  backgroundColor: '#0052FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: '#fff'
                  }}
                />
              </Box>
            </Button>
          </Box>

          {/* I Don't have a wallet link */}
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Link
              href="https://www.coinbase.com/wallet"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: '#66ADFF',
                textDecoration: 'underline',
                fontSize: '16px',
                fontFamily: 'var(--font-doppio-one)',
                fontWeight: 500,
                '&:hover': {
                  color: '#4A90E2',
                  textDecoration: 'underline'
                }
              }}
            >
              I don&apos;t have a Coinbase Wallet
            </Link>
          </Box>
        </Box>
      </Modal>
    </>
  );
} 
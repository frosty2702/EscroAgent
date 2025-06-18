'use client';

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import { useReadContract } from 'wagmi';
import { ESCROW_FACTORY_ADDRESS, ESCROW_FACTORY_ABI } from '../config/contracts';
import { formatEther } from 'viem';

export default function ActiveAgreements() {

  // Get deployed escrow contracts
  const { data: deployedEscrows, isError, isLoading: isLoadingEscrows } = useReadContract({
    address: ESCROW_FACTORY_ADDRESS,
    abi: ESCROW_FACTORY_ABI,
    functionName: 'getDeployedEscrows',
  });

  // Get total agreement count
  const { data: agreementCount } = useReadContract({
    address: ESCROW_FACTORY_ADDRESS,
    abi: ESCROW_FACTORY_ABI,
    functionName: 'getAgreementCount',
  });

  // Get total volume
  const { data: totalVolume } = useReadContract({
    address: ESCROW_FACTORY_ADDRESS,
    abi: ESCROW_FACTORY_ABI,
    functionName: 'getTotalVolume',
  });

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (isLoadingEscrows) {
    return (
      <Card className="w-full max-w-4xl">
        <CardContent>
          <Typography variant="h6" className="font-bold mb-4">
            Active Agreements
          </Typography>
          <Box className="flex justify-center py-8">
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="w-full max-w-4xl">
        <CardContent>
          <Typography variant="h6" className="font-bold mb-4">
            Active Agreements
          </Typography>
          <Alert severity="error">
            Error loading agreements. Please try again later.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardContent>
        <Typography variant="h6" className="font-bold mb-4">
          Active Agreements
        </Typography>

        {/* Statistics */}
        <Box className="mb-6">
          <Box className="flex flex-col sm:flex-row gap-6 justify-center">
            <Box className="text-center">
              <Typography variant="h4" className="font-bold text-blue-600">
                {agreementCount?.toString() || '0'}
              </Typography>
              <Typography variant="body2" className="text-gray-600">
                Total Agreements
              </Typography>
            </Box>
            <Box className="text-center">
              <Typography variant="h4" className="font-bold text-green-600">
                {deployedEscrows?.length || 0}
              </Typography>
              <Typography variant="body2" className="text-gray-600">
                Active Contracts
              </Typography>
            </Box>
            <Box className="text-center">
              <Typography variant="h4" className="font-bold text-purple-600">
                {totalVolume ? formatEther(totalVolume) : '0'}
              </Typography>
              <Typography variant="body2" className="text-gray-600">
                Total Volume (ETH)
              </Typography>
            </Box>
          </Box>
        </Box>

        <Divider className="mb-4" />

        {/* Agreements List */}
        {!deployedEscrows || deployedEscrows.length === 0 ? (
          <Alert severity="info">
            No active agreements found. Create your first agreement above!
          </Alert>
        ) : (
          <Box className="space-y-4">
            {deployedEscrows.map((escrowAddress) => (
              <Card key={escrowAddress} variant="outlined">
                <CardContent>
                  <Box className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <Box className="flex-1">
                      <Typography variant="subtitle2" className="text-gray-600">
                        Contract Address
                      </Typography>
                      <Typography variant="body2" className="font-mono">
                        {formatAddress(escrowAddress)}
                      </Typography>
                    </Box>
                    
                    <Box className="flex-shrink-0">
                      <Typography variant="subtitle2" className="text-gray-600">
                        Status
                      </Typography>
                      <Chip 
                        label="Active" 
                        color="success" 
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                    
                    <Box className="flex-shrink-0">
                      <Typography variant="subtitle2" className="text-gray-600">
                        Type
                      </Typography>
                      <Chip 
                        label="Escrow" 
                        color="primary" 
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                    
                    <Box className="flex-1">
                      <Typography variant="subtitle2" className="text-gray-600">
                        Created
                      </Typography>
                      <Typography variant="body2">
                        Recently
                      </Typography>
                    </Box>
                    
                    <Box className="flex-shrink-0">
                      <Button 
                        variant="outlined" 
                        size="small"
                        onClick={() => window.open(`https://sepolia.basescan.org/address/${escrowAddress}`, '_blank')}
                      >
                        View Details
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}

        {/* Footer */}
        <Box className="mt-6 pt-4 border-t">
          <Typography variant="body2" className="text-gray-500 text-center">
            All agreements are secured by smart contracts on Base Sepolia testnet
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
} 
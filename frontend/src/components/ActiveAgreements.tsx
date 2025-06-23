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
import { useAccount, useReadContract } from 'wagmi';
import { ESCROW_FACTORY_ADDRESS, ESCROW_FACTORY_ABI } from '../config/contracts';
import { formatEther } from 'viem';
import { useFirebase } from '../context/FirebaseContext';

const CONDITION_TYPE_LABELS = [
  'Specific Date',
  'Task Completion',
  'GitHub PR Merged',
  'API Condition',
  'Custom Event'
];

const STATUS_COLORS = {
  pending: 'warning',
  funded: 'info',
  settled: 'success',
  disputed: 'error'
} as const;

export default function ActiveAgreements() {
  const { address } = useAccount();
  const { agreements, loading: firebaseLoading, getUserAgreements } = useFirebase();

  // Get deployed escrow contracts from blockchain
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

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleDateString();
    }
    return new Date(timestamp).toLocaleDateString();
  };

  const userAgreements = address ? getUserAgreements(address) : [];

  if (firebaseLoading || isLoadingEscrows) {
    return (
      <Card className="shadow-lg">
        <CardContent>
          <Typography variant="h5" className="font-bold mb-4">
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
      <Card className="shadow-lg">
        <CardContent>
          <Typography variant="h5" className="font-bold mb-4">
            Active Agreements
          </Typography>
          <Alert severity="error">
            Error loading blockchain data. Please try again later.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardContent>
        <Typography variant="h5" className="font-bold mb-4">
          Active Agreements
        </Typography>

        {/* Statistics */}
        <Box className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card variant="outlined">
            <CardContent className="text-center">
              <Typography variant="h4" className="font-bold text-blue-600">
                {agreements.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Agreements
              </Typography>
            </CardContent>
          </Card>
          
          <Card variant="outlined">
            <CardContent className="text-center">
              <Typography variant="h4" className="font-bold text-green-600">
                {deployedEscrows?.length || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                On-Chain Contracts
              </Typography>
            </CardContent>
          </Card>
          
          <Card variant="outlined">
            <CardContent className="text-center">
              <Typography variant="h4" className="font-bold text-purple-600">
                {totalVolume ? formatEther(totalVolume) : '0'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Volume (ETH)
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Divider className="mb-4" />

        {/* User's Agreements */}
        {address && (
          <Box className="mb-6">
            <Typography variant="h6" className="font-semibold mb-3">
              Your Agreements ({userAgreements.length})
            </Typography>
            
            {userAgreements.length === 0 ? (
              <Alert severity="info">
                You don't have any agreements yet. Create your first agreement to get started!
              </Alert>
            ) : (
              <Box className="space-y-4">
                {userAgreements.map((agreement) => (
                  <Card key={agreement.id} variant="outlined">
                    <CardContent>
                      <Box className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        
                        {/* Agreement Info */}
                        <Box className="flex-1">
                          <Box className="flex items-center gap-2 mb-2">
                            <Typography variant="h6" className="font-semibold">
                              {agreement.amount} ETH
                            </Typography>
                            <Chip 
                              label={agreement.status} 
                              color={STATUS_COLORS[agreement.status] || 'default'}
                              size="small"
                            />
                            <Chip 
                              label={CONDITION_TYPE_LABELS[agreement.conditionType] || 'Unknown'}
                              variant="outlined"
                              size="small"
                            />
                          </Box>
                          
                          <Typography variant="body2" color="text.secondary" className="mb-2">
                            {agreement.description}
                          </Typography>
                          
                          <Box className="flex flex-col sm:flex-row gap-4 text-sm text-gray-600">
                            <Box>
                              <Typography variant="caption" display="block">
                                {agreement.payerAddress.toLowerCase() === address.toLowerCase() ? 'To' : 'From'}
                              </Typography>
                              <Typography variant="body2" className="font-mono">
                                {formatAddress(
                                  agreement.payerAddress.toLowerCase() === address.toLowerCase() 
                                    ? agreement.payeeAddress 
                                    : agreement.payerAddress
                                )}
                              </Typography>
                            </Box>
                            
                            <Box>
                              <Typography variant="caption" display="block">
                                Created
                              </Typography>
                              <Typography variant="body2">
                                {formatDate(agreement.createdAt)}
                              </Typography>
                            </Box>
                            
                            {agreement.settledAt && (
                              <Box>
                                <Typography variant="caption" display="block">
                                  Settled
                                </Typography>
                                <Typography variant="body2">
                                  {formatDate(agreement.settledAt)}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </Box>
                        
                        {/* Actions */}
                        <Box className="flex flex-col gap-2">
                          {agreement.transactionHash && (
                            <Button 
                              variant="outlined" 
                              size="small"
                              onClick={() => window.open(`https://sepolia.basescan.org/tx/${agreement.transactionHash}`, '_blank')}
                            >
                              View Transaction
                            </Button>
                          )}
                          {agreement.contractAddress && (
                            <Button 
                              variant="outlined" 
                              size="small"
                              onClick={() => window.open(`https://sepolia.basescan.org/address/${agreement.contractAddress}`, '_blank')}
                            >
                              View Contract
                            </Button>
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Box>
        )}

        <Divider className="mb-4" />

        {/* All Blockchain Contracts */}
        <Typography variant="h6" className="font-semibold mb-3">
          All Deployed Contracts ({deployedEscrows?.length || 0})
        </Typography>

        {!deployedEscrows || deployedEscrows.length === 0 ? (
          <Alert severity="info">
            No escrow contracts have been deployed yet. Be the first to create an agreement!
          </Alert>
        ) : (
          <Box className="space-y-3">
            {deployedEscrows.map((escrowAddress, index) => (
              <Card key={escrowAddress} variant="outlined">
                <CardContent>
                  <Box className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    
                    <Box className="flex-1">
                      <Typography variant="subtitle1" className="font-semibold mb-1">
                        Contract #{index + 1}
                      </Typography>
                      <Typography variant="body2" className="font-mono text-gray-600 mb-2">
                        {escrowAddress}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Deployed on Base Sepolia
                      </Typography>
                    </Box>
                    
                    <Box className="flex-shrink-0">
                      <Button 
                        variant="outlined" 
                        size="small"
                        onClick={() => window.open(`https://sepolia.basescan.org/address/${escrowAddress}`, '_blank')}
                      >
                        View on BaseScan
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
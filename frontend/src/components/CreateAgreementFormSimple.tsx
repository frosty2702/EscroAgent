'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Box
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, keccak256, toBytes } from 'viem';
import { ESCROW_FACTORY_ADDRESS, ESCROW_FACTORY_ABI } from '../config/contracts';

// x402pay Creation Fee Configuration
const X402PAY_CREATION_FEE_ETH = 0.0005; // Match deployed contract fee

interface FormData {
  payerAddress: string;
  payeeAddress: string;
  amount: string;
  conditionType: number;
  description: string;
  settlementDate?: Date;
  taskName?: string;
  githubPrUrl?: string;
  apiEndpoint?: string;
  expectedValue?: string;
  customEventName?: string;
}

const CONDITION_TYPES = [
  { value: 0, label: 'Specific Date' },
  { value: 1, label: 'Task Completion (Simulated)' },
  { value: 2, label: 'GitHub PR Merged (Simulated)' },
  { value: 3, label: 'External API Call Success (Simulated)' },
  { value: 4, label: 'Custom Event Trigger (Simulated)' }
];

export default function CreateAgreementFormSimple() {
  const { address, isConnected } = useAccount();
  const [formData, setFormData] = useState<FormData>({
    payerAddress: '',
    payeeAddress: '',
    amount: '',
    conditionType: 0,
    description: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { writeContract, data: hash, error: writeError, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Update payer address when wallet connects
  React.useEffect(() => {
    if (address && isConnected) {
      setFormData(prev => ({ ...prev, payerAddress: address }));
    }
  }, [address, isConnected]);

  const handleInputChange = (field: keyof FormData, value: string | number | Date | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.payerAddress || !/^0x[a-fA-F0-9]{40}$/.test(formData.payerAddress)) {
      newErrors.payerAddress = 'Valid Ethereum address required';
    }
    if (!formData.payeeAddress || !/^0x[a-fA-F0-9]{40}$/.test(formData.payeeAddress)) {
      newErrors.payeeAddress = 'Valid Ethereum address required';
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    // Validate condition-specific fields
    switch (formData.conditionType) {
      case 0: // Specific Date
        if (!formData.settlementDate) {
          newErrors.conditionDetails = 'Settlement date is required';
        }
        break;
      case 1: // Task Completion
        if (!formData.taskName?.trim()) {
          newErrors.conditionDetails = 'Task name is required';
        }
        break;
      case 2: // GitHub PR
        if (!formData.githubPrUrl?.trim() || !formData.githubPrUrl.includes('github.com')) {
          newErrors.conditionDetails = 'Valid GitHub PR URL is required';
        }
        break;
      case 3: // API Call
        if (!formData.apiEndpoint?.trim() || !formData.expectedValue?.trim()) {
          newErrors.conditionDetails = 'API endpoint and expected value are required';
        }
        break;
      case 4: // Custom Event
        if (!formData.customEventName?.trim()) {
          newErrors.conditionDetails = 'Custom event name is required';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateConditionHash = (): `0x${string}` => {
    let conditionData = '';
    
    switch (formData.conditionType) {
      case 0: // Specific Date
        conditionData = formData.settlementDate?.toISOString() || '';
        break;
      case 1: // Task Completion
        conditionData = formData.taskName || '';
        break;
      case 2: // GitHub PR
        conditionData = formData.githubPrUrl || '';
        break;
      case 3: // API Call
        conditionData = `${formData.apiEndpoint}:${formData.expectedValue}`;
        break;
      case 4: // Custom Event
        conditionData = formData.customEventName || '';
        break;
    }

    return keccak256(toBytes(conditionData));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !isConnected) return;

    try {
      const conditionHash = generateConditionHash();
      const amountWei = parseEther(formData.amount);
      const creationFeeWei = parseEther(X402PAY_CREATION_FEE_ETH.toString());
      const totalValueWei = amountWei + creationFeeWei;

      writeContract({
        address: ESCROW_FACTORY_ADDRESS,
        abi: ESCROW_FACTORY_ABI,
        functionName: 'createEscrow',
        args: [
          formData.payeeAddress as `0x${string}`,
          amountWei,
          BigInt(formData.conditionType),
          conditionHash
        ],
        value: totalValueWei,
      });

    } catch (error) {
      console.error('Error creating escrow:', error);
    }
  };

  const renderConditionDetailsField = () => {
    switch (formData.conditionType) {
      case 0: // Specific Date
        return (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Settlement Date"
              value={formData.settlementDate || null}
              onChange={(date) => handleInputChange('settlementDate', date)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: 'small',
                  error: !!errors.conditionDetails,
                  helperText: errors.conditionDetails
                }
              }}
            />
          </LocalizationProvider>
        );
      
      case 1: // Task Completion
        return (
          <TextField
            label="Task Name/ID"
            fullWidth
            size="small"
            value={formData.taskName || ''}
            onChange={(e) => handleInputChange('taskName', e.target.value)}
            placeholder="e.g., 'Website Redesign Phase 1'"
            error={!!errors.conditionDetails}
            helperText={errors.conditionDetails}
          />
        );
      
      case 2: // GitHub PR
        return (
          <TextField
            label="GitHub PR URL"
            fullWidth
            size="small"
            value={formData.githubPrUrl || ''}
            onChange={(e) => handleInputChange('githubPrUrl', e.target.value)}
            placeholder="https://github.com/org/repo/pull/123"
            error={!!errors.conditionDetails}
            helperText={errors.conditionDetails}
          />
        );
      
      case 3: // External API Call
        return (
          <Box className="flex flex-col gap-4">
            <TextField
              label="API Endpoint (Simulated)"
              fullWidth
              size="small"
              value={formData.apiEndpoint || ''}
              onChange={(e) => handleInputChange('apiEndpoint', e.target.value)}
              placeholder="weather-api.com/temp"
              error={!!errors.conditionDetails}
            />
            <TextField
              label="Expected Value (Simulated)"
              fullWidth
              size="small"
              value={formData.expectedValue || ''}
              onChange={(e) => handleInputChange('expectedValue', e.target.value)}
              placeholder="temperature > 25"
              error={!!errors.conditionDetails}
              helperText={errors.conditionDetails}
            />
          </Box>
        );
      
      case 4: // Custom Event
        return (
          <TextField
            label="Custom Event Name (Simulated)"
            fullWidth
            size="small"
            value={formData.customEventName || ''}
            onChange={(e) => handleInputChange('customEventName', e.target.value)}
            placeholder="ProjectMilestoneReached"
            error={!!errors.conditionDetails}
            helperText={errors.conditionDetails}
          />
        );
      
      default:
        return null;
    }
  };

  if (isSuccess) {
    return (
      <Card className="w-full max-w-4xl mb-6">
        <CardContent>
          <Alert severity="success" className="mb-4">
            <Typography variant="h6">Agreement Created Successfully!</Typography>
            <Typography>Transaction Hash: {hash}</Typography>
          </Alert>
          <Button 
            variant="contained" 
            onClick={() => window.location.reload()}
            className="mt-4"
          >
            Create Another Agreement
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mb-6">
      <CardContent>
        <Typography variant="h6" className="font-bold mb-4">
          Create a New Agreement
        </Typography>
        
        {!isConnected && (
          <Alert severity="warning" className="mb-4">
            Please connect your wallet to create an agreement
          </Alert>
        )}

        {writeError && (
          <Alert severity="error" className="mb-4">
            Error: {writeError.message}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Box className="flex flex-col gap-4">
            {/* Payer and Payee Addresses */}
            <Box className="flex flex-col md:flex-row gap-4">
              <TextField
                label="Payer CDP Wallet Address"
                fullWidth
                size="small"
                value={formData.payerAddress}
                onChange={(e) => handleInputChange('payerAddress', e.target.value)}
                placeholder="0xPayerWalletAddress..."
                error={!!errors.payerAddress}
                helperText={errors.payerAddress || (isConnected ? 'Auto-filled from connected wallet' : '')}
                disabled={isConnected}
              />
              
              <TextField
                label="Payee CDP Wallet Address"
                fullWidth
                size="small"
                value={formData.payeeAddress}
                onChange={(e) => handleInputChange('payeeAddress', e.target.value)}
                placeholder="0xPayeeWalletAddress..."
                error={!!errors.payeeAddress}
                helperText={errors.payeeAddress}
              />
            </Box>

            {/* Amount and Condition Type */}
            <Box className="flex flex-col md:flex-row gap-4">
              <TextField
                label="Amount (ETH)"
                fullWidth
                size="small"
                type="number"
                inputProps={{ step: '0.001', min: '0' }}
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                placeholder="0.1"
                error={!!errors.amount}
                helperText={errors.amount || `+ ${X402PAY_CREATION_FEE_ETH} ETH x402pay creation fee`}
              />

              <FormControl fullWidth size="small">
                <InputLabel>Condition Type</InputLabel>
                <Select
                  value={formData.conditionType}
                  label="Condition Type"
                  onChange={(e) => handleInputChange('conditionType', e.target.value as number)}
                >
                  {CONDITION_TYPES.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Dynamic Condition Details */}
            <Box>
              <Typography variant="subtitle2" className="mb-2 font-medium">
                Condition Details
              </Typography>
              {renderConditionDetailsField()}
            </Box>

            {/* Fee Breakdown */}
            {formData.amount && (
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Total Transaction Cost:</strong> {(parseFloat(formData.amount) + X402PAY_CREATION_FEE_ETH).toFixed(4)} ETH
                  <br />
                  ({formData.amount} ETH escrow + {X402PAY_CREATION_FEE_ETH} ETH x402pay creation fee)
                </Typography>
              </Alert>
            )}

            {/* Agreement Description */}
            <TextField
              label="Agreement Description"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Payment for development milestone 2, due upon completion of backend API integration."
              error={!!errors.description}
              helperText={errors.description}
            />

            {/* Submit Button */}
            <Box className="flex justify-end">
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={!isConnected || isPending || isConfirming}
                className="!font-bold px-8"
              >
                {isPending || isConfirming ? (
                  <>
                    <CircularProgress size={20} className="mr-2" />
                    {isPending ? 'Confirming...' : 'Creating...'}
                  </>
                ) : (
                  'CREATE AGREEMENT'
                )}
              </Button>
            </Box>
          </Box>
        </form>
      </CardContent>
    </Card>
  );
} 
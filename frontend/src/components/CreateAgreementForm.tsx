'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  TextField,
  Button,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Box,
  FormHelperText
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId, useSwitchChain } from 'wagmi';
import { parseEther, keccak256, toBytes } from 'viem';
import { baseSepolia } from 'wagmi/chains';
import { Timestamp } from 'firebase/firestore';
import { ESCROW_FACTORY_ADDRESS, ESCROW_FACTORY_ABI } from '../config/contracts';
import { useFirebase, AgreementData } from '../context/FirebaseContext';
// import { validateDate } from '../utils/validation';
import { parseBlockchainError } from '../utils/errorHandling';

// x402pay Creation Fee Configuration
const X402PAY_CREATION_FEE_ETH = 0.0005;

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

// const CONDITION_TYPES = [
//   { value: 0, label: 'Specific Date', description: 'Release funds on a specific date' },
//   { value: 1, label: 'Task Completion', description: 'Release when task is marked complete (simulated)' },
//   { value: 2, label: 'GitHub PR Merged', description: 'Release when GitHub PR is merged (simulated)' },
//   { value: 3, label: 'API Condition', description: 'Release when API returns expected value (simulated)' },
//   { value: 4, label: 'Custom Event', description: 'Release when custom event is triggered (simulated)' }
// ];

// const steps = ['Agreement Details', 'Condition Setup', 'Review & Submit'];

export default function CreateAgreementForm() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { createAgreement, updateAgreement } = useFirebase();
  
  // const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    payerAddress: '',
    payeeAddress: '',
    amount: '',
    conditionType: 0,
    description: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [firestoreDocId, setFirestoreDocId] = useState<string>('');

  const { writeContract, data: hash, error: writeError, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess, error: receiptError } = useWaitForTransactionReceipt({
    hash,
  });

  // Memoize expensive calculations
  const totalRequired = useMemo(() => {
    const amount = parseFloat(formData.amount) || 0;
    return amount + X402PAY_CREATION_FEE_ETH;
  }, [formData.amount]);

  const isWrongNetwork = useMemo(() => {
    return chainId !== baseSepolia.id;
  }, [chainId]);

  // Update payer address when wallet connects
  useEffect(() => {
    if (address && isConnected) {
      setFormData(prev => ({ ...prev, payerAddress: address }));
    }
  }, [address, isConnected]);

  // Handle transaction success
  useEffect(() => {
    if (isSuccess && hash && firestoreDocId) {
      // Update Firestore with transaction details
      updateAgreement(firestoreDocId, {
        status: 'funded',
        transactionHash: hash,
        updatedAt: Timestamp.now()
      }).catch(error => {
        console.error('Failed to update Firestore:', error);
      });
    }
  }, [isSuccess, hash, firestoreDocId, updateAgreement]);

  // Debounced input change handler to reduce re-renders
  const handleInputChange = useCallback((field: keyof FormData, value: string | number | Date | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  // Memoized validation function
  const validateCurrentStep = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate basic required fields
    if (!formData.payerAddress?.trim()) {
      newErrors.payerAddress = 'Payer address is required';
    } else if (!formData.payerAddress.startsWith('0x') || formData.payerAddress.length !== 42) {
      newErrors.payerAddress = 'Please enter a valid Ethereum address';
    }

    if (!formData.payeeAddress?.trim()) {
      newErrors.payeeAddress = 'Payee address is required';
    } else if (!formData.payeeAddress.startsWith('0x') || formData.payeeAddress.length !== 42) {
      newErrors.payeeAddress = 'Please enter a valid Ethereum address';
    }

    if (!formData.amount?.trim()) {
      newErrors.amount = 'Amount is required';
    } else if (parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!formData.description?.trim()) {
      newErrors.description = 'Agreement description is required';
    }

    // Validate condition-specific fields
    switch (formData.conditionType) {
      case 0: // Specific Date
        if (!formData.settlementDate) {
          newErrors.conditionDetails = 'Settlement date is required';
        } else if (formData.settlementDate <= new Date()) {
          newErrors.conditionDetails = 'Settlement date must be in the future';
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
  }, [formData]);

  // const handleNext = useCallback(() => {
  //   if (validateCurrentStep()) {
  //     setActiveStep((prevActiveStep) => prevActiveStep + 1);
  //   }
  // }, [validateCurrentStep]);

  // const handleBack = useCallback(() => {
  //   setActiveStep((prevActiveStep) => prevActiveStep - 1);
  // }, []);

  const generateConditionHash = useCallback((): `0x${string}` => {
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
  }, [formData.conditionType, formData.settlementDate, formData.taskName, formData.githubPrUrl, formData.apiEndpoint, formData.expectedValue, formData.customEventName]);

  const handleSubmit = useCallback(async () => {
    if (!validateCurrentStep() || !isConnected) return;

    // Check if we're on the correct network (Base Sepolia)
    if (chainId !== baseSepolia.id) {
      try {
        await switchChain({ chainId: baseSepolia.id });
      } catch (error) {
        console.error('Failed to switch network:', error);
        setErrors({ submit: 'Please switch to Base Sepolia testnet in your wallet to create agreements.' });
        return;
      }
    }

    try {
      console.log('Starting agreement creation...');
      console.log('Form data:', formData);
      
      // First, save to Firestore
      const agreementData: Omit<AgreementData, 'id' | 'createdAt' | 'status'> = {
        payerAddress: formData.payerAddress,
        payeeAddress: formData.payeeAddress,
        amount: parseFloat(formData.amount),
        conditionType: formData.conditionType,
        description: formData.description,
      };

      // Only add optional fields if they have values (not undefined)
      if (formData.settlementDate) {
        agreementData.settlementDate = Timestamp.fromDate(formData.settlementDate);
      }
      if (formData.taskName) {
        agreementData.taskName = formData.taskName;
      }
      if (formData.githubPrUrl) {
        agreementData.githubPrUrl = formData.githubPrUrl;
      }
      if (formData.apiEndpoint) {
        agreementData.apiEndpoint = formData.apiEndpoint;
      }
      if (formData.expectedValue) {
        agreementData.expectedValue = formData.expectedValue;
      }
      if (formData.customEventName) {
        agreementData.customEventName = formData.customEventName;
      }

      console.log('Saving to Firestore...', agreementData);
      const docId = await createAgreement(agreementData);
      console.log('Firestore doc created:', docId);
      setFirestoreDocId(docId);

      // Then create the smart contract
      console.log('Preparing blockchain transaction...');
      const conditionHash = generateConditionHash();
      const amountWei = parseEther(formData.amount);
      const creationFeeWei = parseEther(X402PAY_CREATION_FEE_ETH.toString());
      const totalValueWei = amountWei + creationFeeWei;

      console.log('Transaction details:', {
        payeeAddress: formData.payeeAddress,
        amountWei: amountWei.toString(),
        conditionType: formData.conditionType,
        conditionHash,
        totalValueWei: totalValueWei.toString(),
        factoryAddress: ESCROW_FACTORY_ADDRESS
      });

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

    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      console.error('Error creating agreement:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to create agreement. ';
      
      if (error?.message?.includes('insufficient funds')) {
        errorMessage += 'Insufficient funds. Make sure you have enough ETH for the escrow amount plus gas fees.';
      } else if (error?.message?.includes('user rejected')) {
        errorMessage += 'Transaction was rejected. Please try again.';
      } else if (error?.message?.includes('network')) {
        errorMessage += 'Network error. Please check your connection and try again.';
      } else if (error?.message?.includes('Firestore') || error?.code?.includes('firestore')) {
        errorMessage += 'Database error. Please try again later.';
      } else if (error?.message) {
        errorMessage += `Error: ${error.message}`;
      } else {
        errorMessage += 'Please check the browser console for details and try again.';
      }
      
      setErrors({ submit: errorMessage });
    }
  }, [validateCurrentStep, isConnected, chainId, switchChain, formData, createAgreement, generateConditionHash, writeContract]);

  // Memoized condition details field to prevent unnecessary re-renders
  const renderConditionDetailsField = useMemo(() => {
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
                  error: !!errors.conditionDetails,
                  helperText: errors.conditionDetails || 'Funds will be released on this date'
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
            value={formData.taskName || ''}
            onChange={(e) => handleInputChange('taskName', e.target.value)}
            placeholder="e.g., &apos;Website Redesign Phase 1&apos;"
            error={!!errors.conditionDetails}
            helperText={errors.conditionDetails || 'Task that needs to be completed for fund release'}
          />
        );
      
      case 2: // GitHub PR
        return (
          <TextField
            label="GitHub PR URL"
            fullWidth
            value={formData.githubPrUrl || ''}
            onChange={(e) => handleInputChange('githubPrUrl', e.target.value)}
            placeholder="https://github.com/org/repo/pull/123"
            error={!!errors.conditionDetails}
            helperText={errors.conditionDetails || 'GitHub Pull Request that needs to be merged'}
          />
        );
      
      case 3: // External API Call
        return (
          <Box className="flex flex-col gap-4">
            <TextField
              label="API Endpoint"
              fullWidth
              value={formData.apiEndpoint || ''}
              onChange={(e) => handleInputChange('apiEndpoint', e.target.value)}
              placeholder="https://api.example.com/status"
              error={!!errors.conditionDetails}
              helperText="API endpoint to check"
            />
            <TextField
              label="Expected Value"
              fullWidth
              value={formData.expectedValue || ''}
              onChange={(e) => handleInputChange('expectedValue', e.target.value)}
              placeholder="success"
              error={!!errors.conditionDetails}
              helperText={errors.conditionDetails || "Expected response value for condition to be met"}
            />
          </Box>
        );
      
      case 4: // Custom Event
        return (
          <TextField
            label="Custom Event Name"
            fullWidth
            value={formData.customEventName || ''}
            onChange={(e) => handleInputChange('customEventName', e.target.value)}
            placeholder="ProjectMilestoneReached"
            error={!!errors.conditionDetails}
            helperText={errors.conditionDetails || 'Name of the custom event to trigger fund release'}
          />
        );
      
      default:
        return null;
    }
  }, [formData.conditionType, formData.settlementDate, formData.taskName, formData.githubPrUrl, formData.apiEndpoint, formData.expectedValue, formData.customEventName, errors.conditionDetails, handleInputChange]);

  if (!isConnected) {
    return (
      <Box className="text-center py-12">
        <Typography variant="h6" className="text-gray-600 mb-4" style={{ fontFamily: 'var(--font-doppio-one)' }}>
          Please connect your wallet to create an agreement.
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="max-w-4xl mx-auto" sx={{ 
      '& .MuiInputBase-root, & .MuiFormHelperText-root, & .MuiMenuItem-root': { 
        fontFamily: 'var(--font-doppio-one)' 
      },
      '& .MuiInputBase-input': {
        fontSize: '1rem',
        padding: '18px 14px'
      },
      '& .MuiOutlinedInput-root': {
        '& fieldset': {
          borderWidth: '2px',
          borderColor: '#000'
        },
        '&:hover fieldset': {
          borderWidth: '2px',
          borderColor: '#000'
        },
        '&.Mui-focused fieldset': {
          borderWidth: '2px',
          borderColor: '#66ADFF'
        }
      },
      '& .MuiFormHelperText-root': {
        fontSize: '0.9rem',
        marginTop: '8px'
      }
    }}>
      {/* Network Warning */}
      {isWrongNetwork && (
        <Alert severity="warning" sx={{ padding: '16px', borderRadius: '12px', marginBottom: '24px' }}>
          <Typography variant="body1" style={{ fontFamily: 'var(--font-doppio-one)', fontSize: '1rem', lineHeight: '1.6' }}>
            <strong>Wrong Network!</strong><br/>
            You&apos;re currently connected to the wrong network. TrustFlow requires Base Sepolia testnet.<br/>
            <Button 
              variant="outlined" 
              size="small" 
              onClick={() => switchChain({ chainId: baseSepolia.id })}
              sx={{ 
                marginTop: '8px',
                fontFamily: 'var(--font-doppio-one)',
                textTransform: 'none',
                borderColor: '#ff9800',
                color: '#ff9800',
                '&:hover': {
                  borderColor: '#f57c00',
                  backgroundColor: 'rgba(255, 152, 0, 0.1)'
                }
              }}
            >
              Switch to Base Sepolia
            </Button>
          </Typography>
        </Alert>
      )}

      {/* Simple form without stepper */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Box>
            <Typography variant="body1" sx={{ 
              fontFamily: 'var(--font-doppio-one)', 
              fontWeight: 700, 
              fontSize: '1.1rem', 
              marginBottom: '8px',
              color: '#000'
            }}>
              Payer Address (Your Address)
            </Typography>
            <TextField
              variant="outlined"
              fullWidth
              value={formData.payerAddress}
              onChange={(e) => handleInputChange('payerAddress', e.target.value)}
              placeholder="0x..."
              error={!!errors.payerAddress}
              helperText={errors.payerAddress || 'This is automatically filled with your connected wallet address'}
              size="medium"
            />
          </Box>

          <Box>
            <Typography variant="body1" sx={{ 
              fontFamily: 'var(--font-doppio-one)', 
              fontWeight: 700, 
              fontSize: '1.1rem', 
              marginBottom: '8px',
              color: '#000'
            }}>
              Payee Address
            </Typography>
            <TextField
              variant="outlined"
              fullWidth
              value={formData.payeeAddress}
              onChange={(e) => handleInputChange('payeeAddress', e.target.value)}
              placeholder="0x..."
              error={!!errors.payeeAddress}
              helperText={errors.payeeAddress || 'The address that will receive the funds when conditions are met'}
              size="medium"
            />
          </Box>

          <Box>
            <Typography variant="body1" sx={{ 
              fontFamily: 'var(--font-doppio-one)', 
              fontWeight: 700, 
              fontSize: '1.1rem', 
              marginBottom: '8px',
              color: '#000'
            }}>
              Amount (ETH)
            </Typography>
            <TextField
              variant="outlined"
              fullWidth
              type="number"
              inputProps={{ step: '0.001', min: '0' }}
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              placeholder="0.1"
              error={!!errors.amount}
              helperText={errors.amount || 'Amount to be held in escrow'}
              size="medium"
            />
          </Box>
        </Box>
        
        <Alert severity="info" sx={{ padding: '16px', borderRadius: '12px' }}>
          <Typography variant="body1" style={{ fontFamily: 'var(--font-doppio-one)', fontSize: '1rem', lineHeight: '1.6' }}>
            <strong>Fee Breakdown:</strong><br/>
            • Escrow Amount: {formData.amount || '0'} ETH<br/>
            • x402pay Creation Fee: {X402PAY_CREATION_FEE_ETH} ETH<br/>
            • <strong>Total Required: {totalRequired.toFixed(4)} ETH</strong>
          </Typography>
        </Alert>

        <Box>
          <Typography variant="body1" sx={{ 
            fontFamily: 'var(--font-doppio-one)', 
            fontWeight: 700, 
            fontSize: '1.1rem', 
            marginBottom: '8px',
            color: '#000'
          }}>
            Agreement Description
          </Typography>
          <TextField
            variant="outlined"
            fullWidth
            multiline
            rows={4}
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Describe the terms and conditions of this agreement..."
            error={!!errors.description}
            helperText={errors.description || 'A clear description of the agreement terms'}
            size="medium"
          />
        </Box>

        {/* Condition Type Selection */}
        <Box>
          <Typography variant="body1" sx={{ 
            fontFamily: 'var(--font-doppio-one)', 
            fontWeight: 700, 
            fontSize: '1.1rem', 
            marginBottom: '8px',
            color: '#000'
          }}>
            Condition Type
          </Typography>
          <FormControl fullWidth error={!!errors.conditionType}>
            <Select
              value={formData.conditionType}
              onChange={(e) => handleInputChange('conditionType', e.target.value as number)}
              size="medium"
              sx={{ 
                '& .MuiSelect-select': { padding: '18px 14px', fontSize: '1rem' },
                '& fieldset': {
                  borderWidth: '2px',
                  borderColor: '#000'
                },
                '&:hover fieldset': {
                  borderWidth: '2px',
                  borderColor: '#000'
                },
                '&.Mui-focused fieldset': {
                  borderWidth: '2px',
                  borderColor: '#66ADFF'
                }
              }}
            >
              <MenuItem value={0} sx={{ fontSize: '1rem', padding: '12px 16px' }}>Specific Date</MenuItem>
              <MenuItem value={1} sx={{ fontSize: '1rem', padding: '12px 16px' }}>Task Completion</MenuItem>
              <MenuItem value={2} sx={{ fontSize: '1rem', padding: '12px 16px' }}>GitHub PR Merged</MenuItem>
              <MenuItem value={3} sx={{ fontSize: '1rem', padding: '12px 16px' }}>API Condition</MenuItem>
              <MenuItem value={4} sx={{ fontSize: '1rem', padding: '12px 16px' }}>Custom Event</MenuItem>
            </Select>
            <FormHelperText sx={{ fontSize: '0.9rem', marginTop: '8px' }}>{errors.conditionType || 'Choose when funds should be released'}</FormHelperText>
          </FormControl>
        </Box>

        {/* Condition Details */}
        {renderConditionDetailsField}

        {/* Error Messages */}
        {errors.submit && (
          <Alert severity="error">{errors.submit}</Alert>
        )}

        {writeError && (
          <Alert severity="error">
            {parseBlockchainError(writeError).message}
          </Alert>
        )}

        {receiptError && (
          <Alert severity="error">
            Transaction failed: {receiptError.message}
          </Alert>
        )}

        {isSuccess && (
          <Alert severity="success">
            Agreement created successfully! Transaction hash: {hash}
          </Alert>
        )}

        {/* Submit Button */}
        <Box sx={{ display: 'flex', justifyContent: 'center', paddingTop: '24px' }}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isPending || isConfirming || isSuccess}
            size="large"
            sx={{
              backgroundColor: '#66ADFF',
              color: 'white',
              fontWeight: 600,
              px: 8,
              py: 3,
              borderRadius: '16px',
              textTransform: 'none',
              fontSize: '1.1rem',
              fontFamily: 'var(--font-doppio-one)',
              minWidth: '200px',
              minHeight: '56px',
              border: '2px solid #000',
              '&:hover': {
                backgroundColor: '#5A9AE6',
                border: '2px solid #000'
              },
              '&:disabled': {
                backgroundColor: 'rgba(102, 173, 255, 0.5)',
                border: '2px solid rgba(0, 0, 0, 0.3)'
              }
            }}
          >
            {isPending && <CircularProgress size={20} sx={{ marginRight: '8px' }} />}
            {isConfirming && <CircularProgress size={20} sx={{ marginRight: '8px' }} />}
            {isPending ? 'Creating...' : isConfirming ? 'Confirming...' : 'Create Agreement'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
} 
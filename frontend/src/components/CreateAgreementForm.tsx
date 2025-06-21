'use client';

import React, { useState, useEffect } from 'react';
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
  Box,
  Stepper,
  Step,
  StepLabel,
  Divider
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, keccak256, toBytes } from 'viem';
import { Timestamp } from 'firebase/firestore';
import { ESCROW_FACTORY_ADDRESS, ESCROW_FACTORY_ABI } from '../config/contracts';
import { useFirebase, AgreementData } from '../context/FirebaseContext';
import { validateDate } from '../utils/validation';
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

const CONDITION_TYPES = [
  { value: 0, label: 'Specific Date', description: 'Release funds on a specific date' },
  { value: 1, label: 'Task Completion', description: 'Release when task is marked complete (simulated)' },
  { value: 2, label: 'GitHub PR Merged', description: 'Release when GitHub PR is merged (simulated)' },
  { value: 3, label: 'API Condition', description: 'Release when API returns expected value (simulated)' },
  { value: 4, label: 'Custom Event', description: 'Release when custom event is triggered (simulated)' }
];

const steps = ['Agreement Details', 'Condition Setup', 'Review & Submit'];

export default function CreateAgreementForm() {
  const { address, isConnected } = useAccount();
  const { createAgreement, updateAgreement } = useFirebase();
  
  const [activeStep, setActiveStep] = useState(0);
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

  const handleInputChange = (field: keyof FormData, value: string | number | Date | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    switch (activeStep) {
      case 0: // Agreement Details
        if (!formData.payerAddress || !/^0x[a-fA-F0-9]{40}$/.test(formData.payerAddress)) {
          newErrors.payerAddress = 'Valid Ethereum address required';
        }
        if (!formData.payeeAddress || !/^0x[a-fA-F0-9]{40}$/.test(formData.payeeAddress)) {
          newErrors.payeeAddress = 'Valid Ethereum address required';
        }
        if (formData.payerAddress === formData.payeeAddress) {
          newErrors.payeeAddress = 'Payee address must be different from payer address';
        }
        if (!formData.amount || parseFloat(formData.amount) <= 0) {
          newErrors.amount = 'Amount must be greater than 0';
        }
        if (!formData.description.trim()) {
          newErrors.description = 'Description is required';
        }
        break;

      case 1: // Condition Setup
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
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
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

  const handleSubmit = async () => {
    if (!validateCurrentStep() || !isConnected) return;

    try {
      // First, save to Firestore
      const agreementData: Omit<AgreementData, 'id' | 'createdAt' | 'status'> = {
        payerAddress: formData.payerAddress,
        payeeAddress: formData.payeeAddress,
        amount: parseFloat(formData.amount),
        conditionType: formData.conditionType,
        description: formData.description,
        settlementDate: formData.settlementDate ? Timestamp.fromDate(formData.settlementDate) : undefined,
        taskName: formData.taskName,
        githubPrUrl: formData.githubPrUrl,
        apiEndpoint: formData.apiEndpoint,
        expectedValue: formData.expectedValue,
        customEventName: formData.customEventName,
      };

      const docId = await createAgreement(agreementData);
      setFirestoreDocId(docId);

      // Then create the smart contract
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
      console.error('Error creating agreement:', error);
      setErrors({ submit: 'Failed to create agreement. Please try again.' });
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box className="flex flex-col gap-4">
            <TextField
              label="Payer Address (Your Address)"
              fullWidth
              value={formData.payerAddress}
              onChange={(e) => handleInputChange('payerAddress', e.target.value)}
              placeholder="0x..."
              error={!!errors.payerAddress}
              helperText={errors.payerAddress || 'This is automatically filled with your connected wallet address'}
              disabled={isConnected}
            />

            <TextField
              label="Payee Address"
              fullWidth
              value={formData.payeeAddress}
              onChange={(e) => handleInputChange('payeeAddress', e.target.value)}
              placeholder="0x..."
              error={!!errors.payeeAddress}
              helperText={errors.payeeAddress || 'The address that will receive the funds when conditions are met'}
            />

            <TextField
              label="Amount (ETH)"
              fullWidth
              type="number"
              inputProps={{ step: '0.001', min: '0' }}
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              placeholder="0.1"
              error={!!errors.amount}
              helperText={errors.amount || 'Amount to be held in escrow'}
            />
            
            <Alert severity="info" className="mt-2">
              <Typography variant="body2">
                <strong>Fee Breakdown:</strong><br/>
                • Escrow Amount: {formData.amount || '0'} ETH<br/>
                • x402pay Creation Fee: {X402PAY_CREATION_FEE_ETH} ETH<br/>
                • <strong>Total Required: {formData.amount ? (parseFloat(formData.amount) + X402PAY_CREATION_FEE_ETH).toFixed(4) : X402PAY_CREATION_FEE_ETH} ETH</strong>
              </Typography>
            </Alert>

            <TextField
              label="Agreement Description"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe what this agreement is for..."
              error={!!errors.description}
              helperText={errors.description || 'A clear description of the agreement terms'}
            />
          </Box>
        );

      case 1:
        return (
          <Box className="flex flex-col gap-4">
            <FormControl fullWidth>
              <InputLabel>Condition Type</InputLabel>
              <Select
                value={formData.conditionType}
                label="Condition Type"
                onChange={(e) => handleInputChange('conditionType', e.target.value as number)}
              >
                {CONDITION_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    <Box>
                      <Typography variant="body1">{type.label}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {type.description}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Divider />

            <Typography variant="h6" className="font-medium">
              Condition Details
            </Typography>

            {renderConditionDetailsField()}
          </Box>
        );

      case 2:
        return (
          <Box className="flex flex-col gap-4">
            <Typography variant="h6" className="font-medium">
              Review Your Agreement
            </Typography>

            <Card variant="outlined">
              <CardContent>
                <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Payer</Typography>
                    <Typography variant="body2" className="font-mono">
                      {formData.payerAddress}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Payee</Typography>
                    <Typography variant="body2" className="font-mono">
                      {formData.payeeAddress}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Escrow Amount</Typography>
                    <Typography variant="body2" className="font-semibold">
                      {formData.amount} ETH
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Creation Fee</Typography>
                    <Typography variant="body2" className="font-semibold">
                      {X402PAY_CREATION_FEE_ETH} ETH
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Condition</Typography>
                    <Typography variant="body2">
                      {CONDITION_TYPES[formData.conditionType].label}
                    </Typography>
                  </Box>
                </Box>

                <Divider className="my-4" />
                
                <Box className="bg-blue-50 p-4 rounded-lg">
                  <Typography variant="subtitle2" color="text.secondary" className="mb-2">Total Transaction Cost</Typography>
                  <Typography variant="h6" className="font-bold text-blue-900">
                    {(parseFloat(formData.amount) + X402PAY_CREATION_FEE_ETH).toFixed(4)} ETH
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    This includes {formData.amount} ETH for escrow + {X402PAY_CREATION_FEE_ETH} ETH x402pay creation fee
                  </Typography>
                </Box>

                <Divider className="my-4" />

                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                  <Typography variant="body2">{formData.description}</Typography>
                </Box>

                {renderConditionSummary()}
              </CardContent>
            </Card>

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
          </Box>
        );

      default:
        return null;
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
            placeholder="e.g., 'Website Redesign Phase 1'"
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
  };

  const renderConditionSummary = () => {
    let summary = '';
    switch (formData.conditionType) {
      case 0:
        summary = `Funds will be released on ${formData.settlementDate?.toLocaleDateString()}`;
        break;
      case 1:
        summary = `Funds will be released when task "${formData.taskName}" is completed`;
        break;
      case 2:
        summary = `Funds will be released when PR ${formData.githubPrUrl} is merged`;
        break;
      case 3:
        summary = `Funds will be released when ${formData.apiEndpoint} returns "${formData.expectedValue}"`;
        break;
      case 4:
        summary = `Funds will be released when event "${formData.customEventName}" is triggered`;
        break;
    }

    return (
      <Box className="mt-4">
        <Typography variant="subtitle2" color="text.secondary">Condition Summary</Typography>
        <Typography variant="body2" className="italic">{summary}</Typography>
      </Box>
    );
  };

  if (!isConnected) {
    return (
      <Card className="w-full max-w-4xl">
        <CardContent>
          <Alert severity="warning">
            Please connect your wallet to create an agreement.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardContent>
        <Typography variant="h5" className="font-bold mb-6">
          Create New Agreement
        </Typography>

        <Stepper activeStep={activeStep} className="mb-8">
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box className="min-h-[400px]">
          {renderStepContent(activeStep)}
        </Box>

        <Box className="flex justify-between mt-6">
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            variant="outlined"
          >
            Back
          </Button>
          
          <Box className="flex gap-2">
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={isPending || isConfirming || isSuccess}
              >
                {isPending && <CircularProgress size={20} className="mr-2" />}
                {isConfirming && <CircularProgress size={20} className="mr-2" />}
                {isPending ? 'Creating...' : isConfirming ? 'Confirming...' : 'Create Agreement'}
              </Button>
            ) : (
              <Button variant="contained" onClick={handleNext}>
                Next
              </Button>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
} 
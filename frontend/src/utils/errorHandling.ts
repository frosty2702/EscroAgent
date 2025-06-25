import { BaseError, ContractFunctionRevertedError, InsufficientFundsError, UserRejectedRequestError } from 'viem';

export interface ErrorInfo {
  title: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  actionable?: boolean;
  retryable?: boolean;
}

/**
 * Parses blockchain/wallet errors into user-friendly messages
 */
export const parseBlockchainError = (error: any): ErrorInfo => { // eslint-disable-line @typescript-eslint/no-explicit-any
  console.error('Blockchain error:', error);

  // User rejected transaction
  if (error instanceof UserRejectedRequestError || error.code === 4001) {
    return {
      title: 'Transaction Cancelled',
      message: 'You cancelled the transaction. Please try again when ready.',
      severity: 'warning',
      actionable: true,
      retryable: true
    };
  }

  // Insufficient funds
  if (error instanceof InsufficientFundsError || error.code === -32000) {
    return {
      title: 'Insufficient Funds',
      message: 'You don\'t have enough ETH to complete this transaction. Please add funds to your wallet.',
      severity: 'error',
      actionable: true,
      retryable: false
    };
  }

  // Contract revert with reason
  if (error instanceof ContractFunctionRevertedError) {
    const revertReason = error.reason || 'Contract execution failed';
    return {
      title: 'Transaction Failed',
      message: `Smart contract error: ${revertReason}`,
      severity: 'error',
      actionable: false,
      retryable: false
    };
  }

  // Network/RPC errors
  if (error.code === -32603 || error.message?.includes('network')) {
    return {
      title: 'Network Error',
      message: 'Unable to connect to the blockchain network. Please check your connection and try again.',
      severity: 'error',
      actionable: true,
      retryable: true
    };
  }

  // Gas estimation failed
  if (error.message?.includes('gas') || error.message?.includes('Gas')) {
    return {
      title: 'Gas Estimation Failed',
      message: 'Unable to estimate gas for this transaction. The transaction may fail or the network may be congested.',
      severity: 'warning',
      actionable: true,
      retryable: true
    };
  }

  // Chain not supported
  if (error.message?.includes('chain') || error.code === 4902) {
    return {
      title: 'Wrong Network',
      message: 'Please switch to Base Sepolia network in your wallet.',
      severity: 'error',
      actionable: true,
      retryable: true
    };
  }

  // Wallet not connected
  if (error.message?.includes('wallet') || error.message?.includes('account')) {
    return {
      title: 'Wallet Not Connected',
      message: 'Please connect your wallet to continue.',
      severity: 'error',
      actionable: true,
      retryable: true
    };
  }

  // Generic viem/wagmi error
  if (error instanceof BaseError) {
    return {
      title: 'Transaction Error',
      message: error.shortMessage || error.message || 'An unexpected error occurred',
      severity: 'error',
      actionable: false,
      retryable: false
    };
  }

  // Fallback for unknown errors
  return {
    title: 'Unexpected Error',
    message: error.message || 'An unexpected error occurred. Please try again.',
    severity: 'error',
    actionable: false,
    retryable: true
  };
};

/**
 * Parses form validation errors
 */
export const parseValidationError = (error: string): ErrorInfo => {
  return {
    title: 'Validation Error',
    message: error,
    severity: 'warning',
    actionable: true,
    retryable: false
  };
};

/**
 * Parses API/network errors
 */
export const parseNetworkError = (error: any): ErrorInfo => { // eslint-disable-line @typescript-eslint/no-explicit-any
  if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
    return {
      title: 'Network Error',
      message: 'Please check your internet connection and try again.',
      severity: 'error',
      actionable: true,
      retryable: true
    };
  }

  if (error.status === 429) {
    return {
      title: 'Rate Limited',
      message: 'Too many requests. Please wait a moment and try again.',
      severity: 'warning',
      actionable: true,
      retryable: true
    };
  }

  if (error.status >= 500) {
    return {
      title: 'Server Error',
      message: 'The server is temporarily unavailable. Please try again later.',
      severity: 'error',
      actionable: true,
      retryable: true
    };
  }

  return {
    title: 'Request Failed',
    message: error.message || 'The request could not be completed.',
    severity: 'error',
    actionable: false,
    retryable: true
  };
};

/**
 * Creates a standardized error object for logging
 */
export const createErrorLog = (error: any, context: string): object => { // eslint-disable-line @typescript-eslint/no-explicit-any
  return {
    timestamp: new Date().toISOString(),
    context,
    error: {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    },
    userAgent: navigator.userAgent,
    url: window.location.href
  };
};

/**
 * Safe async function wrapper with error handling
 */
export const safeAsync = async <T>(
  fn: () => Promise<T>,
  errorHandler?: (error: any) => void // eslint-disable-line @typescript-eslint/no-explicit-any
): Promise<T | null> => {
  try {
    return await fn();
  } catch (error) {
    console.error('Safe async error:', error);
    if (errorHandler) {
      errorHandler(error);
    }
    return null;
  }
};

/**
 * Retry mechanism for failed operations
 */
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> => {
  let lastError: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Exponential backoff
      const delay = delayMs * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

/**
 * Checks if an error is retryable
 */
export const isRetryableError = (error: any): boolean => { // eslint-disable-line @typescript-eslint/no-explicit-any
  const retryableCodes = [
    -32603, // Internal error
    429,    // Rate limit
    500,    // Server error
    502,    // Bad gateway
    503,    // Service unavailable
    504     // Gateway timeout
  ];
  
  return retryableCodes.includes(error.code) || 
         retryableCodes.includes(error.status) ||
         error.message?.includes('network') ||
         error.message?.includes('timeout');
};

/**
 * Formats error for user display
 */
export const formatErrorForUser = (errorInfo: ErrorInfo): string => {
  let message = errorInfo.message;
  
  if (errorInfo.actionable && errorInfo.retryable) {
    message += ' Please try again.';
  } else if (errorInfo.actionable && !errorInfo.retryable) {
    message += ' Please check your input and try again.';
  }
  
  return message;
}; 
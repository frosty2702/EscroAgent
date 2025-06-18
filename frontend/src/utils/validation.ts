import { isAddress } from 'viem';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface AgreementFormData {
  payerAddress: string;
  payeeAddress: string;
  amount: string;
  conditionType: number;
  settlementDate?: string;
  taskName?: string;
  githubPrUrl?: string;
  apiEndpoint?: string;
  expectedValue?: string;
  customEventName?: string;
  agreementDescription: string;
}

/**
 * Validates Ethereum addresses
 */
export const validateAddress = (address: string): ValidationResult => {
  if (!address || address.trim() === '') {
    return { isValid: false, error: 'Address is required' };
  }

  if (!isAddress(address)) {
    return { isValid: false, error: 'Invalid Ethereum address format' };
  }

  return { isValid: true };
};

/**
 * Validates ETH amounts
 */
export const validateAmount = (amount: string): ValidationResult => {
  if (!amount || amount.trim() === '') {
    return { isValid: false, error: 'Amount is required' };
  }

  const numAmount = parseFloat(amount);
  
  if (isNaN(numAmount)) {
    return { isValid: false, error: 'Amount must be a valid number' };
  }

  if (numAmount <= 0) {
    return { isValid: false, error: 'Amount must be greater than 0' };
  }

  if (numAmount > 1000) {
    return { isValid: false, error: 'Amount cannot exceed 1000 ETH for security' };
  }

  // Check for too many decimal places (max 18 for wei precision)
  const decimalPlaces = (amount.split('.')[1] || '').length;
  if (decimalPlaces > 18) {
    return { isValid: false, error: 'Amount has too many decimal places (max 18)' };
  }

  return { isValid: true };
};

/**
 * Validates dates for date-based conditions
 */
export const validateDate = (dateString: string): ValidationResult => {
  if (!dateString || dateString.trim() === '') {
    return { isValid: false, error: 'Settlement date is required' };
  }

  const date = new Date(dateString);
  const now = new Date();

  if (isNaN(date.getTime())) {
    return { isValid: false, error: 'Invalid date format' };
  }

  if (date <= now) {
    return { isValid: false, error: 'Settlement date must be in the future' };
  }

  // Don't allow dates too far in the future (1 year max)
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
  
  if (date > oneYearFromNow) {
    return { isValid: false, error: 'Settlement date cannot be more than 1 year in the future' };
  }

  return { isValid: true };
};

/**
 * Validates task names
 */
export const validateTaskName = (taskName: string): ValidationResult => {
  if (!taskName || taskName.trim() === '') {
    return { isValid: false, error: 'Task name is required' };
  }

  if (taskName.length < 3) {
    return { isValid: false, error: 'Task name must be at least 3 characters' };
  }

  if (taskName.length > 200) {
    return { isValid: false, error: 'Task name cannot exceed 200 characters' };
  }

  // Basic sanitization check
  const sanitizedTask = taskName.replace(/[<>]/g, '');
  if (sanitizedTask !== taskName) {
    return { isValid: false, error: 'Task name contains invalid characters' };
  }

  return { isValid: true };
};

/**
 * Validates GitHub PR URLs
 */
export const validateGithubUrl = (url: string): ValidationResult => {
  if (!url || url.trim() === '') {
    return { isValid: false, error: 'GitHub PR URL is required' };
  }

  try {
    const urlObj = new URL(url);
    
    if (urlObj.hostname !== 'github.com') {
      return { isValid: false, error: 'URL must be from github.com' };
    }

    // Basic pattern: https://github.com/owner/repo/pull/number
    const pathPattern = /^\/[^\/]+\/[^\/]+\/pull\/\d+\/?$/;
    if (!pathPattern.test(urlObj.pathname)) {
      return { isValid: false, error: 'Invalid GitHub PR URL format' };
    }

    return { isValid: true };
  } catch {
    return { isValid: false, error: 'Invalid URL format' };
  }
};

/**
 * Validates API endpoints
 */
export const validateApiEndpoint = (endpoint: string): ValidationResult => {
  if (!endpoint || endpoint.trim() === '') {
    return { isValid: false, error: 'API endpoint is required' };
  }

  try {
    const url = new URL(endpoint);
    
    if (!['http:', 'https:'].includes(url.protocol)) {
      return { isValid: false, error: 'API endpoint must use HTTP or HTTPS' };
    }

    if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
      return { isValid: false, error: 'Localhost endpoints are not allowed for security' };
    }

    return { isValid: true };
  } catch {
    return { isValid: false, error: 'Invalid API endpoint URL format' };
  }
};

/**
 * Validates expected values for API conditions
 */
export const validateExpectedValue = (value: string): ValidationResult => {
  if (!value || value.trim() === '') {
    return { isValid: false, error: 'Expected value is required' };
  }

  if (value.length > 500) {
    return { isValid: false, error: 'Expected value cannot exceed 500 characters' };
  }

  return { isValid: true };
};

/**
 * Validates custom event names
 */
export const validateCustomEventName = (eventName: string): ValidationResult => {
  if (!eventName || eventName.trim() === '') {
    return { isValid: false, error: 'Custom event name is required' };
  }

  if (eventName.length < 3) {
    return { isValid: false, error: 'Event name must be at least 3 characters' };
  }

  if (eventName.length > 100) {
    return { isValid: false, error: 'Event name cannot exceed 100 characters' };
  }

  // Only allow alphanumeric, spaces, underscores, and hyphens
  const validPattern = /^[a-zA-Z0-9\s_-]+$/;
  if (!validPattern.test(eventName)) {
    return { isValid: false, error: 'Event name can only contain letters, numbers, spaces, underscores, and hyphens' };
  }

  return { isValid: true };
};

/**
 * Validates agreement descriptions
 */
export const validateDescription = (description: string): ValidationResult => {
  if (!description || description.trim() === '') {
    return { isValid: false, error: 'Agreement description is required' };
  }

  if (description.length < 10) {
    return { isValid: false, error: 'Description must be at least 10 characters' };
  }

  if (description.length > 2000) {
    return { isValid: false, error: 'Description cannot exceed 2000 characters' };
  }

  return { isValid: true };
};

/**
 * Validates the entire agreement form
 */
export const validateAgreementForm = (formData: AgreementFormData): ValidationResult => {
  // Validate payer address
  const payerValidation = validateAddress(formData.payerAddress);
  if (!payerValidation.isValid) {
    return { isValid: false, error: `Payer address: ${payerValidation.error}` };
  }

  // Validate payee address
  const payeeValidation = validateAddress(formData.payeeAddress);
  if (!payeeValidation.isValid) {
    return { isValid: false, error: `Payee address: ${payeeValidation.error}` };
  }

  // Check if payer and payee are different
  if (formData.payerAddress.toLowerCase() === formData.payeeAddress.toLowerCase()) {
    return { isValid: false, error: 'Payer and payee addresses must be different' };
  }

  // Validate amount
  const amountValidation = validateAmount(formData.amount);
  if (!amountValidation.isValid) {
    return { isValid: false, error: `Amount: ${amountValidation.error}` };
  }

  // Validate condition-specific fields
  switch (formData.conditionType) {
    case 0: // Date condition
      if (formData.settlementDate) {
        const dateValidation = validateDate(formData.settlementDate);
        if (!dateValidation.isValid) {
          return { isValid: false, error: `Settlement date: ${dateValidation.error}` };
        }
      }
      break;

    case 1: // Task completion
      if (formData.taskName) {
        const taskValidation = validateTaskName(formData.taskName);
        if (!taskValidation.isValid) {
          return { isValid: false, error: `Task name: ${taskValidation.error}` };
        }
      }
      break;

    case 2: // GitHub PR
      if (formData.githubPrUrl) {
        const githubValidation = validateGithubUrl(formData.githubPrUrl);
        if (!githubValidation.isValid) {
          return { isValid: false, error: `GitHub PR URL: ${githubValidation.error}` };
        }
      }
      break;

    case 3: // API call
      if (formData.apiEndpoint) {
        const apiValidation = validateApiEndpoint(formData.apiEndpoint);
        if (!apiValidation.isValid) {
          return { isValid: false, error: `API endpoint: ${apiValidation.error}` };
        }
      }
      if (formData.expectedValue) {
        const valueValidation = validateExpectedValue(formData.expectedValue);
        if (!valueValidation.isValid) {
          return { isValid: false, error: `Expected value: ${valueValidation.error}` };
        }
      }
      break;

    case 4: // Custom event
      if (formData.customEventName) {
        const eventValidation = validateCustomEventName(formData.customEventName);
        if (!eventValidation.isValid) {
          return { isValid: false, error: `Custom event name: ${eventValidation.error}` };
        }
      }
      break;
  }

  // Validate description
  const descriptionValidation = validateDescription(formData.agreementDescription);
  if (!descriptionValidation.isValid) {
    return { isValid: false, error: `Description: ${descriptionValidation.error}` };
  }

  return { isValid: true };
};

/**
 * Sanitizes user input to prevent XSS
 */
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .trim(); // Remove leading/trailing whitespace
};

/**
 * Validates transaction hash format
 */
export const validateTxHash = (hash: string): ValidationResult => {
  if (!hash || hash.trim() === '') {
    return { isValid: false, error: 'Transaction hash is required' };
  }

  const txHashPattern = /^0x[a-fA-F0-9]{64}$/;
  if (!txHashPattern.test(hash)) {
    return { isValid: false, error: 'Invalid transaction hash format' };
  }

  return { isValid: true };
}; 
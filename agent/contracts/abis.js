// Contract ABIs for agent interaction

const ESCROW_FACTORY_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_x402payFeeAddress",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_x402payFeeAmount",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "_authorizedAgent",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "escrowAddress",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "payer",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "payee",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "conditionType",
        "type": "uint256"
      },
      {
        "internalType": "bytes32",
        "name": "conditionHash",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "AgreementCreated",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "getDeployedEscrows",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "",
        "type": "address[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

const ESCROW_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_payer",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_payee",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_amount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_conditionType",
        "type": "uint256"
      },
      {
        "internalType": "bytes32",
        "name": "_conditionDetailsHash",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "_authorizedAgent",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_x402payFeeAddress",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_x402payFeeAmount",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "payer",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "payee",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "AgreementSettled",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "settle",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getStatus",
    "outputs": [
      {
        "internalType": "enum Escrow.Status",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAgreementDetails",
    "outputs": [
      {
        "internalType": "address",
        "name": "payer",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "payee",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "conditionType",
        "type": "uint256"
      },
      {
        "internalType": "bytes32",
        "name": "conditionDetailsHash",
        "type": "bytes32"
      },
      {
        "internalType": "uint8",
        "name": "status",
        "type": "uint8"
      },
      {
        "internalType": "uint256",
        "name": "createdAt",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "settledAt",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getBalance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

module.exports = {
  ESCROW_FACTORY_ABI,
  ESCROW_ABI
}; 
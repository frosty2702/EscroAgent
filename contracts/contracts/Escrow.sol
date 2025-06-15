// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Escrow
 * @dev Handles individual escrow agreements with conditional payments
 */
contract Escrow is ReentrancyGuard, Ownable {
    // Struct to store agreement details
    struct Agreement {
        address payer;
        address payee;
        uint256 amount;
        uint256 conditionType; // 0: Date, 1: Task, 2: PR URL
        bytes32 conditionDetailsHash;
        bool isSettled;
        bool isDisputed;
    }

    // State variables
    Agreement public agreement;
    address public authorizedAgent;
    address public immutable x402payFeeAddress;
    uint256 public immutable x402payFeeAmount;

    // Events
    event AgreementSettled(address indexed payer, address indexed payee, uint256 amount);
    event DisputeInitiated(address indexed initiator, string reason);
    event FundsReceived(address indexed payer, uint256 amount);

    // Modifiers
    modifier onlyAgent() {
        require(msg.sender == authorizedAgent, "Only authorized agent can call this function");
        _;
    }

    modifier notSettled() {
        require(!agreement.isSettled, "Agreement already settled");
        _;
    }

    modifier notDisputed() {
        require(!agreement.isDisputed, "Agreement is disputed");
        _;
    }

    /**
     * @dev Constructor initializes the escrow agreement
     * @param _payer Address of the payer
     * @param _payee Address of the payee
     * @param _amount Amount to be escrowed
     * @param _conditionType Type of condition (0: Date, 1: Task, 2: PR URL)
     * @param _conditionDetailsHash Hash of condition details
     * @param _authorizedAgent Address of the authorized agent
     * @param _x402payFeeAddress Address to receive x402pay fees
     * @param _x402payFeeAmount Amount of x402pay fee
     */
    constructor(
        address _payer,
        address _payee,
        uint256 _amount,
        uint256 _conditionType,
        bytes32 _conditionDetailsHash,
        address _authorizedAgent,
        address _x402payFeeAddress,
        uint256 _x402payFeeAmount
    ) Ownable(_payer) {
        require(_payer != address(0), "Invalid payer address");
        require(_payee != address(0), "Invalid payee address");
        require(_amount > 0, "Amount must be greater than 0");
        require(_authorizedAgent != address(0), "Invalid agent address");
        require(_x402payFeeAddress != address(0), "Invalid fee address");
        require(_x402payFeeAmount < _amount, "Fee amount must be less than total amount");

        agreement = Agreement({
            payer: _payer,
            payee: _payee,
            amount: _amount,
            conditionType: _conditionType,
            conditionDetailsHash: _conditionDetailsHash,
            isSettled: false,
            isDisputed: false
        });

        authorizedAgent = _authorizedAgent;
        x402payFeeAddress = _x402payFeeAddress;
        x402payFeeAmount = _x402payFeeAmount;
    }

    /**
     * @dev Allows the authorized agent to settle the agreement
     * @notice Transfers funds to payee and x402pay fee to designated address
     */
    function settle() external onlyAgent notSettled notDisputed nonReentrant {
        agreement.isSettled = true;
        
        // Calculate amounts
        uint256 payeeAmount = agreement.amount - x402payFeeAmount;
        
        // Transfer funds
        (bool payeeSuccess, ) = agreement.payee.call{value: payeeAmount}("");
        require(payeeSuccess, "Transfer to payee failed");

        (bool feeSuccess, ) = x402payFeeAddress.call{value: x402payFeeAmount}("");
        require(feeSuccess, "Transfer of fee failed");

        emit AgreementSettled(agreement.payer, agreement.payee, agreement.amount);
    }

    /**
     * @dev Allows payer or payee to initiate a dispute
     * @param reason Reason for the dispute
     */
    function initiateDispute(string calldata reason) external notSettled {
        require(
            msg.sender == agreement.payer || msg.sender == agreement.payee,
            "Only payer or payee can initiate dispute"
        );
        
        agreement.isDisputed = true;
        emit DisputeInitiated(msg.sender, reason);
    }

    /**
     * @dev Receive function to accept ETH
     */
    receive() external payable {
        require(msg.sender == agreement.payer, "Only payer can send funds");
        require(msg.value == agreement.amount, "Incorrect amount sent");
        emit FundsReceived(msg.sender, msg.value);
    }

    /**
     * @dev Returns the current balance of the contract
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
} 
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Escrow
 * @dev Handles individual escrow agreements with conditional payments
 */
contract Escrow is ReentrancyGuard, Ownable {
    // Enum for agreement status
    enum Status { Pending, Escrowed, Settled, Disputed }

    // Struct to store agreement details
    struct Agreement {
        address payer;
        address payee;
        uint256 amount;
        uint256 conditionType; // 0: Date, 1: Task, 2: PR URL
        bytes32 conditionDetailsHash;
        Status status;
        uint256 createdAt;
        uint256 settledAt;
    }

    // State variables
    Agreement public agreement;
    address public authorizedAgent;
    address public immutable x402payFeeAddress;
    uint256 public immutable x402payFeeAmount;

    // Events
    event AgreementSettled(address indexed payer, address indexed payee, uint256 amount, uint256 timestamp);
    event DisputeInitiated(address indexed initiator, string reason, uint256 timestamp);
    event FundsReceived(address indexed payer, uint256 amount, uint256 timestamp);
    event StatusChanged(Status oldStatus, Status newStatus, uint256 timestamp);

    // Modifiers
    modifier onlyAgent() {
        require(msg.sender == authorizedAgent, "Only authorized agent can call this function");
        _;
    }

    modifier notSettled() {
        require(agreement.status != Status.Settled, "Agreement already settled");
        _;
    }

    modifier notDisputed() {
        require(agreement.status != Status.Disputed, "Agreement is disputed");
        _;
    }

    modifier onlyParticipant() {
        require(
            msg.sender == agreement.payer || msg.sender == agreement.payee,
            "Only payer or payee can call this function"
        );
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
            status: Status.Pending,
            createdAt: block.timestamp,
            settledAt: 0
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
        Status oldStatus = agreement.status;
        agreement.status = Status.Settled;
        agreement.settledAt = block.timestamp;
        
        // Calculate amounts
        uint256 payeeAmount = agreement.amount - x402payFeeAmount;
        
        // Transfer funds
        (bool payeeSuccess, ) = agreement.payee.call{value: payeeAmount}("");
        require(payeeSuccess, "Transfer to payee failed");

        (bool feeSuccess, ) = x402payFeeAddress.call{value: x402payFeeAmount}("");
        require(feeSuccess, "Transfer of fee failed");

        emit StatusChanged(oldStatus, Status.Settled, block.timestamp);
        emit AgreementSettled(agreement.payer, agreement.payee, agreement.amount, block.timestamp);
    }

    /**
     * @dev Allows payer or payee to initiate a dispute
     * @param reason Reason for the dispute
     */
    function initiateDispute(string calldata reason) external onlyParticipant notSettled {
        Status oldStatus = agreement.status;
        agreement.status = Status.Disputed;
        
        emit StatusChanged(oldStatus, Status.Disputed, block.timestamp);
        emit DisputeInitiated(msg.sender, reason, block.timestamp);
    }

    /**
     * @dev Receive function to accept ETH
     */
    receive() external payable {
        require(msg.sender == agreement.payer, "Only payer can send funds");
        require(msg.value == agreement.amount, "Incorrect amount sent");
        
        Status oldStatus = agreement.status;
        agreement.status = Status.Escrowed;
        
        emit StatusChanged(oldStatus, Status.Escrowed, block.timestamp);
        emit FundsReceived(msg.sender, msg.value, block.timestamp);
    }

    /**
     * @dev Returns the current balance of the contract
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @dev Returns the current status of the agreement
     */
    function getStatus() external view returns (Status) {
        return agreement.status;
    }

    /**
     * @dev Returns the agreement details
     */
    function getAgreementDetails() external view returns (
        address payer,
        address payee,
        uint256 amount,
        uint256 conditionType,
        bytes32 conditionDetailsHash,
        Status status,
        uint256 createdAt,
        uint256 settledAt
    ) {
        Agreement memory a = agreement;
        return (
            a.payer,
            a.payee,
            a.amount,
            a.conditionType,
            a.conditionDetailsHash,
            a.status,
            a.createdAt,
            a.settledAt
        );
    }
} 
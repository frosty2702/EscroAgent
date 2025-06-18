// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Escrow.sol";

/**
 * @title EscrowFactory
 * @dev Factory contract for deploying Escrow instances
 */
contract EscrowFactory {
    // State variables
    address public immutable x402payFeeAddress;
    uint256 public immutable x402payFeeAmount;
    address public immutable authorizedAgent;
    
    // Track deployed escrow contracts
    mapping(address => bool) public isEscrowContract;
    address[] public deployedEscrows;
    
    // Statistics
    uint256 public totalAgreements;
    uint256 public totalVolume;

    // Events
    event AgreementCreated(
        address indexed escrowAddress,
        address indexed payer,
        address indexed payee,
        uint256 amount,
        uint256 conditionType,
        bytes32 conditionHash,
        uint256 timestamp
    );

    event FactoryInitialized(
        address indexed x402payFeeAddress,
        uint256 x402payFeeAmount,
        address indexed authorizedAgent,
        uint256 timestamp
    );

    /**
     * @dev Constructor sets up the factory with x402pay fee details and authorized agent
     * @param _x402payFeeAddress Address to receive x402pay fees
     * @param _x402payFeeAmount Amount of x402pay fee
     * @param _authorizedAgent Address of the authorized agent
     */
    constructor(
        address _x402payFeeAddress,
        uint256 _x402payFeeAmount,
        address _authorizedAgent
    ) {
        require(_x402payFeeAddress != address(0), "Invalid fee address");
        require(_authorizedAgent != address(0), "Invalid agent address");
        require(_x402payFeeAmount > 0, "Fee amount must be greater than 0");
        
        x402payFeeAddress = _x402payFeeAddress;
        x402payFeeAmount = _x402payFeeAmount;
        authorizedAgent = _authorizedAgent;

        emit FactoryInitialized(
            _x402payFeeAddress,
            _x402payFeeAmount,
            _authorizedAgent,
            block.timestamp
        );
    }

    /**
     * @dev Creates a new escrow agreement
     * @param _payee Address of the payee
     * @param _amount Amount to be escrowed
     * @param _conditionType Type of condition (0: Date, 1: Task, 2: PR URL)
     * @param _conditionHash Hash of condition details
     * @return escrowAddress Address of the newly deployed Escrow contract
     */
    function createEscrow(
        address _payee,
        uint256 _amount,
        uint256 _conditionType,
        bytes32 _conditionHash
    ) external payable returns (address escrowAddress) {
        require(_payee != address(0), "Invalid payee address");
        require(_amount > 0, "Amount must be greater than 0");
        require(msg.value == _amount, "Incorrect amount sent");
        require(_conditionType <= 2, "Invalid condition type"); // 0: Date, 1: Task, 2: PR URL

        // Deploy new Escrow contract
        Escrow escrow = new Escrow(
            msg.sender, // payer
            _payee,
            _amount,
            _conditionType,
            _conditionHash,
            authorizedAgent,
            x402payFeeAddress,
            x402payFeeAmount
        );

        escrowAddress = address(escrow);
        
        // Track the deployed contract
        isEscrowContract[escrowAddress] = true;
        deployedEscrows.push(escrowAddress);
        
        // Update statistics
        totalAgreements++;
        totalVolume += _amount;

        // Transfer funds to the new Escrow contract
        (bool success, ) = escrowAddress.call{value: _amount}("");
        require(success, "Transfer to escrow failed");

        // Emit event
        emit AgreementCreated(
            escrowAddress,
            msg.sender,
            _payee,
            _amount,
            _conditionType,
            _conditionHash,
            block.timestamp
        );

        return escrowAddress;
    }

    /**
     * @dev Returns the total number of agreements created
     * @return count Number of agreements
     */
    function getAgreementCount() external view returns (uint256) {
        return totalAgreements;
    }

    /**
     * @dev Returns the total volume of all agreements
     * @return volume Total volume in wei
     */
    function getTotalVolume() external view returns (uint256) {
        return totalVolume;
    }

    /**
     * @dev Returns all deployed escrow contracts
     * @return Array of deployed escrow contract addresses
     */
    function getDeployedEscrows() external view returns (address[] memory) {
        return deployedEscrows;
    }

    /**
     * @dev Returns the number of deployed escrow contracts
     * @return count Number of deployed contracts
     */
    function getDeployedEscrowsCount() external view returns (uint256) {
        return deployedEscrows.length;
    }
} 
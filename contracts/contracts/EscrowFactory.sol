// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Escrow.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title EscrowFactory
 * @dev Factory contract for deploying Escrow instances
 */
contract EscrowFactory is Ownable {
    // State variables
    address public immutable x402payFeeAddress;
    uint256 public immutable x402payFeeAmount;
    address public immutable authorizedAgent;
    uint256 public x402payCreationFee;
    
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
        uint256 x402payCreationFee,
        uint256 timestamp
    );

    event X402payCreationFeeUpdated(
        uint256 oldFee,
        uint256 newFee
    );

    /**
     * @dev Constructor sets up the factory with x402pay fee details and authorized agent
     * @param _x402payFeeAddress Address to receive x402pay fees
     * @param _x402payFeeAmount Amount of x402pay fee for settlement
     * @param _authorizedAgent Address of the authorized agent
     * @param _x402payCreationFee Amount of x402pay fee for escrow creation
     */
    constructor(
        address _x402payFeeAddress,
        uint256 _x402payFeeAmount,
        address _authorizedAgent,
        uint256 _x402payCreationFee
    ) Ownable(msg.sender) {
        require(_x402payFeeAddress != address(0), "Invalid fee address");
        require(_authorizedAgent != address(0), "Invalid agent address");
        require(_x402payFeeAmount > 0, "Fee amount must be greater than 0");
        require(_x402payCreationFee >= 0, "Creation fee cannot be negative");
        
        x402payFeeAddress = _x402payFeeAddress;
        x402payFeeAmount = _x402payFeeAmount;
        authorizedAgent = _authorizedAgent;
        x402payCreationFee = _x402payCreationFee;

        emit FactoryInitialized(
            _x402payFeeAddress,
            _x402payFeeAmount,
            _authorizedAgent,
            _x402payCreationFee,
            block.timestamp
        );
    }

    /**
     * @dev Creates a new escrow agreement
     * @param _payee Address of the payee
     * @param _amount Amount to be escrowed (excluding creation fee)
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
        require(msg.value >= x402payCreationFee, "Insufficient ETH for creation fee");
        require(_conditionType <= 2, "Invalid condition type"); // 0: Date, 1: Task, 2: PR URL

        // Calculate the actual escrow amount after deducting creation fee
        uint256 amountToEscrow = msg.value - x402payCreationFee;
        require(amountToEscrow == _amount, "Incorrect escrow amount after fee deduction");

        // Transfer creation fee to x402pay fee address
        if (x402payCreationFee > 0) {
            (bool feeSuccess, ) = x402payFeeAddress.call{value: x402payCreationFee}("");
            require(feeSuccess, "Creation fee transfer failed");
        }

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
        (bool success, ) = escrowAddress.call{value: amountToEscrow}("");
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
     * @dev Updates the x402pay creation fee (owner only)
     * @param _newCreationFee New creation fee amount
     */
    function updateX402payCreationFee(uint256 _newCreationFee) external onlyOwner {
        require(_newCreationFee >= 0, "Creation fee cannot be negative");
        
        uint256 oldFee = x402payCreationFee;
        x402payCreationFee = _newCreationFee;
        
        emit X402payCreationFeeUpdated(oldFee, _newCreationFee);
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

    /**
     * @dev Returns the current creation fee
     * @return fee Current x402pay creation fee amount
     */
    function getX402payCreationFee() external view returns (uint256) {
        return x402payCreationFee;
    }
} 
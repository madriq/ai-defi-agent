 // SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract FlashLoanTrader {
    address public owner;
    bool public tradingPaused;
    uint256 public maxPositionSize;

    uint256 public totalLoans;
    int256 public totalProfitLoss;

    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

    event TradingPauseChanged(bool isPaused);

    event MaxPositionSizeUpdated(
        uint256 previousMaxPositionSize,
        uint256 newMaxPositionSize
    );

    event TradeExecuted(
        string direction,
        uint256 entryPrice,
        uint256 exitPrice,
        uint256 positionSize,
        int256 profitLoss
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier whenTradingActive() {
        require(!tradingPaused, "Trading is paused");
        _;
    }

    constructor(uint256 initialMaxPositionSize) {
        require(
            initialMaxPositionSize > 0,
            "Max position size must be greater than zero"
        );

        owner = msg.sender;
        maxPositionSize = initialMaxPositionSize;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner cannot be the zero address");

        address previousOwner = owner;
        owner = newOwner;

        emit OwnershipTransferred(previousOwner, newOwner);
    }

    function setTradingPaused(bool isPaused) external onlyOwner {
        tradingPaused = isPaused;

        emit TradingPauseChanged(isPaused);
    }

    function setMaxPositionSize(uint256 newMaxPositionSize) external onlyOwner {
        require(
            newMaxPositionSize > 0,
            "Max position size must be greater than zero"
        );

        uint256 previousMaxPositionSize = maxPositionSize;
        maxPositionSize = newMaxPositionSize;

        emit MaxPositionSizeUpdated(
            previousMaxPositionSize,
            newMaxPositionSize
        );
    }

    function simulateTrade(
        string calldata direction,
        uint256 entryPrice,
        uint256 exitPrice,
        uint256 positionSize
    ) external whenTradingActive {
        require(entryPrice > 0, "Entry price must be greater than zero");
        require(exitPrice > 0, "Exit price must be greater than zero");
        require(positionSize > 0, "Position size must be greater than zero");
        require(
            positionSize <= maxPositionSize,
            "Position size exceeds the allowed maximum"
        );

        int256 profitLoss;

        if (
            keccak256(bytes(direction)) ==
            keccak256(bytes("LONG"))
        ) {
            if (exitPrice >= entryPrice) {
                profitLoss =
                    int256((exitPrice - entryPrice) * positionSize);
            } else {
                profitLoss =
                    -int256((entryPrice - exitPrice) * positionSize);
            }
        } else if (
            keccak256(bytes(direction)) ==
            keccak256(bytes("SHORT"))
        ) {
            if (exitPrice <= entryPrice) {
                profitLoss =
                    int256((entryPrice - exitPrice) * positionSize);
            } else {
                profitLoss =
                    -int256((exitPrice - entryPrice) * positionSize);
            }
        } else {
            revert("Direction must be LONG or SHORT");
        }

        totalLoans += positionSize;
        totalProfitLoss += profitLoss;

        emit TradeExecuted(
            direction,
            entryPrice,
            exitPrice,
            positionSize,
            profitLoss
        );
    }

    function checkLiquidation(
        string calldata direction,
        uint256 currentPrice,
        uint256 liquidationPrice
    ) external pure returns (bool) {
        require(
            currentPrice > 0,
            "Current price must be greater than zero"
        );

        require(
            liquidationPrice > 0,
            "Liquidation price must be greater than zero"
        );

        if (
            keccak256(bytes(direction)) ==
            keccak256(bytes("LONG"))
        ) {
            return currentPrice <= liquidationPrice;
        }

        if (
            keccak256(bytes(direction)) ==
            keccak256(bytes("SHORT"))
        ) {
            return currentPrice >= liquidationPrice;
        }

        revert("Direction must be LONG or SHORT");
    }

    function getStats()
        external
        view
        returns (
            uint256 loans,
            int256 profitLoss
        )
    {
        return (totalLoans, totalProfitLoss);
    }
}

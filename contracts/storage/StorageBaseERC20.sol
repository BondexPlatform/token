// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

abstract contract StorageBaseERC20 {
    /// @custom:storage-location erc7201:BaseERC20Storage
    struct BaseERC20Storage {
        uint8 decimals;
    }

    // keccak256(abi.encode(uint256(keccak256("BaseERC20Storage")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant BaseERC20StorageLocation =
        0x2a568c158d9a566796b434ce4d84ce7a0cd037b2863172b20b519b53f5d59200;

    function _getBaseERC20Storage()
        internal
        pure
        returns (BaseERC20Storage storage $)
    {
        assembly {
            $.slot := BaseERC20StorageLocation
        }
    }
}

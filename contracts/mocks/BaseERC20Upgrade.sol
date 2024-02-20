// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "../BaseERC20.sol";

contract BaseERC20Upgrade is BaseERC20 {
    function sayHi() public pure returns (string memory) {
        return "Hi";
    }
}

// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {ERC20Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import {ERC20BurnableUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import {ERC20PermitUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PermitUpgradeable.sol";
import {AccessControlDefaultAdminRulesUpgradeable} from "@openzeppelin/contracts-upgradeable/access/extensions/AccessControlDefaultAdminRulesUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

import {StorageBaseERC20} from "./storage/StorageBaseERC20.sol";
import {IBaseERC20} from "./interfaces/IBaseERC20.sol";

contract BaseERC20 is
    StorageBaseERC20,
    IBaseERC20,
    Initializable,
    ERC20Upgradeable,
    ERC20BurnableUpgradeable,
    ERC20PermitUpgradeable,
    AccessControlDefaultAdminRulesUpgradeable,
    UUPSUpgradeable
{
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        ERC20Config memory config,
        Features memory features,
        Roles memory roles
    ) public virtual initializer {
        __BaseERC20_init(config, features, roles);
    }

    function __BaseERC20_init(
        ERC20Config memory config,
        Features memory features,
        Roles memory roles
    ) internal onlyInitializing {
        __ERC20_init(config.name, config.symbol);
        __ERC20Burnable_init();
        __ERC20Permit_init(config.name);
        __AccessControlDefaultAdminRules_init(
            roles.adminChangeDelay,
            roles.admin
        );
        __UUPSUpgradeable_init();

        __BaseERC20_init_unchained(config, features, roles);
    }

    function __BaseERC20_init_unchained(
        ERC20Config memory config,
        Features memory features,
        Roles memory roles
    ) internal onlyInitializing {
        BaseERC20Storage storage $ = _getBaseERC20Storage();
        $.decimals = config.decimals;

        if (roles.upgrader != address(0)) {
            _grantRole(UPGRADER_ROLE, roles.upgrader);
        }

        if (features.initialSupply > 0) {
            if (features.initialSupplyHolder == address(0)) {
                revert BaseERC20InvalidInitialSupplyHolder();
            }

            _mint(features.initialSupplyHolder, features.initialSupply);
        } else {
            revert BaseERC20ZeroLockedSupply();
        }
    }

    function decimals() public view virtual override returns (uint8) {
        return _getBaseERC20Storage().decimals;
    }

    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyRole(UPGRADER_ROLE) {}
}

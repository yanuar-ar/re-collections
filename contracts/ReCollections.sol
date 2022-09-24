// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import '@openzeppelin/contracts/token/ERC1155/ERC1155.sol';
import { IERC721 } from '@openzeppelin/contracts/token/ERC721/IERC721.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol';
import '@openzeppelin/contracts/utils/Strings.sol';

contract ReCollections is ERC1155, Ownable, ERC1155Supply {
    struct Collection {
        uint256 collectionId;
        string collectionURI;
    }

    mapping(uint256 => Collection) public collections;

    uint256 public collectionCount = 0;

    // Token
    IERC721 public reToken;

    constructor(IERC721 _reToken) ERC1155('') {
        reToken = _reToken;
    }

    function uri(uint256 tokenId) public view virtual override returns (string memory) {
        require(exists(tokenId), 'Token does not exists !');
        return
            bytes(collections[tokenId].collectionURI).length > 0
                ? string(abi.encodePacked(collections[tokenId].collectionURI))
                : '';
    }

    function mint(address holder) public {
        uint256[] memory ids = new uint256[](collectionCount);
        uint256[] memory amounts = new uint256[](collectionCount);

        uint256 amount = reToken.balanceOf(holder);

        unchecked {
            for (uint256 i = 0; i < collectionCount; i++) {
                ids[i] = i + 1;
                amounts[i] = amount;
            }
        }

        _mintBatch(holder, ids, amounts, '');
    }

    function burn(address account) public {
        uint256[] memory ids = new uint256[](collectionCount);
        address[] memory accounts = new address[](collectionCount);

        unchecked {
            for (uint256 i = 0; i < collectionCount; i++) {
                ids[i] = i + 1;
                accounts[i] = account;
            }
        }

        uint256[] memory amounts = balanceOfBatch(accounts, ids);

        _burnBatch(account, ids, amounts);
    }

    function createCollection(string calldata _collectionURI) external onlyOwner {
        collectionCount++;
        collections[collectionCount] = Collection({ collectionId: collectionCount, collectionURI: _collectionURI });
    }

    function changeURI(uint256 _collectionId, string calldata _collectionURI) external onlyOwner {
        require(collections[_collectionId].collectionId > 0, 'Collection does not exists !');
        collections[_collectionId].collectionURI = _collectionURI;
    }

    /// @notice Set the token reToken.
    function setReToken(IERC721 _reToken) external onlyOwner {
        reToken = _reToken;
    }

    // The following functions are overrides required by Solidity.

    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal override(ERC1155, ERC1155Supply) {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }
}

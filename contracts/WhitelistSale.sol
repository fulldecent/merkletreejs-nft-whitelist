//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "hardhat/console.sol";

contract WhitelistSale is ERC721 {
  bytes32 public merkleRoot;
  uint256 public nextTokenId;
  mapping(address => uint96) public quantityClaimed;

  constructor(bytes32 _merkleRoot) ERC721("ExampleNFT", "NFT") {
    merkleRoot = _merkleRoot;
  }

  function mint(bytes32[] calldata merkleProof, uint96 allowedQuantity) public payable {
    bytes32 merkleLeaf = bytes32(bytes20(msg.sender)) | bytes32(uint256(allowedQuantity)); // pads left & pads right
    require(MerkleProof.verify(merkleProof, merkleRoot, merkleLeaf), "invalid merkle proof");
    require(quantityClaimed[msg.sender] + 1 <= allowedQuantity, "already claimed enough");
    quantityClaimed[msg.sender] += 1;
    nextTokenId++;
    _mint(msg.sender, nextTokenId);
  }
}

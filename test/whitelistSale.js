const { expect, use } = require('chai')
const { ethers } = require('hardhat')
const { MerkleTree } = require('merkletreejs')
const { keccak256 } = ethers.utils

use(require('chai-as-promised'))

describe('WhitelistSale', function () {
  it('allow only whitelisted accounts to mint', async () => {
    const accounts = await hre.ethers.getSigners()
    const whitelisted = accounts.slice(0, 5)
    const notWhitelisted = accounts.slice(5, 10)
    const quantity = ethers.BigNumber.from("5")

    const leaves = whitelisted.map(account => 
      ethers.utils.solidityPack(['address', 'uint96'], [account.address, quantity])
    )
    const tree = new MerkleTree(leaves, keccak256, { sort: true })
    const merkleRoot = tree.getHexRoot()

    const WhitelistSale = await ethers.getContractFactory('WhitelistSale')
    const whitelistSale = await WhitelistSale.deploy(merkleRoot)
    await whitelistSale.deployed()

    const merkleProof = tree.getHexProof(
      ethers.utils.solidityPack(['address', 'uint96'], [whitelisted[0].address, quantity])
    )
    const invalidMerkleProof = tree.getHexProof(
      ethers.utils.solidityPack(['address', 'uint96'], [notWhitelisted[0].address, quantity])
    )

    await expect(whitelistSale.mint(merkleProof, quantity)).to.not.be.rejected
    await expect(whitelistSale.mint(merkleProof, quantity)).to.not.be.rejected
    await expect(whitelistSale.mint(merkleProof, quantity)).to.not.be.rejected
    await expect(whitelistSale.mint(merkleProof, quantity)).to.not.be.rejected
    await expect(whitelistSale.mint(merkleProof, quantity)).to.not.be.rejected
    await expect(whitelistSale.mint(merkleProof, quantity)).to.be.rejectedWith('already claimed enough')
    await expect(whitelistSale.connect(notWhitelisted[0]).mint(invalidMerkleProof, quantity)).to.be.rejectedWith('invalid merkle proof')
  })
})

import { parseEther } from "@ethersproject/units"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { expect } from "chai"
import { ethers } from "hardhat"
import { NFT } from "../typechain"

const ErrERC721BurnableNotOwner =
	"ERC721Burnable: caller is not owner nor approved"
const ErrERC721URIStorageNonExistentToken =
	"ERC721URIStorage: URI query for nonexistent token"
const ErrERC721NonExistentToken = "ERC721: operator query for nonexistent token"
const ErrExceed = "Minting this many will exceed the common supply cap"
const ErrOverflow =
	"Minting this many will overflow into the common ID allocation"
const ErrNotOwner = "Ownable: caller is not the owner"
const ErrSupplyMax = "Supply cap reached"
const ErrWrongID = "This ID is not a rare war machine"
const ErrUnavailable = "War Machine has already been purchased"
const ErrNotTokenOwner = "You are not the owner"
const ErrTooMany = "You can not mint more than 30 at once"
const ErrZeroMint = "You can not mint zero tokens"
const ErrWrongValue = "You did not pay the correct amount"

describe("NFT", function () {
	let nft: NFT
	let owner: SignerWithAddress
	let addr1: SignerWithAddress
	let addr2: SignerWithAddress
	const base = "https://api.supremacy.game/api/metadata/"
	beforeEach(async function () {
		const NFTContract = await ethers.getContractFactory("NFT")

		const signers = await ethers.getSigners()
		owner = signers[0]
		addr1 = signers[1]
		addr2 = signers[2]

		nft = await NFTContract.deploy(
			owner.address,
			"Supremacy Genesis",
			"SUPREMACY"
		)
		await nft.deployed()
	})

	describe("dev", async function () {
		it("can mint single", async function () {
			await expect(nft.devMint(addr1.address, 0)).to.not.be.reverted
		})
		it("can mint batch", async function () {
			await expect(nft.devBatchMint(addr1.address, 0, 5)).to.not.be.reverted
		})
	})
	describe("user", async function () {
		it("can mint with valid signature", async function () {})
	})
})

import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { expect } from "chai"
import { ethers } from "hardhat"
import { SUPS, SUPS__factory } from "../typechain"
import { parse18 } from "../helpers/number"

const ErrLocked = "transfers are locked"

describe("SUPS Token", function () {
	let sups: SUPS
	let owner: SignerWithAddress
	let transferrer: SignerWithAddress
	let receiver: SignerWithAddress
	beforeEach(async function () {
		const SUPS: SUPS__factory = await ethers.getContractFactory("SUPS")
		sups = await SUPS.deploy(parse18(300000000))

		const signers = await ethers.getSigners()

		owner = signers[0]
		transferrer = signers[1]
		receiver = signers[2]

		await sups.deployed()
		await sups.transfer(transferrer.address, 200000000)
	})
	it("can transfer if owner", async function () {
		await expect(sups.transfer(receiver.address, 100000000)).to.not.be.reverted
	})
	it("prevent transfers before flag is set", async function () {
		await expect(
			sups.connect(transferrer).transfer(receiver.address, 100000)
		).to.be.revertedWith(ErrLocked)
	})
	it("allow transfers after flag is set", async function () {
		await sups.setTransferable(true)
		await expect(sups.connect(transferrer).transfer(receiver.address, 100000))
			.to.not.be.reverted
	})
})

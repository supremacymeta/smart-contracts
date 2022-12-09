import { BigNumber } from "@ethersproject/bignumber"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { expect } from "chai"
import { ethers } from "hardhat"

import {
	SUPS,
	SUPS__factory,
	Redeemer,
	Redeemer__factory,
	ERC20Mock,
	ERC20Mock__factory,
} from "../typechain"
import { parse18 } from "../helpers/number"

const MAX_UINT = 2 ** 256 - 1

const USDCAddr = ""

describe("Supremacy Consolidator", function () {
	let sups: SUPS
	let busd: ERC20Mock
	let redeemer: Redeemer
	let owner: SignerWithAddress
	let redeemerUser: SignerWithAddress
	beforeEach(async function () {
		const SUPS: SUPS__factory = await ethers.getContractFactory("SUPS")
		const USDC: ERC20Mock__factory = await ethers.getContractFactory(
			"ERC20Mock"
		)
		const Redeemer: Redeemer__factory = await ethers.getContractFactory(
			"Redeemer"
		)
		busd = await USDC.deploy(parse18(10000), "USDC")
		sups = await SUPS.deploy(parse18(10000))
		redeemer = await Redeemer.deploy(
			busd.address,
			sups.address,
			9,
			1,
			10000,
			10
		)

		const signers = await ethers.getSigners()

		owner = signers[0]
		redeemerUser = signers[1]

		await redeemer.deployed()
		await redeemer.setCanRedeem(true)
		await sups.deployed()
		await sups.setTransferable(true)
		await sups.transfer(redeemer.address, 10000)
		await sups.transfer(redeemerUser.address, 1000)
		await busd.transfer(redeemer.address, 2000)
	})
	it("can set rate if owner", async function () {
		await expect(redeemer.setFundingRate(2)).to.not.be.reverted
	})
	it("can flush USDC if owner", async function () {
		await expect(redeemer.flushBUSD()).to.not.be.reverted
	})
	it("can flush SUPS if owner", async function () {
		await expect(redeemer.flushSUPS()).to.not.be.reverted
	})
	it("can check available USDC", async function () {
		const current = await redeemer.availableBUSD()
		const next = await redeemer.availableBUSD()
		expect(next.gt(current))
	})
	it("can increase available USDC for redemption every block", async function () {
		for (let i = 0; i < 10; i++) {
			await ethers.provider.send("evm_mine", [])
		}
	})
	it("can redeem USDC for SUPS", async function () {
		const oldBal = await busd.balanceOf(redeemer.address)
		await sups.connect(redeemerUser).approve(redeemer.address, 1000000000)
		await redeemer.connect(redeemerUser).redeem(10)
		const newBal = await busd.balanceOf(redeemer.address)
		expect(BigNumber.from(newBal).lt(1000000000)).is.true
	})
	it("cannot redeem USDC for SUPS if not enough is available", async function () {
		await sups.connect(redeemerUser).approve(redeemer.address, 10000)
		const redeemerP = redeemer.connect(redeemerUser).redeem(999)
		await expect(redeemerP).to.be.revertedWith("Not enough BUSD available")
	})
	it("cannot redeem USDC for SUPS if too much is requested", async function () {
		await sups.connect(redeemerUser).approve(redeemer.address, 1000000000)
		const redeemerP = redeemer.connect(redeemerUser).redeem(10001)
		await expect(redeemerP).to.be.revertedWith("Too many SUPS redeemed")
	})
})

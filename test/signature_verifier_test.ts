import { BigNumber } from "@ethersproject/bignumber"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { expect } from "chai"
import { ethers } from "hardhat"

import { Withdrawer, SignatureVerifier, SUPS } from "../typechain"
import { parse18 } from "../helpers/number"

describe("Signature Verifier", function () {
	let sups: SUPS
	let hotWallet: Withdrawer

	let owner: SignerWithAddress
	let addr1: SignerWithAddress
	let addr2: SignerWithAddress
	beforeEach(async function () {
		const SUPS = await ethers.getContractFactory("SUPS")
		sups = await SUPS.deploy(parse18(300000000))
		const Withdrawer = await ethers.getContractFactory("Withdrawer")
		hotWallet = await Withdrawer.deploy(
			sups.address,
			"0x31a5D97b91FB50f546D446a41305F2243aC03cCF"
		)
		await sups.transfer(hotWallet.address, 1)
		await sups.setTransferable(true)
		const signers = await ethers.getSigners()
		owner = signers[0]
		addr1 = signers[1]
		addr2 = signers[2]
	})
	it("verifies the signature", async function () {
		await hotWallet.setCanWithdraw(true)
		await hotWallet.withdrawSUPS(
			1,
			"0x942cd299cb6a8f42c95f1f615a1bf9fbc296b1e3349c8b01e21ef2d1f4329cbb0fd3cf9bf76d81ec669df108b91e8a604e4963caead9240bbb2b8347751a82111b",
			10
		)
	})
})

import { BigNumberish } from "@ethersproject/bignumber"
import { parseUnits } from "@ethersproject/units"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { expect } from "chai"
import { ethers } from "hardhat"

import {
	SUPS,
	SUPS__factory,
	Staking,
	Staking__factory,
	NFT__factory,
	NFT,
} from "../typechain"
describe("NFT Staking", function () {
	let staking: Staking
	let nft: NFT
	let owner: SignerWithAddress
	let player1: SignerWithAddress
	let player2: SignerWithAddress
	beforeEach(async function () {
		const signers = await ethers.getSigners()
		owner = signers[0]
		player1 = signers[1]
		player2 = signers[2]

		const NFT: NFT__factory = await ethers.getContractFactory("NFT")
		const Staking: Staking__factory = await ethers.getContractFactory("Staking")
		nft = await NFT.deploy(owner.address, "Supremacy Genesis", "SUPREMACY")
		staking = await Staking.deploy()
		await nft.devMint(player1.address, 0)
		await staking.deployed()
	})
	it("can remap if admin", async function () {
		await nft.connect(player1).approve(staking.address, 0)
		await staking.connect(player1).stake(nft.address, 0)
		staking.remap(nft.address, 0, player2.address)
		const record = await staking.records(nft.address, 0)
		expect(record[0]).to.eq(player2.address)
	})
	it("can lock if admin", async function () {
		await nft.connect(player1).approve(staking.address, 0)
		await staking.connect(player1).stake(nft.address, 0)
		await staking.lock(nft.address, 0)
		const record = await staking.records(nft.address, 0)
		expect(record[1]).to.eq(true)
	})
	it("can unlock if owner", async function () {
		await nft.connect(player1).approve(staking.address, 0)
		await staking.connect(player1).stake(nft.address, 0)
		const record = await staking.records(nft.address, 0)
		expect(record[1]).to.eq(false)
	})
	it("can stake if owner", async function () {
		await nft.connect(player1).approve(staking.address, 0)
		await staking.connect(player1).stake(nft.address, 0)
		const record = await staking.records(nft.address, 0)
		expect(record[0]).to.eq(player1.address)
	})
	it("can unstake if owner", async function () {
		await nft.connect(player1).approve(staking.address, 0)
		await staking.connect(player1).stake(nft.address, 0)
		await staking.connect(player1).unstake(nft.address, 0)
		const record = await staking.records(nft.address, 0)
		expect(record[0]).to.eq("0x0000000000000000000000000000000000000000")
	})
})

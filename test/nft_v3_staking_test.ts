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
	StakingV3,
	StakingV3__factory,
	NFT,
} from "../typechain"
describe("NFT V3 Staking", function () {
	let stakingV2: Staking
	let stakingV3: StakingV3
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
		const StakingV2: Staking__factory = await ethers.getContractFactory(
			"Staking"
		)
		const StakingV3: StakingV3__factory = await ethers.getContractFactory(
			"StakingV3"
		)
		nft = await NFT.deploy(owner.address, "Supremacy Genesis", "SUPREMACY")
		stakingV2 = await StakingV2.deploy()
		stakingV3 = await StakingV3.deploy(stakingV2.address, owner.address)
		await nft.devMint(player1.address, 0)
		await stakingV2.deployed()
		await stakingV3.deployed()
	})
	it("can migrate", async function () {
		// Setup test NFT to be staked in V2 staking contract
		await nft.connect(player1).approve(stakingV2.address, 0)
		await stakingV2.connect(player1).stake(nft.address, 0)

		// Flow for migrating to V3 staking contract
		await stakingV2.connect(player1).unstake(nft.address, 0)
		await nft.connect(player1).approve(stakingV3.address, 0)
		await stakingV3.connect(player1).stake(nft.address, 0)
	})
})

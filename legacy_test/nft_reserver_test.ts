import { parseEther } from "@ethersproject/units"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { expect } from "chai"
import { ethers } from "hardhat"
import { Reserver } from "../typechain"
const ErrPaused = "reservations are paused"
const ErrSlotsExhausted = "slots exhausted"
const ErrReserved = "war machine is reserved"
const ErrOutOfRange = "id out of range"
const ErrWalletUsed = "wallet already used"
describe("Reserver", function () {
	let reserver: Reserver
	let owner: SignerWithAddress
	let addr1: SignerWithAddress
	let addr2: SignerWithAddress
	let addr3: SignerWithAddress
	let addr4: SignerWithAddress
	let addr5: SignerWithAddress

	const minReserveID = 25
	const maxReserveID = 324

	const reserveFee = parseEther("0.02")

	beforeEach(async function () {
		const ReserverContract = await ethers.getContractFactory("Reserver")

		reserver = await ReserverContract.deploy(
			minReserveID,
			maxReserveID,
			reserveFee
		)
		await reserver.deployed()
		const signers = await ethers.getSigners()
		owner = signers[0]
		addr1 = signers[1]
		addr2 = signers[2]
		addr3 = signers[3]
		addr4 = signers[4]
		addr5 = signers[5]
	})
	describe("paused", async function () {
		it("user - can not reserve", async function () {
			reserver.togglePause()
			reserver = reserver.connect(addr1)
			const fee = await reserver.reserveFee()
			await expect(reserver.reserve(25, { value: fee })).to.be.revertedWith(
				ErrPaused
			)
		})
		it("dev - can reserve", async function () {
			reserver.togglePause()
			await expect(reserver.devReserve(addr1.address, 25)).to.not.be.reverted
		})
		it("anyone - can flush", async function () {
			const currentBalance = await owner.getBalance()
			const fee = await reserver.reserveFee()
			await reserver.connect(addr1).reserve(minReserveID, {
				value: fee,
			})

			await reserver.connect(addr1).flush()
			const newBalance = await owner.getBalance()
			expect(newBalance.gt(currentBalance)).to.be.true
			expect(newBalance.sub(currentBalance)).to.be.eq(fee)
		})
	})

	describe("unpaused", async function () {
		it("dev - can set values", async function () {
			reserver.setMaxID(26)
			reserver.setMinID(27)
			reserver.setReserveFee(parseEther("0.01"))
		})
		it("dev - can reserve", async function () {
			reserver.togglePause()
			await expect(reserver.devReserve(addr1.address, 25)).to.not.be.reverted
		})
		it("user - can reserve", async function () {
			reserver = reserver.connect(addr1)
			const fee = await reserver.reserveFee()
			await expect(reserver.reserve(1)).to.be.revertedWith(ErrOutOfRange)
			await expect(reserver.reserve(25, { value: fee })).to.not.be.reverted
			await expect(reserver.reserve(25)).to.be.revertedWith(ErrReserved)
			expect(await reserver.tokenIDAddressMap(25)).to.eq(addr1.address)
			expect(await reserver.tokenIDAddressMap(1)).to.eq(
				"0x0000000000000000000000000000000000000000"
			)
			await expect(reserver.reserve(26)).to.be.revertedWith(ErrWalletUsed)
			reserver = reserver.connect(addr2)
			await reserver.reserve(26, { value: fee })
			reserver = reserver.connect(addr3)
			await reserver.reserve(27, { value: fee })
			reserver = reserver.connect(addr4)
			await expect(reserver.reserve(28, { value: fee })).to.emit(
				reserver,
				"onReserved"
			)
			reserver = reserver.connect(addr5)
			const reserved = await reserver.listReserved()
			expect(reserved.length).to.eq(4)
		})
	})
})

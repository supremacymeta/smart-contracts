import { BigNumber } from "@ethersproject/bignumber"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { time } from "console"
import add from "date-fns/add"
import getUnixTime from "date-fns/getUnixTime"
import { Signer } from "ethers"
import { ethers } from "hardhat"

import { ERC1155Withdrawer, Achievements } from "../typechain"

describe("ERC1155 Withdrawer", function () {
	let withdrawer: ERC1155Withdrawer
	let achievements: Achievements
	let owner: SignerWithAddress
	let addr1: SignerWithAddress
	let addr2: SignerWithAddress
	beforeEach(async function () {
		const signers = await ethers.getSigners()
		owner = signers[0]
		addr1 = signers[1]
		addr2 = signers[2]

		const Withdrawer = await ethers.getContractFactory("ERC1155Withdrawer")
		const Achievements = await ethers.getContractFactory("Achievements")
		achievements = await Achievements.deploy(owner.address)
		withdrawer = await Withdrawer.deploy(achievements.address, owner.address)
		await achievements.mint(addr1.address, 0, 1, [])
	})
	it("verifies the signature to withdraw", async function () {
		const tokenID = 0
		const amount = 1
		const expiry = getUnixTime(add(Date.now(), { minutes: 5 }))
		const nonce = await withdrawer.connect(addr1).nonces(addr1.address)
		await achievements
			.connect(addr1)
			.safeTransferFrom(addr1.address, withdrawer.address, tokenID, nonce, [])
		await withdrawer.connect(owner).setCanWithdraw(true)

		const sig = await sign(
			owner,
			addr1.address,
			tokenID,
			amount,
			nonce.toNumber(),
			expiry
		)
		console.log(sig, sig.length)
		await withdrawer.connect(addr1).withdrawTokens(tokenID, amount, sig, expiry)
	})
})

const sign = (
	signer: Signer,
	account: string,
	tokenID: number,
	amount: number,
	nonce: number,
	expiry: number
) => {
	//keccak256(abi.encode(account, tokenID, amt, nonce, expiry));
	const messageHash = ethers.utils.solidityKeccak256(
		["address", "uint256", "uint256", "uint256", "uint256"],
		[account, tokenID, amount, nonce, expiry]
	)
	const messageHashBinary = ethers.utils.arrayify(messageHash)
	return signer.signMessage(messageHashBinary)
}

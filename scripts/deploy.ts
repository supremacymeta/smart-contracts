import {
    SUPS__factory,
    Staking__factory,
    NFT__factory,
    ERC20Mock__factory,
    Redeemer__factory,
    Withdrawer__factory,
    ERC20StakingPool__factory,
    StakingV3__factory,
} from "../typechain"
import * as hre from "hardhat"
import {parse18} from "../helpers/number"
import {HardhatRuntimeEnvironment} from "hardhat/types/runtime"

export const deployNFTStaking = async (hre: HardhatRuntimeEnvironment) => {
    const stakingFactory: Staking__factory = await hre.ethers.getContractFactory(
        "Staking"
    )
    const staking = await stakingFactory.deploy()
    await staking.deployed()
    console.log("Staking contract deployed to:", staking.address)
}
export const deployNFTStakingV3 = async (
    hre: HardhatRuntimeEnvironment,
    signer: string,
) => {
    const stakingFactoryV3: StakingV3__factory = await hre.ethers.getContractFactory(
        "StakingV3"
    )
    const stakingV3 = await stakingFactoryV3.deploy(signer)
    await stakingV3.deployed()
    console.log("Staking V3 contract deployed to:", stakingV3.address)
}
export const deployNFT = async (
    hre: HardhatRuntimeEnvironment,
    signer: string,
    name: string,
    symbol: string
) => {
    const nftFactory: NFT__factory = await hre.ethers.getContractFactory("NFT")
    const nft = await nftFactory.deploy(signer, name, symbol)

    await nft.deployed()
    console.log("NFT contract deployed to:", nft.address)
}

export const deployERC20 = async (
    hre: HardhatRuntimeEnvironment,
    supply: number,
    symbol: string
) => {
    const ERC20MockFactory: ERC20Mock__factory =
        await hre.ethers.getContractFactory("ERC20Mock")
    const erc20 = await ERC20MockFactory.deploy(parse18(supply), symbol)
    await erc20.deployed()
    console.log(`${symbol} ERC20 contract deployed to:`, erc20.address)
}
export const deployRedeemer = async (
    hre: HardhatRuntimeEnvironment,
    busdAddress: string,
    supsAddress: string
) => {
    const RedeemerFactory: Redeemer__factory =
        await hre.ethers.getContractFactory("Redeemer")
    const redeemer = await RedeemerFactory.deploy(
        busdAddress,
        supsAddress,
        9,
        100,
        1000,
        10
    )

    await redeemer.deployed()
    console.log("Redeemer contract deployed to:", redeemer.address)
}
export const deployWithdrawer = async (
    hre: HardhatRuntimeEnvironment,
    supsAddr: string,
    signer: string
) => {
    const WithdrawerFactory: Withdrawer__factory =
        await hre.ethers.getContractFactory("Withdrawer")
    const withdrawer = await WithdrawerFactory.deploy(supsAddr, signer)
    await withdrawer.deployed()
    console.log("Withdrawer contract deployed to:", withdrawer.address)
}
export const deploySUPS = async (
    hre: HardhatRuntimeEnvironment,
    supply: number
) => {
    const SUPSFactory: SUPS__factory = await hre.ethers.getContractFactory("SUPS")
    const sups = await SUPSFactory.deploy(parse18(supply))
    await sups.deployed()
    console.log("SUPS ERC20 contract deployed to:", sups.address)
}
export const deployFarm = async (
    hre: HardhatRuntimeEnvironment,
    rewardToken: string,
    stakeToken: string,
    durationSeconds: number
) => {
    const FarmFactory: ERC20StakingPool__factory =
        await hre.ethers.getContractFactory("ERC20StakingPool")
    const farm = await FarmFactory.deploy(
        rewardToken,
        stakeToken,
        durationSeconds
    )
    await farm.deployed()
    console.log("Farming contract deployed to:", farm.address)
}

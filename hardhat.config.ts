import "@nomiclabs/hardhat-etherscan"
import "solidity-coverage"
import "@typechain/hardhat"
import "@nomiclabs/hardhat-ethers"
import "@nomiclabs/hardhat-waffle"
import "hardhat-contract-sizer"
import {task} from "hardhat/config"
import {
    deployNFTStaking,
    deployNFT,
    deployERC20,
    deployRedeemer,
    deployWithdrawer,
    deploySUPS,
    deployFarm,
    deployNFTStakingV3,
} from "./scripts/deploy"

task("deploy_nft_staking", "Deploy the nft staking contract").setAction(
    async (args, hre) => {
        await deployNFTStaking(hre)
    }
)
task("deploy_nft_staking_v3", "Deploy the nft staking V3 contract")
    .addParam<string>("signeraddr", "signer address")
    .setAction(
        async (args, hre) => {
            await deployNFTStakingV3(hre, args.signeraddr)
        }
    )

task("deploy_nft", "Deploy the nft contract")
    .addParam<string>("signeraddr", "signer address")
    .addParam<string>("name", "Name of the collection")
    .addParam<string>("symbol", "Symbol of the collection")
    .setAction(async (args, hre) => {
        await deployNFT(hre, args.signeraddr, args.name, args.symbol)
    })
task("deploy_erc20", "deploy the ERC20 contract")
    .addParam<number>("supply", "number of tokens")
    .addParam<string>("symbol", "symbol of token")
    .setAction(async (args, hre) => {
        await deployERC20(hre, args.supply, args.symbol)
    })
task("deploy_redeemer", "Deploy the redeemer contract")
    .addParam<string>("busdaddr", "busd address")
    .addParam<string>("supsaddr", "sups address")
    .setAction(async (args, hre) => {
        await deployRedeemer(hre, args.busdaddr, args.supsaddr)
    })
task("deploy_withdrawer", "Deploy the withdrawer contract")
    .addParam<string>("supsaddr", "sups address")
    .addParam<string>("signeraddr", "signer address")
    .setAction(async (args, hre) => {
        await deployWithdrawer(hre, args.supsaddr, args.signeraddr)
    })
task("deploy_sups", "Deploy the sups contract")
    .addParam<number>("supply", "number of tokens")
    .setAction(async (args, hre) => {
        await deploySUPS(hre, args.supply)
    })

task("deploy_farm", "Deploy the farming contract")
    .addParam<string>("rewardtoken", "The rewardToken of the farming contract")
    .addParam<string>("staketoken", "The stakeToken of the farming contract")
    .addParam<string>(
        "duration",
        "The reward duration in seconds of the farming contract"
    )
    .setAction(async (args, hre) => {
        await deployFarm(hre, args.rewardtoken, args.staketoken, args.duration)
    })
const ETHERSCAN_KEY = process.env.ETHERSCAN_KEY
const INFURA_PROJECT_ID = process.env.INFURA_PROJECT_ID
const OPERATOR_KEY = process.env.OPERATOR_KEY || "0"

module.exports = {
    solidity: {
        version: "0.8.4",
        settings: {optimizer: {enabled: true, runs: 2000}},
    },
    defaultNetwork: "hardhat",
    networks: {
        localhost: {
            url: "http://127.0.0.1:8545",
        },
        hardhat: {},
        eth: {
            url: `https://mainnet.infura.io/v3/${INFURA_PROJECT_ID}`,
        	accounts: [OPERATOR_KEY],
        },
        bsc: {
        	url: "https://bsc-dataseed.binance.org/",
        	accounts: [OPERATOR_KEY],
        },
        bsctest: {
        	url: "https://data-seed-prebsc-1-s1.binance.org:8545",
        	chainId: 97,
        	accounts: [OPERATOR_KEY],
        },
        goerli: {
            url: `https://goerli.infura.io/v3/${INFURA_PROJECT_ID}`,
            chainId: 5,
            accounts: [OPERATOR_KEY],
        },
    },
    etherscan: {
        apiKey: ETHERSCAN_KEY,
    },
}

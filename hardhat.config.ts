import "@nomicfoundation/hardhat-toolbox"
import "hardhat-deploy"

// import "ethereum-waffle"
import "dotenv/config" //启用配置
//此插件可帮助您验证 Solidity 合约的源代码
import "@nomiclabs/hardhat-etherscan"
//引入tasks文件下的文件
// import "./tasks/block-number"
//引入gas-reporter
import "hardhat-gas-reporter"
import "solidity-coverage"
import "@typechain/hardhat"

/** @type import('hardhat/config').HardhatUserConfig */
const GOERIL_RPC_URL = process.env.GOERIL_RPC_URL
const PRIVATE_KEY = process.env.PRIVATE_KEY
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY
module.exports = {
    // solidity: "0.8.8",
    solidity: {
        compilers: [{ version: "0.8.8" }, { version: "0.6.6" }],
    },
    networks: {
        goerli: {
            url: GOERIL_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 5,
            // blockConfirmations:2,
        },
        localhost: {
            url: "http://127.0.0.1:8545/",
            // accounts:本地主机已自动分配账户
            chainId: 31337,
        },
    },
    defaultNetwork: "hardhat",
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
    gasReporter: {
        enabled: false,
        outputFile: "gas-report.txt",
        noColors: true,
        currency: "ETH",
        //使用API调用coinmarketcap
        coinmarketcap: COINMARKETCAP_API_KEY,
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
        user: {
            default: 1,
        },
    },
}

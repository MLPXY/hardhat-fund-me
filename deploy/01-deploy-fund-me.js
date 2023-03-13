//import
//在这里我们不需要main function
//main function
//calling of main function

const { network } = require("hardhat")
const { networkConfig, developmentChain } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
// function deployFunc() {
//     console.log("Hi")
// }
// module.exports.default = deployFunc
//
// module.exports = async (hre) => {
//     const { getNameAccounts, deployments } = hre
// }  和下面等价 ，解构
module.exports = async ({ getNameAccounts, deployments }) => {
    // deploy = deployments['deploy']
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    let ethUsdPriceFeedAddress
    if (developmentChain.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }
    //what happens when we want to change chains?
    //when going for localhost or hardhat networks we want to use mock(模仿)
    const args = [ethUsdPriceFeedAddress]
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args, // put price feed address
        log: true,
        blockConfirmations: network.config.blockConfirmations || 1,
    })
    if (
        !developmentChain.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, args)
    }

    log("++++++++++++++++++++++++++++++++++++++++++++++++++")
}
module.exports.tags = ["all", "fundme"]

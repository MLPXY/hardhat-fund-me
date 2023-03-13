//编写部署模拟脚本
const { network } = require("hardhat")
const {
    // developmentChains,
    DECIMALS,
    INITIAL_ANSWER,
    developmentChain,
} = require("../helper-hardhat-config")

module.exports = async (params) => {
    const { getNamedAccounts, deployments } = params

    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    const chainId = network.config.chainId
    if (developmentChain.includes(network.name)) {
        log("Local network detected! Deploying mocks...")
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            //构造函数参数
            args: [DECIMALS, INITIAL_ANSWER],
        })
        log("Mocks deployed!")
        log("---------------------------------------")
    }
}
//只运行具有特殊标签的脚本
module.exports.tags = ["all", "mocks"]

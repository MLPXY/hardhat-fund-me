const { run } = require("hardhat")

const verify = async (contractAddress, args) => {
    try {
        console.log("Veryfying contract...")
        await run("verify:verify", {
            address: contractAddress,
            ConstructorArguments: args,
        })
    } catch (e) {
        if (e.message.toLowerCase().includes("already verified")) {
            console.log("Already Verified!")
        } else {
            console.log(e)
        }
    }
}

module.exports = { verify }

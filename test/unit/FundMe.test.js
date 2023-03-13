const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { assert, expect } = require("chai")
const { developmentChain } = require("../../helper-hardhat-config")
//describe是Jasmine的全局函数，用于创建一个测试套件，可以理解为一组测试用例的集合。 describe函数接受两个参数（一个字符串和一个回调函数）。
// 字符串是这个测试套件的名字或标题，通常描述被测试内容，用之前的比喻来说，describe就是一个故事，字符串就是这个故事的标题。 回调函数是实现测试套件的代码块（称为describe块）。
!developmentChain.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function () {
          let fundMe
          let deployer
          let mockV3Aggregator
          const sendValue = ethers.utils.parseEther("1")

          beforeEach(async function () {
              //deploy our fundMe contract
              //using Hardhat-deploy
              // const accounts = await ethers.getSigner()
              // const accountZero = accounts[0]
              //直接在本地网络部署脚本
              deployer = (await getNamedAccounts()).deployer
              console.warn("deployer: ", deployer)
              const deployment = await deployments.fixture(["all"])
              fundMe = await ethers.getContract("FundMe", deployer)

              mockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              )
          })
          describe("constructor", async function () {
              it("sets the aggregator addresses correctly", async function () {
                  const resposne = await fundMe.getPriceFeed()
                  assert.equal(resposne, mockV3Aggregator.address)
              })
          })
          describe("fund", async function () {
              it("Fails if you don't send enough ETH", async function () {
                  //Testing if transaction was reverted with certain message:
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "You need to spend more ETH!"
                  )
              })
              it("updated the amount funded data structure", async function () {
                  await fundMe.fund({ value: sendValue })
                  const resposne = await fundMe.getAddressToAmountFunded(
                      deployer
                  )
                  assert.equal(resposne.toString(), sendValue.toString())
              })
              it("Add funder to  array of getFunder", async function () {
                  await fundMe.fund({ value: sendValue })
                  const funder = await fundMe.getFunder(0)
                  assert.equal(funder, deployer)
              })
          })
          describe("withdraw", async function () {
              //先fund才可以取回资金
              beforeEach(async function () {
                  await fundMe.fund({ value: sendValue })
              })
              it("withdraw ETH from a single founder", async function () {
                  //Arrage
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  const startingDeployBalance =
                      await fundMe.provider.getBalance(deployer)
                  //Act
                  const transactionRsponse = await fundMe.withdraw()
                  const transactionReceipt = await transactionRsponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  //大数相乘用mul()
                  const gasCost = gasUsed.mul(effectiveGasPrice)
                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)
                  //gasCost

                  //Assert
                  assert.equal(endingFundMeBalance, 0)
                  assert.equal(
                      startingFundMeBalance.add(startingDeployBalance).toString,
                      endingDeployerBalance.add(gasCost).toString
                  )
              })
              it("allows us to withdraw with multiple getFunder", async function () {
                  //Arrange
                  const accounts = await ethers.getSigners()
                  for (let i = 1; i < 6; i++) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      )
                      await fundMeConnectedContract.fund({ value: sendValue })
                  }
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  const startingDeployBalance =
                      await fundMe.provider.getBalance(deployer)
                  //Act
                  const transactionRsponse = await fundMe.withdraw()
                  const transactionReceipt = await transactionRsponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  //大数相乘用mul()
                  const gasCost = gasUsed.mul(effectiveGasPrice)
                  //Assert
                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)
                  assert.equal(endingFundMeBalance, 0)
                  assert.equal(
                      startingFundMeBalance.add(startingDeployBalance).toString,
                      endingDeployerBalance.add(gasCost).toString
                  )
                  //Make sure that the getFunder are reset properly
                  await expect(fundMe.getFunder(0)).to.be.reverted
                  for (let i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      )
                  }
              })

              it("Only allows the owner to withdraw", async function () {
                  const accounts = await ethers.getSigners()
                  const fundMeConnectedContract = await fundMe.connect(
                      accounts[1]
                  )
                  // const res = attackerConnectedContract.withdraw()
                  await expect(fundMeConnectedContract.withdraw()).to.be
                      .reverted
                  // "FundMe__NotOwner"
                  // ()
              })
              it("cheaperWithdraw testing...", async function () {
                  //Arrange
                  const accounts = await ethers.getSigners()
                  for (let i = 1; i < 6; i++) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      )
                      await fundMeConnectedContract.fund({ value: sendValue })
                  }
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  const startingDeployBalance =
                      await fundMe.provider.getBalance(deployer)
                  //Act
                  const transactionRsponse = await fundMe.cheaperWithdraw()
                  const transactionReceipt = await transactionRsponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  //大数相乘用mul()
                  const gasCost = gasUsed.mul(effectiveGasPrice)
                  //Assert
                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)
                  assert.equal(endingFundMeBalance, 0)
                  assert.equal(
                      startingFundMeBalance.add(startingDeployBalance).toString,
                      endingDeployerBalance.add(gasCost).toString
                  )
                  //Make sure that the getFunder are reset properly
                  await expect(fundMe.getFunder(0)).to.be.reverted
                  for (let i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      )
                  }
              })
              it("cheaperWithdraw ETH from a single founder", async function () {
                  //Arrage
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  const startingDeployBalance =
                      await fundMe.provider.getBalance(deployer)
                  //Act
                  const transactionRsponse = await fundMe.cheaperWithdraw()
                  const transactionReceipt = await transactionRsponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  //大数相乘用mul()
                  const gasCost = gasUsed.mul(effectiveGasPrice)
                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)
                  //gasCost

                  //Assert
                  assert.equal(endingFundMeBalance, 0)
                  assert.equal(
                      startingFundMeBalance.add(startingDeployBalance).toString,
                      endingDeployerBalance.add(gasCost).toString
                  )
              })
          })
      })

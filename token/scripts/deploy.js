// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const { ethers, upgrades } = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  const [deployer] = await ethers.getSigners();

  console.log(
    "Deploying contracts with the account:",
    await deployer.getAddress()
  );
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deployment Configuration
  const tokenName = "MaidSafe Coin";
  const tokenSymbol = "eMAID";
  const minter = "0x0667FF4F6030705c6cfbAE63525d8a660B52D78b";
  const pauser = "0x0667FF4F6030705c6cfbAE63525d8a660B52D78b";
  const roleAdmin = "0x0667FF4F6030705c6cfbAE63525d8a660B52D78b";
  const proxyAdmin = "0x0667FF4F6030705c6cfbAE63525d8a660B52D78b";

  // We get the contract to deploy
  const MaidSafeERC20 = await ethers.getContractFactory("MaidSafeERC20");
  const maidSafeERC20 = await upgrades.deployProxy(MaidSafeERC20, [
    tokenName,
    tokenSymbol,
    minter,
    pauser,
    roleAdmin,
  ]);
  await maidSafeERC20.deployed();

  console.log(`${tokenName} deployed to: `, maidSafeERC20.address);

  await upgrades.admin.transferProxyAdminOwnership(proxyAdmin);

  console.log(`Set proxy admin to ${proxyAdmin}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

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

  // Configuration
  const proxyAdminAddress = "0x905EF18fEfC1377b9b900466eB46db45eEc80a03";
  const proxyAddress = "0xdfe66b14d37c77f4e9b180ceb433d1b164f0281d";

  // Get the contract to deploy
  const MaidSafeERC20 = await ethers.getContractFactory("MaidSafeERC20");
  const newImplementationAddress = await upgrades.prepareUpgrade(prepareUpgrade, MaidSafeERC20);

  console.log(`New version deployed to: ${newImplementationAddress}`);

  // Prepare gnosis call data
  const proxyAdminABI = [
    "function upgrade(address proxy, address implementation)",
  ];

  const proxyAdmin = new ethers.Contract(proxyAdminAddress, proxyAdminABI);
  const callData = proxyAdmin.interface.encodeFunctionData('upgrade', [proxyAddress, newImplementationAddress]);

  console.log("Use this call data to execute an upgrade", callData);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

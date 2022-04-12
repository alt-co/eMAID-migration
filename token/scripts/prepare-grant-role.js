// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const { ethers } = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');
  const MaidSafeERC20 = await ethers.getContractFactory("MaidSafeERC20");

  // Enter data HERE
  const account = "0x0667FF4F6030705c6cfbAE63525d8a660B52D78b";
  // const role = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINTER_ROLE"));
  // const role = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("PAUSER_ROLE"));
  const role = ethers.constants.HashZero; // Admin

  const callData = MaidSafeERC20.interface.encodeFunctionData('grantRole', [role, account]);
  console.log("Use this call data in Gnosis Safe:", callData);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

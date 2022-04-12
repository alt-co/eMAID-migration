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
  const MaidSafeERC20 = await ethers.getContractFactory("MaidSafeERC20");

  // Enter data HERE
  const recipient = "0xC51e232A62Ef1648317158F9E920140bc4666B81";
  const amount = ethers.BigNumber.from("1000000000000000000");

  const callData = MaidSafeERC20.interface.encodeFunctionData('mint', [recipient, amount]);
  console.log("Use this call data in Gnosis Safe:", callData);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("MaidSafeERC20", function () {
  it("Should deploy", async function () {    
    const tokenName = "MaidSafeCoin";
    const tokenSymbol = "MAID";

    console.log(upgrades);

    // We get the contract to deploy
    const MaidSafeERC20 = await ethers.getContractFactory("MaidSafeERC20");
    const maidSafeERC20 = await upgrades.deployProxy(MaidSafeERC20, [tokenName, tokenSymbol]);
    await maidSafeERC20.deployed();

    console.log(`${tokenName} deployed to: `, maidSafeERC20.address);

    expect(await maidSafeERC20.name()).to.equal(tokenName);
    expect(await maidSafeERC20.symbol()).to.equal(tokenSymbol);
  });
});

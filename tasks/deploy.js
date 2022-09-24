const { task } = require('hardhat/config');

task('deploy', 'Deploy contract').setAction(async ({}, { ethers, upgrades }) => {
  const ReCollections = await ethers.getContractFactory('ReCollections');

  const reCollections = await ReCollections.deploy('', { gasLimit: 3000000 });

  await reCollections.deployed('');

  console.log('Contract deployed to: ', reCollections.address);
});

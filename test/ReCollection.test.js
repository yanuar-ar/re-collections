const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('re:collection Testing', async () => {
  let reCollections;
  let nftToken;

  before(async () => {
    [owner, nonOwner] = await ethers.getSigners();

    const NFTToken = await ethers.getContractFactory('MockERC712');
    nftToken = await NFTToken.deploy();

    const ReCollections = await ethers.getContractFactory('ReCollections');
    reCollections = await ReCollections.deploy(nftToken.address);
  });

  describe('Deployment', async () => {
    it('should deployed', async function () {
      expect(nftToken.address).to.not.equal('');
      expect(reCollections.address).to.not.equal('');
    });
  });

  describe('Testing Mint & Burn Function', async () => {
    it('should create Collection with id 1', async () => {
      let uri = 'https://google.com';

      await reCollections.createCollection(uri);

      const [collectionId, collectionURI] = await reCollections.collections(1);

      expect(await reCollections.collectionCount()).to.eq(ethers.BigNumber.from(1));
      expect(collectionId).to.eq(ethers.BigNumber.from(1));
      expect(collectionURI).to.eq(uri);
    });
    it('should create Collection with id 2', async () => {
      let uri = 'https://google.com';

      await reCollections.createCollection(uri);

      const [collectionId, collectionURI] = await reCollections.collections(2);

      expect(await reCollections.collectionCount()).to.eq(ethers.BigNumber.from(2));
      expect(collectionId).to.eq(ethers.BigNumber.from(2));
      expect(collectionURI).to.eq(uri);
    });
    it('should mint', async () => {
      await nftToken.connect(owner).mint();
      await nftToken.connect(owner).mint();

      await nftToken.connect(nonOwner).mint();

      await reCollections.connect(owner).mint(owner.address);
      await reCollections.connect(nonOwner).mint(nonOwner.address);

      expect(await reCollections.balanceOf(owner.address, 1)).to.eq(ethers.BigNumber.from(2));
      expect(await reCollections.balanceOf(owner.address, 2)).to.eq(ethers.BigNumber.from(2));
      expect(await reCollections.balanceOf(nonOwner.address, 1)).to.eq(ethers.BigNumber.from(1));
      expect(await reCollections.balanceOf(nonOwner.address, 2)).to.eq(ethers.BigNumber.from(1));

      // uri
      expect(await reCollections.uri(1)).to.eq('https://google.com');
      expect(await reCollections.uri(2)).to.eq('https://google.com');
    });
    it('should burn', async () => {
      await reCollections.connect(owner).burn(owner.address);
      await reCollections.connect(nonOwner).burn(nonOwner.address);

      expect(await reCollections.balanceOf(owner.address, 1)).to.eq(ethers.BigNumber.from(0));
      expect(await reCollections.balanceOf(owner.address, 2)).to.eq(ethers.BigNumber.from(0));
      expect(await reCollections.balanceOf(nonOwner.address, 1)).to.eq(ethers.BigNumber.from(0));
      expect(await reCollections.balanceOf(nonOwner.address, 2)).to.eq(ethers.BigNumber.from(0));

      // uri
      await expect(reCollections.uri(1)).to.revertedWith('Token does not exists !');
      await expect(reCollections.uri(2)).to.revertedWith('Token does not exists !');
    });
  });
});

const { assert, expect } = require('chai');
const { network, deployments, ethers, getNamedAccounts } = require("hardhat");
const { describe, it } = require('node:test');
const { deploymentChains } = require("../../helper-hardhat-config");

!deploymentChains.includes(network.name) ? describe.skip : describe('Nft Marketplace Tests', function () {
    let nftMarktplace, basicNft, deployer, player;
    const PRICE = ethers.utils.parseEther('0.1');
    const TOKEN_ID = 0;

    beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer;
        const accounts = await ethers.getSigners();
        player = accounts[1];
        // player = (await getNamedAccounts()).player;
        await deployments.fixture(['all']);
        nftMarktplace = await ethers.getContract('NftMarketplace');
        nftMarktplace = await nftMarktplace.connect(player);
        basicNft = await ethers.getContract('BasicNft');
        await basicNft.mintNft();
        await basicNft.approve(nftMarktplace.address, TOKEN_ID);

    })

    it('lists and can be bought', async function () {
        await nftMarktplace.listItem(basicNft.address, TOKEN_ID, PRICE);
        const playerConnectedNftMarketplace = nftMarktplace.connect(player);
        await playerConnectedNftMarketplace.buyItem(basicNft.address, TOKEN_ID);
        const newOwner = await basicNft.ownerOF(TOKEN_ID);
        const deployerProceeds = await nftMarktplace.getProceeds(deployer);
        assert(newOwner.toString() == player.address);
        assert(deployerProceeds.toString() == PRICE.toString());
    })
})

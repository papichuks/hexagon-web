import { network } from 'hardhat';

const { ethers } = await network.connect();

console.log('Deploying Hexagon...');

const [sender] = await ethers.getSigners();

const hexagon = await ethers.deployContract('Hexagon');
await hexagon.waitForDeployment();

console.log('Hexagon deployed to:', await hexagon.getAddress());
console.log('Deployer address:', sender.address);

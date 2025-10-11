import { expect } from 'chai';
import { network } from 'hardhat';

const { ethers } = await network.connect();

describe('Hexagon', function () {
  async function fresh() {
    const [owner, otherAccount] = await ethers.getSigners();
    const hexagon = await ethers.deployContract('Hexagon');
    return { ethers, hexagon, owner, otherAccount };
  }

  describe('Manufacturer', function () {
    describe('Register Manufacturer', function () {
      async function registerManufacturer(name: string) {
        const { hexagon, owner, otherAccount } = await fresh();
        await hexagon.register(name);
        return { hexagon, owner, otherAccount };
      }

      it('returns manufacturer details for registered address', async function () {
        const name = 'hexdee';
        const { hexagon, owner } = await registerManufacturer(name);
        const manufacturer = await hexagon.getManufacturer(owner.address);
        expect(manufacturer[1]).to.equal(name);
        expect(manufacturer[2]).to.equal(owner.address);
      });

      it('isManufacturer true for registered address', async function () {
        const { hexagon, owner } = await registerManufacturer('hexdee');
        expect(await hexagon.isManufacturer(owner.address)).to.equal(true);
      });

      it('isManufacturer false for unregistered address', async function () {
        const { hexagon, otherAccount } = await registerManufacturer('hexdee');
        expect(await hexagon.isManufacturer(otherAccount.address)).to.equal(
          false
        );
      });

      it('increases totalManufacturers', async function () {
        const { hexagon } = await registerManufacturer('hexdee');
        expect(Number(await (hexagon as any).totalManufacturers())).to.equal(1);
      });
    });

    describe('Create Product', function () {
      it('only manufacturers can create product', async function () {
        const { hexagon, otherAccount } = await fresh();
        const name = 'name';
        const url = 'https://url';
        await hexagon.register('hexdee');
        await expect(hexagon.createProduct(name, url)).not.to.be.revert(ethers);
        await expect(
          hexagon.connect(otherAccount).createProduct(name, url)
        ).to.be.revertedWith('Only manufacturers can call this function!');
      });

      it('increases totalProducts', async function () {
        const { hexagon } = await fresh();
        const name = 'name';
        const url = 'https://url';
        await hexagon.register('hexdee');
        await hexagon.createProduct(name, url);
        expect(Number(await (hexagon as any).totalProducts())).to.equal(1);
      });

      it('getProduct returns product details', async function () {
        const { hexagon } = await fresh();
        const name = 'name';
        const url = 'https://url';
        await hexagon.register('hexdee');
        await hexagon.createProduct(name, url);
        const product = await hexagon.getProduct(name);
        expect(product[1]).to.equal(name);
        expect(product[2]).to.equal(url);
      });

      it('getInfo returns product url', async function () {
        const { hexagon } = await fresh();
        const name = 'name';
        const url = 'https://url';
        await hexagon.register('hexdee');
        await hexagon.createProduct(name, url);
        const info = await hexagon.getInfo(name);
        expect(info).to.equal(url);
      });

      it('reverts getProduct for invalid product name', async function () {
        const { hexagon } = await fresh();
        const name = 'name';
        const url = 'https://url';
        await hexagon.register('hexdee');
        await hexagon.createProduct(name, url);
        await expect(hexagon.getProduct(name)).not.to.be.revert(ethers);
        await expect(hexagon.getProduct('invalid name')).to.be.revertedWith(
          'Invalid product!'
        );
      });
    });

    describe('Create Item', function () {
      it('only manufacturers can create item', async function () {
        const { ethers, hexagon, otherAccount } = await fresh();
        const code = ethers.encodeBytes32String('hexdee');
        const abi = ethers.AbiCoder.defaultAbiCoder();
        const items = [ethers.keccak256(abi.encode(['bytes32'], [code]))];
        const name = 'name';
        const url = 'https://url';
        await hexagon.register('hexdee');

        await hexagon.createProduct(name, url);
        await expect(hexagon.createItems(name, items)).not.to.be.revert(ethers);

        await expect(
          hexagon.connect(otherAccount).createItems('invalid product', items)
        ).to.be.revertedWith('Invalid product!');
      });

      it('increases number of items', async function () {
        const { ethers, hexagon } = await fresh();
        const code = ethers.encodeBytes32String('hexdee');
        const abi = ethers.AbiCoder.defaultAbiCoder();
        const items = [ethers.keccak256(abi.encode(['bytes32'], [code]))];
        const name = 'name';
        const url = 'https://url';
        await hexagon.register('hexdee');
        await hexagon.createProduct(name, url);
        await hexagon.createItems(name, items);
        const product = await hexagon.getProduct(name);
        expect(Number(product[4])).to.equal(1);
      });

      it('authenticates valid code once', async function () {
        const { ethers, hexagon } = await fresh();
        const code = ethers.encodeBytes32String('hexdee');
        const abi = ethers.AbiCoder.defaultAbiCoder();
        const items = [ethers.keccak256(abi.encode(['bytes32'], [code]))];
        const name = 'name';
        const url = 'https://url';
        await hexagon.register('hexdee');
        await hexagon.createProduct(name, url);
        await hexagon.createItems(name, items);
        const codeInByte32 = ethers.encodeBytes32String('hexdee');
        await expect(
          hexagon.checkAuthenticity(name, codeInByte32)
        ).not.to.be.revert(ethers);
      });

      it('does not authenticate a code twice', async function () {
        const { ethers, hexagon } = await fresh();
        const code = ethers.encodeBytes32String('hexdee');
        const abi = ethers.AbiCoder.defaultAbiCoder();
        const items = [ethers.keccak256(abi.encode(['bytes32'], [code]))];
        const name = 'name';
        const url = 'https://url';
        await hexagon.register('hexdee');
        await hexagon.createProduct(name, url);
        await hexagon.createItems(name, items);
        const codeInByte32 = ethers.encodeBytes32String('hexdee');
        await expect(
          hexagon.checkAuthenticity(name, codeInByte32)
        ).not.to.be.revert(ethers);
        await expect(
          hexagon.checkAuthenticity(name, codeInByte32)
        ).to.be.revertedWith('Product already bought!');
      });

      it('does not authenticate invalid code', async function () {
        const { ethers, hexagon } = await fresh();
        const code = ethers.encodeBytes32String('hexdee');
        const abi = ethers.AbiCoder.defaultAbiCoder();
        const items = [ethers.keccak256(abi.encode(['bytes32'], [code]))];
        const name = 'name';
        const url = 'https://url';
        await hexagon.register('hexdee');
        await hexagon.createProduct(name, url);
        await hexagon.createItems(name, items);
        const codeInByte32 = ethers.encodeBytes32String('hexagon');
        await expect(
          hexagon.checkAuthenticity(name, codeInByte32)
        ).to.be.revertedWith('Invalid code!');
      });
    });

    describe('Others', function () {
      it('only manufacturer can update product', async function () {
        const { hexagon, otherAccount } = await fresh();
        const name = 'name';
        const url = 'https://url';
        const new_url = 'https://new_url';
        await hexagon.register('hexdee');
        await expect(hexagon.createProduct(name, url)).not.to.be.revert(ethers);
        await expect(hexagon.updateProduct(name, new_url)).not.to.be.revert(
          ethers
        );
        await expect(
          hexagon.connect(otherAccount).createProduct(name, url)
        ).to.be.revertedWith('Only manufacturers can call this function!');
        await expect(
          hexagon.connect(otherAccount).updateProduct(name, new_url)
        ).to.be.revertedWith(
          'Only product manufacturers can call this function!'
        );
      });

      it('returns new url after updating product', async function () {
        const { hexagon } = await fresh();
        const name = 'name';
        const url = 'https://url';
        const new_url = 'https://new_url';
        await hexagon.register('hexdee');
        await hexagon.createProduct(name, url);
        await hexagon.updateProduct(name, new_url);
        const product = await hexagon.getProduct(name);
        expect(product[2]).to.equal(new_url);
        expect(await hexagon.getInfo(name)).to.equal(new_url);
      });

      it('returns all manufacturer products in getManufacturer', async function () {
        const { hexagon, owner } = await fresh();
        const name1 = 'name1';
        const url1 = 'https://url1';
        const name2 = 'name2';
        const url2 = 'https://url2';
        await hexagon.register('hexdee');
        await hexagon.createProduct(name1, url1);
        await hexagon.createProduct(name2, url2);
        const manufacturer = await hexagon.getManufacturer(owner.address);
        expect(manufacturer[3]).to.have.deep.members([name1, name2]);
      });
    });
  });
});

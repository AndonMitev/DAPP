const ProductManagmentLib = artifacts.require("ProductManagmentLib");
const TeamManagmentLib = artifacts.require("TeamManagmentLib");
const SafeMathLib = artifacts.require("SafeMathLib");
const Ownable = artifacts.require("Ownable");
const Store = artifacts.require("Store");

module.exports = function (deployer) {
  deployer.deploy(ProductManagmentLib);
  deployer.deploy(TeamManagmentLib);
  deployer.deploy(SafeMathLib);
  deployer.link(ProductManagmentLib, Store);
  deployer.link(TeamManagmentLib, Store);
  deployer.link(SafeMathLib, Store);
  deployer.deploy(Ownable);
  deployer.deploy(Store);
};

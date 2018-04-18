let WhiteList = artifacts.require("./WhiteList.sol");

module.exports = function(deployer) {
  deployer.deploy(WhiteList);
};

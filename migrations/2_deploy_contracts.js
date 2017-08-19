var Bidding = artifacts.require("./Bidding.sol");
module.exports = function(deployer) {
  deployer.deploy(Bidding, 'car', 'cadilac', 3600, 40, 0x92ee892000f654c7f5df0f09077a848af23f71cd);
};

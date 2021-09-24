var Grimalkin = artifacts.require("./Grimalkin");

module.exports = function(deployer) {
  deployer.deploy(Grimalkin, "Grimalkin", "GMK");
};
const Grimalkin = artifacts.require("./contracts/Grimalkin.sol");

contract("Grimalkin test", async accounts => {
  it("Contract instance should be owned by accounts[0]", async () => {
    const grimalkinInstance = await Grimalkin.deployed();
    const contractOwner = await grimalkinInstance.owner.call();

    // Check contract owner is accounts[0]
    assert.equal(contractOwner, accounts[0], "accounts[0] is not the owner");
  });

  it("Should mint Grimalkin x1 to accounts[1]", async () => {
    const grimalkinInstance = await Grimalkin.deployed();
    await grimalkinInstance.mintGrimalkin(1, { from: accounts[1], value: 0.05 * 10 ** 18 });

    const totalCats = await grimalkinInstance.totalSupply.call();
    const owner = await grimalkinInstance.ownerOf.call(0);
    const amountOwned = await grimalkinInstance.balanceOf.call(accounts[1])

    assert.equal(totalCats, 1, "Incorrect current total supply")
    assert.equal(owner, accounts[1], "Grimalkin not minted to correct account");
    assert.equal(amountOwned, 1, "Incorrect balance");
  });

  it("Should mint Grimalkin x10 to accounts[2]", async () => {
    const grimalkinInstance = await Grimalkin.deployed();
    await grimalkinInstance.mintGrimalkin(10, { from: accounts[2], value: 0.05 * 10 * 10 ** 18 });

    const totalCats = await grimalkinInstance.totalSupply.call();
    const amountOwned = await grimalkinInstance.balanceOf.call(accounts[2])

    assert.equal(totalCats, 11, "Incorrect current total supply")
    assert.equal(amountOwned, 10, "Incorrect balance");
  });

  it("Should fail to mint Grimalkin: insufficient ether value", async () => {
    /********************* TODO *********************/
    assert.equal(0, 0);
  });

  it("Should fail to mint Grimalkin: exceed total supply", async () => {
    /********************* TODO *********************/
    assert.equal(0, 0);
  });

  it("Should reserve Grimalkin x50 to owner", async () => {
    /********************* TODO *********************/
    assert.equal(0, 0);
  });

  it("Should fail to reserve Grimalkin: not owner", async () => {
    /********************* TODO *********************/
    assert.equal(0, 0);
  });

  it("Should fail to reserve Grimalkin: exceed total supply", async () => {
    /********************* TODO *********************/
    assert.equal(0, 0);
  });

  it("Should start quest correctly", async () => {
    const grimalkinInstance = await Grimalkin.deployed();
    const maxClaimable = 1;
    const geneToMutateId = 7;
    const mutatedGene = 69;
    const difficulty = 0;
    const kiCost = 10;
    await grimalkinInstance.startQuest(maxClaimable, geneToMutateId, mutatedGene, difficulty, kiCost, { from: accounts[0] });

    const quest = await grimalkinInstance.getQuest.call(0);
    const numQuests = await grimalkinInstance.getAllQuests.call();

    assert.equal(quest.id, 0, "Incorrect quest id");
    assert.equal(quest.isActive, true, "Incorrect active state");
    assert.equal(quest.maxClaimable, maxClaimable, "Incorrect claimable amount");
    assert.equal(quest.geneToMutateId, geneToMutateId, "Incorrect gene to mutate id");
    assert.equal(quest.mutatedGene, mutatedGene, "Incorrect mutated gene");
    assert.equal(numQuests.length, 1, "Incorrect total number of quests")
  });

  it("Should start second quest correctly", async () => {
    const grimalkinInstance = await Grimalkin.deployed();
    const maxClaimable = 2;
    const geneToMutateId = 0;
    const mutatedGene = 34;
    const difficulty = 100;
    const kiCost = 10;
    await grimalkinInstance.startQuest(maxClaimable, geneToMutateId, mutatedGene, difficulty, kiCost, { from: accounts[0] });

    const quest = await grimalkinInstance.getQuest.call(1);
    const numQuests = await grimalkinInstance.getAllQuests.call();

    assert.equal(quest.id, 1, "Incorrect quest id");
    assert.equal(quest.isActive, true, "Incorrect active state");
    assert.equal(quest.maxClaimable, maxClaimable, "Incorrect claimable amount");
    assert.equal(quest.geneToMutateId, geneToMutateId, "Incorrect gene to mutate id");
    assert.equal(quest.mutatedGene, mutatedGene, "Incorrect mutated gene");
    assert.equal(numQuests.length, 2, "Incorrect total number of quests");
  });

  it("Should fail to start quest: not owner", async () => {
    /********************* TODO *********************/
    assert.equal(0, 0);
  });

  it("Should successfully attempt quest and mutate dna correctly", async () => {
    const questId = 0;
    const catId = 0;
    const grimalkinInstance = await Grimalkin.deployed();
    const cat = await grimalkinInstance.getCat.call(catId);
    const quest = await grimalkinInstance.getQuest.call(questId);

    await grimalkinInstance.attemptQuest(cat.id, quest.id, 1, { from: accounts[1] });
    const catAfter = await grimalkinInstance.getCat.call(catId);
    const questAfter = await grimalkinInstance.getQuest.call(questId);
    const claimed = await grimalkinInstance.getQuestRewardClaimed.call(quest.id, cat.id);

    console.log('old dna: ' + cat.dna);
    console.log('new dna: ' + catAfter.dna);
    console.log('ki balance: ' + catAfter.ki);

    assert.equal(catAfter.ki, cat.ki - quest.kiCost, "Incorrect ki spent");
    assert.equal(questAfter.claimed, 1, "Quest claimed  did not update correctly");
    assert.equal(claimed, true, "_questRewardClaimed[questId][tokenId] not updated correctly");
    assert.equal(catAfter.dna % 100, 69, "dna did not mutate correctly");
  });

  it("Should successfully attempt and fail quest", async () => {
    const questId = 1;
    const catId = 1;
    const grimalkinInstance = await Grimalkin.deployed();
    const cat = await grimalkinInstance.getCat.call(catId);
    const quest = await grimalkinInstance.getQuest.call(questId);

    await grimalkinInstance.attemptQuest(cat.id, quest.id, 10, { from: accounts[2] }); // attempt x5
    const catAfter = await grimalkinInstance.getCat.call(catId);
    const questAfter = await grimalkinInstance.getQuest.call(questId);
    const claimed = await grimalkinInstance.getQuestRewardClaimed.call(quest.id, cat.id);

    console.log('old dna: ' + cat.dna);
    console.log('new dna: ' + catAfter.dna);
    console.log('ki balance: ' + catAfter.ki);
    assert.equal(catAfter.ki, cat.ki - quest.kiCost * 10, "Incorrect ki spent");
    assert.equal(questAfter.claimed, 0, "Quest claimed  did not update correctly");
    assert.equal(claimed, false, "_questRewardClaimed[questId][tokenId] updated incorrectly");
    assert.equal(catAfter.dna, catAfter.dna, "dna should not mutate");
  });

  it("Should fail to attempt quest: not owner nor approved", async () => {
    /********************* TODO *********************/
    assert.equal(0, 0);
  });

  it("Should fail to attempt quest: quest not active", async () => {
    /********************* TODO *********************/
    assert.equal(0, 0);
  });

  it("Should fail to attempt quest: insufficient ki", async () => {
    /********************* TODO *********************/
    assert.equal(0, 0);
  });

  it("Should fail to attempt quest: already claimed quest reward", async () => {
    /********************* TODO *********************/
    assert.equal(0, 0);
  });

  it("Should fail to attempt quest: quest reward fully claimed", async () => {
    /********************* TODO *********************/
    assert.equal(0, 0);
  });

  it("Should successfully end quest", async () => {
    /********************* TODO *********************/
    assert.equal(0, 0);
  });

  it("Should fail to end quest: not owner", async () => {
    /********************* TODO *********************/
    assert.equal(0, 0);
  });

  it("Should successfully start ki potion", async () => {
    /********************* TODO *********************/
    assert.equal(0, 0);
  });

  it("Should fail to start ki potion: not owner", async () => {
    /********************* TODO *********************/
    assert.equal(0, 0);
  });

  it("Should successfully claim ki potion", async () => {
    /********************* TODO *********************/
    assert.equal(0, 0);
  });

  it("Should fail to claim ki potion: not owner nor approved", async () => {
    /********************* TODO *********************/
    assert.equal(0, 0);
  });

  it("Should fail to claim ki potion: ki potion not active", async () => {
    /********************* TODO *********************/
    assert.equal(0, 0);
  });

  it("Should fail to claim ki potion: already claimed potion", async () => {
    /********************* TODO *********************/
    assert.equal(0, 0);
  });

  it("Should successfully end ki potion", async () => {
    /********************* TODO *********************/
    assert.equal(0, 0);
  });

  it("Should fail to end ki potion: not owner", async () => {
    /********************* TODO *********************/
    assert.equal(0, 0);
  });
});

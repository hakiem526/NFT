// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./standards/ERC721Enumerable.sol";
import "./utils/Ownable.sol";

contract Grimalkin is ERC721Enumerable, Ownable {
    uint256 private constant maxSupply = 10000;
    uint256 private dropQuota; // REMOVE?
    string private baseURI;
    uint256 private constant catPrice = 0.05 ether;

    // Mapping from token ID to Cat
    mapping(uint256 => Cat) _cats;

    // List of quests
    Quest[] _quests;
    mapping(uint256 => mapping(uint256 => bool)) _questRewardClaimed; // quest id => token id => hasClaimed

    // List of potions
    // TODO: RENAME LOL
    KiPotion[] _kiPotions;
    mapping(uint256 => mapping(uint256 => bool)) _potionClaimed; // potion id => token id => hasClaimed

    // Mapping from token ID to token URI
    mapping(uint256 => string) _tokenURI;

    struct Cat {
        uint256 id;
        uint256 dna;
        uint256 ki;
    }

    struct Quest {
        uint256 id;
        bool isActive;
        uint256 maxClaimable;
        uint256 geneToMutateId; // 0-7
        uint256 mutatedGene;
        uint256 difficulty; // 0-99
        uint256 kiCost;
        uint256 claimed;
    }

    struct KiPotion {
        uint256 id;
        bool isActive;
        uint256 kiToReplenish;
    }

    constructor(string memory name, string memory symbol)
        ERC721(name, symbol)
        Ownable()
    {
        // SET BASE URI HERE //
        baseURI = "";
    }

    /**
     * Reserve n cats
     */
    function reserveGrimalkin(uint256 numCats) public onlyOwner {
        require(
            totalSupply() + numCats <= maxSupply,
            "Reservation would exceed max supply."
        );
        for (uint256 i = 0; i < numCats; i++) {
            uint256 mintIndex = totalSupply();
            if (totalSupply() < maxSupply) {
                _safeMint(msg.sender, mintIndex);
                _createRandomCat(mintIndex);
            }
        }
    }

    /**
     * Mint cat(s) to sender's wallet.
     */
    function mintGrimalkin(uint256 numCats) public payable {
        require(
            totalSupply() + numCats <= maxSupply,
            "Purchase would exceed max supply of cats."
        );
        require(
            catPrice * numCats <= msg.value,
            "Insufficient Ether value sent."
        );

        for (uint256 i = 0; i < numCats; i++) {
            uint256 mintIndex = totalSupply();
            if (totalSupply() < maxSupply) {
                _safeMint(msg.sender, mintIndex);
                _createRandomCat(mintIndex);
            }
        }
    }

    function startQuest(
        uint256 _maxClaimable,
        uint256 _geneToMutateId,
        uint256 _mutatedGene,
        uint256 _difficulty,
        uint256 _kiCost
    ) public onlyOwner {
        require(_geneToMutateId < 8, "Incorrect gene id");
        require(
            _mutatedGene > 9 && _mutatedGene < 100,
            "Incorrect mutated gene"
        );
        // require(_difficulty < 100, "Incorrect difficulty"); commented out for testing purposes

        uint256 id = _quests.length;
        Quest memory newQuest = Quest(
            id,
            true,
            _maxClaimable,
            _geneToMutateId,
            _mutatedGene,
            _difficulty,
            _kiCost,
            0
        );
        _quests.push(newQuest);
    }

    function endQuest(uint256 questId) public onlyOwner {
        Quest storage quest = _quests[questId];
        quest.isActive = false;
    }

    function attemptQuest(
        uint256 tokenId,
        uint256 questId,
        uint256 numAttempts
    ) public {
        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            "ERC721: transfer caller is not owner nor approved"
        );
        require(_quests[questId].isActive, "Quest is not active");
        require(
            _cats[tokenId].ki >= _quests[questId].kiCost * numAttempts,
            "Insufficient ki"
        );
        require(
            !_questRewardClaimed[questId][tokenId],
            "Grimalkin has already claimed quest reward"
        );
        require(
            _quests[questId].claimed < _quests[questId].maxClaimable,
            "Quest reward fully claimed"
        );

        Cat storage cat = _cats[tokenId];
        Quest storage quest = _quests[questId];
        uint256 kiSpent = 0;

        for (uint256 i = 0; i < numAttempts; i++) {
            kiSpent += quest.kiCost;
            if (_getRandomNum(100) + 1 > quest.difficulty) {
                cat.dna = _getMutatedDna(
                    cat.dna,
                    quest.geneToMutateId,
                    quest.mutatedGene
                );
                _questRewardClaimed[questId][tokenId] = true;
                quest.claimed += 1;
                break;
            }
        }
        cat.ki -= kiSpent;
    }

    function startKiPotion(uint256 _kiToReplenish) public onlyOwner {
        uint256 id = _quests.length;
        KiPotion memory newKiPotion = KiPotion(
            id,
            true,
            _kiToReplenish
        );
        _kiPotions.push(newKiPotion);
    }

    function endKiPotion(uint256 potionId) public onlyOwner {
        KiPotion storage potion = _kiPotions[potionId];
        potion.isActive = false;
    }

    function claimKiPotion(uint256 potionId, uint256 tokenId) public {
        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            "ERC721: transfer caller is not owner nor approved"
        );
        require(_kiPotions[potionId].isActive, "Potion is not active");
        require(
            !_potionClaimed[potionId][tokenId],
            "Grimalkin has already claimed potion"
        );

        Cat storage cat = _cats[tokenId];
        cat.ki += _kiPotions[potionId].kiToReplenish;
        _potionClaimed[potionId][tokenId] = true;

    }

    function setDropQuota(uint256 dropQuota_) public onlyOwner {
        dropQuota = dropQuota_;
    }

    function setBaseURI(string memory baseURI_) public onlyOwner {
        baseURI = baseURI_;
    }

    // to remove at deployment: use LINK VRF instead
    function _getRandomNum(uint256 mod) internal view returns (uint256) {
        uint256 randomNum = uint256(
            keccak256(abi.encodePacked(block.timestamp, msg.sender))
        );
        return randomNum % mod;
    }

    // to remove at deployment: use LINK VRF instead
    function _getRandomDna() internal view returns (uint256) {
        uint256 randomNum = uint256(
            keccak256(abi.encodePacked(block.timestamp, msg.sender))
        ) % 10**16;
        while (randomNum / 10**15 == 0) {
            // ensures 16 digit dna
            randomNum *= 10;
        }
        return randomNum;
    }

    function _createRandomCat(uint256 tokenId) internal {
        require(
            _exists(tokenId),
            "ERC721Metadata: URI query for nonexistent token"
        );
        uint256 dna = _getRandomDna();
        uint256 ki = 100;
        Cat memory newCat = Cat(tokenId, dna, ki);
        _cats[tokenId] = newCat;
    }

    function _getMutatedDna(
        uint256 dna,
        uint256 geneToMutateId,
        uint256 mutatedGene
    ) internal pure returns (uint256) {
        uint256 firstHalfDna = (geneToMutateId == 0)
            ? 0
            : dna / 10**(16 - 2 * geneToMutateId);
        uint256 secondHalfDna = dna % 10**(16 - 2 * (geneToMutateId + 1));
        uint256 newDna = (firstHalfDna * 100 + mutatedGene) *
            10**(16 - 2 * (geneToMutateId + 1)) +
            secondHalfDna;
        return newDna;
    }

    // ########################### TODO ###########################
    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        require(
            _exists(tokenId),
            "ERC721Metadata: URI query for nonexistent token"
        );

        return
            bytes(baseURI).length > 0
                ? string(abi.encodePacked(baseURI, _tokenURI[tokenId]))
                : "";
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    function withdraw() external onlyOwner {
        address _owner = owner();
        payable(_owner).transfer(address(this).balance);
    }

    function getCat(uint256 id) public view returns (Cat memory) {
        return _cats[id];
    }

    function getAllCatsByOwner(address owner)
        public
        view
        returns (Cat[] memory)
    {
        uint256 numOwned = balanceOf(owner);
        Cat[] memory ownedCats = new Cat[](numOwned);
        for (uint256 i = 0; i < numOwned; i++) {
            ownedCats[i] = _cats[tokenOfOwnerByIndex(owner, i)];
        }
        return ownedCats;
    }

    function getQuest(uint256 id) public view returns (Quest memory) {
        return _quests[id];
    }

    function getAllQuests() public view returns (Quest[] memory) {
        return _quests;
    }

    function getQuestRewardClaimed(uint256 questId, uint256 tokenId)
        public
        view
        returns (bool)
    {
        return _questRewardClaimed[questId][tokenId];
    }
}

const Store = artifacts.require("Store");
const ethers = require('ethers');

contract("Store", accounts => {
  let store;
  const owner = accounts[0];

  beforeEach(async () => {
    store = await Store.deployed();
  });

  describe('check contract initial state', () => {
    it('should owner be the first account', async () => {
      // Act
      const checkOwner = await store.owner();
      const checkOwnerBalance = await store.myBalance();

      // ASsert
      assert.equal(owner, checkOwner, 'Owner address missmatch');
      assert.equal(+checkOwnerBalance, 0, 'Owner balance is not 0');
    });

    it('should have only 1 member, and rest of the state must be 0', async () => {
      // Arange
      const contractState = [];
      const expected = {
        contractBalance: 0,
        totalSells: 0,
        totalProducts: 0,
        pendingToJoin: 0,
        contractMembers: 0
      };

      // Act
      const contractSellsInfo = await store.checkSellsOfContract();
      const contractTeamMembers = await store.memberData();

      [contractSellsInfo, contractTeamMembers]
        .forEach(object =>
          Object.keys(object)
            .forEach(key => {
              contractState.push(+contractSellsInfo[key]);
            })
        );

      // Assert
      assert.equal(contractState[0], expected.contractBalance, 'Balance is not 0');
      assert.equal(contractState[1], expected.totalSells, 'Sells is not 0');
      assert.equal(contractState[2], expected.totalProducts, `Products aren't zero `);
      assert.equal(contractState[3], expected.pendingToJoin, 'Pending to join is not 0');
      assert.equal(contractState[4], expected.contractMembers, 'Total members is not 0, (Owner is not regular team member)');
    });
  });

  describe('test adding new team member', () => {
    it('should update hash on pending users to join, when user apply', async () => {
      // Arrange
      const [expectedListOfUsersToJoinHash, expectedEventName] = ['WM_UserToJoinHash', 'ApplyedForTeam'];

      // Act
      const result = await store.applyForTeam(expectedListOfUsersToJoinHash, {
        from: accounts[4]
      });
      const eventName = result.logs[0].event;
      const candidateAddress = result.logs[0].args._participant;
      const listOfMembersToJoinHash = await store.listOfMembersToJoin();

      // Assert
      assert.equal(eventName, expectedEventName, 'Invalid event emitted');
      assert.equal(accounts[4], candidateAddress, 'Invalid candidate address');
      assert.equal(listOfMembersToJoinHash, expectedListOfUsersToJoinHash, 'Invalid hash for users to join');
    });

    it('should accept user when he apply and update contract state', async () => {
      // Arrange
      const [expectedUsersToJoinHash, expectedAllMembersHash, expectedEventName] =
        ['WM_UpdatedUserToJoinHash', 'WM_UpdatedAllMembersHash', 'AcceptedInTeam'];

      // Act
      await store.applyForTeam(expectedUsersToJoinHash, {
        from: accounts[4]
      });

      const result = await store.acceptMember(accounts[4], expectedAllMembersHash, expectedUsersToJoinHash, {
        from: accounts[0]
      });
      const eventName = result.logs[0].event;
      const acceptedMemberAddress = result.logs[0].args._teamMember;
      const pendingToJoinHash = await store.listOfMembersToJoin();
      const teamMembersHash = await store.allTeamMembers();

      // Assert
      assert.equal(eventName, expectedEventName, 'Invalid event emitted');
      assert.equal(acceptedMemberAddress, accounts[4], 'Invalid member joined');
      assert.equal(pendingToJoinHash, expectedUsersToJoinHash, 'Invalid hash for pending to join');
      assert.equal(teamMembersHash, expectedAllMembersHash, 'Invalid hash for all members');
    });
  });

  describe('test product flow, adding => buying => withdrawing', () => {
    let _productOwner, _allProductsHash, _price, _quantity, _singleProductHash, _userProductsHash, funcArgs;

    beforeEach(() => {
      _productOwner = accounts[0];
      _allProductsHash = 'Wm_allProducts';
      _price = 1;
      _quantity = 15;
      _singleProductHash = 'Wm_singleProduct';
      _userProductsHash = 'Wm_userProducts';
      funcArgs = [_productOwner, _allProductsHash, _price, _quantity, _singleProductHash, _userProductsHash];
    });

    it('should add product, emit event and update contact state', async () => {
      // Arrange
      const [expectedEventName, expectedTotalProducts, contractStates] = ['NewProductAdded', 1, []];

      // Act
      const result = await store.addProduct(
        ...funcArgs
      );
      const { event, args: { _productOwner } } = result.logs[0];
      const contractSellsInfo = await store.checkSellsOfContract();
      Object.keys(contractSellsInfo)
        .forEach(key => contractStates.push(+contractSellsInfo[key]));

      // Assert
      assert.equal(event, expectedEventName, 'Event name do not match');
      assert.equal(_productOwner, accounts[0], 'Owner do not match');
      assert.equal(contractSellsInfo[2], expectedTotalProducts, 'Total products do not match');
    });

    it('should test full flow of add buy withdraw', async () => {
      // Arrange
      const [
        expectedAllProductsHash,
        expectedSingleProductHash,
        expectedAddingEventName,
        exptectedBuyingEventName,
        expectedWithdrawedEventName
      ] = [
          'Wm_allNewHash',
          'Wm_singleNewHash',
          'NewProductAdded',
          'ProductBuyed',
          'Withdrawed'
        ];

      const [_id, _quantity] = [1, 2];
      const buyProductArgs = [_productOwner, _id, _quantity, 'Wm_singleNewHash', 'Wm_allNewHash', 'Wm_userNewHash']

      // Act
      const resultFromAdding = await store.addProduct(
        ...funcArgs
      );

      const priceToStr = (_price * _quantity).toString();
      const sendedEthers = ethers.utils.parseEther(priceToStr);
      const resultFromBuying = await store.buyProduct(...buyProductArgs, {
        from: accounts[4],
        value: sendedEthers
      });

      let productOwnerBalance = await store.myBalance({
        from: owner
      });
      productOwnerBalance = productOwnerBalance.toString();
      const allProducts = await store.allProducts();
      const singleProduct = await store.getDetailsOfProduct(_productOwner, 1);

      const addingEventName = resultFromAdding.logs[0].event;
      const addingEventProductOwner = resultFromAdding.logs[0].args._productOwner;
      const buyingEventName = resultFromBuying.logs[0].event;
      const buyingProductFrom = resultFromBuying.logs[0].args._productOwner;
      const buyingPrice = (resultFromBuying.logs[0].args._price).toString();

      // Assert
      assert.equal(addingEventName, expectedAddingEventName, 'Invalid event dispatched when product is added');
      assert.equal(addingEventProductOwner, owner, 'Not matching product owner when product is added');
      assert.equal(buyingEventName, exptectedBuyingEventName, 'Invalid event dispatched when product is buyed');
      assert.equal(buyingProductFrom, owner, 'Invalid dealer');
      assert.equal(buyingPrice, sendedEthers, 'Invalid amount of ethers was send');
      assert.equal(allProducts, expectedAllProductsHash, 'Invalid hash for all products');
      assert.equal(singleProduct, expectedSingleProductHash, 'Invalid hash for single product');
      assert.equal(productOwnerBalance, sendedEthers, 'Product owner balance is incorrect');

      // Act
      const amountToWithdraw = ethers.utils.parseEther('2');
      const withdraw = await store.withdraw(amountToWithdraw, {
        from: owner
      });

      const withdrawedEventName = withdraw.logs[0].event;
      const { withdrawer, amount } = withdraw.logs[0].args;

      // Assert
      assert.equal(withdrawedEventName, expectedWithdrawedEventName, 'Not correct event dispatched');
      assert.equal(withdrawer, owner, 'Not correct withdrawer');
      assert.equal(amount.toString(), amountToWithdraw.toString(), 'Incorrect amount withdrawed');

      productOwnerBalance = await store.myBalance({
        from: owner
      });
      productOwnerBalance = productOwnerBalance.toString();

      assert.equal(productOwnerBalance, 0, 'Product owner balance must be 0');
    });

    it('should successfully add product and edit it', async () => {
      // Arrange
      const [expctedAllHash, expectedSingleHash, expectedUserProdHash, expectedQuantity, expectedEventName, productId] =
        ['WM_newAllProductsHash', 'WM_singlePRODUCTSHash', 'WM_USER_PRODUCTS_HASH', 167, 'ProductEdited', 1]

      // Act
      await store.addProduct(
        ...funcArgs
      );

      funcArgs[1] = expctedAllHash;
      funcArgs[3] = expectedQuantity;
      funcArgs[4] = expectedSingleHash;
      funcArgs[5] = expectedUserProdHash;
      funcArgs = funcArgs.slice(1);

      const result = await store.setEditedProduct(productId, ...funcArgs);
      const editEventName = result.logs[0].event;
      const itemProductOwner = result.logs[0].args._productOwner;
      const itemId = result.logs[0].args._id;
      const newItemHash = await store.getDetailsOfProduct(owner, productId);
      const newAllProductsHash = await store.allProducts();
      const newMemberProductsHash = await store.getProductsForMember(owner);

      // Assert
      assert.equal(editEventName, expectedEventName, 'Invalid event dispatched');
      assert.equal(itemProductOwner, owner, 'Invalid product owner');
      assert.equal(itemId, productId, 'Invalid mutated product if itemId !== productId');
      assert.equal(newItemHash, expectedSingleHash, 'Invalid new hash on single product');
      assert.equal(newAllProductsHash, expctedAllHash, 'Invalid new hash on all products');
      assert.equal(newMemberProductsHash, expectedUserProdHash, 'Invalid new hash on user products');
    });
  });
});
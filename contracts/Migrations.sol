pragma solidity ^0.5.0;

pragma solidity >=0.4.22 <0.6.0;
contract Ownable {
    address public owner;
     
    constructor() public {
	    owner = msg.sender;
	}
	
	modifier onlyIfOwner() {
	    require(owner == msg.sender, 'Only owner can approve newly created products');
	    _;
	}
	
	modifier onlyIfNotOwner() {
	    require(owner != msg.sender, 'You cant create products');
	    _;
	}
}

contract Store is Ownable {
    struct Product {
        string productHash;
        uint price;
        uint quantity;
        uint id;
    }
    mapping(address => mapping(uint => Product)) public productOf;
    mapping(address => string) public userProducts;
    string public allProducts;
    uint public totalProducts;
    uint public totalSells;
    
    function addProduct(address _productOwner, string memory _allProducts, uint _price, uint _quantity, string memory _singleProduct, string memory _userProducts) public {
        totalProducts++;
        setProduct(_productOwner, totalProducts, _allProducts, _price, _quantity, _singleProduct, _userProducts);
    }
    
    function setEditedProduct(address _productOwner, uint _id,  string memory _allProducts, uint _price, uint _quantity, string memory _singleProduct, string memory _userProducts) public {
        setProduct(_productOwner, _id, _allProducts, _price, _quantity, _singleProduct, _userProducts);
    }
    
    function setProduct(address _productOwner, uint _id,  string memory _allProducts, uint _price, uint _quantity, string memory _singleProduct, string memory _userProducts) private {
        productOf[_productOwner][_id].productHash = _singleProduct;
        productOf[_productOwner][_id].price = _price;
        productOf[_productOwner][_id].quantity = _quantity;
        allProducts = _allProducts;
        userProducts[_productOwner] = _userProducts;
    }
    
    function getProductsForMember(address _productOwner) public view returns(string memory) {
        return userProducts[ _productOwner];
    }
    
    function getDetailsOfProduct(address _productOwner, uint _id) public view returns(string memory) {
        return productOf[_productOwner][_id].productHash;
    }
    
    function buyProduct(address _productOwner, uint _id, uint _quantity, string memory _singleProduct, string memory _allProducts, string memory _userProducts) public payable {
        totalSells++;
        setProduct(_productOwner, _id, _allProducts, productOf[_productOwner][_id].price, _quantity, _singleProduct, _userProducts);
    }
    
    // MEMBERS
    
    string public allTeamMembers;
    string public listOfMembersToJoin;
    uint public pendingToJoin;
    uint public teamMembers;
    mapping(address => bool) isMemberOf;
    mapping(address => uint) balanceOf;
    
    function joinInTheTeam(string memory _listOfMembersToJoin) public {
        listOfMembersToJoin = _listOfMembersToJoin;
        pendingToJoin++;
    }
    
    function acceptMember(address member, string memory _allTeamMembers, string memory _listOfMembersToJoin) public {
        isMemberOf[member] = true;
        pendingToJoin--;
        teamMembers++;
        allTeamMembers = _allTeamMembers;
        listOfMembersToJoin = _listOfMembersToJoin;
    }
    
    function withdraw(uint amount) public {
        address payable sender = msg.sender;
        balanceOf[sender] - amount;
        sender.transfer(amount);
    }
    
    function checkBalanceOfContract() public view returns(uint, uint, uint, uint, uint) {
        return (address(this).balance, totalSells, totalProducts, pendingToJoin, teamMembers);
    }
}

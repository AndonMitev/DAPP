pragma solidity 0.5.6;
import "./TeamManagmentLib.sol";
import "./ProductManagmentLib.sol";
import "./SafeMathLib.sol";
import "./Ownable.sol";


contract Store is Ownable {
    
    // Libraries
    using TeamManagment for TeamManagment.Metadata;
    using ProductManagment for ProductManagment.Metadata;
    using SafeMath for uint;

    // State
    TeamManagment.Metadata teamMetadata;
    ProductManagment.Metadata productMetadata;
    mapping(address => uint) balanceOf;
    
    // Events
    event NewProductAdded(address _productOwner, uint _id);
    event ProductBuyed(address _productOwner, uint _price, uint _time);
    event ProductEdited(address _productOwner, uint _id);
    event ApplyedForTeam(address _participant);
    event AcceptedInTeam(address _teamMember);
    event Withdrawed(address withdrawer, uint amount, uint time);
    
    // Modifiers

    modifier onlyIfIsPartOfTheTeam() {
        require(_onlyIfIsPartOfTheTeam(), 'You must be part of the team to post new product');
        _;
    }

    modifier onlyIfHasEnough(uint amount) {
        require(_validateWithdraw(amount), 'Not enough funds');
        _;
    }

    // Logic
    function addProduct(address _productOwner, string calldata _allProducts, uint _price, uint _quantity, string calldata _singleProduct, string calldata _userProducts) external onlyIfIsPartOfTheTeam {
        productMetadata.addProduct(_productOwner, _allProducts, _price, _quantity, _singleProduct, _userProducts);
        emit NewProductAdded(_productOwner, productMetadata.totalSells);
    }
    
    function buyProduct(address _productOwner, uint _id, uint _quantity, string calldata _singleProduct, string calldata _allProducts, string calldata _userProducts) external payable {
        uint _priceFromBuyer = msg.value;
        balanceOf[_productOwner] += _priceFromBuyer;
        productMetadata.buyProduct(_productOwner, _id, _quantity, _singleProduct, _allProducts, _userProducts);
        emit ProductBuyed(_productOwner, _priceFromBuyer, now);
    }
    
    function setEditedProduct(uint _id, string calldata _allProducts, uint _price, uint _quantity, string calldata _singleProduct, string calldata _userProducts) external {
        productMetadata.setEditedProduct(msg.sender, _id, _allProducts, _price, _quantity, _singleProduct, _userProducts);
        emit ProductEdited(msg.sender, _id);
    }
    
    function getProductsForMember(address _productOwner) external view returns(string memory) {
        return productMetadata.getProductsForMember(_productOwner);
    }
    
    function getDetailsOfProduct(address _productOwner, uint _id) external view returns(string memory) {
        return productMetadata.getDetailsOfProduct(_productOwner, _id);
    }
    
    function allProducts() external view returns(string memory) {
        return productMetadata.allProducts;
    }
    
    function applyForTeam(string calldata _listOfMembersToJoin) external {
        teamMetadata.applyForTeam(_listOfMembersToJoin);
        emit ApplyedForTeam(msg.sender);
    }
    
    function acceptMember(address _member, string calldata _allTeamMembers, string calldata _listOfMembersToJoin) external {
        teamMetadata.acceptMember(_member, _allTeamMembers, _listOfMembersToJoin);
        emit AcceptedInTeam(msg.sender);
    }
    
    function allTeamMembers() external view returns(string memory)  {
        return teamMetadata.allTeamMembers;
    }
    
    function listOfMembersToJoin() external  view returns(string memory)  {
        return teamMetadata.listOfMembersToJoin;
    }
    
    function memberData() external view returns(uint, uint) {
        return(teamMetadata.pendingToJoin, teamMetadata.teamMembers);
    }

    function myBalance() public view returns(uint) {
        return balanceOf[msg.sender];
    }
    
    function checkSellsOfContract() public view onlyIfOwner returns(uint, uint, uint)  {
        return (address(this).balance, productMetadata.totalSells, productMetadata.totalProducts);
    }

    function withdraw(uint amount) external payable onlyIfHasEnough(amount) {
        address payable sender = msg.sender;
        balanceOf[sender].sub(amount);
        sender.transfer(amount);
        emit Withdrawed(sender, amount, now);
    }

    // Modifier helpers
    function _validateWithdraw(uint amount) private view returns(bool) {
        return amount <= balanceOf[msg.sender];
    }
    
    function _onlyIfIsPartOfTheTeam() private view returns(bool) {
        return teamMetadata.isMemberOf[msg.sender] == true || msg.sender == owner;
    }
}
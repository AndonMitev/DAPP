pragma solidity 0.5.6;

library ProductManagment {
    struct Product {
        string productHash;
        uint price;
        uint quantity;
        uint id;
    }
    
    struct Metadata {
        string allProducts;
        uint totalProducts;
        uint totalSells;
        mapping(address => string) userProducts;
        mapping(address => mapping(uint => Product)) productOf;
    }

    
    function addProduct(Metadata storage metadata, address _productOwner, string calldata _allProducts, uint _price, uint _quantity, string calldata _singleProduct, string calldata _userProducts) external {
        metadata.totalProducts++;
        setProduct(metadata, _productOwner, metadata.totalProducts, _allProducts, _price, _quantity, _singleProduct, _userProducts);
    }
    
    function buyProduct(Metadata storage metadata, address _productOwner, uint _id, uint _quantity, string calldata _singleProduct, string calldata _allProducts, string calldata _userProducts) external {
        metadata.totalSells++;
        setProduct(metadata, _productOwner, _id, _allProducts, metadata.productOf[_productOwner][_id].price, _quantity, _singleProduct, _userProducts);
    }
    
    function setEditedProduct(Metadata storage metadata, address _productOwner, uint _id,  string calldata _allProducts, uint _price, uint _quantity, string calldata _singleProduct, string calldata _userProducts) external {
        setProduct(metadata, _productOwner, _id, _allProducts, _price, _quantity, _singleProduct, _userProducts);
    }
    
    function getProductsForMember(Metadata storage metadata, address _productOwner) external view returns(string memory) {
        return metadata.userProducts[_productOwner];
    }
    
    function getDetailsOfProduct(Metadata storage metadata, address _productOwner, uint _id) external view returns(string memory){
        return metadata.productOf[_productOwner][_id].productHash;
    }
    
    function setProduct(Metadata storage metadata, address _productOwner, uint _id,  string memory _allProducts, uint _price, uint _quantity, string memory _singleProduct, string memory _userProducts) private
    {
        metadata.productOf[_productOwner][_id].productHash = _singleProduct;
        metadata.productOf[_productOwner][_id].price = _price;
        metadata.productOf[_productOwner][_id].quantity = _quantity;
        metadata.allProducts = _allProducts;
        metadata.userProducts[_productOwner] = _userProducts;
    }
}
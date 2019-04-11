pragma solidity 0.5.6;

contract Ownable {
    address public owner;
     
    constructor() public {
	    owner = msg.sender;
	}
	
	modifier onlyIfOwner {
	    require(_onlyIfOwner(), 'Only owner has access to this operation');
	    _;
	}
	
	modifier onlyIfNotOwner {
	    require(_onlyIfNotOwner(), 'Owner dont have access to this operation');
	    _;
	}
	
	function _onlyIfNotOwner() private view returns(bool) {
	    return owner != msg.sender;
	}
	
	function _onlyIfOwner() private view returns(bool) {
	    return owner == msg.sender;
	}
}
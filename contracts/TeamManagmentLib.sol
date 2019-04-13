pragma solidity 0.5.6;

library TeamManagmentLib { 
    struct Metadata {
        string allTeamMembers;
        string listOfMembersToJoin;
        uint pendingToJoin;
        uint teamMembers;
        mapping(address => bool) isMemberOf;
    }
    
    function applyForTeam(Metadata storage metadata, string calldata _listOfMembersToJoin) external {
        metadata.pendingToJoin++;
        metadata.listOfMembersToJoin = _listOfMembersToJoin;
    }
    
    function acceptMember(Metadata storage metadata, address _member, string calldata _allTeamMembers, string calldata _listOfMembersToJoin) external {
        metadata.isMemberOf[_member] = true;
        metadata.pendingToJoin--;
        metadata.teamMembers++;
        metadata.allTeamMembers = _allTeamMembers;
        metadata.listOfMembersToJoin = _listOfMembersToJoin;
    }
}
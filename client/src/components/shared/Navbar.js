import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import ipfs from '../../utils/solidity/ipfs';
import contractSetup from '../../services/prepareContract';

export default class Navbar extends Component {
    state = {
        owner: {
            isOwner: null,
            address: null
        },
        member: {
            isMember: null,
            address: null
        }
    };

    componentDidMount = async () => {
        try {
            const { _, __, signer, contract } = await contractSetup;
            const owner = await contract.owner();
            const members = await contract.allTeamMembers();

            const currentMember = signer._address;

            if (owner === currentMember) {
                this.setState({
                    owner: { isOwner: true, address: currentMember }
                })
            }

            if (!members) {
                return;
            }

            const byteArray = await ipfs.cat(members);
            const teamMembers = JSON.parse(byteArray);

            teamMembers.forEach(member => {
                if (member.address === currentMember) {
                    this.setState({
                        member: { isMember: true, address: currentMember }
                    })
                }
            })
        } catch (error) {
            console.error(error);
        }
    }

    render = () => (
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary ">
            <NavLink className="navbar-brand text-white mb-1" to="/">Decentralized Store</NavLink>
            <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNavDropdown">
                <ul className="nav bg-dark bg-transparent">
                    <li className="nav-item">
                        <NavLink className="nav-link text-white mr-3" to="/home">Home <span className="sr-only">(current)</span></NavLink>
                    </li>
                    <li className="nav-item">
                        {this.state.owner.isOwner || this.state.member.isMember ? <NavLink className="nav-link  text-white mr-3" to="/my/offers">My offers</NavLink> : null}
                    </li>
                    <li className="nav-item">
                        {this.state.owner.isOwner || this.state.member.isMember ? <NavLink className="nav-link  text-white mr-3" to="/new/offer">Post offer</NavLink> : null}
                    </li>
                    <li className="nav-item">
                        <NavLink className="nav-link  text-white mr-3" to="/join">Join in the team</NavLink>
                    </li>
                    <li className="nav-item">
                        {this.state.owner.isOwner ? <NavLink className="nav-link  text-white mr-3" to="/candidates">View candidates</NavLink> : null}
                    </li>
                    <li className="nav-item">
                        <NavLink className="nav-link  text-white mr-3" to="/team">Team members</NavLink>
                    </li>
                    <li className="nav-item">
                        {this.state.owner.isOwner ? <NavLink className="nav-link  text-white mr-3" to="/contract">Contract State</NavLink> : null}
                    </li>
                    <li className="nav-item dropdown">
                    </li>
                </ul>
            </div>
        </nav>
    );

}
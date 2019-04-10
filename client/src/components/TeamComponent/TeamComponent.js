import React, { Component } from 'react';
import contractSetup from '../../services/prepareContract';
import ipfs from '../../utils/solidity/ipfs';
import { ClipLoader } from 'react-spinners';

export default class TeamComponent extends Component {
  state = {
    teamMembers: null,
    isLoading: true,
    noTeamMembersMsg: 'There are no team members yet!'
  }

  componentDidMount = async () => {
    const { _, __, ___, contract } = await contractSetup;
    const approvedMembers = await contract.allTeamMembers();

    if (!approvedMembers) {
      this.setState({ isLoading: false });
      return;
    }
    const byteArray = await ipfs.cat(approvedMembers);
    const teamMembers = JSON.parse(byteArray);
    this.setState({ teamMembers, isLoading: false });

  }

  render = () => (
    <React.Fragment>
      <h2 className="text-center mt-5 mb-5">Team Members</h2>
      <div className="row">
        {this.state.isLoading ?
          <div className="text-center mt-5 col-md-12">
            <ClipLoader
              sizeUnit={"px"}
              size={150}
              color={'red'}
              loading={this.state.isLoading}
            />
            <h2>Loading...</h2>
          </div>
          :
          <div className="col-md-12 text-center 
          ">
            {!this.state.teamMembers ?
              <h2>{this.state.noTeamMembersMsg}</h2> :
              this.state.teamMembers
                .map(candidate => {
                  return (
                    <div className="col-md-12 mt-4" key={candidate.id}>
                      <span>
                        Member: {candidate.address}
                      </span>
                    </div>
                  );
                })}
          </div>
        }
      </div>
    </React.Fragment>
  );
}
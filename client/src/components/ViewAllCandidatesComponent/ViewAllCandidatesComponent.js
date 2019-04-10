import React, { Component } from 'react';
import contractSetup from '../../services/prepareContract';
import ipfs from '../../utils/solidity/ipfs';
import { ClipLoader } from 'react-spinners';

export default class ViewAllCandidatesComponent extends Component {
  state = {
    contract: null,
    ipfs: null,
    allCandidates: null,
    isLoading: true,
    showNoCandidates: 'No pending candidates'
  }

  componentDidMount = async () => {
    const { _, __, ___, contract } = await contractSetup;
    const listOfMembersToJoin = await contract.listOfMembersToJoin();


    if (!listOfMembersToJoin) {
      this.setState({ isLoading: false });
      return;
    }
    const byteArray = await ipfs.cat(listOfMembersToJoin);
    const allCandidates = JSON.parse(byteArray);
    this.setState({ allCandidates, contract, ipfs, isLoading: false });
  }

  approveCandidate = async event => {
    try {
      const candidateId = +event.target.dataset.id;
      const candidateToApprove = this.state.allCandidates.find(candidate => candidate.id === candidateId);
      const approvedMembers = await this.state.contract.allTeamMembers();
      let listOfApprovedMembers = [];
      let tx, hash;

      if (!approvedMembers) {
        listOfApprovedMembers.push(candidateToApprove);
      } else {
        const candidatesFromIPFS = await ipfs.cat(approvedMembers);
        const existingCandidates = JSON.parse(candidatesFromIPFS);
        listOfApprovedMembers = [...existingCandidates, candidateToApprove];
      }
      const IPFSResponse = await this.prepareForIPFS(listOfApprovedMembers);
      this.setState({
        allCandidates: this.state.allCandidates.filter(candidate => candidate.id === candidateId)
      });
      const unapprovedMembers = await this.prepareForIPFS(this.state.allCandidates);
      tx = await this.state.contract.acceptMember(candidateToApprove.address, IPFSResponse[0].hash, unapprovedMembers[0].hash);
    } catch (error) {
      console.error(error);
    }
  }

  prepareForIPFS = async candidates => {
    const candidatesInByteArray = Buffer.from(JSON.stringify(candidates));
    return await ipfs.add(candidatesInByteArray);
  }

  render = () => (
    <React.Fragment>
      <h2 className="text-center mt-5 mb-5">All Candidates</h2>

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
          <div className="col-md-12">
            {!this.state.allCandidates ?
              <h2 className="text-center">{this.state.showNoCandidates}</h2> : this.state.allCandidates
                .map(candidate => {
                  return (
                    <div className="col-md-12 mt-4" key={candidate.id}>
                      <span>
                        Candidate: {candidate.address}
                        {
                          candidate.isApproved ?
                            <button data-id={candidate.id} className="btn btn-danger float-right">Candidate is approved</button> :
                            <button data-id={candidate.id} onClick={this.approveCandidate} className="btn btn-primary float-right">Approve</button>
                        }
                      </span>
                    </div>
                  );
                })}
          </div>}
      </div>
    </React.Fragment>
  );
}
import React, { Component } from 'react';
import contractSetup from '../../services/prepareContract';
import ipfs from '../../utils/solidity/ipfs';
import ModalDialog from '../shared/ModalDialog';
import { toast } from "react-toastify";

export default class JoinInTheTeamComponent extends Component {
  state = {
    contract: null,
    signer: null,
    displayErrorIfCandidateExists: null,
    isButtonDisabled: null,
    showModal: false,
    txHash: null
  };

  componentDidMount = async () => {
    const { _, __, signer, contract } = await contractSetup;
    this.setState({ signer, contract });
  }

  joinInTheTeam = async () => {
    try {
      this.setState({ isButtonDisabled: true });
      const listOfCandidates = await this.state.contract.listOfMembersToJoin();
      let tx;
      let candidates = [];
      const address = this.state.signer._address;
      const candidate = {};
      candidate.address = address;
      if (!listOfCandidates) {
        candidate.id = 1;
        candidates.push(candidate);
        const IPFSResponse = await this.prepareForIPFS(candidates);
        tx = await this.state.contract.applyForTeam(IPFSResponse[0].hash);
      } else {
        const candidatesFromIPFS = await ipfs.cat(listOfCandidates);
        const existingCandidates = JSON.parse(candidatesFromIPFS);
        let isExisting = false;
        existingCandidates.find(can => {
          if (can.address === candidate.address) {
            this.setState({
              displayErrorIfCandidateExists: 'Candidate already exists'
            });
            isExisting = true;
          }
        });
        if (!isExisting) {
          candidate.id = existingCandidates.length + 1;
          candidates = [...existingCandidates, candidate];
          const IPFSResponse = await this.prepareForIPFS(candidates);
          tx = await this.state.contract.applyForTeam(IPFSResponse[0].hash);
        }
      }
      this.setState({ showModal: true, txHash: tx.hash });
    } catch (error) {
      console.log(error);
      toast.error('You already have been applied to join', {
        position: toast.POSITION.TOP_RIGHT
      });
    }


  }

  prepareForIPFS = async candidate => {
    const producyInByteArray = Buffer.from(JSON.stringify(candidate));
    return await ipfs.add(producyInByteArray);
  }

  render = () => (
    <React.Fragment>
      <h2 className="text-center">
        Here you can request to join in our team.
      </h2>
      <h4 className="text-danger text-center mt-4 mb-4">{this.state.displayErrorIfCandidateExists ? this.state.displayErrorIfCandidateExists : null}</h4>
      <button disabled={this.state.isButtonDisabled} onClick={this.joinInTheTeam} className="btn btn-primary offset-5 btn-lg">{this.state.isButtonDisabled ? 'Processing...' : 'Join!'}</button>
      <ModalDialog
        showModal={this.state.showModal}
        txHash={this.state.txHash} />
    </React.Fragment>
  );
}
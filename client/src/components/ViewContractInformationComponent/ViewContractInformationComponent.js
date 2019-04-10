import React, { Component } from 'react';
import contractSetup from '../../services/prepareContract';
import { ethers } from 'ethers';

export default class ViewContractInformationComponent extends Component {
  state = {
    contract: null,
    teamMembers: null,
    pendingToJoin: null,
    contractBalance: null,
    totalProducts: null,
    totalSells: null
  }

  componentDidMount = async () => {
    const { _, __, ___, contract } = await contractSetup;
    let contractData = await contract.checkBalanceOfContract();
    contractData = contractData.map(e => ethers.utils.formatEther(e, { commify: true })).map((e, i) => {
      if (i !== 0) {
        return e * 1000000000000000000;
      }
      return e;
    });
    const [contractBalance, totalSells, totalProducts, pendingToJoin, teamMembers] = contractData;

    this.setState({ contractBalance, totalSells, totalProducts, pendingToJoin, teamMembers });
    console.log(this.state);
  }

  render = () => (
    <React.Fragment>
      <div className="text-center">
        <h2>Contract state</h2>
        <h2>Contract balance: {this.state.contractBalance} Ethers</h2>
        <h2>Total sells: {this.state.totalSells}</h2>
        <h2>Total products: {this.state.totalProducts}</h2>
        <h2>Pending to join: {this.state.pendingToJoin}</h2>
        <h2>Total members: {this.state.teamMembers}</h2>
      </div>
    </React.Fragment>
  );
}
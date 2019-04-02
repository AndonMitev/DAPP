import React, { Component } from 'react';
import getWeb3 from '../../utils/solidity/getWeb3';
import IPFSContractABI from '../../utils/solidity/ABI/Ipfs.json';
import contractAddress from '../../utils/solidity/contractAddress';
import ipfs from '../../utils/solidity/ipfs';
import { ethers } from 'ethers';

export default class MyOffersPage extends Component {

  state = {
    contract: null,
    ipfsHash: null,
    title: null,
    imageAsB64: null,
    description: null,
    price: null,
    isReadyToRender: null
  }

  // TODO: Make sure there is a ipfs hash before fetch!
  // TODO: Try to update dynamicly when content updates, extract this logic in subcomponent and listen for
  // componentWillReceiveProps

  componentDidMount = async () => {
    try {
      const web3 = await getWeb3();
      const provider = new ethers.providers.Web3Provider(web3.currentProvider);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, IPFSContractABI, signer);
      const ipfsHash = await contract.getOwnerProducts();

      if (ipfsHash) {
        const byteArray = await ipfs.cat(ipfsHash);
        const parsedObj = JSON.parse(byteArray);
        const imageAsB64 = Buffer.from(parsedObj.imageAsArrayBuffer.data).toString('base64');
        const { title, description, price } = parsedObj;

        this.setState({
          contract,
          ipfsHash,
          imageAsB64,
          title,
          description,
          price,
          isReadyToRender: true
        });
      }

    } catch (error) {
      console.error(error);
      return;
    }
  }

  render = () => (
    <React.Fragment>
      <h2>My offers Page</h2>
      {this.state.isReadyToRender ?
        <div>
          <h2>
            Title: {this.state.title}
          </h2>
          <p>Price: {this.state.price}</p>
          <p>Description: {this.state.description}</p>
          <img src={'data:image/jpeg;base64,' + this.state.imageAsB64} />
        </div> : null}
    </React.Fragment>
  );
}
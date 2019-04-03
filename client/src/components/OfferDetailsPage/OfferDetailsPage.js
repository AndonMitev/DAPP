import React, { Component } from 'react';
import getWeb3 from '../../utils/solidity/getWeb3';
import IPFSContractABI from '../../utils/solidity/ABI/Ipfs.json';
import contractAddress from '../../utils/solidity/contractAddress';
import productServices from '../../services/addProduct';
import { ethers } from 'ethers';

export default class OfferDetailsPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      product: null,
      isLoading: true
    };
  }

  componentDidMount = async () => {
    try {
      const { from, idx } = this.props.match.params;

      const web3 = await getWeb3();

      const provider = new ethers.providers.Web3Provider(web3.currentProvider);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, IPFSContractABI, signer);
      const productDetailHash = await contract.productDetails(from, idx);
      const productInByte = await productServices.getFromIPFS(productDetailHash);
      const product = productServices.parseToObject(productInByte);
      this.setState({ product, isLoading: false });
      console.log(this.state);
    } catch (error) {
      console.error(error)
    }

  }

  render = () => (
    <React.Fragment>
      {this.state.isLoading ? 'Loading...' :
        <h2>Product: {this.state.product.title}</h2>}
    </React.Fragment>
  );
}
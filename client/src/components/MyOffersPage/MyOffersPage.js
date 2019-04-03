import React, { Component } from 'react';
import ipfs from '../../utils/solidity/ipfs';
import CollectionOfProductsComponent from '../shared/CollectionOfProductsComponent';
import contractSetup from '../../services/prepareContract';

export default class MyOffersPage extends Component {

  state = {
    allProducts: [],
    isLoading: null
  }

  componentDidMount = async () => {
    try {
      const { _, __, ___, contract } = await contractSetup;
      const ipfsHash = await contract.getOwnerProducts();
      if (ipfsHash) {
        const byteArray = await ipfs.cat(ipfsHash);
        const allProducts = JSON.parse(byteArray);
        this.setState({ allProducts, isLoading: true });
      }

    } catch (error) {
      console.error(error);
      return;
    }
  }

  render = () => (
    <React.Fragment>
      {this.state.isLoading ? <CollectionOfProductsComponent allProducts={this.state.allProducts} /> : 'Loading'}
    </React.Fragment>
  );
}
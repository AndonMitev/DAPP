import React, { Component } from 'react';
import FormComponent from './FormComponent';
import ModalDialog from '../shared/ModalDialog';
import productServices from '../../services/addProduct';
import contractSetup from '../../services/prepareContract';

export default class PostOfferPage extends Component {
  state = {
    contract: null,
    web3: null,
    txHash: null,
    showModal: false,
    imageAsArrayBuffer: null,
    signer: null,
  }

  componentDidMount = async () => {
    try {
      const { web3, _, signer, contract } = await contractSetup;
      this.setState({ contract, web3, signer });
    } catch (error) {
      console.log(error);
    }
  }

  setNewOffer = async productToSave => {
    try {
      productToSave.from = this.state.signer.provider._web3Provider.selectedAddress;
      const [userProductsHash, allProdcutsHash] = await this.state.contract.getAllProductsAndOwnerProducts();
      let tx;
      if (!allProdcutsHash) {
        const [userProductIPFSHash, allProductIPFSHash] = await productServices.initialSet(productToSave);
        tx = await this.state.contract.setHash(userProductIPFSHash, allProductIPFSHash);
      } else {
        if (!userProductsHash) {
          const singleProductIPFSHash = await productServices.initUserProducts(productToSave);
          const allProductIPFSHash = await productServices.collectionOfProducts(allProdcutsHash, productToSave);
          tx = await this.state.contract.setHash(singleProductIPFSHash, allProductIPFSHash);

        } else {
          const singleProductNewIpfsHash = await productServices.collectionOfProducts(userProductsHash, productToSave);
          const allProductsNewIpfsHash = await productServices.collectionOfProducts(allProdcutsHash, productToSave);
          tx = await this.state.contract.setHash(singleProductNewIpfsHash, allProductsNewIpfsHash);
        }
      }
      this.setState({ txHash: tx.hash, showModal: true });
    } catch (error) {
      console.error(error);
    }
  }

  render() {
    return (
      <React.Fragment>
        <FormComponent setNewOffer={this.setNewOffer} />
        <ModalDialog
          showModal={this.state.showModal}
          txHash={this.state.txHash}
        />
      </React.Fragment>
    );
  }
}
import React, { Component } from 'react';
import FormComponent from './FormComponent';
import ModalDialog from '../shared/ModalDialog';
import ipfs from '../../utils/solidity/ipfs';
import contractSetup from '../../services/prepareContract';
import { toast } from "react-toastify";

export default class CreateOfferComponent extends Component {
  state = {
    contract: null,
    web3: null,
    txHash: null,
    showModal: false,
    imageAsArrayBuffer: null,
    signer: null,
    allProductsHash: null,
    userProductsHash: null,
  }

  componentDidMount = async () => {
    try {

      const { web3, _, signer, contract } = await contractSetup;

      const allProductsHash = await contract.allProducts();

      const userProductsHash = await contract.getProductsForMember(signer._address);
      console.log(signer);
      this.setState({ contract, web3, signer, allProductsHash, userProductsHash });
    } catch (error) {
      toast.error(error.message, {
        position: toast.POSITION.TOP_RIGHT
      });
    }
  }

  setNewOffer = async productToSave => {
    toast.success(`Article: ${productToSave.title} will be processed soon...`, {
      position: toast.POSITION.TOP_RIGHT
    });
    productToSave.from = this.state.signer._address;
    try {
      const allProductsHash = await this.state.contract.allProducts();
      const userProductsHash = await this.state.contract.getProductsForMember(productToSave.from);
      let items = [];
      let userProducts = [];

      let tx;
      const { price, quantity } = productToSave;
      if (!allProductsHash) {
        productToSave.id = 1;
        productToSave = { ...productToSave, createdAt: Date.now() };
        items.push(productToSave);
        console.log('here');
        const allProductsIPFSResponse = await this.prepareForIPFS(items);
        console.log(allProductsIPFSResponse[0].hash.length);
        productToSave = { ...productToSave, createdAt: Date.now() };
        const userFirstProduct = [productToSave];
        const userFirstProductIPFSResponse = await this.prepareForIPFS(userFirstProduct);
        console.log(userFirstProductIPFSResponse[0].hash.length);
        const singleProductIPFSResponse = await this.prepareForIPFS(productToSave);
        console.log(singleProductIPFSResponse[0].hash.length);
        const [hashForAllProductsSolidity, hashForSingleProductSolidity, hashForUserProductSolidity] =
          [allProductsIPFSResponse[0].hash, singleProductIPFSResponse[0].hash, userFirstProductIPFSResponse[0].hash];
          console.log(productToSave);
        tx = await this.state.contract.addProduct(productToSave.from, hashForAllProductsSolidity, price, quantity, hashForSingleProductSolidity, hashForUserProductSolidity);
      } else {
        console.log('here');
        const productsFromIPFS = await ipfs.cat(allProductsHash);
        console.log('here1');
        const products = JSON.parse(productsFromIPFS);
        productToSave.id = products.length + 1;
        productToSave = { ...productToSave, createdAt: Date.now() }
        if (!userProductsHash) {
          userProducts.push(productToSave);
        } else {
          const userProductsByteArray = await ipfs.cat(userProductsHash);
          const uProducts = JSON.parse(userProductsByteArray);
          userProducts = [...uProducts, productToSave];
        }
        items = [...products, productToSave];
        const allProductsIPFSResponse = await this.prepareForIPFS(items);
        console.log('a')
        const singleProductIPFSResponse = await this.prepareForIPFS(productToSave);
        console.log('b')
        const userProductsIPFSResponse = await this.prepareForIPFS(userProducts);
        console.log('here2');
        const [hashForAllProductsSolidity, hashForSingleProductSolidity, hashForUserProductsSolidity] =
          [allProductsIPFSResponse[0].hash, singleProductIPFSResponse[0].hash, userProductsIPFSResponse[0].hash];
        tx = await this.state.contract.addProduct(productToSave.from, hashForAllProductsSolidity, price, quantity, hashForSingleProductSolidity, hashForUserProductsSolidity);
      }
      this.setState({ showModal: true, txHash: tx.hash });
    } catch (error) {
      console.log(error);
      toast.error(error.message, {
        position: toast.POSITION.TOP_RIGHT
      });
    }

  }

  prepareForIPFS = async product => {
    const producyInByteArray = Buffer.from(JSON.stringify(product));
    return await ipfs.add(producyInByteArray);
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
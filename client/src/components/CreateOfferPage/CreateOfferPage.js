import React, { Component } from 'react';
import getWeb3 from '../../utils/solidity/getWeb3';
import IPFSContractABI from '../../utils/solidity/ABI/Ipfs.json';
import contractAddress from '../../utils/solidity/contractAddress';
import ModalDialog from '../shared/ModalDialog';
import ipfs from '../../utils/solidity/ipfs';
import ImageUploader from 'react-images-upload';
import { ethers } from 'ethers';
import productServices from '../../services/addProduct';



export default class PostOfferPage extends Component {
  state = {
    contract: null,
    web3: null,
    txHash: null,
    showModal: false,
    title: null,
    price: null,
    description: null,
    pictures: [],
    imageAsArrayBuffer: null,
    signer: null,
    from: null,
  }

  componentDidMount = async () => {
    try {
      const web3 = await getWeb3();
      const provider = new ethers.providers.Web3Provider(web3.currentProvider);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, IPFSContractABI, signer);

      this.setState({ contract, web3, signer });
    } catch (error) {
      console.log(error);
    }
  }

  handleOnChange = async event => {
    event.preventDefault();
    const propName = event.target.name;
    this.setState({
      [propName]: event.target.value
    });
  }

  handleOnUpload = newPictures => {
    if (newPictures && newPictures.length) {
      const reader = new window.FileReader();
      reader.readAsArrayBuffer(...newPictures);
      reader.onloadend = () => {
        this.setState({ imageAsArrayBuffer: Buffer(reader.result) });
      }
    }
  }

  handleOnSubmit = async event => {
    event.preventDefault();
    
    try {
      const from = this.state.signer.provider._web3Provider.selectedAddress;
      const { title, price, description, imageAsArrayBuffer } = this.state;
      const allProdcutsHash = await this.state.contract.getAllProducts();
      const modelToSave = { title, price, description, imageAsArrayBuffer, from };
      let tx;

      if (!allProdcutsHash) {
        const [singleProductIPFSHash, allProductIPFSHash] = await productServices
          .initialSet(modelToSave);
        tx = await this.state.contract.setHash(singleProductIPFSHash, allProductIPFSHash);
      } else {
        const singleProductHashFromSolidity = await this.state.contract.getOwnerProducts();

        if (!singleProductHashFromSolidity) {
          const singleProductIPFSHash = await productServices.initUserProducts(modelToSave);
          const allProductIPFSHash = await productServices.collectionOfProducts(allProdcutsHash, modelToSave);
          tx = await this.state.contract.setHash(singleProductIPFSHash, allProductIPFSHash);

        } else {
          const singleProductNewIpfsHash = await productServices.collectionOfProducts(singleProductHashFromSolidity, modelToSave);
          const allProductsNewIpfsHash = await productServices.collectionOfProducts(allProdcutsHash, modelToSave);
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
      <React.Fragment >
        <h2 className="text-center my-4">Set your awesome product</h2>
        <form onSubmit={this.handleOnSubmit} className="form">
          <div className="form-group">
            <label id="title">Product name*</label>
            <input onChange={this.handleOnChange} type="text" name="title" className="form-control" placeholder="Your product name..." />
          </div>
          <div className="form-group">
            <label>Price in wei*</label>
            <input onChange={this.handleOnChange} type="number" name="price" className="form-control" placeholder="Set price in wei" />
          </div>
          <div>
            <label>Description</label>
            <textarea onChange={this.handleOnChange} type="text" name="description" className="form-control" placeholder="Tell to people more details about your product..."></textarea>

          </div>
          <ImageUploader
            label="Image"
            buttonStyles={{ backgroundColor: '#007bff' }}
            withIcon={true}
            withPreview={true}
            buttonText='Choose images'
            onChange={this.handleOnUpload}
            imgExtension={['.jpg', '.gif', '.png', '.gif', '.jpeg']}
            maxFileSize={5242880}
          />
          <input type="submit" className="btn btn-primary offset-4 col-4 mt-3" value="Create" />
        </form>
        <ModalDialog
          showModal={this.state.showModal}
          txHash={this.state.txHash}
        />
      </React.Fragment>
    );
  }

}
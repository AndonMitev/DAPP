import React, { Component } from 'react';
import ipfs from '../../utils/solidity/ipfs';
import contractSetup from '../../services/prepareContract';
import ModalDialog from '../shared/ModalDialog';
import { ClipLoader } from 'react-spinners';
import { toast } from "react-toastify";

export default class EditOfferComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      contract: null,
      ipfs: null,
      getSingleProductToEdit: null,
      getAllMembersProductsToEdit: null,
      getAllProductToEdit: null,
      isLoading: true,
      isButtonDisabled: false,
      showModal: false,
      txHash: null
    };
  }

  componentDidMount = async () => {
    const { from, idx } = this.props.match.params;
    const { _, __, ___, contract } = await contractSetup;
    const singleProductToEditHash = await contract.getDetailsOfProduct(from, idx);
    const allMemberProductsHash = await contract.getProductsForMember(from);
    const allProductsHash = await contract.allProducts();
    const getSingleProductToEdit = JSON.parse(await ipfs.cat(singleProductToEditHash));
    const getAllMembersProductsToEdit = JSON.parse(await ipfs.cat(allMemberProductsHash));
    const getAllProductToEdit = JSON.parse(await ipfs.cat(allProductsHash));
    this.setState({ ...getSingleProductToEdit, getAllMembersProductsToEdit, getAllProductToEdit, isLoading: false, contract });
  }

  handleOnChange = event => {
    event.preventDefault();
    const propName = event.target.name;
    const propValue = event.target.value;
    this.setState({
      [propName]: propValue
    });

  }

  handleOnSubmit = async event => {
    event.preventDefault();
    toast.success(`Article: ${this.state.title} will be processed soon...`, {
      position: toast.POSITION.TOP_RIGHT
    });
    this.setState({ isButtonDisabled: true });
    try {
      const { title, description, price, quantity, from, createdAt, id, to, imageAsArrayBuffer } = this.state;
      const objectToSave = { title, description, price, quantity, from, createdAt, id, to, imageAsArrayBuffer };


      this.setState(state => {
        state.getAllMembersProductsToEdit = this.state.getAllMembersProductsToEdit.filter(e => e.id !== id);
        state.getAllProductToEdit = this.state.getAllProductToEdit.filter(e => e.id !== id);
        state.getAllMembersProductsToEdit.push({ ...objectToSave, createdAt: Date.now() });
      });
      console.log(this.state);
      const singleProductIPFSResponse = await this.prepareForIPFS(objectToSave);
      const memberProductsIPFSResponse = await this.prepareForIPFS(this.state.getAllMembersProductsToEdit);
      this.setState(state => {
        state.getAllProductToEdit.push({ ...objectToSave, createdAt: Date.now() });
      });
      const allProductsIPFSResponse = await this.prepareForIPFS(this.state.getAllProductToEdit);
      const [singleProductHash, memberProductsHash, allProductsHash] =
        [singleProductIPFSResponse[0].hash, memberProductsIPFSResponse[0].hash, allProductsIPFSResponse[0].hash];
        console.log(id,
          allProductsHash,
          price,
          quantity,
          singleProductHash,
          memberProductsHash)
      const tx = await this.state.contract.setEditedProduct(
        id,
        allProductsHash,
        price,
        quantity,
        singleProductHash,
        memberProductsHash
      );
      this.setState({ showModal: true, txHash: tx.hash });
    } catch (error) {
      toast.error(error.message, {
        position: toast.POSITION.TOP_RIGHT
      });
    }
  }

  prepareForIPFS = async product => {
    const producyInByteArray = Buffer.from(JSON.stringify(product));
    return await ipfs.add(producyInByteArray);
  }

  render = () => (
    <React.Fragment>
      <h2 className="text-center">Edit Offer</h2>
      {this.state.isLoading ?
        <div className="text-center mt-5">
          <ClipLoader
            sizeUnit={"px"}
            size={150}
            color={'red'}
            loading={this.state.isLoading}
          />
          <h2>Loading...</h2>
        </div> :
        <form onSubmit={this.handleOnSubmit} className="form">
          <div className="form-group">
            <label id="title">Product name*</label>
            <input onChange={this.handleOnChange} value={this.state.title} type="text" name="title" className="form-control" placeholder="Your product name..." />
          </div>
          <div className="form-group">
            <label>Price in Ethers*</label>
            <input onChange={this.handleOnChange} value={this.state.price} type="number" name="price" className="form-control" placeholder="Set price in Ethers" />
          </div>
          <div className="form-group">
            <label>Quantity*</label>
            <input onChange={this.handleOnChange} value={this.state.quantity} type="number" name="quantity" className="form-control" placeholder="Quantity" />
          </div>

          <div>
            <label>Description</label>
            <textarea onChange={this.handleOnChange} value={this.state.description} type="text" name="description" className="form-control" placeholder="Tell to people more details about your product..."></textarea>

          </div>

          <input disabled={this.state.isButtonDisabled} type="submit" className="btn btn-primary offset-4 col-4 mt-3" value={this.state.isButtonDisabled ? 'Processing...' : 'Edit product'} />
        </form>
      }
      <ModalDialog
        showModal={this.state.showModal}
        txHash={this.state.txHash}
      />
    </React.Fragment>
  )
}
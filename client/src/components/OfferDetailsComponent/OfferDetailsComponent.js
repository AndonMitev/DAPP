import React, { Component } from 'react';
import productServices from '../../services/addProduct';
import contractSetup from '../../services/prepareContract';
import { Link } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import { ethers } from 'ethers';
import { toast } from "react-toastify";
import ipfs from '../../utils/solidity/ipfs';
import ModalDialog from '../shared/ModalDialog';

export default class OfferDetailsComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      product: null,
      isLoading: true,
      idx: null,
      signer: null,
      quantityToBuy: null,
      contract: null,
      web3: null,
      allProducts: null,
      memberProducts: null,
      showModal: false,
      txHash: null,
      hasNoProducts: false
    };
  }

  componentDidMount = async () => {
    try {
      const { from, idx } = this.props.match.params;
      console.log(from, idx);
      const { web3, __, signer, contract } = await contractSetup;
      const allProductsHash = await contract.allProducts();
      const memberProductsHash = await contract.getProductsForMember(from);
      const productDetailHash = await contract.getDetailsOfProduct(from, idx);
      const product = JSON.parse(await ipfs.cat(productDetailHash));
      const memberProducts = JSON.parse(await ipfs.cat(memberProductsHash));

      const allProducts = JSON.parse(await ipfs.cat(allProductsHash));

      this.setState({ product, isLoading: false, idx, signer, contract, web3, allProducts, memberProducts });
    } catch (error) {
      console.error(error)
    }
  }

  handleOnChange = event => {
    event.preventDefault();
    const propName = event.target.name;
    this.setState({
      [propName]: event.target.value
    });
  }

  setAction = async () => {
    try {
      let itemFromAllProducts = this.state.allProducts.find(product => product.id === +this.state.idx);
      let itemFromMembersProducts = this.state.memberProducts.find(product => product.id === +this.state.idx);

      itemFromAllProducts.quantity -= this.state.quantityToBuy;
      console.log(itemFromAllProducts, itemFromMembersProducts);
      itemFromMembersProducts.quantity -= this.state.quantityToBuy;
      this.state.product.quantity -= this.state.quantityToBuy;

      const memberProductsIPFSResponse = await this.prepareForIPFS(this.state.memberProducts);
      const allProductsIPFSResponse = await this.prepareForIPFS(this.state.allProducts);
      const singleProductIPFSResponse = await this.prepareForIPFS(this.state.product);

      const [allProductsHash, singleProductHash, memberProductsHash] =
        [allProductsIPFSResponse[0].hash, singleProductIPFSResponse[0].hash, memberProductsIPFSResponse[0].hash];

      let tx = await this.state.contract.buyProduct(
        this.state.product.from,
        this.state.idx,
        this.state.product.quantity,
        singleProductHash,
        allProductsHash,
        memberProductsHash, { value: ethers.utils.parseEther('1') });
      toast.success(`Processing your request...`, {
        position: toast.POSITION.TOP_RIGHT
      });
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

  render = () => (
    <React.Fragment>
      {this.state.isLoading ?
        <div className="text-center mt-5">
          <ClipLoader
            sizeUnit={"px"}
            size={150}
            color={'red'}
            loading={this.state.isLoading}
          />
          <h2>Loading...</h2>
        </div>
        :
        <div className="row">
          <div className="col-md-12 mt-4">
            <div>
              {this.state.hasNoProducts ? <h2 className="text-center">You don't have any products yet!</h2> :
                <div className="card-body">
                  <h5 className="text-center"><strong>Title:</strong> {this.state.product.title}</h5>
                  <div className="col-md-6 offset-3 text-center" style={{ height: "150px" }}>
                    <img className="card-img-top img-thumbnail m-auto" style={{ height: "170px", maxWidth: "100%", backgroundSize: "cover" }} src={'data:image/jpeg;base64,' + Buffer.from(this.state.product.imageAsArrayBuffer.data).toString('base64')} />
                  </div>
                  <p className="card-text mt-5"><strong>Description:</strong>  {this.state.product.description}</p>
                  <p><strong>From:</strong>  {this.state.product.from}</p>
                  <p><strong>Quantity:</strong>  {this.state.product.quantity}</p>
                  <p className="card-text"><strong>Price:</strong>  {this.state.product.price} Ethers</p>
                  <span className="row justify-content-around">
                    <button onClick={this.setAction} data-id={this.state.product.id} className="btn btn-primary w-25 mt-2">Buy</button>
                    {this.state.signer._address === this.state.product.from ? <Link className="btn btn-success w-25 mt-2" to={`/offer/edit/${this.state.product.from}/${this.state.product.id}`}>Edit</Link> : null}
                  </span>
                  <input onChange={this.handleOnChange} type="number" name="quantityToBuy" className="form-control mt-3" placeholder="Enter quantity to purchase" />
                  {this.state.quantityToBuy ? <p>Your price will be: {this.state.product.price * this.state.quantityToBuy} ether's</p> : null}
                </div>}
            </div>

          </div>

        </div>}
      <ModalDialog
        showModal={this.state.showModal}
        txHash={this.state.txHash}
      />
    </React.Fragment>
  );
}
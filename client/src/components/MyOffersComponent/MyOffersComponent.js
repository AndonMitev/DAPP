import React, { Component } from 'react';
import ipfs from '../../utils/solidity/ipfs';
import { Link } from 'react-router-dom';
import contractSetup from '../../services/prepareContract';
import { ClipLoader } from 'react-spinners';
import { toast } from "react-toastify";
import { ethers } from 'ethers';
import ModalDialog from '../shared/ModalDialog';

export default class MyOffersComponent extends Component {

  state = {
    allProducts: [],
    isLoading: true,
    signer: null,
    contract: null,
    balance: 0,
    hasNoOffers: false,
    hasZeroBalance: false,
    amount: null,
    showModal: false,
    txHash: null
  }

  componentDidMount = async () => {
    try {
      const { _, __, signer, contract } = await contractSetup;
      const ipfsHash = await contract.getProductsForMember(signer._address);
      if (!ipfsHash) {
        this.setState({ hasNoOffers: true, isLoading: false, contract });
        return;
      }
      const byteArray = await ipfs.cat(ipfsHash);
      const allProducts = JSON.parse(byteArray);

      this.setState({ allProducts, isLoading: false, signer, contract });
    } catch (error) {
      toast.error(error.message, {
        position: toast.POSITION.TOP_RIGHT
      });
    }
  }

  checkBalance = async () => {
    try {
      let balance = await this.state.contract.myBalance();
      balance = ethers.utils.formatEther(balance);
      if (!balance) {
        this.setState({ hasZeroBalance: true });
        return;
      }
      this.setState({ balance });
    } catch (error) {
      toast.error(error.message, {
        position: toast.POSITION.TOP_RIGHT
      });
    }
  }

  handleOnChange = event => {
    event.preventDefault();
    const propName = event.target.name;
    this.setState({
      [propName]: event.target.value
    })
  }

  handleOnSubmit = async event => {
    event.preventDefault();
    try {
      const tx = await this.state.contract.withdraw(ethers.utils.parseEther(this.state.amount));
      toast.success(`Successfully withdraw ${this.state.amount} ether's`, {
        position: toast.POSITION.TOP_RIGHT
      });
      this.setState({ showModal: true, txHash: tx.hash });
    } catch (error) {
      toast.error(error.message, {
        position: toast.POSITION.TOP_RIGHT
      });
    }
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

          <div className="col-md-12">
            <div className="row justify-content-end">
              <button className="btn btn-primary mt-5 mr-2" onClick={this.checkBalance}>Check balance</button>
              {this.state.balance ? <p className="mt-5">Current balance: {this.state.balance} ethers</p> : null}
              {this.state.hasZeroBalance ? <p className="mt-5">Current balance: 0 ethers</p> : null}
            </div>
          </div>

          <div className="col-md-12">
            <form className="form-group mt-5 col-md-4 offset-8" onSubmit={this.handleOnSubmit}>
              <input onChange={this.handleOnChange} className="form-control" name="amount" placeholder="Amount" />
              <input type="submit" className="btn btn-primary float-right mt-3" value="Withdraw" />
            </form>
          </div>


          {this.state.hasNoOffers ? <h2 className="m-auto">You dont have any offers yet </h2> : null}
          {this.state.allProducts.map((product, idx) => {
            return (
              <div key={product.id} className="col-md-4 mt-5">
                <div className="card">
                  <div style={{ height: "150px" }}>
                    <img className="card-img-top" style={{ height: "170px", maxWidth: "100%", backgroundSize: "cover" }} src={'data:image/jpeg;base64,' + Buffer.from(product.imageAsArrayBuffer.data).toString('base64')} />
                  </div>
                  <div className="card-body">
                    <h5 className="card-title text-center">{product.title}</h5>
                    <p className="card-text text-center">{product.description}</p>

                    <div className="row">
                      <Link className="text-primary col-md-6" style={{ textDecoration: "none" }} to={`/offer/details/${product.from}/${product.id}`}>View details</Link>
                      <p className="card-text col-md-6 text-right">Price: {product.price} Ethers</p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
          <ModalDialog
            showModal={this.state.showModal}
            txHash={this.state.txHash}
          />
        </div>}
    </React.Fragment>
  );
}
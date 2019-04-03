import React, { Component } from 'react';
import getWeb3 from '../../utils/solidity/getWeb3';
import IPFSContractABI from '../../utils/solidity/ABI/Ipfs.json';
import contractAddress from '../../utils/solidity/contractAddress';
import ipfs from '../../utils/solidity/ipfs';
import { ethers } from 'ethers';
import { Link } from 'react-router-dom';


export default class HomePage extends Component {
    state = {
        allProducts: [],
        readyToRender: false
    }

    componentDidMount = async () => {
        try {
            const web3 = await getWeb3();

            const provider = new ethers.providers.Web3Provider(web3.currentProvider);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(contractAddress, IPFSContractABI, signer);
            const allProductsHash = await contract.getAllProducts();

            if (!allProductsHash) {
                console.log(this.state);
            } else {
                const byteArray = await ipfs.cat(allProductsHash);
                const allProducts = JSON.parse(byteArray);
                this.setState({ allProducts, readyToRender: true });
                console.log(this.state);
            }

        } catch (error) {
            console.log(error);
        }
    }

    viewDetails = (productIdx, from) => {
        console.log(productIdx, from);
    }


    render = () => {
        if (!this.state.allProducts.length) {
            return (
                <h2>No products available at this time.</h2>
            );
        }
        return (
            <React.Fragment>
                <div className="row">
                    {this.state.allProducts.map((product, idx) => {
                        return (
                            <div key={idx} className="col-md-4 mt-5">
                                <div className="card">
                                    <img className="card-img-top" src={'data:image/jpeg;base64,' + Buffer.from(product.imageAsArrayBuffer.data).toString('base64')} />

                                    <div className="card-body">
                                        <h5 className="card-title">{product.title}</h5>
                                        <p className="card-text">{product.description}</p>
                                        <Link to={`/offer/details/${product.from}/${idx}`}>View details</Link>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </React.Fragment>
        );
    };
}

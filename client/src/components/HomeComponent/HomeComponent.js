import React, { Component } from 'react';
import ipfs from '../../utils/solidity/ipfs';
import contractSetup from '../../services/prepareContract';
import { Link } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import { toast } from "react-toastify";

export default class HomeComponent extends Component {
    state = {
        allProducts: [],
        isLoading: true
    }

    componentDidMount = async () => {
        try {
            const { _, __, ___, contract } = await contractSetup;
            const allProductsHash = await contract.allProducts();

            if (!allProductsHash) {
                // No products at all
                //       console.log(this.state);
            } else {
                const byteArray = await ipfs.cat(allProductsHash);
                const allProducts = JSON.parse(byteArray);
                this.setState({ allProducts, isLoading: false });
                //      console.log(this.state);
            }
        } catch (error) {
            toast.error(error.message, {
                position: toast.POSITION.TOP_RIGHT
              });
        }
    }

    setAction = async e => {
        const productId = +e.target.dataset.id;
        const itemToShow = this.state.allProducts
            .find(product => productId === product.id);
        console.log(itemToShow);
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
                    {this.state.allProducts.map((product, idx) => {
                        return (
                            <div key={product.id} className="col-md-4 mt-5">
                                <div className="card">
                                    <div style={{ height: "150px" }}>
                                        <img className="card-img-top img-thumbnail" style={{ height: "170px", maxWidth: "100%", backgroundSize: "cover" }} src={'data:image/jpeg;base64,' + Buffer.from(product.imageAsArrayBuffer.data).toString('base64')} />
                                    </div>
                                    <div className="card-body">
                                        <h5 className="card-title text-center">{product.title}</h5>
                                        <p className="card-text text-center">{product.description}</p>
                                        <p className="card-text"><strong>Price:</strong> {product.price} Ethers's</p>

                                        <p><strong>Quantity:</strong> {product.quantity}</p>
                                        <p><strong>From:</strong> {product.from}</p>

                                    </div>
                                    <div className="card-footer text-center">
                                        <Link className="text-primary" style={{ textDecoration: "none" }} to={`/offer/details/${product.from}/${product.id}`}>View details</Link>
                                    </div>

                                </div>
                            </div>
                        )
                    })}
                </div>}
        </React.Fragment>
    );
}

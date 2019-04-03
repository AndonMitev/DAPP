import React, { Component } from 'react';
import ipfs from '../../utils/solidity/ipfs';
import contractSetup from '../../services/prepareContract';
import CollectionOfProductsComponent from '../shared/CollectionOfProductsComponent';


export default class HomePage extends Component {
    state = {
        allProducts: [],
        isLoading: false
    }

    componentDidMount = async () => {
        try {
            const { _, __, ___, contract } = await contractSetup;
            const allProductsHash = await contract.getAllProducts();

            if (!allProductsHash) {
                // No products at all
                console.log(this.state);
            } else {
                const byteArray = await ipfs.cat(allProductsHash);
                const allProducts = JSON.parse(byteArray);
                this.setState({ allProducts, isLoading: true });
                console.log(this.state);
            }
        } catch (error) {
            console.log(error);
        }
    }


    render = () => (
        <React.Fragment>
            {this.state.isLoading ? <CollectionOfProductsComponent allProducts={this.state.allProducts} /> : 'Loading'}
        </React.Fragment>
    );
}

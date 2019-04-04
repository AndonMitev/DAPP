import React, { Component } from 'react';
import productServices from '../../services/addProduct';
import contractSetup from '../../services/prepareContract';
import CollectionOfProductsComponent from '../shared/CollectionOfProductsComponent';

export default class OfferDetailsComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      product: null,
      isLoading: true,
      idx: null
    };
  }

  componentDidMount = async () => {
    try {
      const { from, idx } = this.props.match.params;
      const { _, __, ___, contract } = await contractSetup;
      const productDetailHash = await contract.productDetails(from, idx);
      const productInByte = await productServices.getFromIPFS(productDetailHash);
      const allProducts = productServices.parseToObject(productInByte)[idx];
      this.setState({ allProducts, isLoading: false, idx });
    } catch (error) {
      console.error(error)
    }
  }

  render = () => (
    <React.Fragment>
      {this.state.isLoading ? 'Loading' : <CollectionOfProductsComponent allProducts={this.state.allProducts} idx={this.state.idx} />}
    </React.Fragment>
  );
}
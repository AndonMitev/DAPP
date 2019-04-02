import React, { Component } from 'react';
import getWeb3 from '../../utils/solidity/getWeb3';
import IPFSContractABI from '../../utils/solidity/ABI/Ipfs.json';
import contractAddress from '../../utils/solidity/contractAddress';
import ipfs from '../../utils/solidity/ipfs';
import { ethers } from 'ethers';


export default class HomePage extends Component {
    state = {
        allProducts: []
    }

    componentDidMount = async () => {
        try {
            const web3 = await getWeb3();
            const provider = new ethers.providers.Web3Provider(web3.currentProvider);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(contractAddress, IPFSContractABI, signer);
            const allProductsHash = await contract.getAllProducts();
            console.log(allProductsHash);
            if (!allProductsHash) {
                console.log(this.state);
            } else {
                const byteArray = await ipfs.cat(allProductsHash);
                const parsedObj = JSON.parse(byteArray);
                console.log(parsedObj);
                this.setState({ allProductsHash })
            }

        } catch (error) {
            console.log(error);
        }
    }


    render = () => (
        <React.Fragment>
            <h2>Home Page</h2>
        </React.Fragment>
    );
}
